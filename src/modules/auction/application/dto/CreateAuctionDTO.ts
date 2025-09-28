import { AuctionDto } from "./AuctionDto";
import { AuctionDurationHours } from "../../domain/models/AuctionStatus";

export interface CreateAuctionInputDTO {
  userId: string;                       // vendedor
  itemId: string;
  itemType?: string; // 👈 nuevo
  startingPrice: number;
  durationHours: AuctionDurationHours;  // 24 | 48
  buyNowPrice?: number;                 // opcional
  disableBuyNowOnFirstBid?: boolean;    // default: true
}

export interface CreateAuctionOutputDto {
  auction: AuctionDto;
}