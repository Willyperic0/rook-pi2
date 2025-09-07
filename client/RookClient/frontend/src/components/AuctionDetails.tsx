// client/RookClient/frontend/src/components/AuctionDetails.tsx

import React, { useEffect, useState } from "react";
import type { AuctionDTO } from "../domain/Auction";
import { AuctionService } from "../application/AuctionService";
import { AuctionApiClient } from "../infrastructure/AuctionApiClient";
import { env } from "../env/env";

/**
 * Panel/modal de detalles de una subasta.
 * @remarks
 * Refresca la subasta al montar (para traer datos más recientes), muestra metadatos,
 * precios, pujas y la imagen del ítem si existe. No muta estado del servidor; se limita
 * a consulta y render.
 *
 * @rubrica
 * - Calidad/Estructura: separación de responsabilidades (ApiClient/Service), manejo
 *   defensivo de nulos, comentarios útiles y tipado estricto.
 * - Robustez: captura básica de errores al cargar detalles.
 */
interface Props {
  /** Subasta seleccionada (estado inicial del modal). */
  auction: AuctionDTO;
  /** Token de sesión para llamadas autenticadas (si el backend lo exige). */
  token: string;
  /** Callback para cerrar el modal. */
  onClose: () => void;
}

export const AuctionDetails: React.FC<Props> = ({ auction, token, onClose }) => {
  // Mantiene la versión más fresca que llega del servidor (si difiere del prop inicial).
  const [freshAuction, setFreshAuction] = useState<AuctionDTO>(auction);

  // Inyección explícita de dependencias: cliente HTTP y servicio de aplicación.
  const apiClient = new AuctionApiClient(env.api.base, token);
  const auctionService = new AuctionService(apiClient);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        // Trae la subasta actualizada desde el backend
        const updated = await auctionService.getAuction(auction.id);
        // Solo actualiza el estado si el backend retornó un objeto válido
        if (updated) setFreshAuction(updated);
      } catch (err) {
        // Log mínimo; en prod se podría reportar a un sistema de observabilidad
        console.error("Error fetching auction details:", err);
      }
    };
    fetchAuction();
    // Dependencias: si cambia la subasta o la instancia de servicio, se reconsulta
  }, [auction, auctionService]);

  /**
   * Calcula el tiempo restante como string legible (h/m) o "Finalizada".
   * @param endDate Fecha de finalización (ISO) provista por el backend.
   */
  const getRemainingTime = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return "Finalizada";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m restantes`;
  };

  // Fallback seguro para compra rápida
  const buyNowPrice = freshAuction.buyNowPrice ?? 0;

  return (
    <div className="modal p-4 bg-white rounded shadow-md">
      {/* Título prioriza el de la subasta; cae al nombre del ítem */}
      <h2 className="text-xl font-bold mb-2">
        {freshAuction.title || freshAuction.item?.name}
      </h2>

      {/* Descripción general (subasta o ítem) */}
      <p className="mb-2">
        <strong>Descripción:</strong>{" "}
        {freshAuction.description || freshAuction.item?.description || "Sin descripción"}
      </p>

      {/* Precios */}
      <p className="mb-2">
        <strong>Precio actual:</strong> {freshAuction.currentPrice}
      </p>

      {buyNowPrice > 0 && (
        <p className="mb-2">
          <strong>Precio compra rápida:</strong> {buyNowPrice}
        </p>
      )}

      {/* Estado y datos de pujas */}
      <p className="mb-2">
        <strong>Estado:</strong> {freshAuction.status}
      </p>

      <p className="mb-2">
        <strong>Pujas totales:</strong> {freshAuction.bidsCount || 0}
      </p>

      {freshAuction.highestBid && (
        <p className="mb-2">
          <strong>Mayor puja:</strong> {freshAuction.highestBid.amount} por usuario {freshAuction.highestBid.userId}
        </p>
      )}

      {/* Fechas y tiempo restante */}
      <p className="mb-2">
        <strong>Inicio:</strong> {new Date(freshAuction.createdAt).toLocaleString()}
      </p>
      <p className="mb-2">
        <strong>Finaliza:</strong> {new Date(freshAuction.endsAt).toLocaleString()}
      </p>
      <p className="mb-2">
        <strong>Tiempo restante:</strong> {getRemainingTime(freshAuction.endsAt)}
      </p>

      {/* Información del ítem asociado, si existe */}
      {freshAuction.item && (
        <div className="mb-2">
          <strong>Item:</strong> {freshAuction.item.name} - {freshAuction.item.description}
          <br />
          <strong>Tipo:</strong> {freshAuction.item.type}
          {freshAuction.item.heroType && <span> ({freshAuction.item.heroType})</span>}
          <br />
          {freshAuction.item.imagen && (
            // En backend suele llegar base64; si llegara cruda, normalizamos en el mapper/API
            <img src={freshAuction.item.imagen} alt={freshAuction.item.name} className="w-32 h-32 object-cover mt-2" />
          )}
        </div>
      )}

      {/* Cierre del modal */}
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>
        Cerrar
      </button>
    </div>
  );
};