# Online Tic-Tac-Toe

Realtime multiplayer Tic-Tac-Toe over the internet using Node.js, Express, and Socket.IO.

## Run locally

- Install dependencies: `npm install`
- Start dev server with live reload: `npm run dev`
- Or start normally: `npm start`
- Open `http://localhost:3000` in your browser

## How to play

- Click "Create Room" to generate a room ID and become X
- Share the room ID with a friend; they enter it and click "Join" to play as O
- Take turns placing marks; the app announces win or draw
- Click "Restart" to reset the board in the same room

## API

- `GET /health` returns `{ ok: true }`

## Tech

- Express serves static client and hosts Socket.IO
- Socket.IO handles rooms, turns, and realtime updates
