import { Item } from "../models/Item";
import { ItemRepository } from "../../domain/repositories/ItemRepository";

export class InMemoryItemRepository implements ItemRepository {
  private items: Item[];

  constructor(initialItems: Item[] = []) {
    this.items = initialItems;
  }

  async findById(id: number): Promise<Item | null> {
    const item = this.items.find((item) => item.id === id);
    return item ?? null;
  }

  async save(item: Item): Promise<void> {
    this.items.push(item);
  }

  async findAll(): Promise<Item[]> {
    return this.items;
  }

  async deleteById(id: number): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }

  async findByUserId(userId: number): Promise<Item[]> {
    return this.items.filter((item) => item.userId === userId);
  }

  async update(id: number, updates: Partial<Item>): Promise<Item> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Item not found");
    }

    const updated = {
      ...this.items[index],
      ...updates,
    } as Item;

    this.items[index] = updated;
    return updated;
  }

  // Método específico para actualizar disponibilidad
  async updateAvailability(id: number, isAvailable: boolean): Promise<Item> {
    try {
      const updated = await this.update(id, { isAvailable });
      console.log("[ITEM REPO] Item availability updated:", updated);
      return updated;
    } catch (err) {
      console.error("[ITEM REPO] Error updating item availability:", err);
      throw err;
    }
  }

  // Nuevo método genérico para actualizar cualquier propiedad del item
  async updateItem(id: number, updates: Partial<Item>): Promise<Item> {
    try {
      const updated = await this.update(id, updates);
      console.log("[ITEM REPO] Item updated:", updated);
      return updated;
    } catch (err) {
      console.error("[ITEM REPO] Error updating item:", err);
      throw err;
    }
  }
}



