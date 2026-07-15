# Voo da Abelha

Status: ready-for-agent

## Problem Statement

O usuário quer um jogo 2D casual, jogável direto no navegador sem instalação, no estilo "endless runner" inspirado no Flappy Bird, mas com tema de abelha. Hoje não existe nenhum código do jogo — o projeto parte de uma pasta vazia com apenas a documentação de domínio criada durante a sessão de grilling.

## Solution

Construir um jogo 2D em HTML5 Canvas + JavaScript puro (sem framework/engine, ADR 0002) em que o jogador controla uma **Abelha** que avança automaticamente da esquerda para a direita, desviando de **Barreiras**. O modo é infinito (sem linha de chegada): cada **Run** dura até uma **Colisão**, a **Pontuação** cresce continuamente com a distância percorrida, a dificuldade aumenta gradualmente ao longo da run, e o **Recorde** persiste entre sessões via localStorage.

## User Stories

1. Como jogador, quero controlar a altura da abelha segurando uma tecla/toque para subir e soltando para descer (movimento vertical livre, sem gravidade/impulso), para ter um controle previsível e menos punitivo que o Flappy Bird clássico (ADR 0001).
2. Como jogador, quero que a abelha avance automaticamente da esquerda para a direita a uma velocidade base constante no início da run, para poder focar só no posicionamento vertical.
3. Como jogador, quero ver pares de barreiras com uma abertura se aproximando pela direita, para ter obstáculos a desviar.
4. Como jogador, quero que a posição vertical da abertura de cada barreira seja sorteada aleatoriamente, para que nenhuma run seja idêntica à anterior.
5. Como jogador, quero que a run termine imediatamente ao tocar uma barreira, para o jogo ter risco real a cada desvio.
6. Como jogador, quero que a run termine imediatamente ao tocar o chão, para precisar gerenciar a altitude com cuidado.
7. Como jogador, quero que a run termine imediatamente ao tocar o teto, para que voar alto demais também seja arriscado.
8. Como jogador, quero ver minha pontuação subir continuamente enquanto sobrevivo/avanço, para ser recompensado por me manter vivo, não só por ultrapassar barreiras.
9. Como jogador, quero que a velocidade de rolagem aumente gradualmente ao longo da run, para que trechos mais avançados de uma mesma run fiquem mais desafiadores.
10. Como jogador, quero ver uma tela de game over com minha pontuação final e meu recorde ao colidir, para comparar meu desempenho imediatamente.
11. Como jogador, quero reiniciar uma nova run com um clique/tecla a partir da tela de game over, para tentar de novo rapidamente sem recarregar a página.
12. Como jogador, quero que meu recorde persista entre sessões do navegador, para não perder meu melhor resultado ao fechar e reabrir a página.
13. Como jogador, quero que a pontuação volte a zero no início de cada nova run, para cada tentativa ser medida de forma independente.
14. Como jogador, quero ver minha pontuação atual em tempo real durante a run, para acompanhar meu progresso enquanto jogo.
15. Como jogador, quero que a abelha e as barreiras sejam desenhadas como formas geométricas simples, para o jogo ser jogável de imediato sem depender de assets de arte.
16. Como jogador, quero jogar inteiramente no navegador via Canvas, sem instalar nada, para poder abrir e jogar imediatamente (ADR 0002).
17. Como jogador, quero que cada run comece sempre com a abelha na mesma posição e velocidade vertical inicial, para todas as tentativas começarem em igualdade de condições.
18. Como jogador, quero que esta versão não tenha som/música, para o lançamento inicial ficar focado na jogabilidade principal.
19. Como desenvolvedor mantendo o projeto, quero a lógica central do jogo (movimento, geração de barreiras, colisão, pontuação, progressão de dificuldade) isolada em um módulo puro, desacoplado de renderização e I/O de navegador, para poder testar essas regras sem precisar de DOM/Canvas.
20. Como desenvolvedor mantendo o projeto, quero a persistência do recorde isolada em um módulo próprio de acesso ao localStorage, para poder trocar o mecanismo de armazenamento no futuro sem tocar na lógica de jogo.

