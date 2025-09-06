// src/routes/itemsRoutes.ts
import { Router } from "express";
import { ItemController } from "../controllers/ItemController";

const router = Router();

export default function itemRoutes(itemController: ItemController) {
  router.get("/", itemController.listItems);
  router.get("/:id", itemController.getItem);
  return router;
}
