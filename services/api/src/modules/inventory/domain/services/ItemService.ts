// src/modules/inventory/domain/services/ItemService.ts

import { ItemRepository } from "../repositories/ItemRepository";
import { Item } from "../models/Item";

/**
 * Servicio de dominio para consulta de ítems.
 * @remarks
 * Orquesta casos de uso de lectura; delega persistencia al repositorio.
 */
export class ItemService {
  constructor(private readonly itemRepo: ItemRepository) {}

  /** Lista todos los ítems. */
  async getAllItems(): Promise<Item[]> {
    return this.itemRepo.findAll();
  }

  /** Obtiene un ítem por ID. */
  async getItemById(id: number): Promise<Item | null> {
    return this.itemRepo.findById(id);
  }

  /** Lista ítems de un usuario. */
  async getItemsByUserId(userId: number): Promise<Item[]> {
    return this.itemRepo.findByUserId(userId);
  }
}
