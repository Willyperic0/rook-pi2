// services/items/src/index.ts

import express from "express";

/**
 * Servicio Items (demo).
 * @remarks
 * API mínima basada en Express que expone:
 * - `GET /items` (con filtro opcional por `userId`)
 * - `GET /items/:id`
 * - `PATCH /items/:id/availability`
 * - `PATCH /items/:id` (actualiza disponibilidad y/o dueño)
 *
 * Este servicio mantiene un catálogo **en memoria** solo para pruebas.
 * No es persistente y se reinicia con el proceso.
 */
const app = express();
app.use(express.json());

/** Tipos de ítems soportados (alineados con el frontend). */
export type ItemType =
  | "Héroes"
  | "Armas"
  | "Armaduras"
  | "Ítems"
  | "Habilidades especiales"
  | "Épicas";

/** Tipos de héroe (opcional según el ítem). */
export type HeroType =
  | "Guerrero Tanque"
  | "Guerrero Armas"
  | "Mago Fuego"
  | "Mago Hielo"
  | "Pícaro Veneno"
  | "Pícaro Machete"
  | "Chamán"
  | "Médico";

/**
 * Modelo de Item manejado por el servicio.
 * @remarks
 * `imagen` se maneja como base64 / data URL (ejemplo simple para demo).
 */
interface Item {
  id: number;
  userId: number;
  name: string;
  description: string;
  type: ItemType;
  heroType?: HeroType;
  isAvailable: boolean;
  imagen: string; // Base64 o data URL
}

/**
 * Imagen base64 de ejemplo (PNG simple).
 * @internal Solo para propósitos de demostración/UI rápida.
 */
const sampleBase64Image =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDA..." // (contenido truncado aquí para brevedad)

/**
 * Catálogo en memoria.
 * @remarks
 * Para producción, reemplazar por persistencia real (DB/servicio externo).
 */
const items: Item[] = [
  {
    id: 101,
    userId: 1,
    name: "Espada Épica",
    description: "Una espada legendaria",
    type: "Armas",
    isAvailable: true,
    imagen: sampleBase64Image,
  },
  {
    id: 102,
    userId: 1,
    name: "Escudo de Hierro",
    description: "Resistente y robusto",
    type: "Armaduras",
    isAvailable: true,
    imagen: sampleBase64Image,
  },
  {
    id: 103,
    userId: 2,
    name: "Mago de Fuego",
    description: "Entrenado en la magia elemental",
    type: "Héroes",
    heroType: "Mago Fuego",
    isAvailable: true,
    imagen: sampleBase64Image,
  },
];

/**
 * GET /items
 * @summary Lista todos los ítems o filtra por `userId`.
 * @query userId number (opcional) — devuelve solo ítems de ese usuario.
 * @returns 200 Item[]
 */
app.get("/items", (req, res) => {
  const userId = Number(req.query["userId"]);

  if (userId) {
    const userItems = items.filter(i => i.userId === userId);
    return res.json(userItems);
    // Nota: si el usuario no tiene ítems, se retorna [].
  }

  return res.json(items);
});

/**
 * GET /items/:id
 * @summary Obtiene un ítem por ID.
 * @param id path number — identificador del ítem
 * @returns 200 Item | 404 { error: "Item not found" }
 */
app.get("/items/:id", (req, res) => {
  const item = items.find(i => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Item not found" });
  return res.json(item);
});

/**
 * PATCH /items/:id/availability
 * @summary Actualiza solo la disponibilidad (`isAvailable`) del ítem.
 * @body { isAvailable: boolean }
 * @returns 200 Item | 404 { error: "Item not found" }
 */
app.patch("/items/:id/availability", (req, res) => {
  const id = Number(req.params.id);
  const { isAvailable } = req.body as { isAvailable?: boolean };

  const item = items.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: "Item not found" });

  item.isAvailable = Boolean(isAvailable);
  return res.json(item);
});

/**
 * PATCH /items/:id
 * @summary Actualiza disponibilidad y/o dueño (`userId`) del ítem.
 * @body { isAvailable?: boolean, userId?: number }
 * @returns 200 Item | 404 { error: "Item not found" }
 */
app.patch("/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const { isAvailable, userId } = req.body as { isAvailable?: boolean; userId?: number };

  const item = items.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: "Item not found" });

  if (typeof isAvailable === "boolean") item.isAvailable = isAvailable;
  if (typeof userId === "number") item.userId = userId;

  return res.json(item);
});

/**
 * Arranque del servidor Items (demo).
 * @remarks
 * Puerto por defecto: 3002.
 */
const PORT = 3002;
app.listen(PORT, () => console.log(`Item server running on port ${PORT}`));