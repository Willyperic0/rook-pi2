export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export interface InterfaceNotification {
  id: string;
  recipient: string;
  message: string;
  status: NotificationStatus;
  createdAt: Date;
  updatedAt: Date;
  isNull?: boolean;
}

export default class Notification implements InterfaceNotification {
  id: string;
  recipient: string;
  message: string;
  status: NotificationStatus;
  createdAt: Date;
  updatedAt: Date;
  isNull: boolean;

  constructor(notification: InterfaceNotification) {
    this.id = notification.id;
    this.recipient = notification.recipient;
    this.message = notification.message;
    this.status = notification.status;
    this.createdAt = notification.createdAt;
    this.updatedAt = notification.updatedAt;
    this.isNull = notification.isNull ?? false;
  }

  setMessage(message: string): void {
    this.message = message;
    this.touch();
  }

  setStatus(status: NotificationStatus): void {
    this.status = status;
    this.touch();
  }

  markSent(): void {
    this.status = NotificationStatus.SENT;
    this.touch();
  }

  markFailed(): void {
    this.status = NotificationStatus.FAILED;
    this.touch();
  }

  protected touch(): void {
    this.updatedAt = new Date();
  }
}