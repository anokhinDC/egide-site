/*
 * Égide · Fichas
 * Lista, criação passo a passo (com orçamento de PT, PP e Atributos ao lado), ficha de jogo,
 * inventário e história.
 */
(function () {
  const LD = window.LD;
  const { keep, esc, sinal, field, input, textarea, select, checkbox, stepper, bindSteppers, pips, classeTag } = LD.ui;
  const R = LD.rules;
  const num = R.num;

  const PASSOS = [
    { key: 'conceito', nome: 'Conceito' },
    { key: 'origem', nome: 'Origem e Potencial' },
    { key: 'atributos', nome: 'Atributos' },
    { key: 'poderes', nome: 'Poderes' },
    { key: 'treino', nome: 'Perícias' },
    { key: 'tracos', nome: 'Traços e Fraquezas' },
    { key: 'civil', nome: 'Vida civil' }
  ];
  const MORADIAS = ['Bairro Jardim, Lúmen', 'Avenida das Nações, Lúmen', 'Vila Esperança, Lúmen', 'Morro do Sino, Vésper', 'Distrito Velho, Vésper', 'O Observatório'];

  const st = { filtro: 'minhas', aba: {}, passo: {}, modo: 'normal', cd: '', alvoDef: '' };

  /* ---------- Modelo ---------- */
  function normalizar(f) {
    const d = {
      nome: '', codinome: '', conceito: '', simbolo: '', retrato: '', alinhamento: 'heroi', nivel: 1,
      origem: '', origem2: '', origemBonus: [], aumentos: [], atributos: {}, potencial: { resultado: '', rolagens: 1 }, feNoDestino: true,
      arquetipo: '', arquetipoProprio: { nome: '', habilidade: '' }, estiloPoder: '', assinatura2: '', tradicao: '',
      poderes: [], grimorio: [], pericias: {}, estilos: {}, qualidades: [], defeitos: [], fraquezas: [],
      recursos: 1, recursosOpcao: '', creditos: 0, gastoTotal: 0, salario: 0, semanaSalario: '', extrato: [], inicialFixo: null, vidaCivil: { emprego: '', mora: '', identidadeSecreta: true, quemSabe: '' },
      perda: '', historia: '', aparencia: '', notas: '', inventario: [], kits: null, novaEgide: true,
      medidores: null, compras: [], bonus: { pt: 0, pp: 0, det: 0 }, ptTreino: 0, ascensao: 0, bonusPV: 0, aprovada: false
    };
    Object.keys(d).forEach((k) => { if (f[k] === undefined || f[k] === null) f[k] = JSON.parse(JSON.stringify(d[k])); });
    f.vidaCivil = Object.assign({}, d.vidaCivil, f.vidaCivil);
    f.bonus = Object.assign({ pt: 0, pp: 0, det: 0 }, f.bonus);
    f.potencial = Object.assign({ resultado: '', rolagens: 1 }, f.potencial);
    if (!f.kits) f.kits = Object.fromEntries(LD.KITS.map((k) => [k.key, { atual: LD.KITS_PADRAO[k.key], max: LD.KITS_PADRAO[k.key] }]));
    const c = R.calc(f);
    if (f.kits.pulso && !f.kits.energia) { f.kits.energia = f.kits.pulso; delete f.kits.pulso; }
    if (!f.kits.energia) f.kits.energia = { atual: LD.KITS_PADRAO.energia, max: LD.KITS_PADRAO.energia };
    if (!f.medidores) f.medidores = { pv: c.pvMax, energia: c.energiaMax, det: c.detMax, fadiga: 0, sussurro: 0, condicoes: [] };
    if (f.medidores.energia === undefined) f.medidores.energia = f.medidores.pulso !== undefined ? f.medidores.pulso : c.energiaMax;
    const m = f.medidores;
    m.condicoes = m.condicoes || [];
    m.pv = R.clamp(num(m.pv, c.pvMax), -c.pvMax, c.pvMax);
    m.energia = R.clamp(num(m.energia, c.energiaMax), 0, c.energiaMax);
    m.det = R.clamp(num(m.det, c.detMax), 0, Math.max(5, c.detMax));
    return f;
  }
  const clone = (x) => JSON.parse(JSON.stringify(x));
  function ficha(id) { const f = LD.store.get('personagens', id); return f ? normalizar(clone(f)) : null; }
  function mudar(id, fn) {
    const f = ficha(id);
    if (!f) return Promise.resolve();
    fn(f);
    return LD.store.save('personagens', f);
  }
  function podeEditar(f) { return LD.store.canEdit('personagens', LD.store.get('personagens', f.id)); }
  function travado(f) { return f.aprovada && !LD.store.isMaster(); }
  const titulo = (f) => f.codinome || f.nome || 'Herói sem nome';

  function novaFicha() {
    const f = normalizar({ nome: '', codinome: '' });
    f.medidores = null;
    LD.store.save('personagens', normalizar(f)).then((s) => {
      st.aba[s.id] = 'construcao'; st.passo[s.id] = 'conceito';
      location.hash = '#/ficha/' + s.id;
    });
  }

  /* =====================================================================
   * Lista
   * ===================================================================== */
  function renderLista(main) {
    const todos = LD.store.list('personagens').map((x) => normalizar(clone(x)));
    const meu = LD.store.uid();
    const lista = (st.filtro === 'minhas' && !LD.store.state.local ? todos.filter((x) => x.ownerId === meu) : todos)
      .sort((a, b) => titulo(a).localeCompare(titulo(b)));
    main.innerHTML = `
      <div class="page-head">
        <div>
          <div class="eyebrow">Os heróis de Aldória</div>
          <h1>Fichas</h1>
          <p class="lead">Crie seu herói em 7 passos. O site faz as contas e avisa o que falta. Na hora de jogar, é só clicar para rolar.</p>
        </div>
        <button class="btn-primary" data-novo>＋ Novo herói</button>
      </div>
      ${LD.store.state.local ? '' : `<div class="chips" style="margin-bottom:22px">
        <button class="chip ${st.filtro === 'minhas' ? 'on' : ''}" data-f="minhas">Minhas</button>
        <button class="chip ${st.filtro === 'todas' ? 'on' : ''}" data-f="todas">Todas</button></div>`}
      ${lista.length ? `<div class="grid cards">${lista.map(cardFicha).join('')}</div>`
        : `<div class="empty">Nenhum herói ainda.<br><button class="btn" data-novo style="margin-top:14px">Criar o primeiro</button></div>`}`;
    main.querySelectorAll('[data-novo]').forEach((b) => b.addEventListener('click', novaFicha));
    main.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => { st.filtro = b.dataset.f; renderLista(main); }));
    main.querySelectorAll('[data-abrir]').forEach((b) => b.addEventListener('click', () => { location.hash = '#/ficha/' + b.dataset.abrir; }));
  }

  function cardFicha(f) {
    const c = R.calc(f);
    const o = LD.byKey(LD.ORIGENS, f.origem);
    const pend = c.avisos.filter((a) => !a.leve).length;
    return `<article class="card hero-card" data-abrir="${esc(f.id)}" tabindex="0">
      <div class="hc-band"></div>
      <div class="hc-top">
        <div class="hc-sym">${f.retrato ? `<img src="${esc(f.retrato)}" alt="">` : esc(f.simbolo || (titulo(f)[0] || '?'))}</div>
        <div>
          <div class="card-title">${esc(titulo(f))}</div>
          <div class="muted small">${esc(o ? o.nome : 'Sem Origem')} · ${esc(c.rotuloClasse)}</div>
        </div>
      </div>
      <div class="card-foot">
        ${classeTag(c.classe)}
        ${f.aprovada ? '<span class="tag ok">✓ Aprovada</span>' : pend ? `<span class="tag warn">Falta ${pend}</span>` : '<span class="tag gold">Pronta</span>'}
      </div>
    </article>`;
  }

  /* =====================================================================
   * Ficha
   * ===================================================================== */
  function renderFicha(main, id) {
    const f = ficha(id);
    if (!f) { main.innerHTML = '<div class="empty">Ficha não encontrada. <a href="#/fichas">Voltar</a></div>'; return; }
    const c = R.calc(f);
    const editar = podeEditar(f);
    if (!st.aba[id]) st.aba[id] = c.avisos.some((a) => !a.leve) && editar && !f.aprovada ? 'construcao' : 'jogar';
    const aba = st.aba[id];
    const o = LD.byKey(LD.ORIGENS, f.origem);
    const arq = LD.byKey(LD.ARQUETIPOS, f.arquetipo);

    main.innerHTML = `
      <a href="#/fichas" class="back">← Fichas</a>
      <header class="char-head">
        <div class="portrait">${f.retrato ? `<img src="${esc(f.retrato)}" alt="">` : `<span class="initial">${esc(f.simbolo || (titulo(f)[0] || '?'))}</span>`}
          <div class="lvl">${f.origem === 'treinado' ? 'Ápice' : 'Classe'} <b>${R.fmtClasse(c.classeDegrau)}</b></div></div>
        <div class="ch-main">
          <div class="eyebrow">${esc(o ? o.nome : 'Sem Origem')}${arq ? ' · ' + esc(f.arquetipo === 'proprio' ? f.arquetipoProprio.nome || 'Arquétipo próprio' : arq.nome) : ''}</div>
          <h1>${esc(titulo(f))}</h1>
          <div class="ch-sub">${esc([f.codinome && f.nome ? f.nome : '', f.conceito || ''].filter(Boolean).join(' · '))}</div>
          ${(() => { const pv = f.medidores.pv, pct = Math.max(0, Math.min(100, pv / c.pvMax * 100)); const [est, cl] = estadoSaude(pv, c.pvMax); return `
          <div class="hp-head" title="${est}"><span class="hp-l">PV</span><div class="bar hp ${pct <= 25 ? 'low' : pct <= 50 ? 'mid' : ''}"><i style="width:${pct}%"></i></div><b>${pv}<small>/${c.pvMax}</small></b><span class="tag ${cl}">${est}</span></div>`; })()}
          <div class="card-meta" style="margin-top:14px">
            ${c.pot.rolou || ['treinado', 'engenhoso'].includes(f.origem) ? `<span class="tag gold">${esc(c.pot.emoji || '◆')} ${esc(c.pot.nome)}</span>` : '<span class="tag warn">Potencial pendente</span>'}
            <span class="tag classe c${Math.floor(c.classeDegrau)}">Degrau ${c.degrau} de 10</span>
            ${f.aprovada ? '<span class="tag ok">✓ Aprovada</span>' : ''}
          </div>
          <div class="ch-actions">
            <button class="btn" data-bot>Comandos do bot</button>
            ${LD.store.isMaster() ? `<button class="btn" data-aprovar>${f.aprovada ? 'Tirar aprovação' : 'Aprovar ficha'}</button>` : ''}
            ${editar ? '<details class="more" style="margin:0"><summary>Mais</summary><button class="btn plain" data-dup>Duplicar</button> <button class="btn plain danger" data-apagar>Apagar</button></details>' : ''}
          </div>
        </div>
      </header>
      <nav class="tabs">
        ${[['jogar', 'Jogar'], ['construcao', 'Construção'], ['treino', 'Treino'], ['inventario', 'Inventário'], ['historia', 'História']].map(([k, n]) =>
          `<button class="${aba === k ? 'on' : ''}" data-aba="${k}">${n}${k === 'construcao' && c.avisos.filter((a) => !a.leve).length ? ` <sup class="badge">${c.avisos.filter((a) => !a.leve).length}</sup>` : ''}</button>`).join('')}
      </nav>
      <section data-corpo></section>`;

    const corpo = main.querySelector('[data-corpo]');
    if (aba === 'jogar') renderJogar(corpo, f, c, editar);
    else if (aba === 'construcao') renderConstrucao(corpo, f, c, editar);
    else if (aba === 'treino') renderTreino(corpo, f, c, editar);
    else if (aba === 'inventario') renderInventario(corpo, f, c, editar);
    else renderHistoria(corpo, f, c, editar);

    main.querySelectorAll('[data-aba]').forEach((b) => b.addEventListener('click', () => { st.aba[id] = b.dataset.aba; renderFicha(main, id); }));
    main.querySelector('[data-bot]').addEventListener('click', () => abrirComandos(f));
    const ap = main.querySelector('[data-aprovar]');
    if (ap) ap.addEventListener('click', () => mudar(id, (x) => {
      if (!x.aprovada) { x.inicialFixo = R.dinheiroInicial(x); x.aprovada = true; } else { x.aprovada = false; }
    }));
    const dup = main.querySelector('[data-dup]');
    if (dup) dup.addEventListener('click', () => {
      const novo = clone(f); delete novo.id; delete novo.ownerId; delete novo.ownerName; novo.aprovada = false; novo.codinome = (novo.codinome || novo.nome) + ' (cópia)';
      if (!LD.store.isMaster()) Object.assign(novo, { nivel: 1, bonus: { pt: 0, pp: 0, det: 0 }, ptTreino: 0, ascensao: 0, bonusPV: 0, treino: {}, creditos: 0, gastoTotal: 0, salario: 0, semanaSalario: '', extrato: [], inicialFixo: null });
      LD.store.save('personagens', novo).then((s) => { location.hash = '#/ficha/' + s.id; });
    });
    const apg = main.querySelector('[data-apagar]');
    if (apg) apg.addEventListener('click', () => {
      if (LD.ui.confirmar(`Apagar ${titulo(f)}? Não tem volta.`)) LD.store.remove('personagens', id).then(() => { location.hash = '#/fichas'; });
    });
  }

  function abrirComandos(f) {
    const linhas = R.comandosBot(f);
    LD.ui.openDrawer({
      eyebrow: 'Discord', title: 'Comandos do bot',
      body: `<p class="paper-2">Depois de <code>!egide-ficha-criar ${esc(titulo(f))}</code>, cole estes comandos no canal do bot, um por mensagem. Eles deixam a ficha de jogo do Discord com os mesmos números do site.</p>
        <pre class="code" data-cmd>${esc(linhas.join('\n'))}</pre>
        <p class="muted small">PT e PP extras (Traços, treino, bônus) a mestragem acerta com <code>!egide-bonus</code>.</p>`,
      foot: '<button class="btn-primary" data-copiar>Copiar tudo</button>',
      onMount: (el) => el.querySelector('[data-copiar]').addEventListener('click', () => LD.ui.copiar(linhas.join('\n')))
    });
  }

  /* ---------- Penalidades das rolagens ---------- */
  function penalidade(f, tipo) {
    const m = f.medidores;
    let p = 0; const motivos = [];
    if (m.fadiga >= 2) { p -= 2; motivos.push('Fadiga'); } else if (m.fadiga === 1 && tipo === 'pericia') { p -= 2; motivos.push('Cansado'); }
    let sus = m.sussurro;
    if (R.hasTraco(f, 'vontade_ferro')) sus = Math.max(0, sus - 1);
    if (sus > 0) { p -= sus; motivos.push('Sussurro'); }
    return { p, motivos };
  }
  function rolar(f, rotulo, bonus, tipo, extraCd) {
    const pen = penalidade(f, tipo);
    const cd = extraCd === false ? null : extraCd != null ? extraCd : st.cd ? Number(st.cd) : null;
    return LD.ui.rolarTeste(`${titulo(f)} · ${rotulo}${pen.motivos.length ? ` (${pen.motivos.join(', ')})` : ''}`, bonus + pen.p, { modo: st.modo, cd });
  }

  /* =====================================================================
   * Jogar
   * ===================================================================== */
  function estadoSaude(pv, max) {
    if (pv <= 0) return ['Nocauteado', 'bad'];
    if (pv <= max / 4) return ['Por um Fio', 'bad'];
    if (pv <= max / 2) return ['Ferido', 'warn'];
    return ['Inteiro', 'ok'];
  }

  function renderJogar(el, f, c, editar) {
    const m = f.medidores;
    const [estado, cls] = estadoSaude(m.pv, c.pvMax);
    const pct = Math.max(0, Math.min(100, m.pv / c.pvMax * 100));
    const ataques = R.ataques(f, c);
    const treinadas = LD.PERICIAS.filter((p) => num(f.pericias[p.key]));
    const outras = LD.PERICIAS.filter((p) => !num(f.pericias[p.key]));
    const kits = LD.KITS.filter((k) => (f.kits[k.key] || {}).max);

    el.innerHTML = `
      <div class="play-top">
        <div class="meter">
          <div class="meter-h"><span class="caps">Vida (PV)</span><span class="tag ${cls}">${estado}</span></div>
          <div class="v">${m.pv}<small> / ${c.pvMax}</small></div>
          <div class="bar hp ${pct <= 25 ? 'low' : pct <= 50 ? 'mid' : ''}"><i style="width:${pct}%"></i></div>
          ${editar ? `<div class="meter-c"><input type="number" data-qtd="pv" value="5" min="1" aria-label="Quanto">
            <button class="btn hit" data-pv="-1">Dano</button><button class="btn heal" data-pv="1">Curar</button></div>` : ''}
        </div>
        <div class="meter">
          <div class="meter-h"><span class="caps">Energia</span><span class="muted tiny">vem do ${c.energiaAttr === 'VON' ? 'Vontade' : 'Vigor'}</span></div>
          <div class="v">${m.energia}<small> / ${c.energiaMax}</small></div>
          ${editar ? `<div class="meter-c">${stepper('energia', m.energia, 0, c.energiaMax)}</div>` : pips(c.energiaMax, m.energia)}
        </div>
        <div class="meter">
          <div class="meter-h"><span class="caps">${esc(c.recursoNome)}</span></div>
          <div class="v">${m.det}<small> / ${c.detMax}</small></div>
          ${editar ? `<div class="meter-c">${stepper('det', m.det, 0, 5)}</div>` : pips(Math.max(c.detMax, m.det), m.det, 'gold')}
        </div>
      </div>

      <div class="strip">
        <div class="grp"><span class="caps">Rolar com</span><div class="chips">${[['normal', 'Normal'], ['vantagem', 'Vantagem'], ['desvantagem', 'Desvantagem']].map(([k, n]) => `<button class="chip ${st.modo === k ? 'on' : ''}" data-modo="${k}">${n}</button>`).join('')}</div></div>
        <label class="inline">Contra CD <input type="number" min="0" max="60" data-cd value="${esc(st.cd)}" placeholder="—" style="width:64px"></label>
        ${m.fadiga || m.sussurro || m.condicoes.length ? `<div class="grp cond-row">
          ${m.fadiga ? `<span class="cond on" title="${esc(LD.FADIGA[m.fadiga])}">Fadiga ${m.fadiga}</span>` : ''}
          ${m.sussurro ? `<span class="cond on">Sussurro ${m.sussurro}</span>` : ''}
          ${m.condicoes.map((k) => `<button class="cond on ${k === 'Brilhando' ? 'good' : ''}" data-cond="${esc(k)}" title="Tirar" ${editar ? '' : 'disabled'}>${esc(k)} ×</button>`).join('')}
        </div>` : ''}
      </div>

      <div class="grid two">
        <div>
          <div class="subsect"><span>Ataques</span></div>
          <div class="atk-list">${ataques.map((a, i) => `
            <div class="atk">
              <div class="atk-n">${esc(a.nome)}</div>
              <button class="roll" data-atk="${i}" title="Rolar o ataque">Acerto ${sinal(a.bonus)}</button>
              <button class="roll dmg ${st.critico === `${f.id}:${i}` ? 'armed' : ''}" data-dano="${i}" title="Rolar o dano">${st.critico === `${f.id}:${i}` ? 'Crítico!' : 'Dano ' + esc(a.expr)}</button>
            </div>`).join('')}</div>
          <p class="muted small">Um 20 natural deixa o próximo dano daquele ataque como crítico.</p>
        </div>
        <div>
          <div class="subsect"><span>Defesa</span></div>
          <div class="big3">
            <div><span class="caps">Defesa</span><b>${c.defesa}</b></div>
            <div><span class="caps">Resistência</span><b>${c.resistencia}</b></div>
            <div class="rollable" data-rolar="ini" title="Rolar Iniciativa"><span class="caps">Iniciativa ⚄</span><b>${sinal(c.iniciativa)}</b></div>
          </div>
          <div class="btn-row">
            <button class="btn" data-rolar="ref">⚄ Reflexos ${sinal(c.reflexos)}</button>
            <button class="btn" data-rolar="for">⚄ Fortitude ${sinal(c.fortitude)}</button>
            <button class="btn" data-rolar="men">⚄ Mente ${sinal(c.mente)}</button>
          </div>
          <details class="more" ${keep('numeros')}><summary>Todos os números</summary>
            <div class="stat-grid">
              ${stat('Defesa', c.defesa, `10 + AGI ${c.A.AGI} + Esquiva ${c.profDef}${c.bonusDef ? ` ${sinal(c.bonusDef)} equip.` : ''}`)}
              ${stat('Resistência', c.resistencia, `VIG ${c.A.VIG} + Proteção ${c.protecao}${c.detalheProt.length ? ` (${c.detalheProt.join(', ')})` : ''}`)}
              ${stat('Potência', c.potPoder, `poderes · golpes ${c.potGolpe}`)}
              ${stat('Percepção passiva', c.percepcaoPassiva, '10 + VON + Percepção')}
              ${stat('Deslocamento', c.deslocamento + ' m', 'por rodada')}
              ${stat('Carga', c.carga + ' kg', 'FOR × 25')}
              ${stat('Dinheiro', R.fmtUS(c.dinheiro), f.salario ? `salário ${R.fmtUS(f.salario)}/semana` : 'sem salário')}
              ${c.protecao <= 5 ? stat('Evasão', '✓', 'Ainda de Pé e Evasão valem') : ''}
            </div>
          </details>
        </div>
      </div>

      <div class="subsect"><span>Atributos</span></div>
      <div class="attr-play">
        ${LD.ATRIBUTOS.map((a) => `<button class="ap-attr" data-attr="${a.key}" title="${esc(a.nome)}: ${esc(a.desc)} Clique para rolar."><span class="caps">${esc(a.nome)}</span><b>${c.A[a.key]}</b><small>${esc(R.escalaAtributo(c.A[a.key], c.classe).nome)}</small></button>`).join('')}
      </div>
      <div class="per-chips">
        ${treinadas.map((p) => `<button class="ap-per tr" data-per="${p.key}" title="${esc(p.desc)}">${esc(p.nome)} <b>${sinal(c.A[p.attr] + 2 * num(f.pericias[p.key]))}</b></button>`).join('') || '<span class="muted small">Nenhuma Perícia treinada.</span>'}
      </div>
      <details class="more" ${keep('outras-' + f.id)}><summary>Outras Perícias</summary><div class="per-chips">
        ${outras.map((p) => `<button class="ap-per" data-per="${p.key}" title="${esc(p.desc)}">${esc(p.nome)} <b>${sinal(c.A[p.attr])}</b></button>`).join('')}
      </div></details>

      ${f.poderes.length ? `<div class="subsect"><span>Poderes</span></div>
        <div class="pow-play">${f.poderes.map((p) => poderResumo(f, p, c)).join('')}</div>
        <details class="more"><summary>Quanto custa em Energia</summary><p class="small">Intensificar (+2d6 no dano) 1 · Técnica 2 · Façanha de Poder 2 · Suprema 5 · Sustentar 1 por rodada.</p></details>` : ''}

      ${f.grimorio.length ? `<div class="subsect"><span>Grimório</span></div>
        <div class="atk-list">${f.grimorio.map((ft, i) => { const x = R.feitico(f, ft, c); return `
          <div class="atk">
            <div class="atk-n">${esc(ft.nome || 'Feitiço')} <span class="tag">${esc(x.custo)}</span></div>
            <button class="roll" data-conj="${i}">${x.livre ? 'Lançar (livre)' : `Conjurar ${sinal(x.bonus)} vs ${x.cd}`}</button>
          </div>`; }).join('')}</div>` : ''}

      ${kits.length ? `<div class="subsect"><span>Kits</span></div>
      <div class="kit-row">${kits.map((k) => { const kk = f.kits[k.key]; return `
        <div class="kit ${kk.atual ? '' : 'off'}" title="${esc(k.efeito)}">
          <span class="kit-n">${esc(k.nome.replace('Kit de ', ''))}</span> ${pips(kk.max, kk.atual)}
          ${editar && kk.atual ? `<button class="btn" data-kit="${k.key}" data-d="-1">Usar</button>` : ''}
        </div>`; }).join('')}</div>` : ''}

      ${editar ? `<div class="subsect"><span>Entre as cenas</span></div>
      <div class="btn-row">
        <button class="btn" data-folego title="Ação Rápida, uma vez por combate: VIG + degrau de Classe em PV">Segundo Fôlego (+${c.A.VIG + c.degrau} PV)</button>
        <button class="btn" data-descanso="curto" title="¼ do PV, Energia até a metade, −1 Fadiga">Descanso curto</button>
        <button class="btn" data-descanso="longo" title="PV e Energia cheios, −1 Fadiga">Descanso longo</button>
        <button class="btn" data-descanso="seguro" title="E ainda Fadiga 0, −1 Sussurro, Kits reabastecidos">Lugar seguro</button>
        <button class="btn" data-descanso="sessao" title="Determinação cheia">Nova sessão</button>
      </div>
      <details class="more" ${keep('cond-' + f.id)}><summary>Condições, Fadiga, Sussurro e Kits</summary>
        <div class="row" style="margin-bottom:12px">
          <div class="field"><label>Fadiga · ${esc(LD.FADIGA[m.fadiga])}</label>${stepper('fadiga', m.fadiga, 0, 3)}</div>
          <div class="field"><label>Sussurro · ${m.sussurro ? `−${m.sussurro} em tudo` : 'em silêncio'}</label>${stepper('sussurro', m.sussurro, 0, 3)}</div>
        </div>
        <div class="cond-row">${LD.CONDICOES.map((k) => `<button class="cond ${m.condicoes.includes(k) ? 'on' : ''} ${k === 'Brilhando' ? 'good' : ''}" data-cond="${esc(k)}">${esc(k)}</button>`).join('')}</div>
        <div class="kit-row" style="margin-top:12px">${LD.KITS.map((k) => { const kk = f.kits[k.key] || { atual: 0, max: 0 }; return `<div class="kit"><span class="kit-n">${esc(k.nome.replace('Kit de ', ''))}</span> ${kk.atual}/${kk.max} <button class="btn plain" data-kit="${k.key}" data-d="1">+1</button></div>`; }).join('')}</div>
      </details>` : ''}
    `;

    el.querySelectorAll('[data-modo]').forEach((b) => b.addEventListener('click', () => { st.modo = b.dataset.modo; renderJogar(el, f, c, editar); }));
    el.querySelector('[data-cd]').addEventListener('change', (e) => { st.cd = e.target.value; });
    const qtd = () => Math.max(1, num((el.querySelector('[data-qtd="pv"]') || {}).value, 1));
    el.querySelectorAll('[data-pv]').forEach((b) => b.addEventListener('click', () => mudarPV(f.id, num(b.dataset.pv) * qtd())));
    const fol = el.querySelector('[data-folego]');
    if (fol) fol.addEventListener('click', () => mudarPV(f.id, c.A.VIG + c.degrau, 'Segundo Fôlego'));
    bindSteppers(el, (k, v) => mudar(f.id, (x) => { x.medidores[k] = v; }));
    el.querySelectorAll('[data-descanso]').forEach((b) => b.addEventListener('click', () => descansar(f.id, b.dataset.descanso)));
    el.querySelectorAll('button[data-cond]').forEach((b) => b.addEventListener('click', () => mudar(f.id, (x) => {
      const k = b.dataset.cond; const arr = x.medidores.condicoes;
      x.medidores.condicoes = arr.includes(k) ? arr.filter((y) => y !== k) : arr.concat(k);
    })));
    const rolagens = { ini: ['Iniciativa', c.iniciativa, 'atributo'], ref: ['Reflexos', c.reflexos, 'salva'], for: ['Fortitude', c.fortitude, 'salva'], men: ['Mente', c.mente, 'salva'] };
    el.querySelectorAll('[data-rolar]').forEach((b) => b.addEventListener('click', () => { const r = rolagens[b.dataset.rolar]; rolar(f, r[0], r[1], r[2], b.dataset.rolar === 'ini' ? false : undefined); }));
    el.querySelectorAll('[data-attr]').forEach((b) => b.addEventListener('click', () => rolar(f, (LD.byKey(LD.ATRIBUTOS, b.dataset.attr) || {}).nome, c.A[b.dataset.attr], 'atributo')));
    el.querySelectorAll('[data-per]').forEach((b) => b.addEventListener('click', () => {
      const p = LD.byKey(LD.PERICIAS, b.dataset.per);
      rolar(f, p.nome, c.A[p.attr] + 2 * num(f.pericias[p.key]), 'pericia');
    }));
    el.querySelectorAll('[data-atk]').forEach((b) => b.addEventListener('click', () => {
      const i = +b.dataset.atk; const a = ataques[i];
      const r = rolar(f, 'Ataque · ' + a.nome, a.bonus, 'ataque');
      if (r.natural === 20) { st.critico = `${f.id}:${i}`; LD.ui.toast('20 natural: crítico! O próximo dano sai no máximo. +1 Energia.'); renderJogar(el, f, c, editar); }
    }));
    el.querySelectorAll('[data-dano]').forEach((b) => b.addEventListener('click', () => {
      const i = +b.dataset.dano; const a = ataques[i];
      const crit = st.critico === `${f.id}:${i}`;
      LD.ui.rolarDano('Dano · ' + a.nome, a.expr, crit);
      if (crit) { st.critico = null; renderJogar(el, f, c, editar); }
    }));
    el.querySelectorAll('[data-conj]').forEach((b) => b.addEventListener('click', () => {
      const ft = f.grimorio[+b.dataset.conj]; const x = R.feitico(f, ft, c);
      if (x.livre) { LD.ui.registrarRolagem({ titulo: `${titulo(f)} · ${ft.nome}`, total: '✓', detalhe: 'Feitiço livre: sem teste e sem Energia.' }); return; }
      const r = rolar(f, 'Conjurar · ' + (ft.nome || 'feitiço'), x.bonus, 'pericia', x.cd);
      if (!r.passou || r.natural === 1) {
        const vezes = r.natural === 1 ? 2 : 1;
        for (let i = 0; i < vezes; i++) { const d6 = 1 + Math.floor(Math.random() * 6); LD.ui.registrarRolagem({ titulo: 'O Preço (1d6)', total: d6, detalhe: LD.PRECOS_MAGIA[d6 - 1] + (ft.precoProprio ? ' · ' + ft.precoProprio : ''), classe: 'bad' }); }
      }
    }));
    el.querySelectorAll('[data-kit]').forEach((b) => b.addEventListener('click', () => mudar(f.id, (x) => {
      const k = x.kits[b.dataset.kit] || (x.kits[b.dataset.kit] = { atual: 0, max: 0 });
      k.atual = Math.max(0, k.atual + num(b.dataset.d)); k.max = Math.max(k.max, k.atual);
    })));
    el.querySelectorAll('[data-podatk]').forEach((b) => b.addEventListener('click', () => {
      const p = f.poderes.find((x) => x.id === b.dataset.podatk); const a = R.ataquePoder(f, p, c);
      LD.ui.rolarDano('Cura · ' + (p.nome || ''), `${p.grau}d6+${c.A[a.attr]}`);
    }));
  }

  function stat(nome, valor, sub) {
    return `<div class="stat"><span class="caps">${esc(nome)}</span><b>${esc(valor)}</b><small>${esc(sub || '')}</small></div>`;
  }

  function poderResumo(f, p, c, acoes) {
    const b = LD.byKey(LD.PODERES, p.base) || {};
    const g = LD.GRAUS[R.clamp(num(p.grau, 1), 1, 8)];
    const a = R.ataquePoder(f, p, c);
    const extras = (p.extras || []).map((k) => (LD.byKey(LD.EXTRAS, k) || {}).nome).filter(Boolean);
    const falhas = (p.falhas || []).map((k) => (LD.byKey(LD.FALHAS, k) || {}).nome).filter(Boolean);
    const ef = p.pronto ? LD.efeitoPronto(p.pronto, p.grau) : null;
    const destaque = b.tipo === 'ataque' ? `Dano ${a.expr}` : b.tipo === 'cura' ? `Cura ${p.grau}d6+${c.A[a.attr]}` : b.protecao && (!b.modos || (p.modo || 'protecao') === 'protecao') ? `Proteção ${b.protecao(num(p.grau, 1), c.classe)}` : p.alvo ? `+${p.grau} ${p.alvo}` : `Grau ${p.grau}`;
    const html = `<details class="pow" ${keep('pow-' + p.id)}>
      <summary><span class="pow-name">${esc(p.nome || b.nome || 'Poder')} <span class="grau-n">${p.grau}</span></span>${ef && /^Grau/.test(destaque) ? '' : `<span class="tag ice">${esc(destaque)}</span>`}${acoes ? `<span class="tag gold">${R.custoPoder(p).total} PP</span>` : ''}</summary>
      <div class="pow-body">
        ${ef ? `<div class="caption" style="margin:0"><b>Grau ${p.grau}:</b> ${esc(ef.agora)}${ef.proximo ? `<br><span class="small"><b>Grau ${num(p.grau) + 1}:</b> ${esc(ef.proximo)}</span>` : ''}</div>` : ''}
        ${p.descritor && !ef ? `<div class="italic">${esc(p.descritor)}</div>` : ''}
        ${ef ? '' : `<div>${esc(b.nome || '')} ${p.grau}: ${esc(b.efeito || '')}</div>`}
        <div class="facts">${ef && b.tipo !== 'ataque' ? '' : `<span class="fact">Alcance<b>${esc(g.alcance)}</b></span><span class="fact">Área<b>${esc(g.area)}</b></span><span class="fact">Duração<b>${esc(g.duracao)}</b></span>`}<span class="fact">CD<b>${a.cd}</b></span>${b.tipo === 'ataque' ? `<span class="fact">Acerto<b>${sinal(a.bonus)}</b></span>` : ''}<span class="fact">Custo<b>${R.custoPoder(p).total} PP</b></span></div>
        ${extras.length || falhas.length ? `<div class="facts">${extras.map((x) => `<span class="tag ok">+ ${esc(x)}</span>`).join('')}${falhas.map((x) => `<span class="tag warn">− ${esc(x)}</span>`).join('')}</div>` : ''}
        ${(p.variacoes || []).length ? `<div><span class="caps">Variações</span> ${(p.variacoes || []).map((v) => esc(`${v.nome} (Grau ${v.grau || p.grau})`)).join(' · ')}</div>` : ''}
        ${b.tipo === 'cura' && !acoes ? `<div><button class="roll dmg" data-podatk="${esc(p.id)}">Curar ${p.grau}d6+${c.A[a.attr]}</button></div>` : ''}
      </div>
    </details>`;
    return acoes ? `<div class="pow-wrap">${html}<div class="pow-act">${acoes}</div></div>` : html;
  }

  function mudarPV(id, delta, motivo) {
    return mudar(id, (x) => {
      const c = R.calc(x); const m = x.medidores;
      const antes = m.pv;
      m.pv = R.clamp(m.pv + delta, delta < 0 ? -c.pvMax : -c.pvMax, c.pvMax);
      // Ainda de Pé: Proteção 5 ou menos, um golpe de mais da metade direto para 0
      if (delta < 0 && c.protecao <= 5 && antes > c.pvMax / 2 && m.pv <= 0 && !m.aindaDePe) {
        m.pv = 1; m.aindaDePe = true; LD.ui.toast('Ainda de Pé: fica com 1 PV, Por um Fio.');
      }
      if (m.pv <= c.pvMax / 4 && m.pv > 0 && antes > c.pvMax / 4 && !m.reservaUsada) {
        m.reservaUsada = true; m.energia = Math.min(c.energiaMax, m.energia + 2); LD.ui.toast('Última Reserva: +2 Energia.');
      }
      if (m.pv < 0) m.pv = 0;
      if (motivo) LD.ui.toast(`${motivo}: +${delta} PV.`);
    });
  }

  function descansar(id, tipo) {
    return mudar(id, (x) => {
      const c = R.calc(x); const m = x.medidores;
      if (tipo === 'curto') {
        m.pv = Math.min(c.pvMax, m.pv + Math.floor(c.pvMax / 4));
        m.energia = Math.max(m.energia, Math.floor(c.energiaMax / 2));
        m.fadiga = Math.max(0, m.fadiga - 1);
      } else if (tipo === 'longo' || tipo === 'seguro') {
        m.pv = c.pvMax; m.energia = c.energiaMax;
        if (tipo === 'seguro') {
          m.fadiga = 0; m.sussurro = Math.max(0, m.sussurro - 1);
          Object.values(x.kits).forEach((k) => { k.atual = k.max; });
        } else m.fadiga = Math.max(0, m.fadiga - 1);
        m.aindaDePe = false; m.reservaUsada = false;
        if (x.treino && (x.treino.distensao || []).length) x.treino.distensao = [];
      } else if (tipo === 'sessao') {
        m.det = c.detMax; m.aindaDePe = false; m.reservaUsada = false;
      }
      LD.ui.toast({ curto: 'Descanso curto.', longo: 'Descanso longo.', seguro: 'Descanso em lugar seguro: Kits reabastecidos.', sessao: `Nova sessão: ${c.recursoNome} cheia.` }[tipo]);
    });
  }

  /* =====================================================================
   * Construção
   * ===================================================================== */
  function renderConstrucao(el, f, c, editar) {
    const passo = st.passo[f.id] || 'conceito';
    const avisosPorPasso = {};
    c.avisos.forEach((a) => { if (!a.leve) avisosPorPasso[a.passo] = (avisosPorPasso[a.passo] || 0) + 1; });
    const somaAttr = LD.ATRIBUTOS.reduce((s, a) => s + num(f.atributos[a.key]), 0);
    el.innerHTML = `
      <div class="build">
        <div class="build-main">
          <ol class="steps-nav">${PASSOS.map((p, i) => `
            <li class="${p.key === passo ? 'on' : ''} ${avisosPorPasso[p.key] ? 'pend' : 'done'}"><button data-passo="${p.key}"><span class="n">${i + 1}</span>${esc(p.nome)}</button></li>`).join('')}</ol>
          <div class="step-body ${editar ? '' : 'ro'}" data-step></div>
          <div class="step-nav">
            ${PASSOS.findIndex((p) => p.key === passo) > 0 ? '<button class="btn plain" data-prev>← Anterior</button>' : '<span></span>'}
            ${PASSOS.findIndex((p) => p.key === passo) < PASSOS.length - 1 ? '<button class="btn-primary" data-next>Próximo →</button>' : '<button class="btn-primary" data-fim>Ir para a ficha de jogo</button>'}
          </div>
        </div>
        <aside class="budget panel framed">
          <div class="eyebrow">Pontos para gastar</div>
          ${orc('Atributos', somaAttr, LD.PONTOS_DE_ATRIBUTO)}
          ${orc('Poder (PP)', c.ppGastos, c.ppTotal)}
          ${orc('Treino (PT)', c.ptGastos, c.ptTotal)}
          ${c.avisos.filter((a) => !a.leve).length ? `<ul class="avisos">${c.avisos.filter((a) => !a.leve).slice(0, 3).map((a) => `<li><button data-passo="${a.passo}">${esc(a.msg)}</button></li>`).join('')}</ul>
            ${c.avisos.filter((a) => !a.leve).length > 3 ? `<details class="more"><summary>Mais ${c.avisos.filter((a) => !a.leve).length - 3}</summary><ul class="avisos">${c.avisos.filter((a) => !a.leve).slice(3).map((a) => `<li><button data-passo="${a.passo}">${esc(a.msg)}</button></li>`).join('')}</ul></details>` : ''}`
            : '<div class="all-ok">Tudo certo! Peça a aprovação à mestragem.</div>'}
          ${c.avisos.some((a) => a.leve) ? `<ul class="avisos">${c.avisos.filter((a) => a.leve).map((a) => `<li class="leve">${esc(a.msg)}</li>`).join('')}</ul>` : ''}
          <details class="more" ${keep('numfi')}><summary>Números da ficha</summary><ul class="mini">
            <li><span>PV</span><b>${c.pvMax}</b></li><li><span>Defesa</span><b>${c.defesa}</b></li>
            <li><span>Resistência</span><b>${c.resistencia}</b></li><li><span>Energia</span><b>${c.energiaMax}</b></li>
            <li><span>${esc(c.recursoNome)}</span><b>${c.detMax}</b></li><li><span>Grau máx.</span><b>${c.grauMax}</b></li>
          </ul></details>
        </aside>
      </div>`;
    const body = el.querySelector('[data-step]');
    ({ conceito: passoConceito, origem: passoOrigem, atributos: passoAtributos, poderes: passoPoderes, treino: passoTreino, tracos: passoTracos, civil: passoCivil })[passo](body, f, c);
    if (!editar) body.querySelectorAll('input,select,textarea,button').forEach((x) => { x.disabled = true; });

    const ir = (k) => { st.passo[f.id] = k; renderConstrucao(el, ficha(f.id), R.calc(ficha(f.id)), editar); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    el.querySelectorAll('[data-passo]').forEach((b) => b.addEventListener('click', () => ir(b.dataset.passo)));
    const i = PASSOS.findIndex((p) => p.key === passo);
    const prev = el.querySelector('[data-prev]'); if (prev) prev.addEventListener('click', () => ir(PASSOS[i - 1].key));
    const next = el.querySelector('[data-next]'); if (next) next.addEventListener('click', () => ir(PASSOS[i + 1].key));
    const fim = el.querySelector('[data-fim]'); if (fim) fim.addEventListener('click', () => { st.aba[f.id] = 'jogar'; LD.app.render(); window.scrollTo(0, 0); });
  }

  function orc(nome, gasto, total) {
    const livre = total - gasto;
    const pct = total > 0 ? Math.min(100, (gasto / total) * 100) : 0;
    return `<div class="orc ${livre < 0 ? 'bad' : livre === 0 ? 'ok' : ''}">
      <div class="orc-h"><span>${esc(nome)}</span><b>${livre}</b><small>de ${total}</small></div>
      <div class="bar"><i style="width:${pct}%"></i></div></div>`;
  }

  // Liga inputs/selects/textarea com name="caminho" a mudanças na ficha (no change).
  function bindCampos(el, f, extra) {
    el.querySelectorAll('[name]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const v = inp.type === 'checkbox' ? inp.checked : inp.type === 'number' ? (inp.value === '' ? '' : Number(inp.value)) : inp.value;
        mudar(f.id, (x) => {
          const path = inp.name.split('.');
          let o = x; path.slice(0, -1).forEach((p) => { o[p] = o[p] || {}; o = o[p]; });
          o[path[path.length - 1]] = v;
          if (extra) extra(x, inp.name, v);
        });
      });
    });
  }

  /* ---------- 1. Conceito ---------- */
  function passoConceito(el, f) {
    const mestre = LD.store.isMaster();
    el.innerHTML = `
      <h2>Comece pela pessoa</h2>
      <p class="lead">Quem é o herói, o que ele faz de especial e o que ele perdeu. As regras vêm depois.</p>
      <div class="row">
        ${field('Nome de herói', input('codinome', f.codinome, 'class="big" placeholder="Faísca"'))}
        ${field('Nome civil', input('nome', f.nome, 'placeholder="Joana Prates"'))}
        ${field('Símbolo', input('simbolo', f.simbolo, 'maxlength="4" placeholder="⚡"'), 'Um emoji ou uma letra.')}
      </div>
      ${field('Conceito em uma frase', input('conceito', f.conceito, 'placeholder="Entregadora de bicicleta que brilha quando está com raiva."'))}
      <details class="more"><summary>Retrato e alinhamento</summary><div class="row">
        ${field('Retrato (link de imagem)', input('retrato', f.retrato, 'placeholder="https://..."'))}
        ${field('Alinhamento', select('alinhamento', [{ key: 'heroi', nome: 'Herói' }, { key: 'anti_heroi', nome: 'Anti-herói (Rancor)' }, { key: 'vilao', nome: 'Vilão (Ambição)' }], f.alinhamento))}
      </div></details>
      <div class="subsect"><span>Arquétipo</span></div>
      <p class="muted small">O papel no grupo. Não custa nada e dá uma habilidade.</p>
      <div class="pick-grid">${LD.ARQUETIPOS.map((a) => `
        <button class="pick ${f.arquetipo === a.key ? 'on' : ''}" data-arq="${a.key}">
          <b>${esc(a.nome)}</b><span class="muted small">${esc(a.papel)}</span>
        </button>`).join('')}</div>
      ${f.arquetipo && f.arquetipo !== 'proprio' ? `<div class="caption"><b>${esc(LD.byKey(LD.ARQUETIPOS, f.arquetipo).nome)}:</b> ${esc(LD.byKey(LD.ARQUETIPOS, f.arquetipo).habilidade)}</div>` : ''}
      ${f.arquetipo === 'proprio' ? `<div class="row" style="margin-top:14px">
        ${field('Nome do Arquétipo', input('arquetipoProprio.nome', f.arquetipoProprio.nome, 'placeholder="O Fantasma"'))}
        ${field('Habilidade', input('arquetipoProprio.habilidade', f.arquetipoProprio.habilidade, 'placeholder="Começa toda luta escondido: o primeiro ataque tem Vantagem."'))}
      </div>` : ''}`;
    bindCampos(el, f);
    el.querySelectorAll('[data-arq]').forEach((b) => b.addEventListener('click', () => mudar(f.id, (x) => { x.arquetipo = b.dataset.arq; })));
  }

  /* ---------- 2. Origem e Potencial ---------- */
  function passoOrigem(el, f, c) {
    const trava = travado(f);
    const o = LD.byKey(LD.ORIGENS, f.origem);
    const adj = R.resultadoAjustado(f);
    el.innerHTML = `
      <h2>De onde vem o poder</h2>
      <p class="lead">Cada Origem é forte de um jeito e paga de outro.${trava ? ' <b class="warn">A ficha foi aprovada: Origem e Potencial só a mestragem muda.</b>' : ''}</p>
      <div class="pick-grid three">${LD.ORIGENS.map((x) => `
        <button class="pick ${f.origem === x.key ? 'on' : ''}" data-origem="${x.key}" ${trava ? 'disabled' : ''}>
          <b>${esc(x.nome)}</b><span class="muted small">${esc(x.fonte)}</span>
        </button>`).join('')}</div>
      ${o ? `<div class="caption"><b>Forte:</b> ${esc(o.vantagem)}<br><b>Paga:</b> ${esc(o.limite)}</div>` : ''}
      ${o ? `<details class="more"><summary>Origem híbrida (opcional)</summary><div class="row">
        ${field('Segunda Origem', select('origem2', [{ key: '', nome: 'Nenhuma' }].concat(LD.ORIGENS.filter((x) => x.key !== f.origem && x.key !== 'visitante' && f.origem !== 'visitante').map((x) => ({ key: x.key, nome: x.nome }))), f.origem2, trava ? 'disabled' : ''), 'A segunda Origem dá só o limite, e abre os poderes daquele tipo.')}
      </div></details>` : ''}
      <div class="subsect"><span>Potencial</span></div>
      ${!o ? '<p class="muted">Escolha a Origem primeiro.</p>' : o.rola ? `
        <div class="pot-box panel">
          <div class="row">
            ${field('Resultado do !egide-potencial', input('potencial.resultado', f.potencial.resultado, `type="number" min="1" max="100" class="big" ${trava ? 'disabled' : ''}`), 'O bot rola 2d100 e fica com o maior, em público, no canal de aprovação. Digite o número que ele deu.')}
            <div class="pot-out">
              ${c.pot.rolou ? `<div class="pot-name">${esc(c.pot.emoji)} ${esc(c.pot.nome)}</div><div class="small">Resultado ${adj}${adj !== num(f.potencial.resultado) ? ` (ajustado pela Origem: ${o.somaRolagem ? '+15' : 'Linhagem'})` : ''} · ${c.pot.pp} PP · +${c.pot.pt} PT${c.pot.det ? ' · +1 Determinação' : ''}</div>${c.pot.preco ? `<div class="warn small">Preço: ${esc(c.pot.preco)}</div>` : ''}` : '<div class="muted italic">Sem resultado ainda.</div>'}
            </div>
          </div>
          ${checkbox('feNoDestino', f.feNoDestino, `Fiquei com a primeira rolagem: Fé no Destino (+${LD.FE_NO_DESTINO} PT)`, trava ? 'disabled' : '')}
          ${LD.store.state.local ? '<button class="btn plain" data-simular style="margin-left:18px">Simular rolagem (só no modo local)</button>' : ''}
        </div>
        <details class="ref"><summary>Ver a tabela de Potencial</summary><table class="tbl pot-tbl"><thead><tr><th>Resultado</th><th>Potencial</th><th>Chance</th><th>PP</th><th>PT extra</th><th>Preço</th></tr></thead><tbody>
        ${LD.FAIXAS.map((x) => `<tr class="${c.pot.faixa === x ? 'hi' : ''}"><td>${String(x.min).padStart(2, '0')}–${x.max}</td><td>${x.emoji} ${esc(x.nome)}</td><td>${x.chance}</td><td>${x.pp}</td><td>${x.pt ? '+' + x.pt : '—'}</td><td class="small">${esc(x.preco || '—')}</td></tr>`).join('')}
        </tbody></table></details>
        ${o.key === 'mitico' ? '<p class="muted small">Linhagem: abaixo de 40 vira 40 (Chama); acima de 94 vira 94 (Fogueira).</p>' : ''}
        ${o.key === 'visitante' ? '<p class="muted small">Visitante: +15 no resultado (máximo 100). Fraqueza grave obrigatória.</p>' : ''}
        ${o.key === 'arcano' ? '<p class="muted small">Dom: os PP viram magia (escolas) e o Arcano ganha +2 PT. </p>' : ''}
      ` : o.key === 'treinado' ? `
        <div class="pot-box panel"><div class="pot-name">◆ Ápice</div>
        <p>0 PP, +14 PT, Determinação 4 por sessão, Perícias até grau 4 na criação, e Lê a Brecha como Ação Rápida.</p></div>
      ` : `
        <div class="pot-box panel"><div class="pot-name">◆ Oficina</div>
        <p>PP de Equipamento = 10 + INT × 2 (<b>${c.pot.pp}</b> agora), +4 PT. Todo poder é Removível.</p>
        ${checkbox('lendarios', f.recursosOpcao === 'lendarios', 'Oficina lendária: troca 6 PT por US$ 50.000 iniciais', trava ? 'disabled data-skip' : 'data-skip')}</div>
      `}`;
    el.querySelectorAll('[data-origem]').forEach((b) => b.addEventListener('click', () => mudar(f.id, (x) => {
      x.origem = b.dataset.origem; x.origemBonus = [];
      if (x.origem2 === x.origem) x.origem2 = '';
      if (x.origem !== 'engenhoso' && x.recursosOpcao === 'lendarios') x.recursosOpcao = '';
      if (x.origem !== 'treinado' && x.recursosOpcao === 'familia_rica') x.recursosOpcao = '';
    })));
    el.querySelectorAll('[name]').forEach((inp) => {
      if (inp.dataset.skip !== undefined || inp.name === 'lendarios') return;
      inp.addEventListener('change', () => mudar(f.id, (x) => {
        if (inp.name === 'potencial.resultado') x.potencial.resultado = inp.value === '' ? '' : R.clamp(Math.floor(num(inp.value)), 1, 100);
        else if (inp.name === 'feNoDestino') x.feNoDestino = inp.checked;
        else if (inp.name === 'origem2') x.origem2 = inp.value;
      }));
    });
    const lend = el.querySelector('[name="lendarios"]');
    if (lend) lend.addEventListener('change', () => mudar(f.id, (x) => { x.recursosOpcao = lend.checked ? 'lendarios' : ''; }));
    const sim = el.querySelector('[data-simular]');
    if (sim) sim.addEventListener('click', () => {
      const a = 1 + Math.floor(Math.random() * 100), b = 1 + Math.floor(Math.random() * 100);
      LD.ui.registrarRolagem({ titulo: 'Potencial (simulado)', total: Math.max(a, b), detalhe: `2d100 [${a}, ${b}], fica o maior` });
      mudar(f.id, (x) => { x.potencial.resultado = Math.max(a, b); });
    });
  }

  /* ---------- 3. Atributos ---------- */
  function passoAtributos(el, f, c) {
    const o = LD.byKey(LD.ORIGENS, f.origem);
    const cap = R.tetoAtributo(f);
    const soma = LD.ATRIBUTOS.reduce((s, a) => s + num(f.atributos[a.key]), 0);
    const livres = LD.PONTOS_DE_ATRIBUTO - soma;
    const base = R.atributos(f, true);
    const aumPermitidos = [LD.MARCOS.atributo1, LD.MARCOS.atributo2].filter((n) => c.degrau >= n).length;
    el.innerHTML = `
      <h2>Atributos</h2>
      <p class="lead">Todos começam em 1. Distribua <b>${LD.PONTOS_DE_ATRIBUTO} pontos</b>. O teto é <b>${cap}</b> (5 + Classe ${R.fmtClasse(c.classe)}): no teto, o Atributo trabalha na escala da sua Classe inteira.</p>
      <div class="points"><b>${livres}</b><span class="caps">pontos livres</span></div>
      <div class="attr-list">${LD.ATRIBUTOS.map((a) => {
        const p = num(f.atributos[a.key]);
        const fin = c.A[a.key];
        const bonus = base[a.key] - 1 - p;
        return `<div class="attr">
          <i class="dia"></i>
          <div title="${esc(a.desc)}"><div class="name">${esc(a.nome)}<small>${a.key}</small></div></div>
          ${stepper(a.key, 1 + p, 1, Math.min(cap, 1 + p + Math.max(0, livres)))}
          <div class="val">${fin}${bonus ? `<small class="ok"> +${bonus}</small>` : ''}${fin !== base[a.key] ? '<small class="gold"> poder</small>' : ''}<div class="tiny muted">${(() => { const e = R.escalaAtributo(fin, c.classe); return esc(e.nome) + (e.classe ? ` · ${e.pct}% da Classe` : ''); })()}</div></div>
        </div>`;
      }).join('')}</div>
      ${o ? `<div class="subsect"><span>Bônus da Origem</span></div>
        <p class="muted">${esc(o.nome)}: ${o.bonus.fixo.length ? '+1 ' + o.bonus.fixo.join(', +1 ') : ''}${o.bonus.fixo.length && o.bonus.escolha ? ' e ' : ''}${o.bonus.escolha ? `+1 em ${o.bonus.opcoes.length === 6 ? 'qualquer um' : o.bonus.opcoes.join(' ou ')}` : ''}.</p>
        ${o.bonus.escolha ? `<div class="chips">${o.bonus.opcoes.map((k) => `<button class="chip ${f.origemBonus.includes(k) ? 'on' : ''}" data-ob="${k}">+1 ${k}</button>`).join('')}</div>` : ''}` : ''}
      ${aumPermitidos ? `<div class="subsect"><span>Aumentos pela Classe</span></div>
        <p class="muted">+1 num Atributo na Classe 2 e na 3,3 (até o teto, ${cap}). Você tem ${aumPermitidos}.</p>
        ${Array.from({ length: aumPermitidos }, (_, i) => `<label class="inline">Aumento ${i + 1} ${select('aum' + i, [{ key: '', nome: '—' }].concat(LD.ATRIBUTOS.map((a) => ({ key: a.key, nome: a.nome }))), f.aumentos[i] || '', 'data-aum="' + i + '"')}</label>`).join(' ')}` : ''}
      <details class="ref"><summary>O que cada número significa na Classe ${R.fmtClasse(c.classe)}</summary>
        <table class="tbl"><thead><tr><th>Valor</th><th>Escala</th><th>Quanto da Classe</th></tr></thead><tbody>
        ${Array.from({ length: cap }, (_, i) => i + 1).map((v) => { const e = R.escalaAtributo(v, c.classe); return `<tr class="${LD.ATRIBUTOS.some((a) => c.A[a.key] === v) ? 'hi' : ''}"><td>${v}</td><td>${esc(e.classe ? `${e.nome} (Classe ${e.classe})` : `Humano · ${e.nome}`)}</td><td>${e.pct}%</td></tr>`; }).join('')}
        </tbody></table>
        <p class="muted small">Humano: o Atributo ainda não usa o poder. Ápice: o limite do corpo humano. Daí em diante, cada degrau é uma Classe: Quarteirão, Cidade, Nação.</p></details>`;
    bindSteppers(el, (k, v) => mudar(f.id, (x) => { x.atributos[k] = v - 1; }));
    el.querySelectorAll('[data-ob]').forEach((b) => b.addEventListener('click', () => mudar(f.id, (x) => {
      const k = b.dataset.ob; const n = o.bonus.escolha;
      if (x.origemBonus.includes(k)) x.origemBonus = x.origemBonus.filter((y) => y !== k);
      else x.origemBonus = x.origemBonus.concat(k).slice(-n);
    })));
    el.querySelectorAll('[data-aum]').forEach((s) => s.addEventListener('change', () => mudar(f.id, (x) => {
      const arr = x.aumentos.slice(); arr[+s.dataset.aum] = s.value; x.aumentos = arr.filter(Boolean);
    })));
  }

  /* ---------- 4. Poderes ---------- */
  function passoPoderes(el, f, c) {
    const ep = LD.byKey(LD.ESTILOS_PODER, f.estiloPoder);
    const temEscola = f.poderes.some((p) => (LD.byKey(LD.PODERES, p.base) || {}).escola);
    const treinado = f.origem === 'treinado';
    el.innerHTML = `
      <h2>Estilo de Poder e poderes</h2>
      <p class="lead">${treinado ? 'Treinados não têm PP: o poder deles são os anos de treino. Pule para Perícias, ou use PP de bônus da mestragem.' : `Gaste os <b>${c.ppTotal} PP</b>. Grau máximo ${c.grauMax}. Monte do catálogo ou do zero, com Extras, Falhas e Variações.`}</p>
      <div class="row">
        ${field('Estilo de Poder', select('estiloPoder', [{ key: '', nome: 'Nenhum' }].concat(LD.ESTILOS_PODER.map((x) => ({ key: x.key, nome: x.nome }))), f.estiloPoder), 'Gratuito: dá a Assinatura e a Técnica. Só os poderes custam PP.')}
        ${f.origem === 'desperto' ? field('Segunda Assinatura (Desperto)', select('assinatura2', [{ key: '', nome: '—' }].concat(LD.ESTILOS_PODER.filter((x) => x.key !== f.estiloPoder).map((x) => ({ key: x.key, nome: x.nome }))), f.assinatura2)) : ''}
        ${f.origem === 'arcano' || temEscola ? field('Tradição mágica', select('tradicao', [{ key: '', nome: '—' }].concat(LD.TRADICOES.map((x) => ({ key: x.key, nome: `${x.nome} (${x.attr})` }))), f.tradicao)) : ''}
      </div>
      ${ep ? `<div class="sig panel"><div><span class="caps">Núcleo</span> ${esc(ep.nucleo)}</div><div><span class="caps">Assinatura</span> ${esc(ep.assinatura)}</div><div><span class="caps">Técnica (2 Energia)</span> ${esc(ep.tecnica)}</div>
        ${f.assinatura2 ? `<div><span class="caps">2ª Assinatura</span> ${esc((LD.byKey(LD.ESTILOS_PODER, f.assinatura2) || {}).assinatura || '')}</div>` : ''}</div>` : ''}
      ${f.tradicao ? (() => { const t = LD.byKey(LD.TRADICOES, f.tradicao); return `<div class="sig panel"><div><span class="caps">Conjura com</span> ${t.attr} + ${t.pericia === 'ciencia' ? 'Ciência' : 'Ocultismo'}</div><div><span class="caps">Vantagem</span> ${esc(t.vantagem)}</div><div><span class="caps">Limite</span> ${esc(t.limite)}</div></div>`; })() : ''}

      <div class="subsect"><span>Poderes da ficha</span><span class="tag gold">${c.ppGastos} / ${c.ppTotal} PP</span></div>
      <div class="pow-play">${f.poderes.map((p) => poderResumo(f, p, c, `${num(p.grau) < c.grauMax ? `<button class="btn-primary small-btn" data-sobe="${esc(p.id)}" ${R.custoPoder(p).porGrau > c.ppLivres ? 'disabled title="Faltam PP"' : ''}>Aprimorar (+${R.custoPoder(p).porGrau} PP)</button>` : '<span class="tag">Grau máximo</span>'}<button class="btn" data-editp="${esc(p.id)}">Editar</button><button class="btn plain" data-libp="${esc(p.id)}">Pôr na biblioteca</button><button class="btn plain danger" data-rmp="${esc(p.id)}">Tirar</button>`)).join('') || '<div class="empty small-empty">Nenhum poder ainda.</div>'}</div>
      ${(() => {
        if (c.ppLivres <= 0) return '';
        const sobe = f.poderes.filter((p) => num(p.grau) < c.grauMax && R.custoPoder(p).porGrau <= c.ppLivres && !(LD.byKey(LD.PODERES, p.base) || {}).cosmico);
        const baratos = ['sentidos', 'adaptacao', 'movimento', 'armas_naturais'].filter((k) => !f.poderes.some((p) => p.base === k));
        return `<div class="caption"><b>Sobram ${c.ppLivres} PP.</b> Sugestões:
          ${sobe.map((p) => `<button class="btn" data-sobe="${esc(p.id)}">+1 Grau em ${esc(p.nome || '')} (${R.custoPoder(p).porGrau} PP)</button>`).join(' ')}
          ${baratos.map((k) => `<button class="btn" data-barato="${k}" title="${esc(LD.byKey(LD.PODERES, k).efeito)}">${esc(LD.byKey(LD.PODERES, k).nome)} 1 (1 PP)</button>`).join(' ')}</div>`;
      })()}
      <div class="btn-row">
        <button class="btn-primary" data-pronto>＋ Poder pronto</button>
        <button class="btn" data-novop>Montar do zero</button>
        <button class="btn" data-bib>Escolher da biblioteca</button>
        <a class="btn plain" href="#/poderes">Ver o catálogo</a>
      </div>

      ${temEscola || f.grimorio.length ? `
        <div class="subsect"><span>Grimório</span></div>
        <p class="muted">Feitiços não custam PP: as escolas sim. Extras sobem o Grau (CD e Energia), Falhas descem.</p>
        <div class="atk-list">${f.grimorio.map((ft) => { const x = R.feitico(f, ft, c); return `
          <div class="atk">
            <div><div class="atk-n">${esc(ft.nome || 'Feitiço sem nome')}</div><div class="muted small">${esc(x.escola ? x.escola.nome : 'sem escola')} · ${esc((LD.byKey(LD.PODERES, ft.efeito) || {}).nome || '')} · Grau ${x.final} · CD ${x.cd} · ${esc(x.custo)}</div></div>
            <button class="btn plain" data-editf="${esc(ft.id)}">Editar</button><button class="btn danger plain" data-rmf="${esc(ft.id)}">Tirar</button>
          </div>`; }).join('') || '<div class="empty small-empty">Grimório vazio.</div>'}</div>
        <div class="btn-row"><button class="btn" data-novof>＋ Criar feitiço</button></div>` : ''}`;

    bindCampos(el, f);
    const salvarPoder = (p) => mudar(f.id, (x) => {
      const i = x.poderes.findIndex((y) => y.id === p.id);
      if (i > -1) x.poderes[i] = p; else x.poderes.push(p);
    });
    el.querySelectorAll('[data-sobe]').forEach((b) => b.addEventListener('click', () => mudar(f.id, (x) => { const p = x.poderes.find((y) => y.id === b.dataset.sobe); if (p) p.grau = num(p.grau) + 1; })));
    el.querySelectorAll('[data-barato]').forEach((b) => b.addEventListener('click', () => mudar(f.id, (x) => { const k = b.dataset.barato; x.poderes.push({ id: LD.store.newId('pd'), base: k, nome: LD.byKey(LD.PODERES, k).nome, grau: 1, extras: [], falhas: [], variacoes: [] }); })));
    el.querySelector('[data-pronto]').addEventListener('click', () => LD.poderUI.escolherPronto(f, salvarPoder));
    el.querySelector('[data-novop]').addEventListener('click', () => LD.poderUI.construtor({ ficha: f, onSave: salvarPoder }));
    el.querySelector('[data-bib]').addEventListener('click', () => LD.poderUI.escolherDaBiblioteca(f, salvarPoder));
    el.querySelectorAll('[data-editp]').forEach((b) => b.addEventListener('click', () => LD.poderUI.construtor({ ficha: f, poder: f.poderes.find((p) => p.id === b.dataset.editp), onSave: salvarPoder })));
    el.querySelectorAll('[data-rmp]').forEach((b) => b.addEventListener('click', () => mudar(f.id, (x) => { x.poderes = x.poderes.filter((p) => p.id !== b.dataset.rmp); })));
    el.querySelectorAll('[data-libp]').forEach((b) => b.addEventListener('click', () => LD.poderUI.publicar(f.poderes.find((p) => p.id === b.dataset.libp))));
    const salvarFeitico = (ft) => mudar(f.id, (x) => {
      const i = x.grimorio.findIndex((y) => y.id === ft.id);
      if (i > -1) x.grimorio[i] = ft; else x.grimorio.push(ft);
    });
    const nf = el.querySelector('[data-novof]'); if (nf) nf.addEventListener('click', () => LD.poderUI.construtorFeitico({ ficha: f, onSave: salvarFeitico }));
    el.querySelectorAll('[data-editf]').forEach((b) => b.addEventListener('click', () => LD.poderUI.construtorFeitico({ ficha: f, feitico: f.grimorio.find((x) => x.id === b.dataset.editf), onSave: salvarFeitico })));
    el.querySelectorAll('[data-rmf]').forEach((b) => b.addEventListener('click', () => mudar(f.id, (x) => { x.grimorio = x.grimorio.filter((y) => y.id !== b.dataset.rmf); })));
  }

  /* ---------- 5. Perícias ---------- */
  // O que a Perícia já está fazendo na ficha, calculado.
  function efeitoAgora(p, g, c) {
    const s = sinal;
    const m = {
      luta: `Acerto ${s(c.A.FOR + 2 * g)} · desarmado ${1 + Math.floor(g / 2)}d6`,
      laminas: `Acerto ${s(c.A.AGI + 2 * g)} · +${Math.floor(g / 2)}d6 na lâmina`,
      pontaria: `Acerto ${s(c.A.AGI + 2 * g)} · +${Math.floor(g / 2)}d6 na arma`,
      esquiva: `Defesa ${c.defesa} · Esquivar ${s(c.esquivar)}`,
      acrobacia: `Reflexos ${s(c.reflexos)}`,
      atletismo: `Deslocamento ${c.deslocamento} m`,
      forca_bruta: `Carga ${c.carga} kg`,
      resiliencia: `Fortitude ${s(c.fortitude)} · PV ${c.pvMax}`,
      folego: `Fôlego ${c.folego} rodadas${c.energiaAttr === 'VIG' ? ` · Energia ${c.energiaMax}` : ''}`,
      tatica: `Ler a Brecha ${s(c.brecha)}`,
      medicina: `Kit de Cura ${c.kitCura}`,
      ocultismo: `Conjurar ${s(2 * g)} na Perícia`,
      percepcao: `Passiva ${c.percepcaoPassiva} · Iniciativa ${s(c.iniciativa)}`,
      concentracao: `Mente ${s(c.mente)}${c.energiaAttr === 'VON' ? ` · Energia ${c.energiaMax}` : ''}`,
      dominio: `Acerto dos poderes +${2 * g} · CD +${Math.floor(g / 2)}`,
      lideranca: `Ajudar dá +${2 + g}`
    };
    return m[p.key] || `Teste ${s(c.A[p.attr] + 2 * g)}`;
  }

  function passoTreino(el, f, c) {
    const teto = c.tetoPericia;
    const sugestoes = c.ptLivres > 0 ? LD.PERICIAS.filter((p) => num(f.pericias[p.key]) < teto)
      .sort((a, b) => (b.efeito ? 1 : 0) - (a.efeito ? 1 : 0) || c.A[b.attr] - c.A[a.attr] || num(f.pericias[b.key]) - num(f.pericias[a.key])).slice(0, 6) : [];
    el.innerHTML = `
      <h2>Perícias</h2>
      <p class="lead">Gaste os <b>${c.ptTotal} PT</b>. Cada grau custa <b>1 PT</b> e dá <b>+2</b> no teste. Grau máximo agora: <b>${teto}</b>. As Perícias com ★ mexem sozinhas na ficha.</p>
      ${sugestoes.length ? `<div class="caption"><b>Sobram ${c.ptLivres} PT.</b> Sugestões: ${sugestoes.map((p) => `<button class="btn" data-mais="${p.key}" title="${esc(p.efeito || p.desc)}">+1 ${esc(p.nome)}</button>`).join(' ')}</div>` : ''}
      ${LD.ATRIBUTOS.map((a) => `
        <div class="subsect"><span>${esc(a.nome)}</span><span class="tag">${a.key} ${c.A[a.key]}</span></div>
        <div class="per-list">${LD.PERICIAS.filter((p) => p.attr === a.key).map((p) => {
          const g = num(f.pericias[p.key]);
          return `<div class="per ${g ? 'on' : ''}">
            <div class="per-l"><span class="p-n" title="${esc(p.desc)}">${esc(p.nome)}${p.efeito ? ' <span class="star" title="' + esc(p.efeito) + '">★</span>' : ''}</span>
              ${g ? `<span class="p-fx">${esc(efeitoAgora(p, R.grau(f, p.key), c))}</span>` : `<span class="p-desc">${esc(p.desc)}</span>`}</div>
            <div class="per-r"><span class="num">${sinal(c.A[p.attr] + 2 * R.grau(f, p.key))}</span>
              <div class="seg" data-pericia="${p.key}">${[0, 1, 2, 3, 4, 5].map((i) => `<button class="${g === i ? 'on' : ''}" data-g="${i}" ${i > teto ? 'disabled' : ''} title="${esc(LD.GRAUS_PERICIA[i])}: ${i} PT">${i || '—'}</button>`).join('')}</div></div>
          </div>`;
        }).join('')}</div>`).join('')}
      <details class="more" ${keep('pt-' + f.id)}><summary>De onde vêm os ${c.ptTotal} PT</summary><div class="pt-break">
        Base 10${c.pot.pt ? ` · Potencial +${c.pot.pt}` : ''}${c.fe ? ` · Fé no Destino +${c.fe}` : ''}${c.degrau > 1 ? ` · Degraus de Classe +${(f.origem === 'treinado' ? 4 : 2) * (c.degrau - 1)}` : ''}${c.defeitosPT ? ` · Defeitos +${c.defeitosPT}` : ''}${num(f.bonus.pt) ? ` · Bônus ${sinal(num(f.bonus.pt))}` : ''}${num(f.ptTreino) ? ` · Mestragem (treino) +${f.ptTreino}` : ''}${R.treinoDe(f).ptGanho ? ` · Treino +${R.treinoDe(f).ptGanho - 2 * R.treinoDe(f).trocas}` : ''}
        <b>= ${c.ptTotal}</b>. Gastos: Perícias ${c.ptPericias}, Qualidades ${c.ptQualidades}${c.ptOpcao ? `, dinheiro ${c.ptOpcao}` : ''}.
      </div></details>`;
    el.querySelectorAll('[data-pericia] [data-g]').forEach((b) => b.addEventListener('click', () => {
      const k = b.closest('[data-pericia]').dataset.pericia;
      mudar(f.id, (x) => { const g = num(b.dataset.g); if (g) x.pericias[k] = g; else delete x.pericias[k]; });
    }));
    el.querySelectorAll('[data-mais]').forEach((b) => b.addEventListener('click', () => mudar(f.id, (x) => { x.pericias[b.dataset.mais] = num(x.pericias[b.dataset.mais]) + 1; })));
  }

  /* ---------- 6. Traços e Fraquezas ---------- */
  function passoTracos(el, f, c) {
    el.innerHTML = `
      <h2>Traços e Fraquezas</h2>
      <p class="lead">Traços são opcionais: Qualidades custam PT, até ${LD.MAX_DEFEITOS} Defeitos devolvem PT. A Fraqueza é obrigatória. Passe o mouse num Traço para ver o efeito.</p>
      <div class="grid two">
        <div><div class="subsect"><span>Qualidades</span></div>
          <div class="trait-list">${LD.QUALIDADES.map((q) => `
            <label class="trait ${f.qualidades.includes(q.key) ? 'on' : ''} ${q.origem && q.origem !== f.origem ? 'dim' : ''}">
              <input type="checkbox" data-q="${q.key}" ${f.qualidades.includes(q.key) ? 'checked' : ''}>
              <span class="t-n" title="${esc(q.efeito)}">${esc(q.nome)}</span><span class="tag gold">${q.custo} PT</span><span class="t-e">${esc(q.efeito)}</span></label>`).join('')}</div></div>
        <div><div class="subsect"><span>Defeitos</span><span class="tag">${f.defeitos.length}/${LD.MAX_DEFEITOS}</span></div>
          <div class="trait-list">${LD.DEFEITOS.map((q) => `
            <label class="trait def ${f.defeitos.includes(q.key) ? 'on' : ''}">
              <input type="checkbox" data-d="${q.key}" ${f.defeitos.includes(q.key) ? 'checked' : ''} ${!f.defeitos.includes(q.key) && f.defeitos.length >= LD.MAX_DEFEITOS ? 'disabled' : ''}>
              <span class="t-n" title="${esc(q.efeito)}">${esc(q.nome)}</span><span class="tag ok">+${q.custo} PT</span><span class="t-e">${esc(q.efeito)}</span></label>`).join('')}</div></div>
      </div>

      <div class="subsect"><span>Fraquezas</span></div>
      <p class="muted small">Pelo menos uma. Trazer a Fraqueza para a cena de propósito dá +2 Energia e 1 Determinação.</p>
      <div class="weak-list">${f.fraquezas.map((w, i) => `
        <div class="weak">
          <div class="weak-h">
            <input data-w="${i}" data-k="nome" value="${esc(w.nome)}" aria-label="Fraqueza">
            <select data-w="${i}" data-k="gravidade" aria-label="Gravidade">${LD.GRAVIDADES.map((g) => `<option value="${g.key}" ${(w.gravidade || 'leve') === g.key ? 'selected' : ''}>${g.nome}</option>`).join('')}</select>
            <button class="btn plain danger" data-rmw="${i}">Tirar</button>
          </div>
          ${w.efeito ? `<div class="small">${esc(w.efeito)}</div>` : ''}
          <details class="more"><summary>Gatilho, efeito e frequência</summary><div class="row">
            ${field('Gatilho', `<input data-w="${i}" data-k="gatilho" value="${esc(w.gatilho || '')}" placeholder="Quando acontece">`)}
            ${field('Efeito', `<input data-w="${i}" data-k="efeito" value="${esc(w.efeito || '')}">`)}
            ${field('Frequência', `<input data-w="${i}" data-k="frequencia" value="${esc(w.frequencia || '')}" placeholder="Uma vez a cada duas edições">`)}
          </div></details>
        </div>`).join('')}</div>
      <div class="btn-row">
        <select data-addw><option value="">＋ Fraqueza da lista…</option>${LD.FRAQUEZAS.map((w) => `<option value="${w.key}">${esc(w.nome)} (${(LD.byKey(LD.GRAVIDADES, w.gravidade) || {}).nome})</option>`).join('')}</select>
        <button class="btn" data-addw-propria>＋ Criar Fraqueza própria</button>
      </div>
      <details class="ref"><summary>Medidas de gravidade</summary><table class="tbl"><tbody>${LD.GRAVIDADES.map((g) => `<tr><td><b>${g.nome}</b></td><td>${esc(g.efeito)}</td></tr>`).join('')}</tbody></table></details>`;

    el.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('change', () => mudar(f.id, (x) => {
      x.qualidades = b.checked ? x.qualidades.concat(b.dataset.q) : x.qualidades.filter((k) => k !== b.dataset.q);
    })));
    el.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('change', () => mudar(f.id, (x) => {
      x.defeitos = b.checked ? x.defeitos.concat(b.dataset.d).slice(0, LD.MAX_DEFEITOS) : x.defeitos.filter((k) => k !== b.dataset.d);
    })));
    el.querySelectorAll('[data-w]').forEach((inp) => inp.addEventListener('change', () => mudar(f.id, (x) => { x.fraquezas[+inp.dataset.w][inp.dataset.k] = inp.value; })));
    el.querySelectorAll('[data-rmw]').forEach((b) => b.addEventListener('click', () => mudar(f.id, (x) => { x.fraquezas.splice(+b.dataset.rmw, 1); })));
    el.querySelector('[data-addw]').addEventListener('change', (e) => {
      const w = LD.byKey(LD.FRAQUEZAS, e.target.value); if (!w) return;
      mudar(f.id, (x) => { x.fraquezas.push({ key: w.key, nome: w.nome, efeito: w.efeito, gravidade: w.gravidade, gatilho: '', frequencia: '' }); });
    });
    el.querySelector('[data-addw-propria]').addEventListener('click', () => mudar(f.id, (x) => { x.fraquezas.push({ key: '', nome: 'Nova Fraqueza', efeito: '', gravidade: 'leve', gatilho: '', frequencia: '' }); }));
  }

  /* ---------- 7. Vida civil ---------- */
  function passoCivil(el, f, c) {
    const travado = f.aprovada && !LD.store.isMaster();
    el.innerHTML = `
      <h2>Vida civil e dinheiro</h2>
      <p class="lead">Herói também paga aluguel. O dinheiro é em dólares: o Arsenal desconta as compras do saldo.</p>
      <div class="row">
        ${field('Começa com', select('recursos', LD.DINHEIRO_PARTIDA.map((x) => ({ key: x.key, nome: `${x.nome} (${R.fmtUS(x.valor)})` })), Math.min(2, num(f.recursos, 1)), travado ? 'disabled' : ''), f.aprovada ? 'Congelado na aprovação.' : 'Rico (+US$ 15.000) e Sem Lugar (US$ 0) são Traços.')}
        ${f.origem === 'treinado' ? field('Família rica (Treinado)', checkbox('familiaRica', f.recursosOpcao === 'familia_rica', 'Troca 2 PT por US$ 10.000 iniciais', 'data-skip' + (travado ? ' disabled' : ''))) : ''}
        <div class="field"><label>Saldo agora</label><div class="ro-val">${esc(R.fmtUS(c.dinheiro))}</div><span class="hint">Inicial ${esc(R.fmtUS(c.dinheiroInicial))}${num(f.creditos) ? ` · créditos ${esc(R.fmtUS(f.creditos))}` : ''}${num(f.gastoTotal) ? ` · gastos ${esc(R.fmtUS(f.gastoTotal))}` : ''}</span></div>
      </div>
      ${checkbox('novaEgide', f.novaEgide, 'Faz parte da Nova Égide (o Arsenal do Observatório e os Kits são de graça)')}
      <div class="row" style="margin-top:16px">
        ${field('Emprego', input('vidaCivil.emprego', f.vidaCivil.emprego, 'placeholder="Entregadora, enfermeira, estudante…"'), `Salário: ${f.salario ? R.fmtUS(f.salario) + ' por semana' : 'a mestragem define na aprovação'}.`)}
        ${field('Onde mora', `<input name="vidaCivil.mora" list="moradias" value="${esc(f.vidaCivil.mora)}"><datalist id="moradias">${MORADIAS.map((x) => `<option value="${esc(x)}">`).join('')}</datalist>`)}
      </div>
      ${checkbox('vidaCivil.identidadeSecreta', f.vidaCivil.identidadeSecreta, 'Tem identidade secreta')}
      ${field('Quem sabe', input('vidaCivil.quemSabe', f.vidaCivil.quemSabe, 'placeholder="A avó, um colega do DAME…"'))}
      ${field('A Perda', textarea('perda', f.perda, 'placeholder="O que o Eclipse, o Conclave ou a Noite de 2016 já tiraram do herói."'), 'Quem entra no site lê as fichas. Se for segredo, conte em privado à mestragem.')}
      ${LD.store.isMaster() ? `<div class="subsect"><span>Mestragem</span></div>
        <div class="row">
          ${field('Bônus de PT', input('bonus.pt', f.bonus.pt, 'type="number"'))}
          ${field('Bônus de PP', input('bonus.pp', f.bonus.pp, 'type="number"'))}
          ${field('Bônus de Determinação', input('bonus.det', f.bonus.det, 'type="number"'))}
          ${field('PT de treino', input('ptTreino', f.ptTreino, 'type="number" min="0"'))}
          ${field('Classe (degrau)', select('ascensao', LD.DEGRAUS_CLASSE.map((v, i) => ({ key: i, nome: `${f.origem === 'treinado' ? 'Ápice' : 'Classe'} ${R.fmtClasse(v)} (degrau ${i + 1})` })), num(f.ascensao)), 'Sobe um degrau a cada marco da história.')}
          ${field('Salário por semana', select('salario', LD.SALARIOS, num(f.salario)))}
        </div>` : ''}`;
    bindCampos(el, f, (x, k) => { if (k === 'recursos') x.recursos = num(x.recursos, 1); if (k === 'salario') x.salario = num(x.salario); if (k === 'ascensao') x.ascensao = R.clamp(num(x.ascensao), 0, 9); });
    const fr = el.querySelector('[name="familiaRica"]');
    if (fr) fr.addEventListener('change', () => mudar(f.id, (x) => { x.recursosOpcao = fr.checked ? 'familia_rica' : ''; }));
  }

  /* =====================================================================
   * Inventário
   * ===================================================================== */
  /* =====================================================================
   * Treino
   * ===================================================================== */
  const rascunho = {
    ler(id) { try { return JSON.parse(localStorage.getItem('egide-treino-' + id) || 'null'); } catch (e) { return null; } },
    salvar(id, v) { try { localStorage.setItem('egide-treino-' + id, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } },
    limpar(id) { try { localStorage.removeItem('egide-treino-' + id); } catch (e) { /* sem armazenamento */ } }
  };
  function nomeArea(k) { const a = R.areasTreino().find((x) => x.key === k); return a ? a.nome : k; }
  function renderTreino(el, f, c, editar) {
    const t = R.treinoDe(f); const pode = R.podeTreinar(f);
    const st2 = st.treino = st.treino || {};
    const form = st2[f.id] = st2[f.id] || Object.assign({ area: 'luta', intensidade: 'duro', lugar: '', mentor: '', cena: '' }, rascunho.ler(f.id) || {});
    const areas = R.areasTreino();
    const b = R.bonusTreino(f, form.area, form.lugar);
    const pen = penalidade(f, 'tudo');
    const it = LD.INTENSIDADES.find((i) => i.key === form.intensidade);
    const mentores = LD.MENTORES_TREINO.filter((m) => R.valeTreino(m.areas, form.area) || R.valeTreino(m.areas, b.area.pericia));
    const nivel = String(c.degrau); const teto = R.tetoPTTreino(f); const noNivel = num(t.porNivel[nivel]);
    const marcas = Object.entries(t.marcas).filter(([, v]) => v > 0);
    const podeTrocar = (f.origem === 'arcano' && num(t.ptArea.magia) >= 2 * (t.trocas + 1)) || (f.origem === 'engenhoso' && num(t.ptArea.tecnologia) >= 2 * (t.trocas + 1));
    const falta = Math.max(0, LD.TREINO_CENA_MIN - form.cena.trim().length);
    el.innerHTML = `
      <div class="treino-topo">
        <div class="tt-box"><span class="caps">Treinos na semana</span><b>${pode.naSemana}<small>/${pode.limite}</small></b></div>
        <div class="tt-box"><span class="caps">PT de treino na ${esc(c.rotuloClasse)}</span><b>${noNivel}<small>/${teto}</small></b></div>
        <div class="tt-box"><span class="caps">PT ganhos no total</span><b>${t.ptGanho - 2 * t.trocas}</b>${t.trocas ? `<small class="muted">${t.trocas} trocados por PP</small>` : ''}</div>
      </div>
      ${marcas.length || t.distensao.length ? `<div class="marcas-row">${marcas.map(([k, v]) => `<span class="marca-chip"><b>${esc(nomeArea(k))}</b> ${'●'.repeat(Math.min(v, 5))}${'○'.repeat(Math.max(0, 5 - v))}${v > 5 ? ` +${v - 5}` : ''}</span>`).join('')}
        ${t.distensao.map((k) => `<span class="cond on" title="−2 nos treinos desta área até um descanso longo">Distensão: ${esc(nomeArea(k))}</span>`).join('')}</div>` : ''}
      ${podeTrocar && editar ? `<p><button class="btn" data-trocar>Trocar 2 PT de ${f.origem === 'arcano' ? 'Magia' : 'Tecnologia'} por 1 PP</button></p>` : ''}

      ${editar ? `<div class="card treino-form">
        <h3>Novo treino</h3>
        <div class="row">
          ${field('Área', select('t_area', areas.map((a) => ({ key: a.key, nome: a.nome })), form.area), `Rola ${esc(b.area.attr)} + ${esc(b.area.key === 'poder' || b.area.key === 'magia' ? LD.byKey(LD.PERICIAS, b.area.pericia).nome : 'a Perícia')}. O PT vai para: ${esc(b.area.destino)}.`)}
          ${field('Intensidade', select('t_int', LD.INTENSIDADES.map((i) => ({ key: i.key, nome: `${i.nome} · CD ${i.cd} · ${i.marcas} Marca${i.marcas > 1 ? 's' : ''}` })), form.intensidade), esc(it.risco))}
        </div>
        <div class="row">
          ${field('Onde', select('t_lugar', LD.LUGARES_TREINO.map((l) => ({ key: l.key, nome: l.nome + (l.key && (R.valeTreino(l.areas, form.area) || R.valeTreino(l.areas, b.area.pericia)) ? ' (+2)' : '') })), form.lugar), b.lugar ? 'Lugar de treino: +2.' : 'Sem bônus de lugar para esta área.')}
          ${field('Mentor na cena', select('t_mentor', [{ key: '', nome: 'Sem mentor' }].concat(mentores.map((m) => ({ key: m.key, nome: m.nome }))), form.mentor), 'Vantagem. Precisa de Vínculo 2 com ele.')}
        </div>
        ${field(`A cena do treino (mínimo ${LD.TREINO_CENA_MIN} caracteres)`, textarea('t_cena', form.cena, 'rows="8" placeholder="Onde, o quê e como: o que o herói ainda não consegue fazer, e o exercício. Correr a escadaria de Hespéria, levantar um carro, acertar cem latas…"'), `<span data-cont>${form.cena.trim().length}</span> / ${LD.TREINO_CENA_MIN}`)}
        <div class="treino-rolar">
          <div class="big-mod">${sinal(b.total + pen.p)}</div>
          <div class="muted small">${esc(b.area.attr)} ${sinal(b.attr)} · Perícia ${sinal(b.pericia)}${b.lugar ? ' · lugar +2' : ''}${b.distensao ? ' · Distensão −2' : ''}${pen.p ? ` · ${esc(pen.motivos.join(', '))} ${pen.p}` : ''}${form.mentor ? ' · Vantagem' : ''} contra CD ${it.cd}</div>
          <button class="btn primary" data-treinar ${pode.ok && !falta ? '' : 'disabled'}>Treinar</button>
          <div class="muted small" data-motivo>${!pode.ok ? esc(pode.motivo) : falta ? `Faltam ${falta} caracteres na cena.` : ''}</div>
        </div>
      </div>` : pode.ok ? '' : `<p class="muted">${esc(pode.motivo)}</p>`}

      ${t.log.length ? `<div class="subsect"><span>Diário de treino</span></div>
        <div class="treino-log">${t.log.slice().reverse().map((e) => `<details class="tlog ${e.passou ? 't-ok' : 't-bad'}">
          <summary><span class="muted small">${esc(new Date(e.quando).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }))}</span>
            <b>${esc(nomeArea(e.area))}</b> · ${esc((LD.INTENSIDADES.find((i) => i.key === e.intensidade) || {}).nome || '')}
            · ${e.total} vs CD ${e.cd} <span class="tag ${e.passou ? 'ok' : 'bad'}">${e.passou ? `+${e.marcas} Marca${e.marcas > 1 ? 's' : ''}` : 'falhou'}</span>
            ${e.novosPT ? `<span class="tag gold">+${e.novosPT} PT</span>` : ''}${e.lesao ? `<span class="tag bad">${esc(e.lesao)}</span>` : ''}${e.fadiga ? `<span class="tag warn">+${e.fadiga} Fadiga</span>` : ''}</summary>
          <div class="tlog-body"><p class="muted small">d20 [${esc((e.dados || []).join(', '))}]${e.lugar ? ' · ' + esc((LD.LUGARES_TREINO.find((l) => l.key === e.lugar) || {}).nome || '') : ''}${e.mentor ? ' · mentor: ' + esc((LD.MENTORES_TREINO.find((m) => m.key === e.mentor) || {}).nome || '') : ''}</p>
            <p class="cena">${esc(e.cena).replace(/\n/g, '<br>')}</p></div>
        </details>`).join('')}</div>` : '<p class="muted">Nenhum treino ainda. Cada treino é uma cena: escreva, role, junte Marcas. 5 Marcas numa área viram 1 PT.</p>'}`;

    const troca = el.querySelector('[data-trocar]');
    if (troca) troca.addEventListener('click', () => mudar(f.id, (x) => { const tt = R.treinoDe(x); tt.trocas += 1; x.treino = tt; }));
    if (!editar) return;
    const redesenhar = () => { rascunho.salvar(f.id, form); renderTreino(el, LD.fichas.ficha(f.id), R.calc(LD.fichas.ficha(f.id)), editar); };
    [['t_area', 'area'], ['t_int', 'intensidade'], ['t_lugar', 'lugar'], ['t_mentor', 'mentor']].forEach(([n, k]) => {
      el.querySelector(`[name="${n}"]`).addEventListener('change', (e) => { form[k] = e.target.value; if (k === 'area') form.mentor = ''; redesenhar(); });
    });
    const ta = el.querySelector('[name="t_cena"]'); const btn = el.querySelector('[data-treinar]');
    ta.addEventListener('input', () => {
      form.cena = ta.value; rascunho.salvar(f.id, form);
      const n = ta.value.trim().length; el.querySelector('[data-cont]').textContent = n;
      const ok = pode.ok && n >= LD.TREINO_CENA_MIN; btn.disabled = !ok;
      el.querySelector('[data-motivo]').textContent = !pode.ok ? pode.motivo : n < LD.TREINO_CENA_MIN ? `Faltam ${LD.TREINO_CENA_MIN - n} caracteres na cena.` : '';
    });
    btn.addEventListener('click', () => {
      const fx = LD.fichas.ficha(f.id); const p2 = R.podeTreinar(fx);
      if (!p2.ok) { LD.ui.toast(p2.motivo, 'erro'); return; }
      if (form.cena.trim().length < LD.TREINO_CENA_MIN) return;
      const bb = R.bonusTreino(fx, form.area, form.lugar); const pp = penalidade(fx, 'tudo');
      const r = LD.ui.rolarTeste(`${titulo(fx)} · Treino de ${bb.area.nome} (${it.nome})`, bb.total + pp.p, { modo: form.mentor ? 'vantagem' : 'normal', cd: it.cd });
      let entrada;
      mudar(f.id, (x) => { entrada = R.aplicarTreino(x, { area: form.area, intensidade: form.intensidade, lugar: form.lugar, mentor: form.mentor, cena: form.cena.trim(), natural: r.natural, dados: r.dados, total: r.total }); });
      form.cena = ''; rascunho.limpar(f.id); rascunho.salvar(f.id, Object.assign({}, form));
      if (entrada) LD.ui.toast(entrada.passou ? `Passou! +${entrada.marcas} Marca${entrada.marcas > 1 ? 's' : ''} em ${bb.area.nome}${entrada.novosPT ? `, e ${entrada.novosPT} PT novo` : ''}.${entrada.lesao ? ' Lesão: ' + entrada.lesao + '.' : ''}` : `Falhou.${entrada.lesao ? ' Lesão: ' + entrada.lesao + '.' : ''}`, entrada.lesao ? 'erro' : undefined);
    });
  }

  function renderInventario(el, f, c, editar) {
    const inv = f.inventario || [];
    const cats = LD.CATEGORIAS;
    el.innerHTML = `
      <div class="page-head" style="margin-bottom:12px">
        <div class="saldo-box">
          <div><span class="caps">Saldo</span><div class="saldo">${esc(R.fmtUS(c.dinheiro))}</div></div>
          ${editar && num(f.salario) > 0 ? (f.semanaSalario === R.semanaAtual() ? `<span class="tag ok">Salário da semana recebido</span>` : `<button class="btn" data-salario>Receber o salário da semana (+${esc(R.fmtUS(f.salario))})</button>`) : `<span class="muted small">${num(f.salario) ? '' : 'Sem salário: a mestragem define.'}</span>`}
          ${f.novaEgide ? '<span class="tag ok">Nova Égide: Observatório grátis</span>' : ''}
        </div>
        <a class="btn-primary" href="#/arsenal/${esc(f.id)}">Ir ao Arsenal</a>
      </div>
      ${inv.length ? cats.map((cat) => {
        const itens = inv.map((x, i) => Object.assign({ i }, x)).filter((x) => x.cat === cat.key);
        if (!itens.length) return '';
        return `<div class="subsect"><span>${esc(cat.nome)}</span></div>
          <div class="inv">${itens.map((x) => `
            <div class="inv-row ${x.equipado ? 'eq' : ''}">
              <div><div class="i-n">${esc(x.nome)}</div>
                <details class="more" style="margin-top:4px"><summary>Detalhes</summary><div class="small">${[x.dano ? 'Dano ' + x.dano : '', x.potencia ? 'Potência ' + x.potencia : '', x.protecao ? 'Proteção ' + x.protecao : '', x.defesa ? 'Defesa ' + sinal(x.defesa) : '', x.propriedades || ''].filter(Boolean).map(esc).join(' · ')}</div>
                <div class="tiny caps">${esc({ compra: 'Comprado', observatorio: 'Observatório', mestre: 'Dado pela mestragem', despojo: 'Despojo' }[x.origem] || '')}</div></details></div>
              <div class="inv-c">${x.cargasMax ? `${editar ? stepper('carga' + x.i, num(x.cargas), 0, Math.max(num(x.cargasMax), num(x.cargas)) + 5) : `<b>${num(x.cargas)}</b>`}<span class="tiny muted">cargas</span>` : ''}</div>
              <div class="inv-a">
                ${['protecao', 'arma', 'especial'].includes(x.cat) && editar ? checkbox('eq' + x.i, x.equipado, 'Usando', `data-eq="${x.i}"`) : ''}
                ${editar ? `<button class="btn plain danger" data-rmi="${x.i}">Tirar</button>` : ''}
              </div>
            </div>`).join('')}</div>`;
      }).join('') : '<div class="empty">Mochila vazia. O Arsenal tem armas, proteção, gadgets, veículos e serviços.</div>'}
      ${editar ? `<div class="btn-row"><button class="btn" data-add-livre>＋ Item livre (despojo, presente)</button></div>` : ''}
      ${LD.store.isMaster() ? `<div class="subsect"><span>Dinheiro (mestragem)</span></div>
        <div class="btn-row"><label class="inline">Valor (US$) <input type="number" data-aj-valor placeholder="+500 ou −200" style="width:140px"></label>
        <label class="inline">Motivo <input data-aj-motivo placeholder="Recompensa, multa…" style="width:220px"></label>
        <button class="btn" data-ajuste>Lançar</button></div>` : ''}
      ${(f.extrato || []).length ? `<div class="subsect"><span>Extrato</span></div>
        <div class="tbl-wrap"><table class="tbl extrato"><tbody>${f.extrato.slice().reverse().slice(0, 25).map((x) => `<tr><td class="muted small">${esc(new Date(x.quando).toLocaleDateString('pt-BR'))}</td><td>${esc(x.motivo)}</td><td class="r ${x.valor < 0 ? 'neg' : 'pos'}">${x.valor < 0 ? '−' : '+'}${esc(R.fmtUS(Math.abs(x.valor)).replace('US$ ', 'US$ '))}</td></tr>`).join('')}</tbody></table></div>` : ''}
      ${(f.compras || []).length ? `<div class="subsect"><span>Compras</span></div>
        <table class="tbl"><tbody>${f.compras.slice().reverse().slice(0, 20).map((x) => `<tr><td class="muted small">${esc(new Date(x.quando).toLocaleDateString('pt-BR'))}</td><td>${esc(x.item)}</td><td class="small">${esc(x.resultado)}</td></tr>`).join('')}</tbody></table>` : ''}`;
    bindSteppers(el, (k, v) => mudar(f.id, (x) => { x.inventario[+k.replace('carga', '')].cargas = v; }));
    const sal = el.querySelector('[data-salario]');
    if (sal) sal.addEventListener('click', () => mudar(f.id, (x) => {
      if (x.semanaSalario === R.semanaAtual()) return;
      x.semanaSalario = R.semanaAtual(); x.creditos = num(x.creditos) + num(x.salario);
      x.extrato = (x.extrato || []).concat({ quando: Date.now(), valor: num(x.salario), motivo: 'Salário da semana' }).slice(-80);
    }));
    const aj = el.querySelector('[data-ajuste]');
    if (aj) aj.addEventListener('click', () => {
      const v = num(el.querySelector('[data-aj-valor]').value); const m = el.querySelector('[data-aj-motivo]').value || 'Ajuste da mestragem';
      if (!v) return;
      mudar(f.id, (x) => {
        if (v > 0) x.creditos = num(x.creditos) + v; else x.gastoTotal = num(x.gastoTotal) - v;
        x.extrato = (x.extrato || []).concat({ quando: Date.now(), valor: v, motivo: m }).slice(-80);
      });
    });
    el.querySelectorAll('[data-eq]').forEach((b) => b.addEventListener('change', () => mudar(f.id, (x) => { x.inventario[+b.dataset.eq].equipado = b.checked; })));
    el.querySelectorAll('[data-rmi]').forEach((b) => b.addEventListener('click', () => mudar(f.id, (x) => { x.inventario.splice(+b.dataset.rmi, 1); })));
    const livre = el.querySelector('[data-add-livre]');
    if (livre) livre.addEventListener('click', () => {
      LD.ui.openDrawer({
        eyebrow: 'Inventário', title: 'Item livre',
        body: `${field('Nome', '<input name="nome" class="big">')}
          ${field('Categoria', select('cat', cats.map((x) => ({ key: x.key, nome: x.nome })), 'gadget'))}
          <div class="row">${field('Proteção', '<input name="protecao" type="number" min="0" max="10">')}${field('Defesa', '<input name="defesa" type="number" min="-3" max="5">')}${field('Cargas', '<input name="cargas" type="number" min="0" max="20">')}</div>
          ${field('Propriedades', '<textarea name="propriedades"></textarea>')}
          ${field('De onde veio', select('origem', [{ key: 'despojo', nome: 'Despojo' }, { key: 'mestre', nome: 'Dado pela mestragem' }, { key: 'compra', nome: 'Compra' }], 'despojo'))}`,
        foot: '<button class="btn-primary" data-ok>Pôr na mochila</button>',
        onMount: (d) => d.querySelector('[data-ok]').addEventListener('click', () => {
          const v = LD.ui.readForm(d.querySelector('.drawer-body'));
          if (!v.nome) { LD.ui.toast('Dê um nome ao item.', 'erro'); return; }
          mudar(f.id, (x) => { x.inventario.push({ uid: LD.store.newId('iv'), itemId: '', nome: v.nome, cat: v.cat, protecao: num(v.protecao), defesa: num(v.defesa), cargas: num(v.cargas), cargasMax: num(v.cargas), propriedades: v.propriedades, origem: v.origem, equipado: false }); });
          LD.ui.closeDrawer();
        })
      });
    });
  }

  /* =====================================================================
   * História
   * ===================================================================== */
  function renderHistoria(el, f, c, editar) {
    const tracos = f.qualidades.concat(f.defeitos).map((k) => LD.byKey(LD.QUALIDADES, k) || LD.byKey(LD.DEFEITOS, k)).filter(Boolean);
    el.innerHTML = `
      <div class="hist ${editar ? '' : 'ro'}">
        ${field('Aparência', textarea('aparencia', f.aparencia, 'placeholder="Como os outros o veem, com e sem máscara."'))}
        ${field('História', textarea('historia', f.historia, 'rows="10" placeholder="De onde veio, o que viu, por que veste a máscara."'))}
        ${tracos.length ? `<div class="subsect"><span>De onde vêm os Traços</span></div>
          ${tracos.map((t) => field(t.nome, `<input name="tracoNotas.${t.key}" value="${esc((f.tracoNotas || {})[t.key] || '')}" placeholder="Uma frase.">`)).join('')}` : ''}
        ${field('Notas', textarea('notas', f.notas, 'rows="5"'))}
      </div>`;
    bindCampos(el, f);
    if (!editar) el.querySelectorAll('input,textarea').forEach((x) => { x.disabled = true; });
  }

  LD.fichas = { normalizar, ficha, mudar, titulo };
  LD.views.fichas = { titulo: 'Fichas', numeral: 'I', render: renderLista };
  LD.views.ficha = { titulo: 'Ficha', numeral: 'I', render: renderFicha };
})();
