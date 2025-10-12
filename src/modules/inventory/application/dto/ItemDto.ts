import type { ItemType, HeroType } from "../../domain/models/Item";

/**
 * Representa la estructura de datos transferida (DTO)
 * para un ítem dentro del sistema de inventario.
 */
export interface ItemDto {
  /** Identificador único del ítem. */
  id: string;

  /** Identificador del usuario propietario del ítem. */
  userId: string;

  /** Nombre del ítem. */
  name: string;

  /** Descripción breve o detalle del ítem. */
  description: string;

  /** Tipo general del ítem (por ejemplo: "weapon", "armor", "skin"). */
  type: ItemType;

  /**
   * Tipo de héroe asociado al ítem, si aplica.
   * Puede no estar presente dependiendo del tipo de ítem.
   */
  heroType?: HeroType | undefined;

  /** Indica si el ítem está disponible para su uso o transacción. */
  isAvailable: boolean;

  /** URL o ruta de la imagen asociada al ítem. */
  imagen: string;
}

/**
 * Representa una colección de ítems pertenecientes a un usuario específico.
 */
export interface UserItemsDto {
  /** Identificador del usuario propietario de los ítems. */
  userId: string;

  /** Lista de ítems asociados al usuario. */
  items: ItemDto[];
}