// src/domain/models/NullAuction.ts
import { Auction } from "./Auction";
import { Bid } from "./Bid";
import { Item } from "../../../inventory/domain/models/Item";
import { AuctionStatus } from "./AuctionStatus";

export default class NullAuction extends Auction {
  constructor() {
    const nullItem: Item = {
      id: "not-found",
      userId: "not-found",
      name: "Not found in database",
      description: "Not found in database",
      type: "UNKNOWN",
      isAvailable: false,
      imagen: ""
    };
    super({
      id: "not-found",
      title: "Not found",
      description: "Not found",
      startingPrice: 0,
      currentPrice: 0,
      item: nullItem,
      buyNowPrice: 0,
      status: "UNKNOWN" as AuctionStatus,
      createdAt: new Date(),
      bids: [] as Bid[],
      highestBidderId: "0"
    });
    this.isNull = true;
  }

  // Sobrescribir setters y métodos que cambian estado
  override setCurrentPrice(_price: number): void {
    throw new Error("Cannot modify NullAuction");
  }

  override setBuyNowPrice(_price: number | undefined): void {
    throw new Error("Cannot modify NullAuction");
  }

  override setStatus(_status: AuctionStatus): void {
    throw new Error("Cannot modify NullAuction");
  }

  override setBids(_bids: Bid[]): void {
    throw new Error("Cannot modify NullAuction");
  }

  override setHighestBidderId(_id: string | undefined): void {
    throw new Error("Cannot modify NullAuction");
  }

  override placeBid(_bid: Bid): boolean {
    return false;
  }

  override buyNow(_userId: string): boolean {
    return false;
  }

  override markAsSold(_userId: string): void {
    // no hace nada
  }

  override closeAsExpired(): void {
    // no hace nada
  }
}
