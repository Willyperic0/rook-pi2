// src/modules/auction/domain/services/AuctionService.ts

import { Auction } from "../../domain/models/Auction";
import { AuctionRepository } from "../../domain/repositories/AuctionRepository";
import { ItemRepository } from "../../../inventory/domain/repositories/ItemRepository";
import { CreateAuctionInputDTO, CreateAuctionOutputDto } from "../../application/dto/CreateAuctionDTO";
import { AuctionMapper } from "../../application/mappers/AuctionMapper";
import { Bid } from "../../domain/models/Bid";
import { HttpUserRepository } from "../../../user/domain/repositories/HttpUserRepository";
// Sockets
import { emitBidUpdate, emitBuyNow, emitNewAuction } from "../../infraestructure/sockets/auctionSocket";

/**
 * Servicio de dominio/aplicación para orquestar casos de uso de subastas.
 * @remarks
 * - Aplica reglas de negocio, valida precondiciones y coordina repositorios (auctions, items, users).
 * - Emite eventos vía sockets para actualizar clientes en tiempo real.
 * - No realiza IO directo de frameworks en el dominio (usa puertos/repositorios).
 *
 * @typedoc
 * Este servicio está documentado con TSDoc para generación con TypeDoc.
 */
export class AuctionService {
  /**
   * @param auctions Repositorio de subastas (puerto)
   * @param items Repositorio de ítems (puerto)
   * @param users Repositorio HTTP/usuarios (adaptador)
   */
  constructor(
    private readonly auctions: AuctionRepository,
    private readonly items: ItemRepository,
    private readonly users: HttpUserRepository,
  ) {}

