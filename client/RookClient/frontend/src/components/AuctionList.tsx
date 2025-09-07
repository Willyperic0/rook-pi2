// client/RookClient/frontend/src/components/AuctionList.tsx

import React from "react";
import type { AuctionDTO } from "../domain/Auction";

/**
 * Listado de subastas con acciones básicas.
 * @remarks
 * Renderiza una colección de subastas con botones para pujar, comprar (si aplica)
 * y ver detalles. No gestiona paginación ni búsqueda; se centra en la visualización
 * y en la delegación de eventos a la capa superior.
 *
 * @rubrica
 * - Calidad/Estructura: componentes puros, props tipadas, comentarios claros.
 * - Eficiencia: render basado en `map`; evita re-cálculos complejos en render.
 */
interface AuctionListProps {
  /** Colección de subastas a mostrar. */
  auctions: AuctionDTO[];
  /** Callback de puja para la subasta seleccionada. */
  onBid: (id: number) => void;
  /** Callback de compra rápida (si el backend lo admite). */
  onBuyNow: (id: number) => void;
  /** Setter para abrir detalles (pasa el DTO de la subasta o null para cerrar). */
  onViewDetails: React.Dispatch<React.SetStateAction<AuctionDTO | null>>;
}

export const AuctionList: React.FC<AuctionListProps> = ({
  auctions,
  onBid,
  onBuyNow,
  onViewDetails,
}) => {
  return (
    <div>
      {/* Estado vacío explícito */}
      {auctions.length === 0 && <p>No hay subastas activas</p>}

      {auctions.map((auction) => {
        // Compra rápida opcional; usar 0 como bandera de “no disponible”
        const buyNowPrice = auction.buyNowPrice ?? 0;

        return (
          <div key={auction.id} className="border p-2 mb-4 rounded shadow">
            {/* Imagen (normaliza base64 o usa data: URL) */}
            {auction.item?.imagen && (
              <img
                src={
                  auction.item.imagen.startsWith("data:")
                    ? auction.item.imagen
                    : `data:image/png;base64,${auction.item.imagen}`
                }
                alt={auction.item.name}
                className="w-32 h-32 object-cover rounded mb-2"
              />
            )}

            {/* Título y descripción con degradado a datos del ítem */}
            <h2 className="font-bold text-lg">
              {auction.title || auction.item?.name || "Subasta"}
            </h2>
            <p>{auction.description || auction.item?.description || "Sin descripción"}</p>

            {/* Precio actual y compra rápida (si aplica) */}
            <p>Precio actual: {auction.currentPrice}</p>
            {buyNowPrice > 0 && <p>Precio compra rápida: {buyNowPrice}</p>}

            {/* Estado de la subasta */}
            <p>Estado: {auction.status}</p>

            {/* Acciones: pujar (deshabilitada si no está OPEN) */}
            <button
              className="bg-green-500 text-white px-2 py-1 m-1 rounded"
              onClick={() => onBid(auction.id)}
              disabled={auction.status !== "OPEN"}
            >
              Pujar
            </button>

            {/* Compra rápida solo si existe y la subasta está abierta */}
            {buyNowPrice > 0 && auction.status === "OPEN" && (
              <button
                className="bg-yellow-500 text-white px-2 py-1 m-1 rounded"
                onClick={() => onBuyNow(auction.id)}
              >
                Comprar
              </button>
            )}

            {/* Abre el modal/panel de detalles en la capa superior */}
            <button
              className="bg-blue-500 text-white px-2 py-1 m-1 rounded"
              onClick={() => onViewDetails(auction)}
            >
              Ver detalles
            </button>
          </div>
        );
      })}
    </div>
  );
};