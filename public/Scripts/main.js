"use strict";

if (!localStorage.getItem("high_rush_user")) {
  window.location.href = "/login.html";
}

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("btn-start");
const controlsButton = document.getElementById("btn-controls");
const controlsPanel = document.getElementById("controls-panel");

const gotItButton = document.getElementById("btn-got-it");

const retryButton = document.getElementById("btn-retry");
const menuButton = document.getElementById("btn-menu");

const resultIcon = document.getElementById("result-rank-icon");
const resultTitle = document.getElementById("result-title");
const resultPosition = document.getElementById("result-position");
const resultTime = document.getElementById("result-time");
const resultTopSpeed = document.getElementById("result-top-speed");
const resultPerfectShifts = document.getElementById("result-perfect-shifts");
const resultNitrousUsed = document.getElementById("result-nitrous-used");

console.log("Game is loaded");

document.body.addEventListener("click", function () {
  if (
    menuMusic.paused &&
    !document.getElementById("screen-game").classList.contains("active")
  ) {
    menuMusic.play().catch((e) => {});
  }
});

function showScreen(screenName) {
  const screens = document.querySelectorAll(".screen");

  screens.forEach(function (screen) {
    screen.classList.remove("active");
  });

  const selectedScreen = document.getElementById(`screen-${screenName}`);
  selectedScreen.classList.add("active");

  if (screenName === "game") {
    menuMusic.pause();
    raceMusic.play().catch((e) => {});
  } else {
    raceMusic.pause();
    menuMusic.play().catch((e) => {});
  }
}

const backButton = document.getElementById("btn-back");

controlsButton.addEventListener("click", function () {
  showScreen("controls");
});

backButton.addEventListener("click", function () {
  showScreen("menu");
});

startButton.addEventListener("click", function () {
  showScreen("how-to-play");
});

gotItButton.addEventListener("click", function () {
  startGame();
});

retryButton.addEventListener("click", function () {
  startGame();
});

menuButton.addEventListener("click", function () {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  showScreen("menu");
});

const keys = {};
let shiftUpLocked = false;
let shiftDownLocked = false;

window.addEventListener("keydown", function (event) {
  keys[event.code] = true;

  if (event.code === "KeyR" && game) {
    startGame();
  }

  const blockedKeys = [
    "KeyW",
    "KeyS",
    "KeyA",
    "KeyD",
    "KeyE",
    "ShiftLeft",
    "ControlLeft",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
  ];

  if (blockedKeys.includes(event.code)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", function (event) {
  keys[event.code] = false;
});

function roadLeft() {
  return (canvas.width - ROAD_WIDTH) / 2;
}

function roadRight() {
  return roadLeft() + ROAD_WIDTH;
}

function laneCenter(laneIndex) {
  return roadLeft() + LANE_WIDTH * laneIndex + LANE_WIDTH / 2;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isInPerfectRPM(rpm) {
  return rpm >= PERFECT_RPM_MIN && rpm <= PERFECT_RPM_MAX;
}

function formatTime(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(Math.floor(seconds % 60)).padStart(2, "0");
  const millis = String(Math.floor((seconds % 1) * 1000)).padStart(3, "0");

  return `${minutes}:${secs}.${millis}`;
}

function createPlayer() {
  return {
    x: laneCenter(1),
    y: canvas.height - 120,
    width: 60,
    height: 112,

    speed: 0,
    topSpeed: 0,
    acceleration: 0,
    distance: 0,

    gear: 1,
    rpm: RPM_IDLE,

    nitrous: 100,
    nitrousUsed: 0,
    nitrousActive: false,

    perfectShifts: 0,
    lastShiftMessage: "",
    shiftMessageTimer: 0,

    launchChecked: false,
    launchMessage: "",
    launchBoost: 1,

    finished: false,
    finishTime: 0,
    position: 0,

    spriteName: "Viper",
  };
}

function createAI(laneIndex, skill, spriteName) {
  return {
    x: laneCenter(laneIndex),
    y: canvas.height - 230,
    width: 58,
    height: 108,

    speed: 0,
    distance: 0,
    gear: 1,
    rpm: RPM_IDLE,

    skill: skill,
    finished: false,
    finishTime: 0,
    position: 0,

    spriteName: spriteName,
  };
}

// Game state Factory

function createGameState() {
  return {
    phase: "countdown",

    time: 0,
    countdown: 3.5,

    roadOffset: 0,
    cameraShake: 0,

    finishCount: 0,

    player: createPlayer(),

    opponents: [createAI(2, 1.2, "DB9"), createAI(3, 1.25, "F1")],

    traffic: [],
    trafficTimer: 1.6,
  };
}

let game = null;
let animationId = null;
let lastFrameTime = 0;

// Start Game & Game Loop
function startGame() {
  keys.KeyW = false;
  keys.KeyS = false;
  keys.KeyA = false;
  keys.KeyD = false;
  keys.KeyE = false;
  keys.ShiftLeft = false;
  keys.ControlLeft = false;

  shiftUpLocked = false;
  shiftDownLocked = false;

  game = createGameState();

  showScreen("game");

  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }

  lastFrameTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
  if (!game || game.phase === "finished") return;

  const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.05);
  lastFrameTime = currentTime;

  updateGame(deltaTime);

  if (game.phase === "finished") return;

  drawGame();

  animationId = requestAnimationFrame(gameLoop);
}

