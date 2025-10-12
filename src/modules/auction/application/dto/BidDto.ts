/**
 * Data Transfer Object (DTO) que representa una puja dentro de una subasta.
 * Contiene los datos esenciales asociados a una oferta realizada por un usuario.
 *
 * @interface BidDto
 */
export interface BidDto {
  /**
   * Identificador único de la puja.
   * @type {string}
   */
  id: string;

  /**
   * Identificador de la subasta a la cual pertenece la puja.
   * Permite relacionar la oferta con la subasta correspondiente.
   * @type {string}
   */
  auctionId: string;

  /**
   * Identificador del usuario que realizó la puja.
   * @type {string}
   */
  userId: string;

  /**
   * Monto ofrecido por el usuario en la puja.
   * Debe ser mayor o igual al precio actual de la subasta.
   * @type {number}
   */
  amount: number;

  /**
   * Fecha y hora en que se realizó la puja, en formato ISO 8601.
   * @example "2025-10-11T18:45:23.000Z"
   * @type {string}
   */
  timestamp: string;
}