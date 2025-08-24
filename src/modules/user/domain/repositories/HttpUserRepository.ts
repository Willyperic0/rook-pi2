import { User } from "../../domain/models/User";

export class HttpUserRepository {
  constructor(private readonly baseUrl: string) {}

  async findById(id: string): Promise<User | null> {
    const res = await fetch(`${this.baseUrl}/users/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return new User(data.id, data.username, data.email, data.credits, data.isActive);
  }

  async updateCredits(id: string, credits: number): Promise<User | null> {
    const res = await fetch(`${this.baseUrl}/users/${id}/credits`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credits }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return new User(data.id, data.username, data.email, data.credits, data.isActive);
  }
}
