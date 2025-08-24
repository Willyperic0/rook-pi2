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
}