function updateGame(deltaTime) {
  if (game.phase === "countdown") {
    updateCountdown(deltaTime);
  } else if (game.phase === "race") {
    game.time += deltaTime;

    updateGearInput();
    updatePlayerEngine(deltaTime);
    updateNitrous(deltaTime);
    updatePlayerSteering(deltaTime);
    updateOpponents(deltaTime);
    updateTraffic(deltaTime);
    checkCollisions();

    checkFinish();

    if (game.player.shiftMessageTimer > 0) {
      game.player.shiftMessageTimer -= deltaTime;
    }
  }

  game.roadOffset += game.player.speed * deltaTime * 2;

  if (game.cameraShake > 0) {
    game.cameraShake -= deltaTime;
  }

  if (game.phase === "race" && game.player.speed > 220) {
    game.cameraShake = Math.max(game.cameraShake, 0.08);
  }

  if (game.cameraShake > 0) {
    game.cameraShake -= deltaTime;
  }
}

//player Steering and  Road Boundaries

function updatePlayerSteering(deltaTime) {
  const player = game.player;
  const steeringSpeed = PLAYER_STEER_SPEED;

  if (keys.KeyA || keys.ArrowLeft) {
    player.x -= steeringSpeed * deltaTime;
  }

  if (keys.KeyD || keys.ArrowRight) {
    player.x += steeringSpeed * deltaTime;
  }

  const minX = roadLeft() + player.width / 2 + 6;
  const maxX = roadRight() - player.width / 2 - 6;

  player.x = clamp(player.x, minX, maxX);
}

//Gauge logic (Accelaration & RPM )

function updatePlayerEngine(deltaTime) {
  const player = game.player;

  const accelerating = keys.KeyW || keys.ArrowUp;
  const braking = keys.KeyS || keys.ArrowDown;

  if (accelerating) {
    player.rpm += 3000 * deltaTime;
  } else {
    player.rpm -= 2200 * deltaTime;
  }

  if (braking) {
    player.speed -= 70 * deltaTime;
    player.rpm -= 1600 * deltaTime;
  }

  player.rpm = clamp(player.rpm, RPM_IDLE, RPM_MAX);

  const rpmPower = (player.rpm - RPM_IDLE) / (RPM_MAX - RPM_IDLE);
  const gearRatio = GEAR_RATIOS[player.gear];

  let targetSpeed = 0;

  if (accelerating) {
    targetSpeed = (rpmPower * 82 * player.gear) / gearRatio;
    targetSpeed *= player.launchBoost;
  }

  player.speed += (targetSpeed - player.speed) * 2.4 * deltaTime;

  if (!accelerating && !braking) {
    player.speed -= 22 * deltaTime;
  }

  player.speed = clamp(player.speed, 0, 300);

  player.distance += player.speed * deltaTime;
  player.topSpeed = Math.max(player.topSpeed, player.speed);
}

