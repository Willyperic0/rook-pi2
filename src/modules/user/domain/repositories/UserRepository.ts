// src/domain/repositories/IUserRepository.ts
import { User } from "../models/User";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  updateCredits(id: string, credits: number): Promise<User | null>;
  findByToken(token: string): Promise<User | null>;
}
