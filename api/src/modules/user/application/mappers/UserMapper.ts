// src/application/mappers/UserMapper.ts
import { User } from "../../domain/models/User";
import { UserDto } from "../dto/UserDto";

export class UserMapper {
  static toDto(user: User): UserDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      credits: user.credits,
      isActive: user.isActive,
    };
  }

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
