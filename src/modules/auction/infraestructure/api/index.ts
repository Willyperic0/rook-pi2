/**
 * Punto de entrada de la API principal de Auctions, Items y Users.
 *
 * Este archivo:
 * 1. Configura Express y middleware general (CORS, JSON, logs de request).
 * 2. Inicializa repositorios, servicios y controladores.
 * 3. Define rutas de la API.
 * 4. Configura Swagger UI para la documentación combinada.
 * 5. Inicializa el servidor HTTP y los sockets de subastas.
 */

import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import { initAuctionSocket, setAuctionServiceForSocket } from "../sockets/auctionSocket";
import { env } from "../config/env";

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
import userRoutes from "./routes/UserRoutes";
import { UserService } from "../../../user/domain/services/UserService";

// ----------------------
// Instancias únicas de repositorios
// ----------------------
const userRepo = new HttpUserRepository(env.userServiceUrl);
const itemRepo = new HttpItemRepository(env.itemServiceUrl);
const auctionRepo = new InMemoryAuctionRepository();

// ----------------------
// Instancias de servicios
// ----------------------
const auctionService = new AuctionService(auctionRepo, itemRepo, userRepo);
const itemService = new ItemService(itemRepo);
const userService = new UserService(userRepo);

// ----------------------
// Instancias de controladores
// ----------------------
const auctionController = new AuctionController(auctionService);
const itemController = new ItemController(itemService);
const userController = new UserController(userService);

// ----------------------
// Configuración Express
// ----------------------
const app = express();

// Middleware de logging para debug
app.use((req, _res, next) => {
  console.log("[DEBUG] Method:", req.method, "URL:", req.url);
  next();
});

// Middleware CORS
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// ----------------------
// Rutas API
// ----------------------
app.use(env.apiPrefix + "/auctions", auctionRoutes(auctionController));
app.use(env.apiPrefix + "/items", itemRoutes(itemController));
app.use(env.apiPrefix + "/users", userRoutes(userController));

// ----------------------
// Swagger UI con YAMLs
// ----------------------
const docsPath = path.resolve(__dirname, "../../../../../docs");

// Cargar definiciones individuales
const auctionDoc = YAML.load(path.join(docsPath, "Auction.yaml"));
const itemDoc = YAML.load(path.join(docsPath, "Item.yaml"));
const userDoc = YAML.load(path.join(docsPath, "User.yaml"));
const generalDoc = YAML.load(path.join(docsPath, "general.yaml"));

// Combinar todas las rutas y componentes para Swagger
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "API Completa",
    version: "1.1",
    description: "Swagger combinando Auctions, Items y Users",
  },
  servers: [{ url: `http://localhost:${env.port}` }],
  paths: {
    ...auctionDoc.paths,
    ...itemDoc.paths,
    ...userDoc.paths,
    ...generalDoc.paths,
  },
  components: {
    schemas: {
      ...auctionDoc.components?.schemas,
      ...itemDoc.components?.schemas,
      ...userDoc.components?.schemas,
      ...generalDoc.components?.schemas,
    },
  },
};

// Montar Swagger UI en /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ----------------------
// Server HTTP + Sockets
// ----------------------
const server = http.createServer(app);

// Configurar AuctionService para los sockets
setAuctionServiceForSocket(auctionService);
initAuctionSocket(server);

// ----------------------
// Levantar servidor
// ----------------------
server.listen(env.port, () => {
  console.log(`API Auctions running on port ${env.port}`);
  console.log(`Swagger docs available at http://localhost:${env.port}/docs`);
});