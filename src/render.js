import { BEE_RADIUS, BEE_X, CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants.js";

const SCROLL_MARK_SPACING = 80;

export function render(ctx, state) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawScrollMarks(ctx, state.scrollX);
  drawBee(ctx, state.beeY);

  if (state.gameOver) {
    drawGameOverOverlay(ctx);
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

function drawGameOverOverlay(ctx) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  ctx.font = "bold 32px sans-serif";
  ctx.fillText("Game Over", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

  ctx.font = "18px sans-serif";
  ctx.fillText(
    "Clique ou pressione espaço para reiniciar",
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2 + 20,
  );
}
