// inventory/domain/models/Item.ts

export const ITEM_TYPES = [
  "Héroes",
  "Armas",
  "Armaduras",
  "Ítems",
  "Habilidades especiales",
  "Épicas",
] as const;
export type ItemType = typeof ITEM_TYPES[number];

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
export type HeroType = typeof HERO_TYPES[number];

export interface Item {
  id: number;
  userId: number;
  name: string;
  description: string;
  type: ItemType;
  /** Para ítems específicos de un héroe. Requerido si type === "Héroes". */
  heroType?: HeroType;
  /** Si está en subasta => false (no usable); si no, true. */
  isAvailable: boolean;
  imagen:string
}

