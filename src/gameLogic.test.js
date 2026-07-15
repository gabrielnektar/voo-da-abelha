import { describe, expect, test } from "vitest";
import { createInitialState, update } from "./gameLogic.js";

describe("update", () => {
  test("a abelha sobe quando o jogador segura o controle", () => {
    const state = createInitialState();

    const next = update(state, { holding: true }, 0.1);

    expect(next.beeY).toBe(300);
    expect(next.gameOver).toBe(false);
  });

  test("a abelha desce quando o jogador não segura o controle", () => {
    const state = createInitialState();

    const next = update(state, { holding: false }, 0.1);

    expect(next.beeY).toBe(340);
    expect(next.gameOver).toBe(false);
  });

  test("a distância percorrida avança automaticamente enquanto a run está ativa", () => {
    const state = createInitialState();

    const next = update(state, { holding: false }, 0.5);

    expect(next.scrollX).toBe(75);
  });

  test("encerra a run quando a abelha toca o teto", () => {
    const state = { beeY: 20, scrollX: 0, gameOver: false };

    const next = update(state, { holding: true }, 0.1);

    expect(next.beeY).toBe(14);
    expect(next.gameOver).toBe(true);
  });

  test("encerra a run quando a abelha toca o chão", () => {
    const state = { beeY: 620, scrollX: 0, gameOver: false };

    const next = update(state, { holding: false }, 0.1);

    expect(next.beeY).toBe(626);
    expect(next.gameOver).toBe(true);
  });

  test("o estado fica congelado depois que a run já terminou", () => {
    const state = { beeY: 300, scrollX: 50, gameOver: true };

    const next = update(state, { holding: true }, 1);

    expect(next.beeY).toBe(300);
    expect(next.scrollX).toBe(50);
    expect(next.gameOver).toBe(true);
  });
});
