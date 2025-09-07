// src/modules/user/application/mappers/UserMapper.ts

// src/application/mappers/UserMapper.ts
import { User } from "../../domain/models/User";
import { UserDto } from "../dto/UserDto";

/**
 * Mapeador entre entidad de dominio {@link User} y DTO {@link UserDto}.
 * @remarks
 * Aísla cambios de forma entre dominio y transporte.
 */
export class UserMapper {
  /**
   * Convierte un {@link User} de dominio a {@link UserDto}.
   * @param user Entidad de dominio
   */
  static toDto(user: User): UserDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      credits: user.credits,
      isActive: user.isActive,
    };
  }

  /**
   * Convierte un {@link UserDto} a {@link User} de dominio.
   * @param dto DTO de usuario
   */
  static toDomain(dto: UserDto): User {
    return new User(
      dto.id,
      dto.username,
      dto.email,
      dto.credits,
      dto.isActive,
    );
  }
}
