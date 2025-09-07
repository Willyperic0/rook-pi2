// src/modules/auction/domain/models/Auction.ts

import { Bid } from "./Bid";
import { Item } from "../../../inventory/domain/models/Item";
import { AuctionStatus } from "./AuctionStatus";

/**
 * Entidad de dominio que representa una subasta.
 * @remarks
 * - Mantiene invariantes de negocio: solo acepta pujas si está `OPEN` y la puja supera `currentPrice`.
 * - Expone operaciones de negocio: `placeBid`, `buyNow`, `markAsSold`, `closeAsExpired`.
 * - No depende de IO ni frameworks (regla de dominio puro).
 *
 * @typedoc
 * Documentado con TSDoc/TypeDoc. Agrega este archivo a `entryPoints` en `typedoc.json`
 * para generar documentación automática del modelo.
 */
export class Auction {
  /**
   * Crea una subasta.
   * @param id Identificador único
   * @param title Título visible
   * @param description Descripción
   * @param startingPrice Precio inicial
   * @param currentPrice Precio actual (se actualiza con cada puja válida)
   * @param item Ítem subastado
   * @param buyNowPrice Precio de compra inmediata (opcional)
   * @param status Estado inicial (por defecto `OPEN`)
   * @param createdAt Fecha de creación (por defecto ahora)
   * @param bids Historial de pujas (por defecto vacío)
   * @param highestBidderId Postor con la puja ganadora (si aplica)
   */
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public startingPrice: number,
    public currentPrice: number,
    public item: Item,
    public buyNowPrice?: number,
    public status: AuctionStatus = "OPEN",
    public createdAt: Date = new Date(),
    public bids: Bid[] = [],
    private highestBidderId?: number,
  ) {}

  /**
   * Intenta registrar una puja en la subasta.
   * @param bid Puja a colocar
   * @returns `true` si la puja fue aceptada; `false` en caso contrario
   * @remarks
   * - Rechaza si la subasta no está `OPEN`.
   * - Rechaza si el monto es menor al `currentPrice` vigente.
   * - En éxito, actualiza `currentPrice`, historial de `bids` y `highestBidderId`.
   */
  placeBid(bid: Bid): boolean {
    if (this.status !== "OPEN") return false;
    if (bid.amount < this.currentPrice) return false;

    this.currentPrice = bid.amount;
    this.bids.push(bid);
    this.highestBidderId = bid.userId;
    return true;
  }

  /** Marca la subasta como expirada. */
  closeAsExpired(): void {
    this.status = "EXPIRED";
  }

  /**
   * Marca la subasta como vendida a un usuario especificado.
   * @param userId ID del comprador ganador
   */
  markAsSold(userId: number): void {
    this.status = "SOLD";
    this.highestBidderId = userId;
  }

  /**
   * Ejecuta compra inmediata (buy now) si está habilitada.
   * @param userId ID del comprador
   * @returns `true` si se ejecutó; `false` si no aplica (sin precio o estado no `OPEN`)
   * @remarks
   * - En éxito, fija `currentPrice = buyNowPrice` y llama a `markAsSold(userId)`.
   */
  buyNow(userId: number): boolean {
    if (!this.buyNowPrice || this.status !== "OPEN") return false;
    this.currentPrice = this.buyNowPrice;
    this.markAsSold(userId);
    return true;
  }

  /** @returns ID del ganador (si existe). */
  getWinnerId(): number | undefined {
    return this.highestBidderId;
  }

  /** @returns ID del propietario del ítem (vendedor). */
  getOwnerId(): number | undefined {
    return this.item.userId;
  }

  /** @returns ID del mejor postor actual (si existe). */
  getHighestBidderId(): number | undefined {
    return this.highestBidderId;
  }
}