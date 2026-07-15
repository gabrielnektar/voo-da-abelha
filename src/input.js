const HOLD_KEYS = new Set(["Space", "ArrowUp"]);

export function createInputController(canvas) {
  let holding = false;
  let pressListener = () => {};

  function startHolding() {
    if (!holding) {
      pressListener();
    }
    holding = true;
  }

  function stopHolding() {
    holding = false;
  }

  window.addEventListener("keydown", (event) => {
    if (HOLD_KEYS.has(event.code)) {
      event.preventDefault();
      startHolding();
    }
  });

  window.addEventListener("keyup", (event) => {
    if (HOLD_KEYS.has(event.code)) {
      stopHolding();
    }
  });

  canvas.addEventListener("mousedown", startHolding);
  window.addEventListener("mouseup", stopHolding);

  canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    startHolding();
  });
  window.addEventListener("touchend", stopHolding);

  return {
    isHolding: () => holding,
    onPress: (listener) => {
      pressListener = listener;
    },
  };
}
