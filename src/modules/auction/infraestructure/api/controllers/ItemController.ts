import { Request, Response } from "express";
import { IItemService } from "../../../../inventory/domain/services/IItemService";

/**
 * Controlador HTTP encargado de manejar las solicitudes relacionadas con los ítems del inventario.
 * Utiliza el servicio de dominio `IItemService` para acceder a la lógica de negocio.
 */
export class ItemController {
  /**
   * @param itemService Servicio encargado de la lógica de negocio relacionada con los ítems.
   */
  constructor(private readonly itemService: IItemService) {}

  /**
   * Método auxiliar para obtener y normalizar el nombre de usuario desde los parámetros o la query.
   * @param req Objeto de solicitud HTTP.
   * @returns El username en formato de texto limpio o `undefined` si no se proporciona.
   */
  private getUsername(req: Request): string | undefined {
    const usernameParam = req.params["username"];
    const usernameQuery = req.query["username"];

    if (typeof usernameParam === "string") return usernameParam.trim();
    if (typeof usernameQuery === "string") return usernameQuery.trim();

    return undefined;
  }

  /**
   * Obtiene un ítem específico asociado a un usuario.
   * @route GET /items/:id
   * @param req Contiene `id` del ítem y `username` del usuario (por parámetro o query).
   * @param res Devuelve el ítem encontrado o un mensaje de error.
   */
  getItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      const username = this.getUsername(req);
      const itemId = req.params["id"];

      if (!username) return res.status(400).json({ error: "username no proporcionado" });
      if (!itemId) return res.status(400).json({ error: "id no proporcionado" });

      const item = await this.itemService.getItemById(username, itemId, req.query["type"] as any);
      if (!item) return res.status(404).json({ error: "Item not found" });

      return res.json(item);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  /**
   * Lista todos los ítems pertenecientes a un usuario.
   * @route GET /items?username=...
   * @param req Contiene el `username` en los parámetros o la query.
   * @param res Devuelve un arreglo con los ítems del usuario o un mensaje de error.
   */
  listItems = async (req: Request, res: Response): Promise<Response> => {
    try {
      const username = this.getUsername(req);
      if (!username) return res.status(400).json({ error: "username no proporcionado" });

      const items = await this.itemService.getItemsByUsername(username);
      return res.json(items);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };
}