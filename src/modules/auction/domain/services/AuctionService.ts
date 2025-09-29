import { Auction } from "../../domain/models/Auction";
import { AuctionRepository } from "../../domain/repositories/AuctionRepository";
import { ItemRepository } from "../../../inventory/domain/repositories/ItemRepository";
import { CreateAuctionInputDTO, CreateAuctionOutputDto } from "../../application/dto/CreateAuctionDTO";
import { AuctionMapper } from "../../application/mappers/AuctionMapper";
import { Bid } from "../../domain/models/Bid";
import { UserRepository } from "../../../user/domain/repositories/UserRepository";
import { IAuctionService } from "./IAuctionService";
import { emitBidUpdate, emitBuyNow, emitNewAuction } from "../../infraestructure/sockets/auctionSocket";
import { AuctionStatus } from "../models/AuctionStatus";

export class AuctionService implements IAuctionService {
  private auctionTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private readonly auctions: AuctionRepository,
    private readonly items: ItemRepository,
    private readonly users: UserRepository,
  ) {}

  /** Crear subasta usando username */
  async createAuction(input: CreateAuctionInputDTO, username: string): Promise<CreateAuctionOutputDto> {
    const user = await this.users.findByUsername!(username);
    if (!user) throw new Error("Usuario no encontrado");
    if (!input.itemType) throw new Error("Item type no proporcionado");

    const item = await this.items.findById(username, input.itemId, input.itemType as any);
    if (!item) throw new Error("Item not found");

    if (item.userId !== username) throw new Error("El item no pertenece al usuario");
    if (!item.isAvailable) throw new Error("El item no está disponible para subasta");

    if (input.buyNowPrice && input.buyNowPrice <= input.startingPrice)
      throw new Error("El precio de compra rápida debe ser mayor al precio inicial");

    const durationHours = Number(input.durationHours) || 24;
    if (durationHours !== 24 && durationHours !== 48) throw new Error("durationHours debe ser 24 o 48");

    const startingPrice = Number(input.startingPrice);
    const buyNowPrice = input.buyNowPrice ? Number(input.buyNowPrice) : undefined;

    const creditCost = durationHours === 48 ? 3 : 1;
    if (user.getCredits() < creditCost) throw new Error("Créditos insuficientes");

    await this.users.updateCredits(username, -creditCost);

    item.isAvailable = false;
    await this.items.updateAvailability(item.id, false, item.type);

    const now = new Date();
    const endsAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    const auctionInput = {
      id: Date.now().toString(),
      title: item.name,
      description: item.description,
      startingPrice,
      currentPrice: startingPrice,
      item: { ...item, userId: username },
      buyNowPrice,
      status: "OPEN" as AuctionStatus,
      createdAt: now,
      endsAt,
      bids: [] as Bid[],
      highestBidderId: undefined
    };

    const auction = new Auction(auctionInput);
    await this.auctions.save(auction);

    emitNewAuction(AuctionMapper.toDto(auction));
    this.scheduleAuctionEnd(auction.getId(), auction.getHighestBidderId(), endsAt);

    return { auction: AuctionMapper.toDto(auction) };
  }

  /** Pujar usando username */
  async placeBid(auctionId: string, username: string, amount: number): Promise<boolean> {
    const auction = await this.auctions.findById(auctionId);
    if (!auction) throw new Error("Auction not found");

    const buyNowPrice = auction.getBuyNowPrice();
    const user = await this.users.findByUsername!(username);
    if (!user) throw new Error("Usuario no encontrado");

    if (user.getUsername() === auction.getItem().userId) throw new Error("El creador no puede pujar en su propia subasta");
    if (buyNowPrice !== undefined && amount >= buyNowPrice && buyNowPrice !== 0)
      throw new Error("La puja iguala o supera el precio de compra rápida. Usa el botón de compra rápida");
    if (user.getCredits() < amount) throw new Error("Créditos insuficientes");

    const bid: Bid = {
      auctionId: auction.getId(),
      id: Date.now().toString(),
      userId: user.getUsername(),
      amount,
      createdAt: new Date(),
    };

    const success = auction.placeBid(bid);
    if (success) {
      await this.users.updateCredits(user.getUsername(), -amount);
      await this.auctions.save(auction);

      emitBidUpdate(auction.getId(), {
        id: auction.getId(),
        currentPrice: amount,
        highestBid: { userId: user.getUsername(), amount },
        bidsCount: auction.getBids().length,
      });
    }

    return success;
  }

  /** Compra rápida usando username */
  async buyNow(auctionId: string, username: string): Promise<boolean> {
    const auction = await this.auctions.findById(auctionId);
    if (!auction) throw new Error("Auction not found");

    const buyNowPrice = auction.getBuyNowPrice();
    if (!buyNowPrice) throw new Error("No tiene compra rápida");

    const user = await this.users.findByUsername!(username);
    if (!user) throw new Error("Usuario no encontrado");

    if (user.getUsername() === auction.getItem().userId) 
      throw new Error("El creador no puede usar compra rápida en su propia subasta");

    if (user.getCredits() < buyNowPrice) 
      throw new Error("Créditos insuficientes");

    const success = auction.buyNow(user.getUsername());
    if (!success) throw new Error("BuyNow failed");

    await this.users.updateCredits(user.getUsername(), -buyNowPrice);
    await this.auctions.save(auction);

    emitBuyNow(auction.getId(), {
      id: auction.getId(),
      status: "CLOSED",
      highestBid: { userId: user.getUsername(), amount: buyNowPrice },
      buyNowPrice
    });

    await this.finalizeAuction(auction.getId(), user.getUsername());
    this.clearAuctionTimer(auctionId);

    return true;
  }

  /** Finalizar subasta */
  async finalizeAuction(auctionId: string, winnerUsername?: string) {
    const auction = await this.auctions.findById(auctionId);
    if (!auction) throw new Error("Auction not found");

    const creator = await this.users.findByUsername!(auction.getItem().userId);
    if (!creator) throw new Error("Creator not found");

    const item = await this.items.findById(creator.getUsername(), auction.getItem().id, auction.getItem().type);
    if (!item) throw new Error("Item not found");

    if (winnerUsername) {
      const winner = await this.users.findByUsername!(winnerUsername);
      if (!winner) throw new Error("Winner not found");

      await this.items.transferItem(creator.getUsername(), winner.getUsername(), item.name);

      // ✅ Ajuste de créditos al finalizar
      const finalPrice = auction.getBuyNowPrice() || auction.getCurrentPrice();
      const totalBidsByWinner = auction.getBids()
        .filter(b => b.userId === winner.getUsername())
        .reduce((sum, b) => sum + b.amount, 0);

      // El vendedor recibe el total final
      await this.users.updateCredits(creator.getUsername(), finalPrice);

      // Devolver créditos al ganador que ya pagó en pujas previas
      if (totalBidsByWinner > 0) {
        await this.users.updateCredits(winner.getUsername(), totalBidsByWinner);
      }

      // Devolver créditos a los perdedores
      for (const bid of auction.getBids()) {
        if (bid.userId !== winner.getUsername()) {
          const user = await this.users.findByUsername!(bid.userId);
          if (user) await this.users.updateCredits(user.getUsername(), bid.amount);
        }
      }

    } else {
      await this.items.updateItem(item.id, { isAvailable: true });
    }

    auction.setStatus("CLOSED");
    await this.auctions.save(auction);
    emitBuyNow(auction.getId(), AuctionMapper.toDto(auction));
  }

  /** Programar cierre automático de subasta */
  private scheduleAuctionEnd(auctionId: string, winnerUsername: string | undefined, endsAt: Date) {
    const now = new Date();
    const delay = endsAt.getTime() - now.getTime();
    if (delay <= 0) return;

    const timer = setTimeout(async () => {
      await this.finalizeAuction(auctionId, winnerUsername);
      this.auctionTimers.delete(auctionId);
    }, delay);

    this.auctionTimers.set(auctionId, timer);
  }

  private clearAuctionTimer(auctionId: string) {
    const timer = this.auctionTimers.get(auctionId);
    if (timer) {
      clearTimeout(timer);
      this.auctionTimers.delete(auctionId);
    }
  }

  /** Otros métodos */
  async getAuctionById(id: string) {
    return this.auctions.findById(id);
  }

  async listOpenAuctions() {
    return this.auctions.findByStatus("OPEN");
  }

  async getCurrentUser(username: string) {
    const user = await this.users.findByUsername!(username);
    if (!user) throw new Error("Usuario no encontrado");
    return user;
  }

  async getPurchasedAuctions(username: string): Promise<Auction[]> {
    return this.auctions.findClosedByBuyer(username);
  }

  async getSoldAuctions(username: string): Promise<Auction[]> {
    return this.auctions.findClosedBySeller(username);
  }
}





