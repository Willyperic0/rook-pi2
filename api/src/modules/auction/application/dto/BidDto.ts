export interface BidDto {
  id: number;
  auctionId: number;
  userId: number;
  amount: number;
  timestamp: string; // ISO
}
