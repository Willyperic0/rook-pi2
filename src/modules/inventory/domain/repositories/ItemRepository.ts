import { Item } from "../models/Item";

export interface ItemRepository {
  findById(id: number): Promise<Item | null>;
  findAll(): Promise<Item[]>; // nuevo método
}
