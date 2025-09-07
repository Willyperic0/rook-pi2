// test/auction.service.test.ts
import { AuctionService } from "../src/modules/auction/domain/services/AuctionService";
import { CreateAuctionInputDTO } from "../src/modules/auction/application/dto/CreateAuctionDTO";
import { Auction } from "../src/modules/auction/domain/models/Auction";
import { Bid } from "../src/modules/auction/domain/models/Bid";
import { Item } from "../src/modules/inventory/domain/models/Item";

jest.mock("../src/modules/auction/infraestructure/sockets/auctionSocket", () => ({
  emitBidUpdate: jest.fn(),
  emitBuyNow: jest.fn(),
  emitNewAuction: jest.fn(),
}));

// Mocks de repositorios
const mockAuctionRepo = {
  save: jest.fn(),
  findById: jest.fn(),
  findByStatus: jest.fn(),
  findClosedByBuyer: jest.fn(),
  findClosedBySeller: jest.fn(),
};

const mockItemRepo = {
  findById: jest.fn(),
  updateAvailability: jest.fn(),
  updateItem: jest.fn(),
};

const mockUserRepo = {
  findByToken: jest.fn(),
  findById: jest.fn(),
  updateCredits: jest.fn(),
};

describe("AuctionService", () => {
  let service: AuctionService;

  beforeEach(() => {
    service = new AuctionService(mockAuctionRepo as any, mockItemRepo as any, mockUserRepo as any);
    jest.clearAllMocks();
  });

  // ========================
  // CREATE AUCTION
  // ========================
  it("createAuction debería crear una subasta correctamente", async () => {
    const user = { id: 1, credits: 5 };
    const item: Item = {
      id: 1,
      userId: 1,
      name: "Espada legendaria",
      description: "Una espada épica",
      type: "Armas",
      isAvailable: true,
      imagen: "base64string",
    };

    const input: CreateAuctionInputDTO = {
      userId: user.id,
      itemId: item.id,
      startingPrice: 100,
      durationHours: 24,
      buyNowPrice: 200,
    };

    mockUserRepo.findByToken.mockResolvedValue(user);
    mockItemRepo.findById.mockResolvedValue(item);
    mockAuctionRepo.save.mockImplementation(a => Promise.resolve(a));
    mockItemRepo.updateAvailability.mockResolvedValue({});

    const result = await service.createAuction(input, "token123");

    expect(result).toHaveProperty("auction");
    expect(mockAuctionRepo.save).toHaveBeenCalled();
    expect(mockItemRepo.updateAvailability).toHaveBeenCalledWith(item.id, false);
  });

  it("createAuction debería fallar si créditos insuficientes", async () => {
    const input: CreateAuctionInputDTO = {
      userId: 1,
      itemId: 1,
      startingPrice: 10,
      durationHours: 48,
    };

    mockUserRepo.findByToken.mockResolvedValue({ id: 1, credits: 0 });
    mockItemRepo.findById.mockResolvedValue({
      id: 1,
      userId: 1,
      name: "Item1",
      description: "Descripción",
      type: "Armas",
      isAvailable: true,
      imagen: "",
    });

    await expect(service.createAuction(input, "token")).rejects.toThrow("Créditos insuficientes");
  });

  // ========================
  // PLACE BID
  // ========================
  it("placeBid debería registrar una puja correctamente", async () => {
    const auctionItem: Item = {
      id: 1,
      userId: 2,
      name: "Item",
      description: "Descripción",
      type: "Armas",
      isAvailable: true,
      imagen: "",
    };
    const auction = new Auction(1, "Item", "Desc", 10, 10, auctionItem, 20, "OPEN", new Date(), []);
    mockAuctionRepo.findById.mockResolvedValue(auction);
    mockUserRepo.findByToken.mockResolvedValue({ id: 3, credits: 50 });
    mockAuctionRepo.save.mockResolvedValue({});
    mockUserRepo.updateCredits.mockResolvedValue({});

    const success = await service.placeBid(1, "token", 15);
    expect(success).toBe(true);
    expect(mockAuctionRepo.save).toHaveBeenCalled();
  });

  it("placeBid debería fallar si el creador puja su propia subasta", async () => {
    const auctionItem: Item = {
      id: 1,
      userId: 2,
      name: "Item",
      description: "Descripción",
      type: "Armas",
      isAvailable: true,
      imagen: "",
    };
    const auction = new Auction(1, "Item", "Desc", 10, 10, auctionItem, 20, "OPEN", new Date(), []);
    mockAuctionRepo.findById.mockResolvedValue(auction);
    mockUserRepo.findByToken.mockResolvedValue({ id: 2, credits: 50 });

    await expect(service.placeBid(1, "token", 15)).rejects.toThrow(
      "El creador no puede pujar en su propia subasta"
    );
  });

  // ========================
  // BUY NOW
  // ========================
  it("buyNow debería comprar correctamente", async () => {
    const auctionItem: Item = {
      id: 1,
      userId: 2,
      name: "Item",
      description: "Descripción",
      type: "Armas",
      isAvailable: true,
      imagen: "",
    };
    const auction = new Auction(1, "Item", "Desc", 10, 10, auctionItem, 20, "OPEN", new Date(), []);
    mockAuctionRepo.findById.mockResolvedValue(auction);
    mockUserRepo.findByToken.mockResolvedValue({ id: 3, credits: 50 });
    mockUserRepo.findById.mockResolvedValue({ id: 2, credits: 5 });
    mockUserRepo.updateCredits.mockResolvedValue({});
    mockItemRepo.findById.mockResolvedValue(auctionItem);
    mockItemRepo.updateItem.mockResolvedValue({});

    const success = await service.buyNow(1, "token");
    expect(success).toBe(true);
    expect(mockAuctionRepo.save).toHaveBeenCalled();
  });

  // ========================
  // FINALIZE AUCTION
  // ========================
  it("finalizeAuction debería cerrar la subasta y actualizar usuarios/items", async () => {
    const auctionItem: Item = {
      id: 1,
      userId: 2,
      name: "Item",
      description: "Descripción",
      type: "Armas",
      isAvailable: true,
      imagen: "",
    };
    const auction = new Auction(1, "Item", "Desc", 10, 10, auctionItem, 20, "OPEN", new Date(), []);
    auction.bids.push({ auctionId: 1, id: 1, userId: 3, amount: 15, createdAt: new Date() } as Bid);

    mockAuctionRepo.findById.mockResolvedValue(auction);
    mockUserRepo.findById.mockResolvedValue({ id: 2, credits: 5 });
    mockItemRepo.findById.mockResolvedValue(auctionItem);
    mockUserRepo.updateCredits.mockResolvedValue({});
    mockItemRepo.updateItem.mockResolvedValue({});
    mockAuctionRepo.save.mockResolvedValue({});

    await service.finalizeAuction(1);
    expect(mockAuctionRepo.save).toHaveBeenCalled();
    expect(auction.status).toBe("CLOSED");
  });

  // ========================
  // GET AUCTION BY ID
  // ========================
  it("getAuctionById debería retornar subasta", async () => {
    mockAuctionRepo.findById.mockResolvedValue({ id: 1 });
    const result = await service.getAuctionById(1);
    expect(result).toHaveProperty("id", 1);
  });

  // ========================
  // LIST OPEN AUCTIONS
  // ========================
  it("listOpenAuctions debería retornar subastas abiertas", async () => {
    mockAuctionRepo.findByStatus.mockResolvedValue([{ id: 1 }]);
    const result = await service.listOpenAuctions();
    expect(result).toHaveLength(1);
  });

  // ========================
  // GET CURRENT USER
  // ========================
  it("getCurrentUser debería retornar usuario actual", async () => {
    mockUserRepo.findByToken.mockResolvedValue({ id: 1 });
    const user = await service.getCurrentUser("token");
    expect(user).toHaveProperty("id", 1);
  });

  // ========================
  // GET PURCHASED AUCTIONS
  // ========================
  it("getPurchasedAuctions debería retornar subastas compradas por usuario", async () => {
    mockAuctionRepo.findClosedByBuyer.mockResolvedValue([{ id: 1 }]);
    const result = await service.getPurchasedAuctions(1);
    expect(result).toHaveLength(1);
  });

  // ========================
  // GET SOLD AUCTIONS
  // ========================
  it("getSoldAuctions debería retornar subastas vendidas por usuario", async () => {
    mockAuctionRepo.findClosedBySeller.mockResolvedValue([{ id: 2 }]);
    const result = await service.getSoldAuctions(1);
    expect(result).toHaveLength(1);
  });
});