// ******Manual Shifting Logic ******

// Upshift

function shiftUp() {
  if (!game || game.phase !== "race") return;

  const player = game.player;

  if (player.gear >= MAX_GEAR) return;

  if (isInPerfectRPM(player.rpm)) {
    player.speed += 18;
    player.perfectShifts += 1;
    player.lastShiftMessage = "PERFECT SHIFT";
  } else if (player.rpm < PERFECT_RPM_MIN) {
    player.speed -= 8;
    player.lastShiftMessage = "EARLY SHIFT";
  } else {
    player.speed -= 12;
    player.lastShiftMessage = "LATE SHIFT";
  }

  player.gear += 1;

  // NEW: Dynamic RPM Drop based on the gear you are entering
  const rpmDrops = {
    2: 3200,
    3: 3600, // Was 4200 (Drops much harder now)
    4: 4000, // Was 4800
    5: 4400, // Was 5400
    6: 4800, // Was 5800 - You really have to rev it out now!
  };

  // Apply the specific drop for the current gear
  player.rpm = rpmDrops[player.gear];
  player.shiftMessageTimer = 1.0;

  player.speed = clamp(player.speed, 0, 295);
}

//downshift
function shiftDown() {
  if (!game || game.phase !== "race") return;

  const player = game.player;

  if (player.gear <= 1) return;

  player.gear -= 1;
  player.rpm += 1200;
  player.rpm = clamp(player.rpm, RPM_IDLE, RPM_MAX);

  player.lastShiftMessage = "SHIFT DOWN";
  player.shiftMessageTimer = 0.7;
}

function updateGearInput() {
  if (keys.ArrowUp && !shiftUpLocked) {
    shiftUp();
    shiftUpLocked = true;
  }

  if (!keys.ArrowUp) {
    shiftUpLocked = false;
  }

  if (keys.ArrowDown && !shiftDownLocked) {
    shiftDown();
    shiftDownLocked = true;
  }

  if (!keys.ArrowDown) {
    shiftDownLocked = false;
  }
}

//Countdown & Perfect launch mechanic

function updateCountdown(deltaTime) {
  const player = game.player;
  const accelerating = keys.KeyW || keys.ArrowUp;

  game.countdown -= deltaTime;

  if (accelerating) {
    player.rpm += 3400 * deltaTime;
  } else {
    player.rpm -= 2100 * deltaTime;
  }

  player.rpm = clamp(player.rpm, RPM_IDLE, RPM_MAX);

  if (game.countdown <= 0) {
    game.phase = "race";

    // Inside updateCountdown, replace the launch logic with this:
    if (isInPerfectRPM(player.rpm)) {
      player.launchBoost = 1.18;
      player.speed = 28;
      // NEW: Drop RPM to simulate the clutch grabbing.
      // They must climb from 4500 back to 6200 for the first shift.
      player.rpm = 4500;
      player.launchMessage = "PERFECT LAUNCH";
    } else if (player.rpm < PERFECT_RPM_MIN) {
      player.launchBoost = 0.92;
      player.speed = 12;
      // NEW: Engine bogs down heavily on a slow launch
      player.rpm = 3000;
      player.launchMessage = "SLOW LAUNCH";
    } else {
      player.launchBoost = 0.86;
      player.speed = 8;
      // NEW: Engine chokes on an over-rev (spinning tires)
      player.rpm = 2500;
      player.launchMessage = "OVER REV";
    }
    player.launchChecked = true;
    player.shiftMessageTimer = 1.2;
    player.lastShiftMessage = player.launchMessage;
  }
}

// Oppenent Racing Logic

