// src/interfaces/http/routes/UserRoutes.ts
import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();

export default function userRoutes(userController: UserController) {
  router.get("/:id", userController.getUser);
  router.get("/me", userController.getCurrentUser);
  return router;
}
