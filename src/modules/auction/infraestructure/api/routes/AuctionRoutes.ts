import { Router } from "express";
import { AuctionController } from "../controllers/AuctionController";
import { AuctionService } from "../../../domain/services/AuctionService";
import { InMemoryAuctionRepository } from "../../../domain/repositories/InMemoryAuctionRepository";
import { InMemoryItemRepository } from "../../../../inventory/domain/repositories/InMemoryItemRepository";

// composition root
const auctionRepo = new InMemoryAuctionRepository();
const itemRepo = new InMemoryItemRepository();
const auctionService = new AuctionService(auctionRepo, itemRepo);
const auctionController = new AuctionController(auctionService);

const router = Router();

router.post("/", auctionController.createAuction);
router.get("/", auctionController.listAuctions);
router.get("/:id", auctionController.getAuction);
router.post("/:id/bid", auctionController.placeBid);
router.post("/:id/buy", auctionController.buyNow);

export default router;
