// auctionSocket.ts
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { AuctionService } from "../../domain/services/AuctionService";
import { AuctionMapper } from "../../application/mappers/AuctionMapper";

let io: Server;
let auctionService: AuctionService;

export function initAuctionSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // frontend
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("[SOCKET] Cliente conectado:", socket.id);

    // Unirse a sala de subasta específica
    socket.on("join-auction", (auctionId: number) => {
      socket.join(`auction-${auctionId}`);
      console.log(`[SOCKET] Cliente ${socket.id} se unió a auction-${auctionId}`);
    });

    socket.on("leave-auction", (auctionId: number) => {
      socket.leave(`auction-${auctionId}`);
      console.log(`[SOCKET] Cliente ${socket.id} salió de auction-${auctionId}`);
    });

    // Crear subasta
    socket.on("CREATE_AUCTION", async (data, callback) => {
      console.log("[SOCKET] CREATE_AUCTION recibido:", data);
      try {
        if (!auctionService) throw new Error("AuctionService no configurado");
        const result = await auctionService.createAuction(data);
        callback?.({ success: true, auction: result.auction });
        emitNewAuction(result.auction); // a todos
      } catch (err: any) {
        console.error("[SOCKET] Error CREATE_AUCTION:", err.message);
        callback?.({ success: false, error: err.message });
      }
    });

    // Pujar en subasta
    socket.on("PLACE_BID", async (data, callback) => {
      console.log("[SOCKET] PLACE_BID recibido:", data);
      try {
        if (!auctionService) throw new Error("AuctionService no configurado");
        const success = await auctionService.placeBid(data.auctionId, data.userId, data.amount);
        callback?.({ success });
        if (success) {
          const auction = await auctionService.getAuctionById(data.auctionId);
          emitBidUpdate(data.auctionId, AuctionMapper.toDto(auction!));
        }
      } catch (err: any) {
        console.error("[SOCKET] Error PLACE_BID:", err.message);
        callback?.({ success: false, error: err.message });
      }
    });

    // Compra rápida
    socket.on("BUY_NOW", async (data, callback) => {
      console.log("[SOCKET] BUY_NOW recibido:", data);
      try {
        if (!auctionService) throw new Error("AuctionService no configurado");
        const success = await auctionService.buyNow(data.auctionId, data.userId);
        callback?.({ success });
        if (success) {
          const auction = await auctionService.getAuctionById(data.auctionId);
          emitBuyNow(data.auctionId, AuctionMapper.toDto(auction!));
        }
      } catch (err: any) {
        console.error("[SOCKET] Error BUY_NOW:", err.message);
        callback?.({ success: false, error: err.message });
      }
    });
  });
}

// Asignar el service desde composition root
export function setAuctionServiceForSocket(service: AuctionService) {
  auctionService = service;
}

// Emitir actualización de puja a todos en la sala de esa subasta
export function emitBidUpdate(auctionId: number, auctionData: any) {
  if (!io) return;
  io.to(`auction-${auctionId}`).emit("AUCTION_UPDATED", auctionData);
}

// Emitir cierre de subasta / compra rápida
export function emitBuyNow(auctionId: number, auctionData: any) {
  if (!io) return;
  io.to(`auction-${auctionId}`).emit("AUCTION_CLOSED", auctionData);
}

// Emitir nueva subasta a todos
export function emitNewAuction(auctionData: any) {
  if (!io) return;
  io.emit("NEW_AUCTION", auctionData);
}
