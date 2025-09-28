import Notification from '../../domain/models/Notification';

export interface NotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(id: string): Promise<Notification>;
  listByRecipient(recipient: string): Promise<Notification[]>;
  listAll(): Promise<Notification[]>;
  listPending(): Promise<Notification[]>;
}