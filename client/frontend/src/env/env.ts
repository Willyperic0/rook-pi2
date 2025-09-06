export const env = {
  api: {
    base: import.meta.env["VITE_API_BASE"] || "http://nexusroot.bucaramanga.upb.edu.co/api",
    items: import.meta.env["VITE_ITEMS_BASE"] || "http://nexusroot.bucaramanga.upb.edu.co/items",
  },

  socket: {
    base: import.meta.env["VITE_SOCKET_BASE"] || "http://nexusroot.bucaramanga.upb.edu.co",
  },
};
