# High Rush 🏁

High Rush is a retro-style, 8-bit 2D drag racing game built with Vanilla JavaScript (HTML5 Canvas) and a custom Node.js/Express backend. Players must master launch control, manual shifting, and traffic dodging to climb the global leaderboard.

## 🌟 Features

* **Authentic Arcade Feel:** Custom 8-bit UI, retro pixel fonts, and dynamic camera shake effects.
* **Complex Driving Mechanics:** Features a "Perfect Launch" mini-game, dynamic RPM drops on gear changes, and a manual shifting system where timing is everything.
* **Traffic & Hazards:** Procedurally generated civilian traffic cars that players must dodge at high speeds.
* **Nitrous System:** A boost gauge for late-race comebacks.
* **Full Authentication:** Custom login and registration system with secure session handling.
* **Global Leaderboard:** Persistent database tracking the Top 10 fastest times, top speeds, and perfect shifts across all registered players.

## 🛠️ Tech Stack

**Frontend:**
* HTML (Canvas API)
* CSS (Flexbox, Custom Fonts)
* Vanilla JavaScript (ES6, strictly typed Game Loop)

**Backend:**
* Node.js
* Express.js
* CORS & Cookie-Parser
* Postgres SQL
* Render DashBoard


## 📁 Project Structure

```text
├── public/                 # Frontend Static Files
│   ├── Assets/             # Car sprites and audio files            
│   ├── index.html          # Main game canvas and UI
│   ├──login/
│   ├── login.html          # Frontend API calls for login/register
│   ├── auth.js             #Authentication gateway  loginstyle.css
│   └── loginstyle.css      # Login page styling       
│   ├──scripts/             # Game logic (main.js, graphics.js, config.js)
│   └──style.css              # Game styling
│                
├── routes/                 # Backend API Routes
│   ├── authRoutes.js       # Handles POST /login and /register
│   └── leaderBoardRoutes.js# Handles GET, POST, and PUT /scores
├── server.js               # Express server configuration and routing
├── package.json            # Node dependencies
└── .env                    # Environment variables