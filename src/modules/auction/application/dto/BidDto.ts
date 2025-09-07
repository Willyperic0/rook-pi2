export interface BidDto {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: string; // ISO
}
