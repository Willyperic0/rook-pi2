import axios from "axios"
import { Item, ItemType, HeroType } from "../models/Item"
import { ItemRepository } from "../../domain/repositories/ItemRepository"

/**
 * Implementación concreta del repositorio de ítems que utiliza
 * peticiones HTTP para comunicarse con un servicio remoto.
 * 
 * Se encarga de realizar las operaciones de consulta, actualización
 * y transferencia de ítems asociados a los usuarios.
 */
export class HttpItemRepository implements ItemRepository {
  constructor(private readonly baseUrl: string) {}

  /**
   * Busca un ítem específico de un usuario según su ID y tipo.
   * 
   * Este método primero obtiene todos los ítems del usuario
   * y luego realiza una comparación entre el ID y el tipo normalizado
   * para encontrar el elemento exacto.
   * 
   * @param nombreUsuario Nombre del usuario propietario.
   * @param itemId Identificador único del ítem.
   * @param itemType Tipo del ítem a buscar.
   * @returns El ítem encontrado o `null` si no existe.
   */
  async findById(
    nombreUsuario: string,
    itemId: string,
    itemType: ItemType
  ): Promise<Item | null> {
    console.log("[HttpItemRepository] findById called:", {
      nombreUsuario,
      itemId,
      itemType,
    })
    try {
      const items = await this.findByUserId(nombreUsuario)
      const normType = normalizeType(itemType)

      const found =
        items.find((i) => {
          const matchId = i.id.toString() === itemId.toString()
          const matchType = normalizeType(i.type) === normType
          console.log(
            `↳ Comparando item {id=${i.id}, type=${i.type}} con buscado {id=${itemId}, type=${itemType}} => matchId=${matchId}, matchType=${matchType}`
          )
          return matchId && matchType
        }) || null

      console.log("[HttpItemRepository] Item encontrado:", found)
      return found
    } catch (err) {
      console.error("[HttpItemRepository] Error findById:", err)
      return null
    }
  }

  /**
   * Obtiene todos los ítems pertenecientes a un usuario.
   * 
   * La respuesta del backend se organiza por tipo de ítem
   * (armas, armaduras, héroes, etc.), y cada categoría se transforma
   * a un formato unificado del dominio `Item`.
   * 
   * @param nombreUsuario Nombre del usuario propietario.
   * @returns Lista de ítems mapeados al modelo de dominio.
   */
  async findByUserId(nombreUsuario: string): Promise<Item[]> {
    console.log("[HttpItemRepository] findByUserId called:", { nombreUsuario })
    try {
      const res = await axios.get(`${this.baseUrl}/usuarios/${nombreUsuario}`)
      const inventario = res.data.inventario

      const allItems: { raw: any; type: ItemType }[] = [
        ...(inventario.weapons || []).map((i: any) => ({
          raw: i,
          type: "Armas",
        })),
        ...(inventario.armors || []).map((i: any) => ({
          raw: i,
          type: "Armaduras",
        })),
        ...(inventario.items || []).map((i: any) => ({
          raw: i,
          type: "Ítems",
        })),
        ...(inventario.epicAbility || []).map((i: any) => ({
          raw: i,
          type: "Habilidades especiales",
        })),
        ...(inventario.hero || []).map((i: any) => ({
          raw: i,
          type: "Héroes",
        })),
      ]

      const mappedItems = allItems.map(({ raw, type }) =>
        this.mapToDomain({ ...raw, _forcedType: type }, nombreUsuario)
      )

      return mappedItems
    } catch (err) {
      console.error("[HttpItemRepository] Error findByUserId:", err)
      return []
    }
  }

  /**
   * Actualiza la información de un ítem específico mediante una petición PUT.
   * 
   * Se utiliza principalmente para modificar el estado de disponibilidad
   * o detalles del ítem. Si el backend no devuelve el objeto actualizado,
   * se genera uno a partir de los datos enviados.
   * 
   * @param id Identificador del ítem.
   * @param data Datos parciales a actualizar.
   * @returns El ítem actualizado en formato de dominio.
   */
  async updateItem(id: string, data: Partial<Item>): Promise<Item> {
    console.log("[HttpItemRepository] updateItem called:", { id, data })

    if (data.isAvailable === null || data.isAvailable === undefined) {
      throw new Error("isAvailable es requerido para actualizar un item")
    }

    try {
      const res = await axios.put<{ message: string; item?: any }>(
        `${this.baseUrl}/items/modify/${id}`,
        data
      )
      console.log("[HttpItemRepository] updateItem response:", res.data)

      if (!res.data.item) {
        return {
          id: id,
          userId: data.userId || "",
          name: data.name || "UNKNOWN",
          description: data.description || "",
          type: (data.type as ItemType) || "UNKNOWN",
          heroType: (data.heroType as HeroType) || "UNKNOWN",
          isAvailable: data.isAvailable,
          imagen: data.imagen || "",
        }
      }

      if (res.data.item.status === undefined || res.data.item.status === null) {
        throw new Error(`Item ${id} actualizado pero backend no devuelve status`)
      }

      return this.mapToDomain(res.data.item, data.userId || "")
    } catch (err) {
      console.error(`[updateItem] Error al actualizar item ${id}:`, err)
      throw err
    }
  }

