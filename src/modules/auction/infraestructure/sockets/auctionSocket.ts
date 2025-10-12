import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { IAuctionService } from "../../domain/services/IAuctionService";
import { AuctionMapper } from "../../application/mappers/AuctionMapper";
import { env } from "../config/env";

let io: Server;
let auctionService: IAuctionService;

/**
 * Inicializa la configuración del socket para el sistema de subastas.
 * Se encarga de manejar los eventos de creación de subastas, pujas y compras rápidas.
 * 
 * @param server Instancia del servidor HTTP de Express sobre el cual se monta Socket.IO
 */
export function initAuctionSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: env.corsOrigin, methods: ["GET", "POST"] },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[SOCKET] Cliente conectado: ${socket.id}`);

    // ---------------------------
    // Crear subasta
    // ---------------------------
    /**
     * Evento: CREATE_AUCTION
     * Crea una nueva subasta a partir de los datos enviados por el cliente.
     * El usuario creador se une automáticamente a la sala de su subasta.
     * 
     * @param data Objeto con los datos de la subasta (incluye username)
     * @param callback Callback para enviar respuesta al cliente
     */
    socket.on("CREATE_AUCTION", async (data, callback) => {
      try {
        if (!auctionService) throw new Error("AuctionService no configurado");

        const result = await auctionService.createAuction(data, data.username);

        const roomName = `auction-${result.auction.id}`;
        socket.join(roomName);
        console.log(`[SOCKET] Usuario ${data.username} se unió a la sala ${roomName}`);

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
     * Evento: PLACE_BID
     * Permite a un usuario realizar una puja en una subasta activa.
     * 
     * @param data Contiene el ID de la subasta, username del postor y monto ofrecido
     * @param callback Callback para notificar al cliente si la puja fue exitosa
     */
    socket.on("PLACE_BID", async (data, callback) => {
      try {
        if (!auctionService) throw new Error("AuctionService no configurado");

        const success = await auctionService.placeBid(data.auctionId, data.username, data.amount);
        callback?.({ success });

        if (success) {
          const auction = await auctionService.getAuctionById(data.auctionId);
          if (auction) {
            emitBidUpdate(data.auctionId, AuctionMapper.toDto(auction));
          }

          emitTransactionCreated({
            type: "BID",
            auctionId: data.auctionId,
            username: data.username,
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
     * Evento: BUY_NOW
     * Permite realizar la compra inmediata de un ítem de subasta al precio de compra directa.
     * 
     * @param data Contiene el ID de la subasta y username del comprador
     * @param callback Callback para informar el resultado de la compra
     */
    socket.on("BUY_NOW", async (data, callback) => {
      try {
        if (!auctionService) throw new Error("AuctionService no configurado");

        const success = await auctionService.buyNow(data.auctionId, data.username);
        callback?.({ success });

        if (success) {
          const auction = await auctionService.getAuctionById(data.auctionId);
          if (auction) {
            emitBuyNow(data.auctionId, AuctionMapper.toDto(auction));
          }

          emitTransactionCreated({
            type: "BUY_NOW",
            auctionId: data.auctionId,
            username: data.username,
            amount: auction?.getBuyNowPrice(),
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
     * Evento: disconnect
     * Notifica cuando un cliente se desconecta del socket.
     */
    socket.on("disconnect", (reason) => {
      console.log(`[SOCKET] Cliente desconectado: ${socket.id} (reason: ${reason})`);
    });
  });
}

// ---------------------------
// Funciones auxiliares
// ---------------------------

/**
 * Configura el servicio de subastas para su uso dentro de los eventos del socket.
 * 
 * @param service Instancia del servicio de subastas que implementa IAuctionService
 */
export function setAuctionServiceForSocket(service: IAuctionService) {
  auctionService = service;
}

/**
 * Emite una actualización global cuando una subasta recibe una nueva puja.
 * 
 * @param _auctionId ID de la subasta actualizada
 * @param auctionData Datos actualizados de la subasta
 */
export function emitBidUpdate(_auctionId: string, auctionData: any) {
  if (!io) return;
  io.emit("AUCTION_UPDATED", auctionData);
}

/**
 * Emite un evento global cuando se realiza una compra rápida en una subasta.
 * 
 * @param auctionId ID de la subasta finalizada
 * @param _auctionData Datos asociados a la subasta
 */
export async function emitBuyNow(auctionId: string, _auctionData: any) {
  if (!io || !auctionService) return;
  const auction = await auctionService.getAuctionById(auctionId);
  if (!auction) return;
  io.emit("AUCTION_CLOSED", { closedAuction: AuctionMapper.toDto(auction) });
}

/**
 * Emite un evento global cuando se crea una nueva subasta.
 * 
 * @param auctionData Datos de la subasta recién creada
 */
export function emitNewAuction(auctionData: any) {
  if (!io) return;
  io.emit("NEW_AUCTION", auctionData);
}

/**
 * Emite un evento global cuando se registra una nueva transacción (puja o compra rápida).
 * 
 * @param transactionData Detalles de la transacción realizada
 */
export function emitTransactionCreated(transactionData: any) {
  if (!io) return;
  io.emit("TRANSACTION_CREATED", transactionData);
}