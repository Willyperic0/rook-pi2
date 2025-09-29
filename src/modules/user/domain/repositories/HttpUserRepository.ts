import { User } from "../../domain/models/User";
import { UserRepository } from "./UserRepository";
import axios from "axios";

/**
 * Implementación HTTP de UserRepository que devuelve instancias de User
 */
export class HttpUserRepository implements UserRepository {
  constructor(private readonly baseUrl: string) {}

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

  async updateCredits(username: string, delta: number): Promise<User | null> {
  console.log(`💰 Intentando actualizar créditos de ${username} con delta:`, delta);
  console.log('🔗 URL:', `${this.baseUrl}/usuarios/${encodeURIComponent(username)}/creditos`);
  try {
    const res = await fetch(`${this.baseUrl}/usuarios/${encodeURIComponent(username)}/creditos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creditos: Number(delta) }), // 🔹 delta positivo o negativo
    });

    if (!res.ok) {
      console.error('❌ Falló la actualización de créditos, status:', res.status);
      const text = await res.text();
      console.error('❌ Respuesta backend:', text);
      return null;
    }

    const data = await res.json();
    console.log('✅ Créditos actualizados:', data);
    return new User(data._id, data.nombreUsuario, data.creditos);
  } catch (err) {
    console.error('❌ Error updating credits:', err);
    return null;
  }
}










}
