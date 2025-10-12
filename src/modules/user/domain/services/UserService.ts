import { UserRepository } from "../repositories/UserRepository";
import { User } from "../models/User";
import { IUserService } from "./IUserService";

/**
 * Servicio encargado de manejar la lógica de negocio relacionada con usuarios.
 * Incluye operaciones sobre créditos, validaciones y acceso a datos mediante
 * el UserRepository.
 */
export class UserService implements IUserService {
  constructor(private readonly userRepo: UserRepository) {}

  /**
   * Verifica si un usuario tiene suficientes créditos para realizar una acción.
   * @param user Usuario a evaluar.
   * @param amount Cantidad de créditos necesarios.
   * @returns true si el usuario tiene créditos suficientes, false de lo contrario.
   */
  hasEnoughCredits(user: User, amount: number): boolean {
    return user.getCredits() >= amount;
  }

  /**
   * Deduce créditos de un usuario.
   * @param user Usuario al que se le descontarán los créditos.
   * @param amount Cantidad de créditos a deducir.
   * @throws Error si el usuario no tiene suficientes créditos.
   */
  deductCredits(user: User, amount: number): void {
    if (!this.hasEnoughCredits(user, amount)) {
      throw new Error("El usuario no tiene créditos suficientes.");
    }
    user.deductCredits(amount);
  }

  /**
   * Añade créditos a un usuario.
   * @param user Usuario al que se le sumarán los créditos.
   * @param amount Cantidad de créditos a añadir.
   */
  addCredits(user: User, amount: number): void {
    user.addCredits(amount);
  }

  /**
   * Busca un usuario por su identificador único.
   * @param id ID del usuario.
   * @returns Usuario encontrado o null si no existe.
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  /**
   * Busca un usuario a partir de su token de autenticación.
   * @param token Token de acceso o sesión del usuario.
   * @returns Usuario correspondiente al token o null si no es válido.
   */
  async findByToken(token: string): Promise<User | null> {
    return this.userRepo.findByToken(token);
  }

  /**
   * Actualiza los créditos de un usuario.
   * @param id ID del usuario.
   * @param credits Nueva cantidad de créditos.
   * @returns Usuario actualizado o null si no se encontró.
   */
  async updateCredits(id: string, credits: number): Promise<User | null> {
    return this.userRepo.updateCredits(id, credits);
  }

  /**
   * Obtiene la lista de todos los usuarios registrados.
   * @returns Arreglo de usuarios, vacío si el repositorio no soporta esta operación.
   */
  async getAllUsers(): Promise<User[]> {
    return this.userRepo.findAll ? this.userRepo.findAll() : [];
  }
}