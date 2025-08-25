import { Auction } from "../models/Auction";
import { AuctionStatus } from "../models/AuctionStatus";

export interface AuctionRepository {
  findById(id: number): Promise<Auction | null>;
  save(auction: Auction): Promise<void>;
  updateStatus(id: number, status: AuctionStatus): Promise<void>;
  findByStatus(status: AuctionStatus): Promise<Auction[]>;
  findClosedByBuyer(userId: number): Promise<Auction[]> ;
  findClosedBySeller(userId: number): Promise<Auction[]>;
}

