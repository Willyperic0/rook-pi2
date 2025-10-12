import { Auction } from "../models/Auction";
import { AuctionStatus } from "../models/AuctionStatus";

/**
 * Define las operaciones que deben implementarse para gestionar
 * la persistencia y recuperación de las subastas en el sistema.
 *
 * Esta interfaz permite trabajar con diferentes fuentes de datos
 * (por ejemplo, bases de datos o almacenamiento en memoria)
 * sin afectar la lógica del dominio.
 *
 * Ejemplo de uso:
 * Una clase concreta puede implementar esta interfaz para definir
 * cómo se guardan y consultan las subastas:
 * class InMemoryAuctionRepository implements AuctionRepository { ... }
 */
export interface AuctionRepository {
  /**
   * Busca una subasta por su identificador único.
   *
   * @param id - Identificador de la subasta.
   * @returns Una promesa que resuelve la subasta encontrada o `null` si no existe.
   */
  findById(id: string): Promise<Auction | null>;

  /**
   * Guarda una nueva subasta en el repositorio.
   *
   * @param auction - Subasta que se desea guardar.
   * @returns Una promesa que se resuelve cuando la operación finaliza.
   */
  save(auction: Auction): Promise<void>;

  /**
   * Actualiza el estado de una subasta existente.
   *
   * @param id - Identificador de la subasta.
   * @param status - Nuevo estado que se asignará a la subasta.
   * @returns Una promesa que se resuelve al completar la actualización.
   */
  updateStatus(id: string, status: AuctionStatus): Promise<void>;

  /**
   * Obtiene todas las subastas que tengan un estado específico.
   *
   * @param status - Estado por el cual se filtrarán las subastas.
   * @returns Una promesa que resuelve una lista de subastas con ese estado.
   */
  findByStatus(status: AuctionStatus): Promise<Auction[]>;

  /**
   * Busca todas las subastas cerradas donde un usuario fue el comprador.
   *
   * @param userId - Identificador del comprador.
   * @returns Una promesa que resuelve una lista de subastas cerradas.
   */
  findClosedByBuyer(userId: string): Promise<Auction[]>;

  /**
   * Busca todas las subastas cerradas donde un usuario fue el vendedor.
   *
   * @param userId - Identificador del vendedor.
   * @returns Una promesa que resuelve una lista de subastas cerradas.
   */
  findClosedBySeller(userId: string): Promise<Auction[]>;
}