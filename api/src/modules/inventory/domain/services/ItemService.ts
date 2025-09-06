// src/inventory/domain/services/ItemService.ts
import { ItemRepository } from "../repositories/ItemRepository";
import { Item } from "../models/Item";

export class ItemService {
  constructor(private readonly itemRepo: ItemRepository) {}

  async getAllItems(): Promise<Item[]> {
    return this.itemRepo.findAll();
  }

  async getItemById(id: number): Promise<Item | null> {
    return this.itemRepo.findById(id);
  }

  async getItemsByUserId(userId: number): Promise<Item[]> {
    return this.itemRepo.findByUserId(userId);
  }
}
