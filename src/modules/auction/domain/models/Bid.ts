export class Bid {
  constructor(
    public id: string,
    public userId: string,
    public auctionId: string,
    public amount: number,
    public createdAt: Date = new Date()
  ) {}
}