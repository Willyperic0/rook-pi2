import express from "express";
import http from "http";
import { initAuctionSocket } from "../sockets/auctionSocket";
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

const app = express();
app.use(express.json());

/* --------------------------
   Auctions
-------------------------- */
const auctionRepo = new InMemoryAuctionRepository();
const itemRepoForAuctions = new HttpItemRepository("http://localhost:3002");
const auctionService = new AuctionService(auctionRepo, itemRepoForAuctions);
const auctionController = new AuctionController(auctionService);

app.use(env.apiPrefix + "/auctions", auctionRoutes(auctionController));

/* --------------------------
   Items
-------------------------- */
const itemRepo = new HttpItemRepository("http://localhost:3002"); // apunte al server de inventario
const itemService = new ItemService(itemRepo);
const itemController = new ItemController(itemService);

app.use(env.apiPrefix + "/items", itemRoutes(itemController));

/* --------------------------
   Server + sockets
-------------------------- */
const server = http.createServer(app);
initAuctionSocket(server);

server.listen(env.port, () => {
  console.log(`API Auctions running on port ${env.port}`);
});
