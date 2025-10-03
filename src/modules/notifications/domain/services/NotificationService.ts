import { randomUUID } from 'crypto';
import Notification, { NotificationStatus } from '../models/Notification';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { INotificationService } from './INotificationService';

export type NotificationHook = (notification: Notification) => Promise<void> | void;

export class NotificationService implements INotificationService {
  constructor(
    private readonly repo: NotificationRepository,
    private readonly hooks: NotificationHook[] = [],
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

    let firstError: unknown | null = null;
    for (const hook of this.hooks) {
      try {
        await hook(notification);
      } catch (error) {
        if (!firstError) {
          firstError = error;
        }
        console.error('[NotificationService] hook error', error);
      }
    }

    if (firstError) {
      notification.markFailed();
    } else {
      notification.markSent();
    }

    await this.repo.save(notification);

    return notification;
  }

  async listAll(): Promise<Notification[]> {
    return this.repo.listAll();
  }

  async listByRecipient(recipient: string): Promise<Notification[]> {
    return this.repo.listByRecipient(recipient);
  }
}