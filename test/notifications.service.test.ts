import { NotificationService } from '../src/modules/notifications/domain/services/NotificationService';
import { NotificationRepository } from '../src/modules/notifications/domain/repositories/NotificationRepository';
import { NotificationStatus } from '../src/modules/notifications/domain/models/Notification';

describe('NotificationService', () => {
  const buildRepo = () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const repo: NotificationRepository = {
      save,
      findById: jest.fn(),
      listAll: jest.fn().mockResolvedValue([]),
      listByRecipient: jest.fn().mockResolvedValue([]),
      listPending: jest.fn().mockResolvedValue([]),
    };

    return { repo, mocks: { save } };
  };

  it('marks notification as SENT when hooks succeed', async () => {
  const { repo, mocks } = buildRepo();
    const hook = jest.fn().mockResolvedValue(undefined);
    const service = new NotificationService(repo, [hook]);

    const notification = await service.create('player@example.com', 'Ganaste');

    expect(hook).toHaveBeenCalled();
  expect(mocks.save).toHaveBeenCalledTimes(2);
    expect(notification.status).toBe(NotificationStatus.SENT);
  });

  it('marks notification as FAILED when a hook throws', async () => {
  const { repo, mocks } = buildRepo();
    const hook = jest.fn().mockRejectedValue(new Error('Send failed'));
    const service = new NotificationService(repo, [hook]);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const notification = await service.create('player@example.com', 'Ganaste');

    expect(notification.status).toBe(NotificationStatus.FAILED);
  expect(mocks.save).toHaveBeenCalledTimes(2);
    consoleSpy.mockRestore();
  });
});
