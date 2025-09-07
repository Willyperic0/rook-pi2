// src/modules/auction/domain/models/AuctionStatus.ts

/**
 * Estados posibles de una subasta.
 * @remarks
 * Se admiten variantes en mayúsculas y minúsculas para tolerancia con
 * datos externos. Considera normalizar a un solo casing en mappers/adaptadores.
 */
export type AuctionStatus =
  | "OPEN" | "SOLD" | "CANCELLED" | "EXPIRED" | "CLOSED"
  | "open" | "sold" | "cancelled" | "expired" | "closed";

/** Duración soportada de subastas, en horas. */
export type AuctionDurationHours = 24 | 48;
