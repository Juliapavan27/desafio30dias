# desafio30dias

## Analisador de Probabilidade de Jogos de Cassino

`cassino-probabilidade.html` — página única, sem dependências externas (basta abrir no navegador).

Ferramenta **educativa de probabilidade**. Ela calcula a matemática dos jogos; ela **não prevê resultados**
e não existe configuração em que passe a prever. Todo jogo analisado tem valor esperado negativo para quem aposta.

### O que ela faz

| Aba | Conteúdo |
|---|---|
| **Jogos e apostas** | Vantagem da casa, RTP e pagamento justo de cada aposta de roleta (europeia, francesa, americana), craps, bacará, blackjack, caça-níquel e loteria |
| **Simulador e risco de ruína** | Monte Carlo com distribuição completa das sessões, mais a fórmula fechada de gambler's ruin |
| **Analisar histórico** | Testa se uma sequência de resultados é compatível com aleatoriedade: qui-quadrado de aderência, teste de corridas, maior sequência idêntica e correlação serial |
| **Sistemas de aposta** | Martingale, D'Alembert e Fibonacci simulados lado a lado com a aposta fixa |
| **Comparar jogos** | Todas as apostas ordenadas por vantagem da casa |

### Verificação

Os motores foram conferidos contra valores publicados e, quando havia caminho independente, contra
força bruta ou simulação:

- Roleta europeia 2,7027% / francesa (la partage) 1,3514% / americana 5,2632% e cesto 7,8947%
- Craps: pass line 1,414%, don't pass 1,364%, odds 0%, any seven 16,67%
- Bacará 8 baralhos: banker 1,058%, player 1,235%, empate 8:1 14,36%
- Mega-Sena: 1 em 50.063.860 (sena), 154.518 (quina), 2.332 (quadra)
- RTP do caça-níquel: fórmula idêntica à enumeração das 39.304 combinações da fita
- Risco de ruína: fórmula fechada 0,25325 contra 0,25301 em 200 mil sessões simuladas
- Qui-quadrado e normal padrão conferidos em pontos críticos tabelados

A aba **Sistemas** é o teste que interessa: os quatro sistemas convergem para a mesma perda por real
apostado — a vantagem da casa — porque nenhum deles altera a probabilidade de uma rodada.

### Ajuda

Se o jogo deixou de ser diversão: **CVV — 188** (ligação gratuita, 24 horas) e Jogadores Anônimos Brasil.
