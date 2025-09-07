// src/modules/inventory/domain/models/Item.ts

/** Lista permitida de tipos de ítem. */
export const ITEM_TYPES = [
  "Héroes",
  "Armas",
  "Armaduras",
  "Ítems",
  "Habilidades especiales",
  "Épicas",
] as const;
/** Tipo de ítem. */
export type ItemType = typeof ITEM_TYPES[number];

/** Lista permitida de tipos de héroe. */
export const HERO_TYPES = [
  "Guerrero Tanque",
  "Guerrero Armas",
  "Mago Fuego",
  "Mago Hielo",
  "Pícaro Veneno",
  "Pícaro Machete",
  "Chamán",
  "Médico",
] as const;
/** Tipo de héroe. */
export type HeroType = typeof HERO_TYPES[number];

/**
 * Entidad de dominio para ítems de inventario.
 * @remarks
 * No depende de IO ni frameworks. La validación adicional se realiza en servicios.
 */
export interface Item {
  /** Identificador único del ítem. */
  id: number;
  /** Propietario actual. */
  userId: number;
  /** Nombre visible. */
  name: string;
  /** Descripción visible. */
  description: string;
  /** Tipo del ítem. */
  type: ItemType;
  /** Requerido si `type === "Héroes"`. */
  heroType?: HeroType;
  /** `false` si está en subasta (no usable); `true` en caso contrario. */
  isAvailable: boolean;
  /** Imagen (base64 o data URL). */
  imagen: string;
}
