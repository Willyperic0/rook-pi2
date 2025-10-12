import { Router } from "express";
import { ItemController } from "../controllers/ItemController";

/**
 * Define las rutas HTTP relacionadas con los items de un usuario.
 * 
 * Este módulo configura las rutas para:
 * - Obtener un ítem específico por su ID y nombre de usuario.
 * - Listar todos los ítems asociados a un usuario.
 *
 * @param controller Instancia del controlador encargado de manejar la lógica de los ítems.
 * @returns Router con las rutas configuradas para la gestión de ítems.
 */
export default (controller: ItemController) => {
  const router = Router();

  /**
   * Ruta para obtener un ítem específico de un usuario.
   * 
   * Método: GET  
   * Endpoint: `/items/:username/:id`  
   * 
   * @example
   * GET /items/johndoe/12345
   * 
   * @param {string} username Nombre de usuario propietario del ítem.
   * @param {string} id Identificador único del ítem.
   * @returns Detalles del ítem solicitado.
   */
  router.get("/:username/:id", controller.getItem);

  /**
   * Ruta para listar todos los ítems pertenecientes a un usuario.
   * 
   * Método: GET  
   * Endpoint: `/items/:username`  
   * 
   * @example
   * GET /items/johndoe
   * 
   * @param {string} username Nombre del usuario cuyos ítems se desean obtener.
   * @returns Lista de ítems asociados al usuario especificado.
   */
  router.get("/:username", controller.listItems);

  return router;
};