import axios from "axios";
import { Item } from "../models/Item";
import { ItemRepository } from "../../domain/repositories/ItemRepository";

/**
 * Implementación HTTP de ItemRepository basada en usuario
 */
export class HttpItemRepository implements ItemRepository {
  constructor(private readonly baseUrl: string) {}

  // Buscar item por ID requiere username
  async findById(nombreUsuario: string, itemId: string): Promise<Item | null> {
  console.log("[HttpItemRepository] findById called:", { nombreUsuario, itemId });
  try {
    const items = await this.findByUserId(nombreUsuario);
    const found = items.find(i => i.id === itemId) || null;
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
    console.log("[HttpItemRepository] Respuesta raw inventario:", res.data.inventario);

    const inventario = res.data.inventario;
    const allItems = [
      ...(inventario.weapons || []),
      ...(inventario.armors || []),
      ...(inventario.items || []),
      ...(inventario.epicAbility || []),
      ...(inventario.hero || []),
    ];
    console.log("[HttpItemRepository] allItems combined:", allItems);

    const mappedItems = allItems.map(item => this.mapToDomain(item, nombreUsuario));
    console.log("[HttpItemRepository] Mapped items:", mappedItems);

    return mappedItems;
  } catch (err) {
    console.error("[HttpItemRepository] Error findByUserId:", err);
    return [];
  }
}

  // Actualizar item (requiere endpoint global de items si existe)
  async updateItem(id: string, data: Partial<Item>): Promise<Item> {
    try {
      const res = await axios.patch<Item>(`${this.baseUrl}/items/${id}`, data);
      return this.mapToDomain(res.data, data.userId || "");
    } catch (err) {
      console.error(`[updateItem] Error al actualizar item ${id}:`, err);
      throw err;
    }
  }

  // Actualizar disponibilidad de item
  // Actualizar disponibilidad de item
async updateAvailability(id: string, isAvailable: boolean): Promise<Item> {
  try {
    const res = await axios.patch<{ message: string; item: any }>(
      `${this.baseUrl}/items/${id}/status`,
      { status: isAvailable }
    );

    // Mapear usando res.data.item en lugar de res.data
    return this.mapToDomain(res.data.item, res.data.item.userId || "");
  } catch (err) {
    console.error(`[updateAvailability] Error al actualizar disponibilidad ${id}:`, err);
    throw err;
  }
}



  // Mapper actualizado para usar el username como userId
  private mapToDomain(item: any, ownerUsername: string): Item {
    return {
      id: item.id.toString(),
      userId: ownerUsername, // usamos el username como userId
      name: item.name,
      description: item.description,
      type: item.type || "generic",
      heroType: item.heroType,
      isAvailable: item.status ?? true,
      imagen: item.image || "",
    };
  }
}
