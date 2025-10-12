/**
 * @fileoverview
 * Tests de integración simulados para la API de Auctions utilizando `supertest` y `nock`.
 * 
 * Se mockean endpoints de Users, Items y Auctions para poder probar la lógica de la API
 * sin depender de un servidor real.
 */

import request from "supertest";
import nock from "nock";
import dotenv from "dotenv";
import path from "path";

// Carga las variables de entorno específicas para testing
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Base URL de la API mockeada
const API_BASE = process.env.API_BASE?.trim() || "";
console.log("API_BASE:", API_BASE);

// Datos simulados para tests
let token = "mocked-jwt-token";
let createdItemId = 999;
let createdAuctionId = 123456;

/**
 * Grupo de tests de la API de Auctions usando mocks.
 */
describe("Auction API (mocked)", () => {
  /**
   * Se ejecuta antes de todos los tests.
   * Configura mocks de endpoints usando `nock`.
   */
  beforeAll(() => {
    // Mock del login de usuario
    nock(API_BASE)
      .post("/users/login")
      .reply(200, { token });

    // Mock de creación de ítem
    nock(API_BASE)
      .post("/api/items")
      .reply(200, { id: createdItemId, name: "Mock Item" });

    // Mock de creación de subasta
    nock(API_BASE)
      .post("/api/auctions")
      .reply(200, { id: createdAuctionId, itemId: createdItemId });

    // Mock de puja en la subasta
    nock(API_BASE)
      .post(`/api/auctions/${createdAuctionId}/bid`)
      .reply(200, { auctionId: createdAuctionId, currentPrice: 120 });

    // Mock de compra directa (Buy Now)
    nock(API_BASE)
      .post(`/api/auctions/${createdAuctionId}/buy`)
      .reply(200, { auctionId: createdAuctionId, status: "SOLD" });

    // Mock de historial de compras del usuario
    nock(API_BASE)
      .get("/api/auctions/history/purchased/1")
      .reply(200, [{ auctionId: createdAuctionId, status: "SOLD" }]);
  });

  /**
   * Test: login de usuario retorna token
   */
  test("Login retorna token", async () => {
    const res = await request(API_BASE).post("/users/login");
    expect(res.body.token).toBe(token);
  });

  /**
   * Test: creación de ítem devuelve el ID esperado
   */
  test("Crear ítem", async () => {
    const res = await request(API_BASE).post("/api/items");
    expect(res.body.id).toBe(createdItemId);
  });

  /**
   * Test: creación de subasta devuelve el ID esperado
   */
  test("Crear subasta", async () => {
    const res = await request(API_BASE).post("/api/auctions");
    expect(res.body.id).toBe(createdAuctionId);
  });

  /**
   * Test: pujar en la subasta actualiza el precio correctamente
   */
  test("Pujar en subasta", async () => {
    const res = await request(API_BASE).post(`/api/auctions/${createdAuctionId}/bid`);
    expect(res.body.currentPrice).toBe(120);
  });

  /**
   * Test: compra directa (Buy Now) marca la subasta como vendida
   */
  test("Compra directa", async () => {
    const res = await request(API_BASE).post(`/api/auctions/${createdAuctionId}/buy`);
    expect(res.body.status).toBe("SOLD");
  });

  /**
   * Test: ver historial de compras devuelve la subasta comprada
   */
  test("Ver historial de compras", async () => {
    const res = await request(API_BASE).get("/api/auctions/history/purchased/1");
    expect(res.body[0].auctionId).toBe(createdAuctionId);
  });
});