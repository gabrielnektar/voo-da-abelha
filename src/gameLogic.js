import {
  BEE_RADIUS,
  CANVAS_HEIGHT,
  CEILING_Y,
  FALL_SPEED,
  GROUND_Y,
  RISE_SPEED,
  SCROLL_SPEED,
} from "./constants.js";

export function createInitialState() {
  return {
    beeY: CANVAS_HEIGHT / 2,
    scrollX: 0,
    gameOver: false,
  };
}

export function update(state, input, dt) {
  if (state.gameOver) {
    return state;
  }

  const verticalSpeed = input.holding ? -RISE_SPEED : FALL_SPEED;
  const candidateBeeY = state.beeY + verticalSpeed * dt;
  const scrollX = state.scrollX + SCROLL_SPEED * dt;
  const bounds = clampToBounds(candidateBeeY);

  return { ...state, beeY: bounds.beeY, scrollX, gameOver: bounds.hitBoundary };
}

function clampToBounds(beeY) {
  if (beeY - BEE_RADIUS <= CEILING_Y) {
    return { beeY: CEILING_Y + BEE_RADIUS, hitBoundary: true };
  }

  if (beeY + BEE_RADIUS >= GROUND_Y) {
    return { beeY: GROUND_Y - BEE_RADIUS, hitBoundary: true };
  }

  return { beeY, hitBoundary: false };
}
