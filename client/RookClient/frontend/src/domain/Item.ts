// client/RookClient/frontend/src/domain/Item.ts

// client/domain/Item.ts

/**
 * Tipos de ítems disponibles en el sistema.
 * @remarks
 * Mantén esta enumeración alineada con el backend para evitar desajustes.
 */
export type ItemType =
  | "Héroes"
  | "Armas"
  | "Armaduras"
  | "Ítems"
  | "Habilidades especiales"
  | "Épicas";

/**
 * Tipos de héroe vinculables a un ítem.
 * @remarks
 * Campo opcional: no todos los ítems tienen `heroType`.
 */
export type HeroType =
  | "Guerrero Tanque"
  | "Guerrero Armas"
  | "Mago Fuego"
  | "Mago Hielo"
  | "Pícaro Veneno"
  | "Pícaro Machete"
  | "Chamán"
  | "Médico";

/**
 * Modelo de ítem consumido por el frontend.
 * @remarks
 * `imagen` se asume como base64 o `data:` URL según lo entregue el backend.
 */
export interface Item {
  /** Identificador único del ítem. */
  id: number;
  /** Identificador del propietario/creador. */
  userId: number;
  /** Nombre visible. */
  name: string;
  /** Descripción visible. */
  description: string;
  /** Tipo de ítem. */
  type: ItemType;
  /** Tipo de héroe (si aplica al ítem). */
  heroType?: HeroType;
  /** Disponibilidad general del ítem. */
  isAvailable: boolean;
  /** Imagen en base64 o data URL (según contrato del backend). */
  imagen: string;
}
