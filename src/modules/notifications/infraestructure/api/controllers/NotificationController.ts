import { Request, Response } from 'express';
import { INotificationService } from '../../../domain/services/INotificationService';
import { NotificationRepository } from '../../../domain/repositories/NotificationRepository';
import { toNotificationDto } from '../../../application/mappers/toNotificationDTO';
import { NotificationStatus } from '../../../domain/models/Notification';

export class NotificationController {
  constructor(
    private readonly service: INotificationService,
    _repo: NotificationRepository // eliminado almacenamiento para evitar warning
  ) {}

  async create(req: Request, res: Response) {
    const { recipient, message } = req.body;
    if (!recipient || !message) {
      return res.status(400).json({ error: 'recipient and message are required' });
    }
  const n = await this.service.create(recipient, message);
  const statusCode = n.status === NotificationStatus.SENT ? 201 : 202;
  return res.status(statusCode).json(toNotificationDto(n));
  }

  async list(_req: Request, res: Response) {
    const list = await this.service.listAll();
    return res.json(list.map(toNotificationDto));
  }

  async listByRecipient(req: Request, res: Response) {
    const recipientParam = (req.params as Record<string, string>)["recipient"]; // asegurar string
    if (!recipientParam) {
      return res.status(400).json({ error: 'recipient param required' });
    }
    const list = await this.service.listByRecipient(recipientParam);
    return res.json(list.map(toNotificationDto));
  }
}