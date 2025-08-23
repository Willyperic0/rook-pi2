import { Item } from "../../domain/models/Item";
import { ItemDto, UserItemsDto } from "../dto/ItemDto";

export class ItemMapper {
  static toDto(item: Item): ItemDto {
    return {
      id: item.id,
      userId: item.userId,
      name: item.name,
      description: item.description,
    };
  }

  static toDomain(dto: ItemDto): Item {
    return {
      id: dto.id,
      userId: dto.userId,
      name: dto.name,
      description: dto.description,
    };
  }

  static toUserItemsDto(userId: number, items: Item[]): UserItemsDto {
    return {
      userId,
      items: items.map(this.toDto),
    };
  }
}
