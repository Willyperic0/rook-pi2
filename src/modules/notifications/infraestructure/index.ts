import express, { Router } from 'express';
import { InMemoryNotificationRepository } from '../domain/repositories/InMemoryNotificationRepository';
import { NotificationService } from '../domain/services/NotificationService';
import { NotificationController } from './api/controllers/NotificationController';
import { buildNotificationRoutes } from './api/routers/NotificationRoutes';
import { NotifyAuctionWinnerUseCase } from '../application/usecases/NotifyAuctionWinnerUseCase';
import { getIo } from '../../auction/infraestructure/sockets/auctionSocket';
// En caso de configuración futura (env, cors, swagger) se añadirá aquí como en auction

export interface NotificationModule {
  router: Router;
  service: NotificationService;
  repo: InMemoryNotificationRepository;
  notifyAuctionWinnerUseCase: NotifyAuctionWinnerUseCase;
}

export function buildNotificationModule(): NotificationModule {
  const repo = new InMemoryNotificationRepository();
  const io = getIo();
  const service = new NotificationService(repo, (event, payload) => {
    io?.emit(event, payload);
  });
  const notifyAuctionWinnerUseCase = new NotifyAuctionWinnerUseCase(service);
  const controller = new NotificationController(service, repo);

  const router = express.Router();
  // Rutas base: se montará externamente con apiPrefix, aquí solo /notifications
  router.use('/', express.json(), buildNotificationRoutes(controller));

  return { router, service, repo, notifyAuctionWinnerUseCase };
}

// Exportaciones adicionales por si otro módulo quiere reutilizar componentes
export { NotificationService } from '../domain/services/NotificationService';
export { InMemoryNotificationRepository } from '../domain/repositories/InMemoryNotificationRepository';
export { NotifyAuctionWinnerUseCase } from '../application/usecases/NotifyAuctionWinnerUseCase';