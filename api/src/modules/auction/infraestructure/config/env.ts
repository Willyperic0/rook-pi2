import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env["PORT"] ?? process.env["API_PORT"] ?? "3000",
  apiPrefix: process.env["API_PREFIX"] ?? "/api",
  socketPort: process.env["SOCKET_PORT"] ?? process.env["ITEMS_PORT"] ?? "3001",

  userServiceUrl: process.env["USER_SERVICE_URL"] ?? "http://localhost:3002",
  itemServiceUrl: process.env["ITEM_SERVICE_URL"] ?? "http://localhost:3003",
  corsOrigin: process.env["CORS_ORIGIN"] ?? "*",
  jwt: {
    secret: process.env["JWT_SECRET"] ?? "changeme",
    expiresIn: process.env["JWT_EXPIRES_IN"] ?? "1h",
  },

  db: {
    host: process.env["DB_HOST"] ?? "localhost",
    port: Number(process.env["DB_PORT"] ?? 5432),
    user: process.env["DB_USER"] ?? "admin",
    password: process.env["DB_PASSWORD"] ?? "secret",
    name: process.env["DB_NAME"] ?? "auction_db",
  },
};

