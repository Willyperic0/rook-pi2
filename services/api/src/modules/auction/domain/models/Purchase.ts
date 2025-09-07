// src/modules/auction/domain/models/Purchase.ts

/**
 * Entidad simple para registrar una compra concretada.
 * @remarks
 * Útil si se requiere persistir auditoría/ledger de ventas.
 */
export class Purchase {
  /**
   * @param id Identificador de la compra
   * @param userId Comprador
   * @param auctionId Subasta asociada
   * @param price Precio final (buy now o puja ganadora)
   * @param createdAt Fecha de registro (por defecto ahora)
   */
  constructor(
    public id: string,
    public userId: string,
    public auctionId: string,
    public price: number,
    public createdAt: Date = new Date()
  ) {}
}