// services/users/Rook---PI2/src/index.ts

import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

/**
 * Servicio Users (demo).
 * @remarks
 * API mínima para autenticación con JWT y gestión de créditos de usuario.
 * Mantiene una “base de datos” en memoria únicamente con fines de prueba.
 *
 * @security
 * - El secreto JWT está hardcodeado para la demo. En producción, usar variables
 *   de entorno (por ejemplo, `process.env.JWT_SECRET`) y almacenamiento seguro.
 * - No loguear tokens ni contraseñas en claro.
 *
 * @typedoc
 * Este archivo está comentado con TSDoc/TypeDoc para generar documentación
 * automática (ver `typedoc.json` y script `npm run docs` en el paquete).
 */

const app = express();
app.use(cors());
app.use(express.json());

/** @internal Secreto JWT de demo (reemplazar por env en producción). */
const JWT_SECRET = "mi_secreto_super_seguro"; // cambiar por algo más seguro en producción

// -----------------------------------------------------------------------------
// “Base de datos” en memoria (solo para pruebas / demo)
// -----------------------------------------------------------------------------

/**
 * Representa a un usuario del sistema (demo).
 */
type DemoUser = {
  id: string;
  username: string;
  password: string;
  credits: number;
  isActive: boolean;
};

/** Conjunto de usuarios simulado (persistencia temporal en memoria). */
let users: DemoUser[] = [
  { id: "1", username: "John Doe",   password: "1234", credits: 1000, isActive: true },
  { id: "2", username: "Jane Smith", password: "abcd", credits: 5,    isActive: true },
  { id: "3", username: "camilin pinguin", password: "1234", credits: 5000, isActive: true },
];

// -----------------------------------------------------------------------------
// Endpoints
// -----------------------------------------------------------------------------

/**
 * POST /login
 * @summary Autentica a un usuario y retorna un JWT (válido por 1h).
 * @body { username: string, password: string }
 * @returns 200 { token: string } | 401 { error: string }
 * @example
 * curl -X POST http://localhost:4000/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"username":"John Doe","password":"1234"}'
 */
app.post("/login", (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: "Usuario o contraseña incorrectos" });

  // Crear JWT con userId
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
  return res.json({ token });
});

/**
 * GET /me
 * @summary Retorna el usuario autenticado a partir de un bearer token.
 * @header Authorization: Bearer <token>
 * @returns 200 DemoUser | 401/404 { error: string }
 * @example
 * curl http://localhost:4000/me -H "Authorization: Bearer <token>"
 */
app.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token no proporcionado" });

  const token = authHeader.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: "Token inválido" });

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === payload.userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json(user);
  } catch (_err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
});

/**
 * PUT /users/:id/credits
 * @summary Actualiza los créditos de un usuario (demo).
 * @param id path user id
 * @body { credits: number }
 * @returns 200 DemoUser | 404 { error: "User not found" }
 * @example
 * curl -X PUT http://localhost:4000/users/1/credits \
 *   -H "Content-Type: application/json" \
 *   -d '{"credits": 1500}'
 */
app.put("/users/:id/credits", (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.credits = Number(req.body.credits);
  return res.json(user);
});

/**
 * GET /users
 * @summary Lista todos los usuarios (demo).
 * @returns 200 DemoUser[]
 */
app.get("/users", (_req, res) => {
  return res.json(users);
});

/**
 * GET /users/:id
 * @summary Obtiene un usuario por id (demo).
 * @param id path user id
 * @returns 200 DemoUser | 404 { error: "User not found" }
 */
app.get("/users/:id", (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
});

/**
 * Arranque del servidor Users (demo).
 * @remarks
 * El puerto por defecto en el compose es 4000.
 */
app.listen(4000, () => console.log("User server running on port 4000"));
