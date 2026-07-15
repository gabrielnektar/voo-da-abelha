# Voo da Abelha (nome provisório)

Jogo 2D de sobrevivência infinita (estilo endless runner) em que o jogador controla uma abelha que avança automaticamente da esquerda para a direita, desviando de barreiras.

## Language

**Run**:
Uma sessão de jogo, do início até a colisão fatal que causa o game over. Cada run começa com pontuação zerada.
_Avoid_: Partida, tentativa, rodada

**Abelha**:
Personagem controlado pelo jogador. Avança horizontalmente de forma automática e constante; o jogador controla apenas o movimento vertical, de forma livre — segurar move para cima, soltar desce (sem impulso/gravidade).
_Avoid_: Player, personagem, protagonista

**Barreira**:
Par de colunas verticais com uma abertura, posicionado ao longo do percurso horizontal. A abelha deve passar pela abertura sem tocar as colunas. Gerada em intervalos horizontais regulares, com a posição vertical da abertura aleatória.
_Avoid_: Obstáculo, cano, pipe

**Colisão**:
Contato entre a abelha e uma barreira, o chão ou o teto. Qualquer colisão encerra a run imediatamente (morte instantânea).
_Avoid_: Game over (é a *consequência* da colisão, não o mesmo conceito), impacto

**Pontuação**:
Valor numérico que cresce continuamente conforme a distância percorrida durante a run atual. Reseta a zero no início de cada run.
_Avoid_: Score, pontos

**Recorde**:
Maior pontuação já alcançada pelo jogador, persistida entre sessões via localStorage. Independente da pontuação da run atual.
_Avoid_: High score, melhor pontuação

**Velocidade de rolagem**:
Taxa com que a abelha avança horizontalmente e as barreiras se deslocam em relação a ela. Aumenta gradualmente ao longo da run, tornando os desvios mais difíceis com o tempo.
_Avoid_: Velocidade do jogo, game speed
