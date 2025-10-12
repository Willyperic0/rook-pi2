import { Item, ItemType } from "../models/Item";

/**
 * Interfaz que define las operaciones principales del servicio de ítems.
 * 
 * Se encarga de manejar la lógica de negocio relacionada con los objetos
 * del dominio `Item`, incluyendo consultas, actualizaciones y validaciones.
 * 
 * Las implementaciones concretas de este servicio deben utilizar un
 * repositorio que cumpla con la interfaz `ItemRepository` para acceder
 * a los datos almacenados.
 */
export interface IItemService {
  /**
   * Obtiene todos los ítems pertenecientes a un usuario específico.
   * @param username Nombre o identificador del usuario.
   * @returns Una promesa que resuelve una lista con los ítems del usuario.
   */
  getAllItemsByUsername(username: string): Promise<Item[]>;

  /**
   * Busca un ítem específico perteneciente a un usuario determinado,
   * filtrando tanto por su identificador como por su tipo.
   * @param username Nombre o identificador del usuario propietario.
   * @param itemId Identificador único del ítem.
   * @param type Tipo del ítem (por ejemplo, arma, accesorio, etc.).
   * @returns Una promesa que resuelve el ítem encontrado o `null` si no existe.
   */
  getItemById(username: string, itemId: string, type: ItemType): Promise<Item | null>;

  /**
   * Alternativa para obtener todos los ítems de un usuario.
   * Puede utilizarse en casos donde se requiera un manejo distinto
   * al del método principal `getAllItemsByUsername`.
   * @param username Nombre o identificador del usuario.
   * @returns Una promesa que resuelve la lista de ítems asociados al usuario.
   */
  getItemsByUsername(username: string): Promise<Item[]>;

  /**
   * Actualiza el estado de disponibilidad de un ítem en función de su tipo.
   * @param itemId Identificador único del ítem.
   * @param type Tipo de ítem que se va a modificar.
   * @param isAvailable Indica si el ítem estará disponible o no.
   * @returns Una promesa que resuelve el ítem actualizado.
   */
  setItemAvailability(itemId: string, type: ItemType, isAvailable: boolean): Promise<Item>;
}