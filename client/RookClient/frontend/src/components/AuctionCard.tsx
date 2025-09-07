// client/RookClient/frontend/src/components/AuctionCard.tsx

import React from "react";
import type { AuctionDTO } from "../domain/Auction";

/**
 * Tarjeta de una subasta individual.
 * @remarks
 * Componente de presentación que muestra imagen, título, precio actual y acciones
 * (pujar, compra rápida y ver detalles). No contiene lógica de negocio; delega
 * las acciones a callbacks recibidos por props.
 *
 * @rubrica
 * - Calidad/Estructura: props tipadas, responsabilidades claras, comentarios precisos.
 * - Extensibilidad: admite `buyNowPrice` opcional y `onViewDetails` con el DTO completo.
 */
interface Props {
  /** Subasta a renderizar (DTO plano consumido por el frontend). */
  auction: AuctionDTO;
  /** Callback para ejecutar una puja sobre la subasta (usa el id numérico). */
  onBid: (id: number) => void;
  /** Callback para ejecutar compra rápida (si está disponible). */
  onBuyNow: (id: number) => void;
  /** Callback para abrir un modal o panel con los detalles completos de la subasta. */
  onViewDetails: (auction: AuctionDTO) => void;
}

export const AuctionCard: React.FC<Props> = ({
  auction,
  onBid,
  onBuyNow,
  onViewDetails,
}) => {
  // Fallback seguro cuando el backend no envía precio de compra rápida
  const buyNowPrice = auction.buyNowPrice ?? 0;

  return (
    <div className="border rounded p-4 m-2 w-64 shadow">
      {/* Contenedor de imagen: muestra base64 o marcador "Sin imagen" */}
      <div className="h-40 bg-gray-200 flex items-center justify-center">
        {auction.item?.imagen ? (
          <img
            src={
              auction.item.imagen.startsWith("data:")
                ? auction.item.imagen
                : `data:image/png;base64,${auction.item.imagen}`
            }
            alt={auction.item.name}
            className="max-h-40 object-contain"
          />
        ) : (
          <span>Sin imagen</span>
        )}
      </div>

      {/* Título: prioriza título de la subasta y cae al nombre del item */}
      <h3 className="font-bold mt-2">
        {auction.title || auction.item?.name}
      </h3>

      {/* Precio actual siempre visible */}
      <p>Precio actual: ${auction.currentPrice}</p>

      {/* Compra rápida solo si el backend la habilita (> 0) */}
      {buyNowPrice > 0 && <p>Precio compra rápida: ${buyNowPrice}</p>}

      {/* Estado (OPEN, CLOSED, WON, etc.) */}
      <p>Estado: {auction.status}</p>

      {/* Acciones principales */}
      <div className="flex justify-between mt-2">
        <button
          onClick={() => onBid(auction.id)}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Pujar
        </button>

        {buyNowPrice > 0 && (
          <button
            onClick={() => onBuyNow(auction.id)}
            className="bg-green-500 text-white px-2 py-1 rounded"
          >
            Compra rápida
          </button>
        )}
      </div>

      {/* Acción secundaria: detalles (útil para abrir modal) */}
      <button
        onClick={() => onViewDetails(auction)}
        className="mt-2 text-sm text-gray-600"
      >
        Más detalles
      </button>
    </div>
  );
};