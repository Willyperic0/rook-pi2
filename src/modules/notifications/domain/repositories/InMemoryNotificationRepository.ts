import Notification, { NotificationStatus } from '../../domain/models/Notification';
import { NotificationRepository } from './NotificationRepository';
import { NULL_NOTIFICATION } from '../../domain/models/NullNotification';

export class InMemoryNotificationRepository implements NotificationRepository {
  private store = new Map<string, Notification>();

  async save(notification: Notification): Promise<void> {
    this.store.set(notification.id, notification);
  }

  async findById(id: string): Promise<Notification> {
    return this.store.get(id) ?? NULL_NOTIFICATION;
  }

  async listByRecipient(recipient: string): Promise<Notification[]> {
    return Array.from(this.store.values()).filter(n => n.recipient === recipient);
  }

  async listAll(): Promise<Notification[]> {
    return Array.from(this.store.values());
  }

  async listPending(): Promise<Notification[]> {
    return Array.from(this.store.values()).filter(n => n.status === NotificationStatus.PENDING);
  }
}