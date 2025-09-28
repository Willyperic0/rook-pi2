import Notification from '../models/Notification';

export interface INotificationService {
  create(recipient: string, message: string): Promise<Notification>;
  listAll(): Promise<Notification[]>;
  listByRecipient(recipient: string): Promise<Notification[]>;
}