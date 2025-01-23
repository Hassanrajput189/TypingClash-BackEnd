const setupSocket = (io) => {
  const rooms = new Map();
  
  io.on('connection', (socket) => {
    console.log('socket is connected', socket.id);

    socket.on('joinRoom', (room) => {
      // Leave the previous room if any
      if (socket.room) {
        socket.leave(socket.room);
        rooms.get(socket.room).delete(socket.id);
        updatePlayerList(socket.room);
      }

      // Join the new room
      socket.join(room);
      socket.room = room;

      // Add player to the room
      if (!rooms.has(room)) {
        rooms.set(room, new Map());
      }
      rooms.get(room).set(socket.id, { id: socket.id });

      console.log(`${socket.id} joined room ${room}`);
      updatePlayerList(room);
    });


    socket.on('updateStats', ({ wpm, cpm, mistakes }) => {
      if (socket.room) {
        const roomPlayers = rooms.get(socket.room);
        if (roomPlayers) {
          const player = roomPlayers.get(socket.id);
          if (player) {
  
            player.wpm = wpm;
            player.cpm = cpm;
            player.mistakes = mistakes;
            io.to(socket.room).emit('playerStats', player);
          }
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      if (socket.room) {
        rooms.get(socket.room).delete(socket.id);
        updatePlayerList(socket.room);
      }
    });

    function updatePlayerList(room) {
      const players = Array.from(rooms.get(room).values());
      io.to(room).emit('playerList', players);
    }
  });
};

export {setupSocket};