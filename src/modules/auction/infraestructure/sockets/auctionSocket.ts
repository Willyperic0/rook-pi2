import { Server } from "socket.io";

export const initAuctionSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("placeBid", (bid) => {
      console.log("Bid received:", bid);
      io.emit("newBid", bid); // broadcast a todos
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
