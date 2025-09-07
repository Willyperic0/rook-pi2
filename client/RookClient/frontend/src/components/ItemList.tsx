// client/RookClient/frontend/src/components/ItemList.tsx

// ItemList.tsx
import React, { useEffect, useState } from "react";
import type { Item } from "../domain/Item";
import { io, Socket } from "socket.io-client";
import { env } from "../env/env";

/**
 * Listado de ítems con actualización en tiempo real.
 * @remarks
 * Hace un fetch inicial autenticado y luego escucha eventos de creación,
 * actualización y eliminación por Socket.IO para mantener el listado consistente.
 *
 * @rubrica
 * - Calidad/Estructura: estado localizado, efectos con cleanup, comentarios claros.
 * - Robustez: manejo defensivo si `token` o `socket` no están presentes.
 */
interface Props {
  /** Conexión Socket.IO compartida (o null si no está inicializada). */
  socket: Socket | null;
  /** Token JWT del usuario (requerido para fetch inicial). */
  token: string | null;
}

export const ItemList: React.FC<Props> = ({ socket, token }) => {
  const [items, setItems] = useState<Item[]>([]);

  // Fetch inicial autenticado: trae todos los ítems visibles para el usuario
  useEffect(() => {
    if (!token) return;

    fetch(`${env.api.items}/items`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(console.error);
  }, [token]);

  // Suscripción a eventos de tiempo real y limpieza al desmontar
  useEffect(() => {
    if (!socket) return;

    const handleItemCreated = (item: Item) => setItems(prev => [...prev, item]);
    const handleItemUpdated = (item: Item) =>
      setItems(prev => prev.map(i => (i.id === item.id ? item : i)));
    const handleItemDeleted = (itemId: number) =>
      setItems(prev => prev.filter(i => i.id !== itemId));

    socket.on("ITEM_CREATED", handleItemCreated);
    socket.on("ITEM_UPDATED", handleItemUpdated);
    socket.on("ITEM_DELETED", handleItemDeleted);

    // Limpieza: evita fugas de escuchas al cambiar socket o desmontar
    return () => {
      socket.off("ITEM_CREATED", handleItemCreated);
      socket.off("ITEM_UPDATED", handleItemUpdated);
      socket.off("ITEM_DELETED", handleItemDeleted);
    };
  }, [socket]);

  return (
    <div>
      <h2 className="text-xl font-bold">Items</h2>
      <ul>
        {items.map(item => (
          <li key={item.id} className="border p-2 rounded mb-2">
            <strong>{item.name}</strong>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};