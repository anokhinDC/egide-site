/*
 * Égide · Arsenal
 * O catálogo de equipamento, com preço em dólares (US$). Comprar desconta do saldo da ficha.
 * A Nova Égide pega de graça o que está no Arsenal do Observatório. Itens especiais só a mestragem dá.
 */
(function () {
  const LD = window.LD;
  const { esc, sinal, field, select, checkbox } = LD.ui;
  const R = LD.rules;
  const num = R.num;
  const st = { cat: '', busca: '', fichaId: '' };

  function minhasFichas() {
    const meu = LD.store.uid();
    return LD.store.list('personagens').filter((x) => LD.store.state.local || LD.store.isMaster() || x.ownerId === meu)
      .slice().sort((a, b) => (a.codinome || a.nome || '').localeCompare(b.codinome || b.nome || ''));
  }

  // Como esta ficha consegue este item.
  function situacao(item, f, c) {
    const preco = num(item.preco);
    if (item.especial) return { k: 'especial', txt: 'Só a mestragem dá', cls: 'warn' };
    if (!f) return { k: 'sem', txt: R.fmtUS(preco), cls: '' };
    if (item.observatorio && f.novaEgide) return { k: 'gratis', txt: 'Grátis no Observatório', cls: 'ok' };
    if (preco <= c.dinheiro) return { k: 'paga', txt: 'Dá para comprar', cls: 'ok' };
    return { k: 'longe', txt: `Faltam ${R.fmtUS(preco - c.dinheiro)}`, cls: 'bad' };
  }

  function entradaDe(item, origem) {
    return {
      uid: LD.store.newId('iv'), itemId: item.id, nome: item.nome, cat: item.cat, dano: item.dano || '', potencia: num(item.potencia),
      protecao: num(item.protecao), defesa: num(item.defesa), cargas: num(item.cargas), cargasMax: num(item.cargas),
      pericia: item.pericia || '', dadosBase: item.dadosBase || '', dadosExtra: item.dadosExtra || '', bonusFixo: num(item.bonusFixo),
      propriedades: item.propriedades || '', origem, preco: num(item.preco), equipado: false
    };
  }

  function lancar(x, valor, motivo) {
    x.extrato = (x.extrato || []).concat({ quando: Date.now(), valor, motivo }).slice(-80);
  }

  function entregar(fichaId, item, origem, resultado, preco) {
    return LD.fichas.mudar(fichaId, (x) => {
      if (item.kit) {
        const k = x.kits[item.kit] || (x.kits[item.kit] = { atual: 0, max: 0 });
        k.atual += 1; k.max = Math.max(k.max, k.atual);
      } else if (item.cat !== 'servico') {
        x.inventario.push(entradaDe(item, origem));
      }
      if (preco) { x.gastoTotal = num(x.gastoTotal) + preco; lancar(x, -preco, item.nome); }
      x.compras.push({ quando: Date.now(), item: item.nome, resultado });
      x.compras = x.compras.slice(-60);
    }).then(() => LD.ui.toast(`${item.nome}: ${resultado}`));
  }

  function comprar(item, fichaId) {
    const f = LD.fichas.ficha(fichaId);
    if (!f) return;
    const c = R.calc(f);
    const s = situacao(item, f, c);
    const preco = num(item.preco);
    if (s.k === 'gratis') return entregar(fichaId, item, 'observatorio', 'Arsenal do Observatório');
    if (s.k === 'paga') return entregar(fichaId, item, 'compra', `pago ${R.fmtUS(preco)}`, preco);
    LD.ui.toast(s.k === 'especial' ? 'Só a mestragem dá este item.' : `Saldo insuficiente: ${s.txt}.`, 'erro');
  }

  function editarItem(item) {
    const novo = !item;
    const it = item ? JSON.parse(JSON.stringify(item)) : { cat: 'gadget', nome: '', preco: 100, observatorio: false, especial: false };
    LD.ui.openDrawer({
      eyebrow: 'Arsenal', title: novo ? 'Novo item' : 'Editar item',
      body: `${field('Nome', `<input name="nome" class="big" value="${esc(it.nome)}">`)}
        <div class="row">
          ${field('Categoria', select('cat', LD.CATEGORIAS.map((x) => ({ key: x.key, nome: x.nome })), it.cat))}
          ${field('Preço (US$)', `<input name="preco" type="number" min="0" step="10" value="${esc(it.preco || 0)}">`)}
          ${field('Cargas', `<input name="cargas" type="number" min="0" max="20" value="${esc(it.cargas || '')}">`)}
        </div>
        <div class="row">
          ${field('Perícia (armas)', select('pericia', [{ key: '', nome: '—' }, { key: 'luta', nome: 'Luta' }, { key: 'laminas', nome: 'Lâminas' }, { key: 'pontaria', nome: 'Pontaria' }], it.pericia || ''))}
          ${field('Dados (à distância: o dano; corpo a corpo: o extra)', `<input name="dados" value="${esc(it.dadosBase || it.dadosExtra || '')}" placeholder="2d6">`)}
          ${field('Texto do dano', `<input name="dano" value="${esc(it.dano || '')}" placeholder="Lâminas + 1d6">`)}
          ${field('Potência', `<input name="potencia" type="number" min="0" max="30" value="${esc(it.potencia || '')}">`)}
          ${field('Proteção', `<input name="protecao" type="number" min="0" max="30" value="${esc(it.protecao || '')}">`)}
          ${field('Defesa', `<input name="defesa" type="number" min="-5" max="5" value="${esc(it.defesa || '')}">`)}
        </div>
        ${field('Kit (cargas de Kit)', select('kit', [{ key: '', nome: '—' }].concat(LD.KITS.map((k) => ({ key: k.key, nome: k.nome }))), it.kit || ''))}
        ${field('Propriedades', `<textarea name="propriedades">${esc(it.propriedades || '')}</textarea>`)}
        ${checkbox('observatorio', it.observatorio, 'Arsenal do Observatório (grátis para a Nova Égide)')}
        ${checkbox('especial', it.especial, 'Especial: só a mestragem dá')}`,
      foot: `${novo ? '' : '<button class="btn danger plain" data-rm>Apagar</button>'}<button class="btn-primary" data-ok>Salvar</button>`,
      onMount: (d) => {
        d.querySelector('[data-ok]').addEventListener('click', () => {
          const v = LD.ui.readForm(d.querySelector('.drawer-body'));
          if (!v.nome) { LD.ui.toast('Dê um nome.', 'erro'); return; }
          v.preco = num(v.preco);
          if (v.pericia === 'pontaria') { v.dadosBase = v.dados; v.dadosExtra = ''; } else { v.dadosExtra = v.dados; v.dadosBase = ''; }
          delete v.dados;
          ['cargas', 'potencia', 'protecao', 'defesa'].forEach((k) => { v[k] = num(v[k]); });
          LD.store.save('itens', Object.assign(it, v)).then(() => LD.ui.closeDrawer());
        });
        const rm = d.querySelector('[data-rm]');
        if (rm) rm.addEventListener('click', () => { if (LD.ui.confirmar('Apagar o item do catálogo?')) LD.store.remove('itens', it.id).then(() => LD.ui.closeDrawer()); });
      }
    });
  }

  function darItem(item) {
    const fichas = LD.store.list('personagens');
    LD.ui.openDrawer({
      eyebrow: 'Mestragem', title: `Dar ${item.nome}`,
      body: fichas.map((x) => `<button class="pick" data-f="${esc(x.id)}"><b>${esc(x.codinome || x.nome || 'Herói')}</b><span class="muted small">${esc(x.ownerName || '')}</span></button>`).join('') || '<div class="empty">Sem fichas.</div>',
      onMount: (d) => d.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => { entregar(b.dataset.f, item, 'mestre', 'dado pela mestragem'); LD.ui.closeDrawer(); }))
    });
  }

  function render(main, param) {
    if (param) st.fichaId = param;
    const fichas = minhasFichas();
    if (!fichas.find((x) => x.id === st.fichaId)) st.fichaId = fichas[0] ? fichas[0].id : '';
    const f = st.fichaId ? LD.fichas.ficha(st.fichaId) : null;
    const c = f ? R.calc(f) : null;
    const mestre = LD.store.isMaster();
    const busca = st.busca.toLowerCase();
    const itens = LD.store.list('itens').filter((i) => (!st.cat || i.cat === st.cat) && (!busca || (i.nome + ' ' + (i.propriedades || '')).toLowerCase().includes(busca)) && (mestre || !i.especial || st.cat === 'especial'))
      .slice().sort((a, b) => num(a.preco) - num(b.preco) || a.nome.localeCompare(b.nome));

    main.innerHTML = `
      <div class="page-head">
        <div><div class="eyebrow">Equipamento e Itens</div><h1>Arsenal</h1>
          <p class="lead">Tudo tem preço em dólares. Comprar desconta do saldo da ficha. Quem é da Nova Égide pega de graça o que está no Observatório.</p></div>
        ${mestre ? '<button class="btn-primary" data-novo>＋ Novo item</button>' : ''}
      </div>
      ${fichas.length ? `<div class="buyer panel">
        <label class="inline">Comprando para ${select('ficha', fichas.map((x) => ({ key: x.id, nome: x.codinome || x.nome || 'Herói' })), st.fichaId, 'data-ficha')}</label>
        ${c ? `<span class="buyer-r"><span class="caps">Saldo</span><b>${esc(R.fmtUS(c.dinheiro))}</b></span>
          <span class="tag ${f.novaEgide ? 'ok' : ''}">${f.novaEgide ? 'Nova Égide: Observatório grátis' : 'Fora da Nova Égide'}</span>
          <a class="btn plain" href="#/ficha/${esc(f.id)}">Abrir a ficha</a>` : ''}
      </div>` : '<div class="empty small-empty">Crie uma ficha para comprar. <a href="#/fichas">Fichas</a></div>'}
      <div class="toolbar">
        <div class="search"><span>⌕</span><input data-busca placeholder="Procurar" value="${esc(st.busca)}"></div>
        <div class="chips"><button class="chip ${!st.cat ? 'on' : ''}" data-cat="">Tudo</button>${LD.CATEGORIAS.map((x) => `<button class="chip ${st.cat === x.key ? 'on' : ''}" data-cat="${x.key}">${esc(x.nome)}</button>`).join('')}</div>
      </div>
      ${!LD.store.list('itens').length ? `<div class="empty">O catálogo está vazio.${mestre ? ' <button class="btn" data-semear>Carregar o catálogo inicial</button>' : ' A mestragem precisa carregar o catálogo na Oficina.'}</div>` : ''}
      <div class="grid cards">${itens.map((i) => {
        const s = situacao(i, f, c);
        const stats = [i.dano ? `Dano ${i.dano}` : '', i.potencia ? `Potência ${i.potencia}` : '', i.protecao ? `Proteção ${i.protecao}` : '', i.defesa ? `Defesa ${sinal(num(i.defesa))}` : '', i.cargas ? `${i.cargas} carga${i.cargas > 1 ? 's' : ''}` : ''].filter(Boolean);
        return `<article class="card item ${s.k}">
          <div class="card-title">${esc(i.nome)}</div>
          <div class="card-meta"><span class="preco">${i.especial ? '—' : esc(R.fmtUS(i.preco))}</span><span class="tag ${s.cls}">${esc(s.txt)}</span></div>
          ${stats.length || i.propriedades ? `<details class="more"><summary>Detalhes</summary>${stats.length ? `<div class="small"><b>${stats.map(esc).join(' · ')}</b></div>` : ''}<div class="small">${esc(i.propriedades || '')}</div></details>` : ''}
          <div class="buy-row">
            ${f && s.k === 'gratis' ? `<button class="btn" data-comprar="${esc(i.id)}">Pegar</button>` : ''}
            ${f && s.k === 'paga' ? `<button class="btn" data-comprar="${esc(i.id)}">Comprar (${esc(R.fmtUS(i.preco))})</button>` : ''}
            ${mestre ? `<button class="btn plain" data-dar="${esc(i.id)}">Dar</button><button class="btn plain" data-edit="${esc(i.id)}">Editar</button>` : ''}
          </div>
        </article>`;
      }).join('')}</div>`;

    const fs = main.querySelector('[data-ficha]');
    if (fs) fs.addEventListener('change', () => { st.fichaId = fs.value; location.hash = '#/arsenal/' + fs.value; });
    main.querySelector('[data-busca]').addEventListener('input', LD.ui.debounce((e) => { st.busca = e.target.value; render(main); const i = main.querySelector('[data-busca]'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250));
    main.querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => { st.cat = b.dataset.cat; render(main); }));
    main.querySelectorAll('[data-comprar]').forEach((b) => b.addEventListener('click', () => comprar(LD.store.get('itens', b.dataset.comprar), st.fichaId)));
    main.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => editarItem(LD.store.get('itens', b.dataset.edit))));
    main.querySelectorAll('[data-dar]').forEach((b) => b.addEventListener('click', () => darItem(LD.store.get('itens', b.dataset.dar))));
    const nv = main.querySelector('[data-novo]'); if (nv) nv.addEventListener('click', () => editarItem(null));
    const se = main.querySelector('[data-semear]'); if (se) se.addEventListener('click', () => LD.store.semear().then((n) => LD.ui.toast(`${n} itens carregados.`)));
  }

  LD.arsenal = { comprar, situacao };
  LD.views.arsenal = { titulo: 'Arsenal', numeral: 'III', render };
})();
