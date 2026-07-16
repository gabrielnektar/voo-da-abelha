import { BARRIER_WIDTH, BEE_RADIUS, BEE_X, BONUS_POLLEN_RADIUS, CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants.js";
import { barrierGapBottom, bonusHoleBounds } from "./gameLogic.js";

// Sky color progresses once through a full day as the run goes on — not a
// repeating cycle, it settles into permanent night after DAY_PHASES ends.
// DAY_PHASES[0].skyTop must match the <canvas> CSS background in index.html
// (pre-JS fallback paint, a static approximation of the morning sky).
const DAY_PHASE_DURATION = 12;
const DAY_PHASES = [
  { skyTop: "#bfe9ff", skyBottom: "#eaf7ff" }, // manhã
  { skyTop: "#5fb8f5", skyBottom: "#d5f1ff" }, // meio-dia
  { skyTop: "#7fa8e0", skyBottom: "#ffd9a0" }, // tarde
  { skyTop: "#3d3466", skyBottom: "#ff8c5a" }, // entardecer
  { skyTop: "#05081c", skyBottom: "#10173a" }, // noite
];
const STAR_COUNT = 40;
const STAR_AREA_HEIGHT_RATIO = 0.6;

const CLOUD_COLOR = "#ffffff";
const CLOUD_SPACING = 260;
const CLOUD_PARALLAX_FACTOR = 0.5;
const CLOUD_Y_POSITIONS = [60, 320, 160, 260, 100, 380];
const POLLEN_COLOR = "rgba(255, 224, 102, 0.85)";
const POLLEN_RADIUS = 3;
const POLLEN_SPACING = 50;
const POLLEN_PARALLAX_FACTOR = 0.8;
const POLLEN_APPEAR_CHANCE = 0.55;
const POLLEN_BOB_SPEED = 2;
const POLLEN_BOB_RANGE = 10;
const FLOWER_PETAL_COLORS = ["#ffb3c6", "#c9a0ff", "#ffb26b", "#a0d8ff", "#ff8fa3"];
const FLOWER_SPACING = 38;
const FLOWER_SIDE_OFFSET = 10;
const GROUND_HEIGHT = 22;
const GROUND_DIRT_COLOR = "#8a5a2b";
const GROUND_GRASS_COLOR = "#5aa457";
const GROUND_GRASS_HEIGHT = 8;
const GROUND_TUFT_SPACING = 18;

const TITLE_FONT_FAMILY = "Work Sans";
const TITLE_TEXT = "VÔO DA ABELHA";
const SUBTITLE_TEXT = "THE GAME";
const TITLE_COLOR = "#2b2b2b";
const PLAY_BUTTON_RADIUS = 34;
const PLAY_BUTTON_COLOR = "#ffd23f";
const PLAY_BUTTON_BORDER_COLOR = "#2b2b2b";

export function render(ctx, state, record, gameStarted) {
  drawSky(ctx, state.elapsedTime);
  drawStars(ctx, state.elapsedTime);

  drawClouds(ctx, state.scrollX);
  drawPollen(ctx, state.scrollX, state.elapsedTime);
  drawGround(ctx, state.scrollX);

  if (!gameStarted) {
    drawStartScreen(ctx);
    return;
  }

  state.barriers.forEach((barrier) => drawBarrier(ctx, barrier, state.elapsedTime));
  drawBee(ctx, state.beeY, state.elapsedTime);
  drawScore(ctx, state.score);

  if (state.gameOver) {
    drawGameOverOverlay(ctx, state.score, record);
  }
}

const HAPPY_BEE_RADIUS = 32;

function drawStartScreen(ctx) {
  const centerX = CANVAS_WIDTH / 2;

  drawHappyBee(ctx, centerX, CANVAS_HEIGHT / 2 - 160, HAPPY_BEE_RADIUS);

  ctx.textAlign = "center";
  ctx.fillStyle = TITLE_COLOR;

  ctx.font = `800 44px "${TITLE_FONT_FAMILY}", sans-serif`;
  ctx.letterSpacing = "3px";
  ctx.fillText(TITLE_TEXT, centerX, CANVAS_HEIGHT / 2 - 80);

  ctx.font = `600 18px "${TITLE_FONT_FAMILY}", sans-serif`;
  ctx.letterSpacing = "6px";
  ctx.fillText(SUBTITLE_TEXT, centerX, CANVAS_HEIGHT / 2 - 42);

  ctx.letterSpacing = "0px";

  drawPlayButton(ctx, centerX, CANVAS_HEIGHT / 2 + 50);
}

function drawPlayButton(ctx, x, y) {
  ctx.fillStyle = PLAY_BUTTON_COLOR;
  ctx.beginPath();
  ctx.arc(x, y, PLAY_BUTTON_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = PLAY_BUTTON_BORDER_COLOR;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = PLAY_BUTTON_BORDER_COLOR;
  const triangleSize = PLAY_BUTTON_RADIUS * 0.5;
  ctx.beginPath();
  ctx.moveTo(x - triangleSize * 0.5, y - triangleSize);
  ctx.lineTo(x - triangleSize * 0.5, y + triangleSize);
  ctx.lineTo(x + triangleSize, y);
  ctx.closePath();
  ctx.fill();
}

// A happy bee for the start screen: same body/stripes/wing shape language
// as drawSadBee (game-over card), but perky wings and a cheerful face
// instead of drooping wings and a frown. Also a static portrait, no
// wing-flap animation (the start screen never runs update(), so
// elapsedTime stays frozen at 0 anyway).
function drawHappyBee(ctx, x, y, radius) {
  drawPerkyWings(ctx, x, y, radius);

  ctx.fillStyle = "#ffd23f";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#2b2b2b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - radius * 0.4, y - radius);
  ctx.lineTo(x - radius * 0.4, y + radius);
  ctx.moveTo(x + radius * 0.4, y - radius);
  ctx.lineTo(x + radius * 0.4, y + radius);
  ctx.stroke();

  drawHappyFace(ctx, x, y, radius);
}

function drawPerkyWings(ctx, x, y, radius) {
  const wingWidth = radius * 0.75;
  const wingHeight = radius * 0.45;
  const wingY = y - radius * 0.55;

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  [-1, 1].forEach((side) => {
    ctx.save();
    ctx.translate(x + side * radius * 0.5, wingY);
    ctx.rotate(side * -0.25);
    ctx.beginPath();
    ctx.ellipse(0, 0, wingWidth, wingHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawHappyFace(ctx, x, y, radius) {
  ctx.fillStyle = "#2b2b2b";
  ctx.beginPath();
  ctx.arc(x - radius * 0.3, y - radius * 0.1, radius * 0.08, 0, Math.PI * 2);
  ctx.arc(x + radius * 0.3, y - radius * 0.1, radius * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Smile: the bottom arc of a circle centered above the mouth.
  ctx.strokeStyle = "#2b2b2b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y + radius * 0.15, radius * 0.28, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
}

function drawSky(ctx, elapsedTime) {
  const colors = currentSkyColors(elapsedTime);
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, colors.top);
  gradient.addColorStop(1, colors.bottom);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// Blends between the two DAY_PHASES the run is currently between. Once
// elapsedTime passes the last phase, it just stays there (permanent night)
// rather than looping back to morning.
function currentSkyColors(elapsedTime) {
  const lastPhase = DAY_PHASES.length - 1;
  const phaseProgress = elapsedTime / DAY_PHASE_DURATION;
  const phaseIndex = Math.min(Math.floor(phaseProgress), lastPhase);
  const nextPhaseIndex = Math.min(phaseIndex + 1, lastPhase);
  const t = phaseIndex === lastPhase ? 0 : phaseProgress - phaseIndex;

  const from = DAY_PHASES[phaseIndex];
  const to = DAY_PHASES[nextPhaseIndex];

  return {
    top: lerpColor(from.skyTop, to.skyTop, t),
    bottom: lerpColor(from.skyBottom, to.skyBottom, t),
  };
}

function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const blue = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${blue})`;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.substring(0, 2), 16),
    g: parseInt(value.substring(2, 4), 16),
    b: parseInt(value.substring(4, 6), 16),
  };
}

// Stars fade in during the second-to-last phase (entardecer) and are fully
// visible from the last phase (noite) onward, each twinkling on its own via
// a stable per-star phase offset (pseudoRandom keyed by index).
function drawStars(ctx, elapsedTime) {
  const opacity = starOpacityFor(elapsedTime);
  if (opacity <= 0) {
    return;
  }

  for (let i = 0; i < STAR_COUNT; i++) {
    const x = pseudoRandom(i * 3 + 1) * CANVAS_WIDTH;
    const y = pseudoRandom(i * 3 + 2) * CANVAS_HEIGHT * STAR_AREA_HEIGHT_RATIO;
    const twinklePhase = pseudoRandom(i * 3 + 3) * Math.PI * 2;
    const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(elapsedTime * 2 + twinklePhase));
    const radius = 1 + pseudoRandom(i * 3 + 4) * 1.5;

    ctx.fillStyle = `rgba(255, 255, 255, ${opacity * twinkle})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function starOpacityFor(elapsedTime) {
  const duskPhaseStart = (DAY_PHASES.length - 2) * DAY_PHASE_DURATION;
  const progress = (elapsedTime - duskPhaseStart) / DAY_PHASE_DURATION;
  return Math.max(0, Math.min(1, progress));
}

// A decorative dirt-and-grass strip along the bottom edge — purely visual,
// the actual collision plane stays exactly at CANVAS_HEIGHT (unchanged).
function drawGround(ctx, scrollX) {
  const dirtY = CANVAS_HEIGHT - GROUND_HEIGHT;

  ctx.fillStyle = GROUND_DIRT_COLOR;
  ctx.fillRect(0, dirtY, CANVAS_WIDTH, GROUND_HEIGHT);

  ctx.fillStyle = GROUND_GRASS_COLOR;
  ctx.fillRect(0, dirtY, CANVAS_WIDTH, GROUND_GRASS_HEIGHT);

  const offset = scrollX % GROUND_TUFT_SPACING;
  for (let x = CANVAS_WIDTH + offset; x > -GROUND_TUFT_SPACING; x -= GROUND_TUFT_SPACING) {
    ctx.beginPath();
    ctx.arc(x - offset, dirtY, GROUND_GRASS_HEIGHT * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Clouds drift right-to-left at a fraction of the scroll speed (parallax),
// so they visibly speed up as the difficulty ramp increases scrollSpeed —
// same signal as the barriers, just slower/further away.
function drawClouds(ctx, scrollX) {
  const parallaxX = scrollX * CLOUD_PARALLAX_FACTOR;
  const firstTile = Math.floor((parallaxX - CLOUD_SPACING) / CLOUD_SPACING);
  const lastTile = Math.ceil((parallaxX + CANVAS_WIDTH + CLOUD_SPACING) / CLOUD_SPACING);

  ctx.fillStyle = CLOUD_COLOR;
  for (let tile = firstTile; tile <= lastTile; tile++) {
    const screenX = tile * CLOUD_SPACING - parallaxX;
    const y = CLOUD_Y_POSITIONS[((tile % CLOUD_Y_POSITIONS.length) + CLOUD_Y_POSITIONS.length) % CLOUD_Y_POSITIONS.length];
    drawCloud(ctx, screenX, y);
  }
}

function drawCloud(ctx, x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.arc(x + 18, y - 8, 20, 0, Math.PI * 2);
  ctx.arc(x + 38, y, 16, 0, Math.PI * 2);
  ctx.fill();
}

// Occasional drifting pollen specks: most tile slots are skipped (only
// POLLEN_APPEAR_CHANCE of them draw anything), each visible speck's position
// and bob phase come from a seeded pseudoRandom(tile) so they stay stable —
// not reshuffled every frame — while gently bobbing via elapsedTime.
function drawPollen(ctx, scrollX, elapsedTime) {
  const parallaxX = scrollX * POLLEN_PARALLAX_FACTOR;
  const firstTile = Math.floor((parallaxX - POLLEN_SPACING) / POLLEN_SPACING);
  const lastTile = Math.ceil((parallaxX + CANVAS_WIDTH + POLLEN_SPACING) / POLLEN_SPACING);

  ctx.fillStyle = POLLEN_COLOR;
  for (let tile = firstTile; tile <= lastTile; tile++) {
    if (pseudoRandom(tile) > POLLEN_APPEAR_CHANCE) {
      continue;
    }

    const screenX = tile * POLLEN_SPACING - parallaxX;
    const baseY = pseudoRandom(tile * 7 + 3) * CANVAS_HEIGHT;
    const bobPhase = pseudoRandom(tile * 13 + 1) * Math.PI * 2;
    const y = baseY + Math.sin(elapsedTime * POLLEN_BOB_SPEED + bobPhase) * POLLEN_BOB_RANGE;

    ctx.beginPath();
    ctx.arc(screenX, y, POLLEN_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Cheap deterministic pseudo-random in [0, 1) seeded by an integer, so the
// same tile index always yields the same value across frames.
function pseudoRandom(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const BARRIER_CORNER_RADIUS = 10;
const BARRIER_RIM_HEIGHT = 8;
const BARRIER_RIM_COLOR = "#256e30";

const BONUS_POLLEN_COLOR = "#ffe066";
const BONUS_POLLEN_GLOW_COLOR = "rgba(255, 224, 102, 0.35)";
const BONUS_BURST_DURATION = 0.7;
const BONUS_BURST_PARTICLE_COUNT = 14;
const BONUS_BURST_DISTANCE = 60;

function drawBarrier(ctx, barrier, elapsedTime) {
  const gradient = createBarrierGradient(ctx, barrier);
  const gapBottom = barrierGapBottom(barrier);
  const bonusHole = barrier.bonusSide ? bonusHoleBounds(barrier) : null;

  // Round only the corners touching the sky/ground; keep the gap-facing
  // corners square so the rim below sits flush instead of clipping them.
  drawBarrierColumn(
    ctx,
    barrier.x,
    0,
    barrier.gapTop,
    gradient,
    [BARRIER_CORNER_RADIUS, BARRIER_CORNER_RADIUS, 0, 0],
    barrier.bonusSide === "top" ? bonusHole : null,
  );
  drawBarrierColumn(
    ctx,
    barrier.x,
    gapBottom,
    CANVAS_HEIGHT - gapBottom,
    gradient,
    [0, 0, BARRIER_CORNER_RADIUS, BARRIER_CORNER_RADIUS],
    barrier.bonusSide === "bottom" ? bonusHole : null,
  );

  // Darker rim right at the gap-facing edge of each column, for a bit of depth.
  ctx.fillStyle = BARRIER_RIM_COLOR;
  ctx.fillRect(barrier.x, barrier.gapTop - BARRIER_RIM_HEIGHT, BARRIER_WIDTH, BARRIER_RIM_HEIGHT);
  ctx.fillRect(barrier.x, gapBottom, BARRIER_WIDTH, BARRIER_RIM_HEIGHT);

  const centerX = barrier.x + BARRIER_WIDTH / 2;
  drawFlowerColumn(ctx, centerX, 0, barrier.gapTop, barrier, 0);
  drawFlowerColumn(ctx, centerX, gapBottom, CANVAS_HEIGHT, barrier, 100);

  if (bonusHole) {
    const pollenY = (bonusHole.top + bonusHole.bottom) / 2;

    if (!barrier.bonusCollected) {
      drawBonusPollen(ctx, centerX, pollenY, elapsedTime);
    } else if (barrier.bonusCollectedAt !== null) {
      const timeSinceCollected = elapsedTime - barrier.bonusCollectedAt;
      if (timeSinceCollected < BONUS_BURST_DURATION) {
        drawBonusBurst(ctx, centerX, pollenY, timeSinceCollected / BONUS_BURST_DURATION);
      }
    }
  }
}

function createBarrierGradient(ctx, barrier) {
  const gradient = ctx.createLinearGradient(barrier.x, 0, barrier.x + BARRIER_WIDTH, 0);
  gradient.addColorStop(0, "#2f8f3d");
  gradient.addColorStop(0.5, "#4cbb5c");
  gradient.addColorStop(1, "#2f8f3d");
  return gradient;
}

// Draws the column as one rounded rect, or — when this column holds the
// bonus opening — as two pieces with a gap left uncut between them, so the
// visual hole matches the pure-logic hitbox exactly.
function drawBarrierColumn(ctx, x, y, height, fillStyle, cornerRadii, hole) {
  ctx.fillStyle = fillStyle;

  if (!hole) {
    ctx.beginPath();
    ctx.roundRect(x, y, BARRIER_WIDTH, height, cornerRadii);
    ctx.fill();
    return;
  }

  const [topLeft, topRight, bottomRight, bottomLeft] = cornerRadii;
  ctx.beginPath();
  ctx.roundRect(x, y, BARRIER_WIDTH, hole.top - y, [topLeft, topRight, 0, 0]);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x, hole.bottom, BARRIER_WIDTH, y + height - hole.bottom, [
    0,
    0,
    bottomRight,
    bottomLeft,
  ]);
  ctx.fill();
}

// A soft pulsing glow behind a solid pollen dot, marking the bonus pickup.
function drawBonusPollen(ctx, x, y, elapsedTime) {
  const glowRadius = BONUS_POLLEN_RADIUS * (1.8 + 0.4 * Math.sin(elapsedTime * 4));

  ctx.fillStyle = BONUS_POLLEN_GLOW_COLOR;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = BONUS_POLLEN_COLOR;
  ctx.beginPath();
  ctx.arc(x, y, BONUS_POLLEN_RADIUS, 0, Math.PI * 2);
  ctx.fill();
}

// A little burst of pollen specks flying outward and fading out, played
// once right after the bonus pollen is collected (progress goes 0 → 1).
function drawBonusBurst(ctx, x, y, progress) {
  const distance = BONUS_BURST_DISTANCE * progress;
  const particleRadius = BONUS_POLLEN_RADIUS * 0.6 * (1 - progress);
  const alpha = 1 - progress;

  ctx.fillStyle = `rgba(255, 224, 102, ${alpha})`;
  for (let i = 0; i < BONUS_BURST_PARTICLE_COUNT; i++) {
    const angle = (i / BONUS_BURST_PARTICLE_COUNT) * Math.PI * 2;
    const particleX = x + Math.cos(angle) * distance;
    const particleY = y + Math.sin(angle) * distance;
    ctx.beginPath();
    ctx.arc(particleX, particleY, particleRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Flowers spaced along the column's whole extent (not just the gap edge),
// alternating a small side offset for a vine-like look. Colors come from a
// stable per-barrier seed (gapTop never changes after spawn) plus position,
// so neither the color nor the layout changes as the barrier scrolls.
function drawFlowerColumn(ctx, centerX, top, bottom, barrier, colorOffsetBase) {
  const count = Math.max(1, Math.floor((bottom - top) / FLOWER_SPACING));

  for (let i = 0; i < count; i++) {
    const y = top + FLOWER_SPACING * (i + 0.5);
    const sideOffset = i % 2 === 0 ? -FLOWER_SIDE_OFFSET : FLOWER_SIDE_OFFSET;
    drawFlower(ctx, centerX + sideOffset, y, flowerColorFor(barrier, colorOffsetBase + i));
  }
}

function flowerColorFor(barrier, offset) {
  const index = (Math.floor(barrier.gapTop) + offset) % FLOWER_PETAL_COLORS.length;
  return FLOWER_PETAL_COLORS[index];
}

function drawFlower(ctx, x, y, petalColor) {
  const petalRadius = 6;
  const petalDistance = 7;
  const petalCount = 5;

  ctx.fillStyle = petalColor;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const petalX = x + Math.cos(angle) * petalDistance;
    const petalY = y + Math.sin(angle) * petalDistance;
    ctx.beginPath();
    ctx.arc(petalX, petalY, petalRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#ffe066";
  ctx.beginPath();
  ctx.arc(x, y, petalRadius * 0.8, 0, Math.PI * 2);
  ctx.fill();
}

const WING_FLAP_SPEED = 14;
const WING_COLOR = "rgba(255, 255, 255, 0.8)";
const BEE_EMOJI_INTERVAL = 5;
const BEE_EMOJI_DURATION = 1.4;
const BEE_EMOJI_RISE = 40;
const BEE_EMOJIS = ["✨", "🍯", "🌸", "💛", "⭐", "🎵"];

function drawBee(ctx, beeY, elapsedTime) {
  drawWings(ctx, beeY, elapsedTime);

  ctx.fillStyle = "#ffd23f";
  ctx.beginPath();
  ctx.arc(BEE_X, beeY, BEE_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#2b2b2b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(BEE_X - BEE_RADIUS * 0.4, beeY - BEE_RADIUS);
  ctx.lineTo(BEE_X - BEE_RADIUS * 0.4, beeY + BEE_RADIUS);
  ctx.moveTo(BEE_X + BEE_RADIUS * 0.4, beeY - BEE_RADIUS);
  ctx.lineTo(BEE_X + BEE_RADIUS * 0.4, beeY + BEE_RADIUS);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.beginPath();
  ctx.ellipse(
    BEE_X - BEE_RADIUS * 0.35,
    beeY - BEE_RADIUS * 0.35,
    BEE_RADIUS * 0.35,
    BEE_RADIUS * 0.22,
    -0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  drawBeeEmoji(ctx, beeY, elapsedTime);
}

// Just a bit of fun, doesn't affect gameplay: every BEE_EMOJI_INTERVAL
// seconds of elapsedTime, a random emoji floats up from the bee and fades
// out over BEE_EMOJI_DURATION. Fully deterministic (pseudoRandom keyed by
// which interval we're in), so it's stable across frames rather than
// re-rolling randomly every render call.
function drawBeeEmoji(ctx, beeY, elapsedTime) {
  const cycleIndex = Math.floor(elapsedTime / BEE_EMOJI_INTERVAL);
  const timeInCycle = elapsedTime - cycleIndex * BEE_EMOJI_INTERVAL;

  if (timeInCycle >= BEE_EMOJI_DURATION) {
    return;
  }

  const progress = timeInCycle / BEE_EMOJI_DURATION;
  const emoji = BEE_EMOJIS[Math.floor(pseudoRandom(cycleIndex) * BEE_EMOJIS.length)];
  const sideJitter = (pseudoRandom(cycleIndex * 7 + 3) - 0.5) * 16;

  ctx.save();
  ctx.globalAlpha = 1 - progress;
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(emoji, BEE_X + sideJitter, beeY - BEE_RADIUS - 10 - progress * BEE_EMOJI_RISE);
  ctx.restore();
}

// Wings flap via a sine wave driven by elapsedTime, which freezes when the
// run ends (gameOver), so the wings naturally stop flapping on death too.
function drawWings(ctx, beeY, elapsedTime) {
  const flap = Math.sin(elapsedTime * WING_FLAP_SPEED);
  const wingLift = flap * BEE_RADIUS * 0.5;
  const wingY = beeY - BEE_RADIUS * 0.6 - wingLift;
  const wingWidth = BEE_RADIUS * 0.9;
  const wingHeight = BEE_RADIUS * 0.55;

  ctx.fillStyle = WING_COLOR;
  ctx.beginPath();
  ctx.ellipse(BEE_X - BEE_RADIUS * 0.3, wingY, wingWidth, wingHeight, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(BEE_X + BEE_RADIUS * 0.3, wingY, wingWidth, wingHeight, 0, 0, Math.PI * 2);
  ctx.fill();
}

const SCORE_PILL_PADDING_X = 14;
const SCORE_PILL_HEIGHT = 34;
const SCORE_PILL_X = 12;
const SCORE_PILL_Y = 12;

function drawScore(ctx, score) {
  const text = String(Math.floor(score));

  ctx.font = "bold 22px sans-serif";
  const pillWidth = ctx.measureText(text).width + SCORE_PILL_PADDING_X * 2;

  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.beginPath();
  ctx.roundRect(SCORE_PILL_X, SCORE_PILL_Y, pillWidth, SCORE_PILL_HEIGHT, SCORE_PILL_HEIGHT / 2);
  ctx.fill();

  ctx.fillStyle = "#2b2b2b";
  ctx.textAlign = "left";
  ctx.fillText(text, SCORE_PILL_X + SCORE_PILL_PADDING_X, SCORE_PILL_Y + 24);
}

const GAME_OVER_CARD_WIDTH = 300;
const GAME_OVER_CARD_HEIGHT = 260;
const GAME_OVER_CARD_COLOR = "#fff8e7";
const GAME_OVER_CARD_BORDER_COLOR = "#2b2b2b";
const SAD_BEE_RADIUS = 22;

function drawGameOverOverlay(ctx, score, record) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const cardX = (CANVAS_WIDTH - GAME_OVER_CARD_WIDTH) / 2;
  const cardY = (CANVAS_HEIGHT - GAME_OVER_CARD_HEIGHT) / 2;
  const centerX = CANVAS_WIDTH / 2;

  ctx.fillStyle = GAME_OVER_CARD_COLOR;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, GAME_OVER_CARD_WIDTH, GAME_OVER_CARD_HEIGHT, 20);
  ctx.fill();

  ctx.strokeStyle = GAME_OVER_CARD_BORDER_COLOR;
  ctx.lineWidth = 3;
  ctx.stroke();

  drawSadBee(ctx, centerX, cardY + 50, SAD_BEE_RADIUS);

  ctx.fillStyle = "#2b2b2b";
  ctx.textAlign = "center";

  ctx.font = "bold 30px sans-serif";
  ctx.fillText("Game Over", centerX, cardY + 92);

  ctx.font = "bold 20px sans-serif";
  ctx.fillText(`Pontuação: ${Math.floor(score)}`, centerX, cardY + 128);
  ctx.fillText(`Recorde: ${Math.floor(record)}`, centerX, cardY + 152);

  ctx.font = "16px sans-serif";
  ctx.fillText("Clique ou pressione espaço", centerX, cardY + 195);
  ctx.fillText("para reiniciar", centerX, cardY + 217);
}

// A sad bee for the game-over card: same body/stripes as the flying bee,
// but with drooping wings and a frowning face instead of the wing-flap
// animation, since this is a static portrait, not an in-run sprite.
function drawSadBee(ctx, x, y, radius) {
  drawDroopyWings(ctx, x, y, radius);

  ctx.fillStyle = "#ffd23f";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#2b2b2b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - radius * 0.4, y - radius);
  ctx.lineTo(x - radius * 0.4, y + radius);
  ctx.moveTo(x + radius * 0.4, y - radius);
  ctx.lineTo(x + radius * 0.4, y + radius);
  ctx.stroke();

  drawSadFace(ctx, x, y, radius);
}

function drawDroopyWings(ctx, x, y, radius) {
  const wingWidth = radius * 0.75;
  const wingHeight = radius * 0.45;
  const wingY = y - radius * 0.1;

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  [-1, 1].forEach((side) => {
    ctx.save();
    ctx.translate(x + side * radius * 0.55, wingY);
    ctx.rotate(side * 0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, wingWidth, wingHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawSadFace(ctx, x, y, radius) {
  ctx.strokeStyle = "#2b2b2b";
  ctx.lineWidth = 2;

  // Eyebrows angled down toward the center for a worried look.
  ctx.beginPath();
  ctx.moveTo(x - radius * 0.55, y - radius * 0.15);
  ctx.lineTo(x - radius * 0.2, y - radius * 0.32);
  ctx.moveTo(x + radius * 0.55, y - radius * 0.15);
  ctx.lineTo(x + radius * 0.2, y - radius * 0.32);
  ctx.stroke();

  ctx.fillStyle = "#2b2b2b";
  ctx.beginPath();
  ctx.arc(x - radius * 0.3, y - radius * 0.02, radius * 0.07, 0, Math.PI * 2);
  ctx.arc(x + radius * 0.3, y - radius * 0.02, radius * 0.07, 0, Math.PI * 2);
  ctx.fill();

  // Frown: the top arc of a circle centered below the mouth.
  ctx.beginPath();
  ctx.arc(x, y + radius * 0.58, radius * 0.22, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  ctx.fillStyle = "#7ec8f2";
  ctx.beginPath();
  ctx.moveTo(x - radius * 0.32, y + radius * 0.05);
  ctx.quadraticCurveTo(x - radius * 0.48, y + radius * 0.35, x - radius * 0.32, y + radius * 0.5);
  ctx.quadraticCurveTo(x - radius * 0.16, y + radius * 0.35, x - radius * 0.32, y + radius * 0.05);
  ctx.fill();
}
