// src/modules/auction/domain/models/Bid.ts

/**
 * Entidad de dominio para una puja.
 * @remarks
 * Mantiene datos inmutables de la oferta; la validación de aceptación
 * ocurre en {@link Auction.placeBid}.
 */
export class Bid {
  /**
   * @param id Identificador de la puja
   * @param userId Usuario que oferta
   * @param auctionId Subasta objetivo
   * @param amount Monto ofertado
   * @param createdAt Fecha de creación (por defecto ahora)
   */
  constructor(
    public id: number,
    public userId: number,
    public auctionId: number,
    public amount: number,
    public createdAt: Date = new Date()
  ) {}
}