// src/modules/auction/application/dto/BidDto.ts

/**
 * DTO que representa una puja en una subasta.
 */
export interface BidDto {
  /** Identificador único de la puja */
  id: number;

  /** ID de la subasta a la que pertenece */
  auctionId: number;

  /** ID del usuario que realiza la puja */
  userId: number;

  /** Cantidad ofertada */
  amount: number;

  /** Marca de tiempo en formato ISO (momento de la puja) */
  timestamp: string;
}