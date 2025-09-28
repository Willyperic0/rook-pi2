import Notification, { NotificationStatus } from './Notification';

export default class NullNotification extends Notification {
  constructor() {
    super({
      id: 'not-found',
      recipient: 'not-found',
      message: 'Notification not found',
      status: NotificationStatus.FAILED,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      isNull: true
    });
  }

  override setMessage(_message: string): void {
    throw new Error('Cannot modify NullNotification');
  }

  override setStatus(_status: NotificationStatus): void {
    throw new Error('Cannot modify NullNotification');
  }

  override markSent(): void {
    // no-op
  }

  override markFailed(): void {
    // no-op
  }

  protected override touch(): void {
    // no-op
  }
}

export const NULL_NOTIFICATION = new NullNotification();

export function isNullNotification(n: Notification): n is NullNotification {
  return n instanceof NullNotification && n.isNull === true;
}