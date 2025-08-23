// src/inventory/domain/repositories/ItemRepository.ts
import { Item } from "../models/Item";

export interface ItemRepository {
  findById(id: number): Promise<Item | null>;
}