## Implementation Decisions

- **Seam único de teste**: um módulo de lógica pura de jogo expõe `update(state, input, dt) -> state`, totalmente desacoplado de renderização (Canvas) e de I/O de navegador (teclado/mouse/touch, localStorage). Toda regra de jogo (movimento da abelha, geração e avanço de barreiras, colisão, pontuação, progressão de velocidade) vive nesse módulo.
- **Estado do jogo** (`GameState`) contém: posição e velocidade vertical da abelha; lista de barreiras ativas (posição horizontal, posição vertical da abertura); pontuação atual; velocidade de rolagem atual; flag indicando se a run terminou por colisão.
- **Módulo de renderização**: lê o `GameState` e desenha no Canvas a abelha e as barreiras como formas geométricas simples (sem sprites/imagens).
- **Módulo de input**: traduz eventos de teclado/mouse/touch em um sinal booleano simples ("subindo"/"não subindo") consumido por `update`.
- **Módulo de persistência do recorde**: encapsula leitura/escrita do recorde em localStorage; é o único ponto do código que toca localStorage, chamado fora do módulo de lógica pura.
- **Geração de barreiras**: pares de colunas com abertura, geradas em intervalos horizontais regulares; posição vertical da abertura sorteada aleatoriamente dentro de limites que garantem espaço passável.
- **Colisão**: detecção por sobreposição de retângulos (AABB) entre a abelha e cada barreira, o chão e o teto; qualquer sobreposição marca a run como encerrada (morte instantânea).
- **Pontuação**: incrementada continuamente, proporcional à distância percorrida (não por barreira ultrapassada); reseta a zero a cada nova run.
- **Progressão de dificuldade**: a velocidade de rolagem aumenta gradualmente em função do tempo/distância decorrida na run atual; a curva exata de incremento é um detalhe de tuning a ser ajustado durante a implementação.
- **Stack**: HTML5 Canvas + JavaScript puro, sem framework/engine (ADR 0002).
- **Controle**: movimento vertical livre, sem gravidade/impulso (ADR 0001).

## Testing Decisions

- Um bom teste aqui verifica apenas o comportamento externo do `update(state, input, dt)`: dado um estado inicial e uma sequência de inputs/dt, o próximo estado retornado é o esperado. Não inspecionar detalhes internos de implementação.
- O único módulo coberto por testes automatizados nesta primeira versão é o módulo de lógica pura de jogo, cobrindo: movimento vertical da abelha em resposta ao input; geração e avanço de barreiras; detecção de colisão (barreira, chão, teto); acumulação contínua de pontuação; aumento gradual da velocidade de rolagem ao longo do tempo.
- Renderização (Canvas), input de teclado/mouse/touch e persistência em localStorage são camadas finas, não cobertas por teste automatizado nesta versão — validadas manualmente jogando no navegador.
- Não há prior art de testes no repositório: projeto greenfield, sem código existente. Este será o primeiro teste do projeto e deve estabelecer o padrão (testes unitários puros, sem mocks de DOM/Canvas) para features futuras.

## Out of Scope

- Som e música
- Sprites/arte ilustrada (fica como formas geométricas simples nesta versão)
- Modo de nível finito com linha de chegada (decidido: modo infinito)
- Sistema de vidas/energia (decidido: morte instantânea)
- Múltiplos tipos de barreira (decidido: um único tipo, par de colunas com abertura)
- Suporte mobile/touch dedicado, ranking online, multiplayer, temas visuais alternativos

## Further Notes

- "Voo da Abelha" é um nome provisório; pode ser ajustado sem impacto no design.
- Ver [CONTEXT.md](../../CONTEXT.md) para o glossário de domínio (Run, Abelha, Barreira, Colisão, Pontuação, Recorde, Velocidade de rolagem) e os ADRs [0001](../../docs/adr/0001-controle-por-movimento-vertical-livre.md) / [0002](../../docs/adr/0002-stack-canvas-js-puro.md) para as decisões arquiteturais registradas durante a sessão de grilling que originou este spec.
