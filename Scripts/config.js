
// Car Sprites 
const carSprites = {};
const spriteNames = [
  '370z', '500x', 'A4', 'Beetle', 'Corolla', 'DB9', 'F1', 'FType',
  'Giulietta', 'Jimny', 'Logan', 'Polo', 'Sandero', 'Tipo', 'Viper'
];

spriteNames.forEach(function(name) {
  const img = new Image();
  img.src = `Assets/${name}.png`; 
  carSprites[name] = img;
}); 


// Music  setup 
const menuMusic = new Audio('Assets/menu-music.mp3');
menuMusic.loop = true;
menuMusic.volume = 0.4;

const raceMusic = new Audio('Assets/race-music.mp3');
raceMusic.loop = true;
raceMusic.volume = 0.4;


// Game Constants 
const ROAD_WIDTH = 500;
const ROAD_LANES = 4;
const LANE_WIDTH = ROAD_WIDTH / ROAD_LANES;

const RACE_DISTANCE = 3000;

const RPM_IDLE = 900;
const RPM_MAX = 8000;
const PERFECT_RPM_MIN = 6200;
const PERFECT_RPM_MAX = 7000;
const REDLINE_RPM = 7600;

const MAX_GEAR = 6;

const GEAR_RATIOS = {
  1: 4.2,   
  2: 3.1,   
  3: 2.4,   
  4: 1.9,
  5: 1.5,
  6: 1.2   
};
