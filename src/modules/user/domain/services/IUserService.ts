// src/domain/services/IUserService.ts
import { User } from "../models/User";

export interface IUserService {
  findByToken(token: string): Promise<User>;
  updateCredits(id: string, credits: number): Promise<User>;
  hasEnoughCredits(user: User, amount: number): boolean;
  deductCredits(user: User, amount: number): void;
  addCredits(user: User, amount: number): void;
}
