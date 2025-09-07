// src/modules/auction/domain/repositories/InMemoryAuctionRepository.ts

import { Auction } from "../../domain/models/Auction";
import { AuctionRepository } from "../../domain/repositories/AuctionRepository";
import { AuctionStatus } from "../../domain/models/AuctionStatus";

/**
 * Implementación en memoria de {@link AuctionRepository}.
 * @remarks
 * - Útil para pruebas, demos o como stub.
 * - No usar en producción: no hay persistencia duradera ni concurrencia controlada.
 */
export class InMemoryAuctionRepository implements AuctionRepository {
  /** Almacenamiento temporal en memoria. */
  private auctions: Auction[] = [];

  async findById(id: number): Promise<Auction | null> {
    return this.auctions.find(a => a.id === id) || null;
  }

  async save(auction: Auction): Promise<void> {
    const index = this.auctions.findIndex(a => a.id === auction.id);
    if (index === -1) {
      this.auctions.push(auction);
    } else {
      this.auctions[index] = auction;
    }
  }

  async updateStatus(id: number, status: AuctionStatus): Promise<void> {
    const auction = await this.findById(id);
    if (auction) auction.status = status;
  }

  async findByStatus(status: AuctionStatus): Promise<Auction[]> {
    return this.auctions.filter(a => a.status === status);
  }

  /** Subastas cerradas de las que el usuario es comprador ganador. */
  async findClosedByBuyer(userId: number): Promise<Auction[]> {
    return this.auctions.filter(
      a =>
        (a.status === "CLOSED" || a.status === "closed") &&
        a.getHighestBidderId() !== undefined &&
        a.getHighestBidderId() === userId
    );
  }

  /** Subastas cerradas de las que el usuario es vendedor/originador. */
  async findClosedBySeller(userId: number): Promise<Auction[]> {
    return this.auctions.filter(
      a =>
        (a.status === "CLOSED" || a.status === "closed") &&
        a.getOwnerId() !== undefined &&
        a.getOwnerId() === userId
    );
  }
}