"use strict";
const $ = id => document.getElementById(id);
let aba = null, coletando = false, rodadas = [];

function msg(txt, cor){
  $('msg').textContent = txt || '';
  $('msg').style.color = cor || '#64748b';
}
function enviar(tipo, extra){
  return new Promise(res => {
    chrome.tabs.sendMessage(aba.id, Object.assign({tipo}, extra||{}), r => {
      if (chrome.runtime.lastError){ res(null); return; }
      res(r);
    });
  });
}
async function atualizar(){
  const e = await enviar('estado');
  if (!e){
    msg('Não consegui falar com a página. Recarregue a aba e abra o popup de novo.', '#dc2626');
    $('alternar').disabled = true;
    return;
  }
  $('alternar').disabled = false;
  coletando = e.coletando;
  $('total').textContent = e.total.toLocaleString('pt-BR');
  $('estado').textContent = e.coletando ? 'ativa' : 'parada';
  $('estado').className = 'val ' + (e.coletando ? 'ok' : 'off');
  $('visiveis').textContent = e.visiveis ? e.visiveis + ' multiplicadores' : 'nenhum';
  $('lacunas').textContent = e.lacunas || 0;
  $('lacunas').className = 'val ' + (e.lacunas ? '' : 'off');
  if (e.lacunas) $('lacunas').style.color = '#dc2626';
  $('seletor').textContent = e.seletor || 'nenhuma definida';
  $('inverter').checked = e.inverter;
  $('alternar').textContent = e.coletando ? 'Parar coleta' : 'Iniciar coleta';
  $('ultimas').textContent = e.ultimas.length
    ? 'últimas: ' + e.ultimas.map(v => v.toFixed(2) + 'x').join('  ') : '';
}
async function carregarRodadas(){
  const d = await enviar('dados');
  rodadas = d && d.rodadas ? d.rodadas : [];
  return d;
}

$('detectar').addEventListener('click', async () => {
  const r = await enviar('detectar');
  msg(r && r.ok ? `Encontrei ${r.achados} multiplicadores nessa área.` : 'Nada encontrado — use "Escolher na tela".',
      r && r.ok ? '#059669' : '#d97706');
  atualizar();
});
$('escolher').addEventListener('click', async () => {
  await enviar('escolher');
  msg('Passe o mouse sobre a faixa de histórico na página e clique nela.', '#4f46e5');
  window.close();
});
$('inverter').addEventListener('change', async e => {
  await enviar('inverter', { valor: e.target.checked });
  atualizar();
});
$('alternar').addEventListener('click', async () => {
  await enviar(coletando ? 'parar' : 'iniciar');
  msg(coletando ? 'Coleta parada.' : 'Coletando a cada 1,5 s. Pode fechar este popup.', '#059669');
  setTimeout(atualizar, 300);
});
$('copiar').addEventListener('click', async () => {
  await carregarRodadas();
  if (!rodadas.length){ msg('Nada coletado ainda.', '#d97706'); return; }
  await navigator.clipboard.writeText(rodadas.map(v => v.toFixed(2)).join(' '));
  msg(`${rodadas.length} rodadas copiadas. Cole no analisador.`, '#059669');
});
$('baixar').addEventListener('click', async () => {
  const d = await carregarRodadas();
  if (!rodadas.length){ msg('Nada coletado ainda.', '#d97706'); return; }
  const blob = new Blob([JSON.stringify({
    site: d.site, coletadoEm: new Date().toISOString(), total: rodadas.length,
    lacunas: d.lacunas || 0, rodadas
  }, null, 1)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  chrome.downloads
    ? chrome.downloads.download({ url, filename: 'crash-historico.json' })
    : Object.assign(document.createElement('a'), { href: url, download: 'crash-historico.json' }).click();
  msg(`${rodadas.length} rodadas exportadas.`, '#059669');
});
$('limpar').addEventListener('click', async () => {
  await enviar('limpar');
  msg('Histórico deste site apagado.', '#dc2626');
  atualizar();
});
chrome.runtime.onMessage.addListener(m => { if (m.tipo === 'areaEscolhida') atualizar(); });

chrome.tabs.query({ active: true, currentWindow: true }, t => { aba = t[0]; atualizar(); });
setInterval(() => { if (aba) atualizar(); }, 2000);
