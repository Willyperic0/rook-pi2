import { UserRepository } from "../repositories/UserRepository";
import { User } from "../models/User";
import { IUserService } from "./IUserService";

/**
 * Servicio de Usuarios
 */
export class UserService implements IUserService {
  constructor(private readonly userRepo: UserRepository) {}

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

  // Métodos que interactúan con el repositorio
  async findById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  async findByToken(token: string): Promise<User | null> {
    return this.userRepo.findByToken(token);
  }

  async updateCredits(id: string, credits: number): Promise<User | null> {
    return this.userRepo.updateCredits(id, credits);
  }

  async getAllUsers(): Promise<User[]> {
    // Si tu repositorio soporta listar todos los usuarios
    return this.userRepo.findAll ? this.userRepo.findAll() : [];
  }
}
