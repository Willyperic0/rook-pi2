import { InMemoryNotificationRepository } from "../src/modules/notifications/domain/repositories/InMemoryNotificationRepository";
import { NotificationService } from "../src/modules/notifications/domain/services/NotificationService";
import { NotifyAuctionWinnerUseCase } from "../src/modules/notifications/application/usecases/NotifyAuctionWinnerUseCase";

// Utilidad para crear subastas simuladas
function buildAuction(partial: Partial<any> = {}) {
  return {
    id: partial.id || "auc-1",
    title: partial.title || "Subasta de prueba",
    status: partial.status || "CLOSED",
    bids: partial.bids || [],
    highestBidderId: partial.highestBidderId,
  };
}

describe("NotifyAuctionWinnerUseCase", () => {
  let repo: InMemoryNotificationRepository;
  let service: NotificationService;
  let useCase: NotifyAuctionWinnerUseCase;

  beforeEach(() => {
    repo = new InMemoryNotificationRepository();
    service = new NotificationService(repo as any);
    useCase = new NotifyAuctionWinnerUseCase(service);
  });

  test("crea notificación cuando status CLOSED y highestBidderId existe", async () => {
    const auction = buildAuction({ status: "CLOSED", highestBidderId: "user123" });
    await useCase.execute(auction);
    const all = await repo.listAll();
    expect(all).toHaveLength(1);
    expect(all[0].recipient).toBe("user123");
    expect(all[0].message).toContain("Has ganado la subasta");
  });

  test("deriva ganador de las bids si no hay highestBidderId", async () => {
    const auction = buildAuction({
      status: "CLOSED",
      bids: [
        { amount: 50, userId: "u1", createdAt: new Date(Date.now() - 2000) },
        { amount: 75, userId: "u2", createdAt: new Date(Date.now() - 1000) },
        { amount: 60, userId: "u3", createdAt: new Date(Date.now() - 1500) },
      ],
    });
    await useCase.execute(auction);
    const all = await repo.listAll();
    expect(all).toHaveLength(1);
    expect(all[0].recipient).toBe("u2");
  });

  test("acepta estado SOLD (compra inmediata)", async () => {
    const auction = buildAuction({ status: "SOLD", highestBidderId: "buyerX" });
    await useCase.execute(auction);
    const all = await repo.listAll();
    expect(all).toHaveLength(1);
    expect(all[0].recipient).toBe("buyerX");
  });

  test("no crea notificación si estado OPEN", async () => {
    const auction = buildAuction({ status: "OPEN", highestBidderId: "userY" });
    await useCase.execute(auction);
    const all = await repo.listAll();
    expect(all).toHaveLength(0);
  });

  test("no crea notificación si no hay ganador ni bids", async () => {
    const auction = buildAuction({ status: "CLOSED" });
    await useCase.execute(auction);
    const all = await repo.listAll();
    expect(all).toHaveLength(0);
  });
});
