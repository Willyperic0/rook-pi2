// src/modules/inventory/domain/repositories/HttpItemRepository.ts

import axios from "axios";
import { Item } from "../models/Item";
import { ItemRepository } from "../../domain/repositories/ItemRepository";

/**
 * Implementación HTTP de {@link ItemRepository}.
 * @remarks
 * Usa Axios para consumir el microservicio de Items.
 */
export class HttpItemRepository implements ItemRepository {
  /**
   * @param baseUrl URL base del servicio de items (p. ej., `/items` o `http://items:3002`)
   */
  constructor(private readonly baseUrl: string) {}

  async findById(id: number): Promise<Item | null> {
    try {
      const res = await axios.get<Item>(`${this.baseUrl}/items/${id}`);
      return res.data;
    } catch {
      return null;
    }
  }

  async findAll(): Promise<Item[]> {
    const res = await axios.get<Item[]>(`${this.baseUrl}/items`);
    return res.data;
  }

  async findByUserId(userId: number): Promise<Item[]> {
    const res = await axios.get<Item[]>(`${this.baseUrl}/items?userId=${userId}`);
    return res.data;
  }

  /**
   * Actualiza propiedades arbitrarias del ítem.
   * @param id ID del ítem
   * @param data Parcial con campos a modificar
   */
  async updateItem(id: number, data: Partial<Item>): Promise<Item> {
    const res = await axios.patch<Item>(`${this.baseUrl}/items/${id}`, data);
    return res.data;
  }

  /**
   * Actualiza únicamente la disponibilidad del ítem.
   * @param id ID del ítem
   * @param isAvailable Nuevo estado de disponibilidad
   */
  async updateAvailability(id: number, isAvailable: boolean): Promise<Item> {
    const res = await axios.patch<Item>(`${this.baseUrl}/items/${id}/availability`, { isAvailable });
    return res.data;
  }
}