import { Item } from "../../domain/models/Item";
import { ItemDto, UserItemsDto } from "../dto/ItemDto";

/**
 * Clase encargada de transformar objetos del dominio (`Item`)
 * a sus representaciones de transferencia de datos (`ItemDto`) y viceversa.
 */
export class ItemMapper {
  /**
   * Convierte un objeto del dominio `Item` a su representación `ItemDto`.
   * @param item Objeto de dominio a convertir.
   * @returns El objeto `ItemDto` correspondiente.
   */
  static toDto(item: Item): ItemDto {
    return {
      id: item.id,
      userId: item.userId.toString(),
      name: item.name,
      description: item.description,
      type: item.type,
      ...(item.heroType && { heroType: item.heroType }),
      isAvailable: item.isAvailable,
      imagen: item.imagen,
    };
  }

  /**
   * Convierte un objeto `ItemDto` en una instancia del dominio `Item`.
   * @param dto Objeto DTO a convertir.
   * @returns El objeto `Item` correspondiente.
   */
  static toDomain(dto: ItemDto): Item {
    return {
      id: dto.id,
      userId: dto.userId.toString(),
      name: dto.name,
      description: dto.description,
      type: dto.type,
      ...(dto.heroType && { heroType: dto.heroType }),
      isAvailable: dto.isAvailable,
      imagen: dto.imagen,
    };
  }

  /**
   * Convierte una lista de ítems de dominio en un objeto `UserItemsDto`
   * asociado a un usuario específico.
   * @param userId Identificador del usuario propietario.
   * @param items Lista de ítems del dominio.
   * @returns Objeto `UserItemsDto` con los ítems mapeados.
   */
  static toUserItemsDto(userId: string, items: Item[]): UserItemsDto {
    return {
      userId,
      items: items.map(this.toDto),
    };
  }
}