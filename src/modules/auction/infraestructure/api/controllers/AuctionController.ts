import { Request, Response } from "express";
import { AuctionService } from "../../../domain/services/AuctionService";
import { AuctionMapper } from "../../../application/mappers/AuctionMapper";

// El service ya debería recibir la implementación de repos en la capa de configuración
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  // Crear subasta
  createAuction = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) throw new Error("Token no proporcionado");

      const dto = await this.auctionService.createAuction(req.body, token);
      res.status(201).json(dto);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // Obtener subasta por id
  getAuction = async (req: Request, res: Response): Promise<Response> => {
    try {
      const auction = await this.auctionService.getAuctionById(Number(req.params["id"]));
      if (!auction) return res.status(404).json({ error: "Auction not found" });
      return res.json(AuctionMapper.toDto(auction));
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  // Listar subastas abiertas
  listAuctions = async (_: Request, res: Response): Promise<void> => {
    try {
      const auctions = await this.auctionService.listOpenAuctions();
      if (!auctions || auctions.length === 0) {
        res.status(200).json({ message: "No hay subastas disponibles", data: [] });
        return;
      }
      res.json({ data: auctions.map(a => AuctionMapper.toDto(a)) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Pujar en subasta usando token
  placeBid = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) throw new Error("Token no proporcionado");

      const amount = req.body.amount;
      const success = await this.auctionService.placeBid(Number(req.params["id"]), token, amount);
      res.json({ success });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // Compra rápida usando token
  buyNow = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) throw new Error("Token no proporcionado");

      const success = await this.auctionService.buyNow(Number(req.params["id"]), token);
      res.json({ success });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // Obtener pujas de una subasta
  getBids = async (req: Request, res: Response) => {
    try {
      const auctionId = Number(req.params["id"]);
      const auction = await this.auctionService.getAuctionById(auctionId);
      if (!auction) return res.status(404).json({ error: "Auction not found" });
      return res.json(auction.bids || []);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  // Endpoint para obtener usuario actual desde token
  getCurrentUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token no proporcionado" });

    const user = await this.auctionService.getCurrentUser(token);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.json(user); // <-- return aquí
  } catch (err: any) {
    return res.status(500).json({ error: err.message }); // <-- y return aquí
  }
};

}
