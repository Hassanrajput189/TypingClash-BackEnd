import { getCorrectWrong, calWPM, calPercentage } from "./utils/features.js";
const setupSocket = (io) => {
  const rooms = new Map();

  const getRoomList = () => {
    const roomList = Array.from(rooms.entries()).map(([name, players]) => ({
      name: name,
      count: players.size,
    }));
    return roomList;
    a;
  };
  const updatePlayerList = (room) => {
    if (!rooms.has(room)) return;
    const players = Array.from(rooms.get(room).values());
    io.to(room).emit("playerList", players);
  };

  io.on("connection", async (socket) => {
    // Send room list ONLY to requesting client
    socket.on("getRooms", () => {
      const roomList = getRoomList();
      socket.emit("roomList", roomList);
    });

    socket.on("joinRoom", ({ room, message, userName }) => {
      const previousRoom = socket.room;
      if (
        previousRoom === room &&
        rooms.has(room) &&
        rooms.get(room).has(socket.id)
      ) {
        io.to(socket.id).emit("message", "You are already in this room.");
        return;
      }
      // Leave previous room
      if (previousRoom) {
        socket.leave(previousRoom);
        if (rooms.has(previousRoom)) {
          const previousRoomPlayers = rooms.get(previousRoom);
          previousRoomPlayers.delete(socket.id);

          if (previousRoomPlayers.size === 0) {
            rooms.delete(previousRoom);
          } else {
            updatePlayerList(previousRoom);
          }
        }
      }

      // Prevent joining full room
      if (rooms.get(room)?.size >= 4) {
        io.to(socket.id).emit("message", "Room is full");
        return;
      } else {
        socket.join(room);
        socket.room = room;
      }

      // Ensure room exists
      if (!rooms.has(room)) {
        rooms.set(room, new Map());
      }

      // Add player with default stats if room size is less than 4
      if (rooms.get(room).size < 4) {
        rooms.get(room).set(socket.id, {
          id: socket.id,
          wpm: 0,
          mistakes: 0,
          percentage: 0,
          userName: userName || "Anonymous",
        });
      }

      io.to(room).emit("message", message);
      updatePlayerList(room);

      // Emit updated room list to ALL clients
      const roomList = getRoomList();
      io.emit("roomList", roomList);
    });

    socket.on("leaveRoom", (room) => {
      if (!socket.room || !rooms.has(socket.room)) {
        io.to(socket.id).emit("message", "You are not in a room.");
        return;
      }
      const roomPlayers = rooms.get(socket.room);
      const player = roomPlayers.get(socket.id);
      if (room && rooms.has(room)) {
        roomPlayers.delete(socket.id);

        if (roomPlayers.size === 0) {
          rooms.delete(room);
        } else {
          updatePlayerList(room);
        }
      }
      io.to(room).emit("message", `${player.userName} left`);
      socket.leave(room);
      socket.room = null;

      // Emit updated room list to ALL clients
      const roomList = getRoomList();
      io.emit("roomList", roomList);
    });
    socket.on("startGame", () => {
      if (socket.room) {
        io.to(socket.room).emit("gameStart");
        io.to(socket.room).emit("message", "Game started!");
      }
    });

    socket.on("calStats", (correctWrong) => {
      const { correctCharCount, mistakes } = getCorrectWrong(correctWrong);
      const wpm = calWPM(correctCharCount);
      const percentage = calPercentage(correctCharCount, correctWrong.length);

     
      // Check if this is a multiplayer (room) scenario
      if (socket.room && rooms.has(socket.room)) {
        const roomPlayers = rooms.get(socket.room);
        const player = roomPlayers.get(socket.id);
        if (player) {
          player.wpm = wpm;
          player.mistakes = mistakes;
          player.percentage = percentage;
          io.to(socket.room).emit("playerStats", player); // multiplayer broadcast
        }
      } else {
        // Single-player mode – send stats only to the current client
        socket.emit("playerStats", {
          id:socket.id,
          wpm,
          mistakes: mistakes,
          percentage,
        });
      }
    });

    socket.on("disconnect", () => {
      const room = socket.room;

      if (room && rooms.has(room)) {
        const roomPlayers = rooms.get(room);
        roomPlayers.delete(socket.id);

        if (roomPlayers.size === 0) {
          rooms.delete(room);
        } else {
          updatePlayerList(room);
        }
      }
      // Always emit the latest room list after a disconnect
      const roomList = getRoomList();
      io.emit("roomList", roomList);
    });
  });
};

export { setupSocket };
