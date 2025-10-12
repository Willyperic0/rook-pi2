import { BidDto } from "./BidDto";
import { AuctionStatus } from "../../domain/models/AuctionStatus";
import { ItemDto } from "../../../inventory/application/dto/ItemDto";

/**
 * Data Transfer Object (DTO) que representa una subasta.
 * Contiene toda la información necesaria para transportar datos entre capas
 * (por ejemplo, entre la capa de aplicación y la de presentación).
 *
 * @interface AuctionDto
 */
export interface AuctionDto {
  /**
   * Identificador único de la subasta.
   * @type {string}
   */
  id: string;

  /**
   * Identificador del ítem subastado.
   * Hace referencia al objeto dentro del inventario.
   * @type {string}
   */
  itemId: string;

  /**
   * Identificador del vendedor que creó la subasta.
   * @type {string}
   */
  sellerId: string;

  /**
   * Precio base o inicial de la subasta.
   * Representa el valor mínimo de partida.
   * @type {number}
   */
  startingPrice: number;

  /**
   * Precio actual de la subasta, correspondiente a la puja más alta.
   * @type {number}
   */
  currentPrice: number;

  // --- Compra inmediata (Buy Now) ---

  /**
   * Precio de compra inmediata.
   * Si está definido, los usuarios pueden comprar el ítem sin participar en la subasta.
   * @type {number | undefined}
   */
  buyNowPrice?: number | undefined;

  /**
   * Indica si la opción de compra inmediata está disponible.
   * @type {boolean}
   */
  buyNowEnabled: boolean;

  /**
   * Fecha de creación de la subasta, en formato ISO 8601.
   * @example "2025-10-11T15:30:00.000Z"
   * @type {string}
   */
  createdAt: string;

  /**
   * Fecha y hora de finalización de la subasta, en formato ISO 8601.
   * @example "2025-10-18T15:30:00.000Z"
   * @type {string}
   */
  endsAt: string;

  /**
   * Estado actual de la subasta.
   * Puede ser, por ejemplo: "OPEN", "CLOSED", "CANCELLED".
   * @type {AuctionStatus}
   */
  status: AuctionStatus;

  /**
   * Información de la puja más alta actual.
   * @type {BidDto | undefined}
   */
  highestBid?: BidDto;

  /**
   * Número total de pujas realizadas en la subasta.
   * @type {number}
   */
  bidsCount: number;

  /**
   * Identificador del usuario que realizó la puja más alta.
   * @type {string | undefined}
   */
  highestBidderId?: string | undefined;

  /**
   * Información completa del ítem asociado a la subasta.
   * @type {ItemDto}
   */
  item: ItemDto;
}