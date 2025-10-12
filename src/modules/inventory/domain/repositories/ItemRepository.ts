import { Item, ItemType } from "../models/Item";

/**
 * Interfaz que define los métodos necesarios para interactuar con
 * la fuente de datos relacionada con los objetos del dominio `Item`.
 * 
 * Cada implementación concreta (por ejemplo, una base de datos o una API)
 * debe cumplir con estos métodos para gestionar los ítems de los usuarios.
 */
export interface ItemRepository {
  /**
   * Busca un ítem específico perteneciente a un usuario, filtrando
   * tanto por su identificador como por su tipo.
   * @param nombreUsuario Nombre o ID del usuario propietario del ítem.
   * @param itemId Identificador único del ítem.
   * @param itemType Tipo de ítem (por ejemplo, arma, armadura, accesorio, etc.).
   * @returns Una promesa que resuelve el ítem encontrado o `null` si no existe.
   */
  findById(nombreUsuario: string, itemId: string, itemType: ItemType): Promise<Item | null>;

  /**
   * Obtiene todos los ítems asociados a un usuario específico.
   * @param nombreUsuario Nombre o ID del usuario.
   * @returns Una promesa que resuelve una lista con todos los ítems del usuario.
   */
  findByUserId(nombreUsuario: string): Promise<Item[]>;

  /**
   * Actualiza el estado de disponibilidad de un ítem en función de su tipo.
   * @param id Identificador único del ítem.
   * @param isAvailable Estado de disponibilidad (`true` si está disponible).
   * @param type Tipo de ítem que se está modificando.
   * @returns Una promesa que resuelve el ítem actualizado.
   */
  updateAvailability(id: string, isAvailable: boolean, type: ItemType): Promise<Item>;

  /**
   * Permite modificar uno o varios campos de un ítem existente.
   * Solo los campos presentes en el objeto `data` serán actualizados.
   * @param id Identificador único del ítem.
   * @param data Objeto parcial con los campos a actualizar.
   * @returns Una promesa que resuelve el ítem con los cambios aplicados.
   */
  updateItem(id: string, data: Partial<Item>): Promise<Item>;

  /**
   * Transfiere un ítem de un usuario a otro, actualizando la propiedad
   * del ítem en la fuente de datos.
   * @param originUser Usuario que actualmente posee el ítem.
   * @param targetUser Usuario al que se transfiere el ítem.
   * @param itemName Nombre del ítem que se transfiere.
   * @returns Una promesa que resuelve un mensaje confirmando la transferencia.
   */
  transferItem(originUser: string, targetUser: string, itemName: string): Promise<string>;
}