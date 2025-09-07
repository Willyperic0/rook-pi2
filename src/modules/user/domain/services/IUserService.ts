import { User } from "../models/User";

export interface IUserService {
  findById(id: string): Promise<User | null>;
  findByToken(token: string): Promise<User | null>;
  updateCredits(id: string, credits: number): Promise<User | null>;
  hasEnoughCredits(user: User, amount: number): boolean;
  deductCredits(user: User, amount: number): void;
  addCredits(user: User, amount: number): void;
  getAllUsers?(): Promise<User[]>; // opcional si quieres listar todos
}
