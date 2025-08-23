// src/application/services/AuctionService.ts
import { Auction } from "../../domain/models/Auction";
import { AuctionRepository } from "../../domain/repositories/AuctionRepository";
import { ItemRepository } from "../../../inventory/domain/repositories/ItemRepository";
import { CreateAuctionInputDTO, CreateAuctionOutputDto } from "../../application/dto/CreateAuctionDTO";
import { AuctionMapper } from "../../application/mappers/AuctionMapper";
import {Bid} from "../../domain/models/Bid";
export class AuctionService {
  constructor(
    private readonly auctions: AuctionRepository,
    private readonly items: ItemRepository,
  ) {}

  async createAuction(input: CreateAuctionInputDTO): Promise<CreateAuctionOutputDto> {
    // 1) Traer el item del inventario
    const item = await this.items.findById(input.itemId);
    if (!item) throw new Error("Item not found");
    if (item.userId !== input.userId) {
      throw new Error("El item no pertenece al usuario");
    }

    // 2) Construir el agregado de dominio
    const auction = new Auction(
      Date.now(),                 // id simple (sustituye por UUID o autoincremental)
      item.name,                  // título desde el item
      item.description,           // descripción desde el item
      input.startingPrice,
      input.startingPrice,        // currentPrice inicia en el base
      item,
      input.buyNowPrice,
      "OPEN",
      new Date(),
      [],
      undefined,
    );

    // 3) Guardar (upsert)
    await this.auctions.save(auction);

    // 4) Devolver DTO
    return { auction: AuctionMapper.toDto(auction, input.durationHours) };
  }

  async placeBid(auctionId: number, userId: number, amount: number): Promise<boolean> {
  const auction = await this.auctions.findById(auctionId)
  if (!auction) throw new Error("Auction not found")

  const bid: Bid = {
  auctionId: auction.id, // o el id de la subasta a la que pertenece
  id: Date.now(),
  userId,
  amount,
  createdAt: new Date(),
};

const success = auction.placeBid(bid);


  if (success) {
    await this.auctions.save(auction)
  }

  return success
}


  async buyNow(auctionId: number, userId: number): Promise<boolean> {
    const auction = await this.auctions.findById(auctionId);
    if (!auction) throw new Error("Auction not found");

    const success = auction.buyNow(userId);
    if (success) {
      await this.auctions.save(auction);
    }
    return success;
  }
}

