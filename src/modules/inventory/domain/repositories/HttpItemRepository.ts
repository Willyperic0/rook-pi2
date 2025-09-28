import axios from "axios";
import { Item, ItemType, HeroType } from "../models/Item";
import { ItemRepository } from "../../domain/repositories/ItemRepository";

/**
 * Implementación HTTP de ItemRepository basada en usuario
 */
export class HttpItemRepository implements ItemRepository {
  constructor(private readonly baseUrl: string) {}

  // Buscar item por ID requiere username
  async findById(
    nombreUsuario: string,
    itemId: string,
    itemType: ItemType
  ): Promise<Item | null> {
    console.log("[HttpItemRepository] findById called:", {
      nombreUsuario,
      itemId,
      itemType,
    });
    try {
      const items = await this.findByUserId(nombreUsuario);

      const normType = normalizeType(itemType);
      const found =
        items.find((i) => {
          const matchId = i.id.toString() === itemId.toString();
          const matchType = normalizeType(i.type) === normType;
          console.log(
            `↳ Comparando item {id=${i.id}, type=${i.type}} con buscado {id=${itemId}, type=${itemType}} => matchId=${matchId}, matchType=${matchType}`
          );
          return matchId && matchType;
        }) || null;

      console.log("[HttpItemRepository] Item encontrado:", found);
      return found;
    } catch (err) {
      console.error("[HttpItemRepository] Error findById:", err);
      return null;
    }
  }

  // Obtener todos los items de un usuario
  async findByUserId(nombreUsuario: string): Promise<Item[]> {
    console.log("[HttpItemRepository] findByUserId called:", { nombreUsuario });
    try {
      const res = await axios.get(`${this.baseUrl}/usuarios/${nombreUsuario}`);
      const inventario = res.data.inventario;

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
      ];

      const mappedItems = allItems.map(({ raw, type }) =>
        this.mapToDomain({ ...raw, _forcedType: type }, nombreUsuario)
      );

      return mappedItems;
    } catch (err) {
      console.error("[HttpItemRepository] Error findByUserId:", err);
      return [];
    }
  }

  // Actualizar item (usa la ruta correcta: PUT /items/modify/:id)
  async updateItem(id: string, data: Partial<Item>): Promise<Item> {
    console.log("[HttpItemRepository] updateItem called:", { id, data });

    if (data.isAvailable === null || data.isAvailable === undefined) {
      throw new Error("isAvailable es requerido para actualizar un item");
    }

    try {
      const res = await axios.put<{ message: string; item?: any }>(
        `${this.baseUrl}/items/modify/${id}`,
        data
      );
      console.log("[HttpItemRepository] updateItem response:", res.data);

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
        };
      }

      if (res.data.item.status === undefined || res.data.item.status === null) {
        throw new Error(
          `Item ${id} actualizado pero backend no devuelve status`
        );
      }

      return this.mapToDomain(res.data.item, data.userId || "");
    } catch (err) {
      console.error(`[updateItem] Error al actualizar item ${id}:`, err);
      throw err;
    }
  }

  // Actualizar disponibilidad de item
  // Actualizar disponibilidad de item
async updateAvailability(id: string, isAvailable: boolean, type: ItemType): Promise<Item> {
  console.log("[HttpItemRepository] updateAvailability called:", { id, isAvailable, type });

  try {
    let endpoint = "";
    switch (type) {
      case "Armaduras":
        endpoint = `${this.baseUrl}/armors/${id}/status`;
        break;
      case "Habilidades especiales":
        endpoint = `${this.baseUrl}/epics/${id}/status`;
        break;
      case "Héroes":
        endpoint = `${this.baseUrl}/heroes/${id}/status`;
        break;
      case "Ítems":
        endpoint = `${this.baseUrl}/items/${id}/status`;
        break;
      case "Armas":
        endpoint = `${this.baseUrl}/weapons/${id}/status`;
        break;
      default:
        throw new Error(`[updateAvailability] Tipo no soportado: ${type}`);
    }

    const res = await axios.patch(endpoint, { status: isAvailable });
    console.log("[HttpItemRepository] updateAvailability response:", res.data);

    let updatedRaw;
    switch (type) {
      case "Armaduras":
        updatedRaw = res.data.armor;
        break;
      case "Habilidades especiales":
        updatedRaw = res.data.epic;
        break;
      case "Héroes":
        updatedRaw = res.data.hero;
        break;
      case "Ítems":
        updatedRaw = res.data.item;
        break;
      case "Armas":
        updatedRaw = res.data.weapon;
        break;
    }

    if (!updatedRaw) {
      throw new Error(`[updateAvailability] No se devolvió el item actualizado para ID ${id}`);
    }

    // ⚠️ Aquí usamos el mapper como antes
    return this.mapToDomain(updatedRaw, "jugador1"); // o el username real
  } catch (err) {
    console.error(`[updateAvailability] Error al actualizar disponibilidad ${id}:`, err);
    throw err;
  }
}




  // Nuevo método para transferir items entre usuarios
  async transferItem(
    originUser: string,
    targetUser: string,
    itemName: string
  ): Promise<string> {
    console.log("[HttpItemRepository] transferItem called:", {
      originUser,
      targetUser,
      itemName,
    });
    try {
      const res = await axios.patch<{ message: string }>(
        `${this.baseUrl}/usuarios/transfer-item`,
        { originUser, targetUser, itemName }
      );
      console.log("[HttpItemRepository] transferItem response:", res.data);
      return res.data.message;
    } catch (err) {
      console.error(`[transferItem] Error al transferir ${itemName}:`, err);
      throw err;
    }
  }

  // Mapper actualizado para usar el username como userId
  private mapToDomain(item: any, ownerUsername: string): Item {
    if (item.status === undefined || item.status === null) {
      throw new Error(`Item ${item.id} no tiene status definido`);
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
    };
  }
}

// Normalizador de tipos para comparación
function normalizeType(type: string | undefined): string {
  if (!type) return "";
  return type
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
