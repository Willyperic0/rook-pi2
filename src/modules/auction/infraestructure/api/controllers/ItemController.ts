// src/interfaces/http/controllers/ItemController.ts
import { Request, Response } from "express";
import { IItemService } from "../../../../inventory/domain/services/IItemService";

export class ItemController {
  constructor(private readonly itemService: IItemService) {}

  // Obtener un item por id
  getItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = req.params["id"];
      if (!id) return res.status(400).json({ error: "id no proporcionado" });
      const item = await this.itemService.getItemById(id);
      if (!item) return res.status(404).json({ error: "Item not found" });
      return res.json(item);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  // Listar items (opcionalmente filtrados por usuario)
  // Listar items (opcionalmente filtrados por usuario)
listItems = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req.query["userId"] as string | undefined)?.trim();
if (userId) {
  const items = await this.itemService.getItemsByUserId(userId);
  return res.json(items);
}


    const items = await this.itemService.getAllItems();
    return res.json(items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

}
