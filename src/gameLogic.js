import {
  BARRIER_GAP_HEIGHT,
  BARRIER_GAP_HEIGHT_INITIAL,
  BARRIER_GAP_MARGIN,
  BARRIER_GAP_SHRINK_DURATION,
  BARRIER_REACHABILITY_FACTOR,
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
  const { barriers, bonusPoints } = collectBonusPollen(bounds.beeY, barrierUpdate.barriers, elapsedTime);
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

function collectBonusPollen(beeY, barriers, elapsedTime) {
  let bonusPoints = 0;

  const updatedBarriers = barriers.map((barrier) => {
    if (!barrier.bonusSide || barrier.bonusCollected || !touchesBonusPollen(beeY, barrier)) {
      return barrier;
    }

    bonusPoints += BONUS_POLLEN_POINTS;
    return { ...barrier, bonusCollected: true, bonusCollectedAt: elapsedTime };
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
  const previousExitCenters = lastBarrier ? exitCentersFor(lastBarrier) : [];
  const newBarrier = spawnBarrier(random, frame, hasBonus, previousExitCenters);
  return { barriers: [...onScreen, newBarrier], spawnedNewBarrier: true };
}

// A barrier offers one or two ways through it: always the main gap, plus
// the bonus opening when it has one. Whichever the bee took, the next
// barrier must be reachable from there — see randomReachableGapTop.
function exitCentersFor(barrier) {
  const centers = [barrier.gapTop + barrier.gapHeight / 2];
  if (barrier.bonusSide) {
    const hole = bonusHoleBounds(barrier);
    centers.push((hole.top + hole.bottom) / 2);
  }
  return centers;
}

// Barriers spawn with a wider gap early in the run, so the first stretch is
// easier; the gap shrinks to its normal size over BARRIER_GAP_SHRINK_DURATION.
function currentGapHeight(elapsedTime) {
  const shrinkProgress = Math.min(1, elapsedTime / BARRIER_GAP_SHRINK_DURATION);
  // Linear interpolation from the wide initial gap down to the normal gap.
  return BARRIER_GAP_HEIGHT_INITIAL - (BARRIER_GAP_HEIGHT_INITIAL - BARRIER_GAP_HEIGHT) * shrinkProgress;
}

function spawnBarrier(random, frame, hasBonus, previousExitCenters) {
  const gapHeight = currentGapHeight(frame.elapsedTime);
  const gapTop = randomReachableGapTop(random, gapHeight, frame.scrollSpeed, previousExitCenters);

  const barrier = {
    x: CANVAS_WIDTH,
    gapTop,
    gapHeight,
    bonusSide: null,
    bonusGapTop: null,
    bonusCollected: false,
    bonusCollectedAt: null,
  };

  return hasBonus
    ? { ...barrier, ...spawnBonusPollen(random, gapTop, gapHeight, frame.scrollSpeed) }
    : barrier;
}

// How far (in px) the bee can realistically travel, vertically, in the time
// it takes the current barrier spacing to scroll by at scrollSpeed. Used to
// bound both (a) how far a new gap can be from the previous barrier's
// exit(s), and (b) how far a bonus opening can be from its own barrier's
// main gap — see randomReachableGapTop and spawnBonusPollen.
function maxReachableDistance(scrollSpeed) {
  const timeBetweenBarriers = BARRIER_SPACING / scrollSpeed;
  return RISE_SPEED * timeBetweenBarriers * BARRIER_REACHABILITY_FACTOR;
}

// Picks a random center within [outerMin, outerMax], additionally
// constrained to be within `reach` of every center in `previousCenters`
// (empty means unconstrained — e.g. the very first barrier). Falls back to
// the closest reachable point if the constraints leave no valid range at
// all (only possible in extreme edge cases, e.g. an unbounded scroll speed
// after a very long run).
function randomReachableCenter(random, outerMin, outerMax, previousCenters, reach) {
  if (previousCenters.length === 0) {
    return outerMin + random() * (outerMax - outerMin);
  }

  let min = outerMin;
  let max = outerMax;
  for (const center of previousCenters) {
    min = Math.max(min, center - reach);
    max = Math.min(max, center + reach);
  }

  if (min >= max) {
    // With a single center (e.g. bonus-vs-main-gap), this is just that
    // center clamped into range; with several (e.g. multiple exits from the
    // previous barrier), it's their average — the closest single point to
    // "reachable from all of them" once no point truly is.
    const averageCenter = previousCenters.reduce((sum, c) => sum + c, 0) / previousCenters.length;
    return Math.min(Math.max(averageCenter, outerMin), outerMax);
  }

  return min + random() * (max - min);
}

// Keeps the new gap reachable from every way through the previous barrier
// (its main gap, and its bonus opening too if it has one — see
// exitCentersFor). Without this, two unlucky consecutive barriers (one gap
// near the top, the next near the bottom) — or a bonus opening placed far
// from its own barrier's main gap — could demand more vertical speed than
// RISE_SPEED/FALL_SPEED can ever provide: an impossible pass.
// BARRIER_REACHABILITY_FACTOR keeps some margin below the theoretical max,
// since reaching it exactly would need frame-perfect, non-stop input.
function randomReachableGapTop(random, gapHeight, scrollSpeed, previousExitCenters) {
  const centerMin = BARRIER_GAP_MARGIN + gapHeight / 2;
  const centerMax = CANVAS_HEIGHT - BARRIER_GAP_MARGIN - gapHeight / 2;
  const reach = maxReachableDistance(scrollSpeed);

  const center = randomReachableCenter(random, centerMin, centerMax, previousExitCenters, reach);
  return center - gapHeight / 2;
}

// Places a bonus opening inside whichever solid segment (top or bottom
// column) is taller, so it's as close as possible in size to the main gap.
// The segment is always big enough to fit BONUS_GAP_HEIGHT plus margin (the
// taller segment is always at least half of CANVAS_HEIGHT - gapHeight), and
// the position within it is further kept reachable from the main gap's own
// center, so a bee that detours for the bonus doesn't end up somewhere the
// next barrier can't be reached from.
function spawnBonusPollen(random, gapTop, gapHeight, scrollSpeed) {
  const gapBottom = gapTop + gapHeight;
  const gapCenter = gapTop + gapHeight / 2;
  const topHeight = gapTop;
  const bottomHeight = CANVAS_HEIGHT - gapBottom;
  const bonusSide = topHeight >= bottomHeight ? "top" : "bottom";
  const segment =
    bonusSide === "top" ? { top: 0, bottom: gapTop } : { top: gapBottom, bottom: CANVAS_HEIGHT };

  const centerMin = segment.top + BONUS_GAP_MARGIN + BONUS_GAP_HEIGHT / 2;
  const centerMax = segment.bottom - BONUS_GAP_MARGIN - BONUS_GAP_HEIGHT / 2;
  const reach = maxReachableDistance(scrollSpeed);

  const bonusCenter = randomReachableCenter(random, centerMin, centerMax, [gapCenter], reach);
  const bonusGapTop = bonusCenter - BONUS_GAP_HEIGHT / 2;

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
