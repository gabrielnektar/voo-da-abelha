import { CANVAS_HEIGHT, CANVAS_WIDTH, MAX_DT } from "./constants.js";
import { createInitialState, update } from "./gameLogic.js";
import { createInputController } from "./input.js";
import { render } from "./render.js";

const canvas = document.getElementById("game");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext("2d");

const input = createInputController(canvas);

let state = createInitialState();

input.onPress(() => {
  if (state.gameOver) {
    state = createInitialState();
  }
});

let lastTime = performance.now();

function loop(time) {
  const dt = Math.min((time - lastTime) / 1000, MAX_DT);
  lastTime = time;

  state = update(state, { holding: input.isHolding() }, dt);
  render(ctx, state);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
