import { User } from "../model/User";
import axios from "axios";
/**
 * Servicio de Usuarios
 */
export class UserService {
    constructor(private baseUrl: string) {}
    // Validar si un usuario tiene suficientes créditos
    static hasEnoughCredits(user: User, amount: number): boolean {
        return user.credits >= amount;
    }

    // Descontar créditos a un usuario
    static deductCredits(user: User, amount: number): void {
        if (!this.hasEnoughCredits(user, amount)) {
            throw new Error("El usuario no tiene créditos suficientes.");
        }
        user.credits -= amount;
    }

    // Añadir créditos (ej: recarga o devolución)
    static addCredits(user: User, amount: number): void {
        user.credits += amount;
    }
    async findByToken(token: string) {
    const res = await axios.get(`${this.baseUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
  async updateCredits(id: string, credits: number) {
    const res = await axios.put(`${this.baseUrl}/users/${id}/credits`, { credits });
    return res.data;
  }
}