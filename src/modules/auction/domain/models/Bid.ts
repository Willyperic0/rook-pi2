/**
 * Representa una puja (oferta) realizada por un usuario en una subasta.
 *
 * Cada instancia de esta clase contiene la información básica de una oferta:
 * el identificador único, el usuario que ofertó, la subasta a la que pertenece,
 * el monto ofertado y la fecha en que fue realizada.
 *
 * Ejemplo de uso:
 * const bid = new Bid("b1", "user123", "auction456", 500);
 */
export class Bid {
  /**
   * Crea una nueva instancia de una puja.
   *
   * @param id - Identificador único de la puja.
   * @param userId - Identificador del usuario que realiza la puja.
   * @param auctionId - Identificador de la subasta a la que pertenece la puja.
   * @param amount - Monto ofertado por el usuario.
   * @param createdAt - Fecha y hora en que se realizó la puja (por defecto, la actual).
   */
  constructor(
    public id: string,
    public userId: string,
    public auctionId: string,
    public amount: number,
    public createdAt: Date = new Date()
  ) {}
}