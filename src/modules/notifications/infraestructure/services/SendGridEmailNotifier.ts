import sgMail from '@sendgrid/mail';
import Notification from '../../domain/models/Notification';

export interface SendGridConfig {
  apiKey?: string;
  fromEmail?: string;
  subjectPrefix?: string;
}

export type NotificationDispatcher = (notification: Notification) => Promise<void>;

export function createSendGridEmailNotifier(config: SendGridConfig): NotificationDispatcher | null {
  const { apiKey, fromEmail, subjectPrefix = 'Notificación' } = config;

  if (!apiKey || !fromEmail) {
    return null;
  }

  sgMail.setApiKey(apiKey);

  return async (notification: Notification) => {
    const recipient = notification.recipient?.trim();
    if (!recipient || !recipient.includes('@')) {
      return;
    }

    const message = {
      to: recipient,
      from: fromEmail,
      subject: `${subjectPrefix} - ${notification.id}`,
      text: notification.message,
      html: `<p>${notification.message}</p>`,
    };

    await sgMail.send(message);
  };
}
