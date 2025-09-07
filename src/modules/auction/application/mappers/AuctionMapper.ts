// src/application/mappers/AuctionMapper.ts
import { Auction } from "../../domain/models/Auction";
import { AuctionDto } from "../dto/AuctionDto";
import { ItemMapper } from "../../../inventory/application/mappers/ItemMapper";

export class AuctionMapper {
  static toDto(auction: Auction, durationHours: 24 | 48 = 24): AuctionDto {
    const endsAt = new Date(auction.getCreatedAt().getTime() + durationHours * 60 * 60 * 1000);
    const lastBid = auction.getBids().at(-1);

    const dto: AuctionDto = {
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
      // Asignación directa, que es más limpia y evita el error
      buyNowPrice: auction.getBuyNowPrice(),
      highestBidderId: auction.getWinnerId(),
    };

    // Usa un 'if' para las propiedades que son objetos complejos y que pueden no existir
    if (lastBid) {
      dto.highestBid = {
        id: lastBid.id,
        auctionId: auction.getId(),
        userId: lastBid.userId,
        amount: lastBid.amount,
        timestamp: lastBid.createdAt.toISOString(),
      };
    }

    return dto;
  }
}

