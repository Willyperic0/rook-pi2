// src/modules/auction/infraestructure/api/controllers/UserController.ts

import { Request, Response } from "express";
import { HttpUserRepository } from "../../../../user/domain/repositories/HttpUserRepository";

/**
 * Controlador HTTP para recursos de usuario (lectura).
 * @remarks
 * Accede a información de usuarios vía {@link HttpUserRepository}.
 */
export class UserController {
  constructor(private readonly userRepo: HttpUserRepository) {}

  /**
   * GET /users/:id
   * @description Obtiene un usuario por ID.
   * @status 200 OK | 400 Bad Request | 404 Not Found | 500 Internal Error
   */
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

  /**
   * GET /users/me
   * @description Obtiene el usuario actual a partir del token Bearer.
   * @status 200 OK | 401 Unauthorized | 404 Not Found | 500 Internal Error
   */
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