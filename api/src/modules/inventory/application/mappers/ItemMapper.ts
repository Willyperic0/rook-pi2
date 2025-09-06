import { Item } from "../../domain/models/Item";
import { ItemDto, UserItemsDto } from "../dto/ItemDto";

export class ItemMapper {
  static toDto(item: Item): ItemDto {
    return {
      id: item.id,
      userId: item.userId,
      name: item.name,
      description: item.description,
      type: item.type,
      ...(item.heroType && { heroType: item.heroType }), // 👈 así no te fuerza undefined
      isAvailable: item.isAvailable,
      imagen: item.imagen,
    };
  }

  static toDomain(dto: ItemDto): Item {
    return {
      id: dto.id,
      userId: dto.userId,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      ...(dto.heroType && { heroType: dto.heroType }), // 👈 igual aquí
      isAvailable: dto.isAvailable,
      imagen: dto.imagen,
    };
  }

  static toUserItemsDto(userId: number, items: Item[]): UserItemsDto {
    return {
      userId,
      items: items.map(this.toDto),
    };
  }
}

