import { Auction } from "../../domain/models/Auction";
import { AuctionRepository } from "../../domain/repositories/AuctionRepository";
import { AuctionStatus } from "../../domain/models/AuctionStatus";

/**
 * Implementación en memoria del repositorio de subastas.
 * 
 * Esta clase permite almacenar y gestionar subastas sin necesidad
 * de una base de datos, siendo ideal para pruebas o entornos de desarrollo.
 * 
 * Internamente mantiene una lista de subastas en un arreglo
 * y aplica filtros o búsquedas sobre él.
 */
export class InMemoryAuctionRepository implements AuctionRepository {
  /** Lista interna donde se almacenan las subastas en memoria. */
  private auctions: Auction[] = [];

  /**
   * Busca una subasta por su identificador único.
   *
   * @param id - Identificador de la subasta.
   * @returns Una promesa que resuelve la subasta encontrada o `null` si no existe.
   */
  async findById(id: string): Promise<Auction | null> {
    return this.auctions.find(a => a.getId() === id) || null;
  }

  /**
   * Guarda una subasta en memoria. Si ya existe una subasta con el mismo ID,
   * la reemplaza por la nueva versión.
   *
   * @param auction - Subasta que se desea guardar o actualizar.
   * @returns Una promesa que se resuelve al completar la operación.
   */
  async save(auction: Auction): Promise<void> {
    const index = this.auctions.findIndex(a => a.getId() === auction.getId());
    if (index === -1) {
      this.auctions.push(auction);
    } else {
      this.auctions[index] = auction;
    }
  }

  /**
   * Actualiza el estado de una subasta existente en memoria.
   *
   * @param id - Identificador de la subasta.
   * @param status - Nuevo estado a asignar.
   * @returns Una promesa que se resuelve cuando la actualización finaliza.
   */
  async updateStatus(id: string, status: AuctionStatus): Promise<void> {
    const auction = await this.findById(id);
    if (auction) auction.setStatus(status);
  }

  /**
   * Obtiene todas las subastas que coincidan con un estado determinado.
   *
   * @param status - Estado por el cual se filtrarán las subastas.
   * @returns Una promesa que resuelve un arreglo con las subastas filtradas.
   */
  async findByStatus(status: AuctionStatus): Promise<Auction[]> {
    return this.auctions.filter(a => a.getStatus() === status);
  }

  /**
   * Busca todas las subastas cerradas donde un usuario fue el comprador.
   *
   * Se considera comprador al usuario que realizó la puja más alta.
   *
   * @param userId - Identificador del comprador.
   * @returns Una promesa que resuelve con las subastas cerradas del comprador.
   */
  async findClosedByBuyer(userId: string): Promise<Auction[]> {
    return this.auctions.filter(
      a =>
        (a.getStatus() === "CLOSED" || a.getStatus() === "closed") &&
        a.getHighestBidderId() !== undefined &&
        a.getHighestBidderId() === userId
    );
  }

  /**
   * Busca todas las subastas cerradas donde un usuario fue el vendedor.
   *
   * Se considera vendedor al usuario que creó o posee la subasta.
   *
   * @param userId - Identificador del vendedor.
   * @returns Una promesa que resuelve con las subastas cerradas del vendedor.
   */
  async findClosedBySeller(userId: string): Promise<Auction[]> {
    return this.auctions.filter(
      a =>
        (a.getStatus() === "CLOSED" || a.getStatus() === "closed") &&
        a.getOwnerId() !== undefined &&
        a.getOwnerId() === userId
    );
  }
}