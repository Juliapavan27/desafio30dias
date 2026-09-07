/* Coletor de histórico de crash — script de conteúdo.
   Somente leitura: lê o que já está desenhado na página e guarda localmente.
   Nunca clica, nunca aposta, nunca envia nada para fora do navegador. */
(() => {
"use strict";
if (window.__coletorCrashAtivo) return;
window.__coletorCrashAtivo = true;

const RE_UM   = /^(\d{1,6})[.,](\d{1,2})\s*x?$/i;
const RE_VARIOS = /\d{1,6}[.,]\d{1,2}\s*x/gi;

const numero = t => parseFloat(String(t).replace(',', '.').replace(/x/i, '').trim());
const chaveSite = () => location.hostname + location.pathname;

/* --- extrai multiplicadores de dentro de um elemento --- */
function extrair(el){
  if (!el) return [];
  const out = [];
  const folhas = el.querySelectorAll('*');
  for (const n of folhas){
    if (n.children.length) continue;
    const t = (n.textContent || '').trim();
    if (RE_UM.test(t)){
      const v = numero(t);
      if (v >= 1 && v < 1e6) out.push(v);
    }
  }
  if (!out.length){
    const m = (el.textContent || '').match(RE_VARIOS);
    if (m) for (const x of m){
      const v = numero(x);
      if (v >= 1 && v < 1e6) out.push(v);
    }
  }
  return out;
}

/* --- acha sozinho o elemento que parece a faixa de histórico ---
   Painéis de crash põem cada multiplicador na sua própria bolha
   (<div class="bubble"><span>2.47x</span></div>), então agrupar pelo pai
   imediato daria N pais com 1 valor cada. Contamos por toda a cadeia de
   ancestrais e ficamos com o container mais profundo que reúne o maior
   número de multiplicadores — o mais justo em volta da faixa. */
function profundidade(el){ let d = 0; while (el && el.parentElement){ d++; el = el.parentElement; } return d; }
function detectar(){
  const contagem = new Map();
  for (const n of document.querySelectorAll('*')){
    if (n.children.length) continue;
    const t = (n.textContent || '').trim();
    if (!RE_UM.test(t)) continue;
    const v = numero(t);
    if (!(v >= 1 && v < 1e6)) continue;
    let a = n.parentElement, d = 0;
    while (a && d < 8 && a.tagName !== 'BODY' && a.tagName !== 'HTML'){
      contagem.set(a, (contagem.get(a) || 0) + 1);
      a = a.parentElement; d++;
    }
  }
  let melhor = null, melhorC = 0, melhorP = -1;
  for (const [el, c] of contagem){
    if (c < 5) continue;
    const prof = profundidade(el);
    if (c > melhorC || (c === melhorC && prof > melhorP)){ melhor = el; melhorC = c; melhorP = prof; }
  }
  return melhor;
}

/* --- seletor CSS estável o suficiente para reencontrar o elemento --- */
function seletorDe(el){
  if (!el || el.nodeType !== 1) return '';
  if (el.id) return '#' + CSS.escape(el.id);
  const partes = [];
  let n = el;
  while (n && n.nodeType === 1 && partes.length < 6){
    if (n.id){ partes.unshift('#' + CSS.escape(n.id)); break; }
    let p = n.tagName.toLowerCase();
    const cls = [...n.classList].filter(c => c && !/^\d/.test(c) && c.length < 30).slice(0, 2);
    if (cls.length) p += '.' + cls.map(c => CSS.escape(c)).join('.');
    const pai = n.parentElement;
    if (pai){
      const irmaos = [...pai.children].filter(x => x.tagName === n.tagName);
      if (irmaos.length > 1) p += `:nth-of-type(${irmaos.indexOf(n) + 1})`;
    }
    partes.unshift(p);
    n = n.parentElement;
  }
  return partes.join(' > ');
}

/* --- junta a janela visível ao histórico já guardado, sem duplicar ---
   O painel do jogo é uma janela deslizante: a cada leitura, procura o maior
   trecho final do histórico que coincide com o começo da janela e anexa só o
   que vier depois. */
function juntar(historico, janela){
  if (!janela.length) return { lista: historico, k: -1 };
  if (!historico.length) return { lista: janela.slice(), k: -1 };
  const max = Math.min(historico.length, janela.length);
  for (let k = max; k > 0; k--){
    let bate = true;
    for (let i = 0; i < k; i++){
      if (historico[historico.length - k + i] !== janela[i]){ bate = false; break; }
    }
    if (bate) return { lista: historico.concat(janela.slice(k)), k };
  }
  /* nenhuma sobreposição: a janela girou inteira entre duas leituras, então
     rodadas se perderam no meio. Isso acontece sobretudo quando o navegador
     estrangula temporizadores de abas em segundo plano. */
  return { lista: historico.concat(janela), k: 0 };
}

/* --- estado --- */
let cfg = { seletor: '', inverter: true, coletando: false };
let temporizador = null;

let lacunas = 0;
function carregar(cb){
  chrome.storage.local.get([chaveSite()], r => {
    const d = r[chaveSite()] || {};
    cfg.seletor  = d.seletor || '';
    cfg.inverter = d.inverter !== false;
    cfg.coletando = !!d.coletando;
    lacunas = d.lacunas || 0;
    cb(d.rodadas || []);
  });
}
function salvar(rodadas, extra){
  const d = Object.assign({
    seletor: cfg.seletor, inverter: cfg.inverter, coletando: cfg.coletando,
    rodadas, lacunas, atualizado: Date.now()
  }, extra || {});
  chrome.storage.local.set({ [chaveSite()]: d });
}

function lerAgora(){
  const el = cfg.seletor ? document.querySelector(cfg.seletor) : null;
  let vals = extrair(el);
  if (!vals.length && !cfg.seletor){
    const auto = detectar();
    if (auto){ cfg.seletor = seletorDe(auto); vals = extrair(auto); }
  }
  /* o painel costuma mostrar a mais recente primeiro; guardamos do mais antigo para o mais novo */
  return cfg.inverter ? vals.slice().reverse() : vals;
}

function tique(){
  const janela = lerAgora();
  if (!janela.length) return;
  carregar(atual => {
    const r = juntar(atual, janela);
    if (r.k === 0 && atual.length) lacunas++;
    if (r.lista.length !== atual.length || r.k === 0) salvar(r.lista);
  });
}

function iniciar(){
  if (temporizador) clearInterval(temporizador);
  cfg.coletando = true;
  temporizador = setInterval(tique, 1500);
  tique();
}
function parar(){
  cfg.coletando = false;
  if (temporizador) clearInterval(temporizador);
  temporizador = null;
  carregar(r => salvar(r));
}

/* --- seletor visual de área --- */
let escolhendo = false, marcador = null, ultimoAlvo = null;
function marcadorEl(){
  if (marcador) return marcador;
  marcador = document.createElement('div');
  Object.assign(marcador.style, {
    position:'fixed', pointerEvents:'none', zIndex:2147483647,
    border:'2px solid #6366f1', background:'rgba(99,102,241,.15)',
    borderRadius:'4px', transition:'all .05s linear'
  });
  document.documentElement.appendChild(marcador);
  return marcador;
}
function aoMover(e){
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || el === marcador) return;
  ultimoAlvo = el;
  const r = el.getBoundingClientRect();
  const m = marcadorEl();
  Object.assign(m.style, { left:r.left+'px', top:r.top+'px', width:r.width+'px', height:r.height+'px' });
}
function aoClicar(e){
  e.preventDefault(); e.stopPropagation();
  let el = ultimoAlvo;
  /* sobe até um ancestral que contenha vários multiplicadores */
  for (let i = 0; i < 6 && el && el.parentElement; i++){
    if (extrair(el).length >= 5) break;
    el = el.parentElement;
  }
  cfg.seletor = seletorDe(el);
  pararEscolha();
  carregar(r => salvar(r));
  chrome.runtime.sendMessage({ tipo:'areaEscolhida', seletor: cfg.seletor, achados: extrair(el).length });
}
function iniciarEscolha(){
  if (escolhendo) return;
  escolhendo = true;
  document.addEventListener('mousemove', aoMover, true);
  document.addEventListener('click', aoClicar, true);
}
function pararEscolha(){
  escolhendo = false;
  document.removeEventListener('mousemove', aoMover, true);
  document.removeEventListener('click', aoClicar, true);
  if (marcador){ marcador.remove(); marcador = null; }
}

/* --- mensagens do popup --- */
chrome.runtime.onMessage.addListener((msg, _rem, responde) => {
  if (msg.tipo === 'estado'){
    carregar(r => {
      const janela = lerAgora();
      responde({ ok:true, seletor:cfg.seletor, inverter:cfg.inverter, coletando:cfg.coletando,
                 total:r.length, ultimas:r.slice(-10), visiveis:janela.length,
                 lacunas, site:chaveSite() });
    });
    return true;
  }
  if (msg.tipo === 'detectar'){
    const el = detectar();
    if (el){ cfg.seletor = seletorDe(el); carregar(r => salvar(r)); }
    responde({ ok:!!el, seletor:cfg.seletor, achados: el ? extrair(el).length : 0 });
    return true;
  }
  if (msg.tipo === 'escolher'){ iniciarEscolha(); responde({ ok:true }); return true; }
  if (msg.tipo === 'iniciar'){ iniciar(); responde({ ok:true }); return true; }
  if (msg.tipo === 'parar'){ parar(); responde({ ok:true }); return true; }
  if (msg.tipo === 'inverter'){
    cfg.inverter = !!msg.valor; carregar(r => salvar(r)); responde({ ok:true }); return true;
  }
  if (msg.tipo === 'limpar'){ lacunas = 0; salvar([]); responde({ ok:true }); return true; }
  if (msg.tipo === 'dados'){
    carregar(r => responde({ ok:true, rodadas:r, lacunas, site:chaveSite() }));
    return true;
  }
});

/* retoma a coleta se estava ligada antes de recarregar a página */
carregar(() => { if (cfg.coletando) iniciar(); });

/* exposto para teste automatizado */
window.__coletorCrash = { extrair, detectar, seletorDe, juntar, lerAgora, profundidade };
})();
