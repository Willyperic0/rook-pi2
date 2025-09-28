import * as dotenv from "dotenv";
import { resolve } from "path";

// Cargar variables desde api/config/.env
dotenv.config({ path: resolve(__dirname, ".env") });

export const env = {
  port: process.env["PORT"] ?? "3000",
  apiPrefix: process.env["API_PREFIX"] ?? "/api",

  userServiceUrl: process.env["USER_SERVICE_URL"] ?? "http://localhost:1882",
  itemServiceUrl: process.env["ITEM_SERVICE_URL"] ?? "http://localhost:1882",

  corsOrigin: process.env["CORS_ORIGIN"]?.split(",") ?? ["http://nexus-battle.com"],

};
