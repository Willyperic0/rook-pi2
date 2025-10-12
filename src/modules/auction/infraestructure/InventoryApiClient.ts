/**
 * Cliente HTTP encargado de comunicarse con el servicio de Inventario.
 * Proporciona métodos para obtener información de ítems individuales
 * y de todos los ítems asociados a un usuario específico.
 */
export class InventoryApiClient {
  /**
   * @param baseUrl URL base del servicio externo de inventario.
   */
  constructor(private readonly baseUrl: string) {}

  /**
   * Obtiene un ítem específico por su identificador único.
   *
   * @param id Identificador numérico del ítem a consultar.
   * @returns Los datos del ítem obtenido desde el servicio externo.
   * @throws Error si la respuesta del servidor no es exitosa.
   */
  async getItemById(id: number) {
    const res = await fetch(`${this.baseUrl}/items/${id}`);
    if (!res.ok) throw new Error("Item not found");
    return res.json();
  }

  /**
   * Obtiene todos los ítems pertenecientes a un usuario específico.
   *
   * @param userId Identificador numérico del usuario propietario de los ítems.
   * @returns Lista de ítems asociados al usuario.
   * @throws Error si ocurre algún problema al obtener los datos del servicio.
   */
  async getItemsByUser(userId: number) {
    const res = await fetch(`${this.baseUrl}/items?userId=${userId}`);
    if (!res.ok) throw new Error("Error fetching items");
    return res.json();
  }
}
