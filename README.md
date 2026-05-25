# HIGH RUSH 🏁

> _A retro 8-bit drag racing game. Master the launch. Nail every shift. Own the leaderboard._

---

## What is High Rush?

High Rush is a top-down, 2D drag racing game built entirely with Vanilla JavaScript and an HTML5 Canvas. It's not just press-and-hold — you manage RPM, time your gear shifts, dodge traffic, and deploy nitrous at the right moment. Every run is tracked on a global leaderboard against all registered players.

---

## Features

- **Perfect Launch System** — Hold the right RPM at the start for a speed advantage off the line
- **Manual Shifting** — Shift too early or too late and you lose speed; hit the perfect window for a bonus
- **Dynamic RPM Drops** — Each gear change drops RPM differently, forcing you to manage revs constantly
- **Traffic Dodging** — Procedurally generated civilian cars at speed
- **Nitrous Boost** — A gauge that fills during the race for a late push
- **Global Leaderboard** — Top 10 times, top speeds, and perfect shifts tracked per user
- **Full Auth System** — Register, log in, sessions handled securely via cookies

---

## Tech Stack

| Layer    | Tech                                |
| -------- | ----------------------------------- |
| Frontend | HTML5 Canvas, Vanilla JS (ES6), CSS |
| Backend  | Node.js, Express.js                 |
| Database | PostgreSQL                          |
| Auth     | JWT + Cookie-Parser                 |
| Hosting  | Render                              |

---

## Project Structure

```
├── public/
│   ├── Assets/             # Car sprites and audio
│   ├── index.html          # Main game canvas and UI
│   ├── style.css           # Game styling
│   ├── scripts/
│   │   ├── main.js         # Core game loop and mechanics
│   │   ├── graphics.js     # Rendering and draw calls
│   │   └── config.js       # Game constants and settings
│   └── login/
│       ├── login.html      # Login and registration UI
│       ├── auth.js         # Frontend auth logic
│       └── loginstyle.css  # Login page styling
│
├── routes/
│   ├── authRoutes.js       # POST /login, POST /register
│   └── leaderBoardRoutes.js# GET /scores, POST /scores, PUT /scores/:id
│
├── server.js               # Express server setup and middleware
├── package.json
└── .env                    # Environment variables (not committed)
```

---

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL database
- A `.env` file with the following:

```env
JWT_SECRET=your_secret_here
DATABASE_URL=your_postgres_connection_string
```

### Install & Run

```bash
npm install
node server.js
```

Then open `http://127.0.0.1:5500` in your browser (or wherever your frontend is served from).

---

## How to Play

1. **Register or log in**
2. Select a car and start a race
3. Hold the RPM in the green zone at launch for a **Perfect Launch**
4. Shift up manually — timing the green RPM window gives you a **Perfect Shift** bonus
5. Dodge traffic and use nitrous near the finish line
6. Your time is saved automatically — check the leaderboard to see where you rank
