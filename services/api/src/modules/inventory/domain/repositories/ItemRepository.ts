// src/modules/inventory/domain/repositories/ItemRepository.ts

import { Item } from "../models/Item";

/**
 * Puerto de persistencia para Items.
 * @remarks
 * Define operaciones requeridas por servicios de dominio, abstractas del mecanismo de almacenamiento.
 */
export interface ItemRepository {
  /** Obtiene un ítem por ID. */
  findById(id: number): Promise<Item | null>;

  /** Lista todos los ítems. */
  findAll(): Promise<Item[]>;

  /** Lista ítems de un usuario. */
  findByUserId(userId: number): Promise<Item[]>;

  /** Actualiza únicamente la disponibilidad del ítem. */
  updateAvailability(id: number, isAvailable: boolean): Promise<Item>;

  /** Actualiza propiedades arbitrarias del ítem. */
  updateItem(id: number, data: Partial<Item>): Promise<Item>;
}
