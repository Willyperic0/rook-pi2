export interface BidDto {
  id: number;
  auctionId: number;
  userId: number;
  amount: number;
  timestamp: string; // ISO
}

const bid: BidDto = {
  id: 1,
  auctionId: 123,
  userId: 45,
  amount: 500,
  timestamp: new Date().toISOString(),
};

const success = auction.placeBid(bid);
