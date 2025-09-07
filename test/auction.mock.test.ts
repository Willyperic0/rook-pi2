// tests/auction.mock.test.ts
import request from "supertest";
import nock from "nock";
import dotenv from "dotenv";
import path from "path";

// Carga el .env que está dentro de test
dotenv.config({ path: path.resolve(__dirname, ".env") });

const API_BASE = process.env.API_BASE?.trim() || "";
console.log("API_BASE:", API_BASE);
let token = "mocked-jwt-token";
let createdItemId = 999;
let createdAuctionId = 123456;

describe("Auction API (mocked)", () => {
  beforeAll(() => {
    // Mock login
    nock(API_BASE)
      .post("/users/login")
      .reply(200, { token });

    // Mock crear ítem
    nock(API_BASE)
      .post("/api/items")
      .reply(200, { id: createdItemId, name: "Mock Item" });

    // Mock crear subasta
    nock(API_BASE)
      .post("/api/auctions")
      .reply(200, { id: createdAuctionId, itemId: createdItemId });

    // Mock puja
    nock(API_BASE)
      .post(`/api/auctions/${createdAuctionId}/bid`)
      .reply(200, { auctionId: createdAuctionId, currentPrice: 120 });

    // Mock compra directa
    nock(API_BASE)
      .post(`/api/auctions/${createdAuctionId}/buy`)
      .reply(200, { auctionId: createdAuctionId, status: "SOLD" });

    // Mock historial de compras
    nock(API_BASE)
      .get("/api/auctions/history/purchased/1")
      .reply(200, [{ auctionId: createdAuctionId, status: "SOLD" }]);
  });

  test("Login retorna token", async () => {
    const res = await request(API_BASE).post("/users/login");
    expect(res.body.token).toBe(token);
  });

  test("Crear ítem", async () => {
    const res = await request(API_BASE).post("/api/items");
    expect(res.body.id).toBe(createdItemId);
  });

  test("Crear subasta", async () => {
    const res = await request(API_BASE).post("/api/auctions");
    expect(res.body.id).toBe(createdAuctionId);
  });

  test("Pujar en subasta", async () => {
    const res = await request(API_BASE).post(`/api/auctions/${createdAuctionId}/bid`);
    expect(res.body.currentPrice).toBe(120);
  });

  test("Compra directa", async () => {
    const res = await request(API_BASE).post(`/api/auctions/${createdAuctionId}/buy`);
    expect(res.body.status).toBe("SOLD");
  });

  test("Ver historial de compras", async () => {
    const res = await request(API_BASE).get("/api/auctions/history/purchased/1");
    expect(res.body[0].auctionId).toBe(createdAuctionId);
  });
});

