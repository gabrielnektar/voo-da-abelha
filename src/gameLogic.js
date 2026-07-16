import {
  BARRIER_GAP_HEIGHT,
  BARRIER_GAP_MARGIN,
  BARRIER_SPACING,
  BARRIER_WIDTH,
  BEE_RADIUS,
  BEE_X,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CEILING_Y,
  FALL_SPEED,
  GROUND_Y,
  RISE_SPEED,
  SCROLL_SPEED,
} from "./constants.js";

const GAP_TOP_RANDOM_SPAN = CANVAS_HEIGHT - 2 * BARRIER_GAP_MARGIN - BARRIER_GAP_HEIGHT;

export function createInitialState() {
  return {
    beeY: CANVAS_HEIGHT / 2,
    scrollX: 0,
    gameOver: false,
    barriers: [],
  };
}

export function update(state, input, dt, random = Math.random) {
  if (state.gameOver) {
    return state;
  }

  const verticalSpeed = input.holding ? -RISE_SPEED : FALL_SPEED;
  const candidateBeeY = state.beeY + verticalSpeed * dt;
  const scrollX = state.scrollX + SCROLL_SPEED * dt;
  const bounds = clampToBounds(candidateBeeY);
  const barriers = updateBarriers(state.barriers, dt, random);
  const gameOver = bounds.hitBoundary || hitsAnyBarrier(bounds.beeY, barriers);

  return {
    ...state,
    beeY: bounds.beeY,
    scrollX,
    gameOver,
    barriers,
  };
}

function hitsAnyBarrier(beeY, barriers) {
  return barriers.some((barrier) => hitsBarrier(beeY, barrier));
}

function hitsBarrier(beeY, barrier) {
  const overlapsHorizontally =
    BEE_X + BEE_RADIUS >= barrier.x && BEE_X - BEE_RADIUS <= barrier.x + BARRIER_WIDTH;

  if (!overlapsHorizontally) {
    return false;
  }

  const gapBottom = barrierGapBottom(barrier);
  return beeY - BEE_RADIUS <= barrier.gapTop || beeY + BEE_RADIUS >= gapBottom;
}

export function barrierGapBottom(barrier) {
  return barrier.gapTop + BARRIER_GAP_HEIGHT;
}

function updateBarriers(barriers, dt, random) {
  const onScreen = barriers
    .map((barrier) => ({ ...barrier, x: barrier.x - SCROLL_SPEED * dt }))
    .filter((barrier) => barrier.x + BARRIER_WIDTH >= 0);

  const lastBarrier = onScreen[onScreen.length - 1];
  const shouldSpawn = !lastBarrier || lastBarrier.x <= CANVAS_WIDTH - BARRIER_SPACING;

  return shouldSpawn ? [...onScreen, spawnBarrier(random)] : onScreen;
}

function spawnBarrier(random) {
  return {
    x: CANVAS_WIDTH,
    gapTop: BARRIER_GAP_MARGIN + random() * GAP_TOP_RANDOM_SPAN,
  };
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
