import { ItemRepository } from "../repositories/ItemRepository";
import { Item, ItemType } from "../models/Item";
import { IItemService } from "./IItemService";

/**
 * Servicio encargado de gestionar la lógica de negocio relacionada
 * con los ítems del inventario.
 * 
 * Esta clase actúa como intermediario entre la capa de dominio y el
 * repositorio de datos, garantizando que las operaciones sobre los
 * ítems sigan las reglas establecidas por el dominio.
 */
export class ItemService implements IItemService {
  constructor(private readonly itemRepo: ItemRepository) {}

  /**
   * Obtiene todos los ítems pertenecientes a un usuario específico.
   * @param username Nombre o identificador del usuario propietario.
   * @returns Una promesa que resuelve con la lista de ítems del usuario.
   */
  async getAllItemsByUsername(username: string): Promise<Item[]> {
    return this.itemRepo.findByUserId(username);
  }

  /**
   * Busca un ítem específico de un usuario determinado según su
   * identificador y tipo.
   * @param username Nombre o identificador del usuario propietario.
   * @param itemId Identificador único del ítem.
   * @param type Tipo del ítem (por ejemplo, "Armas", "Héroes", etc.).
   * @returns Una promesa que resuelve con el ítem encontrado o `null` si no existe.
   */
  async getItemById(username: string, itemId: string, type: ItemType): Promise<Item | null> {
    return this.itemRepo.findById(username, itemId, type);
  }

  /**
   * Obtiene todos los ítems asociados a un usuario.
   * Este método es funcionalmente equivalente a `getAllItemsByUsername`,
   * pero puede usarse en contextos distintos según el flujo de negocio.
   * @param username Nombre o identificador del usuario propietario.
   * @returns Una promesa que resuelve con la lista de ítems del usuario.
   */
  async getItemsByUsername(username: string): Promise<Item[]> {
    return this.itemRepo.findByUserId(username);
  }

  /**
   * Actualiza el estado de disponibilidad de un ítem.
   * @param itemId Identificador único del ítem.
   * @param type Tipo del ítem a modificar.
   * @param isAvailable Indica si el ítem está disponible o no.
   * @returns Una promesa que resuelve con el ítem actualizado.
   */
  async setItemAvailability(itemId: string, type: ItemType, isAvailable: boolean): Promise<Item> {
    return this.itemRepo.updateAvailability(itemId, isAvailable, type);
  }
}