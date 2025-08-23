export class Bid {
  constructor(
    public id: number,
    public userId: number,
    public auctionId: number,
    public amount: number,
    public createdAt: Date = new Date()
  ) {}
}