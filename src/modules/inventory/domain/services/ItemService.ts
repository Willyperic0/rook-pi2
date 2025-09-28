// src/inventory/domain/services/ItemService.ts
import { ItemRepository } from "../repositories/ItemRepository";
import { Item, ItemType } from "../models/Item";
import { IItemService } from "./IItemService";

export class ItemService implements IItemService {
  constructor(private readonly itemRepo: ItemRepository) {}

  // Ya no existe un findAll general, hay que obtener items por usuario
  async getAllItemsByUsername(username: string): Promise<Item[]> {
    return this.itemRepo.findByUserId(username);
  }

  // Ahora se requiere username, itemId y type
  async getItemById(username: string, itemId: string, type: ItemType): Promise<Item | null> {
    return this.itemRepo.findById(username, itemId, type);
  }

  // Método consistente para obtener todos los items de un usuario
  async getItemsByUsername(username: string): Promise<Item[]> {
    return this.itemRepo.findByUserId(username);
  }

  // Actualizar disponibilidad de un item
  async setItemAvailability(itemId: string, type: ItemType, isAvailable: boolean): Promise<Item> {
    return this.itemRepo.updateAvailability(itemId, isAvailable, type);
  }
}
