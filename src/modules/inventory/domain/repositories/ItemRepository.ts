import { Item } from "../models/Item";

export interface ItemRepository {
  findById(id: number): Promise<Item | null>;
  findAll(): Promise<Item[]>;
  findByUserId(userId: number): Promise<Item[]>;
  updateAvailability(id: number, isAvailable: boolean): Promise<Item>;
}
  