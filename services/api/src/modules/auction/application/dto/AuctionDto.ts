// src/modules/auction/application/dto/AuctionDto.ts

/**
 * DTO principal que representa una subasta.
 * Se utiliza para transferir datos entre capas de aplicación e infraestructura.
 */
import { BidDto } from "./BidDto";
import { AuctionStatus } from "../../domain/models/AuctionStatus";
import { ItemDto } from "../../../inventory/application/dto/ItemDto";

export interface AuctionDto {
  /** Identificador único de la subasta */
  id: number;

  /** ID del ítem subastado */
  itemId: number;

  /** ID del vendedor (userId) */
  sellerId: number;

  /** Precio inicial definido por el vendedor */
  startingPrice: number;

  /** Precio actual (puja más alta registrada) */
  currentPrice: number;

  // --- Compra inmediata (Buy Now) ---

  /** Precio de compra inmediata, si existe */
  buyNowPrice?: number;

  /** Indica si la opción de compra inmediata está habilitada */
  buyNowEnabled: boolean;

  /** Fecha/hora de creación en formato ISO */
  createdAt: string;

  /** Fecha/hora de finalización en formato ISO */
  endsAt: string;

  /** Estado actual de la subasta */
  status: AuctionStatus;

  /** Puja más alta (si existe) */
  highestBid?: BidDto;

  /** Número total de pujas recibidas */
  bidsCount: number;

  /** ID del usuario con la puja más alta */
  highestBidderId?: number;

  /** Información del ítem asociado */
  item: ItemDto;
}