// src/api/auctionSocket.ts
import { io, Socket } from "socket.io-client";
import type { BidDTO } from "../domain/Auction";

/**
 * URL y path de socket desde variables Vite (.env):
 * - VITE_WS_URL:  p.ej. "http://nexusroot.bucaramanga.upb.edu.co/socket.io"  ó  "/socket.io"
 * - VITE_SOCKET_PATH: normalmente "/socket.io"
 */
const RAW_URL = (import.meta.env.VITE_WS_URL ?? "").trim();
// Si RAW_URL está vacío, socket.io usará el mismo origen del sitio (recomendado con proxy)
const SOCKET_URL: string | undefined = RAW_URL === "" ? undefined : RAW_URL;
const SOCKET_PATH = (import.meta.env.VITE_SOCKET_PATH ?? "/socket.io").trim() || "/socket.io";

let socket: Socket | null = null;

/**
 * Conecta (singleton).
 * Para máxima estabilidad inicial dejamos SOLO polling (upgrade deshabilitado).
 * Cuando quieras WS real, cambia abajo:
 *   transports: ["websocket","polling"], upgrade: true
 */
export function connectAuctionSocket(opts?: { token?: string }): Socket {
  if (!socket || socket.disconnected) {
    socket = io(SOCKET_URL, {
      path: SOCKET_PATH,
      transports: ["polling"],
      upgrade: false,

      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      rejectUnauthorized: false,

      ...(opts?.token ? { auth: { token: opts.token } } : {}),
    });
  }
  return socket!;
}

// Listener de ejemplo (por si lo necesitas en otros módulos)
export function onBuyNow(
  callback: (data: { id: number; status: string; highestBid?: BidDTO; buyNowPrice: number }) => void
) {
  socket?.on("buyNow", callback);
}

/** Cierre seguro (sin ws.close() directo) */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

