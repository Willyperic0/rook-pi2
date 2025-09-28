import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';

export function buildNotificationRoutes(controller: NotificationController): Router {
  const r = Router();
  r.post('/notifications', (req, res) => controller.create(req, res));
  r.get('/notifications', (req, res) => controller.list(req, res));
  r.get('/notifications/recipient/:recipient', (req, res) => controller.listByRecipient(req, res));
  return r;
}