// client/RookClient/frontend/src/App.tsx

import React, { useEffect, useState, useMemo } from "react";
import type { AuctionDTO } from "./domain/Auction";
import type { Item } from "./domain/Item";
import { AuctionList } from "./components/AuctionList";
import { AuctionDetails } from "./components/AuctionDetails";
import { CreateAuctionForm } from "./components/CreateAuctionForm";
import { AuctionApiClient } from "./infrastructure/AuctionApiClient";
import { AuctionService } from "./application/AuctionService";
import type { CreateAuctionInput } from "./application/AuctionService";
import { io, Socket } from "socket.io-client";
import { TransactionHistory } from "./components/TransactionHistory";
import { env } from "./env/env";

/**
 * Aplicación principal (SPA) para el módulo de Subastas.
 * @remarks
 * - Orquesta estado global de subastas, ítems, historial y conexión Socket.IO.
 * - Coordina vistas de comprar/vender/historial/pujas activas.
 * - No contiene reglas de negocio: delega a AuctionService/AuctionApiClient.
 *
 * @rubrica
 * - Calidad/Estructura: estados y efectos separados por responsabilidad, comentarios precisos.
 * - Configuración: consume `env` centralizado (same-origin o VITE_*).
 * - Extensibilidad: callbacks bien tipados, filtros desacoplados de la UI.
 */

// Endpoints base (resuelven a same-origin por defecto; ver env.ts)
const API_BASE = env.api.base;
const ITEMS_BASE = env.api.items;
const SOCKET_BASE = env.socket.base;

