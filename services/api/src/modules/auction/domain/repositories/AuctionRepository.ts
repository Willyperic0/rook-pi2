// src/modules/auction/domain/repositories/AuctionRepository.ts

import { Auction } from "../models/Auction";
import { AuctionStatus } from "../models/AuctionStatus";

/**
 * Puerto de persistencia para subastas.
 * @remarks
 * Define las operaciones que la capa de dominio requiere para gestionar
 * subastas, independiente del mecanismo de almacenamiento (memoria, DB, etc.).
 */
export interface AuctionRepository {
  /** Busca una subasta por ID. */
  findById(id: number): Promise<Auction | null>;

  /** Crea o actualiza una subasta. */
  save(auction: Auction): Promise<void>;

  /** Actualiza únicamente el estado de una subasta. */
  updateStatus(id: number, status: AuctionStatus): Promise<void>;

  /** Lista subastas por estado. */
  findByStatus(status: AuctionStatus): Promise<Auction[]>;

  /** Lista subastas cerradas donde el comprador coincide. */
  findClosedByBuyer(userId: number): Promise<Auction[]>;

  /** Lista subastas cerradas donde el vendedor coincide. */
  findClosedBySeller(userId: number): Promise<Auction[]>;
}