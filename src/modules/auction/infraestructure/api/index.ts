// index.ts
import express from "express";
import http from "http";
import cors from "cors";
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
// --- Instancias de repositorios y servicios ---
const userRepoForAuctions = new HttpUserRepository("http://localhost:4000"); // apunta al userServer
const auctionRepo = new InMemoryAuctionRepository();
const itemRepoForAuctions = new HttpItemRepository("http://localhost:3002");

const auctionService = new AuctionService(auctionRepo, itemRepoForAuctions, userRepoForAuctions);
const auctionController = new AuctionController(auctionService);

const itemRepo = new HttpItemRepository("http://localhost:3002"); 
const itemService = new ItemService(itemRepo);
const itemController = new ItemController(itemService);

const userRepo = new HttpUserRepository("http://localhost:4000"); // apunta al userServer
const userController = new UserController(userRepo);
// --- Configuración Express ---
const app = express();
app.use((req, _res, next) => {
  console.log("[DEBUG] Method:", req.method, "URL:", req.url);
  next();
});

// Habilitar CORS
app.use(cors({
  origin: "http://localhost:5173", // frontend Vite
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// --- Rutas de Auctions ---
app.use(env.apiPrefix + "/auctions", auctionRoutes(auctionController));

// --- Rutas de Items ---
app.use(env.apiPrefix + "/items", itemRoutes(itemController));

// --- Rutas de Users ---
app.use(env.apiPrefix + "/users", userRoutes(userController));
// --- Server HTTP + Sockets ---
const server = http.createServer(app);

// Asignar AuctionService a los sockets
setAuctionServiceForSocket(auctionService);

// Inicializar sockets
initAuctionSocket(server);

// --- Levantar servidor ---
server.listen(env.port, () => {
  console.log(`API Auctions running on port ${env.port}`);
});
