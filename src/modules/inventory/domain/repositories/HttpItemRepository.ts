import { ItemRepository } from "../../domain/repositories/ItemRepository";
import { Item } from "../../domain/models/Item";

export class HttpItemRepository implements ItemRepository {
  constructor(private readonly baseUrl: string) {}

  async findById(id: number): Promise<Item | null> {
    const res = await fetch(`${this.baseUrl}/items/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      userId: data.userId,
    } as Item;
  }

  async findAll(): Promise<Item[]> {
    const res = await fetch(`${this.baseUrl}/items`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      userId: d.userId,
    })) as Item[];
  }
}
