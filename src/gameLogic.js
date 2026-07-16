import {
  BARRIER_GAP_HEIGHT,
  BARRIER_GAP_HEIGHT_INITIAL,
  BARRIER_GAP_MARGIN,
  BARRIER_GAP_SHRINK_DURATION,
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
  SCROLL_SPEED_RAMP,
} from "./constants.js";

export function createInitialState() {
  return {
    beeY: CANVAS_HEIGHT / 2,
    scrollX: 0,
    score: 0,
    elapsedTime: 0,
    gameOver: false,
    barriers: [],
  };
}

export function update(state, input, dt, random = Math.random) {
  if (state.gameOver) {
    return state;
  }

  const scrollSpeed = SCROLL_SPEED + SCROLL_SPEED_RAMP * state.elapsedTime;
  const distanceThisFrame = scrollSpeed * dt;
  const verticalSpeed = input.holding ? -RISE_SPEED : FALL_SPEED;
  const candidateBeeY = state.beeY + verticalSpeed * dt;
  // scrollX and score always move together (same distanceThisFrame), but are
  // kept as separate fields on purpose: scrollX is a rendering-only detail
  // (background tiling offset), while score is the player-facing stat that
  // ticket 05 persists as the recorde. Collapsing them would make rendering
  // reach into a gameplay concept for a purely visual concern.
  const scrollX = state.scrollX + distanceThisFrame;
  const score = state.score + distanceThisFrame;
  const elapsedTime = state.elapsedTime + dt;
  const bounds = clampToBounds(candidateBeeY);
  const barriers = updateBarriers(
    state.barriers,
    { scrollSpeed, elapsedTime: state.elapsedTime, dt },
    random,
  );
  const gameOver = bounds.hitBoundary || hitsAnyBarrier(bounds.beeY, barriers);

  return {
    ...state,
    beeY: bounds.beeY,
    scrollX,
    score,
    elapsedTime,
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
  return barrier.gapTop + barrier.gapHeight;
}

function updateBarriers(barriers, frame, random) {
  const { scrollSpeed, elapsedTime, dt } = frame;
  const onScreen = barriers
    .map((barrier) => ({ ...barrier, x: barrier.x - scrollSpeed * dt }))
    .filter((barrier) => barrier.x + BARRIER_WIDTH >= 0);

  const lastBarrier = onScreen[onScreen.length - 1];
  const shouldSpawn = !lastBarrier || lastBarrier.x <= CANVAS_WIDTH - BARRIER_SPACING;

  return shouldSpawn ? [...onScreen, spawnBarrier(random, elapsedTime)] : onScreen;
}

// Barriers spawn with a wider gap early in the run, so the first stretch is
// easier; the gap shrinks to its normal size over BARRIER_GAP_SHRINK_DURATION.
function currentGapHeight(elapsedTime) {
  const shrinkProgress = Math.min(1, elapsedTime / BARRIER_GAP_SHRINK_DURATION);
  // Linear interpolation from the wide initial gap down to the normal gap.
  return BARRIER_GAP_HEIGHT_INITIAL - (BARRIER_GAP_HEIGHT_INITIAL - BARRIER_GAP_HEIGHT) * shrinkProgress;
}

function spawnBarrier(random, elapsedTime) {
  const gapHeight = currentGapHeight(elapsedTime);
  const gapTopRandomSpan = CANVAS_HEIGHT - 2 * BARRIER_GAP_MARGIN - gapHeight;

  return {
    x: CANVAS_WIDTH,
    gapTop: BARRIER_GAP_MARGIN + random() * gapTopRandomSpan,
    gapHeight,
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
