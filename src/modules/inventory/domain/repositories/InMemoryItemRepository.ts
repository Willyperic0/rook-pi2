// src/inventory/infrastructure/repositories/InMemoryItemRepository.ts
import { ItemRepository } from "../../domain/repositories/ItemRepository";
import { Item } from "../models/Item";

export class InMemoryItemRepository implements ItemRepository {
  private items: Item[];

  constructor(initialItems: Item[] = []) {
    this.items = initialItems;
  }

  async findById(id: number): Promise<Item | null> {
    const item = this.items.find((item) => item.id === id);
    return item ?? null;
  }

  // 🔹 Método auxiliar para agregar un item en memoria
  async save(item: Item): Promise<void> {
    this.items.push(item);
  }

  // 🔹 Método auxiliar para obtener todos los items (útil para debug)
  async findAll(): Promise<Item[]> {
    return this.items;
  }
}
