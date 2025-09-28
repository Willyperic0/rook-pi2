// src/inventory/domain/services/IItemService.ts
import { Item, ItemType } from "../models/Item";

export interface IItemService {
  // Obtener todos los items de un usuario específico
  getAllItemsByUsername(username: string): Promise<Item[]>;

  // Obtener un item específico de un usuario (ahora pide también type)
  getItemById(username: string, itemId: string, type: ItemType): Promise<Item | null>;

  // Obtener todos los items de un usuario (alternativa)
  getItemsByUsername(username: string): Promise<Item[]>;

  // Actualizar disponibilidad de un item
  setItemAvailability(itemId: string, type: ItemType, isAvailable: boolean): Promise<Item>;
}
