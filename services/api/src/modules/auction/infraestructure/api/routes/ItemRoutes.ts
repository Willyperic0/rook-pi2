// src/modules/auction/infraestructure/api/routes/ItemRoutes.ts

import { Router } from "express";
import { ItemController } from "../controllers/ItemController";

/**
 * Registra rutas HTTP para recursos de items (lectura).
 * @param itemController Controlador inyectado
 * @returns Router configurado
 *
 * @paths
 * - GET /      → listar items (opcional ?userId=)
 * - GET /:id   → obtener item por id
 */
const router = Router();

export default function itemRoutes(itemController: ItemController) {
  router.get("/", itemController.listItems);
  router.get("/:id", itemController.getItem);
  return router;
}