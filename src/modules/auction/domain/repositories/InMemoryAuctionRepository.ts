import { Auction } from "../../domain/models/Auction";
import { AuctionRepository } from "../../domain/repositories/AuctionRepository";
import { AuctionStatus } from "../../domain/models/AuctionStatus";

export class InMemoryAuctionRepository implements AuctionRepository {
  private auctions: Auction[] = [];

  async findById(id: string): Promise<Auction | null> {
    return this.auctions.find(a => a.getId() === id) || null;
  }

  async save(auction: Auction): Promise<void> {
    const index = this.auctions.findIndex(a => a.getId() === auction.getId());
    if (index === -1) {
      this.auctions.push(auction);
    } else {
      this.auctions[index] = auction;
    }
  }

  async updateStatus(id: string, status: AuctionStatus): Promise<void> {
    const auction = await this.findById(id);
    if (auction) auction.setStatus(status);
  }

  async findByStatus(status: AuctionStatus): Promise<Auction[]> {
    return this.auctions.filter(a => a.getStatus() === status);
  }
  // NUEVOS MÉTODOS
  async findClosedByBuyer(userId: string): Promise<Auction[]> {
  return this.auctions.filter(
    a =>
      (a.getStatus() === "CLOSED" || a.getStatus() === "closed") &&
      a.getHighestBidderId() !== undefined &&
      a.getHighestBidderId() === userId
  );
}

async findClosedBySeller(userId: string): Promise<Auction[]> {
  return this.auctions.filter(
    a =>
      (a.getStatus() === "CLOSED" || a.getStatus() === "closed") &&
      a.getOwnerId() !== undefined &&
      a.getOwnerId() === userId
  );
}


}

