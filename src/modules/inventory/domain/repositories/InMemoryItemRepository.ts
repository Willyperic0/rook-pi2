// src/inventory/infrastructure/repositories/InMemoryItemRepository.ts
import { ItemRepository } from "../../domain/repositories/ItemRepository";
import { Item } from "../models/Item";

export class InMemoryItemRepository implements ItemRepository {
  private items: Item[];

  constructor(initialItems: Item[] = []) {
    this.items = initialItems;
  }

  /**
   * Buscar un item por su ID
   * @param id ID del item
   * @returns Item si existe, o null si no se encuentra
   */
  async findById(id: number): Promise<Item | null> {
    const item = this.items.find((item) => item.id === id);
    return item ?? null;
  }

  /**
   * Guardar un item en memoria
   * @param item Item a guardar
   */
  async save(item: Item): Promise<void> {
    this.items.push(item);
  }

  /**
   * Obtener todos los items en memoria
   * @returns Array de items
   */
  async findAll(): Promise<Item[]> {
    return this.items;
  }

  /**
   * Eliminar un item por su ID
   * @param id ID del item a eliminar
   */
  async deleteById(id: number): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
