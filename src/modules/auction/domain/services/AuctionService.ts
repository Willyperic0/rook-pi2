import { Auction } from "../../domain/models/Auction";
import { AuctionRepository } from "../../domain/repositories/AuctionRepository";
import { ItemRepository } from "../../../inventory/domain/repositories/ItemRepository";
import { CreateAuctionInputDTO, CreateAuctionOutputDto } from "../../application/dto/CreateAuctionDTO";
import { AuctionMapper } from "../../application/mappers/AuctionMapper";
import { Bid } from "../../domain/models/Bid";
import { HttpUserRepository } from "../../../user/domain/repositories/HttpUserRepository";

// Sockets
import { emitBidUpdate, emitBuyNow, emitNewAuction } from "../../infraestructure/sockets/auctionSocket";

export class AuctionService {
  constructor(
    private readonly auctions: AuctionRepository,
    private readonly items: ItemRepository,
    private readonly users: HttpUserRepository,
  ) {}

  // Crear subasta usando token
  async createAuction(input: CreateAuctionInputDTO, token: string): Promise<CreateAuctionOutputDto> {
    console.log("[AUCTION SERVICE] createAuction called with input:", input, "token:", token);

    const user = await this.users.findByToken(token);
    console.log("[AUCTION SERVICE] User fetched from token:", user);
    if (!user) throw new Error("Usuario no encontrado");

    const item = await this.items.findById(input.itemId);
    console.log("[AUCTION SERVICE] Item fetched by ID:", item);
    if (!item) throw new Error("Item not found");
    if (item.userId !== Number(user.id)) throw new Error("El item no pertenece al usuario");

    const creditCost = input.durationHours === 48 ? 3 : 1;
    console.log(`[AUCTION SERVICE] User credits: ${user.credits}, creditCost: ${creditCost}`);
    if (user.credits < creditCost) throw new Error("Créditos insuficientes");

    await this.users.updateCredits(user.id, user.credits - creditCost);
    console.log("[AUCTION SERVICE] User credits updated");

    try {
  // Por algo como:
item.isAvailable = false;
await this.items.updateAvailability(item.id, false);
console.log("[AUCTION SERVICE] Item availability set to false");
} catch (err) {
  console.error("[AUCTION SERVICE] Failed to update item availability:", err);
  throw err;
}


    const auction = new Auction(
      Date.now(),
      item.name,
      item.description,
      input.startingPrice,
      input.startingPrice,
      item,
      input.buyNowPrice,
      "OPEN",
      new Date(),
      [],
      undefined,
    );

    try {
  await this.auctions.save(auction);
  console.log("[AUCTION SERVICE] Auction saved:", auction);

  emitNewAuction(AuctionMapper.toDto(auction, input.durationHours));
  console.log("[AUCTION SERVICE] New auction emitted via socket");
} catch (err) {
  console.error("[AUCTION SERVICE] Error saving or emitting auction:", err);
}


    return { auction: AuctionMapper.toDto(auction, input.durationHours) };
  }

  // Pujar usando token
  async placeBid(auctionId: number, token: string, amount: number): Promise<boolean> {
    console.log("[AUCTION SERVICE] placeBid called with auctionId:", auctionId, "token:", token, "amount:", amount);

    const auction = await this.auctions.findById(auctionId);
    console.log("[AUCTION SERVICE] Auction fetched:", auction);
    if (!auction) throw new Error("Auction not found");

    const user = await this.users.findByToken(token);
    console.log("[AUCTION SERVICE] User fetched from token:", user);
    if (!user) throw new Error("Usuario no encontrado");
    if (user.credits < amount) throw new Error("Créditos insuficientes");

    const bid: Bid = {
      auctionId: auction.id,
      id: Date.now(),
      userId: Number(user.id),
      amount,
      createdAt: new Date(),
    };

    const success = auction.placeBid(bid);
    console.log("[AUCTION SERVICE] Bid placed:", success);

    if (success) {
      await this.users.updateCredits(user.id, user.credits - amount);
      console.log("[AUCTION SERVICE] User credits updated after bid");

      await this.auctions.save(auction);
      console.log("[AUCTION SERVICE] Auction saved after bid");

      emitBidUpdate(auction.id, {
        id: auction.id,
        currentPrice: amount,
        highestBid: { userId: Number(user.id), amount },
        bidsCount: auction.bids.length,
      });
      console.log("[AUCTION SERVICE] Bid update emitted via socket");
    }

    return success;
  }

  // Compra rápida usando token
  async buyNow(auctionId: number, token: string): Promise<boolean> {
    console.log("[AUCTION SERVICE] buyNow called with auctionId:", auctionId, "token:", token);

    const auction = await this.auctions.findById(auctionId);
    console.log("[AUCTION SERVICE] Auction fetched:", auction);
    if (!auction) throw new Error("Auction not found");
    if (auction.buyNowPrice === undefined) throw new Error("No tiene compra rápida");

    const user = await this.users.findByToken(token);
    console.log("[AUCTION SERVICE] User fetched from token:", user);
    if (!user) throw new Error("Usuario no encontrado");
    if (user.credits < auction.buyNowPrice) throw new Error("Créditos insuficientes");

    const success = auction.buyNow(Number(user.id));
    console.log("[AUCTION SERVICE] BuyNow success:", success);

    if (success) {
      await this.users.updateCredits(user.id, user.credits - auction.buyNowPrice);
      console.log("[AUCTION SERVICE] User credits updated after buyNow");

      await this.auctions.save(auction);
      console.log("[AUCTION SERVICE] Auction saved after buyNow");

      emitBuyNow(auction.id, {
        id: auction.id,
        status: "CLOSED",
        highestBid: auction.bids.length > 0 ? auction.bids.reduce((max, b) => (b.amount > max.amount ? b : max)) : undefined,
        buyNowPrice: auction.buyNowPrice,
      });
      console.log("[AUCTION SERVICE] BuyNow emitted via socket");
    }

    return success;
  }

  async getAuctionById(id: number) {
    console.log("[AUCTION SERVICE] getAuctionById called with id:", id);
    return this.auctions.findById(id);
  }

  async listOpenAuctions() {
    console.log("[AUCTION SERVICE] listOpenAuctions called");
    return this.auctions.findByStatus("OPEN");
  }

  async getCurrentUser(token: string) {
    console.log("[AUCTION SERVICE] getCurrentUser called with token:", token);
    const user = await this.users.findByToken(token);
    console.log("[AUCTION SERVICE] User fetched:", user);
    if (!user) throw new Error("Usuario no encontrado");
    return user;
  }
}


