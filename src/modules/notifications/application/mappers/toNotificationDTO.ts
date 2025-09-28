import Notification from '../../domain/models/Notification';
import { NotificationDto } from '../dto/NotificationDTO';

export function toNotificationDto(n: Notification): NotificationDto {
  return {
    id: n.id,
    recipient: n.recipient,
    message: n.message,
    status: n.status,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
    isNull: n.isNull
  };
}