  /**
   * Crea una subasta asociada a un usuario autenticado por token.
   * @param input Datos de creación
   * @param token Token de autenticación (resuelve al vendedor)
   * @returns Subasta creada (DTO)
   * @throws Error si faltan créditos, el item no pertenece al usuario, no está disponible, etc.
   */
  async createAuction(input: CreateAuctionInputDTO, token: string): Promise<CreateAuctionOutputDto> {
    console.log("[AUCTION SERVICE] createAuction called with input:", input, "token:", token);

    if (input.startingPrice < 1) {
      throw new Error("El precio inicial debe ser mínimo 1");
    }

    const user = await this.users.findByToken(token);
    console.log("[AUCTION SERVICE] User fetched from token:", user);
    if (!user) throw new Error("Usuario no encontrado");

    const item = await this.items.findById(input.itemId);
    console.log("[AUCTION SERVICE] Item fetched by ID:", item);
    if (!item) throw new Error("Item not found");
    if (item.userId !== Number(user.id)) throw new Error("El item no pertenece al usuario");
    if (!item.isAvailable) throw new Error("El item no está disponible para subasta");

    if (input.buyNowPrice !== undefined && input.buyNowPrice <= input.startingPrice && input.buyNowPrice !== 0)
      throw new Error("El precio de compra rápida debe ser mayor al precio inicial");

    const creditCost = input.durationHours === 48 ? 3 : 1;
    console.log(`[AUCTION SERVICE] User credits: ${user.credits}, creditCost: ${creditCost}`);
    if (user.credits < creditCost) throw new Error("Créditos insuficientes");
    await this.users.updateCredits(user.id, user.credits - creditCost);
    console.log("[AUCTION SERVICE] User credits updated");

    try {
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

  /**
   * Registra una puja en una subasta para el usuario autenticado por token.
   * @param auctionId ID de la subasta
   * @param token Token del usuario postor
   * @param amount Monto ofertado
   * @returns `true` si la puja fue aceptada
   * @throws Error si la subasta no existe, el creador intenta pujar, créditos insuficientes, etc.
   */
  async placeBid(auctionId: number, token: string, amount: number): Promise<boolean> {
    console.log("[AUCTION SERVICE] placeBid called with auctionId:", auctionId, "token:", token, "amount:", amount);

    const auction = await this.auctions.findById(auctionId);
    if (!auction) throw new Error("Auction not found");

    const user = await this.users.findByToken(token);
    if (!user) throw new Error("Usuario no encontrado");

    if (Number(user.id) === auction.item.userId) throw new Error("El creador no puede pujar en su propia subasta");
    if (auction.buyNowPrice !== undefined && amount >= auction.buyNowPrice && auction.buyNowPrice !== 0 ) {
      throw new Error("La puja iguala o supera el precio de compra rápida. Usa el botón de compra rápida");
    }
    if (user.credits < amount) throw new Error("Créditos insuficientes");

    const bid: Bid = {
      auctionId: auction.id,
      id: Date.now(),
      userId: Number(user.id),
      amount,
      createdAt: new Date(),
    };

    const success = auction.placeBid(bid);
    if (success) {
      await this.users.updateCredits(user.id, user.credits - amount);
      await this.auctions.save(auction);

      emitBidUpdate(auction.id, {
        id: auction.id,
        currentPrice: amount,
        highestBid: { userId: Number(user.id), amount },
        bidsCount: auction.bids.length,
      });
    }

    console.log("[AUCTION SERVICE] Bid placed:", success);
    return success;
  }

  /**
   * Ejecuta compra inmediata (buy now) para el usuario autenticado por token.
   * @param auctionId ID de la subasta
   * @param token Token del usuario comprador
   * @returns `true` si se ejecutó; `false` en caso contrario
   * @throws Error si la subasta no existe, no tiene buy now, o créditos insuficientes.
   */
  async buyNow(auctionId: number, token: string): Promise<boolean> {
    console.log("[AUCTION SERVICE] buyNow called with auctionId:", auctionId, "token:", token);

    const auction = await this.auctions.findById(auctionId);
    if (!auction) throw new Error("Auction not found");
    if (auction.buyNowPrice === undefined) throw new Error("No tiene compra rápida");

    const user = await this.users.findByToken(token);
    if (!user) throw new Error("Usuario no encontrado");

    if (Number(user.id) === auction.item.userId) throw new Error("El creador no puede usar compra rápida en su propia subasta");
    if (user.credits < auction.buyNowPrice) throw new Error("Créditos insuficientes");

    const success = auction.buyNow(Number(user.id));
    if (success) {
      await this.users.updateCredits(user.id, user.credits - auction.buyNowPrice);
      await this.auctions.save(auction);

      emitBuyNow(auction.id, {
        id: auction.id,
        status: "CLOSED",
        highestBid:
          auction.bids.length > 0
            ? auction.bids.reduce((max, b) => (b.amount > max.amount ? b : max))
            : undefined,
        buyNowPrice: auction.buyNowPrice,
      });

      try {
        await this.finalizeAuction(auction.id, Number(user.id));
        console.log("[AUCTION SERVICE] Auction finalized after buyNow");
      } catch (err) {
        console.error("[AUCTION SERVICE] finalizeAuction failed:", err);
      }
    }

    return success;
  }

  /** Obtiene una subasta por ID. */
  async getAuctionById(id: number) {
    console.log("[AUCTION SERVICE] getAuctionById called with id:", id);
    return this.auctions.findById(id);
  }

  /** Lista subastas abiertas. */
  async listOpenAuctions() {
    console.log("[AUCTION SERVICE] listOpenAuctions called");
    return this.auctions.findByStatus("OPEN");
  }

  /** Obtiene el usuario actual a partir de un token. */
  async getCurrentUser(token: string) {
    console.log("[AUCTION SERVICE] getCurrentUser called with token:", token);
    const user = await this.users.findByToken(token);
    console.log("[AUCTION SERVICE] User fetched:", user);
    if (!user) throw new Error("Usuario no encontrado");
    return user;
  }

  /**
   * Finaliza una subasta (por cierre normal o tras compra inmediata).
   * @param auctionId ID de la subasta
   * @param winnerId (opcional) ID del ganador cuando aplica buy now
   * @throws Error si subasta/ítem/creador no existen
   * @remarks
   * - Transfiere el ítem, actualiza disponibilidad y créditos (creador/ganador/perdedores).
   * - Cierra la subasta y la persiste.
   */
  async finalizeAuction(auctionId: number, winnerId?: number) {
    console.log("[AUCTION SERVICE] finalizeAuction called with auctionId:", auctionId, "winnerId:", winnerId);

    const auction = await this.auctions.findById(auctionId);
    if (!auction) throw new Error("Auction not found");

    const item = await this.items.findById(auction.item.id);
    if (!item) throw new Error("Item not found");

    const creator = await this.users.findById(auction.item.userId.toString());
    if (!creator) throw new Error("Creator not found");

    if (winnerId) {
      // Compra inmediata o ganador definido
      item.userId = winnerId;
      item.isAvailable = true;
      await this.items.updateItem(item.id, { userId: winnerId, isAvailable: true });
      console.log(`[AUCTION SERVICE] Item ${item.name} transferred to user ${winnerId} and marked available`);

      if (!auction.buyNowPrice) throw new Error("buyNowPrice undefined for buyNow winner");
      await this.users.updateCredits(creator.id, creator.credits + auction.buyNowPrice);
      console.log(`[AUCTION SERVICE] Creator ${creator.id} received ${auction.buyNowPrice} credits`);

      // Devolver créditos a postores perdedores
      for (const bid of auction.bids) {
        if (bid.userId !== winnerId) {
          const user = await this.users.findById(bid.userId.toString());
          if (user) {
            await this.users.updateCredits(user.id, user.credits + bid.amount);
            console.log(`[AUCTION SERVICE] Returned ${bid.amount} credits to user ${user.id}`);
          }
        }
      }
    } else {
      // Cierre por pujas: determina ganador por mayor puja
      const sortedBids = auction.bids.sort((a, b) => b.amount - a.amount);
      const winnerBid = sortedBids[0];

      if (winnerBid) {
        item.userId = winnerBid.userId;
        item.isAvailable = true;
        await this.items.updateItem(item.id, { userId: winnerBid.userId, isAvailable: true });
        console.log(`[AUCTION SERVICE] Item ${item.name} transferred to user ${winnerBid.userId} and marked available`);

        await this.users.updateCredits(creator.id, creator.credits + winnerBid.amount);
        console.log(`[AUCTION SERVICE] Creator ${creator.id} received ${winnerBid.amount} credits`);

        const losers = sortedBids.slice(1);
        for (const bid of losers) {
          const user = await this.users.findById(bid.userId.toString());
          if (user) {
            await this.users.updateCredits(user.id, user.credits + bid.amount);
            console.log(`[AUCTION SERVICE] Returned ${bid.amount} credits to user ${user.id}`);
          }
        }
      } else {
        // Sin pujas: liberar ítem
        item.isAvailable = true;
        await this.items.updateItem(item.id, { isAvailable: true });
        console.log(`[AUCTION SERVICE] Item ${item.name} released without winner`);
      }
    }

    auction.status = "CLOSED";
    await this.auctions.save(auction);
    console.log("[AUCTION SERVICE] Auction closed and saved");
  }

  /** Historial de compras del usuario (subastas cerradas donde fue comprador ganador). */
  async getPurchasedAuctions(userId: number): Promise<Auction[]> {
    return this.auctions.findClosedByBuyer(userId);
  }

  /** Historial de ventas del usuario (subastas cerradas donde fue vendedor). */
  async getSoldAuctions(userId: number): Promise<Auction[]> {
    return this.auctions.findClosedBySeller(userId);
  }
}