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

  // Crear subasta
  async createAuction(input: CreateAuctionInputDTO): Promise<CreateAuctionOutputDto> {
    const item = await this.items.findById(input.itemId);
    if (!item) throw new Error("Item not found");
    if (item.userId !== input.userId) throw new Error("El item no pertenece al usuario");

    const user = await this.users.findById(input.userId.toString());
    if (!user) throw new Error("Usuario no encontrado");

    const creditCost = input.durationHours === 48 ? 3 : 1;
    if (user.credits < creditCost) throw new Error("Créditos insuficientes");

    await this.users.updateCredits(user.id, user.credits - creditCost);

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

    await this.auctions.save(auction);

    // 🔹 Emitir nueva subasta
    emitNewAuction(AuctionMapper.toDto(auction, input.durationHours));

    return { auction: AuctionMapper.toDto(auction, input.durationHours) };
  }

  // Pujar en subasta
  async placeBid(auctionId: number, userId: number, amount: number): Promise<boolean> {
    const auction = await this.auctions.findById(auctionId);
    if (!auction) throw new Error("Auction not found");

    const user = await this.users.findById(userId.toString());
    if (!user) throw new Error("Usuario no encontrado");

    if (user.credits < amount) throw new Error("Créditos insuficientes");

    const bid: Bid = {
      auctionId: auction.id,
      id: Date.now(),
      userId,
      amount,
      createdAt: new Date(),
    };

    const success = auction.placeBid(bid);

    if (success) {
      await this.users.updateCredits(user.id, user.credits - amount);
      await this.auctions.save(auction);

      // 🔹 Emitir actualización de puja
      emitBidUpdate(auction.id, {
        id: auction.id,
        currentPrice: amount,
        highestBid: { userId, amount },
        bidsCount: auction.bids.length,
      });
    }

    return success;
  }

  // Compra rápida
  async buyNow(auctionId: number, userId: number): Promise<boolean> {
    const auction = await this.auctions.findById(auctionId);
    if (!auction) throw new Error("Auction not found");
    if (auction.buyNowPrice === undefined) throw new Error("No tiene compra rápida");

    const user = await this.users.findById(userId.toString());
    if (!user) throw new Error("Usuario no encontrado");
    if (user.credits < auction.buyNowPrice) throw new Error("Créditos insuficientes");

    const success = auction.buyNow(userId);

    if (success) {
      await this.users.updateCredits(user.id, user.credits - auction.buyNowPrice);
      await this.auctions.save(auction);

      // Emitir cierre de subasta con la información más actual
      emitBuyNow(auction.id, {
        id: auction.id,
        status: "CLOSED",
        highestBid: auction.bids.length > 0 ? auction.bids.reduce((max, b) => (b.amount > max.amount ? b : max)) : undefined,
        buyNowPrice: auction.buyNowPrice,
      });
    }

    return success;
  }

  async getAuctionById(id: number) {
    return this.auctions.findById(id);
  }

  async listOpenAuctions() {
    return this.auctions.findByStatus("OPEN");
  }
}
