import { Request, Response } from "express";

export class UserController {
  static async createUser(req: Request, res: Response) {
    try {
      const { name, email } = req.body;
      // aquí llamamos al caso de uso
      res.status(201).json({ message: "User created", name, email });
    } catch (error) {
      res.status(500).json({ error: "Error creating user" });
    }
  }

  static async getUser(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ id, name: "John Doe" });
  }
}
