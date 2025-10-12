import { User } from "../models/User";

/**
 * @interface IUserService
 * @description
 * Define los servicios disponibles para manejar la lógica de negocio relacionada con usuarios.
 * Incluye operaciones de consulta, verificación de créditos y modificación de los mismos.
 * Las implementaciones concretas pueden incluir validaciones, reglas de negocio y conexión
 * a repositorios de datos.
 */
export interface IUserService {
  /**
   * Busca un usuario por su identificador único.
   * @param {string} id - Identificador del usuario.
   * @returns {Promise<User | null>} Promesa que resuelve con el usuario encontrado o `null` si no existe.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Busca un usuario a partir de su token de autenticación.
   * @param {string} token - Token de acceso o sesión del usuario.
   * @returns {Promise<User | null>} Promesa que resuelve con el usuario correspondiente o `null` si el token no es válido.
   */
  findByToken(token: string): Promise<User | null>;

  /**
   * Actualiza la cantidad de créditos de un usuario.
   * @param {string} id - Identificador del usuario.
   * @param {number} credits - Nueva cantidad de créditos.
   * @returns {Promise<User | null>} Promesa que resuelve con el usuario actualizado o `null` si no se encontró.
   */
  updateCredits(id: string, credits: number): Promise<User | null>;

  /**
   * Verifica si un usuario tiene suficientes créditos para una operación.
   * @param {User} user - Usuario a evaluar.
   * @param {number} amount - Monto de créditos requerido.
   * @returns {boolean} `true` si tiene créditos suficientes, `false` en caso contrario.
   */
  hasEnoughCredits(user: User, amount: number): boolean;

  /**
   * Deduce créditos de un usuario.
   * @param {User} user - Usuario al que se le restarán los créditos.
   * @param {number} amount - Cantidad de créditos a deducir.
   * @throws Error si el usuario no tiene suficientes créditos.
   */
  deductCredits(user: User, amount: number): void;

  /**
   * Añade créditos a un usuario.
   * @param {User} user - Usuario al que se le sumarán los créditos.
   * @param {number} amount - Cantidad de créditos a añadir.
   */
  addCredits(user: User, amount: number): void;

  /**
   * Obtiene una lista completa de todos los usuarios registrados.
   * Este método es opcional según la implementación.
   * @returns {Promise<User[]>} Promesa que resuelve con un arreglo de usuarios.
   */
  getAllUsers?(): Promise<User[]>;
}