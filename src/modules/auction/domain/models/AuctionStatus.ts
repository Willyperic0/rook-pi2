/**
 * Representa los posibles estados de una subasta dentro del sistema.
 *
 * Este tipo abarca tanto las variantes en mayúsculas como en minúsculas
 * para garantizar compatibilidad con diferentes fuentes de datos
 * (por ejemplo, bases de datos o APIs externas).
 *
 * Ejemplo de uso:
 * const status: AuctionStatus = "OPEN";
 */
export type AuctionStatus =
  | "OPEN"
  | "SOLD"
  | "CANCELLED"
  | "EXPIRED"
  | "CLOSED"
  | "open"
  | "sold"
  | "cancelled"
  | "expired"
  | "closed"
  | "UNKNOWN"
  | "unknown";

/**
 * Representa la duración predefinida de una subasta, expresada en horas.
 *
 * Actualmente, el sistema admite solo dos duraciones estándar:
 * - 24 horas (1 día)
 * - 48 horas (2 días)
 *
 * Ejemplo de uso:
 * const duration: AuctionDurationHours = 24;
 */
export type AuctionDurationHours = 24 | 48;