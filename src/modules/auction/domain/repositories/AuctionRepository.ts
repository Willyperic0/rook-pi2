import { Auction } from "../models/Auction";
import { AuctionStatus } from "../models/AuctionStatus";

export interface AuctionRepository {
  findById(id: string): Promise<Auction | null>;
  save(auction: Auction): Promise<void>;
  updateStatus(id: string, status: AuctionStatus): Promise<void>;
  findByStatus(status: AuctionStatus): Promise<Auction[]>;
  findClosedByBuyer(userId: string): Promise<Auction[]>;
  findClosedBySeller(userId: string): Promise<Auction[]>;
}

