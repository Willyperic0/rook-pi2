export interface PlaceBidInputDto {
  auctionId: number;
  userId: number;  // postor
  amount: number;
}

export interface PlaceBidOutputDto {
  auction: import("./AuctionDto").AuctionDto;
}