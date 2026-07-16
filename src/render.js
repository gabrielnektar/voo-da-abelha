import { BARRIER_WIDTH, BEE_RADIUS, BEE_X, CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants.js";
import { barrierGapBottom } from "./gameLogic.js";

const SCROLL_MARK_SPACING = 80;
const FLOWER_PETAL_COLORS = ["#ffb3c6", "#c9a0ff", "#ffb26b", "#a0d8ff", "#ff8fa3"];
const FLOWER_CLUSTER_OFFSET = 26;
const FLOWER_SIDE_OFFSET = 10;

export function render(ctx, state, record) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawScrollMarks(ctx, state.scrollX);
  state.barriers.forEach((barrier) => drawBarrier(ctx, barrier));
  drawBee(ctx, state.beeY, state.elapsedTime);
  drawScore(ctx, state.score);

  if (state.gameOver) {
    drawGameOverOverlay(ctx, state.score, record);
  }
}

function drawScrollMarks(ctx, scrollX) {
  ctx.strokeStyle = "#8fd3ff";
  ctx.lineWidth = 4;

  const offset = scrollX % SCROLL_MARK_SPACING;
  for (let x = CANVAS_WIDTH + offset; x > -SCROLL_MARK_SPACING; x -= SCROLL_MARK_SPACING) {
    const drawX = x - offset;
    ctx.beginPath();
    ctx.moveTo(drawX, 0);
    ctx.lineTo(drawX, CANVAS_HEIGHT);
    ctx.stroke();
  }
}

function drawBarrier(ctx, barrier) {
  ctx.fillStyle = "#3fa34d";
  ctx.fillRect(barrier.x, 0, BARRIER_WIDTH, barrier.gapTop);

  const gapBottom = barrierGapBottom(barrier);
  ctx.fillRect(barrier.x, gapBottom, BARRIER_WIDTH, CANVAS_HEIGHT - gapBottom);

  const centerX = barrier.x + BARRIER_WIDTH / 2;
  drawFlowerCluster(ctx, centerX, barrier.gapTop, -1, barrier, 0);
  drawFlowerCluster(ctx, centerX, gapBottom, 1, barrier, 2);
}

// Two flowers per column tip, colored from a stable per-barrier seed (gapTop
// never changes after spawn) so a barrier doesn't change color as it scrolls.
function drawFlowerCluster(ctx, centerX, edgeY, direction, barrier, colorOffset) {
  drawFlower(ctx, centerX, edgeY, flowerColorFor(barrier, colorOffset));
  drawFlower(
    ctx,
    centerX + FLOWER_SIDE_OFFSET,
    edgeY + direction * FLOWER_CLUSTER_OFFSET,
    flowerColorFor(barrier, colorOffset + 1),
  );
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

function drawScore(ctx, score) {
  ctx.fillStyle = "#2b2b2b";
  ctx.textAlign = "left";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText(String(Math.floor(score)), 16, 36);
}

function drawGameOverOverlay(ctx, score, record) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  ctx.font = "bold 32px sans-serif";
  ctx.fillText("Game Over", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

  ctx.font = "bold 22px sans-serif";
  ctx.fillText(`Pontuação: ${Math.floor(score)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 12);
  ctx.fillText(`Recorde: ${Math.floor(record)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

  ctx.font = "18px sans-serif";
  ctx.fillText(
    "Clique ou pressione espaço para reiniciar",
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2 + 60,
  );
}
