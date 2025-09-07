export interface BuyNowInputDto {
  auctionId: string;
  buyerId: string;     // comprador
}

export interface BuyNowOutputDto {
  auctionId: string;
  soldPrice: number;   // = buyNowPrice
  buyerId: string;
  soldAt: string;      // ISO
  status: "SOLD";
}
