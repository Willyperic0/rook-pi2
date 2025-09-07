// src/modules/auction/infraestructure/sockets/auctionSocket.ts

import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { AuctionService } from "../../domain/services/AuctionService";
import { AuctionMapper } from "../../application/mappers/AuctionMapper";
import { env } from "../config/env";

let io: Server;
let auctionService: AuctionService;

/**
 * Inicializa el servidor de Socket.IO sobre un servidor HTTP existente.
 * @param server Servidor HTTP de Express (`http.createServer(app)`)
 * @remarks
 * - Configura CORS usando `env.corsOrigin`.
 * - Aplica middleware de autenticación JWT (handshake `auth.token`).
 * - Registra handlers para: `CREATE_AUCTION`, `PLACE_BID`, `BUY_NOW`.
 * - Emite eventos broadcast: `NEW_AUCTION`, `AUCTION_UPDATED`, `AUCTION_CLOSED`, `TRANSACTION_CREATED`.
 *
 * @typedoc
 * Este archivo usa TSDoc y es apto para TypeDoc. Añádelo a `entryPoints` en `typedoc.json`.
 */
export function initAuctionSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: env.corsOrigin, methods: ["GET", "POST"] },
  });

  /**
   * Middleware de autenticación para cada conexión de socket.
   * @remarks
   * - Espera `token` en `socket.handshake.auth.token`.
   * - Verifica JWT con `env.jwt.secret` y guarda `userId` en `socket.data.userId`.
   * - Rechaza la conexión con error si falta o es inválido.
   */
  io.use((socket, next) => {
    const token = socket.handshake.auth?.["token"];
    if (!token) return next(new Error("Token requerido"));

    try {
      const payload: any = jwt.verify(token, env.jwt.secret);
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[SOCKET] Cliente conectado: ${socket.id} (userId: ${socket.data.userId})`);

    // ---------------------------
    // Crear subasta
    // ---------------------------
    /**
     * Evento: `CREATE_AUCTION`
     * @payload `{ ...CreateAuctionInputDTO, token: string }`
     * @callback `{ success: boolean, auction?: AuctionDto, error?: string }`
     * @remarks
     * - Requiere `auctionService` inyectado previamente con `setAuctionServiceForSocket`.
     * - Crea subasta, une al socket a la sala `auction-{id}` y emite `NEW_AUCTION`.
     */
    socket.on("CREATE_AUCTION", async (data, callback) => {
      try {
        if (!auctionService) throw new Error("AuctionService no configurado");

        const result = await auctionService.createAuction(
          { ...data, ownerId: socket.data.userId },
          data.token
        );

        const roomName = `auction-${result.auction.id}`;
        socket.join(roomName);
        console.log(`[SOCKET] Usuario ${socket.data.userId} se unió a la sala ${roomName}`);

        emitNewAuction(result.auction);
        callback?.({ success: true, auction: result.auction });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    // ---------------------------
    // Pujar
    // ---------------------------
    /**
     * Evento: `PLACE_BID`
     * @payload `{ auctionId: number, token: string, amount: number }`
     * @callback `{ success: boolean, error?: string }`
     * @remarks
     * - Valida y registra la puja vía `AuctionService.placeBid`.
     * - Si tiene éxito, emite `AUCTION_UPDATED` y `TRANSACTION_CREATED`.
     */
    socket.on("PLACE_BID", async (data, callback) => {
      try {
        if (!auctionService) throw new Error("AuctionService no configurado");

        const success = await auctionService.placeBid(data.auctionId, data.token, data.amount);
        callback?.({ success });

        if (success) {
          const auction = await auctionService.getAuctionById(data.auctionId);
          if (auction) {
            emitBidUpdate(data.auctionId, AuctionMapper.toDto(auction));
          }

          emitTransactionCreated({
            type: "BID",
            auctionId: data.auctionId,
            userId: socket.data.userId,
            amount: data.amount,
          });
        }
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    // ---------------------------
    // Compra rápida
    // ---------------------------
    /**
     * Evento: `BUY_NOW`
     * @payload `{ auctionId: number, token: string }`
     * @callback `{ success: boolean, error?: string }`
     * @remarks
     * - Ejecuta compra inmediata.
     * - Si tiene éxito, emite `AUCTION_CLOSED` y `TRANSACTION_CREATED`.
     */
    socket.on("BUY_NOW", async (data, callback) => {
      try {
        if (!auctionService) throw new Error("AuctionService no configurado");

        const success = await auctionService.buyNow(data.auctionId, data.token);
        callback?.({ success });

        if (success) {
          const auction = await auctionService.getAuctionById(data.auctionId);
          if (auction) {
            emitBuyNow(data.auctionId, AuctionMapper.toDto(auction));
          }

          emitTransactionCreated({
            type: "BUY_NOW",
            auctionId: data.auctionId,
            userId: socket.data.userId,
            amount: auction?.buyNowPrice,
          });
        }
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    // ---------------------------
    // Desconexión
    // ---------------------------
    /**
     * Evento: desconexión estándar de Socket.IO.
     * @param reason Motivo reportado por el servidor/cliente
     */
    socket.on("disconnect", (reason) => {
      console.log(`[SOCKET] Cliente desconectado: ${socket.id} (reason: ${reason})`);
    });
  });
}

// ---------------------------
// Funciones auxiliares (emit)
// ---------------------------

/**
 * Inyecta la instancia compartida de {@link AuctionService} para uso en eventos.
 * @param service Instancia de servicio a compartir con el módulo de sockets
 */
export function setAuctionServiceForSocket(service: AuctionService) {
  auctionService = service;
}

/**
 * Emite un broadcast de actualización de subasta.
 * @param _auctionId ID de la subasta (no usado en la emisión global actual)
 * @param auctionData DTO de subasta actualizado
 * @remarks
 * - Evento: `AUCTION_UPDATED`
 * - Actualmente se emite a **todos** (broadcast global). Si deseas segmentar por sala:
 *   usa `io.to(\`auction-\${_auctionId}\`).emit(...)`.
 */
export function emitBidUpdate(_auctionId: number, auctionData: any) {
  if (!io) return;
  io.emit("AUCTION_UPDATED", auctionData);
}

/**
 * Emite un broadcast de cierre de subasta con su DTO actualizado.
 * @param auctionId ID de la subasta cerrada
 * @param _auctionData (no usado; se reobtiene del servicio para evitar datos stale)
 * @remarks
 * - Evento: `AUCTION_CLOSED`
 * - Reconsulta la subasta al servicio para garantizar consistencia al emitir.
 */
export async function emitBuyNow(auctionId: number, _auctionData: any) {
  if (!io || !auctionService) return;
  const auction = await auctionService.getAuctionById(auctionId);
  if (!auction) return;
  io.emit("AUCTION_CLOSED", { closedAuction: AuctionMapper.toDto(auction) });
}

/**
 * Emite un broadcast cuando se crea una subasta nueva.
 * @param auctionData DTO de la subasta recién creada
 * @remarks Evento: `NEW_AUCTION`
 */
export function emitNewAuction(auctionData: any) {
  if (!io) return;
  io.emit("NEW_AUCTION", auctionData);
}

/**
 * Emite un broadcast cuando se registra una transacción (puja o buy-now).
 * @param transactionData Datos de la transacción `{ type: "BID" | "BUY_NOW", auctionId, userId, amount? }`
 * @remarks Evento: `TRANSACTION_CREATED`
 */
export function emitTransactionCreated(transactionData: any) {
  if (!io) return;
  io.emit("TRANSACTION_CREATED", transactionData);
}