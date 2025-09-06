// server-auctions/src/infrastructure/InventoryApiClient.ts
export class InventoryApiClient {
  constructor(private readonly baseUrl: string) {}

  async getItemById(id: number) {
    const res = await fetch(`${this.baseUrl}/items/${id}`);
    if (!res.ok) throw new Error("Item not found");
    return res.json();
  }

  async getItemsByUser(userId: number) {
    const res = await fetch(`${this.baseUrl}/items?userId=${userId}`);
    if (!res.ok) throw new Error("Error fetching items");
    return res.json();
  }
}
