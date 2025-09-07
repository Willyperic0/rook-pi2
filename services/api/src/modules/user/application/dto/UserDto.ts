// src/modules/user/application/dto/UserDto.ts

/**
 * DTO de usuario para capa de aplicación/transporte.
 * @remarks
 * Objeto plano interoperable con HTTP/WS. No contiene lógica de dominio.
 *
 * @typedoc
 * TSDoc compatible con TypeDoc (inclúyelo en `typedoc.json`).
 */
export interface UserDto {
  /** Identificador único del usuario. */
  id: string;
  /** Nombre de usuario visible. */
  username: string;
  /** Correo electrónico. */
  email: string;
  /** Créditos disponibles para pujas o compra inmediata. */
  credits: number;
  /** Indica si la cuenta está activa. */
  isActive: boolean;
}
