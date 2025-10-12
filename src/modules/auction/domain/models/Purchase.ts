/**
 * Representa una compra realizada dentro del sistema de subastas.
 *
 * Una instancia de esta clase contiene la información básica sobre
 * una compra efectuada, incluyendo el identificador del usuario,
 * la subasta de origen, el precio final y la fecha de creación.
 *
 * Ejemplo de uso:
 * const purchase = new Purchase("p1", "user123", "auction456", 1200);
 */
export class Purchase {
  /**
   * Crea una nueva instancia de `Purchase`.
   *
   * @param id - Identificador único de la compra.
   * @param userId - Identificador del usuario que realiza la compra.
   * @param auctionId - Identificador de la subasta asociada.
   * @param price - Precio final de la compra.
   * @param createdAt - Fecha y hora en que se realizó la compra (por defecto, la actual).
   */
  constructor(
    public id: string,
    public userId: string,
    public auctionId: string,
    public price: number,
    public createdAt: Date = new Date()
  ) {}
}