/**
 * Implementación nula del objeto `Auction` (Patrón Null Object).
 *
 * Esta clase representa una subasta inexistente dentro del dominio.
 * Se utiliza para evitar el uso de valores `null` o comprobaciones condicionales
 * en el código que manipula subastas.
 *
 * Todas las operaciones que intentan modificar su estado lanzan errores,
 * y los métodos de negocio retornan valores neutros.
 *
 * Ejemplo de uso:
 * const auction = repository.findById("123") ?? new NullAuction();
 * if (auction.isNull) console.log("Subasta no encontrada");
 */
import { Auction } from "./Auction";
import { Bid } from "./Bid";
import { Item } from "../../../inventory/domain/models/Item";
import { AuctionStatus } from "./AuctionStatus";

export default class NullAuction extends Auction {
  /**
   * Crea una instancia de `NullAuction` con datos predeterminados
   * que representan una subasta no encontrada.
   */
  constructor() {
    const nullItem: Item = {
      id: "not-found",
      userId: "not-found",
      name: "Not found in database",
      description: "Not found in database",
      type: "UNKNOWN",
      isAvailable: false,
      imagen: ""
    };

    super({
      id: "not-found",
      title: "Not found",
      description: "Not found",
      startingPrice: 0,
      currentPrice: 0,
      item: nullItem,
      buyNowPrice: 0,
      status: "UNKNOWN" as AuctionStatus,
      createdAt: new Date(),
      bids: [] as Bid[],
      highestBidderId: "0",
      endsAt: new Date()
    });

    this.isNull = true;
  }

  /**
   * Impide modificar el precio actual de la subasta nula.
   * @throws Error al intentar ejecutar el método.
   */
  override setCurrentPrice(_price: number): void {
    throw new Error("Cannot modify NullAuction");
  }

  /**
   * Impide modificar el precio de compra inmediata.
   * @throws Error al intentar ejecutar el método.
   */
  override setBuyNowPrice(_price: number | undefined): void {
    throw new Error("Cannot modify NullAuction");
  }

  /**
   * Impide modificar el estado de la subasta.
   * @throws Error al intentar ejecutar el método.
   */
  override setStatus(_status: AuctionStatus): void {
    throw new Error("Cannot modify NullAuction");
  }

  /**
   * Impide modificar la lista de pujas.
   * @throws Error al intentar ejecutar el método.
   */
  override setBids(_bids: Bid[]): void {
    throw new Error("Cannot modify NullAuction");
  }

  /**
   * Impide modificar el identificador del postor más alto.
   * @throws Error al intentar ejecutar el método.
   */
  override setHighestBidderId(_id: string | undefined): void {
    throw new Error("Cannot modify NullAuction");
  }

  /**
   * Impide registrar nuevas pujas en una subasta nula.
   * @returns Siempre `false`.
   */
  override placeBid(_bid: Bid): boolean {
    return false;
  }

  /**
   * Impide realizar compras inmediatas en una subasta nula.
   * @returns Siempre `false`.
   */
  override buyNow(_userId: string): boolean {
    return false;
  }

  /**
   * No realiza ninguna acción.
   * Método sobrescrito para cumplir la interfaz.
   */
  override markAsSold(_userId: string): void {
    // no hace nada
  }

  /**
   * No realiza ninguna acción.
   * Método sobrescrito para cumplir la interfaz.
   */
  override closeAsExpired(): void {
    // no hace nada
  }
}