function updateOpponents(deltaTime) {
  game.opponents.forEach(function (opponent) {
    if (opponent.finished) return;

    opponent.rpm += 3500 * opponent.skill * deltaTime;

    if (opponent.rpm >= REDLINE_RPM && opponent.gear < MAX_GEAR) {
      opponent.gear += 1;
      opponent.rpm = 3600;
      opponent.speed += 15 * opponent.skill;
    }

    opponent.rpm = clamp(opponent.rpm, RPM_IDLE, RPM_MAX);

    const rpmPower = (opponent.rpm - RPM_IDLE) / (RPM_MAX - RPM_IDLE);
    const targetSpeed =
      (rpmPower * 85 * opponent.gear) / GEAR_RATIOS[opponent.gear];

    opponent.speed += (targetSpeed - opponent.speed) * 2.1 * deltaTime;
    opponent.speed = clamp(opponent.speed, 0, 265);

    opponent.distance += opponent.speed * deltaTime;

    if (opponent.distance >= RACE_DISTANCE) {
      markFinished(opponent);
    }
  });
}

function markFinished(car) {
  if (car.finished) return;

  car.finished = true;
  car.finishTime = game.time;
  car.position = game.finishCount + 1;
  game.finishCount += 1;
}

//N20 Mechanic
function updateNitrous(deltaTime) {
  const player = game.player;

  const wantsNitrous = keys.KeyE;

  if (wantsNitrous && player.nitrous > 0 && player.speed > 20) {
    player.nitrousActive = true;

    player.speed += NITROUS_BOOST * deltaTime;
    player.nitrous -= 10 * deltaTime;
    player.nitrousUsed += 10 * deltaTime;

    game.cameraShake = 0.2;
  } else {
    player.nitrousActive = false;
  }

  player.nitrous = clamp(player.nitrous, 0, 100);
  player.nitrousUsed = clamp(player.nitrousUsed, 0, 100);
}

//Traffic
function createTrafficCar() {
  const lane = Math.floor(Math.random() * ROAD_LANES);
  const civilianCars = ["Logan", "Polo", "Sandero", "Corolla", "Jimny", "A4"];
  const randomSprite =
    civilianCars[Math.floor(Math.random() * civilianCars.length)];

  return {
    x: laneCenter(lane),
    y: -100,
    width: 56,
    height: 104,
    speed: 90 + Math.random() * 45,
    spriteName: randomSprite,
  };
}

function updateTraffic(deltaTime) {
  game.trafficTimer -= deltaTime;

  const difficultyBonus = game.player.speed / 180;
  const spawnDelay = clamp(1.7 - difficultyBonus, 0.65, 1.7);

  if (game.trafficTimer <= 0) {
    game.traffic.push(createTrafficCar());
    game.trafficTimer = spawnDelay + Math.random() * 0.6;
  }

  game.traffic.forEach(function (trafficCar) {
    trafficCar.y += (trafficCar.speed + game.player.speed * 0.35) * deltaTime;
  });

  game.traffic = game.traffic.filter(function (trafficCar) {
    return trafficCar.y < canvas.height + 120;
  });
}

//collision:Traffic & opponent

function rectanglesCollide(a, b) {
  // Shrink the collision box to 75% of the visual image size
  // This ignores the transparent pixels and side mirrors
  const shrink = HITBOX_SHRINK;

  const aHitWidth = a.width * shrink;
  const aHitHeight = a.height * shrink;
  const bHitWidth = b.width * shrink;
  const bHitHeight = b.height * shrink;

  return (
    Math.abs(a.x - b.x) < (aHitWidth + bHitWidth) / 2 &&
    Math.abs(a.y - b.y) < (aHitHeight + bHitHeight) / 2
  );
}

function damagePlayer() {
  const player = game.player;

  player.speed *= 0.45;
  player.rpm = Math.max(RPM_IDLE, player.rpm * 0.55);
  game.cameraShake = 0.35;

  player.lastShiftMessage = "CRASH";
  player.shiftMessageTimer = 0.8;
}

