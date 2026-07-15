# 02 — Barreiras

**What to build:** Pares de colunas com abertura (Barreiras) são gerados em intervalos horizontais regulares e avançam da direita para a esquerda em relação à abelha. A posição vertical da abertura de cada barreira é sorteada aleatoriamente, sempre deixando espaço passável. Tocar em qualquer parte de uma barreira encerra a run imediatamente, com o mesmo comportamento já existente para chão/teto.

**Blocked by:** 01 — Loop básico jogável

**Status:** ready-for-agent

- [ ] Barreiras são geradas automaticamente em intervalos horizontais regulares durante a run
- [ ] A posição vertical da abertura de cada barreira é aleatória, garantindo sempre espaço passável para a abelha
- [ ] Barreiras avançam da direita para a esquerda em relação à abelha
- [ ] Tocar qualquer parte de uma barreira encerra a run imediatamente, igual ao chão/teto
- [ ] Barreiras que saem da tela pela esquerda deixam de ser processadas/renderizadas
- [ ] Testes automatizados cobrem: geração das barreiras, seu avanço ao longo do tempo, e colisão com elas encerrando a run
