// src/modules/auction/infraestructure/api/index.ts

import express from "express";
import http from "http";
import cors from "cors";
import { initAuctionSocket, setAuctionServiceForSocket } from "../sockets/auctionSocket";
import { env } from "../config/env";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

// --- Auctions ---
import auctionRoutes from "./routes/AuctionRoutes";
import { AuctionController } from "./controllers/AuctionController";
import { AuctionService } from "../../domain/services/AuctionService";
import { InMemoryAuctionRepository } from "../../domain/repositories/InMemoryAuctionRepository";
import { HttpItemRepository } from "../../../inventory/domain/repositories/HttpItemRepository";

// --- Items ---
import itemRoutes from "./routes/ItemRoutes";
import { ItemController } from "./controllers/ItemController";
import { ItemService } from "../../../inventory/domain/services/ItemService";

// --- Users ---
import { HttpUserRepository } from "../../../user/domain/repositories/HttpUserRepository";
import { UserController } from "./controllers/UserController";
import userRoutes from "./routes/userRoutes";

/**
 * Punto de entrada HTTP para el módulo de subastas.
 * @remarks
 * - Configura Express, CORS, Swagger UI, rutas HTTP y Socket.IO.
 * - Inyecta dependencias (repositorios/servicios/controladores) sin acoplar a frameworks en dominio.
 * - Combina múltiples especificaciones OpenAPI (general/auction/item/user) en un único documento.
 *
 * @typedoc
 * Documentado con TSDoc (compatible con TypeDoc). Incluye este archivo en `typedoc.json`.
 */

// ----------------------
// Instancias únicas
// ----------------------
const userRepo = new HttpUserRepository(env.userServiceUrl); // apunta al userServer
const itemRepo = new HttpItemRepository(env.itemServiceUrl);
const auctionRepo = new InMemoryAuctionRepository();

// Services
const auctionService = new AuctionService(auctionRepo, itemRepo, userRepo);
const itemService = new ItemService(itemRepo);

// Controllers
const auctionController = new AuctionController(auctionService);
const itemController = new ItemController(itemService);
const userController = new UserController(userRepo);

// Cargar y combinar los YAML desde /docs
const docsPath = path.join(process.cwd(), "docs");
/** Documento base (info, servers, components comunes) */
const generalDoc = YAML.load(path.join(docsPath, "General.yaml"));
/** Secciones de paths/schemas modulares */
const auctionDoc = YAML.load(path.join(docsPath, "Auction.yaml"));
const itemDoc = YAML.load(path.join(docsPath, "Item.yaml"));
const userDoc = YAML.load(path.join(docsPath, "User.yaml"));

/** Documento Swagger unificado expuesto en /api/docs */
const swaggerDocument = {
  ...generalDoc,
  paths: {
    ...(auctionDoc.paths || {}),
    ...(itemDoc.paths || {}),
    ...(userDoc.paths || {}),
  },
  components: {
    schemas: {
      ...(auctionDoc.components?.schemas || {}),
      ...(itemDoc.components?.schemas || {}),
      ...(userDoc.components?.schemas || {}),
    },
  },
};

// ----------------------
// Configuración Express
// ----------------------
const app = express();

/** Middleware de depuración (método + URL). */
app.use((req, _res, next) => {
  console.log("[DEBUG] Method:", req.method, "URL:", req.url);
  next();
});

/** CORS: permite front Vite y credenciales si aplica. */
app.use(
  cors({
    origin: env.corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

/** Documentación Swagger en /api/docs. */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
console.log("Documentación Swagger disponible en /api/docs");

app.use(express.json());

// Rutas HTTP (prefijo configurable)
app.use(env.apiPrefix + "/auctions", auctionRoutes(auctionController));
app.use(env.apiPrefix + "/items", itemRoutes(itemController));
app.use(env.apiPrefix + "/users", userRoutes(userController));

// ----------------------
// Server HTTP + Sockets
// ----------------------
const server = http.createServer(app);

// Compartir AuctionService con capa de sockets
setAuctionServiceForSocket(auctionService);
initAuctionSocket(server);

// ----------------------
// Levantar servidor
// ----------------------
server.listen(env.port, () => {
  console.log(`API Auctions running on port ${env.port}`);
});
