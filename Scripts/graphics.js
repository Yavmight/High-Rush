// game struct
function drawGame() {
  if (!game) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const shakeX = game.cameraShake > 0 ? (Math.random() - 0.5) * 14 : 0;
  const shakeY = game.cameraShake > 0 ? (Math.random() - 0.5) * 14 : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  ctx.fillStyle = '#080a10';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawRoad();
  drawTraffic();
  drawOpponents();
  drawPlayer();

  ctx.restore();

  if (game.phase === 'race' && game.player.nitrousActive) {
    ctx.fillStyle = 'rgba(0, 245, 255, 0.12)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  drawHUD();
  drawCountdown();
}

// Road & lanes
function drawRoad() {
  const left = roadLeft();

  ctx.fillStyle = '#171717';
  ctx.fillRect(left, 0, ROAD_WIDTH, canvas.height);

  ctx.fillStyle = '#0f0f0f';
  ctx.fillRect(left - 70, 0, 70, canvas.height);
  ctx.fillRect(left + ROAD_WIDTH, 0, 70, canvas.height);

  ctx.strokeStyle = '#ff6b00';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(left, 0);
  ctx.lineTo(left, canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(left + ROAD_WIDTH, 0);
  ctx.lineTo(left + ROAD_WIDTH, canvas.height);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([34, 28]);
  ctx.lineDashOffset = -game.roadOffset % 62;

  for (let lane = 1; lane < ROAD_LANES; lane++) {
    const x = left + lane * LANE_WIDTH;

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  ctx.setLineDash([]);

  //finish line 
  const finishY = game.player.y + (game.player.distance - RACE_DISTANCE) * 0.45;
  
  if (finishY > -50 && finishY < canvas.height) {
    ctx.fillStyle = 'white';
    ctx.fillRect(left, finishY, ROAD_WIDTH, 30);
    
    ctx.fillStyle = 'black';
    for (let i = 0; i < ROAD_WIDTH; i += 30) {
      ctx.fillRect(left + i + 15, finishY, 15, 15);
      ctx.fillRect(left + i, finishY + 15, 15, 15);
    }
  }
}

//Player 
function drawPlayer() {
  const player = game.player;

  if (player.nitrousActive) {
    
    ctx.globalAlpha = 0.4;
    drawCar({ ...player, y: player.y + 25 }); // First ghost
    
    ctx.globalAlpha = 0.15;
    drawCar({ ...player, y: player.y + 50 }); // Second ghost
    
    // Reset alpha so the main car draws normally
    ctx.globalAlpha = 1.0;
    
    ctx.fillStyle = 'rgba(216, 73, 1, 0.9)';
    ctx.beginPath();
    ctx.moveTo(player.x - 14, player.y + player.height / 2);
    ctx.lineTo(player.x, player.y + player.height / 2 + 42);
    ctx.lineTo(player.x + 14, player.y + player.height / 2);
    ctx.fill();
  }

  drawCar(player);
}

//Opponents 
function drawOpponents() {
  const playerDistance = game.player.distance;

  game.opponents.forEach(function (opponent) {
    const screenY = game.player.y + (playerDistance - opponent.distance) * 0.45;

    const visibleOpponent = {
      ...opponent,
      y: screenY
    };

    drawCar(visibleOpponent);
  });
}


//traffic cars 
function drawTraffic() {
  game.traffic.forEach(function (trafficCar) {
    drawCar({
      ...trafficCar,
      accent: '#333333'
    });
  });
}

//Player Hud 

    function drawBar(x, y, width, height, percentage, fillColor, backgroundColor) {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, width * percentage, height);

  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.strokeRect(x, y, width, height);
}


function drawHUD() {
  const player = game.player;

  ctx.fillStyle = 'white';
  ctx.font = "18px 'Press Start 2P'";
  ctx.textAlign = 'left';

  ctx.fillText(`Speed: ${Math.round(player.speed)} km/h`, 24, 34);
  ctx.fillText(`Gear: ${player.gear}`, 24, 62);
  ctx.fillText(`RPM: ${Math.round(player.rpm)}`, 24, 90);
  ctx.fillText(`Time: ${formatTime(game.time)}`, 24, 118);

  const rpmPercent = player.rpm / RPM_MAX;

  drawBar(24, 140, 230, 18, rpmPercent, '#ff003c', '#222222');

  const greenStart = PERFECT_RPM_MIN / RPM_MAX;
  const greenEnd = PERFECT_RPM_MAX / RPM_MAX;

  ctx.fillStyle = 'rgba(0, 255, 136, 0.55)';
  ctx.fillRect(
    24 + 230 * greenStart,
    140,
    230 * (greenEnd - greenStart),
    18
  );

  ctx.fillStyle = '#00ff88';
  ctx.font = "12px 'Press Start 2P'";
  ctx.fillText('Perfect RPM Zone', 24, 174);

  const progress = clamp(player.distance / RACE_DISTANCE, 0, 1);
  drawBar(canvas.width / 2 - 160, 24, 320, 16, progress, '#ff6b00', '#222222');

  ctx.fillStyle = 'white';
  ctx.font = "13px  'Press Start 2P' ";
  ctx.textAlign = 'center';
  ctx.fillText(
    `${Math.round(player.distance)} / ${RACE_DISTANCE} m`,
    canvas.width / 2,
    56
  );

  const nitrousPercent = player.nitrous / 100;
  drawBar(24, 190, 230, 16, nitrousPercent, '#bf00ff', '#222222');

  ctx.textAlign = 'left';
  ctx.fillStyle = '#bf00ff';
  ctx.fillText('Nitrous', 24, 224);

  if (player.shiftMessageTimer > 0) {
    ctx.font = "28px 'Press Start 2P'";
    ctx.textAlign = 'center';

    if (
      player.lastShiftMessage === 'PERFECT SHIFT' ||
      player.lastShiftMessage === 'PERFECT LAUNCH'
    ) {
      ctx.fillStyle = '#00ff88';
    } else {
      ctx.fillStyle = '#ffe600';
    }

    ctx.fillText(player.lastShiftMessage, canvas.width / 2, 110);
  }
}

//Countdown Section
function drawCountdown() {
  if (game.phase !== 'countdown') return;

  let text = '';

  if (game.countdown > 3) {
    text = '3';
  } else if (game.countdown > 2) {
    text = '2';
  } else if (game.countdown > 1) {
    text = '1';
  } else {
    text = 'GO!';
  }

  ctx.save();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "bold 90px 'Press Start 2P'";
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00f5ff';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  ctx.restore();
}