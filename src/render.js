import { BARRIER_WIDTH, BEE_RADIUS, BEE_X, CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants.js";
import { barrierGapBottom } from "./gameLogic.js";

const SCROLL_MARK_SPACING = 80;

export function render(ctx, state, record) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawScrollMarks(ctx, state.scrollX);
  state.barriers.forEach((barrier) => drawBarrier(ctx, barrier));
  drawBee(ctx, state.beeY);
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
}

function drawBee(ctx, beeY) {
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
