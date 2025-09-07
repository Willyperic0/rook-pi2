// src/modules/user/application/domain/repositories/HttpUserRepository.ts

import { User } from "../../domain/models/User";
import axios from "axios";

/**
 * Adaptador HTTP para acceso a usuarios.
 * @remarks
 * Implementa operaciones de lectura/actualización contra el microservicio de usuarios.
 * Usa `fetch` o `axios` según convenga; aquí se combinan por compatibilidad histórica.
 */
export class HttpUserRepository {
  /**
   * @param baseUrl URL base del servicio de usuarios (p. ej., `/users` o `http://users:4000`)
   */
  constructor(private readonly baseUrl: string) {}

  /**
   * Busca un usuario por ID.
   * @param id Identificador del usuario
   * @returns {@link User} o `null` si no existe
   */
  async findById(id: string): Promise<User | null> {
    const res = await fetch(`${this.baseUrl}/users/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return new User(data.id, data.username, data.email, data.credits, data.isActive);
  }

  /**
   * Actualiza los créditos de un usuario.
   * @param id Identificador del usuario
   * @param credits Nuevo saldo de créditos
   * @returns {@link User} con créditos actualizados o `null` si falla
   */
  async updateCredits(id: string, credits: number): Promise<User | null> {
    const res = await fetch(`${this.baseUrl}/users/${id}/credits`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credits }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return new User(data.id, data.username, data.email, data.credits, data.isActive);
  }

  /**
   * Resuelve un usuario a partir de un token (Bearer).
   * @param token Token de autenticación
   * @returns {@link User} o `null` si no es válido
   */
  async findByToken(token: string): Promise<User | null> {
    try {
      const res = await axios.get(`${this.baseUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.data) return null;
      const data = res.data;
      return new User(data.id, data.username, data.email, data.credits, data.isActive);
    } catch {
      return null;
    }
  }
}
