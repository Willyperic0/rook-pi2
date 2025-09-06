export interface UserDto {
  id: string;                  // identificador único
  username: string;            // nombre de usuario
  email: string;               // correo
  credits: number;             // créditos disponibles para pujas o compra inmediata             // fecha de registro
  isActive: boolean;           // si la cuenta está activa
}
