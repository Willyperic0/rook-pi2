import { ItemRepository } from "../../../inventory/domain/repositories/ItemRepository";
import { Item } from "../../../inventory/domain/models/Item";

export class ItemService {
  constructor(private readonly itemRepository: ItemRepository) {}

  async getItemById(id: number): Promise<Item | null> {
    return await this.itemRepository.findById(id);
  }

  async getAllItems(): Promise<Item[]> {
    return await this.itemRepository.findAll();
  }
}
