import * as dotenv from "dotenv";
import { resolve } from "path";

// Carga variables de entorno desde el archivo .env
dotenv.config({ path: resolve(__dirname, ".env") });

/**
 * Configuración de entorno de la aplicación.
 * Contiene puertos, URLs de servicios y CORS.
 */
export const env = {
  /** Puerto en el que el servidor escucha */
  port: process.env["PORT"] ?? "3000",

  /** Prefijo para todas las rutas de la API */
  apiPrefix: process.env["API_PREFIX"] ?? "/api",

  /** URL del servicio de usuarios */
  userServiceUrl: process.env["USER_SERVICE_URL"] ?? "http://136.112.163.5:1882",

  /** URL del servicio de items */
  itemServiceUrl: process.env["ITEM_SERVICE_URL"] ?? "http://136.112.163.5:1882",

  /** Orígenes permitidos para CORS (puede ser lista separada por comas) */
  corsOrigin: process.env["CORS_ORIGIN"]?.split(",") ?? ["http://nexus-battle.com"],
};