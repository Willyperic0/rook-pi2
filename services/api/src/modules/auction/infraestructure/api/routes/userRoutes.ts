// src/modules/auction/infraestructure/api/routes/UserRoutes.ts

import { Router } from "express";
import { UserController } from "../controllers/UserController";

/**
 * Registra rutas HTTP para recursos de usuario (lectura).
 * @param userController Controlador inyectado
 * @returns Router configurado
 *
 * @paths
 * - GET /:id  → obtener usuario por id
 * - GET /me   → obtener usuario actual (desde token)
 */
const router = Router();

export default function UserRoutes(userController: UserController) {
  router.get("/:id", userController.getUser);
  router.get("/me", userController.getCurrentUser);
  return router;
}
