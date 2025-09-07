import { Request, Response } from "express";
import { IAuctionService } from "../../../domain/services/IAuctionService";
import { AuctionMapper } from "../../../application/mappers/AuctionMapper";

// El service ya debería recibir la implementación de repos en la capa de configuración
export class AuctionController {
  constructor(private readonly auctionService: IAuctionService) {}

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
      const auctionId = req.params["id"];
      if (!auctionId) return res.status(400).json({ error: "auctionId no proporcionado" });
      const auction = await this.auctionService.getAuctionById(auctionId);
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
  placeBid = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Token no proporcionado");

    const auctionId = req.params["id"];
    if (!auctionId) return res.status(400).json({ error: "auctionId no proporcionado" });

    const amount = req.body.amount;
    if (!amount) throw new Error("Amount no proporcionado");

    const success = await this.auctionService.placeBid(auctionId, token, amount);
    return res.json({ success });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};


  // Compra rápida usando token
  buyNow = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token no proporcionado" });

  try {
    const user = await this.auctionService.getCurrentUser(token);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const auctionId = req.params["id"]; // coincide con tu ruta
if (!auctionId) return res.status(400).json({ error: "auctionId no proporcionado" });


    const success = await this.auctionService.buyNow(auctionId, token);
    if (!success) return res.status(400).json({ error: "No se pudo realizar la compra rápida" });

    return res.status(200).json({ success: true, message: "Compra rápida realizada correctamente" });
  } catch (err: any) {
    if (err.message.includes("not found")) return res.status(404).json({ error: err.message });
    if (err.message.includes("Créditos insuficientes")) return res.status(403).json({ error: err.message });
    return res.status(500).json({ error: err.message });
  }
};



  // Obtener pujas de una subasta
  getBids = async (req: Request, res: Response) => {
    try {
      const auctionId = req.params["id"];
      if (!auctionId) return res.status(400).json({ error: "auctionId no proporcionado" });
      const auction = await this.auctionService.getAuctionById(auctionId);
      if (!auction) return res.status(404).json({ error: "Auction not found" });
      return res.json(auction.getBids() || []);
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
  // Subastas compradas
  getPurchasedAuctions = async (req: Request, res: Response) => {
    try {
      const userId = req.params["userId"];
      if (!userId) return res.status(400).json({ error: "userId no proporcionado" });
      const auctions = await this.auctionService.getPurchasedAuctions(userId);
      return res.json({ data: auctions.map(a => AuctionMapper.toDto(a)) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  // Subastas vendidas
  getSoldAuctions = async (req: Request, res: Response) => {
    try {
      const userId = req.params["userId"];
      if (!userId) return res.status(400).json({ error: "userId no proporcionado" });
      const auctions = await this.auctionService.getSoldAuctions(userId);
      return res.json({ data: auctions.map(a => AuctionMapper.toDto(a)) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };
}
