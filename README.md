# Analisador de Crash

Ferramenta de probabilidade para jogos de crash (Aviator e similares), em duas partes:

- `index.html` — analisador, página única sem dependências externas
- `extensao/` — extensão de navegador que coleta o histórico automaticamente ([detalhes](extensao/README.md))

Ela calcula a matemática do jogo e mede se um histórico bate com o RTP declarado. Ela **não prevê
resultados**: em crash o multiplicador é fixado por hash antes de a rodada abrir, e nenhuma rodada
carrega informação sobre a próxima.

## Abas

| Aba | Conteúdo |
|---|---|
| **Previsão** | A previsão para a próxima rodada e o placar que mede quanto ela vale |
| **O jogo** | Distribuição dos multiplicadores, alvos de saída e simulador de sessão |
| **Testes** | Estimativa do RTP real, probabilidade condicional, laboratório de regras e dragagem de dados |
| **Verificação** | Cadeia de sementes com SHA-256 ao vivo e a barreira criptográfica em números |

## Sobre a previsão

O previsor ótimo de Bayes para "a próxima passa de 2x?" é **constante**: como P(≥2x) = RTP/2 = 48,5%
é menor que 50%, a previsão que maximiza acerto é sempre "abaixo", em toda rodada. Ela acerta 51,5%
das vezes — mais que qualquer regra que varie com o histórico, porque não há informação no histórico
para aproveitar.

O desfecho prático: **o previsor ótimo nunca manda apostar**, porque 48,5% está abaixo dos 50%
necessários para o ponto de equilíbrio.

Você pode plugar qualquer regra própria (inclusive uma expressão livre sobre as rodadas anteriores).
Todo previsor é ajustado na primeira metade do histórico e avaliado na segunda, com placar de acerto,
Brier, log loss e banca — sem essa separação, qualquer regra parece boa.

## O modelo

Uma linha gera tudo: `P(multiplicador ≥ t) = RTP / t`. Dela seguem, todas verificadas contra simulação
de 2 milhões de rodadas:

- `EV = t × (RTP/t) − 1 = RTP − 1` — **constante**: o alvo de saída se cancela
- desvio padrão do retorno = `√(RTP × (t − RTP))` — cresce com o alvo
- mediana do multiplicador = `2 × RTP`
- `1/X` é Uniforme(0,1) nas rodadas sem crash imediato — base do teste de Kolmogorov-Smirnov
- a **média** do multiplicador não existe (cauda de Pareto com expoente 1)
- ponto de equilíbrio `1/t`; a barreira relativa para um previsor é `(1−RTP)/RTP` = **3,09%**,
  idêntica em qualquer alvo
- detectar essa barreira em 2x com 80% de poder exige **8.716 rodadas** (poder observado: 79,4%)

## RTP

O RTP real é definido pelo operador — a Spribe permite 97%, 96% ou 94% no Aviator. Informe o valor do
painel do jogo, ou estime a partir do histórico na aba *Testes*. Toda a informação sobre o RTP está na
proporção de rodadas que não passam de 1.00x: com 1.000 rodadas a margem fica em ±1 ponto percentual;
com 5.000, ±0,5.

## Verificação

Motores conferidos contra valores publicados e, onde havia caminho independente, contra simulação:

- EV constante nos 10 alvos; estimador de RTP recupera 97%, 96% e 94% de históricos gerados, e sinaliza
  divergência quando um histórico de 94% é testado contra 97% declarado
- SHA-256 da página conferido contra `node:crypto` em 309 casos
- Valor-p binomial bilateral: 4,3% a 5,1% de rejeição ao nível de 5% sob a hipótese nula
- Intervalo de Wilson: cobertura de 93,2% / 95,5% / 94,5% para n = 30 / 100 / 1000
- Tamanho de amostra: poder observado de 79,4% para alvo de 80%
- Sequência típica de perdas por recorrência exata (a aproximação usual erra 92→69 e 126→68, e inverte
  a ordem)
- Coleta da extensão: reconstrução exata de 320 rodadas a partir de uma janela deslizante de 20,
  lendo a cada 1, 3 e 10 rodadas
- Informação mútua entre passado e "passa de 2x" em 100 mil rodadas: 1,3×10⁻⁵ bits contra 0,999 bit de
  incerteza — abaixo do próprio viés do estimador sob independência (3,6×10⁻⁵)

## Ajuda

Se o jogo deixou de ser diversão: **CVV — 188** (gratuito, 24 horas) e Jogadores Anônimos Brasil.
