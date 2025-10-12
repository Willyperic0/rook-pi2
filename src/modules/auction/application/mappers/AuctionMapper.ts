import { Auction } from "../../domain/models/Auction";
import { AuctionDto } from "../dto/AuctionDto";
import { ItemMapper } from "../../../inventory/application/mappers/ItemMapper";

/**
 * Mapper responsable de transformar objetos del dominio `Auction`
 * en objetos de transferencia de datos (`AuctionDto`).
 *
 * Esta clase actúa como un puente entre la capa de dominio y la capa de aplicación,
 * permitiendo exponer únicamente los datos necesarios sin filtrar lógica interna.
 *
 * @class AuctionMapper
 */
export class AuctionMapper {
  /**
   * Convierte una entidad de dominio `Auction` a su representación `AuctionDto`.
   * Incluye campos opcionales solo si existen y transforma objetos complejos
   * como `Item` mediante su mapper correspondiente.
   * 
   * @param auction Instancia de la subasta en el dominio
   * @returns DTO listo para exponer en la API o enviar entre microservicios
   * 
   * @example
   * const auctionDto = AuctionMapper.toDto(domainAuction)
   */
  static toDto(auction: Auction): AuctionDto {
    // Obtenemos la fecha de finalización mediante su getter.
    const endsAt = auction.getEndsAt();

    // Obtenemos la última puja registrada (la más alta).
    const lastBid = auction.getBids().at(-1);

    // Base del DTO sin campos opcionales.
    const base = {
      id: auction.getId(),
      sellerId: auction.getItem().userId,
      itemId: auction.getItem().id,
      item: ItemMapper.toDto(auction.getItem()),

      startingPrice: auction.getStartingPrice(),
      currentPrice: auction.getCurrentPrice(),

      // Compra inmediata habilitada si la subasta está abierta y tiene precio Buy Now.
      buyNowEnabled: auction.getStatus() === "OPEN" && auction.getBuyNowPrice() !== undefined,

      createdAt: auction.getCreatedAt().toISOString(),
      endsAt: endsAt.toISOString(),
      status: auction.getStatus(),

      bidsCount: auction.getBids().length,
    } satisfies Omit<AuctionDto, "buyNowPrice" | "highestBid" | "highestBidderId">;

    // Construcción final del DTO con campos opcionales añadidos solo si existen.
    return {
      ...base,

      // Agrega el precio de compra inmediata solo si fue definido.
      ...(auction.getBuyNowPrice() !== undefined && {
        buyNowPrice: auction.getBuyNowPrice(),
      }),

      // Agrega la puja más alta si existe al menos una.
      ...(lastBid !== undefined && {
        highestBid: {
          id: lastBid.id,
          auctionId: auction.getId(),
          userId: lastBid.userId,
          amount: lastBid.amount,
          timestamp: lastBid.createdAt.toISOString(),
        },
      }),

      // Agrega el ID del ganador (si existe).
      ...(auction.getWinnerId() !== undefined && {
        highestBidderId: auction.getWinnerId()!,
      }),
    };
  }
}