# Ferramenta de Análise de Probabilidade — Jogos de Cassino

`index.html` — página única, sem dependências externas (basta abrir no navegador).

Ferramenta **educativa de probabilidade**. Ela calcula a matemática dos jogos; ela **não prevê resultados**
e não existe configuração em que passe a prever. Todo jogo analisado tem valor esperado negativo para quem aposta.

## Abas

| Aba | Conteúdo |
|---|---|
| **Jogo de crash** | Distribuição dos multiplicadores, comparação entre alvos de saída, estimativa do RTP real a partir de um histórico de rodadas, simulador de sessão e verificador provably fair |
| **Jogos e apostas** | Vantagem da casa, RTP e pagamento justo de cada aposta de roleta (europeia, francesa, americana), craps, bacará, blackjack, caça-níquel e loteria |
| **Simulador e risco de ruína** | Monte Carlo com distribuição completa das sessões, mais a fórmula fechada de gambler's ruin |
| **Analisar histórico** | Qui-quadrado de aderência, teste de corridas, maior sequência idêntica e correlação serial |
| **Sistemas de aposta** | Martingale, D'Alembert e Fibonacci simulados lado a lado com a aposta fixa |
| **Comparar jogos** | Todas as apostas ordenadas por vantagem da casa |

## Sobre analisar o crash de uma casa específica

Não é possível afirmar o RTP do crash de um site a partir do nome dele. A Spribe permite que **cada operador
configure o Aviator em 97%, 96% ou 94%**, e outros provedores fazem o mesmo. O número real fica no painel de
informações do próprio jogo, e sua publicação é obrigatória.

A ferramenta trata isso de duas formas:

1. **Informe o RTP declarado** e toda a análise sai exata para aquela configuração.
2. **Cole um histórico de rodadas** copiado do painel de resultados do jogo. A ferramenta estima o RTP real
   daquela instância e testa a aderência ao valor declarado — essa é a análise da casa específica, feita com
   dados dela.

Toda a informação sobre o RTP está na proporção de rodadas que não passam de 1.00x: condicionada a não haver
crash imediato, a forma da distribuição não depende do RTP. Daí a margem de erro do estimador: com 1.000
rodadas fica em torno de ±1 ponto percentual; com 5.000, ±0,5.

## O modelo de crash

Uma única linha gera tudo: `P(multiplicador ≥ t) = RTP / t`.

Dela seguem, e todas foram verificadas contra simulação de 2 milhões de rodadas:

- `P(sucesso ao sacar em t) = RTP/t`
- `EV = t × (RTP/t) − 1 = RTP − 1` — **constante**: o alvo de saída se cancela
- desvio padrão do retorno = `√(RTP × (t − RTP))` — cresce com o alvo
- mediana do multiplicador = `2 × RTP`
- `1/X` é Uniforme(0,1) nas rodadas sem crash imediato — base do teste de Kolmogorov-Smirnov
- a **média** do multiplicador não existe (cauda de Pareto com expoente 1)

O resultado central: sacar em 1.05x e sacar em 100x têm exatamente a mesma perda esperada. O alvo escolhe o
formato do risco, não o tamanho da perda.

## Verificação

Os motores foram conferidos contra valores publicados e, quando havia caminho independente, contra força bruta
ou simulação:

- Roleta europeia 2,7027% / francesa (la partage) 1,3514% / americana 5,2632% e cesto 7,8947%
- Craps: pass line 1,414%, don't pass 1,364%, odds 0%, any seven 16,67%
- Bacará 8 baralhos: banker 1,058%, player 1,235%, empate 8:1 14,36%
- Mega-Sena: 1 em 50.063.860 (sena), 154.518 (quina), 2.332 (quadra)
- RTP do caça-níquel: fórmula idêntica à enumeração das 39.304 combinações da fita
- Risco de ruína: fórmula fechada 0,25325 contra 0,25301 em 200 mil sessões simuladas
- Crash: EV constante em todos os 10 alvos; estimador de RTP recupera 97%, 96% e 94% a partir de históricos
  gerados, e sinaliza divergência quando um histórico de 94% é testado contra 97% declarado
- Sequência típica de perdas: recorrência exata conferida contra simulação (92 e 126 rodadas em alvos de 50x
  e 100x, onde a aproximação usual log(n·p)/log(1/q) erra para 69 e 68 e ainda inverte a ordem)
- Qui-quadrado, Kolmogorov-Smirnov, normal padrão e cauda binomial conferidos em pontos críticos tabelados

## Ajuda

Se o jogo deixou de ser diversão: **CVV — 188** (ligação gratuita, 24 horas) e Jogadores Anônimos Brasil.
