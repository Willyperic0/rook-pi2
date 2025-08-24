import { Auction } from "../../domain/models/Auction";
import { AuctionRepository } from "../../domain/repositories/AuctionRepository";
import { AuctionStatus } from "../../domain/models/AuctionStatus";

export class InMemoryAuctionRepository implements AuctionRepository {
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
}

