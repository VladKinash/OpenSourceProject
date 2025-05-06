import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Game from './Game.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const games = new Map();

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

function broadcastState(roomId) {
  const entry = games.get(roomId);
  if (!entry) return;
  const { game } = entry;

  const top = game.getTopCard();
  const discardTop = top
    ? { ...top, chosenColor: top.chosenColor || null }
    : null;

  game.players.forEach((player, index) => {
    io.to(roomId).emit('gameState', {
      players: game.players.map(p => ({ name: p.name, handCount: p.hand.length })),
      hand: game.players[index].hand,
      discardTop,
      currentPlayerIndex: game.currentPlayerIndex,
      direction: game.direction,
      isOver: game.isOver,
      scores: game.scores || {}
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
    const newIdx = game.players.length;
    game.players.push({ name: playerName, hand: [] });
    for (let i = 0; i < 7; i++) {
      game.players[newIdx].hand.push(game.deck.drawCard());
    }
    socket.join(roomId);
    socketMap[socket.id] = newIdx;
    broadcastState(roomId);
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
    if (playerIdx !== game.currentPlayerIndex) return socket.emit('error', 'Not your turn');
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
    if (playerIdx !== game.currentPlayerIndex) return socket.emit('error', 'Not your turn');
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
server.listen(PORT);
