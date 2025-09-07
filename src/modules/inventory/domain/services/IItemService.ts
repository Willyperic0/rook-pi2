// src/inventory/domain/services/ItemService.ts
import { Item } from "../models/Item";

export interface IItemService {
  getAllItems(): Promise<Item[]>;

  getItemById(id: string): Promise<Item | null>;

  getItemsByUserId(userId: string): Promise<Item[]>;


  getItemById(id: string): Promise<Item | null>;

  getItemsByUserId(userId: string): Promise<Item[]>;
}
