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

  // Crear subasta usando username
  async createAuction(input: CreateAuctionInputDTO, username: string): Promise<CreateAuctionOutputDto> {
  console.log("[AuctionService] createAuction called with input:", input, "username:", username);

  if (input.startingPrice < 1) throw new Error("El precio inicial debe ser mínimo 1");

  const user = await this.users.findByUsername!(username);
  console.log("[AuctionService] Usuario encontrado:", user);
  if (!user) throw new Error("Usuario no encontrado");

  const item = await this.items.findById(username, input.itemId);
  console.log("[AuctionService] Item encontrado:", item);
  if (!item) throw new Error("Item not found");

  if (item.userId !== username) throw new Error("El item no pertenece al usuario");
  if (!item.isAvailable) throw new Error("El item no está disponible para subasta");

  if (input.buyNowPrice !== undefined && input.buyNowPrice <= input.startingPrice && input.buyNowPrice !== 0)
    throw new Error("El precio de compra rápida debe ser mayor al precio inicial");

  const creditCost = input.durationHours === 48 ? 3 : 1;
  if (user.getCredits() < creditCost) throw new Error("Créditos insuficientes");
  await this.users.updateCredits(user.getId(), user.getCredits() - creditCost);

  item.isAvailable = false;
  await this.items.updateAvailability(item.id, false);

  const auctionInput = {
    id: Date.now().toString(),
    title: item.name,
    description: item.description,
    startingPrice: input.startingPrice,
    currentPrice: input.startingPrice,
    item: item,
    buyNowPrice: input.buyNowPrice,
    status: "OPEN" as AuctionStatus,
    createdAt: new Date(),
    bids: [] as Bid[],
    highestBidderId: undefined
  };

  const auction = new Auction(auctionInput);
  await this.auctions.save(auction);

  console.log("[AuctionService] Auction creada:", auction);
  emitNewAuction(AuctionMapper.toDto(auction, input.durationHours));

  return { auction: AuctionMapper.toDto(auction, input.durationHours) };
}

  // Pujar usando username
  async placeBid(auctionId: string, username: string, amount: number): Promise<boolean> {
    const auction = await this.auctions.findById(auctionId);
    if (!auction) throw new Error("Auction not found");

    const buyNowPrice = auction.getBuyNowPrice();
    const user = await this.users.findByUsername!(username);

    if (!user) throw new Error("Usuario no encontrado");

    if (user.getId() === auction.getItem().userId) throw new Error("El creador no puede pujar en su propia subasta");
    if (buyNowPrice !== undefined && amount >= buyNowPrice && buyNowPrice !== 0)
      throw new Error("La puja iguala o supera el precio de compra rápida. Usa el botón de compra rápida");
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

    return success;
  }

  // Compra rápida usando username
  async buyNow(auctionId: string, username: string): Promise<boolean> {
    const auction = await this.auctions.findById(auctionId);
    if (!auction) throw new Error("Auction not found");
    if (auction.getBuyNowPrice() === undefined) throw new Error("No tiene compra rápida");

    const user = await this.users.findByUsername!(username);

    if (!user) throw new Error("Usuario no encontrado");

    if (user.getId() === auction.getItem().userId) throw new Error("El creador no puede usar compra rápida en su propia subasta");
    const buyNowPrice = auction.getBuyNowPrice();
    if (user.getCredits() < buyNowPrice!) throw new Error("Créditos insuficientes");

    const success = auction.buyNow(user.getId());
    if (success) {
      await this.users.updateCredits(user.getId(), user.getCredits() - buyNowPrice!);
      await this.auctions.save(auction);

      emitBuyNow(auction.getId(), {
        id: auction.getId(),
        status: "CLOSED",
        highestBid: auction.getBids().length > 0
          ? auction.getBids().reduce((max, b) => (b.amount > max.amount ? b : max))
          : undefined,
        buyNowPrice: auction.getBuyNowPrice(),
      });

      await this.finalizeAuction(auction.getId(), user.getId());
    }

    return success;
  }

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

  async finalizeAuction(auctionId: string, winnerUsername?: string) {
  const auction = await this.auctions.findById(auctionId);
  if (!auction) throw new Error("Auction not found");

  // Obtener al creador de la subasta usando el username guardado en el item
  const creatorUsername = auction.getItem().userId; // aquí userId es el username
  const creator = await this.users.findByUsername!(creatorUsername);
  if (!creator) throw new Error("Creator not found");

  // Buscar el item usando el username del creador
  const item = await this.items.findById(creator.getUsername(), auction.getItem().id);
  if (!item) throw new Error("Item not found");

  if (winnerUsername) {
    const winner = await this.users.findByUsername!(winnerUsername);
    if (!winner) throw new Error("Winner not found");

    // Reasignar item al ganador usando username
    item.userId = winner.getUsername();
    item.isAvailable = true;
    await this.items.updateItem(item.id, { userId: winner.getUsername(), isAvailable: true });

    // Pagar al creador
    await this.users.updateCredits(creator.getId(), creator.getCredits() + (auction.getBuyNowPrice() || 0));

    // Devolver créditos a los perdedores
    for (const bid of auction.getBids()) {
      if (bid.userId !== winner.getId()) {
        const user = await this.users.findById(bid.userId.toString());
        if (user) await this.users.updateCredits(user.getId(), user.getCredits() + bid.amount);
      }
    }
  } else {
    // Si no hay ganador, devolver item al creador
    item.isAvailable = true;
    await this.items.updateItem(item.id, { isAvailable: true });
  }

  auction.setStatus("CLOSED");
  await this.auctions.save(auction);
}



  async getPurchasedAuctions(username: string): Promise<Auction[]> {
    return this.auctions.findClosedByBuyer(username);
  }

  async getSoldAuctions(username: string): Promise<Auction[]> {
    return this.auctions.findClosedBySeller(username);
  }
}


