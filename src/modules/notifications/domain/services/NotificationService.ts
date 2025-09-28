import { randomUUID } from 'crypto';
import Notification, { NotificationStatus } from '../models/Notification';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { INotificationService } from './INotificationService';

export class NotificationService implements INotificationService {
  constructor(
    private readonly repo: NotificationRepository,
    private readonly emitter?: (event: string, payload: any) => void,
  ) {}

  async create(recipient: string, message: string): Promise<Notification> {
    const notification = new Notification({
      id: randomUUID(),
      recipient,
      message,
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await this.repo.save(notification);
    notification.markSent(); // envío inmediato (sin cola por ahora)
    await this.repo.save(notification);
    // Emitir evento socket (si se configuró)
    this.emitter?.('NOTIFICATION_CREATED', {
      id: notification.id,
      recipient: notification.recipient,
      message: notification.message,
      status: notification.status,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    });
    return notification;
  }

  async listAll(): Promise<Notification[]> {
    return this.repo.listAll();
  }

  async listByRecipient(recipient: string): Promise<Notification[]> {
    return this.repo.listByRecipient(recipient);
  }
}