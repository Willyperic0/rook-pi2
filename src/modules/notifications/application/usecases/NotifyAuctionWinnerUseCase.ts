import { INotificationService } from '../../domain/services/INotificationService';
import { AuctionStatus } from '../../../auction/domain/models/AuctionStatus';

interface BidLike {
  amount: number;
  // En el dominio real usamos userId; mantenemos compatibilidad con bidderId
  userId?: string;
  bidderId?: string;
  createdAt: string | Date;
}

interface AuctionLike {
  id: string;
  title: string;
  status: AuctionStatus | string;
  bids: BidLike[];
  highestBidderId?: string;
}

export class NotifyAuctionWinnerUseCase {
  constructor(private readonly notificationService: INotificationService) {}

  async execute(auction: AuctionLike): Promise<void> {
    if (!auction) return;
    const status = String(auction.status).toUpperCase();
    // Consideramos CLOSED (cerrada por tiempo), FINISHED (alias) y SOLD (compra inmediata)
    if (!['CLOSED', 'FINISHED', 'SOLD'].includes(status)) return;

    let winnerId = auction.highestBidderId;
    if (!winnerId && auction.bids?.length) {
      const sorted = [...auction.bids].sort(
        (a, b) =>
          b.amount - a.amount ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const top = sorted[0];
      if (top) {
        winnerId = top.userId || top.bidderId; // soporte dual
      }
    }
    if (!winnerId) return;

    const message = `Has ganado la subasta "${auction.title}" (ID: ${auction.id}).`;
    await this.notificationService.create(winnerId, message);
  }
}