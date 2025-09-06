export class Purchase {
  constructor(
    public id: string,
    public userId: string,
    public auctionId: string,
    public price: number,
    public createdAt: Date = new Date()
  ) {}
}
