import express from "express";
import http from "http";
import auctionRoutes from "./routes/AuctionRoutes";
import { initAuctionSocket } from "../sockets/auctionSocket";
import { env } from "../config/env";

const app = express();
app.use(express.json());

// Core API
app.use(env.apiPrefix + "/auctions", auctionRoutes);

const server = http.createServer(app);
initAuctionSocket(server);

server.listen(env.port, () => {
  console.log(`API running on port ${env.port}`);
});
