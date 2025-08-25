import axios from "axios"; 
import { Item } from "../models/Item";
import { ItemRepository } from "../../domain/repositories/ItemRepository";

export class HttpItemRepository implements ItemRepository {
  constructor(private readonly baseUrl: string) {}

  async findById(id: number): Promise<Item | null> {
    try {
      const res = await axios.get<Item>(`${this.baseUrl}/items/${id}`);
      return res.data;
    } catch {
      return null;
    }
  }

  async findAll(): Promise<Item[]> {
    const res = await axios.get<Item[]>(`${this.baseUrl}/items`);
    return res.data;
  }

  async findByUserId(userId: number): Promise<Item[]> {
    const res = await axios.get<Item[]>(`${this.baseUrl}/items?userId=${userId}`);
    return res.data;
  }

  // Ya no se usa este update genérico
  // async update(id: number, item: Partial<Item>): Promise<Item> {
  //   const res = await axios.put<Item>(`${this.baseUrl}/items/${id}`, item);
  //   return res.data;
  // }
  // Actualiza propiedades arbitrarias del item
async updateItem(id: number, data: Partial<Item>): Promise<Item> {
  const res = await axios.put<Item>(`${this.baseUrl}/items/${id}`, data);
  return res.data;
}

  // Actualiza solo disponibilidad usando PATCH
  async updateAvailability(id: number, isAvailable: boolean): Promise<Item> {
    const res = await axios.patch<Item>(`${this.baseUrl}/items/${id}/availability`, { isAvailable });
    return res.data;
  }
}
