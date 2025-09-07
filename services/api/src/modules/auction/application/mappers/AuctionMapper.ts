// src/modules/auction/application/mappers/AuctionMapper.ts

import { Auction } from "../../domain/models/Auction";
import { AuctionDto } from "../dto/AuctionDto";
import { ItemMapper } from "../../../inventory/application/mappers/ItemMapper";

/**
 * Mapea entidades de dominio {@link Auction} a DTOs de aplicación {@link AuctionDto}.
 * @remarks
 * - Aísla cambios de forma entre dominio y transporte (API/UI).
 * - Calcula `endsAt` a partir de `createdAt` + `durationHours`.
 * - Evita incluir propiedades opcionales cuando no aplican (no asigna `undefined`).
 *
 * @typedoc
 * Este archivo está documentado con TSDoc y es compatible con TypeDoc:
 * agrega/ajusta tu `typedoc.json` (entryPoints: ["src"], out: "docs") para generar
 * documentación automática de esta API de mapeo.
 */
export class AuctionMapper {
  /**
   * Convierte una entidad de dominio {@link Auction} a su {@link AuctionDto} correspondiente.
   * @param auction Entidad de dominio a serializar.
   * @param durationHours Duración total de la subasta (en horas). Por defecto 24.
   * @returns Objeto plano listo para capa de aplicación/transporte.
   *
   * @remarks
   * - `buyNowEnabled` se deriva del estado `OPEN` y de la presencia de `buyNowPrice`.
   * - `highestBid` se toma de la última puja registrada (si existe).
   * - `highestBidderId` se obtiene con `auction.getWinnerId()` (si aplica).
   * - Solo se incluyen `buyNowPrice`, `highestBid` y `highestBidderId` cuando existen.
   *
   * @example
   * ```ts
   * const dto = AuctionMapper.toDto(auction, 48);
   * // dto.endsAt = createdAt + 48h
   * ```
   */
  static toDto(auction: Auction, durationHours: 24 | 48 = 24): AuctionDto {
    const endsAt = new Date(auction.createdAt.getTime() + durationHours * 60 * 60 * 1000);
    const lastBid = auction.bids.at(-1);

    const base = {
      id: auction.id,
      sellerId: auction.item.userId,
      itemId: auction.item.id,
      item: ItemMapper.toDto(auction.item),

      startingPrice: auction.startingPrice,
      currentPrice: auction.currentPrice,

      buyNowEnabled: auction.status === "OPEN" && auction.buyNowPrice !== undefined,

      createdAt: auction.createdAt.toISOString(),
      endsAt: endsAt.toISOString(),
      status: auction.status,

      bidsCount: auction.bids.length,
    } satisfies Omit<AuctionDto, "buyNowPrice" | "highestBid" | "highestBidderId">;

    return {
      ...base,

      // Solo agregamos si existe (evita asignar undefined)
      ...(auction.buyNowPrice !== undefined && { buyNowPrice: auction.buyNowPrice }),

      ...(lastBid !== undefined && {
        highestBid: {
          id: lastBid.id,
          auctionId: auction.id,
          userId: lastBid.userId,
          amount: lastBid.amount,
          timestamp: lastBid.createdAt.toISOString(),
        },
      }),

      ...(auction.getWinnerId() !== undefined && {
        highestBidderId: auction.getWinnerId()!,
      }),
    };
  }
}