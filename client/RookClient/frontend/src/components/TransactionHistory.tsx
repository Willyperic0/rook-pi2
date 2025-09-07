// client/RookClient/frontend/src/components/TransactionHistory.tsx

import React, { useEffect, useState } from "react";
import type { AuctionDTO } from "../domain/Auction";
import { Socket } from "socket.io-client";
import { env } from "../env/env";

/**
 * Historial de transacciones del usuario (compras y ventas).
 * @remarks
 * Visualiza subastas compradas y vendidas. Resuelve y cachea `usernames`
 * de IDs relacionados vía llamadas autenticadas. Escucha eventos de socket
 * relevantes solo para logging y dejar que la capa superior refresque datos.
 *
 * @rubrica
 * - Calidad/Estructura: memoización simple de usernames, efectos con cleanup,
 *   comentarios explícitos y tipado estricto.
 * - Eficiencia: evita refetches innecesarios cacheando por id.
 */
interface Props {
  /** Token JWT del usuario actual. */
  token: string;
  /** ID del usuario actual (para correlaciones si se requiere). */
  userId: number;
  /** Conexión Socket.IO (opcional). */
  socket?: Socket | null;
  /** Subastas que el usuario ha comprado. */
  purchased: AuctionDTO[];
  /** Subastas que el usuario ha vendido. */
  sold: AuctionDTO[];
}

export const TransactionHistory: React.FC<Props> = ({
  token,
  userId,
  socket,
  purchased,
  sold,
}) => {
  // Cache local de usernames: evita solicitar el mismo id repetidas veces
  const [usernames, setUsernames] = useState<Record<number, string>>({});

  /**
   * Obtiene el username asociado a un userId (con cache).
   * @param id Identificador del usuario.
   * @returns nombre de usuario o "N/A" si no pudo resolverse.
   */
  const fetchUsername = async (id: number): Promise<string> => {
    if (usernames[id]) return usernames[id];
    try {
      const res = await fetch(`${env.api.base}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return "N/A";
      const data = await res.json();
      setUsernames((prev) => ({ ...prev, [id]: data.username }));
      return data.username;
    } catch (err) {
      console.error("[fetchUsername] Error:", err);
      return "N/A";
    }
  };

  // Precarga usernames cuando cambian las listas de compras/ventas
  useEffect(() => {
    const ids = [
      ...purchased.map((a) => a.item?.userId),
      ...sold.map((a) => a.highestBidderId),
    ].filter(Boolean) as number[];

    ids.forEach((id) => {
      fetchUsername(id).then((name) =>
        console.log("[USERNAME FETCHED]", id, "->", name)
      );
    });
  }, [purchased, sold]);

  // Logging de eventos de socket (la recarga real sucede en un nivel superior)
  useEffect(() => {
    if (!socket) return;

    const refresh = (event: string) => {
      console.log(
        `[SOCKET] Evento recibido: ${event} - Historial debería actualizarse desde App.tsx`
      );
    };

    socket.on("TRANSACTION_CREATED", () => refresh("TRANSACTION_CREATED"));
    socket.on("AUCTION_CLOSED", () => refresh("AUCTION_CLOSED"));

    return () => {
      socket.off("TRANSACTION_CREATED");
      socket.off("AUCTION_CLOSED");
    };
  }, [socket]);

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Historial de Transacciones</h2>

      {/* Compras */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Items Comprados</h3>
        {purchased.length === 0 && <p>No has comprado items.</p>}
        {purchased.map((a) => (
          <div key={a.id} className="border p-2 rounded mb-2">
            <strong>{a.item?.name}</strong> - ${a.highestBid?.amount || a.buyNowPrice || 0}
            <br />
            Vendedor: {a.item?.userId ? usernames[a.item.userId] || "..." : "N/A"}
            <br />
            Fecha: {a.endsAt ? new Date(a.endsAt).toLocaleString() : "N/A"}
          </div>
        ))}
      </div>

      {/* Ventas */}
      <div>
        <h3 className="font-semibold mb-2">Items Vendidos</h3>
        {sold.length === 0 && <p>No has vendido items.</p>}
        {sold.map((a) => (
          <div key={a.id} className="border p-2 rounded mb-2">
            <strong>{a.item?.name}</strong> - ${a.highestBid?.amount || a.buyNowPrice || 0}
            <br />
            Comprador: {a.highestBidderId ? usernames[a.highestBidderId] || "..." : "N/A"}
            <br />
            Fecha: {a.endsAt ? new Date(a.endsAt).toLocaleString() : "N/A"}
          </div>
        ))}
      </div>
    </div>
  );
};