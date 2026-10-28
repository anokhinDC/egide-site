/*
 * Égide · Referência: Origens, Arquétipos, Perícias, Estilos de Poder, Traços e Magia.
 */
(function () {
  const LD = window.LD;
  const { esc } = LD.ui;
  const st = { aba: 'origens' };

  const ABAS = [['origens', 'Origens'], ['potencial', 'Potencial'], ['arquetipos', 'Arquétipos'], ['pericias', 'Perícias'], ['poder', 'Estilos de Poder'], ['tracos', 'Traços'], ['magia', 'Magia']];

  function render(main) {
    main.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">O que existe na Égide</div><h1>Referência</h1>
        <p class="lead">As peças de um herói, para consultar. Na ficha, cada uma é um clique.</p></div></div>
      <nav class="tabs">${ABAS.map(([k, n]) => `<button class="${st.aba === k ? 'on' : ''}" data-aba="${k}">${n}</button>`).join('')}</nav>
      <div data-corpo></div>`;
    const el = main.querySelector('[data-corpo]');
    const a = st.aba;
    if (a === 'origens') {
      el.innerHTML = `<div class="grid cards">${LD.ORIGENS.map((o) => `<article class="card static">
        <div class="card-title">${esc(o.nome)}</div><div class="italic paper-2">${esc(o.fonte)}</div>
        <details class="more"><summary>Forte e fraco</summary><div class="small"><b>Forte:</b> ${esc(o.vantagem)}</div><div class="small"><b>Paga:</b> ${esc(o.limite)}</div></details>
        <div class="card-foot"><span class="caps">${o.rola ? 'Rola o Potencial' : 'Não rola'}</span><span class="caps">Bônus: ${esc(o.bonus.fixo.concat(o.bonus.escolha ? [o.bonus.opcoes.length === 6 ? 'qualquer' : o.bonus.opcoes.join('/')] : []).join(' + '))}</span></div></article>`).join('')}</div>
        <details class="ref"><summary>Quem é forte contra quem</summary><table class="tbl"><thead><tr><th>Ataque de</th><th>Contra</th><th>Efeito</th></tr></thead><tbody>
        ${[['Magia (Arcano)', 'Proteção de Visitantes e Invulnerabilidade física', 'Ignora metade dessa Proteção.'], ['Místico', 'Criaturas sobrenaturais', 'Em Brecha.'], ['Elétrico e hack', 'Tecnologia', 'VIG (CD do poder) ou Desligado 1 rodada.'], ['Força bruta', 'Escudos mágicos e Campos de Força', 'O escudo absorve só metade.'], ['Luz', 'Sombra', 'Dano × 1,5.'], ['Sombra e escuridão total', 'Despertos', 'VON (CD do poder) ou Apagados 1 rodada.'], ['Qualquer coisa', 'Treinados', 'Normal.']].map((r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></details>`;
    } else if (a === 'potencial') {
      el.innerHTML = `<p class="paper-2">O bot rola <b>2d100 e fica com o maior</b>: três em cada quatro resultados passam de 50. Quem fica com a primeira rolagem ganha <b>Fé no Destino (+${LD.FE_NO_DESTINO} PT)</b>.</p>
        <table class="tbl"><thead><tr><th>Resultado</th><th>Potencial</th><th>Chance</th><th>PP</th><th>PT extra</th><th>Determinação</th><th>Preço</th></tr></thead><tbody>
        ${LD.FAIXAS.map((x) => `<tr><td>${String(x.min).padStart(2, '0')}–${x.max}</td><td>${x.emoji} <b>${esc(x.nome)}</b></td><td>${x.chance}</td><td>${x.pp}</td><td>${x.pt ? '+' + x.pt : '—'}</td><td>${x.det ? '+1' : '—'}</td><td class="small">${esc(x.preco || '—')}</td></tr>`).join('')}
        </tbody></table>
        <p class="muted small">Míticos: abaixo de 40 vira 40, acima de 94 vira 94. Visitantes: +15. Arcanos: +2 PT. Treinados (Ápice): 0 PP, +14 PT. Engenhosos (Oficina): 10 + INT × 2 PP de equipamento, +4 PT. Todo herói começa na Classe 1.</p>`;
    } else if (a === 'arquetipos') {
      el.innerHTML = `<div class="grid cards">${LD.ARQUETIPOS.filter((x) => x.key !== 'proprio').map((x) => `<article class="card static"><div class="card-title">${esc(x.nome)}</div><div class="italic paper-2">${esc(x.papel)}</div><div class="small">${esc(x.habilidade)}</div></article>`).join('')}</div>
        <p class="muted">Arquétipos próprios (O Fantasma, O Escudo do Povo, O Estrategista, O Rebelde, O Curandeiro…) com uma habilidade do mesmo tamanho, combinada com a mestragem.</p>`;
    } else if (a === 'pericias') {
      el.innerHTML = `<p class="paper-2">Cada grau custa 1 PT e dá +2 no teste. Grau máximo: 3 na criação (Treinados 4), +1 nos níveis 3 e 6. As marcadas com ★ mexem sozinhas na ficha.</p>
        ${LD.ATRIBUTOS.map((at) => `<div class="subsect"><span>${esc(at.nome)}</span></div>
          <div class="grid cards">${LD.PERICIAS.filter((p) => p.attr === at.key).map((p) => `<article class="card static">
            <div class="card-title">${esc(p.nome)}${p.efeito ? ' ★' : ''}</div><div class="small">${esc(p.desc)}</div>
            ${p.efeito ? `<div class="caption" style="margin:4px 0 0">${esc(p.efeito)}</div>` : ''}</article>`).join('')}</div>`).join('')}`;
    } else if (a === 'poder') {
      el.innerHTML = `<p class="paper-2">Um Estilo de Poder por herói, gratuito: dá a Assinatura (sempre ativa) e a Técnica (2 Energia). Despertos ganham a Assinatura de um segundo estilo.</p>
        <div class="grid cards">${LD.ESTILOS_PODER.map((e) => `<article class="card static">
          <div class="card-title">${esc(e.nome)}</div><div class="small">${esc(e.nucleo)}</div>
          <details class="more"><summary>Assinatura e Técnica</summary><div class="small"><b>Assinatura:</b> ${esc(e.assinatura)}</div><div class="small"><b>Técnica:</b> ${esc(e.tecnica)}</div></details></article>`).join('')}</div>`;
    } else if (a === 'tracos') {
      el.innerHTML = `<div class="grid two">
        <div><div class="subsect"><span>Qualidades</span></div><table class="tbl"><tbody>${LD.QUALIDADES.map((q) => `<tr><td><b>${esc(q.nome)}</b></td><td class="r">${q.custo} PT</td><td class="small">${esc(q.efeito)}</td></tr>`).join('')}</tbody></table></div>
        <div><div class="subsect"><span>Defeitos</span></div><table class="tbl"><tbody>${LD.DEFEITOS.map((q) => `<tr><td><b>${esc(q.nome)}</b></td><td class="r">+${q.custo} PT</td><td class="small">${esc(q.efeito)}</td></tr>`).join('')}</tbody></table>
        <div class="subsect"><span>Fraquezas</span></div><table class="tbl"><tbody>${LD.FRAQUEZAS.map((q) => `<tr><td><b>${esc(q.nome)}</b></td><td class="small">${esc(q.efeito)}</td></tr>`).join('')}</tbody></table></div></div>`;
    } else {
      el.innerHTML = `<p class="paper-2">Conjurar: 1d20 + atributo da Tradição + Ocultismo ≥ 10 + Grau × 2. Custa Energia igual ao Grau. Feitiço de Grau 1 (Dom: 2) é livre.</p>
        <div class="grid two">
          <div><div class="subsect"><span>Escolas</span></div><table class="tbl"><tbody>${LD.PODERES.filter((p) => p.escola).map((p) => `<tr><td><b>${esc(p.nome.replace(/^Escola (de |da |do )?/, ''))}</b></td><td class="r">${p.custo} PP/Grau</td><td class="small">${esc(p.efeito)}</td></tr>`).join('')}</tbody></table></div>
          <div><div class="subsect"><span>O Preço (1d6)</span></div><ol class="preco">${LD.PRECOS_MAGIA.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
        </div>
        <div class="subsect"><span>Tradições</span></div>
        <table class="tbl"><thead><tr><th>Tradição</th><th>Conjura com</th><th>Vantagem</th><th>Limite</th></tr></thead><tbody>
        ${LD.TRADICOES.map((t) => `<tr><td><b>${esc(t.nome)}</b></td><td>${t.attr} + ${t.pericia === 'ciencia' ? 'Ciência' : 'Ocultismo'}</td><td class="small">${esc(t.vantagem)}</td><td class="small">${esc(t.limite)}</td></tr>`).join('')}</tbody></table>`;
    }
    main.querySelectorAll('[data-aba]').forEach((b) => b.addEventListener('click', () => { st.aba = b.dataset.aba; render(main); }));
  }

  LD.views.referencia = { titulo: 'Referência', numeral: 'IV', render };
})();
