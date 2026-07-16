import { BARRIER_WIDTH, BEE_RADIUS, BEE_X, CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants.js";
import { barrierGapBottom } from "./gameLogic.js";

// Must match the <canvas> CSS background in index.html (pre-JS fallback paint).
const SKY_COLOR = "#bfe9ff";
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

export function render(ctx, state, record) {
  ctx.fillStyle = SKY_COLOR;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawClouds(ctx, state.scrollX);
  drawPollen(ctx, state.scrollX, state.elapsedTime);
  drawGround(ctx, state.scrollX);
  state.barriers.forEach((barrier) => drawBarrier(ctx, barrier));
  drawBee(ctx, state.beeY, state.elapsedTime);
  drawScore(ctx, state.score);

  if (state.gameOver) {
    drawGameOverOverlay(ctx, state.score, record);
  }
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

function drawBarrier(ctx, barrier) {
  const gradient = createBarrierGradient(ctx, barrier);
  const gapBottom = barrierGapBottom(barrier);

  // Round only the corners touching the sky/ground; keep the gap-facing
  // corners square so the rim below sits flush instead of clipping them.
  drawBarrierColumn(ctx, barrier.x, 0, barrier.gapTop, gradient, [
    BARRIER_CORNER_RADIUS,
    BARRIER_CORNER_RADIUS,
    0,
    0,
  ]);
  drawBarrierColumn(ctx, barrier.x, gapBottom, CANVAS_HEIGHT - gapBottom, gradient, [
    0,
    0,
    BARRIER_CORNER_RADIUS,
    BARRIER_CORNER_RADIUS,
  ]);

  // Darker rim right at the gap-facing edge of each column, for a bit of depth.
  ctx.fillStyle = BARRIER_RIM_COLOR;
  ctx.fillRect(barrier.x, barrier.gapTop - BARRIER_RIM_HEIGHT, BARRIER_WIDTH, BARRIER_RIM_HEIGHT);
  ctx.fillRect(barrier.x, gapBottom, BARRIER_WIDTH, BARRIER_RIM_HEIGHT);

  const centerX = barrier.x + BARRIER_WIDTH / 2;
  drawFlowerColumn(ctx, centerX, 0, barrier.gapTop, barrier, 0);
  drawFlowerColumn(ctx, centerX, gapBottom, CANVAS_HEIGHT, barrier, 100);
}

function createBarrierGradient(ctx, barrier) {
  const gradient = ctx.createLinearGradient(barrier.x, 0, barrier.x + BARRIER_WIDTH, 0);
  gradient.addColorStop(0, "#2f8f3d");
  gradient.addColorStop(0.5, "#4cbb5c");
  gradient.addColorStop(1, "#2f8f3d");
  return gradient;
}

function drawBarrierColumn(ctx, x, y, height, fillStyle, cornerRadii) {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.roundRect(x, y, BARRIER_WIDTH, height, cornerRadii);
  ctx.fill();
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
const GAME_OVER_CARD_HEIGHT = 240;
const GAME_OVER_CARD_COLOR = "#fff8e7";
const GAME_OVER_CARD_BORDER_COLOR = "#2b2b2b";

function drawGameOverOverlay(ctx, score, record) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const cardX = (CANVAS_WIDTH - GAME_OVER_CARD_WIDTH) / 2;
  const cardY = (CANVAS_HEIGHT - GAME_OVER_CARD_HEIGHT) / 2;

  ctx.fillStyle = GAME_OVER_CARD_COLOR;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, GAME_OVER_CARD_WIDTH, GAME_OVER_CARD_HEIGHT, 20);
  ctx.fill();

  ctx.strokeStyle = GAME_OVER_CARD_BORDER_COLOR;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#2b2b2b";
  ctx.textAlign = "center";

  ctx.font = "bold 30px sans-serif";
  ctx.fillText("Game Over", CANVAS_WIDTH / 2, cardY + 50);

  ctx.font = "bold 20px sans-serif";
  ctx.fillText(`Pontuação: ${Math.floor(score)}`, CANVAS_WIDTH / 2, cardY + 100);
  ctx.fillText(`Recorde: ${Math.floor(record)}`, CANVAS_WIDTH / 2, cardY + 130);

  ctx.font = "16px sans-serif";
  ctx.fillText("Clique ou pressione espaço", CANVAS_WIDTH / 2, cardY + 175);
  ctx.fillText("para reiniciar", CANVAS_WIDTH / 2, cardY + 197);
}
