import { AuctionDto } from "./AuctionDto";
import { AuctionDurationHours } from "../../domain/models/AuctionStatus";

export interface CreateAuctionInputDTO {
  userId: number;                       // vendedor
  itemId: number;
  startingPrice: number;
  durationHours: AuctionDurationHours;  // 24 | 48
  buyNowPrice?: number;                 // opcional
  disableBuyNowOnFirstBid?: boolean;    // default: true
}

export interface CreateAuctionOutputDto {
  auction: AuctionDto;
}