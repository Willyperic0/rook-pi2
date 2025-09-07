// src/modules/inventory/application/dto/ItemDto.ts

// inventory/application/dto/ItemDTO.ts
import type { ItemType, HeroType } from "../../domain/models/Item";

/**
 * DTO de lectura/escritura para Items.
 * @remarks
 * Modelo plano interoperable con la capa de transporte (HTTP/WS).
 * No contiene lógica de negocio.
 *
 * @typedoc
 * TSDoc compatible con TypeDoc (inclúyelo en `entryPoints`).
 */
export interface ItemDto {
  /** Identificador único del ítem. */
  id: number;
  /** Propietario actual. */
  userId: number;
  /** Nombre visible. */
  name: string;
  /** Descripción visible. */
  description: string;
  /** Tipo de ítem (ver {@link ItemType}). */
  type: ItemType;
  /** Tipo de héroe (solo si `type === "Héroes"`). */
  heroType?: HeroType | undefined;
  /** Disponible para uso/venta (false si está en subasta). */
  isAvailable: boolean;
  /** Imagen en base64 o data URL. */
  imagen: string;
}

/**
 * DTO para listar ítems de un usuario.
 */
export interface UserItemsDto {
  /** Usuario propietario. */
  userId: number;
  /** Colección de ítems. */
  items: ItemDto[];
}
