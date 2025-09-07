// src/modules/user/application/domain/services/UserService.ts

import { User } from "../models/User";
import axios from "axios";

/**
 * Servicio de dominio para operaciones relacionadas con usuarios.
 * @remarks
 * Expone utilidades puras sobre créditos y, opcionalmente, wrappers HTTP
 * para integraciones sencillas con el microservicio de usuarios.
 */
export class UserService {
  /**
   * @param baseUrl URL base del servicio de usuarios para las operaciones HTTP opcionales.
   */
  constructor(private baseUrl: string) {}

  /**
   * Verifica si el usuario tiene créditos suficientes.
   * @param user Usuario a evaluar
   * @param amount Monto requerido
   * @returns `true` si `user.credits >= amount`
   */
  static hasEnoughCredits(user: User, amount: number): boolean {
    return user.credits >= amount;
  }

  /**
   * Descuenta créditos del usuario.
   * @param user Usuario objetivo
   * @param amount Monto a descontar
   * @throws Error si no hay créditos suficientes
   */
  static deductCredits(user: User, amount: number): void {
    if (!this.hasEnoughCredits(user, amount)) {
      throw new Error("El usuario no tiene créditos suficientes.");
    }
    user.credits -= amount;
  }

  /**
   * Añade créditos (recargas, devoluciones).
   * @param user Usuario objetivo
   * @param amount Monto a adicionar
   */
  static addCredits(user: User, amount: number): void {
    user.credits += amount;
  }

  /**
   * Obtiene el usuario actual desde token (helper HTTP).
   * @param token Token Bearer
   */
  async findByToken(token: string) {
    const res = await axios.get(`${this.baseUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }

  /**
   * Actualiza créditos de un usuario (helper HTTP).
   * @param id ID del usuario
   * @param credits Nuevo saldo
   */
  async updateCredits(id: string, credits: number) {
    const res = await axios.put(`${this.baseUrl}/users/${id}/credits`, { credits });
    return res.data;
  }
}