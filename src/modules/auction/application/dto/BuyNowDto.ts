export interface BuyNowInputDto {
  auctionId: number;
  buyerId: number;     // comprador
}

export interface BuyNowOutputDto {
  auctionId: number;
  soldPrice: number;   // = buyNowPrice
  buyerId: number;
  soldAt: string;      // ISO
  status: "SOLD";
}
