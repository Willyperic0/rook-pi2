// src/application/mappers/UserMapper.ts
import { User } from "../../domain/models/User";
import { UserDto } from "../dto/UserDto";

export class UserMapper {
  static toDto(user: User): UserDto {
    return {
      id: user.getId(),
      username: user.getUsername(),
      credits: user.getCredits(),
    };
  }

  static toDomain(dto: UserDto): User {
    return new User(
      dto.id,
      dto.username,
      dto.credits,
    );
  }
}
