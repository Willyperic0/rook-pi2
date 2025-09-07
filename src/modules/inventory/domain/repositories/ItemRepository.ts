import { Item } from "../models/Item";

export interface ItemRepository {
  findById(id: string): Promise<Item | null>;
  findAll(): Promise<Item[]>;
  findByUserId(userId: string): Promise<Item[]>;
  updateAvailability(id: string, isAvailable: boolean): Promise<Item>;
  updateItem(id: string, data: Partial<Item>): Promise<Item>;
}
  