import { User } from "../model/User";
/**
 * Servicio de Usuarios
 */
export class UserService {
    // Validar si un usuario tiene suficientes créditos
    static hasEnoughCredits(user: User, amount: number): boolean {
        return user.credits >= amount;
    }

    // Descontar créditos a un usuario
    static deductCredits(user: User, amount: number): void {
        if (!this.hasEnoughCredits(user, amount)) {
            throw new Error("El usuario no tiene créditos suficientes.");
        }
        user.credits -= amount;
    }

    // Añadir créditos (ej: recarga o devolución)
    static addCredits(user: User, amount: number): void {
        user.credits += amount;
    }
    
}