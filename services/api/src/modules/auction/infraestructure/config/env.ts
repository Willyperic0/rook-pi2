// src/modules/auction/infraestructure/configs/env.ts

import * as dotenv from "dotenv";

/**
 * Carga y normaliza variables de entorno para la API.
 * @remarks
 * - Si defines `PUBLIC_HOST` (y opcionalmente `PUBLIC_SCHEME`), se construyen
 *   defaults “same-origin” para los microservicios (`/users`, `/items`) y CORS.
 * - Si NO defines `PUBLIC_HOST`, se usan defaults de desarrollo (localhost+puertos).
 *
 * Ejemplos:
 * - Dev (sin vars): users → http://localhost:4000, items → http://localhost:3002, CORS → http://localhost:5173
 * - Prod (con reverse proxy): PUBLIC_HOST=nexusroot.bucaramanga.upb.edu.co  ⇒
 *      users → http://nexusroot.bucaramanga.upb.edu.co/users
 *      items → http://nexusroot.bucaramanga.upb.edu.co/items
 *      CORS  → http://nexusroot.bucaramanga.upb.edu.co
 */

// Cargar variables desde .env
dotenv.config();

/** Divide CSV en arreglo, limpiando espacios y vacíos. */
function splitCsv(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

/** Construye una URL base a partir de PUBLIC_HOST y PUBLIC_SCHEME. */
function detectBaseFromPublicHost(): string | undefined {
  const host = process.env["PUBLIC_HOST"]?.trim();
  if (!host) return undefined;
  const scheme = (process.env["PUBLIC_SCHEME"]?.trim() || "http").replace(/:$/, "");
  return `${scheme}://${host}`;
}

const baseFromHost = detectBaseFromPublicHost();

// Defaults “same-origin” si hay PUBLIC_HOST; si no, development/localhost
const DEFAULT_USERS_BASE = baseFromHost ? `${baseFromHost}/users` : "http://localhost:4000";
const DEFAULT_ITEMS_BASE = baseFromHost ? `${baseFromHost}/items` : "http://localhost:3002";
const DEFAULT_CORS = baseFromHost ? [baseFromHost] : ["http://localhost:5173"];

export const env = {
  /** Puerto HTTP de la API (backend auctions) */
  port: process.env["PORT"] ?? "3000",

  /** Prefijo de rutas HTTP de la API */
  apiPrefix: process.env["API_PREFIX"] ?? "/api",

  /** URL base del microservicio de usuarios */
  userServiceUrl: process.env["USER_SERVICE_URL"] ?? DEFAULT_USERS_BASE,

  /** URL base del microservicio de items */
  itemServiceUrl: process.env["ITEM_SERVICE_URL"] ?? DEFAULT_ITEMS_BASE,

  /** Orígenes permitidos para CORS */
  corsOrigin: (() => {
    const fromEnv = splitCsv(process.env["CORS_ORIGIN"]);
    return fromEnv.length > 0 ? fromEnv : DEFAULT_CORS;
  })(),

  /** Configuración DB (si aplica en esta API) */
  db: {
    host: process.env["DB_HOST"] ?? "localhost",
    port: Number(process.env["DB_PORT"] ?? 5432),
    user: process.env["DB_USER"] ?? "admin",
    password: process.env["DB_PASSWORD"] ?? "secret",
    name: process.env["DB_NAME"] ?? "auction_db",
  },

  /** Configuración de JWT para autenticación en sockets/HTTP */
  jwt: {
    secret: process.env["JWT_SECRET"] ?? "default_secret",
    expiresIn: process.env["JWT_EXPIRES_IN"] ?? "1h",
  },
};