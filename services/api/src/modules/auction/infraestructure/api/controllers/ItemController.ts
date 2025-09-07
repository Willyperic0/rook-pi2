// src/modules/auction/infraestructure/api/controllers/ItemController.ts

import { Request, Response } from "express";
import { ItemService } from "../../../../inventory/domain/services/ItemService";

/**
 * Controlador HTTP para recursos de items (lectura).
 * @remarks
 * Orquesta consultas a {@link ItemService}. No contiene reglas de dominio.
 */
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  /**
   * GET /items/:id
   * @description Obtiene un ítem por ID.
   * @status 200 OK | 404 Not Found | 500 Internal Error
   */
  getItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Number(req.params["id"]);
      const item = await this.itemService.getItemById(id);
      if (!item) return res.status(404).json({ error: "Item not found" });
      return res.json(item);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  /**
   * GET /items
   * @description Lista items; si se pasa `userId`, filtra por propietario.
   * @status 200 OK | 500 Internal Error
   */
  listItems = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId } = req.query;

      if (userId) {
        const items = await this.itemService.getItemsByUserId(Number(userId));
        return res.json(items);
      }

      const items = await this.itemService.getAllItems();
      return res.json(items);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };
}
