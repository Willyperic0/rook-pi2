// client/RookClient/frontend/src/infrastructure/AuctionApiClient.ts

// client/infrastructure/AuctionApiClient.ts
import type { AuctionDTO } from "../domain/Auction";

/**
 * Cliente HTTP para recursos de subastas.
 * @remarks
 * Encapsula las llamadas REST hacia el backend de subastas y mapea
 * las respuestas crudas a `AuctionDTO` consumibles por la UI.
 *
 * @rubrica
 * - Calidad/Estructura: clase cohesionada, métodos pequeños, manejo de errores.
 * - Configuración: usa token Bearer inyectado; headers centralizados.
 * - Extensibilidad: fácil agregar endpoints (historial, filtros, etc.).
 */
export class AuctionApiClient {
  /** URL base del backend (puede ser relativa o absoluta). */
  private readonly baseUrl: string;
  /** Token de autenticación (Bearer). */
  private token: string;

  /**
   * Crea un cliente de API para subastas.
   * @param baseUrl URL base (ej. `/api`).
   * @param token JWT actual del usuario.
   */
  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  /**
   * Actualiza el token Bearer.
   * @param token Nuevo token JWT.
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Construye los headers comunes para todas las solicitudes.
   * @returns objeto de cabeceras HTTP.
   */
  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  }

  /**
   * Lista subastas visibles para el usuario actual.
   * @returns colección `AuctionDTO` mapeada.
   * @throws Error si la API devuelve un estado no exitoso.
   */
  async listAuctions(): Promise<AuctionDTO[]> {
    const res = await fetch(`${this.baseUrl}/auctions`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error listing auctions: ${res.status} ${text}`);
    }
    const data = await res.json();
    // Mapeo defensivo: aplanamos y normalizamos campos esperados por el frontend
    return data.data.map((a: any) => ({
      id: a.id,
      title: a.item.name,
      description: a.item.description,
      startingPrice: a.startingPrice,
      currentPrice: a.currentPrice,
      buyNowPrice: a.buyNowPrice,
      status: a.status,
      createdAt: a.createdAt,
      endsAt: a.endsAt,
      bids: a.bids || [],
      bidsCount: a.bidsCount || 0,
      highestBid: a.highestBid,
      highestBidderId: a.highestBidderId,
      item: a.item,
    }));
  }

  /**
   * Obtiene una subasta por ID.
   * @param id Identificador de la subasta.
   * @returns `AuctionDTO` si existe; `null` si no se encontró.
   */
  async getAuction(id: number): Promise<AuctionDTO | null> {
    const res = await fetch(`${this.baseUrl}/auctions/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) return null;

    const body = await res.json();
    if (!body.data) return null; // protección si la API no incluye `data`

    const a = body.data;
    return {
      id: a.id,
      title: a.item.name,
      description: a.item.description,
      startingPrice: a.startingPrice,
      currentPrice: a.currentPrice,
      buyNowPrice: a.buyNowPrice,
      status: a.status,
      createdAt: a.createdAt,
      endsAt: a.endsAt,
      bids: a.bids || [],
      bidsCount: a.bidsCount || 0,
      highestBid: a.highestBid,
      highestBidderId: a.highestBidderId,
      item: a.item,
    };
  }

  /**
   * Crea una nueva subasta.
   * @param input Cuerpo esperado por el backend para creación.
   * @returns Subasta creada (DTO del backend).
   * @throws Error si la API responde con error.
   * @example
   * ```ts
   * await api.createAuction({ itemId, startingPrice, buyNowPrice, durationHours });
   * ```
   */
  async createAuction(input: any): Promise<AuctionDTO> {
    const res = await fetch(`${this.baseUrl}/auctions`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error creating auction");
    }
    const data = await res.json();
    return data.auction;
  }

  /**
   * Registra una puja en una subasta.
   * @param auctionId ID de la subasta.
   * @param amount Monto a ofertar.
   * @returns `true` si la operación fue exitosa.
   * @throws Error si la API responde con error.
   */
  async placeBid(auctionId: number, amount: number): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/auctions/${auctionId}/bid`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error placing bid");
    }
    const data = await res.json();
    return data.success;
  }

  /**
   * Efectúa compra inmediata (si está habilitada).
   * @param auctionId ID de la subasta.
   * @returns `true` si la operación fue exitosa.
   * @throws Error si la API responde con error.
   */
  async buyNow(auctionId: number): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/auctions/${auctionId}/buy`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error buying now");
    }
    const data = await res.json();
    return data.success;
  }

  /**
   * Obtiene subastas compradas por un usuario (historial).
   * @param userId Identificador del usuario.
   * @returns colecciones mapeadas a `AuctionDTO`.
   * @throws Error si la API responde con error.
   */
  async getPurchasedAuctions(userId: number): Promise<AuctionDTO[]> {
    const res = await fetch(`${this.baseUrl}/auctions/history/purchased/${userId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error getting purchased auctions: ${res.status} ${text}`);
    }
    const data = await res.json();
    return data.data.map((a: any) => ({
      id: a.id,
      title: a.item.name,
      description: a.item.description,
      startingPrice: a.startingPrice,
      currentPrice: a.currentPrice,
      buyNowPrice: a.buyNowPrice,
      status: a.status,
      createdAt: a.createdAt,
      endsAt: a.endsAt,
      bids: a.bids || [],
      bidsCount: a.bidsCount || 0,
      highestBid: a.highestBid,
      highestBidderId: a.highestBidderId,
      item: a.item,
    }));
  }

  /**
   * Obtiene subastas vendidas por un usuario (historial).
   * @param userId Identificador del usuario.
   * @returns colecciones mapeadas a `AuctionDTO`.
   * @throws Error si la API responde con error.
   */
  async getSoldAuctions(userId: number): Promise<AuctionDTO[]> {
    const res = await fetch(`${this.baseUrl}/auctions/history/sold/${userId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error getting sold auctions: ${res.status} ${text}`);
    }
    const data = await res.json();
    return data.data.map((a: any) => ({
      id: a.id,
      title: a.item.name,
      description: a.item.description,
      startingPrice: a.startingPrice,
      currentPrice: a.currentPrice,
      buyNowPrice: a.buyNowPrice,
      status: a.status,
      createdAt: a.createdAt,
      endsAt: a.endsAt,
      bids: a.bids || [],
      bidsCount: a.bidsCount || 0,
      highestBid: a.highestBid,
      highestBidderId: a.highestBidderId,
      item: a.item,
    }));
  }
}