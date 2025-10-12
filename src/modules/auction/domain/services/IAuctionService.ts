import { Auction } from "../models/Auction";
import { CreateAuctionInputDTO, CreateAuctionOutputDto } from "../../application/dto/CreateAuctionDTO";
import { User } from "../../../user/domain/models/User";

/**
 * @interface IAuctionService
 * Define las operaciones principales del dominio relacionadas con las subastas.
 * Esta interfaz abstrae la lógica de negocio para la creación, gestión y finalización de subastas,
 * así como las operaciones de pujas, compras rápidas y obtención de historiales de usuario.
 */
export interface IAuctionService {
  /**
   * Crea una nueva subasta asociada al vendedor identificado por su username.
   * @param input Datos necesarios para crear la subasta.
   * @param username Nombre de usuario del vendedor.
   * @returns Un objeto DTO con la información de la subasta creada.
   */
  createAuction(input: CreateAuctionInputDTO, username: string): Promise<CreateAuctionOutputDto>;

  /**
   * Permite a un usuario realizar una puja sobre una subasta existente.
   * @param auctionId Identificador de la subasta.
   * @param username Nombre de usuario del pujador.
   * @param amount Monto ofrecido en la puja.
   * @returns `true` si la puja fue aceptada, `false` en caso contrario.
   */
  placeBid(auctionId: string, username: string, amount: number): Promise<boolean>;

  /**
   * Permite realizar la compra inmediata (“buy now”) de una subasta activa.
   * @param auctionId Identificador de la subasta.
   * @param username Nombre de usuario del comprador.
   * @returns `true` si la compra fue exitosa, `false` si no se pudo completar.
   */
  buyNow(auctionId: string, username: string): Promise<boolean>;

  /**
   * Busca una subasta específica por su identificador.
   * @param id Identificador único de la subasta.
   * @returns La instancia de la subasta o `null` si no existe.
   */
  getAuctionById(id: string): Promise<Auction | null>;

  /**
   * Obtiene la lista de todas las subastas actualmente abiertas.
   * @returns Un arreglo con las subastas abiertas o `null` si no hay ninguna.
   */
  listOpenAuctions(): Promise<Auction[] | null>;

  /**
   * Busca un usuario por su nombre de usuario.
   * @param username Nombre de usuario.
   * @returns El usuario correspondiente o `null` si no se encuentra.
   */
  getCurrentUser(username: string): Promise<User | null>;

  /**
   * Finaliza una subasta, asignando un ganador si aplica.
   * @param auctionId Identificador de la subasta a finalizar.
   * @param winnerId (Opcional) Identificador del usuario ganador.
   */
  finalizeAuction(auctionId: string, winnerId?: string): Promise<void>;

  /**
   * Obtiene todas las subastas compradas por el usuario.
   * @param username Nombre de usuario del comprador.
   * @returns Un arreglo de subastas en las que el usuario fue comprador.
   */
  getPurchasedAuctions(username: string): Promise<Auction[]>;

  /**
   * Obtiene todas las subastas vendidas por el usuario.
   * @param username Nombre de usuario del vendedor.
   * @returns Un arreglo de subastas en las que el usuario fue vendedor.
   */
  getSoldAuctions(username: string): Promise<Auction[]>;
}