const setupSocket = (io) => {
  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log("socket is connected", socket.id);

    socket.on("joinRoom", ({ room, message }) => {
      // Leave previous room
      if (socket.room) {
        socket.leave(socket.room);
        if (rooms.has(socket.room)) {
          rooms.get(socket.room).delete(socket.id);
          updatePlayerList(socket.room);
        }
      }

      // Join new room
      socket.join(room);
      socket.room = room;

      // Ensure room exists
      if (!rooms.has(room)) {
        rooms.set(room, new Map());
      }

      // Add player with default stats
      rooms.get(room).set(socket.id, {
        id: socket.id,
        wpm: 0, // Default values (update them later)
        cpm: 0,
        mistakes: 0,
      });

      io.to(room).emit("message", message);
      updatePlayerList(room);
    });

    socket.on("updateStats", ({ wpm, cpm, mistakes }) => {
      if (socket.room) {
        const roomPlayers = rooms.get(socket.room);
        if (roomPlayers) {
          const player = roomPlayers.get(socket.id);
          if (player) {
            player.wpm = wpm;
            player.cpm = cpm;
            player.mistakes = mistakes;
            io.to(socket.room).emit("playerStats", player);
          }
        }
      }
    });
    socket.on("checkWinner", (room) => {
      if (!rooms.has(room)) {
        io.to(room).emit("message", `no room found`);
        return;
      }

      const playersInRoom = Array.from(rooms.get(room)?.values() || []);

      let winner = null;
      let lowestMistakes = Infinity;

      for (const player of playersInRoom) {
        if (player.mistakes < lowestMistakes) {
          lowestMistakes = player.mistakes;
          winner = player;
        } else if (player.mistakes === lowestMistakes) {
          if (player.wpm > winner.wpm) {
            winner = player;
          } else if (player.wpm === winner.wpm) {
            if (player.cpm > winner.cpm) {
              winner = player;
            }
          }
        }
      }

      if (winner) {
        io.to(room).emit("message", `${winner.id} is the winner of ${room}!`);
      } else {
        io.to(room).emit("message", `It's a tie in ${room}!`);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      if (socket.room) {
        rooms.get(socket.room).delete(socket.id);
        updatePlayerList(socket.room);
      }
    });

    function updatePlayerList(room) {
      const players = Array.from(rooms.get(room).values());
      io.to(room).emit("playerList", players);
    }
  });
};

export { setupSocket };
