/*
 * Égide · Oficina: calculadora de combate, painel da mesa (mestragem), catálogo e cópia de segurança.
 */
(function () {
  const LD = window.LD;
  const { esc, sinal, field, select, checkbox } = LD.ui;
  const R = LD.rules;
  const num = R.num;
  const st = { bonus: 7, defesa: 15, dano: '3d6+12', vig: 3, protecao: 0, brecha: false, tipo: 'normal', resultado: null };

  const TIPOS = [{ key: 'normal', nome: 'Normal' }, { key: 'vulneravel', nome: 'Vulnerável (× 1,5)' }, { key: 'res5', nome: 'Resistente (−5)' }, { key: 'metade', nome: 'Resistente (metade)' }, { key: 'imune', nome: 'Imune' }];

  function aplicarTipo(d, tipo) {
    if (tipo === 'vulneravel') return Math.floor(d * 1.5);
    if (tipo === 'res5') return Math.max(0, d - 5);
    if (tipo === 'metade') return Math.floor(d / 2);
    if (tipo === 'imune') return 0;
    return d;
  }

  function render(main) {
    const mestre = LD.store.isMaster();
    const fichas = LD.store.list('personagens').map((x) => LD.fichas.normalizar(JSON.parse(JSON.stringify(x))));
    main.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Ferramentas</div><h1>Oficina</h1></div></div>

      <div class="grid two">
        <section class="panel framed">
          <h3>Ataque e dano</h3>
          <div class="row">
            ${field('Bônus de ataque', `<input type="number" name="bonus" value="${st.bonus}">`)}
            ${field('Defesa do alvo', `<input type="number" name="defesa" value="${st.defesa}">`)}
            ${field('Dano', `<input name="dano" value="${esc(st.dano)}" placeholder="3d6+12">`)}
          </div>
          <div class="row">
            ${field('VIG do alvo', `<input type="number" name="vig" value="${st.vig}">`)}
            ${field('Proteção do alvo', `<input type="number" name="protecao" value="${st.protecao}">`)}
            ${field('Tipo de dano no alvo', select('tipo', TIPOS, st.tipo))}
          </div>
          ${checkbox('brecha', st.brecha, 'Em Brecha (ignora a Proteção)')}
          <div class="btn-row"><button class="btn-primary" data-atacar>⚄ Atacar</button><button class="btn" data-so-dano>Só o dano</button><button class="btn plain" data-crit>Dano crítico</button></div>
          <div data-res class="calc-out">${st.resultado || '<span class="muted italic">Resistência = VIG + Proteção. Em Brecha, só o VIG.</span>'}</div>
        </section>
        <section class="panel framed">
          <h3>Teste</h3>
          <div class="row">
            ${field('Bônus', '<input type="number" name="tb" value="5">')}
            ${field('Dificuldade', select('tcd', LD.CDS.map((x) => ({ key: x.key, nome: `${x.nome} (${x.key})` })), 15))}
            ${field('Modo', select('tm', [{ key: 'normal', nome: 'Normal' }, { key: 'vantagem', nome: 'Vantagem' }, { key: 'desvantagem', nome: 'Desvantagem' }], 'normal'))}
          </div>
          <div class="btn-row"><button class="btn-primary" data-teste>⚄ Rolar</button><button class="btn" data-d6>1d6 (o Preço)</button><button class="btn plain" data-pot>2d100 (Potencial)</button></div>
          <p class="muted small">20 natural: sucesso e algo a mais (crítico em ataque). 1 natural: falha e uma complicação. Empate com a CD é sucesso.</p>
        </section>
      </div>

      ${mestre ? `
        <div class="subsect"><span>A mesa</span></div>
        ${fichas.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Herói</th><th>Jogador</th><th>Origem</th><th>Potencial</th><th class="r">Classe</th><th class="r">PV</th><th class="r">Def</th><th class="r">Res</th><th class="r">Energia</th><th class="r">PT</th><th class="r">PP</th><th>Status</th></tr></thead><tbody>
          ${fichas.sort((a, b) => LD.fichas.titulo(a).localeCompare(LD.fichas.titulo(b))).map((f) => { const c = R.calc(f); const p = c.avisos.filter((x) => !x.leve).length; return `<tr>
            <td><a href="#/ficha/${esc(f.id)}">${esc(LD.fichas.titulo(f))}</a></td><td class="muted">${esc(f.ownerName || '')}</td>
            <td>${esc((LD.byKey(LD.ORIGENS, f.origem) || {}).nome || '—')}</td><td>${esc(c.pot.nome)}${f.potencial.resultado ? ` <span class="muted">(${esc(f.potencial.resultado)})</span>` : ''}</td>
            <td class="r">${esc(c.rotuloClasse)}</td><td class="r">${f.medidores.pv}/${c.pvMax}</td><td class="r">${c.defesa}</td><td class="r">${c.resistencia}</td><td class="r">${f.medidores.energia}/${c.energiaMax}</td>
            <td class="r ${c.ptLivres < 0 ? 'bad' : ''}">${c.ptGastos}/${c.ptTotal}</td><td class="r ${c.ppLivres < 0 ? 'bad' : ''}">${c.ppGastos}/${c.ppTotal}</td>
            <td>${f.aprovada ? '<span class="tag ok">Aprovada</span>' : p ? `<span class="tag warn">${p} pendência${p > 1 ? 's' : ''}</span>` : `<button class="btn plain" data-aprovar="${esc(f.id)}">Aprovar</button>`}</td></tr>`; }).join('')}
          </tbody></table></div>
          <div class="btn-row"><button class="btn" data-sessao>Nova sessão para todos (Determinação cheia)</button></div>` : '<div class="empty small-empty">Nenhuma ficha ainda.</div>'}

        <div class="subsect"><span>Catálogo e cópia de segurança</span></div>
        <div class="btn-row">
          <button class="btn" data-semear>Carregar o catálogo inicial do Arsenal</button>
          <button class="btn" data-exportar>Exportar tudo (JSON)</button>
          <label class="btn" style="cursor:pointer">Importar JSON<input type="file" accept=".json,application/json" data-importar hidden></label>
        </div>
        <p class="muted small">Recarregar não duplica itens.</p>` : ''}`;

    const ler = () => {
      const v = LD.ui.readForm(main.querySelector('.grid.two section'));
      Object.assign(st, { bonus: num(v.bonus), defesa: num(v.defesa), dano: v.dano, vig: num(v.vig), protecao: num(v.protecao), tipo: v.tipo, brecha: !!v.brecha });
    };
    const dano = (crit) => {
      const r = LD.ui.rolarDano('Dano', st.dano, crit);
      if (!r) return null;
      const res = st.brecha ? st.vig : st.vig + st.protecao;
      const liquido = aplicarTipo(Math.max(0, r.total - res), st.tipo);
      return { r, res, liquido };
    };
    const mostrar = (html) => { st.resultado = html; main.querySelector('[data-res]').innerHTML = html; };
    main.querySelector('[data-atacar]').addEventListener('click', () => {
      ler();
      const a = LD.ui.rolarTeste('Ataque', st.bonus, { cd: st.defesa });
      if (!a.passou) { mostrar(`<div class="big">Errou</div><div class="muted">${a.total} contra Defesa ${st.defesa}</div>`); return; }
      const d = dano(a.natural === 20);
      if (d) mostrar(`<div class="big">${d.liquido}</div><div class="muted">${a.natural === 20 ? 'Crítico! ' : ''}Acertou (${a.total} contra ${st.defesa}). Dano ${d.r.total} − Resistência ${d.res}${st.tipo !== 'normal' ? ' · ' + esc((LD.byKey(TIPOS, st.tipo) || {}).nome) : ''}</div>`);
    });
    main.querySelector('[data-so-dano]').addEventListener('click', () => { ler(); const d = dano(false); if (d) mostrar(`<div class="big">${d.liquido}</div><div class="muted">Dano ${d.r.total} − Resistência ${d.res}</div>`); });
    main.querySelector('[data-crit]').addEventListener('click', () => { ler(); const d = dano(true); if (d) mostrar(`<div class="big">${d.liquido}</div><div class="muted">Crítico: ${d.r.total} − Resistência ${d.res}</div>`); });
    main.querySelector('[data-teste]').addEventListener('click', () => {
      const v = LD.ui.readForm(main.querySelectorAll('.grid.two section')[1]);
      LD.ui.rolarTeste('Teste', num(v.tb), { cd: num(v.tcd), modo: v.tm });
    });
    main.querySelector('[data-d6]').addEventListener('click', () => { const n = 1 + Math.floor(Math.random() * 6); LD.ui.registrarRolagem({ titulo: 'O Preço (1d6)', total: n, detalhe: LD.PRECOS_MAGIA[n - 1] }); });
    main.querySelector('[data-pot]').addEventListener('click', () => { const a = 1 + Math.floor(Math.random() * 100), b = 1 + Math.floor(Math.random() * 100); const fx = R.faixaDe(Math.max(a, b)); LD.ui.registrarRolagem({ titulo: 'Potencial (teste)', total: Math.max(a, b), detalhe: `2d100 [${a}, ${b}] · ${fx.emoji} ${fx.nome}` }); });

    if (!mestre) return;
    main.querySelectorAll('[data-aprovar]').forEach((b) => b.addEventListener('click', () => LD.fichas.mudar(b.dataset.aprovar, (x) => { x.inicialFixo = R.dinheiroInicial(x); x.aprovada = true; })));
    const ses = main.querySelector('[data-sessao]');
    if (ses) ses.addEventListener('click', () => {
      if (!LD.ui.confirmar('Encher a Determinação de todas as fichas?')) return;
      LD.store.list('personagens').forEach((x) => LD.fichas.mudar(x.id, (f) => { const c = R.calc(f); f.medidores.det = c.detMax; f.medidores.aindaDePe = false; f.medidores.reservaUsada = false; }));
      LD.ui.toast('Nova sessão.');
    });
    main.querySelector('[data-semear]').addEventListener('click', () => LD.store.semear().then((n) => LD.ui.toast(`${n} itens carregados.`)));
    main.querySelector('[data-exportar]').addEventListener('click', () => LD.ui.baixar(`egide-${new Date().toISOString().slice(0, 10)}.json`, LD.store.exportar()));
    main.querySelector('[data-importar]').addEventListener('change', (e) => {
      const file = e.target.files[0]; if (!file) return;
      file.text().then((t) => LD.store.importar(t)).then((r) => LD.ui.toast(`${r.filter((x) => x.status === 'fulfilled').length} registros importados.`)).catch((err) => LD.ui.toast('Arquivo inválido: ' + err.message, 'erro'));
    });
  }

  LD.views.oficina = { titulo: 'Oficina', numeral: 'V', render };
})();