function checkCollisions() {
  const player = game.player;

  //Player vs Traffic
  game.traffic.forEach(function (trafficCar) {
    if (rectanglesCollide(player, trafficCar)) {
      damagePlayer();
      trafficCar.y = canvas.height + 200; // Move car off screen after crash
    }
  });

  //Player vs Opponents
  game.opponents.forEach(function (opponent) {
    const opponentScreenCar = {
      ...opponent,
      y: player.y + (player.distance - opponent.distance) * 0.45,
    };

    if (rectanglesCollide(player, opponentScreenCar)) {
      damagePlayer();
      opponent.speed *= 0.8; // Slow opponent slightly to prevent sticking
    }

    //Opponents vs Traffic
    game.traffic.forEach(function (trafficCar) {
      if (rectanglesCollide(opponentScreenCar, trafficCar)) {
        opponent.speed *= 0.45; // AI takes heavy speed penalty
        opponent.rpm = Math.max(RPM_IDLE, opponent.rpm * 0.55);
        trafficCar.y = canvas.height + 200; // Move civilian car off screen
      }
    });
  });
}

// Finish Condtion & Result Screen
function checkFinish() {
  const player = game.player;

  if (player.distance >= RACE_DISTANCE && !player.finished) {
    markFinished(player);
  }

  if (player.finished) {
    finishRace();
  }
}

async function finishRace() {
  if (game.phase === "finished") return;

  game.phase = "finished";

  const player = game.player;

  function getPositionText(position) {
    if (position === 1) return "1st";
    if (position === 2) return "2nd";
    if (position === 3) return "3rd";
    return `${position}th`;
  }

  const positionText = getPositionText(player.position);
  resultPosition.textContent = positionText;
  resultTime.textContent = formatTime(player.finishTime);
  resultTopSpeed.textContent = `${Math.round(player.topSpeed)} km/h`;
  resultPerfectShifts.textContent = player.perfectShifts;
  resultNitrousUsed.textContent = `${Math.round(player.nitrousUsed)}%`;

  if (player.position === 1) {
    resultTitle.textContent = "Race Won";
  } else {
    resultTitle.textContent = "Race Finished";
  }

  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  showScreen("result");

  const username = localStorage.getItem("high_rush_user");

  if (username) {
    const scorePayload = {
      race_time: player.finishTime,
      top_speed: Math.round(player.topSpeed),
      perfect_shifts: player.perfectShifts,
    };

    try {
      const getResponse = await fetch("http://localhost:3000/scores");
      const data = await getResponse.json();
      const allScores = data.scores || [];

      const existingScore = allScores.find(
        (score) => score.username === username,
      );

      if (existingScore) {
        if (player.finishTime < existingScore.race_time) {
          console.log("New Personal Best! Updating...");
          // FIXED: Added the missing slash before the ID
          await fetch(`http://localhost:3000/scores/${existingScore.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(scorePayload),
          });
        }
      } else {
        console.log("First race ! Saving new score...");
        await fetch("http://localhost:3000/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(scorePayload),
        });
      }
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  }
}

// DOM Elements
const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboardModal = document.getElementById("leaderboardModal");
const closeLeaderboard = document.getElementById("closeLeaderboard");
const leaderboardBody = document.getElementById("leaderboardBody");

// UI Toggles
leaderboardBtn.addEventListener("click", () => {
  leaderboardModal.classList.remove("hidden");
  fetchLeaderboard();
});

closeLeaderboard.addEventListener("click", () => {
  leaderboardModal.classList.add("hidden");
});

// Fetch and Render Logic
async function fetchLeaderboard() {
  leaderboardBody.innerHTML = '<tr><td colspan="5">Loading times...</td></tr>';

  try {
    const response = await fetch("http://localhost:3000/scores");
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    const scores = data.scores;

    leaderboardBody.innerHTML = ""; // Clear loading text

    if (scores.length === 0) {
      leaderboardBody.innerHTML =
        '<tr><td colspan="5">No times recorded yet!</td></tr>';
      return;
    }

    scores.forEach((score, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>#${index + 1}</td>
                <td>${score.username}</td>
                <td>${formatTime(score.race_time)}</td>
                <td>${score.top_speed} km/h</td>
                <td>${score.perfect_shifts}</td>
            `;
      leaderboardBody.appendChild(row);
    });
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    leaderboardBody.innerHTML =
      '<tr><td colspan="5">Error loading leaderboard.</td></tr>';
  }
}
