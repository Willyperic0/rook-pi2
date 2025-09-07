// client/RookClient/frontend/src/domain/Auction.ts

// client/domain/Auction.ts
// client/domain/Auction.ts
import type { Item } from "./Item";

/**
 * DTO de lectura para subastas en el frontend.
 * @remarks
 * Representa la forma plana que consume la capa de UI. Se asume que el backend
 * ya normaliza relaciones (ej. `item`) y métricas agregadas (ej. `bidsCount`).
 *
 * @rubrica
 * - Calidad/Estructura: tipado explícito, campos opcionales marcados.
 * - Extensibilidad: admite `highestBid`, `highestBidderId` y `item` opcional.
 */
export interface AuctionDTO {
  /** Identificador único de la subasta. */
  id: number;
  /** Título visible (puede degradar al `item.name` en UI). */
  title: string;
  /** Descripción visible (puede degradar al `item.description`). */
  description: string;
  /** Precio inicial de partida. */
  startingPrice: number;
  /** Precio actual (derivado del mejor `Bid` o del base si no hay pujas). */
  currentPrice: number;
  /** Precio de compra inmediata (opcional; 0 o ausencia significa no disponible). */
  buyNowPrice?: number;
  /** Estado de la subasta (p. ej., OPEN, CLOSED, WON). */
  status: string;
  /** Fecha de creación (ISO). */
  createdAt: string;
  /** Fecha de cierre (ISO). */
  endsAt: string;
  /** Pujas registradas (si el backend las incluye). */
  bids: BidDTO[];
  /** Cantidad total de pujas. */
  bidsCount: number;
  /** La puja más alta (si existe). */
  highestBid?: BidDTO;
  /** Identificador del postor ganador si aplica. */
  highestBidderId?: number;

  /** Ítem subastado (puede omitirse si la vista lista campos mínimos). */
  item?: Item;
}

/**
 * DTO para una puja.
 * @remarks
 * Se mantiene flexible para mapear timestamps del backend (createdAt/timestamp).
 */
export interface BidDTO {
  /** Identificador único de la puja. */
  id: number;
  /** Subasta asociada. */
  auctionId: number;
  /** Usuario que ofertó. */
  userId: number;
  /** Monto ofertado. */
  amount: number;
  /** Fecha creada (ISO) si el backend la provee. */
  createdAt?: string;
  /** Alias/compatibilidad con otros nombres de timestamp del backend. */
  timestamp?: string;
}