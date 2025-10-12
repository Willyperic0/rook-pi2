/**
 * Representa un usuario dentro del dominio.
 * Contiene su identificador, nombre de usuario y la cantidad de créditos disponibles.
 */
export class User {
  private id: string;        // Identificador único del usuario
  private username: string;  // Nombre del usuario dentro del sistema
  private credits: number;   // Créditos disponibles para realizar compras o pujas

  /**
   * Crea una nueva instancia de `User`.
   * @param id Identificador único del usuario.
   * @param username Nombre del usuario.
   * @param credits Créditos iniciales asignados al usuario.
   */
  constructor(id: string, username: string, credits: number) {
    this.id = id;
    this.username = username;
    this.credits = credits;
  }

  /**
   * Obtiene el identificador único del usuario.
   * @returns El ID del usuario.
   */
  getId(): string {
    return this.id;
  }

  /**
   * Obtiene el nombre del usuario.
   * @returns El nombre de usuario.
   */
  getUsername(): string {
    return this.username;
  }

  /**
   * Obtiene la cantidad actual de créditos del usuario.
   * @returns Créditos disponibles.
   */
  getCredits(): number {
    return this.credits;
  }

  /**
   * Actualiza el nombre del usuario.
   * @param newUsername Nuevo nombre de usuario.
   */
  setUsername(newUsername: string): void {
    this.username = newUsername;
  }

  /**
   * Actualiza la cantidad de créditos del usuario.
   * No se permiten valores negativos.
   * @param newCredits Nueva cantidad de créditos.
   * @throws Error si el valor es negativo.
   */
  setCredits(newCredits: number): void {
    if (newCredits < 0) {
      throw new Error("Los créditos no pueden ser negativos");
    }
    this.credits = newCredits;
  }

  /**
   * Añade una cantidad de créditos al saldo actual del usuario.
   * @param amount Cantidad de créditos a añadir.
   */
  addCredits(amount: number): void {
    this.setCredits(this.credits + amount);
  }

  /**
   * Resta una cantidad de créditos del saldo actual.
   * @param amount Cantidad de créditos a deducir.
   * @throws Error si la cantidad a restar excede el saldo actual.
   */
  deductCredits(amount: number): void {
    if (amount > this.credits) {
      throw new Error("No hay suficientes créditos");
    }
    this.setCredits(this.credits - amount);
  }
}