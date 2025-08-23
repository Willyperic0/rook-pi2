import { Request, Response } from "express";
import { AuctionService } from "../../../domain/services/AuctionService";
import { AuctionMapper } from "../../../application/mappers/AuctionMapper";
// El service ya debería recibir la implementación de repos en la capa de configuración (composition root)
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  createAuction = async (req: Request, res: Response) => {
    try {
      const dto = await this.auctionService.createAuction(req.body);
      res.status(201).json(dto);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getAuction = async (req: Request, res: Response): Promise<Response> => {
  try {
    const auction = await this.auctionService["auctions"].findById(Number(req.params["id"]));
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    return res.json(AuctionMapper.toDto(auction));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};



  listAuctions = async (_: Request, res: Response): Promise<void> => {
  try {
    const auctions = await this.auctionService["auctions"].findByStatus("OPEN");
    res.json(auctions.map(a => AuctionMapper.toDto(a)));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


  placeBid = async (req: Request, res: Response) => {
    try {
      const { userId, amount } = req.body;
      const success = await this.auctionService.placeBid(Number(req.params["id"]), userId, amount);
      res.json({ success });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  buyNow = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const success = await this.auctionService.buyNow(Number(req.params["id"]), userId);
      res.json({ success });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}