// src/interfaces/http/controllers/UserController.ts
import { Request, Response } from "express";
import { HttpUserRepository } from "../../../../user/domain/repositories/HttpUserRepository";

export class UserController {
  constructor(private readonly userRepo: HttpUserRepository) {}

  // Obtener usuario por id
  getUser = async (req: Request, res: Response) => {
  try {
    const idParam = req.params["id"];
    if (!idParam) return res.status(400).json({ error: "User ID is required" });

    const id = Number(idParam);
    if (isNaN(id)) return res.status(400).json({ error: "User ID must be a number" });

    const user = await this.userRepo.findById(id.toString());
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};


  // Obtener usuario actual (por token)
  getCurrentUser = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "No token provided" });

      const user = await this.userRepo.findByToken(token);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json(user);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}
