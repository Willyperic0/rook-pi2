import sgMail from '@sendgrid/mail';
import Notification, { NotificationStatus } from '../src/modules/notifications/domain/models/Notification';
import { createSendGridEmailNotifier } from '../src/modules/notifications/infraestructure/services/SendGridEmailNotifier';

const mockedSgMail = sgMail as unknown as {
  setApiKey: jest.Mock;
  send: jest.Mock;
};

jest.mock('@sendgrid/mail', () => ({
  __esModule: true,
  default: {
    setApiKey: jest.fn(),
    send: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('SendGridEmailNotifier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when config is incomplete', () => {
    const notifier = createSendGridEmailNotifier({});
    expect(notifier).toBeNull();
  });

  it('sends email when recipient is an address', async () => {
    const notifier = createSendGridEmailNotifier({
      apiKey: 'SG.test',
      fromEmail: 'noreply@example.com',
      subjectPrefix: 'Test',
    });

    expect(notifier).not.toBeNull();

    const notification = new Notification({
      id: 'notif-1',
      recipient: 'player@example.com',
      message: 'Ganaste la subasta',
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await notifier!(notification);

  expect(mockedSgMail.setApiKey).toHaveBeenCalledWith('SG.test');
  expect(mockedSgMail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'player@example.com',
        from: 'noreply@example.com',
      }),
    );
  });

  it('ignores dispatch when recipient is not an email', async () => {
    const notifier = createSendGridEmailNotifier({
      apiKey: 'SG.test',
      fromEmail: 'noreply@example.com',
    });

    const notification = new Notification({
      id: 'notif-2',
      recipient: 'user-id-123',
      message: 'Mensaje',
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await notifier!(notification);

    expect(mockedSgMail.send).not.toHaveBeenCalled();
  });
});
