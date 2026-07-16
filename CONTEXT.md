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
Par de colunas verticais com uma abertura, posicionado ao longo do percurso horizontal. A abelha deve passar pela abertura sem tocar as colunas. Gerada em intervalos horizontais regulares, com a posição vertical da abertura aleatória — mas sempre alcançável a partir da abertura da barreira anterior, dado o quanto a abelha consegue subir/descer no tempo disponível entre as duas; nunca exige mais velocidade vertical do que ela consegue prover. O tamanho da abertura é maior nas barreiras geradas no início da run, encolhendo gradualmente até um tamanho normal — cada barreira mantém o tamanho de abertura com que nasceu.
_Avoid_: Obstáculo, cano, pipe

**Abertura bônus**:
Uma segunda abertura, quase tão acessível quanto a principal, presente a cada 3 barreiras (a 3ª, 6ª, 9ª...), cortada no segmento sólido mais alto daquela barreira (o de maior espaço, entre topo e base). Assim como a abertura principal, a abelha só passa em segurança se estiver totalmente contida nela — fora dela, o resto do segmento continua sólido e mortal. Contém um Pólen bônus.
_Avoid_: Segunda abertura, buraco extra, atalho

**Pólen bônus**:
Um pólen brilhante posicionado dentro da abertura bônus. Tocá-lo soma 20 pontos à pontuação da run, uma única vez por barreira, e ele desaparece da tela depois de coletado (a abertura em si continua passável).
_Avoid_: Power-up, item, coletável

**Colisão**:
Contato entre a abelha e uma barreira, o chão ou o teto. Qualquer colisão encerra a run imediatamente (morte instantânea).
_Avoid_: Game over (é a *consequência* da colisão, não o mesmo conceito), impacto

**Pontuação**:
Valor numérico que cresce continuamente conforme a distância percorrida durante a run atual, mais os saltos discretos de +20 ao coletar um Pólen bônus. Reseta a zero no início de cada run.
_Avoid_: Score, pontos

**Recorde**:
Maior pontuação já alcançada pelo jogador, persistida entre sessões via localStorage. Independente da pontuação da run atual.
_Avoid_: High score, melhor pontuação

**Velocidade de rolagem**:
Taxa com que a abelha avança horizontalmente e as barreiras se deslocam em relação a ela. Aumenta gradualmente ao longo da run, tornando os desvios mais difíceis com o tempo.
_Avoid_: Velocidade do jogo, game speed
