import { User } from "../../domain/models/User";
import { UserRepository } from "./UserRepository";
import axios from "axios";

/**
 * Implementación concreta de `UserRepository` que interactúa
 * con un backend HTTP para obtener y actualizar datos de usuarios.
 */
export class HttpUserRepository implements UserRepository {
  constructor(private readonly baseUrl: string) {}

  /**
   * Busca un usuario en el backend a partir de su identificador único.
   * @param id Identificador del usuario.
   * @returns Una instancia de `User` si se encuentra, o `null` si no existe o hay error.
   */
  async findById(id: string): Promise<User | null> {
    try {
      const res = await fetch(`${this.baseUrl}/usuarios/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return new User(data._id, data.nombreUsuario, data.creditos);
    } catch {
      return null;
    }
  }

  /**
   * Busca un usuario por su nombre de usuario.
   * @param username Nombre de usuario a buscar.
   * @returns Una instancia de `User` si se encuentra, o `null` en caso contrario.
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      const res = await fetch(`${this.baseUrl}/usuarios/${encodeURIComponent(username)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return new User(data._id, data.nombreUsuario, data.creditos);
    } catch {
      return null;
    }
  }

  /**
   * Obtiene los datos del usuario autenticado mediante un token JWT.
   * @param token Token de autenticación válido.
   * @returns Una instancia de `User` si el token es válido, o `null` si falla.
   */
  async findByToken(token: string): Promise<User | null> {
    try {
      const res = await axios.get(`${this.baseUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      return data ? new User(data._id, data.nombreUsuario, data.creditos) : null;
    } catch {
      return null;
    }
  }

  /**
   * Obtiene la lista completa de usuarios registrados en el sistema.
   * @returns Un arreglo de instancias de `User` o un arreglo vacío si ocurre un error.
   */
  async findAll(): Promise<User[]> {
    try {
      const res = await fetch(`${this.baseUrl}/usuarios`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.map((u: any) => new User(u._id, u.nombreUsuario, u.creditos));
    } catch {
      return [];
    }
  }

  /**
   * Actualiza los créditos de un usuario específico.
   * Envía un `PATCH` al backend con el cambio de créditos (positivo o negativo).
   * @param username Nombre del usuario al que se actualizarán los créditos.
   * @param delta Diferencia de créditos (positiva o negativa) a aplicar.
   * @returns El usuario actualizado si la operación fue exitosa, o `null` en caso de error.
   */
  async updateCredits(username: string, delta: number): Promise<User | null> {
    console.log(`Intentando actualizar créditos de ${username} con delta:`, delta);
    console.log("URL:", `${this.baseUrl}/usuarios/${encodeURIComponent(username)}/creditos`);
    try {
      const res = await fetch(`${this.baseUrl}/usuarios/${encodeURIComponent(username)}/creditos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creditos: Number(delta) }),
      });

      if (!res.ok) {
        console.error("Falló la actualización de créditos, status:", res.status);
        const text = await res.text();
        console.error("Respuesta backend:", text);
        return null;
      }

      const data = await res.json();
      console.log("Créditos actualizados:", data);
      return new User(data._id, data.nombreUsuario, data.creditos);
    } catch (err) {
      console.error("Error updating credits:", err);
      return null;
    }
  }
}