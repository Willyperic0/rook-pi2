import NullObject from "../../../../shared/base/domain/interfaces/NullObject";
import { Bid } from "./Bid";
import { Item } from "../../../inventory/domain/models/Item";
import { AuctionStatus } from "./AuctionStatus";

/**
 * Entidad del dominio que representa una subasta.
 * 
 * Contiene toda la lógica de negocio relacionada con las pujas,
 * el estado de la subasta, el manejo del precio actual y la opción de compra inmediata.
 * 
 * Implementa la interfaz `NullObject` para permitir patrones seguros de inicialización.
 *
 * @class Auction
 * @implements {NullObject}
 */
export class Auction implements NullObject {
  // ────────────────────────────────────────────────
  // Propiedades privadas
  // ────────────────────────────────────────────────
  private readonly id: string;
  private readonly title: string;
  private readonly description: string;
  private readonly startingPrice: number;
  private currentPrice: number;
  private readonly item: Item;
  private buyNowPrice: number | undefined;
  private status: AuctionStatus;
  private readonly createdAt: Date;
  private readonly endsAt: Date;
  private bids: Bid[];
  private highestBidderId: string | undefined;

  /** 
   * Indica si la instancia actual es un objeto nulo (Null Object Pattern).
   * @type {boolean}
   */
  isNull: boolean;

  /**
   * Crea una nueva instancia de `Auction`.
   *
   * @constructor
   * @param {AuctionInterface} AuctionInterface - Datos requeridos para inicializar la subasta.
   */
  constructor(AuctionInterface: AuctionInterface) {
    this.id = AuctionInterface.id;
    this.title = AuctionInterface.title;
    this.description = AuctionInterface.description;
    this.startingPrice = AuctionInterface.startingPrice;
    this.currentPrice = AuctionInterface.currentPrice;
    this.item = AuctionInterface.item;
    this.buyNowPrice = AuctionInterface.buyNowPrice;
    this.status = AuctionInterface.status;
    this.createdAt = AuctionInterface.createdAt;
    this.endsAt = AuctionInterface.endsAt;
    this.bids = AuctionInterface.bids;
    this.highestBidderId = AuctionInterface.highestBidderId;
    this.isNull = false;
  }

  // ────────────────────────────────────────────────
  // Getters
  // ────────────────────────────────────────────────

  /** @returns {string} Identificador único de la subasta. */
  getId(): string { return this.id; }

  /** @returns {string} Título descriptivo de la subasta. */
  getTitle(): string { return this.title; }

  /** @returns {string} Descripción detallada del ítem subastado. */
  getDescription(): string { return this.description; }

  /** @returns {number} Precio base o inicial de la subasta. */
  getStartingPrice(): number { return this.startingPrice; }

  /** @returns {number} Precio actual (puja más alta). */
  getCurrentPrice(): number { return this.currentPrice; }

  /** @returns {Item} Ítem asociado a la subasta. */
  getItem(): Item { return this.item; }

  /** @returns {number | undefined} Precio de compra inmediata, si aplica. */
  getBuyNowPrice(): number | undefined { return this.buyNowPrice; }

  /** @returns {AuctionStatus} Estado actual de la subasta. */
  getStatus(): AuctionStatus { return this.status; }

  /** @returns {Date} Fecha de creación de la subasta. */
  getCreatedAt(): Date { return this.createdAt; }

  /** @returns {Bid[]} Lista de pujas registradas. */
  getBids(): Bid[] { return this.bids; }

  /** @returns {string | undefined} ID del usuario con la puja más alta. */
  getHighestBidderId(): string | undefined { return this.highestBidderId; }

  /** @returns {Date} Fecha de finalización de la subasta. */
  getEndsAt(): Date { return this.endsAt; }

  /** @returns {string} ID del propietario (vendedor) del ítem subastado. */
  getOwnerId(): string { return this.item.userId; }

  /** @returns {string | undefined} ID del ganador de la subasta, si existe. */
  getWinnerId(): string | undefined { return this.highestBidderId; }

  // ────────────────────────────────────────────────
  // Setters
  // ────────────────────────────────────────────────

  /**
   * Actualiza el precio actual de la subasta.
   * 
   * @param {number} price - Nuevo precio actual.
   * @throws {Error} Si el precio es negativo.
   */
  setCurrentPrice(price: number): void {
    if (price < 0) throw new Error("El precio no puede ser negativo");
    this.currentPrice = price;
  }

  /**
   * Define o elimina el precio de compra inmediata.
   * 
   * @param {number | undefined} price - Precio de compra inmediata o `undefined` para eliminarlo.
   * @throws {Error} Si el precio es negativo.
   */
  setBuyNowPrice(price: number | undefined): void {
    if (price !== undefined && price < 0) {
      throw new Error("El precio de compra rápida no puede ser negativo");
    }
    this.buyNowPrice = price;
  }

  /**
   * Actualiza el estado de la subasta.
   * @param {AuctionStatus} status - Nuevo estado de la subasta.
   */
  setStatus(status: AuctionStatus): void { this.status = status; }

  /**
   * Reemplaza el conjunto completo de pujas.
   * @param {Bid[]} bids - Lista de pujas a establecer.
   */
  setBids(bids: Bid[]): void { this.bids = bids; }

  /**
   * Define el identificador del postor con la puja más alta.
   * @param {string | undefined} id - ID del postor o `undefined`.
   */
  setHighestBidderId(id: string | undefined): void { this.highestBidderId = id; }

  // ────────────────────────────────────────────────
  // Lógica de negocio
  // ────────────────────────────────────────────────

  /**
   * Registra una nueva puja en la subasta.
   * 
   * @param {Bid} bid - Objeto de puja a registrar.
   * @returns {boolean} `true` si la puja fue aceptada, `false` en caso contrario.
   * @throws {Error} Si la puja no tiene un `userId` válido.
   */
  placeBid(bid: Bid): boolean {
    if (this.status !== "OPEN") return false;
    if (bid.amount < this.currentPrice) return false;
    if (!bid.userId) throw new Error("Bid debe tener un userId válido");

    this.currentPrice = bid.amount;
    this.bids.push(bid);
    this.highestBidderId = bid.userId;
    return true;
  }

  /**
   * Marca la subasta como expirada por haber alcanzado su fecha límite.
   */
  closeAsExpired(): void { this.status = "EXPIRED"; }

  /**
   * Marca la subasta como vendida y asigna el ID del comprador.
   * @param {string} userId - ID del usuario que ganó la subasta.
   */
  markAsSold(userId: string): void {
    this.status = "SOLD";
    this.highestBidderId = userId;
  }

  /**
   * Ejecuta la compra inmediata del ítem, si está disponible.
   * 
   * @param {string} userId - ID del usuario que realiza la compra inmediata.
   * @returns {boolean} `true` si la compra se completó, `false` si no era posible.
   */
  buyNow(userId: string): boolean {
    if (this.buyNowPrice === undefined || this.status !== "OPEN") return false;
    this.currentPrice = this.buyNowPrice;
    this.markAsSold(userId);
    return true;
  }
}

/**
 * Interfaz que define la estructura necesaria para instanciar una subasta.
 * Se utiliza para inicializar la entidad `Auction` de forma tipada.
 *
 * @interface AuctionInterface
 */
export interface AuctionInterface {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  item: Item;
  buyNowPrice: number | undefined;
  status: AuctionStatus;
  createdAt: Date;
  endsAt: Date;
  bids: Bid[];
  highestBidderId: string | undefined;
}