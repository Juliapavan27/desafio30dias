# Coletor de Histórico de Crash

Extensão de navegador (Chrome/Edge/Brave, Manifest V3) que lê o histórico de multiplicadores
já exibido na página do jogo e o guarda localmente para análise no `index.html` deste repositório.

**Somente leitura.** Ela não clica em nada, não aposta, não altera a página e não envia dados para
lugar nenhum — tudo fica em `chrome.storage.local`, no seu navegador.

## Instalação

1. Abra `chrome://extensions`
2. Ative o **Modo do desenvolvedor**
3. **Carregar sem compactação** e selecione esta pasta `extensao/`

## Uso

1. Abra o jogo de crash e deixe a aba visível
2. Clique no ícone da extensão
3. **Detectar** — tenta achar sozinho a faixa de histórico. Se não achar, use **Escolher na tela**
   e clique sobre a faixa de multiplicadores
4. Confira o campo *"A página mostra a mais recente primeiro"* — desmarque se o jogo exibir ao contrário
5. **Iniciar coleta**. Pode fechar o popup; a coleta continua
6. **Copiar** ou **Baixar JSON** e leve para o analisador (`index.html`, card *Histórico de rodadas*)

## Como a coleta funciona

O painel do jogo é uma janela deslizante: mostra as últimas N rodadas. A cada 1,5 s a extensão lê a
janela e procura o maior trecho final do histórico já guardado que coincida com o começo da janela
nova, anexando só o que vier depois. Isso reconstrói o fluxo sem duplicar nem pular.

Verificado contra uma página de teste que simula um painel real (bolhas de multiplicador em janela de
20): reconstrução **exata** de 320 rodadas lendo a cada 1, 3 e 10 rodadas.

## Lacunas

Se a janela inteira girar entre duas leituras, rodadas se perdem. A extensão detecta isso (não há
sobreposição entre as leituras) e conta em **Possíveis lacunas**, exibido no popup e gravado no JSON.

Com rodadas de ~20 s e leitura a cada 1,5 s isso não deveria acontecer — **exceto se a aba ficar em
segundo plano**, porque navegadores estrangulam temporizadores de abas ocultas. Mantenha a aba visível.

Lacunas não atrapalham a estimativa de RTP (que só depende da proporção de rodadas), mas quebram as
análises que assumem rodadas consecutivas: correlação serial, sequências e probabilidade condicional.
Se o contador estiver acima de zero, prefira coletar de novo.

## Limitações conhecidas

- **Não testada contra nenhum site real.** Foi desenvolvida contra uma página de teste, porque o
  ambiente de desenvolvimento não tem acesso a casas de apostas. Por isso a área é configurável e há
  o seletor visual: se a detecção automática falhar, aponte manualmente.
- Jogos dentro de `<iframe>` são cobertos (`all_frames: true`), mas o popup fala com o frame principal;
  se o histórico estiver num iframe, pode ser necessário abrir o iframe direto.
- Valores repetidos em sequência podem, em tese, desalinhar a junção. Na prática o painel guarda
  dezenas de valores, o que torna a coincidência improvável.
- O seletor derivado depende de classes do site. Se o site mudar o layout, refaça a detecção.
- `host_permissions` está em `<all_urls>` porque o domínio e o frame do jogo não são conhecidos de
  antemão. Se preferir, restrinja ao domínio que você usa editando o `manifest.json`.

## Antes de usar

Verifique os termos de uso do site. Muitas casas de apostas proíbem ferramentas automatizadas, mesmo
as que só leem a tela — o risco de suspensão de conta é seu.
