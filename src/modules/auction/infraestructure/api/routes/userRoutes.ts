import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();

/**
 * Define las rutas HTTP relacionadas con la gestión de usuarios.
 * Permite obtener información de un usuario específico o del usuario autenticado.
 *
 * @param userController Controlador encargado de manejar la lógica de negocio de los usuarios.
 * @returns Router configurado con las rutas de usuario.
 */
export default function UserRoutes(userController: UserController) {
  /**
   * Ruta: GET /:id
   * --------------------------------
   * Obtiene la información de un usuario específico según su ID.
   * 
   * @example
   * GET /users/123
   * → Retorna los datos del usuario con ID 123.
   */
  router.get("/:id", userController.getUser);

  /**
   * Ruta: GET /me
   * --------------------------------
   * Obtiene la información del usuario actualmente autenticado.
   * 
   * @example
   * GET /users/me
   * → Retorna los datos del usuario logueado en la sesión actual.
   */
  router.get("/me", userController.getCurrentUser);

  return router;
}