export interface PlaceBidInputDto {
  auctionId: string;
  userId: string;  // postor
  amount: number;
}

export interface PlaceBidOutputDto {
  auction: import("./AuctionDto").AuctionDto;
}