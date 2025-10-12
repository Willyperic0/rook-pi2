import { User } from "../../domain/models/User";
import { UserDto } from "../dto/UserDto";

/**
 * Clase encargada de transformar objetos del dominio (`User`)
 * a sus representaciones de transferencia de datos (`UserDto`) y viceversa.
 */
export class UserMapper {
  /**
   * Convierte un objeto del dominio `User` a su representación `UserDto`.
   * @param user Objeto de dominio a convertir.
   * @returns El objeto `UserDto` correspondiente.
   */
  static toDto(user: User): UserDto {
    return {
      id: user.getId(),
      username: user.getUsername(),
      credits: user.getCredits(),
    };
  }

  /**
   * Convierte un objeto `UserDto` en una instancia del dominio `User`.
   * @param dto Objeto DTO a convertir.
   * @returns El objeto `User` correspondiente.
   */
  static toDomain(dto: UserDto): User {
    return new User(
      dto.id,
      dto.username,
      dto.credits,
    );
  }
}