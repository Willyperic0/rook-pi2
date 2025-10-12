import { User } from "../models/User";

/**
 * @interface UserRepository
 * @description
 * Define las operaciones que pueden realizarse sobre los usuarios en la capa de persistencia.
 * 
 * Cada implementación concreta (por ejemplo, en memoria o con base de datos)
 * deberá cumplir este contrato para poder interactuar con los datos de usuario
 * de manera consistente dentro del sistema.
 */
export interface UserRepository {
  /**
   * Busca un usuario por su identificador único.
   * @param {string} id - Identificador del usuario.
   * @returns {Promise<User | null>} Una promesa que resuelve con el usuario encontrado o `null` si no existe.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Busca un usuario a partir de su token de autenticación.
   * @param {string} token - Token de acceso o sesión del usuario.
   * @returns {Promise<User | null>} Una promesa que resuelve con el usuario correspondiente o `null` si el token no es válido.
   */
  findByToken(token: string): Promise<User | null>;

  /**
   * Actualiza la cantidad de créditos de un usuario.
   * @param {string} id - Identificador del usuario.
   * @param {number} credits - Nueva cantidad de créditos.
   * @returns {Promise<User | null>} Una promesa que resuelve con el usuario actualizado o `null` si no se encontró.
   */
  updateCredits(id: string, credits: number): Promise<User | null>;

  /**
   * Busca un usuario por su nombre de usuario.
   * Este método es opcional según la implementación.
   * @param {string} username - Nombre de usuario a buscar.
   * @returns {Promise<User | null>} Una promesa que resuelve con el usuario encontrado o `null` si no existe.
   */
  findByUsername?(username: string): Promise<User | null>;

  /**
   * Obtiene una lista completa de todos los usuarios registrados.
   * Este método es opcional.
   * @returns {Promise<User[]>} Una promesa que resuelve con un arreglo de usuarios.
   */
  findAll?(): Promise<User[]>;
}