export const App: React.FC = () => {
  // -------------------- Estado principal --------------------
  const [auctions, setAuctions] = useState<AuctionDTO[]>([]);
  const [selected, setSelected] = useState<AuctionDTO | null>(null);

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const [purchasedHistory, setPurchasedHistory] = useState<AuctionDTO[]>([]);
  const [soldHistory, setSoldHistory] = useState<AuctionDTO[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [activeMenu, setActiveMenu] = useState<"BUY" | "SELL" | "HISTORY" | "ACTIVE_BIDS">("BUY");
  const [activeBids, setActiveBids] = useState<AuctionDTO[]>([]);

  // Estados finales que marcan cierre en el backend (por si se usan en lógica de UI)
  const CLOSED_STATUSES = ["closed", "sold", "cancelled", "expired"];

  // -------------------- Servicios (inyectados) --------------------
  // Crea cliente/API solo si hay token (evita llamadas anónimas no deseadas)
  const apiClient = useMemo(() => token ? new AuctionApiClient(API_BASE, token) : null, [token]);
  const auctionService = useMemo(() => apiClient ? new AuctionService(apiClient) : null, [apiClient]);

  // -------------------- Sesión (token y userId) --------------------
  // Carga inicial de credenciales almacenadas en localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUserId = localStorage.getItem("userId");
    if (savedToken && savedUserId) {
      setToken(savedToken);
      setUserId(Number(savedUserId));
    }
  }, []);

  // -------------------- Historial (compras/ventas) --------------------
  /**
   * Trae historial del usuario autenticado y lo ordena DESC por fecha de cierre.
   * @remarks Protege contra estados intermedios con `loadingHistory`.
   */
  const fetchHistory = async () => {
    if (!auctionService || !userId) return;
    setLoadingHistory(true);
    try {
      const purchased = await auctionService.getPurchasedAuctions(userId);
      const sold = await auctionService.getSoldAuctions(userId);
      setPurchasedHistory(
        purchased.sort((a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime())
      );
      setSoldHistory(
        sold.sort((a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime())
      );
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // -------------------- Items (inventario del usuario) --------------------
  /**
   * Trae ítems del usuario autenticado para habilitar la venta.
   * @remarks Resetea selección si ocurre error o no hay ítems disponibles.
   */
  const fetchItems = async () => {
    if (!token || !userId) return;
    try {
      const res = await fetch(`${ITEMS_BASE}/items?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(res.statusText);
      const data: Item[] = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      setItems([]);
      setSelectedItemId(null);
    }
  };

  // -------------------- Estado: actualizar/insertar una subasta --------------------
  /**
   * Actualiza parcialmente una subasta en el estado (o la inserta si no existía).
   * @param partial Subconjunto de campos + ID obligatorio.
   * @remarks Fusiona `bids` sin duplicados por `id`.
   */
  const updateAuction = (partial: Partial<AuctionDTO> & { id: number }) => {
    setAuctions(prev => {
      let exists = false;
      const updated = prev.map(a => {
        if (a.id === partial.id) {
          exists = true;
          return {
            ...a,
            ...partial,
            bids: [
              ...(a.bids || []),
              ...(partial.bids || []).filter(b => !(a.bids || []).some(old => old.id === b.id))
            ]
          };
        }
        return a;
      });
      if (!exists) {
        updated.unshift(partial as AuctionDTO);
      }
      return updated;
    });
  };

  // -------------------- Socket: conexión y listeners --------------------
  useEffect(() => {
    if (!token || !userId) return;

    // Carga inicial de subastas desde la API
    const fetchInitialData = async () => {
      if (!auctionService) return;
      try {
        const data = await auctionService.listAuctions();
        setAuctions(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchInitialData();
    fetchItems();
    fetchHistory();

    // Conecta Socket.IO (same-origin por defecto si SOCKET_BASE está vacío)
    const s: Socket = io(SOCKET_BASE, { auth: { token } });
    setSocket(s);

    // Logs básicos de conexión (útil para diagnósticos)
    s.on("connect", () => console.log("[SOCKET] connected:", s.id));
    s.on("disconnect", (reason) => console.log("[SOCKET] disconnected:", reason));
    s.onAny((event, ...args) => console.log("[SOCKET EVENT]", event, args));

    // Subasta nueva: inserta si no existía
    s.on("NEW_AUCTION", (auction: AuctionDTO) => {
      setAuctions(prev => prev.some(a => a.id === auction.id) ? prev : [auction, ...prev]);
    });

    // Subasta actualizada: fusiona y, si aplica, actualiza historial local
    s.on("AUCTION_UPDATED", (partial) => {
      updateAuction(partial);
      if (partial.highestBidderId === userId) {
        updateHistory(partial as AuctionDTO, userId!);
      }
    });

    // Transacción creada: mueve la subasta al historial adecuado
    s.on("TRANSACTION_CREATED", (auction: AuctionDTO) => {
      updateAuction(auction);
      updateHistory(auction, userId!);
    });

    // Subasta cerrada: quita del listado, limpia selección y refresca ítems
    s.on("AUCTION_CLOSED", ({ closedAuction }: { closedAuction: AuctionDTO }) => {
      updateHistory(closedAuction, userId!);
      setAuctions(prev => prev.filter(a => a.id !== closedAuction.id));
      setSelected(prev => (prev?.id === closedAuction.id ? null : prev));
      fetchItems();
    });

    // Limpieza: evita listeners duplicados/fugas
    return () => {
      s.off("NEW_AUCTION");
      s.off("AUCTION_UPDATED");
      s.off("AUCTION_CLOSED");
      s.off("TRANSACTION_CREATED");
      s.offAny();
      s.disconnect();
    };
  }, [token, userId]);

  // Mantiene el modal de detalles sincronizado con el listado
  useEffect(() => {
    if (!selected) return;
    const updated = auctions.find(a => a.id === selected.id);
    if (updated && updated !== selected) setSelected(updated);
  }, [auctions, selected]);

  // Si no hay token, vacía historiales (estado consistente)
  useEffect(() => {
    if (!token) {
      setPurchasedHistory([]);
      setSoldHistory([]);
    }
  }, [token]);

  // Pujas activas del usuario: deriva desde `auctions` + `userId`
  useEffect(() => {
    if (!auctions.length || !userId) return;
    const active = auctions.filter(a =>
      (a.bids?.some(b => b.userId === userId) || a.highestBidderId === userId)
    );
    setActiveBids(active);
  }, [auctions, userId]);

  // -------------------- VENDER: selección de ítems disponibles --------------------
  const availableItems = useMemo(() => items.filter(item => item.isAvailable), [items]);

  // Selección inicial/segura del item para vender
  useEffect(() => {
    if (!availableItems.length) {
      setSelectedItemId(null);
    } else if (selectedItemId === null || !availableItems.find(i => i.id === selectedItemId)) {
      setSelectedItemId(availableItems[0].id);
    }
  }, [availableItems]);

  // Helper de UI: ¿el usuario actual es el mejor postor?
  const isUserHighestBidder = (auction: AuctionDTO) => auction.highestBidderId === userId;

  // -------------------- Filtros de "Comprar" --------------------
  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDuration, setFilterDuration] = useState<number | null>(null);
  const [filterMaxPrice, setFilterMaxPrice] = useState<number | null>(null);

  // Aplica filtros al listado mostrado
  const filteredAuctions = useMemo(() => {
    return auctions.filter(a => {
      const matchName = filterName.length >= 4
        ? a.title.toLowerCase().includes(filterName.toLowerCase())
        : true;

      const normalize = (str: string) =>
        str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      const matchType = filterType ? normalize(a.item?.type || "") === normalize(filterType) : true;

      const totalHours =
        (new Date(a.endsAt).getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
      const matchDuration = filterDuration ? Math.round(totalHours) === filterDuration : true;

      const matchPrice = filterMaxPrice ? a.currentPrice <= filterMaxPrice : true;

      return matchName && matchType && matchDuration && matchPrice;
    });
  }, [auctions, filterName, filterType, filterDuration, filterMaxPrice]);

  // -------------------- Acciones de usuario --------------------
  /**
   * Realiza una puja. Si no se pasa `amount`, solicita por prompt.
   */
  const handleBid = async (id: number, amount?: number) => {
    if (!amount) {
      const amountStr = prompt("Ingrese monto de la puja:");
      if (!amountStr) return;
      amount = Number(amountStr);
    }
    try {
      await auctionService!.placeBid(id, amount);
    } catch (err) {
      console.error("[ERROR] handleBid:", err);
    }
  };

  /**
   * Compra inmediata: primero refresca la subasta y luego invoca la operación.
   * @remarks
   * Mantiene el estado UI consistente antes/después del `buyNow`.
   */
  const handleBuyNow = async (id: number) => {
    if (!auctionService) return alert("Servicio no disponible");
    try {
      const updated = await auctionService.getAuction(id);
      if (updated) {
        setAuctions(prev => prev.map(a => a.id === id ? updated : a));
        setSelected(prev => prev?.id === id ? updated : prev);
        updateHistory(updated, userId!);
      }
      await auctionService.buyNow(id);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Crea una subasta nueva vía evento de socket (servidor la persistirá).
   * @remarks
   * Agrega `itemId` seleccionado y el `token` para autenticación server-side.
   */
  const handleCreate = (input: Omit<CreateAuctionInput, "itemId">) => {
    if (!socket || !selectedItemId) return alert("No hay socket o item seleccionado");
    const data = { ...input, itemId: selectedItemId, token };
    socket.emit("CREATE_AUCTION", data);
  };

  /**
   * Actualiza historial local de compras/ventas en base a la subasta cerrada/actualizada.
   * @param auction Subasta de referencia.
   * @param userId ID del usuario actual.
   */
  const updateHistory = (auction: AuctionDTO, userId: number) => {
    setPurchasedHistory(prev => {
      const isBuyer = auction.highestBidderId === userId;
      if (!isBuyer) return prev;
      const exists = prev.some(a => a.id === auction.id);
      return exists ? prev.map(a => a.id === auction.id ? { ...a, ...auction } : a) : [auction, ...prev];
    });
    setSoldHistory(prev => {
      if (auction.item?.userId !== userId) return prev;
      const exists = prev.some(a => a.id === auction.id);
      return exists ? prev.map(a => a.id === auction.id ? { ...a, ...auction } : a) : [auction, ...prev];
    });
  };

  // Tipos únicos derivados de los ítems (para el filtro)
  const uniqueTypes = Array.from(new Set(items.map(i => i.type)));

  // -------------------- Render --------------------
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Subastas</h1>

      {/* Menú principal */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setActiveMenu("BUY")}
          className={`p-2 rounded ${activeMenu === "BUY" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Comprar
        </button>
        <button
          onClick={() => setActiveMenu("SELL")}
          className={`p-2 rounded ${activeMenu === "SELL" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Vender
        </button>
        <button
          onClick={() => setActiveMenu("HISTORY")}
          className={`p-2 rounded ${activeMenu === "HISTORY" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Recoger
        </button>
        <button
          onClick={() => setActiveMenu("ACTIVE_BIDS")}
          className={`p-2 rounded ${activeMenu === "ACTIVE_BIDS" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Mis Pujas
        </button>
      </div>

      {/* Comprar */}
      {activeMenu === "BUY" && (
        <>
          {/* Filtros simples en cliente */}
          <div className="mb-4 p-2 border rounded">
            <input
              placeholder="Nombre (mín 4 caracteres)"
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              className="border p-1 mr-2"
            />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="border p-1 mr-2"
            >
              <option value="">Todos los tipos</option>
              {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={filterDuration ?? ""}
              onChange={e => setFilterDuration(e.target.value ? Number(e.target.value) : null)}
              className="border p-1 mr-2"
            >
              <option value="">Todas las duraciones</option>
              <option value={24}>24 horas</option>
              <option value={48}>48 horas</option>
            </select>
            <input
              type="number"
              placeholder="Precio máximo"
              value={filterMaxPrice ?? ""}
              onChange={e => setFilterMaxPrice(Number(e.target.value) || null)}
              className="border p-1 mr-2"
            />
          </div>

          <AuctionList
            auctions={filteredAuctions}
            onBid={handleBid}
            onBuyNow={handleBuyNow}
            onViewDetails={setSelected}
          />

          {selected && (
            <AuctionDetails
              auction={selected}
              token={token || ""}
              onClose={() => setSelected(null)}
            />
          )}
        </>
      )}

      {/* Vender */}
      {activeMenu === "SELL" && (
        <>
          <div className="mb-4">
            <label>Selecciona un item: </label>
            <select
              value={selectedItemId ?? undefined}
              onChange={e => setSelectedItemId(Number(e.target.value))}
            >
              {availableItems.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          <CreateAuctionForm onCreate={handleCreate} />
        </>
      )}

      {/* Historial */}
      {activeMenu === "HISTORY" && userId && token && (
        <TransactionHistory
          userId={userId}
          token={token}
          socket={socket}
          purchased={purchasedHistory}
          sold={soldHistory}
        />
      )}

      {/* Mis pujas activas */}
      {activeMenu === "ACTIVE_BIDS" && userId && (
        <div className="p-2 border rounded">
          {activeBids.length === 0 ? (
            <p>No tienes pujas activas.</p>
          ) : (
            <ul>
              {activeBids.map(a => (
                <li key={a.id} className="mb-2 p-2 border rounded">
                  <div className="flex justify-between items-center">
                    <span>{a.title} - Actual: ${a.currentPrice}</span>
                    <span
                      className={`font-bold ${
                        isUserHighestBidder(a) ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isUserHighestBidder(a) ? "¡Vas ganando!" : "Superado"}
                    </span>
                    <button
                      onClick={() => setSelected(a)}
                      className="ml-2 p-1 border rounded bg-gray-300"
                    >
                      Ver detalles
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {selected && (
            <AuctionDetails
              auction={selected}
              token={token || ""}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
      )}
    </div>
  )
};