  /**
   * Actualiza el estado de disponibilidad de un ítem según su tipo.
   * 
   * El método selecciona dinámicamente la ruta de API correspondiente
   * dependiendo del tipo de ítem (arma, armadura, héroe, etc.)
   * y envía una petición PATCH con el nuevo estado.
   * 
   * @param id Identificador del ítem.
   * @param isAvailable Nuevo estado de disponibilidad.
   * @param type Tipo de ítem a actualizar.
   * @returns El ítem actualizado en formato de dominio.
   */
  async updateAvailability(
    id: string,
    isAvailable: boolean,
    type: ItemType
  ): Promise<Item> {
    console.log("[HttpItemRepository] updateAvailability called:", {
      id,
      isAvailable,
      type,
    })

    try {
      let endpoint = ""
      switch (type) {
        case "Armaduras":
          endpoint = `${this.baseUrl}/armors/${id}/status`
          break
        case "Habilidades especiales":
          endpoint = `${this.baseUrl}/epics/${id}/status`
          break
        case "Héroes":
          endpoint = `${this.baseUrl}/heroes/${id}/status`
          break
        case "Ítems":
          endpoint = `${this.baseUrl}/items/${id}/status`
          break
        case "Armas":
          endpoint = `${this.baseUrl}/weapons/${id}/status`
          break
        default:
          throw new Error(`[updateAvailability] Tipo no soportado: ${type}`)
      }

      const res = await axios.patch(endpoint, { status: isAvailable })
      console.log("[HttpItemRepository] updateAvailability response:", res.data)

      let updatedRaw
      switch (type) {
        case "Armaduras":
          updatedRaw = res.data.armor
          break
        case "Habilidades especiales":
          updatedRaw = res.data.epic
          break
        case "Héroes":
          updatedRaw = res.data.hero
          break
        case "Ítems":
          updatedRaw = res.data.item
          break
        case "Armas":
          updatedRaw = res.data.weapon
          break
      }

      if (!updatedRaw) {
        throw new Error(
          `[updateAvailability] No se devolvió el item actualizado para ID ${id}`
        )
      }

      return this.mapToDomain(updatedRaw, "jugador1")
    } catch (err) {
      console.error(
        `[updateAvailability] Error al actualizar disponibilidad ${id}:`,
        err
      )
      throw err
    }
  }

  /**
   * Transfiere un ítem de un usuario a otro.
   * 
   * Se utiliza para realizar intercambios entre jugadores o reposiciones
   * dentro del inventario. La API remota procesa la transferencia y
   * devuelve un mensaje de confirmación.
   * 
   * @param originUser Usuario que envía el ítem.
   * @param targetUser Usuario que recibe el ítem.
   * @param itemName Nombre del ítem transferido.
   * @returns Mensaje de confirmación de la operación.
   */
  async transferItem(
    originUser: string,
    targetUser: string,
    itemName: string
  ): Promise<string> {
    console.log("[HttpItemRepository] transferItem called:", {
      originUser,
      targetUser,
      itemName,
    })
    try {
      const res = await axios.patch<{ message: string }>(
        `${this.baseUrl}/usuarios/transfer-item`,
        { originUser, targetUser, itemName }
      )
      console.log("[HttpItemRepository] transferItem response:", res.data)
      return res.data.message
    } catch (err) {
      console.error(`[transferItem] Error al transferir ${itemName}:`, err)
      throw err
    }
  }

  /**
   * Convierte un objeto crudo recibido del backend en un modelo de dominio.
   * 
   * Incluye validaciones básicas para asegurar la existencia del estado
   * del ítem (`status`) antes de construir la instancia final.
   * 
   * @param item Objeto recibido del backend.
   * @param ownerUsername Nombre del usuario propietario del ítem.
   * @returns Objeto `Item` mapeado al dominio.
   */
  private mapToDomain(item: any, ownerUsername: string): Item {
    if (item.status === undefined || item.status === null) {
      throw new Error(`Item ${item.id} no tiene status definido`)
    }

    return {
      id: item.id?.toString() || "",
      userId: ownerUsername,
      name: item.name || "UNKNOWN",
      description: item.description || "",
      type: (item._forcedType as ItemType) || "UNKNOWN",
      heroType: (item.heroType as HeroType) || "UNKNOWN",
      isAvailable: item.status,
      imagen: item.image || "",
    }
  }
}

/**
 * Normaliza un tipo de ítem eliminando acentos y ajustando mayúsculas.
 * 
 * Se utiliza para comparar tipos de ítems sin depender del formato textual.
 * 
 * @param type Tipo de ítem a normalizar.
 * @returns Cadena normalizada en minúsculas sin acentos.
 */
function normalizeType(type: string | undefined): string {
  if (!type) return ""
  return type
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}