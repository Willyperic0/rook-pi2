// src/modules/auction/infraestructure/api/routes/AuctionRoutes.ts

import { Router } from "express";
import { AuctionController } from "../controllers/AuctionController";

/**
 * Registra rutas HTTP para recursos de subastas.
 * @param auctionController Controlador inyectado
 * @returns Router configurado
 *
 * @paths
 * - POST /            → crear subasta
 * - GET  /            → listar subastas
 * - POST /:id/bid     → pujar
 * - POST /:id/buy     → compra rápida
 * - GET  /:id/bids    → pujas de una subasta
 * - GET  /me          → usuario actual (desde token)
 * - GET  /:id         → obtener subasta por id
 * - GET  /history/purchased/:userId → subastas compradas por usuario
 * - GET  /history/sold/:userId      → subastas vendidas por usuario
 */
const router = Router();

export default function auctionRoutes(auctionController: AuctionController) {
  router.post("/", auctionController.createAuction);
  router.get("/", auctionController.listAuctions);
  router.post("/:id/bid", auctionController.placeBid);
  router.post("/:id/buy", auctionController.buyNow);
  router.get("/:id/bids", auctionController.getBids);
  router.get("/me", auctionController.getCurrentUser);
  router.get("/:id", auctionController.getAuction);
  router.get("/history/purchased/:userId", auctionController.getPurchasedAuctions);
  router.get("/history/sold/:userId", auctionController.getSoldAuctions);
  return router;
}