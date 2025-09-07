export class User {
  private id: string;       // privado internamente
  private username: string;
  private credits: number;

  constructor(id: string, username: string, credits: number) {
    this.id = id;
    this.username = username;
    this.credits = credits;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  getCredits(): number {
    return this.credits;
  }

  // Setters
  setUsername(newUsername: string): void {
    this.username = newUsername;
  }

  setCredits(newCredits: number): void {
    if (newCredits < 0) {
      throw new Error("Los créditos no pueden ser negativos");
    }
    this.credits = newCredits;
  }

  // Métodos extra útiles
  addCredits(amount: number): void {
    this.setCredits(this.credits + amount);
  }

  deductCredits(amount: number): void {
    if (amount > this.credits) {
      throw new Error("No hay suficientes créditos");
    }
    this.setCredits(this.credits - amount);
  }
}
