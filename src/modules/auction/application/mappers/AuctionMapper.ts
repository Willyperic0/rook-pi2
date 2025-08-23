// src/application/mappers/AuctionMapper.ts
import { Auction } from "../../domain/models/Auction";
import { AuctionDto } from "../dto/AuctionDto";
import { ItemMapper } from "../../../inventory/application/mappers/ItemMapper";

export class AuctionMapper {
  static toDto(auction: Auction, durationHours: 24 | 48 = 24): AuctionDto {
    const endsAt = new Date(auction.createdAt.getTime() + durationHours * 60 * 60 * 1000);
    const lastBid = auction.bids.at(-1);

    const base = {
      id: auction.id,
      sellerId: auction.item.userId,
      itemId: auction.item.id,
      item: ItemMapper.toDto(auction.item),

      startingPrice: auction.startingPrice,
      currentPrice: auction.currentPrice,

      buyNowEnabled: auction.status === "OPEN" && auction.buyNowPrice !== undefined,

      createdAt: auction.createdAt.toISOString(),
      endsAt: endsAt.toISOString(),
      status: auction.status,

      bidsCount: auction.bids.length,
    } satisfies Omit<AuctionDto, "buyNowPrice" | "highestBid" | "highestBidderId">;

    return {
      ...base,

      // solo agregamos si existe (evita asignar undefined)
      ...(auction.buyNowPrice !== undefined && { buyNowPrice: auction.buyNowPrice }),

      ...(lastBid !== undefined && {
        highestBid: {
          id: lastBid.id,
          auctionId: auction.id,
          userId: lastBid.userId,
          amount: lastBid.amount,
          timestamp: lastBid.createdAt.toISOString(),
        },
      }),

      ...(auction.getWinnerId() !== undefined && {
        highestBidderId: auction.getWinnerId()!,
      }),
    };
  }
}

