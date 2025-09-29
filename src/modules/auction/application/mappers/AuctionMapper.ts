// src/application/mappers/AuctionMapper.ts
import { Auction } from "../../domain/models/Auction";
import { AuctionDto } from "../dto/AuctionDto";
import { ItemMapper } from "../../../inventory/application/mappers/ItemMapper";

export class AuctionMapper {
  static toDto(auction: Auction): AuctionDto {
    const endsAt = auction.getEndsAt(); // 🔹 Usamos directamente el getter
    const lastBid = auction.getBids().at(-1);

    const base = {
      id: auction.getId(),
      sellerId: auction.getItem().userId,
      itemId: auction.getItem().id,
      item: ItemMapper.toDto(auction.getItem()),

      startingPrice: auction.getStartingPrice(),
      currentPrice: auction.getCurrentPrice(),

      buyNowEnabled: auction.getStatus() === "OPEN" && auction.getBuyNowPrice() !== undefined,

      createdAt: auction.getCreatedAt().toISOString(),
      endsAt: endsAt.toISOString(),
      status: auction.getStatus(),

      bidsCount: auction.getBids().length,
    } satisfies Omit<AuctionDto, "buyNowPrice" | "highestBid" | "highestBidderId">;

    return {
      ...base,

      // solo agregamos si existe (evita asignar undefined)
      ...(auction.getBuyNowPrice() !== undefined && { buyNowPrice: auction.getBuyNowPrice() }),

      ...(lastBid !== undefined && {
        highestBid: {
          id: lastBid.id,
          auctionId: auction.getId(),
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
