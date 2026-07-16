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
    const state = {
      beeY: 20,
      scrollX: 0,
      score: 0,
      elapsedTime: 0,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [],
    };

    const next = update(state, { holding: true }, 0.1);

    expect(next.beeY).toBe(14);
    expect(next.gameOver).toBe(true);
  });

  test("encerra a run quando a abelha toca o chão", () => {
    const state = {
      beeY: 620,
      scrollX: 0,
      score: 0,
      elapsedTime: 0,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [],
    };

    const next = update(state, { holding: false }, 0.1);

    expect(next.beeY).toBe(626);
    expect(next.gameOver).toBe(true);
  });

  test("o estado fica congelado depois que a run já terminou", () => {
    const state = {
      beeY: 300,
      scrollX: 50,
      score: 20,
      elapsedTime: 5,
      gameOver: true,
      barriersSpawned: 0,
      barriers: [],
    };

    const next = update(state, { holding: true }, 1);

    expect(next.beeY).toBe(300);
    expect(next.scrollX).toBe(50);
    expect(next.score).toBe(20);
    expect(next.elapsedTime).toBe(5);
    expect(next.gameOver).toBe(true);
  });

  test("gera a primeira barreira assim que a run começa", () => {
    const state = createInitialState();

    const next = update(state, { holding: false }, 0.1, () => 0.5);

    expect(next.barriers.length).toBe(1);
    expect(next.barriers[0].x).toBe(480);
    expect(next.barriers[0].gapHeight).toBe(220);
    expect(next.barriers[0].gapTop).toBe(210);
  });

  test("avança as barreiras existentes da direita para a esquerda", () => {
    const state = {
      beeY: 300,
      scrollX: 0,
      score: 0,
      elapsedTime: 0,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [{ x: 300, gapTop: 100, gapHeight: 160 }],
    };

    const next = update(state, { holding: false }, 0.5, () => 0.5);

    expect(next.barriers.length).toBe(1);
    expect(next.barriers[0].x).toBe(225);
    expect(next.barriers[0].gapTop).toBe(100);
  });

  test("gera uma nova barreira quando a última avançou o suficiente", () => {
    const state = {
      beeY: 300,
      scrollX: 0,
      score: 0,
      elapsedTime: 0,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [{ x: 222, gapTop: 100, gapHeight: 160 }],
    };

    const next = update(state, { holding: false }, 0.1, () => 0.5);

    expect(next.barriers.length).toBe(2);
    expect(next.barriers[0].x).toBe(207);
    expect(next.barriers[1].x).toBe(480);
    expect(next.barriers[1].gapTop).toBe(210);
  });

  test("encerra a run quando a abelha colide com a parte sólida de uma barreira", () => {
    const state = {
      beeY: 100,
      scrollX: 0,
      score: 0,
      elapsedTime: 0,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [{ x: 100, gapTop: 240, gapHeight: 160 }],
    };

    const next = update(state, { holding: false }, 0.1, () => 0.5);

    expect(next.gameOver).toBe(true);
  });

  test("não encerra a run quando a abelha passa pela abertura da barreira", () => {
    const state = {
      beeY: 300,
      scrollX: 0,
      score: 0,
      elapsedTime: 0,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [{ x: 100, gapTop: 240, gapHeight: 160 }],
    };

    const next = update(state, { holding: false }, 0.1, () => 0.5);

    expect(next.gameOver).toBe(false);
  });

  test("remove barreiras que saíram completamente da tela pela esquerda", () => {
    const state = {
      beeY: 300,
      scrollX: 0,
      score: 0,
      elapsedTime: 0,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [
        { x: -70, gapTop: 100, gapHeight: 160 },
        { x: 400, gapTop: 200, gapHeight: 160 },
      ],
    };

    const next = update(state, { holding: false }, 0.01, () => 0.5);

    expect(next.barriers.length).toBe(1);
    expect(next.barriers[0].x).toBe(398.5);
  });

  test("a nova run começa com a pontuação zerada", () => {
    const state = createInitialState();

    expect(state.score).toBe(0);
  });

  test("a pontuação cresce continuamente conforme a distância percorrida", () => {
    const state = createInitialState();

    const next = update(state, { holding: false }, 0.5);

    expect(next.score).toBe(75);
  });

  test("a pontuação continua se acumulando ao longo de vários quadros", () => {
    const state = createInitialState();

    const afterFirstFrame = update(state, { holding: false }, 0.5);
    const afterSecondFrame = update(afterFirstFrame, { holding: false }, 0.2);

    expect(afterSecondFrame.score).toBe(106);
  });

  test("uma nova run começa com a velocidade de rolagem na base", () => {
    const state = createInitialState();

    expect(state.elapsedTime).toBe(0);
  });

  test("a velocidade de rolagem aumenta conforme o tempo decorrido na run", () => {
    const state = {
      beeY: 300,
      scrollX: 0,
      score: 0,
      elapsedTime: 10,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [],
    };

    const next = update(state, { holding: false }, 1);

    expect(next.scrollX).toBe(250);
    expect(next.score).toBe(250);
    expect(next.elapsedTime).toBe(11);
  });

  test("o aumento de velocidade também acelera o movimento das barreiras", () => {
    const state = {
      beeY: 300,
      scrollX: 0,
      score: 0,
      elapsedTime: 10,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [{ x: 500, gapTop: 100, gapHeight: 160 }],
    };

    const next = update(state, { holding: false }, 1, () => 0.5);

    expect(next.barriers.length).toBe(1);
    expect(next.barriers[0].x).toBe(250);
  });

  test("a abertura das barreiras encolhe gradualmente conforme a run avança", () => {
    const state = {
      beeY: 300,
      scrollX: 0,
      score: 0,
      elapsedTime: 7.5,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [],
    };

    const next = update(state, { holding: false }, 0.1, () => 0.5);

    expect(next.barriers[0].gapHeight).toBe(190);
    expect(next.barriers[0].gapTop).toBe(225);
  });

  test("a abertura chega ao tamanho normal depois do período de encolhimento", () => {
    const state = {
      beeY: 300,
      scrollX: 0,
      score: 0,
      elapsedTime: 20,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [],
    };

    const next = update(state, { holding: false }, 0.1, () => 0.5);

    expect(next.barriers[0].gapHeight).toBe(160);
    expect(next.barriers[0].gapTop).toBe(240);
  });

  test("a cada 3 barreiras, a terceira nasce com uma abertura bônus", () => {
    const state = {
      beeY: 300,
      scrollX: 0,
      score: 0,
      elapsedTime: 0,
      gameOver: false,
      barriersSpawned: 2,
      barriers: [],
    };
    const randomValues = [0.5, 0.2, 0.5];
    const random = () => randomValues.shift();

    const next = update(state, { holding: false }, 0.1, random);

    expect(next.barriersSpawned).toBe(3);
    expect(next.barriers[0].bonusSide).toBe("top");
    expect(next.barriers[0].bonusGapTop).toBe(80);
    expect(next.barriers[0].bonusCollected).toBe(false);
  });

  test("barreiras que não são a terceira não têm abertura bônus", () => {
    const state = {
      beeY: 300,
      scrollX: 0,
      score: 0,
      elapsedTime: 0,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [],
    };

    const next = update(state, { holding: false }, 0.1, () => 0.5);

    expect(next.barriersSpawned).toBe(1);
    expect(next.barriers[0].bonusSide).toBe(null);
  });

  test("não encerra a run quando a abelha passa pela abertura bônus", () => {
    const state = {
      beeY: 68,
      scrollX: 0,
      score: 0,
      elapsedTime: 0,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [
        { x: 100, gapTop: 210, gapHeight: 220, bonusSide: "top", bonusGapTop: 50, bonusCollected: false },
      ],
    };

    const next = update(state, { holding: false }, 0.01, () => 0.5);

    expect(next.gameOver).toBe(false);
  });

  test("continua mortal fora da abertura bônus, no resto do segmento sólido", () => {
    const state = {
      beeY: 150,
      scrollX: 0,
      score: 0,
      elapsedTime: 0,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [
        { x: 100, gapTop: 210, gapHeight: 220, bonusSide: "top", bonusGapTop: 50, bonusCollected: false },
      ],
    };

    const next = update(state, { holding: false }, 0.01, () => 0.5);

    expect(next.gameOver).toBe(true);
  });

  test("tocar o pólen bônus dá 20 pontos e marca a barreira como coletada", () => {
    const state = {
      beeY: 68,
      scrollX: 0,
      score: 0,
      elapsedTime: 0,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [
        { x: 70, gapTop: 210, gapHeight: 220, bonusSide: "top", bonusGapTop: 50, bonusCollected: false },
      ],
    };

    const next = update(state, { holding: false }, 0, () => 0.5);

    expect(next.score).toBe(20);
    expect(next.barriers[0].bonusCollected).toBe(true);
  });

  test("não dá o bônus de novo depois que o pólen já foi coletado", () => {
    const state = {
      beeY: 68,
      scrollX: 0,
      score: 20,
      elapsedTime: 0,
      gameOver: false,
      barriersSpawned: 0,
      barriers: [
        { x: 70, gapTop: 210, gapHeight: 220, bonusSide: "top", bonusGapTop: 50, bonusCollected: true },
      ],
    };

    const next = update(state, { holding: false }, 0, () => 0.5);

    expect(next.score).toBe(20);
  });
});
