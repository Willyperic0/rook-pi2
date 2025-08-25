// src/domain/models/Auction.ts
import { Bid } from "./Bid";
import { Item } from "../../../inventory/domain/models/Item";
import { AuctionStatus } from "./AuctionStatus";

export class Auction {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public startingPrice: number,
    public currentPrice: number,
    public item: Item,
    public buyNowPrice?: number,
    public status: AuctionStatus = "OPEN",
    public createdAt: Date = new Date(),
    public bids: Bid[] = [],
    private highestBidderId?: number,
  ) {}

  placeBid(bid: Bid): boolean {
    if (this.status !== "OPEN") return false;
    if (bid.amount < this.currentPrice) return false;

    this.currentPrice = bid.amount;
    this.bids.push(bid);
    this.highestBidderId = bid.userId;
    return true;
  }

  closeAsExpired(): void {
    this.status = "EXPIRED";
  }

  markAsSold(userId: number): void {
    this.status = "SOLD";
    this.highestBidderId = userId;
  }

  buyNow(userId: number): boolean {
    if (!this.buyNowPrice || this.status !== "OPEN") return false;
    this.currentPrice = this.buyNowPrice;
    this.markAsSold(userId);
    return true;
  }

  getWinnerId(): number | undefined {
    return this.highestBidderId;
  }

  getOwnerId(): number | undefined {
    return this.item.userId;
  }

  getHighestBidderId(): number | undefined {
    return this.highestBidderId;
  }
}
