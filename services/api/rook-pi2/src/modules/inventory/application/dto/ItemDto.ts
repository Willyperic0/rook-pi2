// inventory/application/dto/ItemDTO.ts
import type { ItemType, HeroType } from "../../domain/models/Item";

export interface ItemDto {
  id: number;
  userId: number;
  name: string;
  description: string;
  type: ItemType;
  heroType?: HeroType | undefined; // 👈 IMPORTANTE
  isAvailable: boolean;
  imagen: string;
}

export interface UserItemsDto {
  userId: number;
  items: ItemDto[];
}
