const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Game = require('./Game');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const games = new Map();
const readyMap = new Map();

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

function broadcastState(roomId) {
  const entry = games.get(roomId);
  if (!entry) return;
  const { game, socketMap } = entry;
  const top = game.getTopCard();
  const discardTop = top ? { ...top, chosenColor: top.chosenColor || null } : null;

  game.players.forEach((p, idx) => {
    io.to(roomId).emit('gameState', {
      players: game.players.map(pp => ({ name: pp.name, handCount: pp.hand.length })),
      hand: game.players[idx].hand,
      discardTop,
      currentPlayerIndex: game.currentPlayerIndex,
      direction: game.direction,
      isOver: game.isOver,
      scores: game.scores
    });
  });
}

io.on('connection', socket => {
  socket.on('createGame', ({ playerNames }) => {
    const roomId = generateUniqueId();
    const game = new Game(playerNames);
    games.set(roomId, { game, socketMap: {} });
    socket.join(roomId);
    games.get(roomId).socketMap[socket.id] = 0;
    socket.emit('created', { roomId });
    broadcastState(roomId);
  });

  socket.on('joinGame', ({ roomId, playerName }) => {
    const entry = games.get(roomId);
    if (!entry) return socket.emit('error', 'Room not found');
    const { game, socketMap } = entry;
    const idx = game.players.length;
    game.players.push({ name: playerName, hand: [] });
    for (let i = 0; i < 7; i++) {
      game.players[idx].hand.push(game.deck.drawCard());
    }
    socket.join(roomId);
    socketMap[socket.id] = idx;
    broadcastState(roomId);
  });

  socket.on('playerReady', ({ roomId }) => {
    if (!readyMap.has(roomId)) readyMap.set(roomId, new Set());
    readyMap.get(roomId).add(socket.id);
    const entry = games.get(roomId);
    if (entry && readyMap.get(roomId).size === entry.game.players.length) {
      io.to(roomId).emit('allReady');
      readyMap.delete(roomId);
    }
  });

  socket.on('startGame', ({ roomId }) => {
    const entry = games.get(roomId);
    if (!entry) return socket.emit('error', 'Room not found');
    try {
      entry.game.startGame();
      broadcastState(roomId);
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  socket.on('playCard', ({ roomId, cardIndex, chosenColor }) => {
    const entry = games.get(roomId);
    if (!entry) return socket.emit('error', 'Room not found');
    const { game, socketMap } = entry;
    const playerIdx = socketMap[socket.id];
    try {
      game.playCard(playerIdx, cardIndex, chosenColor);
      broadcastState(roomId);
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  socket.on('drawCard', ({ roomId }) => {
    const entry = games.get(roomId);
    if (!entry) return socket.emit('error', 'Room not found');
    const { game, socketMap } = entry;
    const playerIdx = socketMap[socket.id];
    try {
      game.drawForCurrentPlayer(1);
      broadcastState(roomId);
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  socket.on('disconnect', () => {
    for (const [roomId, entry] of games.entries()) {
      const { game, socketMap } = entry;
      if (socketMap[socket.id] != null) {
        const idx = socketMap[socket.id];
        delete socketMap[socket.id];
        game.players.splice(idx, 1);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  } else {
    throw err;
  }
});

module.exports = { games };
