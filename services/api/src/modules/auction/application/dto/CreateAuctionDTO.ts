// src/modules/auction/application/dto/CreateAuctionDTO.ts

/**
 * DTOs para la creación de una subasta.
 */
import { AuctionDto } from "./AuctionDto";
import { AuctionDurationHours } from "../../domain/models/AuctionStatus";

/** Datos de entrada al crear una subasta */
export interface CreateAuctionInputDTO {
  /** ID del usuario que crea la subasta (vendedor) */
  userId: number;

  /** ID del ítem a subastar */
  itemId: number;

  /** Precio inicial de la subasta */
  startingPrice: number;

  /** Duración de la subasta en horas (24 o 48) */
  durationHours: AuctionDurationHours;

  /** Precio de compra inmediata (opcional) */
  buyNowPrice?: number;

  /**
   * Si se deshabilita la opción Buy Now en la primera puja.
   * Por defecto es true.
   */
  disableBuyNowOnFirstBid?: boolean;
}

/** Datos de salida al crear una subasta */
export interface CreateAuctionOutputDto {
  /** Subasta recién creada */
  auction: AuctionDto;
}