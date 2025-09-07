// client/RookClient/frontend/src/components/CreateAuctionForm.tsx

// client/components/CreateAuctionForm.tsx
import React, { useState } from "react";
import type { CreateAuctionInput } from "../application/AuctionService";

/**
 * Formulario para crear una subasta.
 * @remarks
 * Componente controlado minimalista: recoge precio inicial, compra rápida y duración.
 * No asigna `itemId` (lo hace el contenedor superior, p. ej. App.tsx).
 *
 * @rubrica
 * - Calidad/Estructura: tipado explícito, estado local acotado, callbacks bien definidos.
 * - Extensibilidad: fácil de añadir validaciones o campos sin romper la API del componente.
 */
interface Props {
  /**
   * Callback para crear la subasta.
   * @param input Datos de creación sin `itemId` (agregado arriba).
   */
  onCreate: (input: Omit<CreateAuctionInput, "itemId">) => void;
}

export const CreateAuctionForm: React.FC<Props> = ({ onCreate }) => {
  // Estado del formulario: mantiene solo los campos básicos requeridos por el backend
  const [form, setForm] = useState<Omit<CreateAuctionInput, "itemId">>({
    startingPrice: 0,
    buyNowPrice: 0,
    durationHours: 24,
  });

  /**
   * Maneja cambios en inputs numéricos.
   * @remarks
   * Convierte el valor a Number para mantener consistencia con el backend.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  /**
   * Envía el formulario sin refrescar la página.
   * @remarks
   * `itemId` se añade en el contenedor (p. ej., a partir del ítem seleccionado).
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(form); // itemId se agrega desde App.tsx
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded mb-4">
      {/* Precio inicial de la subasta */}
      <input
        type="number"
        name="startingPrice"
        placeholder="Precio inicial"
        onChange={handleChange}
        className="border p-1 m-1"
      />

      {/* Precio de compra inmediata (opcional en backend si es 0) */}
      <input
        type="number"
        name="buyNowPrice"
        placeholder="Compra rápida"
        onChange={handleChange}
        className="border p-1 m-1"
      />

      {/* Duración predefinida en horas */}
      <label className="m-1">Duración:</label>
      <select
        name="durationHours"
        value={form.durationHours}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, durationHours: Number(e.target.value) }))
        }
        className="border p-1 m-1"
      >
        <option value={24}>24 horas</option>
        <option value={48}>48 horas</option>
      </select>

      <button
        type="submit"
        className="bg-blue-500 text-white px-2 py-1 rounded"
      >
        Crear Subasta
      </button>
    </form>
  );
};