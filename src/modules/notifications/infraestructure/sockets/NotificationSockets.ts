import { Server } from 'socket.io';
import { NotifyAuctionWinnerUseCase } from '../../application/usecases/NotifyAuctionWinnerUseCase';

// Debe coincidir con el emit del módulo de subastas: emit("AUCTION_CLOSED", ...)
const EVENT_AUCTION_CLOSED = 'AUCTION_CLOSED';

export function registerAuctionWinnerListener(io: Server, useCase: NotifyAuctionWinnerUseCase) {
  io.on('connection', (socket) => {
    socket.on(EVENT_AUCTION_CLOSED, async (auctionPayload: any) => {
      try {
        // El payload enviado desde auctionSocket es { closedAuction: AuctionDto }
        const auction = auctionPayload?.closedAuction ?? auctionPayload;
        await useCase.execute(auction);
      } catch (err) {
        console.error('[auctionWinnerListener] Error notificando ganador', err);
      }
    });
  });
}