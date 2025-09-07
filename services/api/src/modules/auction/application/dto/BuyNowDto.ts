// src/modules/auction/application/dto/BuyNowDto.ts

/**
 * DTOs para la acción de "Compra Inmediata" (Buy Now).
 */

/** Datos de entrada al ejecutar Buy Now */
export interface BuyNowInputDto {
  /** ID de la subasta objetivo */
  auctionId: number;

  /** ID del comprador */
  buyerId: number;
}

/** Datos de salida al ejecutar Buy Now */
export interface BuyNowOutputDto {
  /** ID de la subasta */
  auctionId: number;

  /** Precio final de venta (igual a buyNowPrice) */
  soldPrice: number;

  /** ID del comprador */
  buyerId: number;

  /** Fecha/hora en la que se efectuó la compra */
  soldAt: string;

  /** Estado final de la subasta tras la compra inmediata */
  status: "SOLD";
}