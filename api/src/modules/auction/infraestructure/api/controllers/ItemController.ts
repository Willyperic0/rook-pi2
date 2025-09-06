// src/interfaces/http/controllers/ItemController.ts
import { Request, Response } from "express";
import { ItemService } from "../../../../inventory/domain/services/ItemService";

export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  // Obtener un item por id
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

  // Listar items (opcionalmente filtrados por usuario)
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
