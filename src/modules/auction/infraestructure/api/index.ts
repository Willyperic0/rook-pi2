// src/modules/auction/infraestructure/api/index.ts
import express, { Request, Response, NextFunction } from "express";
import http from "http";
import cors from "cors";
import { initAuctionSocket, setAuctionServiceForSocket, getIo } from "../sockets/auctionSocket";
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
import { UserService } from "../../../user/domain/services/UserService";

// --- Notifications ---
import { buildNotificationModule } from "../../../notifications/infraestructure";
import { registerAuctionWinnerListener } from "../../../notifications/infraestructure/sockets/NotificationSockets";

// ----------------------
// Instancias únicas
// ----------------------
const userRepo = new HttpUserRepository(env.userServiceUrl);
const itemRepo = new HttpItemRepository(env.itemServiceUrl);
const auctionRepo = new InMemoryAuctionRepository();

// Services
const auctionService = new AuctionService(auctionRepo, itemRepo, userRepo);
const itemService = new ItemService(itemRepo); // ya implementa IItemService correctamente
const userService = new UserService(userRepo);

// Controllers
const auctionController = new AuctionController(auctionService);
const itemController = new ItemController(itemService);
const userController = new UserController(userService);

// ----------------------
// Swagger / Docs
// ----------------------
const docsPath = path.join(process.cwd(), "docs");
const generalDoc = YAML.load(path.join(docsPath, "General.yaml"));
const auctionDoc = YAML.load(path.join(docsPath, "Auction.yaml"));
const itemDoc = YAML.load(path.join(docsPath, "Item.yaml"));
const userDoc = YAML.load(path.join(docsPath, "User.yaml"));

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

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log("[DEBUG] Method:", req.method, "URL:", req.url);
  next();
});

app.use(cors({
  origin: env.corsOrigin,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());

// ----------------------
// Módulo Notificaciones
// ----------------------
const notificationModule = buildNotificationModule();

// ----------------------
// Rutas
// ----------------------
app.use(env.apiPrefix + "/auctions", auctionRoutes(auctionController));
app.use(env.apiPrefix + "/items", itemRoutes(itemController));
app.use(env.apiPrefix + "/users", userRoutes(userController));
// Notificaciones -> /api/notifications
app.use(env.apiPrefix, notificationModule.router);

// ----------------------
// Server HTTP + Sockets
// ----------------------
const server = http.createServer(app);

setAuctionServiceForSocket(auctionService);
initAuctionSocket(server);
// Registrar listener para notificar ganador cuando se emita AUCTION_CLOSED
const io = getIo();
if (io) {
  registerAuctionWinnerListener(io, notificationModule.notifyAuctionWinnerUseCase);
}

// ----------------------
// Levantar servidor
// ----------------------
server.listen(env.port, () => {
  console.log(`API Auctions running on port ${env.port}`);
});
