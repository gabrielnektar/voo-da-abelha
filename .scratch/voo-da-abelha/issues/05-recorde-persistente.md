# 05 — Recorde persistente

**What to build:** O recorde (maior pontuação já alcançada) é salvo em localStorage e exibido junto à pontuação final na tela de game over. O acesso ao localStorage fica isolado em um módulo próprio, fora do módulo puro de lógica de jogo.

**Blocked by:** 03 — Pontuação contínua

**Status:** ready-for-agent

- [ ] Ao terminar uma run, se a pontuação da run superar o recorde salvo, o recorde é atualizado
- [ ] A tela de game over mostra tanto a pontuação final da run quanto o recorde atual
- [ ] Fechar e reabrir a página no navegador preserva o recorde salvo anteriormente
- [ ] O acesso ao localStorage fica isolado em um módulo próprio (ex: um "record store"), separado do módulo puro de lógica de jogo, e não é coberto por teste automatizado — validação manual no navegador
