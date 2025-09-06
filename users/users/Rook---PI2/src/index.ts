import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "mi_secreto_super_seguro"; // cambiar por algo más seguro en producción

// --- Base de datos en memoria ---
let users = [
  { id: "1", username: "John Doe", password: "1234", credits: 1000, isActive: true },
  { id: "2", username: "Jane Smith", password: "abcd", credits: 5, isActive: true },
  { id: "3", username: "camilin pinguin", password: "1234", credits: 5000, isActive: true },
];

// --- Login ---
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: "Usuario o contraseña incorrectos" });

  // Crear JWT con userId
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
  return res.json({ token });
});

// --- Obtener usuario desde token ---
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
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
});

// --- Actualizar créditos ---
app.put("/users/:id/credits", (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.credits = req.body.credits;
  return res.json(user);
});
app.get("/users", (_req, res) => {
  return res.json(users);
});
// GET /users/:id
app.get("/users/:id", (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
});
app.listen(4000, () => console.log("User server running on port 4000"));
