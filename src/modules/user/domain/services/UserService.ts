import { User } from "../models/User";
import axios from "axios";
import { IUserService } from "./IUserService";

/**
 * Servicio de Usuarios
 */
export class UserService implements IUserService {
  constructor(private baseUrl: string) {}

  // Validar si un usuario tiene suficientes créditos
  hasEnoughCredits(user: User, amount: number): boolean {
    return user.getCredits() >= amount;
  }

  // Descontar créditos a un usuario
  deductCredits(user: User, amount: number): void {
    if (!this.hasEnoughCredits(user, amount)) {
      throw new Error("El usuario no tiene créditos suficientes.");
    }
    user.deductCredits(amount);
  }

  // Añadir créditos (ej: recarga o devolución)
  addCredits(user: User, amount: number): void {
    user.addCredits(amount);
  }

  // Métodos que ya eran de instancia
  async findByToken(token: string): Promise<User> {
    const res = await axios.get(`${this.baseUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = res.data;
    return new User(data.id, data.username, data.credits);
  }

  async updateCredits(id: string, credits: number): Promise<User> {
    const res = await axios.put(`${this.baseUrl}/users/${id}/credits`, { credits });
    const data = res.data;
    return new User(data.id, data.username, data.credits);
  }
}
