/**
 * Representa la información básica de un usuario dentro del sistema.
 * 
 * Este DTO se utiliza para transferir datos del usuario entre las capas
 * de la aplicación sin exponer detalles internos del dominio.
 */
export interface UserDto {
  /** Identificador único del usuario dentro del sistema. */
  id: string;

  /** Nombre de usuario visible o asociado al perfil. */
  username: string;

  /** Créditos disponibles para realizar pujas o compras inmediatas. */
  credits: number;
}