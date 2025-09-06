export class User{
    id: string;             // identificador único
    username: string;            // nombre de usuario
    email: string;               // correo
    credits: number;             // créditos disponibles para pujas o compra inmediata
    isActive: boolean;           // si la cuenta está activa
    constructor(id: string, username:string, email: string, credits: number, isActive: boolean) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.credits = credits;
        this.isActive = isActive;
    }
}
