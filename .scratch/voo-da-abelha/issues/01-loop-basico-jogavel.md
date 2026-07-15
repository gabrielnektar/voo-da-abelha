# 01 — Loop básico jogável

**What to build:** A abelha aparece na tela e responde ao controle do jogador: segurar sobe suavemente, soltar desce (movimento vertical livre, sem gravidade/impulso — ADR 0001). A abelha avança horizontalmente sozinha a uma velocidade base constante. Tocar o chão ou o teto encerra a run imediatamente. Ao encerrar, aparece uma tela de game over com opção de reiniciar por clique/tecla, que volta a abelha ao estado inicial. Este ticket estabelece a arquitetura base: um módulo puro `update(state, input, dt) -> state` desacoplado de renderização (Canvas) e de I/O de navegador (teclado/mouse/touch), conforme o seam de teste definido no spec.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Abrir a página no navegador mostra a abelha, que responde a segurar/soltar o controle subindo/descendo de forma livre e suave (sem impulso/gravidade)
- [ ] A abelha avança horizontalmente sozinha a uma velocidade constante, visível na tela mesmo sem barreiras
- [ ] Tocar o chão ou o teto encerra a run imediatamente
- [ ] Ao encerrar a run, aparece uma tela de game over com opção de reiniciar (clique ou tecla)
- [ ] Reiniciar volta a abelha à posição e velocidade inicial e permite jogar novamente
- [ ] A lógica de jogo (`update`) é uma função pura testável isoladamente, sem depender de Canvas/DOM
- [ ] Testes automatizados cobrem: movimento vertical em resposta ao input, avanço horizontal automático, e colisão com chão/teto encerrando a run
