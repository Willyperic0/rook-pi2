import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env["PORT"] ?? "3000",
  apiPrefix: process.env["API_PREFIX"] ?? "/api",
  socketPort: process.env["SOCKET_PORT"] ?? "3001",

  db: {
    host: process.env["DB_HOST"] ?? "localhost",
    port: Number(process.env["DB_PORT"] ?? 5432),
    user: process.env["DB_USER"] ?? "admin",
    password: process.env["DB_PASSWORD"] ?? "secret",
    name: process.env["DB_NAME"] ?? "auction_db",
  },
};

