/**
 * Lista de tipos posibles de ítems dentro del inventario.
 */
export const ITEM_TYPES = [
  "Héroes",
  "Armas",
  "Armaduras",
  "Ítems",
  "Habilidades especiales",
  "Épicas",
  "UNKNOWN"
] as const;

/**
 * Tipo que representa los valores válidos para un tipo de ítem.
 */
export type ItemType = typeof ITEM_TYPES[number];

/**
 * Lista de tipos de héroes disponibles.
 */
export const HERO_TYPES = [
  "TANK",
  "WEAPONS_PAL",
  "FIRE_MAGE",
  "ICE_MAGE",
  "POISON_ROGUE",
  "SHAMAN",
  "MEDIC",
  "MACHETE",
  "UNKNOWN"
] as const;

/**
 * Tipo que representa los valores válidos para un tipo de héroe.
 */
export type HeroType = typeof HERO_TYPES[number];

/**
 * Representa un ítem dentro del dominio del inventario.
 * Puede corresponder a héroes, armas, armaduras u otros elementos.
 */
export interface Item {
  /** Identificador único del ítem. */
  id: string;

  /** Identificador del usuario propietario del ítem. */
  userId: string;

  /** Nombre del ítem. */
  name: string;

  /** Descripción del ítem. */
  description: string;

  /** Tipo de ítem (por ejemplo: "Armas", "Héroes", etc.). */
  type: ItemType;

  /**
   * Tipo de héroe asociado (solo aplica si el ítem es de tipo "Héroes").
   * Puede omitirse en otros tipos de ítem.
   */
  heroType?: HeroType;

  /**
   * Estado de disponibilidad del ítem:
   * - `true`: el ítem está disponible para usar o vender.
   * - `false`: el ítem está actualmente en una subasta.
   */
  isAvailable: boolean;

  /** URL o nombre de archivo de la imagen asociada al ítem. */
  imagen: string;
}