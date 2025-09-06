import { BidDto } from "./BidDto";
import { AuctionStatus } from "../../domain/models/AuctionStatus";
import { ItemDto } from "../../../inventory/application/dto/ItemDto";
export interface AuctionDto {
  id: number;
  itemId: number;
  sellerId: number;

  startingPrice: number;      // precio base
  currentPrice: number;       // precio actual (máxima puja)

  // --- Compra inmediata (Buy Now) ---
  buyNowPrice?: number;       // si existe, hay compra inmediata
  buyNowEnabled: boolean;     // true mientras esté disponible

  createdAt: string;          // ISO
  endsAt: string;             // ISO
  status: AuctionStatus;

  highestBid?: BidDto;
  bidsCount: number;
  highestBidderId?: number | undefined;

  item: ItemDto
}
