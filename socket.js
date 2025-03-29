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
        mistakes: 0,
      });

      io.to(room).emit("message", message);
      updatePlayerList(room);
    });

    socket.on("startGame",()=>{
      io.to(socket.room).emit("gameStart");
    })
    
    socket.on("updateStats", ({ wpm, mistakes }) => {
      if (socket.room) {
        const roomPlayers = rooms.get(socket.room);
        if (roomPlayers) {
          const player = roomPlayers.get(socket.id);
          if (player) {
            player.wpm = wpm;
            player.mistakes = mistakes;
            io.to(socket.room).emit("playerStats", player);
          }
        }
      }
    });
    
    socket.on("checkWinner", (room) => {
      if (!rooms.has(room) || rooms.get(room).size < 2) {
          io.to(room).emit("message", `No room found or not enough players`);
          return;
      }
  
      const playersInRoom = Array.from(rooms.get(room)?.values() || []);
  
      // Sort players based on mistakes (ascending), WPM (descending)
      const rankedPlayers = playersInRoom.sort((a, b) => {
          if (a.mistakes !== b.mistakes) return a.mistakes - b.mistakes; // Fewer mistakes first
          if (a.wpm !== b.wpm) return b.wpm - a.wpm; // Higher WPM next
      });
  
      // Emit ranked list
      io.to(room).emit("ranking", rankedPlayers.map((player, index) => ({
        rank: index + 1,
        id: player.id,
        wpm: player.wpm,
        mistakes: player.mistakes
    })));
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