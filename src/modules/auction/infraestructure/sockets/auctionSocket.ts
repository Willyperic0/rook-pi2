import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { AuctionService } from "../../domain/services/AuctionService";
import { AuctionMapper } from "../../application/mappers/AuctionMapper";
import { env } from "../config/env";

let io: Server;
let auctionService: AuctionService;

export function initAuctionSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: env.corsOrigin, methods: ["GET", "POST"] },
  });

  // Middleware de autenticación
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
    socket.on("disconnect", (reason) => {
      console.log(`[SOCKET] Cliente desconectado: ${socket.id} (reason: ${reason})`);
    });
  });
}

// ---------------------------
// Funciones auxiliares
// ---------------------------
export function setAuctionServiceForSocket(service: AuctionService) {
  auctionService = service;
}

export function emitBidUpdate(_auctionId: number, auctionData: any) {
  if (!io) return;
  io.emit("AUCTION_UPDATED", auctionData);
}

export async function emitBuyNow(auctionId: number, _auctionData: any) {
  if (!io || !auctionService) return;
  const auction = await auctionService.getAuctionById(auctionId);
  if (!auction) return;
  io.emit("AUCTION_CLOSED", { closedAuction: AuctionMapper.toDto(auction) });
}

export function emitNewAuction(auctionData: any) {
  if (!io) return;
  io.emit("NEW_AUCTION", auctionData);
}

export function emitTransactionCreated(transactionData: any) {
  if (!io) return;
  io.emit("TRANSACTION_CREATED", transactionData);
}
