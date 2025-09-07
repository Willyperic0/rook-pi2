// src/modules/user/application/domain/models/User.ts

/**
 * Entidad de dominio para usuarios.
 * @remarks
 * No contiene IO ni dependencias de frameworks. La manipulación de créditos
 * y otras operaciones de negocio deberían exponerse en servicios de dominio.
 */
export class User {
  /** Identificador único. */
  id: string;
  /** Nombre de usuario. */
  username: string;
  /** Correo electrónico. */
  email: string;
  /** Créditos disponibles. */
  credits: number;
  /** Estado de la cuenta. */
  isActive: boolean;

  /**
   * @param id Identificador único
   * @param username Nombre de usuario
   * @param email Correo electrónico
   * @param credits Créditos disponibles
   * @param isActive Estado de la cuenta
   */
  constructor(id: string, username: string, email: string, credits: number, isActive: boolean) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.credits = credits;
    this.isActive = isActive;
  }
}
