// src/domain/services/IAuctionService.ts
import { Auction } from "../models/Auction";
import { CreateAuctionInputDTO, CreateAuctionOutputDto } from "../../application/dto/CreateAuctionDTO";
import { User } from "../../../user/domain/models/User";

export interface IAuctionService {
  createAuction(input: CreateAuctionInputDTO, token: string): Promise<CreateAuctionOutputDto>;
  placeBid(auctionId: string, token: string, amount: number): Promise<boolean>;
  buyNow(auctionId: string, token: string): Promise<boolean>;
  getAuctionById(id: string): Promise<Auction | null>;
  listOpenAuctions(): Promise<Auction[] | null>;
  getCurrentUser(token: string): Promise<User | null>; 
  finalizeAuction(auctionId: string, winnerId?: string): Promise<void>;
  getPurchasedAuctions(userId: string): Promise<Auction[]>;
  getSoldAuctions(userId: string): Promise<Auction[]>;
}
