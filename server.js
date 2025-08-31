import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static client
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
});

// Game state management
const rooms = new Map(); // roomId -> { board, players, turn, status, winner }

function createEmptyBoard() {
	return Array(9).fill(null);
}

function calculateWinner(board) {
	const lines = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    for (const [a,b,c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (board.every(cell => cell)) return 'draw';
    return null;
}

function getOpponentSymbol(symbol) {
    return symbol === 'X' ? 'O' : 'X';
}

function emitRoomState(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    io.to(roomId).emit('state', {
        board: room.board,
        turn: room.turn,
        status: room.status,
        winner: room.winner,
        players: Object.fromEntries(Object.entries(room.players).map(([sid, p]) => [sid, { symbol: p.symbol, name: p.name }]))
    });
}

io.on('connection', (socket) => {
    socket.on('create', ({ name }) => {
        const roomId = nanoid(6).toUpperCase();
        const board = createEmptyBoard();
        const room = {
            board,
            players: {}, // socketId -> { symbol: 'X'|'O', name }
            turn: 'X',
            status: 'waiting', // waiting|playing|finished
            winner: null
        };
        rooms.set(roomId, room);
        socket.join(roomId);
        room.players[socket.id] = { symbol: 'X', name: name || 'Player 1' };
        socket.emit('roomCreated', { roomId, symbol: 'X' });
        emitRoomState(roomId);
    });

    socket.on('join', ({ roomId, name }) => {
        const room = rooms.get(roomId);
        if (!room) {
            socket.emit('errorMessage', 'Room not found');
            return;
        }
        if (Object.keys(room.players).length >= 2) {
            socket.emit('errorMessage', 'Room is full');
            return;
        }
        socket.join(roomId);
        const existingSymbols = new Set(Object.values(room.players).map(p => p.symbol));
        const symbol = existingSymbols.has('X') ? 'O' : 'X';
        room.players[socket.id] = { symbol, name: name || 'Player 2' };
        room.status = Object.keys(room.players).length === 2 ? 'playing' : 'waiting';
        socket.emit('joined', { roomId, symbol });
        io.to(roomId).emit('system', `${name || 'Player'} joined as ${symbol}`);
        emitRoomState(roomId);
    });

    socket.on('move', ({ roomId, index }) => {
        const room = rooms.get(roomId);
        if (!room || room.status !== 'playing') return;
        const player = room.players[socket.id];
        if (!player) return;
        if (player.symbol !== room.turn) return;
        if (index < 0 || index > 8 || room.board[index]) return;

        room.board[index] = player.symbol;
        const outcome = calculateWinner(room.board);
        if (outcome === 'draw') {
            room.status = 'finished';
            room.winner = 'draw';
        } else if (outcome) {
            room.status = 'finished';
            room.winner = outcome;
        } else {
            room.turn = getOpponentSymbol(room.turn);
        }
        emitRoomState(roomId);
    });

    socket.on('restart', ({ roomId }) => {
        const room = rooms.get(roomId);
        if (!room) return;
        room.board = createEmptyBoard();
        room.turn = 'X';
        room.status = Object.keys(room.players).length === 2 ? 'playing' : 'waiting';
        room.winner = null;
        emitRoomState(roomId);
    });

    socket.on('leave', ({ roomId }) => {
        const room = rooms.get(roomId);
        if (!room) return;
        delete room.players[socket.id];
        socket.leave(roomId);
        if (Object.keys(room.players).length === 0) {
            rooms.delete(roomId);
        } else {
            room.status = 'waiting';
            room.turn = 'X';
            room.board = createEmptyBoard();
            room.winner = null;
            emitRoomState(roomId);
        }
    });

    socket.on('disconnecting', () => {
        const joinedRooms = [...socket.rooms].filter(r => r !== socket.id);
        for (const roomId of joinedRooms) {
            const room = rooms.get(roomId);
            if (!room) continue;
            delete room.players[socket.id];
            if (Object.keys(room.players).length === 0) {
                rooms.delete(roomId);
            } else {
                room.status = 'waiting';
                room.turn = 'X';
                room.board = createEmptyBoard();
                room.winner = null;
                emitRoomState(roomId);
            }
        }
    });
});

app.get('/health', (_req, res) => {
    res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

