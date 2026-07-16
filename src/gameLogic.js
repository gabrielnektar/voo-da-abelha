import {
  BARRIER_GAP_HEIGHT,
  BARRIER_GAP_HEIGHT_INITIAL,
  BARRIER_GAP_MARGIN,
  BARRIER_GAP_SHRINK_DURATION,
  BARRIER_SPACING,
  BARRIER_WIDTH,
  BEE_RADIUS,
  BEE_X,
  BONUS_BARRIER_INTERVAL,
  BONUS_GAP_HEIGHT,
  BONUS_GAP_MARGIN,
  BONUS_POLLEN_POINTS,
  BONUS_POLLEN_RADIUS,
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
    barriersSpawned: 0,
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
  const barrierUpdate = updateBarriers(
    state.barriers,
    { scrollSpeed, elapsedTime: state.elapsedTime, dt },
    random,
    state.barriersSpawned,
  );
  const barriersSpawned = state.barriersSpawned + (barrierUpdate.spawnedNewBarrier ? 1 : 0);
  const { barriers, bonusPoints } = collectBonusPollen(bounds.beeY, barrierUpdate.barriers);
  const gameOver = bounds.hitBoundary || hitsAnyBarrier(bounds.beeY, barriers);

  return {
    ...state,
    beeY: bounds.beeY,
    scrollX,
    score: score + bonusPoints,
    elapsedTime,
    gameOver,
    barriers,
    barriersSpawned,
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

  const beeTop = beeY - BEE_RADIUS;
  const beeBottom = beeY + BEE_RADIUS;
  const gapBottom = barrierGapBottom(barrier);
  const bonusHole = barrier.bonusSide ? bonusHoleBounds(barrier) : null;

  return (
    overlapsSolidSegment(
      beeTop,
      beeBottom,
      0,
      barrier.gapTop,
      barrier.bonusSide === "top" ? bonusHole : null,
    ) ||
    overlapsSolidSegment(
      beeTop,
      beeBottom,
      gapBottom,
      CANVAS_HEIGHT,
      barrier.bonusSide === "bottom" ? bonusHole : null,
    )
  );
}

// A solid segment is deadly to touch, except where a bonus hole lets the
// bee pass through — but only if the bee fits fully inside the hole, same
// "must be entirely within the opening" rule as the main gap.
function overlapsSolidSegment(beeTop, beeBottom, segmentTop, segmentBottom, hole) {
  const overlapsSegment = beeBottom >= segmentTop && beeTop <= segmentBottom;
  if (!overlapsSegment) {
    return false;
  }

  const fullyInsideHole = hole && beeTop >= hole.top && beeBottom <= hole.bottom;
  return !fullyInsideHole;
}

export function barrierGapBottom(barrier) {
  return barrier.gapTop + barrier.gapHeight;
}

export function bonusHoleBounds(barrier) {
  return { top: barrier.bonusGapTop, bottom: barrier.bonusGapTop + BONUS_GAP_HEIGHT };
}

function collectBonusPollen(beeY, barriers) {
  let bonusPoints = 0;

  const updatedBarriers = barriers.map((barrier) => {
    if (!barrier.bonusSide || barrier.bonusCollected || !touchesBonusPollen(beeY, barrier)) {
      return barrier;
    }

    bonusPoints += BONUS_POLLEN_POINTS;
    return { ...barrier, bonusCollected: true };
  });

  return { barriers: updatedBarriers, bonusPoints };
}

function touchesBonusPollen(beeY, barrier) {
  const hole = bonusHoleBounds(barrier);
  const pollenX = barrier.x + BARRIER_WIDTH / 2;
  const pollenY = (hole.top + hole.bottom) / 2;
  const dx = BEE_X - pollenX;
  const dy = beeY - pollenY;

  return Math.sqrt(dx * dx + dy * dy) <= BEE_RADIUS + BONUS_POLLEN_RADIUS;
}

function updateBarriers(barriers, frame, random, barriersSpawned) {
  const { scrollSpeed, elapsedTime, dt } = frame;
  const onScreen = barriers
    .map((barrier) => ({ ...barrier, x: barrier.x - scrollSpeed * dt }))
    .filter((barrier) => barrier.x + BARRIER_WIDTH >= 0);

  const lastBarrier = onScreen[onScreen.length - 1];
  const shouldSpawn = !lastBarrier || lastBarrier.x <= CANVAS_WIDTH - BARRIER_SPACING;

  if (!shouldSpawn) {
    return { barriers: onScreen, spawnedNewBarrier: false };
  }

  const hasBonus = (barriersSpawned + 1) % BONUS_BARRIER_INTERVAL === 0;
  const newBarrier = spawnBarrier(random, elapsedTime, hasBonus);
  return { barriers: [...onScreen, newBarrier], spawnedNewBarrier: true };
}

// Barriers spawn with a wider gap early in the run, so the first stretch is
// easier; the gap shrinks to its normal size over BARRIER_GAP_SHRINK_DURATION.
function currentGapHeight(elapsedTime) {
  const shrinkProgress = Math.min(1, elapsedTime / BARRIER_GAP_SHRINK_DURATION);
  // Linear interpolation from the wide initial gap down to the normal gap.
  return BARRIER_GAP_HEIGHT_INITIAL - (BARRIER_GAP_HEIGHT_INITIAL - BARRIER_GAP_HEIGHT) * shrinkProgress;
}

function spawnBarrier(random, elapsedTime, hasBonus) {
  const gapHeight = currentGapHeight(elapsedTime);
  const gapTopRandomSpan = CANVAS_HEIGHT - 2 * BARRIER_GAP_MARGIN - gapHeight;
  const gapTop = BARRIER_GAP_MARGIN + random() * gapTopRandomSpan;

  const barrier = {
    x: CANVAS_WIDTH,
    gapTop,
    gapHeight,
    bonusSide: null,
    bonusGapTop: null,
    bonusCollected: false,
  };

  return hasBonus ? { ...barrier, ...spawnBonusPollen(random, gapTop, gapHeight) } : barrier;
}

// Places a small bonus opening inside whichever solid segment (top or
// bottom column) is chosen at random, always fitting within it: even the
// tightest possible segment (BARRIER_GAP_MARGIN) comfortably fits
// BONUS_GAP_HEIGHT plus margin on both sides.
function spawnBonusPollen(random, gapTop, gapHeight) {
  const gapBottom = gapTop + gapHeight;
  const bonusSide = random() < 0.5 ? "top" : "bottom";
  const segment =
    bonusSide === "top" ? { top: 0, bottom: gapTop } : { top: gapBottom, bottom: CANVAS_HEIGHT };
  const segmentHeight = segment.bottom - segment.top;
  const bonusRange = segmentHeight - BONUS_GAP_HEIGHT - 2 * BONUS_GAP_MARGIN;
  const bonusGapTop = segment.top + BONUS_GAP_MARGIN + random() * bonusRange;

  return { bonusSide, bonusGapTop };
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
