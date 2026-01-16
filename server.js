const { Server } = require('socket.io');
const http = require('http');
const wordsData = require('./words.json');

const PORT = process.env.PORT || 3001;

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Game state management
const rooms = new Map();
const players = new Map();

// Helper functions
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRandomWord() {
  const domains = wordsData.domains;
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  const randomWordObj = randomDomain.words[Math.floor(Math.random() * randomDomain.words.length)];
  return randomWordObj;
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('createRoom', ({ playerName }) => {
    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      host: socket.id,
      players: [],
      gameState: 'lobby',
      gameMode: null,
      currentRound: 0,
      currentSpeaker: null,
      speakingPhase: false,
      votingPhase: false,
      votes: {},
      eliminated: [],
      words: {},
      roles: {}
    };
    
    rooms.set(roomCode, room);
    players.set(socket.id, { roomCode, playerName, socketId: socket.id });
    
    socket.join(roomCode);
    socket.emit('roomCreated', { roomCode, playerName });
    socket.emit('roomUpdate', room);
  });

  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.gameState !== 'lobby') {
      socket.emit('error', { message: 'Game already started' });
      return;
    }

    if (room.players.length >= 10) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    const player = { id: socket.id, name: playerName };
    room.players.push(player);
    players.set(socket.id, { roomCode, playerName, socketId: socket.id });
    
    socket.join(roomCode);
    socket.emit('joinedRoom', { roomCode, playerName });
    io.to(roomCode).emit('roomUpdate', room);
  });

  socket.on('startGame', ({ roomCode, gameMode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.host !== socket.id) {
      socket.emit('error', { message: 'Only host can start the game' });
      return;
    }

    if (room.players.length < 3) {
      socket.emit('error', { message: 'Need at least 3 players' });
      return;
    }

    room.gameMode = gameMode;
    room.gameState = 'playing';
    room.currentRound = 1;

    // Assign roles
    const shuffled = [...room.players].sort(() => Math.random() - 0.5);
    const specialRoleIndex = Math.floor(Math.random() * shuffled.length);
    
    shuffled.forEach((player, index) => {
      if (gameMode === 'infiltrator') {
        room.roles[player.id] = index === specialRoleIndex ? 'infiltrator' : 'citizen';
      } else {
        room.roles[player.id] = index === specialRoleIndex ? 'spy' : 'agent';
      }
    });

    // Assign words
    const wordObj = getRandomWord();
    shuffled.forEach((player, index) => {
      if (gameMode === 'infiltrator') {
        if (room.roles[player.id] === 'infiltrator') {
          room.words[player.id] = null; // No word for infiltrator
        } else {
          room.words[player.id] = wordObj.word;
        }
      } else {
        if (room.roles[player.id] === 'spy') {
          room.words[player.id] = wordObj.similar[Math.floor(Math.random() * wordObj.similar.length)];
        } else {
          room.words[player.id] = wordObj.word;
        }
      }
    });

    // Start speaking phase
    room.speakingPhase = true;
    room.currentSpeaker = shuffled[0].id;
    room.speakingStartTime = Date.now();

    io.to(roomCode).emit('gameStarted', room);
    io.to(roomCode).emit('roomUpdate', room);
  });

  socket.on('endSpeaking', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.currentSpeaker !== socket.id) return;

    const activePlayers = room.players.filter(p => !room.eliminated.includes(p.id));
    const currentIndex = activePlayers.findIndex(p => p.id === socket.id);
    const nextIndex = (currentIndex + 1) % activePlayers.length;
    const nextPlayer = activePlayers[nextIndex];

    if (nextPlayer && nextPlayer.id === activePlayers[0].id && currentIndex !== 0) {
      // All players have spoken, move to voting
      room.speakingPhase = false;
      room.votingPhase = true;
      room.votes = {};
    } else if (nextPlayer && nextPlayer.id !== socket.id) {
      room.currentSpeaker = nextPlayer.id;
      room.speakingStartTime = Date.now();
    }

    io.to(roomCode).emit('roomUpdate', room);
  });

  socket.on('vote', ({ roomCode, targetPlayerId }) => {
    const room = rooms.get(roomCode);
    if (!room || !room.votingPhase) return;

    room.votes[socket.id] = targetPlayerId;
    io.to(roomCode).emit('roomUpdate', room);

    // Check if all votes are in
    const activePlayers = room.players.filter(p => !room.eliminated.includes(p.id));
    if (Object.keys(room.votes).length === activePlayers.length) {
      // Count votes
      const voteCounts = {};
      Object.values(room.votes).forEach(targetId => {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
      });

      const eliminatedId = Object.keys(voteCounts).reduce((a, b) => 
        voteCounts[a] > voteCounts[b] ? a : b
      );

      room.eliminated.push(eliminatedId);
      room.votingPhase = false;
      room.votes = {};

      // Check win conditions
      const activePlayersAfter = room.players.filter(p => !room.eliminated.includes(p.id));
      const specialRole = room.gameMode === 'infiltrator' ? 'infiltrator' : 'spy';
      const eliminatedPlayer = room.players.find(p => p.id === eliminatedId);
      const wasSpecialRole = room.roles[eliminatedId] === specialRole;

      if (wasSpecialRole) {
        room.gameState = 'finished';
        room.winner = room.gameMode === 'infiltrator' ? 'citizens' : 'agents';
      } else if (activePlayersAfter.length <= 2) {
        room.gameState = 'finished';
        room.winner = specialRole;
      } else {
        // Continue to next round
        room.currentRound++;
        room.speakingPhase = true;
        room.currentSpeaker = activePlayersAfter[0].id;
        room.speakingStartTime = Date.now();
      }

      io.to(roomCode).emit('playerEliminated', { eliminatedId, eliminatedName: eliminatedPlayer.name, wasSpecialRole });
      io.to(roomCode).emit('roomUpdate', room);
    }
  });

  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      const room = rooms.get(player.roomCode);
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.players.length === 0) {
          rooms.delete(player.roomCode);
        } else {
          if (room.host === socket.id) {
            room.host = room.players[0].id;
          }
          io.to(player.roomCode).emit('roomUpdate', room);
        }
      }
      players.delete(socket.id);
    }
    console.log('Player disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
