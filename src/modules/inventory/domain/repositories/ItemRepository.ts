import { Item, ItemType } from "../models/Item";

export interface ItemRepository {
  // Buscar un item por ID + Type de un usuario específico
  findById(nombreUsuario: string, itemId: string, itemType: ItemType): Promise<Item | null>;

  // Obtener todos los items de un usuario específico
  findByUserId(nombreUsuario: string): Promise<Item[]>;

  // Actualizar disponibilidad de un item (requiere también el type)
  updateAvailability(id: string, isAvailable: boolean, type: ItemType): Promise<Item>;

  // Actualizar cualquier campo de un item
  updateItem(id: string, data: Partial<Item>): Promise<Item>;

  // Transferir item entre usuarios
  transferItem(originUser: string, targetUser: string, itemName: string): Promise<string>;
}
