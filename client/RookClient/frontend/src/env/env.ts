// client/RookClient/frontend/src/env/env.ts

/**
 * Configuración de endpoints del frontend.
 * @remarks
 * - Por defecto usa same-origin: '/api' y '/items' (no necesitas cambiar nada al desplegar).
 * - Permite override con VITE_* durante el build si lo deseas.
 * - Para sockets, usa el origin actual del navegador (o VITE_SOCKET_BASE si se define).
 */
const origin =
  typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "";

export const env = {
  api: {
    /** Base REST principal (por defecto same-origin). */
    base: (import.meta.env as any).VITE_API_BASE ?? "/api",
    /** Base REST de items (por defecto same-origin). */
    items: (import.meta.env as any).VITE_ITEMS_BASE ?? "/items",
  },
  socket: {
    /** Host para Socket.IO: usa el dominio actual si no se define VITE_SOCKET_BASE. */
    base: (import.meta.env as any).VITE_SOCKET_BASE ?? origin,
    /** Path de Socket.IO (mantén alineado con Nginx/backend). */
    path: (import.meta.env as any).VITE_SOCKET_PATH ?? "/socket.io",
  },
};
