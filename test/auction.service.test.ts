// test/auction.service.test.ts
import { AuctionService } from "../src/modules/auction/domain/services/AuctionService";
import { CreateAuctionInputDTO } from "../src/modules/auction/application/dto/CreateAuctionDTO";
import { Auction } from "../src/modules/auction/domain/models/Auction";
import { Bid } from "../src/modules/auction/domain/models/Bid";
import { Item } from "../src/modules/inventory/domain/models/Item";
import { AuctionStatus } from "../src/modules/auction/domain/models/AuctionStatus";

jest.mock("../src/modules/auction/infraestructure/sockets/auctionSocket", () => ({
  emitBidUpdate: jest.fn(),
  emitBuyNow: jest.fn(),
  emitNewAuction: jest.fn(),
}));

// ========================
// Mock repositorios
// ========================
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

// ========================
// Mock de usuario válido
// ========================
class MockUser {
  constructor(private id: string | number, private credits: number) {}
  getId() { return String(this.id); }
  getCredits() { return this.credits; }
  setCredits(c: number) { this.credits = c; }
}

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
    const user = new MockUser("1", 5);
    const item: Item = {
      id: "1",
      userId: "1",
      name: "Espada legendaria",
      description: "Una espada épica",
      type: "Armas",
      isAvailable: true,
      imagen: "base64string",
    };

    const input: CreateAuctionInputDTO = {
      userId: user.getId(),
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
    const user = new MockUser("1", 0);
    const item: Item = {
      id: "1",
      userId: "1",
      name: "Item1",
      description: "Descripción",
      type: "Armas",
      isAvailable: true,
      imagen: "",
    };
    const input: CreateAuctionInputDTO = {
      userId: user.getId(),
      itemId: item.id,
      startingPrice: 10,
      durationHours: 48,
    };

    mockUserRepo.findByToken.mockResolvedValue(user);
    mockItemRepo.findById.mockResolvedValue(item);

    await expect(service.createAuction(input, "token")).rejects.toThrow("Créditos insuficientes");
  });

  // ========================
  // PLACE BID
  // ========================
  it("placeBid debería registrar una puja correctamente", async () => {
    const auctionItem: Item = {
      id: "1",
      userId: "2",
      name: "Item",
      description: "Descripción",
      type: "Armas",
      isAvailable: true,
      imagen: "",
    };
    const auctionInput = {
      id: "1",
      title: "Item",
      description: "Descripción",
      startingPrice: 10,
      currentPrice: 10,
      item: auctionItem,
      buyNowPrice: 20,
      status: "OPEN" as AuctionStatus,
      createdAt: new Date(),
      bids: [] as Bid[],
      highestBidderId: undefined
    };
    const auction = new Auction(auctionInput);
    mockAuctionRepo.findById.mockResolvedValue(auction);
    const bidder = new MockUser("3", 50);
    mockUserRepo.findByToken.mockResolvedValue(bidder);
    mockAuctionRepo.save.mockResolvedValue({});
    mockUserRepo.updateCredits.mockResolvedValue({});

    const success = await service.placeBid("1", "token", 15);
    expect(success).toBe(true);
    expect(mockAuctionRepo.save).toHaveBeenCalled();
  });

  it("placeBid debería fallar si el creador puja su propia subasta", async () => {
    const auctionItem: Item = {
      id: "1",
      userId: "2",
      name: "Item",
      description: "Descripción",
      type: "Armas",
      isAvailable: true,
      imagen: "",
    };
    const auctionInput = {
      id: "1",
      title: "Item",
      description: "Descripción",
      startingPrice: 10,
      currentPrice: 10,
      item: auctionItem,
      buyNowPrice: 20,
      status: "OPEN" as AuctionStatus,
      createdAt: new Date(),
      bids: [] as Bid[],
      highestBidderId: undefined
    };
    const auction = new Auction(auctionInput);
    mockAuctionRepo.findById.mockResolvedValue(auction);
    const creator = new MockUser("2", 50);
    mockUserRepo.findByToken.mockResolvedValue(creator);

    await expect(service.placeBid("1", "token", 15)).rejects.toThrow(
      "El creador no puede pujar en su propia subasta"
    );
  });

  // ========================
  // BUY NOW
  // ========================
  it("buyNow debería comprar correctamente", async () => {
    const auctionItem: Item = {
      id: "1",
      userId: "2",
      name: "Item",
      description: "Descripción",
      type: "Armas",
      isAvailable: true,
      imagen: "",
    };
    const auctionInput = {
      id: "1",
      title: "Item",
      description: "Descripción",
      startingPrice: 10,
      currentPrice: 10,
      item: auctionItem,
      buyNowPrice: 20,
      status: "OPEN" as AuctionStatus,
      createdAt: new Date(),
      bids: [] as Bid[],
      highestBidderId: undefined
    };
    const auction = new Auction(auctionInput);
    mockAuctionRepo.findById.mockResolvedValue(auction);
    const buyer = new MockUser("3", 50);
    const seller = new MockUser("2", 5);
    mockUserRepo.findByToken.mockResolvedValue(buyer);
    mockUserRepo.findById.mockResolvedValue(seller);
    mockUserRepo.updateCredits.mockResolvedValue({});
    mockItemRepo.findById.mockResolvedValue(auctionItem);
    mockItemRepo.updateItem.mockResolvedValue({});

    const success = await service.buyNow("1", "token");
    expect(success).toBe(true);
    expect(mockAuctionRepo.save).toHaveBeenCalled();
  });

  // ========================
  // FINALIZE AUCTION
  // ========================
  it("finalizeAuction debería cerrar la subasta y actualizar usuarios/items", async () => {
    const auctionItem: Item = {
      id: "1",
      userId: "2",
      name: "Item",
      description: "Descripción",
      type: "Armas",
      isAvailable: true,
      imagen: "",
    };
    const auctionInput = {
      id: "1",
      title: "Item",
      description: "Descripción",
      startingPrice: 10,
      currentPrice: 10,
      item: auctionItem,
      buyNowPrice: 20,
      status: "OPEN" as AuctionStatus,
      createdAt: new Date(),
      bids: [] as Bid[],
      highestBidderId: undefined
    };
    const auction = new Auction(auctionInput);
    auction.getBids().push({ auctionId: "1", id: "1", userId: "3", amount: 15, createdAt: new Date() } as Bid);

    mockAuctionRepo.findById.mockResolvedValue(auction);
    mockUserRepo.findById.mockResolvedValue(new MockUser("2", 5));
    mockItemRepo.findById.mockResolvedValue(auctionItem);
    mockUserRepo.updateCredits.mockResolvedValue({});
    mockItemRepo.updateItem.mockResolvedValue({});
    mockAuctionRepo.save.mockResolvedValue({});

    await service.finalizeAuction("1");
    expect(mockAuctionRepo.save).toHaveBeenCalled();
    expect(auction.getStatus()).toBe("CLOSED");
  });

  // ========================
  // GET AUCTION BY ID
  // ========================
  it("getAuctionById debería retornar subasta", async () => {
    mockAuctionRepo.findById.mockResolvedValue({ id: "1" });
    const result = await service.getAuctionById("1");
    expect(result).toHaveProperty("id", "1");
  });

  // ========================
  // LIST OPEN AUCTIONS
  // ========================
  it("listOpenAuctions debería retornar subastas abiertas", async () => {
    mockAuctionRepo.findByStatus.mockResolvedValue([{ id: "1" }]);
    const result = await service.listOpenAuctions();
    expect(result).toHaveLength(1);
  });

  // ========================
  // GET CURRENT USER
  // ========================
  it("getCurrentUser debería retornar usuario actual", async () => {
    const user = new MockUser("1", 10);
    mockUserRepo.findByToken.mockResolvedValue(user);
    const result = await service.getCurrentUser("token");
    expect(result.getId()).toBe("1");
  });

  // ========================
  // GET PURCHASED AUCTIONS
  // ========================
  it("getPurchasedAuctions debería retornar subastas compradas por usuario", async () => {
    mockAuctionRepo.findClosedByBuyer.mockResolvedValue([{ id: "1" }]);
    const result = await service.getPurchasedAuctions("1");
    expect(result).toHaveLength(1);
  });

  // ========================
  // GET SOLD AUCTIONS
  // ========================
  it("getSoldAuctions debería retornar subastas vendidas por usuario", async () => {
    mockAuctionRepo.findClosedBySeller.mockResolvedValue([{ id: "2" }]);
    const result = await service.getSoldAuctions("1");
    expect(result).toHaveLength(1);
  });
});
