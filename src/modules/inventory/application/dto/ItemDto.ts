// inventory/application/dto/ItemDTO.ts
import type { ItemType, HeroType } from "../../domain/models/Item";

export interface ItemDto {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: ItemType;
  heroType?: HeroType | undefined; // 👈 IMPORTANTE
  isAvailable: boolean;
  imagen: string;
}

export interface UserItemsDto {
  userId: string;
  items: ItemDto[];
}
