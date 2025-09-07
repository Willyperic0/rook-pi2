import { Auction } from "../../domain/models/Auction";
import { AuctionRepository } from "../../domain/repositories/AuctionRepository";
import { ItemRepository } from "../../../inventory/domain/repositories/ItemRepository";
import { CreateAuctionInputDTO, CreateAuctionOutputDto } from "../../application/dto/CreateAuctionDTO";
import { AuctionMapper } from "../../application/mappers/AuctionMapper";
import { Bid } from "../../domain/models/Bid";
import { UserRepository } from "../../../user/domain/repositories/UserRepository";
import { IAuctionService } from "./IAuctionService";
// Sockets
import { emitBidUpdate, emitBuyNow, emitNewAuction } from "../../infraestructure/sockets/auctionSocket";
import { AuctionStatus } from "../models/AuctionStatus";

export class AuctionService implements IAuctionService {
  constructor(
    private readonly auctions: AuctionRepository,
    private readonly items: ItemRepository,
    private readonly users: UserRepository,
  ) {}

  // Crear subasta usando token
async createAuction(input: CreateAuctionInputDTO, token: string): Promise<CreateAuctionOutputDto> {
  console.log("[AUCTION SERVICE] createAuction called with input:", input, "token:", token);

  // 🔹 Validar que el precio inicial sea mínimo 1
  if (input.startingPrice < 1) {
    throw new Error("El precio inicial debe ser mínimo 1");
  }

  const user = await this.users.findByToken(token);
  console.log("[AUCTION SERVICE] User fetched from token:", user);
  if (!user) throw new Error("Usuario no encontrado");

  const item = await this.items.findById(input.itemId);
  console.log("[AUCTION SERVICE] Item fetched by ID:", item);
  if (!item) throw new Error("Item not found");
  console.log("[AUCTION SERVICE] Validating ownership:", { itemUserId: item.userId, userId: user.getId() });

  if (item.userId !== user.getId()) throw new Error("El item no pertenece al usuario");
  if (!item.isAvailable) throw new Error("El item no está disponible para subasta");

  if (input.buyNowPrice !== undefined && input.buyNowPrice <= input.startingPrice && input.buyNowPrice !== 0)
    throw new Error("El precio de compra rápida debe ser mayor al precio inicial");

  const creditCost = input.durationHours === 48 ? 3 : 1;
  console.log(`[AUCTION SERVICE] User credits: ${user.getCredits()}, creditCost: ${creditCost}`);
  if (user.getCredits() < creditCost) throw new Error("Créditos insuficientes");
  await this.users.updateCredits(user.getId(), user.getCredits() - creditCost);
  console.log("[AUCTION SERVICE] User credits updated");

  try {
    item.isAvailable = false;
    await this.items.updateAvailability(item.id, false);
    console.log("[AUCTION SERVICE] Item availability set to false");
  } catch (err) {
    console.error("[AUCTION SERVICE] Failed to update item availability:", err);
    throw err;
  }

  const auctionInput = {
  id: Date.now().toString(), // usar string como en AuctionInterface
  title: item.name,
  description: item.description,
  startingPrice: input.startingPrice,
  currentPrice: input.startingPrice,
  item: item,
  buyNowPrice: input.buyNowPrice, // puede ser undefined
  status: "OPEN" as AuctionStatus,
  createdAt: new Date(),
  bids: [] as Bid[],
  highestBidderId: undefined
};

const auction = new Auction(auctionInput);

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
async placeBid(auctionId: string, token: string, amount: number): Promise<boolean> {
  console.log("[AUCTION SERVICE] placeBid called with auctionId:", auctionId, "token:", token, "amount:", amount);
  const auction = await this.auctions.findById(auctionId);
  if (!auction) throw new Error("Auction not found");
  const buyNowPrice = auction.getBuyNowPrice();
  if (buyNowPrice === undefined) throw new Error("Esta subasta no tiene compra rápida");
  const user = await this.users.findByToken(token);
  if (!user) throw new Error("Usuario no encontrado");

  // 🔹 Validar que el creador no pueda pujar
  if (user.getId() === auction.getItem().userId) throw new Error("El creador no puede pujar en su propia subasta");
  // 🔹 Validar que la puja no supere o iguale el buyNowPrice
  if (buyNowPrice !== undefined && amount >= buyNowPrice && buyNowPrice !== 0 ) {
    throw new Error("La puja iguala o supera el precio de compra rápida. Usa el botón de compra rápida");
  }
  if (user.getCredits() < amount) throw new Error("Créditos insuficientes");

  const bid: Bid = {
    auctionId: auction.getId(),
    id: Date.now().toString(),
    userId: user.getId(),
    amount,
    createdAt: new Date(),
  };

  const success = auction.placeBid(bid);
  if (success) {
    await this.users.updateCredits(user.getId(), user.getCredits() - amount);
    await this.auctions.save(auction);

    emitBidUpdate(auction.getId(), {
      id: auction.getId(),
      currentPrice: amount,
      highestBid: { userId: Number(user.getId()), amount },
      bidsCount: auction.getBids().length,
    });
  }

  console.log("[AUCTION SERVICE] Bid placed:", success);
  return success;
}

// Compra rápida usando token
async buyNow(auctionId: string, token: string): Promise<boolean> {
  console.log("[AUCTION SERVICE] buyNow called with auctionId:", auctionId, "token:", token);

  const auction = await this.auctions.findById(auctionId);
  if (!auction) throw new Error("Auction not found");
  if (auction.getBuyNowPrice() === undefined) throw new Error("No tiene compra rápida");
  const buyNowPrice = auction.getBuyNowPrice();
  if (buyNowPrice === undefined) throw new Error("Esta subasta no tiene compra rápida");
  const user = await this.users.findByToken(token);
  if (!user) throw new Error("Usuario no encontrado");

  // 🔹 Validar que el creador no pueda usar buyNow
  if (user.getId() === auction.getItem().userId) throw new Error("El creador no puede usar compra rápida en su propia subasta");

  if (user.getCredits() < buyNowPrice) throw new Error("Créditos insuficientes");

  const success = auction.buyNow(user.getId());
  if (success) {
    await this.users.updateCredits(user.getId(), user.getCredits() - buyNowPrice);
    await this.auctions.save(auction);

    emitBuyNow(auction.getId(), {
      id: auction.getId(),
      status: "CLOSED",
      highestBid:
        auction.getBids().length > 0
          ? auction.getBids().reduce((max, b) => (b.amount > max.amount ? b : max))
          : undefined,
      buyNowPrice: auction.getBuyNowPrice(),
    });

    try {
      await this.finalizeAuction(auction.getId(), user.getId());
      console.log("[AUCTION SERVICE] Auction finalized after buyNow");
    } catch (err) {
      console.error("[AUCTION SERVICE] finalizeAuction failed:", err);
    }
  }

  return success;
}




  async getAuctionById(id: string) {
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
  // Finalizar subasta
async finalizeAuction(auctionId: string, winnerId?: string) {
  console.log("[AUCTION SERVICE] finalizeAuction called with auctionId:", auctionId, "winnerId:", winnerId);

  const auction = await this.auctions.findById(auctionId);
  if (!auction) throw new Error("Auction not found");
  const buyNowPrice = auction.getBuyNowPrice();
  if (buyNowPrice === undefined) throw new Error("Esta subasta no tiene compra rápida");
  const item = await this.items.findById(auction.getItem().id);
  if (!item) throw new Error("Item not found");

  const creator = await this.users.findById(auction.getItem().userId.toString());
  if (!creator) throw new Error("Creator not found");

  if (winnerId) {
    // Compra rápida o ganador ya definido
    item.userId = winnerId;
    item.isAvailable = true;

    await this.items.updateItem(item.id, { userId: winnerId, isAvailable: true });
    console.log(`[AUCTION SERVICE] Item ${item.name} transferred to user ${winnerId} and marked available`);

    // 🔹 Agregar créditos al creador de la subasta
    if (!buyNowPrice) throw new Error("buyNowPrice undefined for buyNow winner");
    await this.users.updateCredits(creator.getId(), creator.getCredits() + buyNowPrice);
    console.log(`[AUCTION SERVICE] Creator ${creator.getId()} received ${buyNowPrice} credits`);

    // 🔹 Devolver créditos a los que ya habían pujado antes del buyNow
    for (const bid of auction.getBids()) {
      if (bid.userId !== winnerId) { // evitar devolver al ganador
        const user = await this.users.findById(bid.userId.toString());
        if (user) {
          await this.users.updateCredits(user.getId(), user.getCredits() + bid.amount);
          console.log(`[AUCTION SERVICE] Returned ${bid.amount} credits to user ${user.getId()}`);
        }
      }
    }

  } else {
    // Determinar el ganador por la puja más alta
    const sortedBids = auction.getBids().sort((a, b) => b.amount - a.amount);
    const winnerBid = sortedBids[0];

    if (winnerBid) {
      // Transferir item al ganador
      item.userId = winnerBid.userId;
      item.isAvailable = true;
      await this.items.updateItem(item.id, { userId: winnerBid.userId, isAvailable: true });
      console.log(`[AUCTION SERVICE] Item ${item.name} transferred to user ${winnerBid.userId} and marked available`);

      // Pagarle al creador
      await this.users.updateCredits(creator.getId(), creator.getCredits() + winnerBid.amount);
      console.log(`[AUCTION SERVICE] Creator ${creator.getId()} received ${winnerBid.amount} credits`);

      // Devolver créditos a perdedores
      const losers = sortedBids.slice(1);
      for (const bid of losers) {
        const user = await this.users.findById(bid.userId.toString());
        if (user) {
          await this.users.updateCredits(user.getId(), user.getCredits() + bid.amount);
          console.log(`[AUCTION SERVICE] Returned ${bid.amount} credits to user ${user.getId()}`);
        }
      }
    } else {
      // No hubo pujas, liberamos el item
      item.isAvailable = true;
      await this.items.updateItem(item.id, { isAvailable: true });
      console.log(`[AUCTION SERVICE] Item ${item.name} released without winner`);
    }
  }

  // Cerrar la subasta
  auction.setStatus("CLOSED");
  await this.auctions.save(auction);
  console.log("[AUCTION SERVICE] Auction closed and saved");
}
  async getPurchasedAuctions(userId: string): Promise<Auction[]> {
    return this.auctions.findClosedByBuyer(userId);
  }

  async getSoldAuctions(userId: string): Promise<Auction[]> {
    return this.auctions.findClosedBySeller(userId);
  }



}


