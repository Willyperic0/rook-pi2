// src/modules/inventory/application/mappers/ItemMapper.ts

import { Item } from "../../domain/models/Item";
import { ItemDto, UserItemsDto } from "../dto/ItemDto";

/**
 * Mapeador entre entidad de dominio {@link Item} y DTO {@link ItemDto}.
 * @remarks
 * Aísla cambios de forma entre la capa de dominio y la de transporte.
 */
export class ItemMapper {
  /**
   * Convierte un {@link Item} de dominio a {@link ItemDto}.
   * @param item Entidad de dominio
   */
  static toDto(item: Item): ItemDto {
    return {
      id: item.id,
      userId: item.userId,
      name: item.name,
      description: item.description,
      type: item.type,
      ...(item.heroType && { heroType: item.heroType }), // evita undefined
      isAvailable: item.isAvailable,
      imagen: item.imagen,
    };
  }

  /**
   * Convierte un {@link ItemDto} a {@link Item} de dominio.
   * @param dto DTO de ítem
   */
  static toDomain(dto: ItemDto): Item {
    return {
      id: dto.id,
      userId: dto.userId,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      ...(dto.heroType && { heroType: dto.heroType }), // evita undefined
      isAvailable: dto.isAvailable,
      imagen: dto.imagen,
    };
  }

  /**
   * Construye un {@link UserItemsDto} a partir de un usuario e ítems.
   * @param userId Propietario
   * @param items Ítems de dominio
   */
  static toUserItemsDto(userId: number, items: Item[]): UserItemsDto {
    return {
      userId,
      items: items.map(this.toDto),
    };
  }
}
