// src/modules/auction/infraestructure/InventoryApiClient.ts

/**
 * Cliente HTTP para el microservicio de Items.
 * @remarks
 * Encapsula llamadas REST al servicio de inventario. No incluye lógica de negocio;
 * solo transporte y manejo básico de errores.
 *
 * @typedoc
 * Archivo documentado con TSDoc (compatible con TypeDoc). Inclúyelo en `typedoc.json`
 * para generar documentación automática.
 */
export class InventoryApiClient {
  /**
   * @param baseUrl URL base del servicio de items (p. ej., `/items` detrás del proxy o `http://items:3002`)
   */
  constructor(private readonly baseUrl: string) {}

  /**
   * Obtiene un item por su ID.
   * @param id Identificador del item.
   * @returns Promesa con el JSON del item.
   * @throws Error si la respuesta HTTP no es OK.
   */
  async getItemById(id: number) {
    const res = await fetch(`${this.baseUrl}/items/${id}`);
    if (!res.ok) throw new Error("Item not found");
    return res.json();
  }

  /**
   * Lista items de un usuario.
   * @param userId Identificador del usuario propietario.
   * @returns Promesa con el arreglo JSON de items.
   * @throws Error si la respuesta HTTP no es OK.
   */
  async getItemsByUser(userId: number) {
    const res = await fetch(`${this.baseUrl}/items?userId=${userId}`);
    if (!res.ok) throw new Error("Error fetching items");
    return res.json();
  }
}