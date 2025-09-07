// src/modules/auction/application/dto/PlaceBidDto.ts

/**
 * DTOs para la acción de colocar una puja.
 */

/** Datos de entrada para colocar una puja */
export interface PlaceBidInputDto {
  /** ID de la subasta */
  auctionId: number;

  /** ID del usuario que puja */
  userId: number;

  /** Monto ofertado */
  amount: number;
}

/** Datos de salida tras colocar una puja */
export interface PlaceBidOutputDto {
  /** Subasta actualizada después de la puja */
  auction: import("./AuctionDto").AuctionDto;
}