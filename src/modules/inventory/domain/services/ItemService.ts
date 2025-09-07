// src/inventory/domain/services/ItemService.ts
import { ItemRepository } from "../repositories/ItemRepository";
import { Item } from "../models/Item";
import { IItemService } from "./IItemService";
export class ItemService implements IItemService {
  constructor(private readonly itemRepo: ItemRepository) {}

  async getAllItems(): Promise<Item[]> {
    return this.itemRepo.findAll();
  }

  async getItemById(id: string): Promise<Item | null> {
    return this.itemRepo.findById(id);
  }

  async getItemsByUserId(userId: string): Promise<Item[]> {
    return this.itemRepo.findByUserId(userId);
  }
}
