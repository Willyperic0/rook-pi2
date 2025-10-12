import { AuctionDto } from "./AuctionDto";
import { AuctionDurationHours } from "../../domain/models/AuctionStatus";

/**
 * Data Transfer Object (DTO) que representa los datos de entrada
 * necesarios para crear una nueva subasta.
 *
 * @interface CreateAuctionInputDTO
 */
export interface CreateAuctionInputDTO {
  /**
   * Identificador del usuario que crea la subasta.
   * Corresponde al vendedor del ítem.
   * @type {string}
   */
  userId: string;

  /**
   * Identificador del ítem que será subastado.
   * @type {string}
   */
  itemId: string;

  /**
   * Tipo de ítem que se subasta.
   * Campo opcional que puede ser útil para categorizar ítems (ej. “car”, “painting”, “collectible”).
   * @type {string | undefined}
   */
  itemType?: string;

  /**
   * Precio inicial o base de la subasta.
   * Representa el valor mínimo de partida.
   * @type {number}
   */
  startingPrice: number;

  /**
   * Duración total de la subasta expresada en horas.
   * Valores permitidos: 24 o 48.
   * @type {AuctionDurationHours}
   * @example 24
   * @example 48
   */
  durationHours: AuctionDurationHours;

  /**
   * Precio de compra inmediata.
   * Si se define, los usuarios pueden comprar el ítem sin esperar al final de la subasta.
   * @type {number | undefined}
   */
  buyNowPrice?: number;

  /**
   * Indica si la opción de compra inmediata debe deshabilitarse al recibir la primera puja.
   * Por defecto es `true`.
   * @type {boolean | undefined}
   * @default true
   */
  disableBuyNowOnFirstBid?: boolean;
}

/**
 * Data Transfer Object (DTO) que representa la respuesta al crear una nueva subasta.
 *
 * @interface CreateAuctionOutputDto
 */
export interface CreateAuctionOutputDto {
  /**
   * Objeto que contiene toda la información de la subasta recién creada.
   * @type {AuctionDto}
   */
  auction: AuctionDto;
}