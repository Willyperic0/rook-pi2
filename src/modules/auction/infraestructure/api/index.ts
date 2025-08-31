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

// ----------------------
// Instancias únicas
// ----------------------
const userRepo = new HttpUserRepository("http://localhost:4000"); // apunta al userServer
const itemRepo = new HttpItemRepository("http://localhost:3002");
const auctionRepo = new InMemoryAuctionRepository();

// Services
const auctionService = new AuctionService(auctionRepo, itemRepo, userRepo);
const itemService = new ItemService(itemRepo);

// Controllers
const auctionController = new AuctionController(auctionService);
const itemController = new ItemController(itemService);
const userController = new UserController(userRepo);

// ----------------------
// Configuración Express
// ----------------------
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

// Rutas
app.use(env.apiPrefix + "/auctions", auctionRoutes(auctionController));
app.use(env.apiPrefix + "/items", itemRoutes(itemController));
app.use(env.apiPrefix + "/users", userRoutes(userController));

// ----------------------
// Server HTTP + Sockets
// ----------------------
const server = http.createServer(app);

// Pasar AuctionService compartido a los sockets
setAuctionServiceForSocket(auctionService);
initAuctionSocket(server);

// ----------------------
// Levantar servidor
// ----------------------
server.listen(env.port, () => {
  console.log(`API Auctions running on port ${env.port}`);
});
