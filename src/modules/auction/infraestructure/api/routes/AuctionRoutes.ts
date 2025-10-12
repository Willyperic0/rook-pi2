import { Router } from "express";
import { AuctionController } from "../controllers/AuctionController";

const router = Router();

/**
 * Define las rutas HTTP relacionadas con las subastas.
 * 
 * Cada ruta se asocia con un método del controlador `AuctionController`
 * que gestiona la lógica correspondiente (crear, listar, pujar, comprar, etc.).
 */
export default function auctionRoutes(auctionController: AuctionController) {
  /**
   * @route POST /
   * @description Crea una nueva subasta.
   * @body {string} username - Nombre de usuario del vendedor.
   * @returns 201 - Subasta creada exitosamente.
   * @returns 400 - Error de validación o datos faltantes.
   */
  router.post("/", auctionController.createAuction);

  /**
   * @route GET /
   * @description Lista todas las subastas abiertas disponibles.
   * @returns 200 - Lista de subastas abiertas.
   * @returns 500 - Error interno del servidor.
   */
  router.get("/", auctionController.listAuctions);

  /**
   * @route GET /:id
   * @description Obtiene los detalles de una subasta específica por su ID.
   * @param {string} id - ID de la subasta.
   * @returns 200 - Subasta encontrada.
   * @returns 404 - Subasta no encontrada.
   */
  router.get("/:id", auctionController.getAuction);

  /**
   * @route POST /:id/bid
   * @description Realiza una puja en una subasta específica.
   * @param {string} id - ID de la subasta.
   * @body {string} username - Nombre del usuario que puja.
   * @body {number} amount - Monto de la puja.
   * @returns 200 - Puja realizada correctamente.
   * @returns 400 - Error de validación o puja inválida.
   */
  router.post("/:id/bid", auctionController.placeBid);

  /**
   * @route POST /:id/buy
   * @description Realiza una compra rápida (Buy Now) en una subasta.
   * @param {string} id - ID de la subasta.
   * @body {string} username - Nombre del usuario comprador.
   * @returns 200 - Compra rápida realizada correctamente.
   * @returns 400 - No se pudo completar la compra.
   * @returns 404 - Subasta no encontrada.
   * @returns 403 - Créditos insuficientes.
   */
  router.post("/:id/buy", auctionController.buyNow);

  /**
   * @route GET /:id/bids
   * @description Obtiene todas las pujas realizadas en una subasta específica.
   * @param {string} id - ID de la subasta.
   * @returns 200 - Lista de pujas.
   * @returns 404 - Subasta no encontrada.
   */
  router.get("/:id/bids", auctionController.getBids);

  /**
   * @route GET /me/:username
   * @description Obtiene la información del usuario actual según su nombre.
   * @param {string} username - Nombre de usuario.
   * @returns 200 - Usuario encontrado.
   * @returns 404 - Usuario no encontrado.
   */
  router.get("/me/:username", auctionController.getCurrentUser);

  /**
   * @route GET /history/sold/:username
   * @description Obtiene el historial de subastas vendidas por un usuario.
   * @param {string} username - Nombre de usuario del vendedor.
   * @returns 200 - Lista de subastas vendidas.
   * @returns 500 - Error interno al obtener los datos.
   */
  router.get(
    "/history/sold/:username",
    auctionController.getSoldHistory.bind(auctionController)
  );

  /**
   * @route GET /history/purchased/:username
   * @description Obtiene el historial de subastas compradas por un usuario.
   * @param {string} username - Nombre de usuario del comprador.
   * @returns 200 - Lista de subastas compradas.
   * @returns 500 - Error interno al obtener los datos.
   */
  router.get(
    "/history/purchased/:username",
    auctionController.getPurchasedHistory.bind(auctionController)
  );

  return router;
}