import express, { Router } from 'express';
import { InMemoryNotificationRepository } from '../domain/repositories/InMemoryNotificationRepository';
import { NotificationHook, NotificationService } from '../domain/services/NotificationService';
import { NotificationController } from './api/controllers/NotificationController';
import { buildNotificationRoutes } from './api/routers/NotificationRoutes';
import { NotifyAuctionWinnerUseCase } from '../application/usecases/NotifyAuctionWinnerUseCase';
import { notificationsEnv } from './config/env';
import { createSendGridEmailNotifier, SendGridConfig } from './services/SendGridEmailNotifier';
// En caso de configuración futura (env, cors, swagger) se añadirá aquí como en auction

export interface NotificationModule {
  router: Router;
  service: NotificationService;
  repo: InMemoryNotificationRepository;
  notifyAuctionWinnerUseCase: NotifyAuctionWinnerUseCase;
}

export function buildNotificationModule(): NotificationModule {
  const repo = new InMemoryNotificationRepository();
  const hooks: NotificationHook[] = [];

  const emailConfig: SendGridConfig = { subjectPrefix: 'Nexus Battles' };

  if (notificationsEnv.sendGridApiKey) {
    emailConfig.apiKey = notificationsEnv.sendGridApiKey;
  }

  if (notificationsEnv.fromEmail) {
    emailConfig.fromEmail = notificationsEnv.fromEmail;
  }

  const emailNotifier = createSendGridEmailNotifier(emailConfig);

  if (emailNotifier) {
    hooks.push(emailNotifier);
  }

  const service = new NotificationService(repo, hooks);
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