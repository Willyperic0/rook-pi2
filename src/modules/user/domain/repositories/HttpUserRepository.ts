import { User } from "../../domain/models/User";
import { UserRepository } from "./UserRepository";
import axios from "axios";
export class HttpUserRepository implements UserRepository {
  constructor(private readonly baseUrl: string) {}

  async findById(id: string): Promise<User | null> {
    const res = await fetch(`${this.baseUrl}/users/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return new User(data.id, data.username, data.credits);
  }

  async updateCredits(id: string, credits: number): Promise<User | null> {
    const res = await fetch(`${this.baseUrl}/users/${id}/credits`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credits }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return new User(data.id, data.username, data.credits);
  }

  async findByToken(token: string): Promise<User | null> {
    try {
      const res = await axios.get(`${this.baseUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.data) return null;
      const data = res.data;
      return new User(data.id, data.username, data.credits);
    } catch {
      return null;
    }
  }
  

}
