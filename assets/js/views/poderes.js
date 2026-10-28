/*
 * Égide · Poderes
 * Construtor de poderes (catálogo ou do zero, com Extras, Falhas e Variações), construtor de feitiços,
 * biblioteca compartilhada e a página de catálogo.
 */
(function () {
  const LD = window.LD;
  const { esc, sinal, field, select, checkbox } = LD.ui;
  const R = LD.rules;
  const num = R.num;
  const st = { aba: 'prontos', grupo: '', busca: '', grupoPronto: '' };

  function opcoesBase(sel) {
    return LD.GRUPOS_PODER.map((g) => `<optgroup label="${esc(g)}">${LD.PODERES.filter((p) => p.grupo === g)
      .map((p) => `<option value="${p.key}" ${p.key === sel ? 'selected' : ''}>${esc(p.nome)} · ${p.custo} PP/Grau</option>`).join('')}</optgroup>`).join('');
  }

  function minhasFichas() {
    const meu = LD.store.uid();
    return LD.store.list('personagens').filter((x) => LD.store.state.local || LD.store.isMaster() || x.ownerId === meu);
  }

  /* ---------- Construtor de poder ---------- */
  function construtor({ ficha, poder, onSave, base }) {
    const novo = !poder;
    const f = ficha ? LD.fichas.normalizar(JSON.parse(JSON.stringify(ficha))) : null;
    const p = poder ? JSON.parse(JSON.stringify(poder)) : {
      id: LD.store.newId('pd'), base: base || 'rajada', nome: '', descritor: '', grau: 2, attr: '', extras: [], falhas: f && f.origem === 'engenhoso' ? ['removivel'] : [], variacoes: [], alvo: '', modo: 'protecao', notas: ''
    };
    const c = f ? R.calc(f) : null;
    const grauMax = c ? c.grauMax : 8;
    // PP já gastos sem este poder (para mostrar o que sobra)
    const gastosSem = f ? f.poderes.filter((x) => x.id !== p.id).reduce((s, x) => s + R.custoPoder(x).total, 0) : 0;

    const body = `
      <div class="builder">
        <div class="b-form">
          ${field('Nome do poder', `<input name="nome" class="big" value="${esc(p.nome)}" placeholder="Gelo Negro">`)}
          ${field('Como ele parece', `<textarea name="descritor" rows="2" placeholder="Luz dourada que sai das mãos. Gelo negro que cresce do chão.">${esc(p.descritor)}</textarea>`)}
          <div class="row">
            ${field('Efeito (catálogo ou básico)', `<select name="base">${opcoesBase(p.base)}</select>`)}
            ${field('Atributo-chave', '<select name="attr" data-attr></select>')}
          </div>
          <div class="row" data-extras-base></div>
          <div class="field"><label>Grau <b data-grau-v>${p.grau}</b> <span class="muted">(máximo ${grauMax}${f ? ' nesta ficha' : ''})</span></label>
            <input type="range" name="grau" min="1" max="8" value="${p.grau}"></div>
          <details class="more" ${p.extras.length ? 'open' : ''}><summary>Extras: deixam o poder melhor (custam mais)</summary>
            <div class="mods">${LD.EXTRAS.map((x) => `<label class="mod" title="${esc(x.efeito)}"><input type="checkbox" data-ex="${x.key}" ${p.extras.includes(x.key) ? 'checked' : ''}><b>${esc(x.nome)}</b><span class="tag ok">+${x.custo}${x.tipo === 'grau' ? '/G' : ''}</span></label>`).join('')}</div>
            <p class="muted tiny">Passe o mouse num Extra para ver o que ele faz.</p></details>
          <details class="more" ${p.falhas.length ? 'open' : ''}><summary>Falhas: limitam o poder (custam menos)</summary>
            <div class="mods">${LD.FALHAS.map((x) => `<label class="mod fl" title="${esc(x.efeito)}"><input type="checkbox" data-fl="${x.key}" ${p.falhas.includes(x.key) ? 'checked' : ''}><b>${esc(x.nome)}</b><span class="tag warn">−1/G</span></label>`).join('')}</div></details>
          <details class="more" ${p.variacoes.length ? 'open' : ''}><summary>Variações: outros usos do mesmo poder (+1 PP cada)</summary>
            <p class="muted small">Grau igual ou menor. Só uma funciona por vez.</p>
            <div data-vars></div>
            <button type="button" class="btn" data-addvar>＋ Variação</button></details>
          <details class="more"><summary>Notas</summary>${field('Notas', `<textarea name="notas" rows="2">${esc(p.notas || '')}</textarea>`)}</details>
        </div>
        <aside class="b-prev panel framed" data-prev></aside>
      </div>`;

    const foot = `${!ficha ? `<select data-alvo-ficha><option value="">Só na biblioteca</option>${minhasFichas().map((x) => `<option value="${esc(x.id)}">${esc(x.codinome || x.nome || 'Herói')}</option>`).join('')}</select>` : ''}
      ${!novo && ficha ? '' : ''}
      <button class="btn-primary" data-salvar>${ficha ? (novo ? 'Pôr na ficha' : 'Salvar') : 'Salvar'}</button>`;

    LD.ui.openDrawer({
      eyebrow: f ? `Poder · ${LD.fichas.titulo(f)}` : 'Construtor de poder', title: novo ? 'Montar poder' : 'Editar poder', body, foot, wide: true,
      onMount: (d) => {
        const vars = p.variacoes.slice();
        const varsEl = d.querySelector('[data-vars]');
        function renderVars() {
          varsEl.innerHTML = vars.map((v, i) => `<div class="var-row">
            <input data-vn="${i}" value="${esc(v.nome || '')}" placeholder="Nome (Muralha de gelo)">
            <select data-ve="${i}">${opcoesBase(v.efeito || p.base)}</select>
            <input data-vg="${i}" type="number" min="1" max="8" value="${esc(v.grau || p.grau)}" title="Grau">
            <button type="button" class="icon-btn" data-vr="${i}" aria-label="Tirar">×</button></div>`).join('');
          varsEl.querySelectorAll('[data-vr]').forEach((b) => b.addEventListener('click', () => { lerVars(); vars.splice(+b.dataset.vr, 1); renderVars(); atualizar(); }));
        }
        function lerVars() {
          varsEl.querySelectorAll('.var-row').forEach((row, i) => {
            vars[i] = { nome: row.querySelector('[data-vn]').value, efeito: row.querySelector('[data-ve]').value, grau: num(row.querySelector('[data-vg]').value, 1) };
          });
        }
        function ler() {
          lerVars();
          const out = Object.assign({}, p, {
            nome: d.querySelector('[name=nome]').value.trim(),
            descritor: d.querySelector('[name=descritor]').value,
            base: d.querySelector('[name=base]').value,
            attr: d.querySelector('[name=attr]').value,
            grau: num(d.querySelector('[name=grau]').value, 1),
            extras: Array.from(d.querySelectorAll('[data-ex]:checked')).map((x) => x.dataset.ex),
            falhas: Array.from(d.querySelectorAll('[data-fl]:checked')).map((x) => x.dataset.fl),
            variacoes: vars.filter((v) => v.nome || v.efeito).map((v) => Object.assign({}, v)),
            notas: d.querySelector('[name=notas]').value
          });
          const alvo = d.querySelector('[name=alvo]'); out.alvo = alvo ? alvo.value : '';
          const modo = d.querySelector('[name=modo]'); out.modo = modo ? modo.value : '';
          return out;
        }
        function atualizarBase() {
          const b = LD.byKey(LD.PODERES, d.querySelector('[name=base]').value);
          const sel = d.querySelector('[data-attr]');
          const atual = sel.value || p.attr;
          const attrs = b.attrs.length ? b.attrs : LD.ATRIBUTOS.map((a) => a.key);
          sel.innerHTML = attrs.map((a) => `<option value="${a}" ${a === atual ? 'selected' : ''}>${a}</option>`).join('');
          const ex = d.querySelector('[data-extras-base]');
          ex.innerHTML = b.alvoAtributo ? field('Atributo que sobe', select('alvo', LD.ATRIBUTOS.map((a) => ({ key: a.key, nome: a.nome })), p.alvo || 'FOR'))
            : b.modos ? field('Modo da Defesa', select('modo', [{ key: 'protecao', nome: 'Proteção Grau × 5' }, { key: 'defesa', nome: '+Grau/2 de Defesa' }, { key: 'absorcao', nome: 'Absorção Grau × 3 de um tipo' }], p.modo || 'protecao'))
            : `<div class="caption" style="grid-column:1/-1;margin:0 0 12px">${esc(b.efeito)}</div>`;
          ex.querySelectorAll('select').forEach((s) => s.addEventListener('change', atualizar));
        }
        function atualizar() {
          const x = ler();
          const b = LD.byKey(LD.PODERES, x.base);
          d.querySelector('[data-grau-v]').textContent = x.grau;
          const cp = R.custoPoder(x);
          const g = LD.GRAUS[x.grau];
          const A = c ? c.A : { FOR: 3, AGI: 3, VIG: 3, INT: 3, VON: 3, PRE: 3 };
          const cls = c ? c.classe : 1;
          const at = A[x.attr] || 0;
          const pot = Math.round(cls * 5);
          const avisos = [];
          if (x.grau > grauMax) avisos.push(`Grau ${x.grau} passa do máximo (${grauMax}).`);
          if (b.cosmico && x.grau > 2) avisos.push('Cósmico: Grau máximo 2 para jogadores.');
          if (b.cosmico) avisos.push('Cósmico precisa da aprovação da mestragem.');
          if (b.key === 'controle_mental') avisos.push('Controle Mental sempre pede um Preço narrativo.');
          if (x.extras.includes('mistico') && f && !['mitico', 'arcano'].includes(f.origem)) avisos.push('Místico é só de Míticos e Arcanos.');
          if (x.extras.includes('seletivo') && !x.extras.includes('area')) avisos.push('Seletivo só faz sentido com Área.');
          x.variacoes.forEach((v) => { if (num(v.grau) > x.grau) avisos.push(`A Variação "${v.nome || '?'}" tem Grau maior que o poder.`); });
          if (cp.porGrau === 1 && (x.falhas.length > 0)) avisos.push('Falhas não descem de 1 PP por Grau.');
          const sobra = f ? c.ppTotal - gastosSem - cp.total : null;
          d.querySelector('[data-prev]').innerHTML = `
            <div class="eyebrow">Custo</div>
            <div class="cost-big"><b>${cp.total}</b><span>PP</span></div>
            <div class="small muted">${cp.porGrau} por Grau × ${x.grau}${cp.fixo ? ` + ${cp.fixo}` : ''}${cp.variacoes ? ` + ${cp.variacoes}` : ''}</div>
            ${f ? `<div class="orc ${sobra < 0 ? 'bad' : ''}" style="margin-top:12px"><div class="orc-h"><span>Sobram na ficha</span><b>${sobra}</b><small>de ${c.ppTotal} PP</small></div></div>` : ''}
            <div class="caps" style="margin-top:14px;color:var(--ink)">No Grau ${x.grau}</div>
            <ul class="mini">
              ${b.tipo === 'ataque' ? `<li><span>Dano</span><b>${g.dano}+${at + pot}</b></li><li><span>Acerto</span><b>${sinal(at + ((c && c.profEnergetico) || Math.ceil(x.grau / 2)) + (x.extras.includes('preciso') ? 2 : 0))}</b></li>` : ''}
              ${b.tipo === 'cura' ? `<li><span>Cura</span><b>${g.dano}+${at}</b></li>` : ''}
              ${b.protecao && (!b.modos || x.modo === 'protecao') ? `<li><span>Proteção</span><b>${b.protecao(x.grau, cls)}</b></li>` : ''}
              ${b.modos && x.modo === 'defesa' ? `<li><span>Defesa</span><b>+${Math.ceil(x.grau / 2)}</b></li>` : ''}
              ${b.modos && x.modo === 'absorcao' ? `<li><span>Absorção</span><b>${x.grau * 3}</b></li>` : ''}
              ${b.alvoAtributo ? `<li><span>${esc(x.alvo || 'FOR')}</span><b>+${x.grau}</b></li>` : ''}
              <li><span>CD</span><b>${10 + at + x.grau}</b></li>
              <li><span>Alcance</span><b>${esc(x.extras.includes('longo') ? (LD.GRAUS[Math.min(8, x.grau + 2)] || g).alcance : g.alcance)}</b></li>
            </ul>
            <details class="more"><summary>Mais</summary><ul class="mini"><li><span>Área</span><b>${esc(g.area)}</b></li><li><span>Duração</span><b>${esc(g.duracao)}</b></li></ul>
            <p class="tiny muted">${c ? `Com os números de ${esc(LD.fichas.titulo(f))}: ${x.attr} ${at}, Classe ${R.fmtClasse(cls)} (Potência ${pot}).` : 'Exemplo com atributo 3 e Classe 1.'}</p></details>
            ${x.pronto && LD.efeitoPronto(x.pronto, x.grau) ? `<div class="caption"><b>Grau ${x.grau}:</b> ${esc(LD.efeitoPronto(x.pronto, x.grau).agora)}</div>` : ''}
            ${avisos.length ? `<ul class="avisos">${avisos.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}`;
        }
        renderVars();
        atualizarBase();
        atualizar();
        d.querySelector('[name=base]').addEventListener('change', () => { atualizarBase(); atualizar(); });
        d.querySelector('.drawer-body').addEventListener('input', atualizar);
        d.querySelector('.drawer-body').addEventListener('change', atualizar);
        d.querySelector('[data-addvar]').addEventListener('click', () => { lerVars(); vars.push({ nome: '', efeito: d.querySelector('[name=base]').value, grau: Math.max(1, num(d.querySelector('[name=grau]').value) - 1) }); renderVars(); atualizar(); });
        d.querySelector('[data-salvar]').addEventListener('click', () => {
          const x = ler();
          if (!x.nome) x.nome = (LD.byKey(LD.PODERES, x.base) || {}).nome || 'Poder';
          if (onSave) { onSave(x); LD.ui.closeDrawer(); LD.ui.toast(`${x.nome} salvo.`); return; }
          const alvo = d.querySelector('[data-alvo-ficha]');
          const fichaId = alvo && alvo.value;
          publicar(x, true).then(() => {
            if (fichaId) LD.fichas.mudar(fichaId, (fx) => { fx.poderes.push(Object.assign({}, x, { id: LD.store.newId('pd') })); }).then(() => LD.ui.toast(`${x.nome} foi para a ficha.`));
          });
          LD.ui.closeDrawer();
        });
      }
    });
  }

  // Guarda um poder na biblioteca compartilhada.
  function publicar(p, silencioso) {
    const doc = JSON.parse(JSON.stringify(p));
    const existente = doc.bibliotecaId && LD.store.get('poderes', doc.bibliotecaId);
    doc.id = existente && LD.store.canEdit('poderes', existente) ? existente.id : LD.store.newId('bp');
    delete doc.bibliotecaId;
    delete doc.ownerId; delete doc.ownerName;
    if (existente && LD.store.canEdit('poderes', existente)) { doc.ownerId = existente.ownerId; doc.ownerName = existente.ownerName; }
    return LD.store.save('poderes', doc).then((s) => { if (!silencioso) LD.ui.toast(`${s.nome} está na biblioteca.`); return s; });
  }

  function escolherDaBiblioteca(f, onPick) {
    const lista = LD.store.list('poderes').slice().sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
    LD.ui.openDrawer({
      eyebrow: 'Biblioteca', title: 'Poderes da biblioteca', wide: true,
      body: lista.length ? `<div class="lib-pick">${lista.map((p) => { const b = LD.byKey(LD.PODERES, p.base) || {}; return `
        <div class="pow"><div class="pow-h"><b>${esc(p.nome)}</b><span class="tag">${esc(b.nome || '')} ${p.grau}</span><span class="tag gold">${R.custoPoder(p).total} PP</span></div>
        ${p.descritor ? `<div class="italic paper-2 small">${esc(p.descritor)}</div>` : ''}<div class="tiny caps">por ${esc(p.ownerName || '')}</div>
        <button class="btn" data-pegar="${esc(p.id)}">Pegar</button></div>`; }).join('')}</div>` : '<div class="empty">A biblioteca está vazia. Monte um poder e ponha nela.</div>',
      onMount: (d) => d.querySelectorAll('[data-pegar]').forEach((b) => b.addEventListener('click', () => {
        const p = JSON.parse(JSON.stringify(LD.store.get('poderes', b.dataset.pegar)));
        const novo = Object.assign({}, p, { id: LD.store.newId('pd'), bibliotecaId: p.id });
        delete novo.ownerId; delete novo.ownerName; delete novo.updatedAt;
        LD.ui.closeDrawer();
        setTimeout(() => construtor({ ficha: f, poder: novo, onSave: onPick }), 350);
      }))
    });
  }

  /* ---------- Construtor de feitiço ---------- */
  function construtorFeitico({ ficha, feitico, onSave }) {
    const f = LD.fichas.normalizar(JSON.parse(JSON.stringify(ficha)));
    const c = R.calc(f);
    const escolas = f.poderes.filter((p) => (LD.byKey(LD.PODERES, p.base) || {}).escola);
    const ft = feitico ? JSON.parse(JSON.stringify(feitico)) : { id: LD.store.newId('ft'), nome: '', escolaId: escolas[0] ? escolas[0].id : '', efeito: 'ataque', grau: 1, extras: [], falhas: [], componente: false, precoProprio: '', novo: false, componentes: '' };
    const efeitos = LD.PODERES.filter((p) => p.grupo === 'Efeito básico');
    LD.ui.openDrawer({
      eyebrow: `Grimório · ${LD.fichas.titulo(f)}`, title: feitico ? 'Editar feitiço' : 'Criar feitiço', wide: true,
      body: `<div class="builder"><div class="b-form">
        ${!escolas.length ? '<p class="warn">A ficha não tem nenhuma escola de Magia. Compre uma escola em Poderes (grupo Magia).</p>' : ''}
        ${field('Nome do feitiço', `<input name="nome" class="big" value="${esc(ft.nome)}" placeholder="Corrente de Vésper">`)}
        <div class="row">
          ${field('Escola', `<select name="escolaId">${escolas.map((e) => `<option value="${esc(e.id)}" ${e.id === ft.escolaId ? 'selected' : ''}>${esc(e.nome || (LD.byKey(LD.PODERES, e.base) || {}).nome)} (Grau ${e.grau})</option>`).join('')}</select>`)}
          ${field('Efeito', `<select name="efeito">${efeitos.map((e) => `<option value="${e.key}" ${e.key === ft.efeito ? 'selected' : ''}>${esc(e.nome)}</option>`).join('')}</select>`)}
          ${field('Grau', `<input name="grau" type="number" min="1" max="8" value="${esc(ft.grau)}">`, 'No máximo o Grau da escola.')}
        </div>
        <div class="subsect"><span>Extras (+1 Grau cada)</span></div>
        <div class="mods">${LD.EXTRAS.map((x) => `<label class="mod"><input type="checkbox" data-ex="${x.key}" ${ft.extras.includes(x.key) ? 'checked' : ''}><b>${esc(x.nome)}</b><span class="small muted">${esc(x.efeito)}</span></label>`).join('')}</div>
        <div class="subsect"><span>Falhas (−1 Grau cada)</span></div>
        <div class="mods">${LD.FALHAS.map((x) => `<label class="mod fl"><input type="checkbox" data-fl="${x.key}" ${ft.falhas.includes(x.key) ? 'checked' : ''}><b>${esc(x.nome)}</b><span class="small muted">${esc(x.efeito)}</span></label>`).join('')}</div>
        ${field('Componentes', `<input name="componentes" value="${esc(ft.componentes || '')}" placeholder="Palavras, gestos, um objeto, um sacrifício">`)}
        ${checkbox('componente', ft.componente, 'Componente difícil de conseguir (+2 na conjuração)')}
        ${checkbox('novo', ft.novo, 'Inventado na hora (CD +2, uma vez por cena; entra no Grimório depois de três usos)')}
        ${field('O Preço próprio', `<input name="precoProprio" value="${esc(ft.precoProprio)}" placeholder="Como o Preço aparece com este feitiço">`)}
      </div><aside class="b-prev panel framed" data-prev></aside></div>`,
      foot: '<button class="btn-primary" data-salvar>Pôr no Grimório</button>',
      onMount: (d) => {
        const ler = () => Object.assign({}, ft, LD.ui.readForm(d.querySelector('.b-form')), {
          extras: Array.from(d.querySelectorAll('[data-ex]:checked')).map((x) => x.dataset.ex),
          falhas: Array.from(d.querySelectorAll('[data-fl]:checked')).map((x) => x.dataset.fl)
        });
        function atualizar() {
          const x = ler();
          const r = R.feitico(f, x, c);
          const avisos = [];
          if (r.escola && x.grau > num(r.escola.grau)) avisos.push(`Grau ${x.grau} passa do Grau da escola (${r.escola.grau}).`);
          if (!x.nome) avisos.push('Dê um nome ao feitiço.');
          const chance = Math.max(5, Math.min(95, (21 - (r.cd - r.bonus)) * 5));
          const g = LD.GRAUS[Math.min(8, r.final)];
          d.querySelector('[data-prev]').innerHTML = `
            <div class="eyebrow">Conjuração</div>
            <div class="cost-big"><b>${r.cd}</b><span>CD</span></div>
            <ul class="mini">
              <li><span>Grau final</span><b>${r.final}</b></li>
              <li><span>Custo</span><b>${esc(r.custo)}</b></li>
              <li><span>Bônus (${r.attr} + perícia)</span><b>${sinal(r.bonus)}</b></li>
              <li><span>Chance</span><b>${r.livre ? 'livre' : chance + '%'}</b></li>
              <li><span>Efeito no Grau ${x.grau}</span><b>${g.dano} · ${esc(g.alcance)}</b></li>
            </ul>
            <p class="tiny muted">Falha: a Energia é gasta e rola o Preço (1d6). 1 natural: funciona errado, e o Preço vem duas vezes.</p>
            ${avisos.length ? `<ul class="avisos">${avisos.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}`;
        }
        atualizar();
        d.querySelector('.drawer-body').addEventListener('input', atualizar);
        d.querySelector('.drawer-body').addEventListener('change', atualizar);
        d.querySelector('[data-salvar]').addEventListener('click', () => {
          const x = ler();
          if (!x.nome) { LD.ui.toast('Feitiço sem nome não entra no Grimório.', 'erro'); return; }
          x.grau = num(x.grau, 1);
          onSave(x); LD.ui.closeDrawer();
        });
      }
    });
  }

  /* ---------- Poderes prontos ---------- */
  function novoPronto(key, grau) {
    const p = LD.PRONTOS.find((x) => x.key === key);
    return { id: LD.store.newId('pd'), base: p.base, pronto: p.key, nome: p.nome, descritor: p.desc, grau: grau || 1, attr: p.attr,
      extras: p.extras.slice(), falhas: [], variacoes: [], alvo: p.base === 'atributo' ? 'FOR' : '', modo: 'protecao', notas: '' };
  }
  const custoPorGrau = (p) => R.custoPoder({ base: p.base, grau: 1, extras: p.extras, falhas: [] }).porGrau;

  function cartaoPronto(p, acao) {
    return `<article class="card pcard pronto">
      <div class="card-title">${esc(p.nome)}</div>
      <div class="card-meta"><span class="tag gold">${custoPorGrau(p)} PP por Grau</span><span class="tag">${esc(p.grupo)}</span></div>
      <div class="small">${esc(p.desc)}</div>
      <div class="caption" style="margin:4px 0 0"><b>Grau 1:</b> ${esc(p.graus[0])}</div>
      <details class="more"><summary>Como melhora</summary><ol class="graus-lista">${p.graus.map((t) => `<li>${esc(t)}</li>`).join('')}</ol></details>
      <div class="card-foot">${acao}</div>
    </article>`;
  }

  function listaProntos(filtro) {
    const b = (filtro.busca || '').toLowerCase();
    return LD.PRONTOS.filter((p) => (!filtro.grupo || p.grupo === filtro.grupo) && (!b || (p.nome + ' ' + p.desc).toLowerCase().includes(b)));
  }

  // Gaveta para escolher um poder pronto e pôr na ficha.
  function escolherPronto(ficha, onPick) {
    const f = LD.fichas.normalizar(JSON.parse(JSON.stringify(ficha)));
    const c = R.calc(f);
    const filtro = { grupo: '', busca: '' };
    LD.ui.openDrawer({
      eyebrow: `Poderes prontos · ${LD.fichas.titulo(f)}`, title: 'Escolher um poder', wide: true,
      body: `<div class="caption">Sobram <b>${c.ppLivres} PP</b>. Entra no Grau 1.</div>
        <div class="toolbar"><div class="search"><span>⌕</span><input data-b placeholder="Procurar (voo, fogo, cura…)"></div>
        <div class="chips"><button class="chip on" data-g="">Todos</button>${LD.GRUPOS_PRONTOS.map((g) => `<button class="chip" data-g="${g}">${g}</button>`).join('')}</div></div>
        <div class="grid cards" data-lista></div>`,
      onMount: (d) => {
        const desenhar = () => {
          d.querySelector('[data-lista]').innerHTML = listaProntos(filtro).map((p) => cartaoPronto(p,
            `<button class="btn" data-pegar="${p.key}" ${custoPorGrau(p) > c.ppLivres ? 'title="Faltam PP"' : ''}>Pegar (${custoPorGrau(p)} PP)</button>`)).join('') || '<div class="empty small-empty">Nada com esse nome.</div>';
          d.querySelectorAll('[data-pegar]').forEach((b) => b.addEventListener('click', () => { onPick(novoPronto(b.dataset.pegar, 1)); LD.ui.closeDrawer(); LD.ui.toast('Poder adicionado. Use Aprimorar para subir o Grau.'); }));
        };
        d.querySelector('[data-b]').addEventListener('input', (e) => { filtro.busca = e.target.value; desenhar(); });
        d.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => { filtro.grupo = b.dataset.g; d.querySelectorAll('[data-g]').forEach((x) => x.classList.toggle('on', x === b)); desenhar(); }));
        desenhar();
      }
    });
  }

  /* ---------- Página ---------- */
  function render(main) {
    const busca = st.busca.toLowerCase();
    const bib = LD.store.list('poderes').slice().sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
    main.innerHTML = `
      <div class="page-head">
        <div><div class="eyebrow">Criando Poderes</div><h1>Poderes</h1></div>
        <button class="btn-primary" data-montar>＋ Montar um poder</button>
      </div>
      <nav class="tabs">${[['prontos', `Poderes prontos (${LD.PRONTOS.length})`], ['catalogo', 'Montar do zero'], ['biblioteca', `Biblioteca (${bib.length})`], ['graus', 'Graus e modificadores']].map(([k, n]) => `<button class="${st.aba === k ? 'on' : ''}" data-aba="${k}">${n}</button>`).join('')}</nav>
      <div data-corpo></div>`;
    const corpo = main.querySelector('[data-corpo]');
    if (st.aba === 'prontos') {
      const lista = listaProntos({ grupo: st.grupoPronto, busca: st.busca });
      corpo.innerHTML = `
        <div class="toolbar"><div class="search"><span>⌕</span><input data-busca placeholder="Procurar (voo, fogo, cura…)" value="${esc(st.busca)}"></div>
          <div class="chips"><button class="chip ${!st.grupoPronto ? 'on' : ''}" data-gp="">Todos</button>${LD.GRUPOS_PRONTOS.map((g) => `<button class="chip ${st.grupoPronto === g ? 'on' : ''}" data-gp="${g}">${g}</button>`).join('')}</div></div>
        <div class="grid cards">${lista.map((p) => cartaoPronto(p, `<button class="btn" data-pfic="${p.key}">Pôr numa ficha</button>`)).join('')}</div>`;
      corpo.querySelector('[data-busca]').addEventListener('input', LD.ui.debounce((e) => { st.busca = e.target.value; render(main); const i = main.querySelector('[data-busca]'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250));
      corpo.querySelectorAll('[data-gp]').forEach((b) => b.addEventListener('click', () => { st.grupoPronto = b.dataset.gp; render(main); }));
      corpo.querySelectorAll('[data-pfic]').forEach((b) => b.addEventListener('click', () => {
        const fichas = minhasFichas();
        if (!fichas.length) { LD.ui.toast('Crie uma ficha primeiro.', 'erro'); return; }
        LD.ui.openDrawer({
          eyebrow: 'Poderes prontos', title: 'Para qual ficha?',
          body: fichas.map((x) => `<button class="pick" data-f="${esc(x.id)}"><b>${esc(x.codinome || x.nome || 'Herói')}</b></button>`).join(''),
          onMount: (d) => d.querySelectorAll('[data-f]').forEach((bt) => bt.addEventListener('click', () => {
            LD.fichas.mudar(bt.dataset.f, (fx) => { fx.poderes.push(novoPronto(b.dataset.pfic, 1)); }).then(() => LD.ui.toast('Poder adicionado à ficha.'));
            LD.ui.closeDrawer();
          }))
        });
      }));
    } else if (st.aba === 'catalogo') {
      const lista = LD.PODERES.filter((p) => (!st.grupo || p.grupo === st.grupo) && (!busca || (p.nome + p.efeito).toLowerCase().includes(busca)));
      corpo.innerHTML = `
        <div class="toolbar"><div class="search"><span>⌕</span><input data-busca placeholder="Procurar um poder" value="${esc(st.busca)}"></div>
          <div class="chips"><button class="chip ${!st.grupo ? 'on' : ''}" data-g="">Todos</button>${LD.GRUPOS_PODER.map((g) => `<button class="chip ${st.grupo === g ? 'on' : ''}" data-g="${esc(g)}">${esc(g)}</button>`).join('')}</div></div>
        <div class="grid cards">${lista.map((p) => `
          <article class="card pcard">
            <div class="card-title">${esc(p.nome)}</div>
            <div class="card-meta"><span class="tag gold">${p.custo} PP por Grau</span>${p.cosmico ? '<span class="tag warn">Mestragem</span>' : ''}</div>
            <details class="more"><summary>O que faz</summary><div class="small">${esc(p.efeito)}</div><div class="caps" style="margin-top:4px">${p.attrs.slice(0, 3).join(' · ')}</div></details>
            <div class="card-foot"><button class="btn" data-usar="${p.key}">Montar</button><span class="caps">${esc(p.grupo)}</span></div>
          </article>`).join('')}</div>`;
      corpo.querySelector('[data-busca]').addEventListener('input', LD.ui.debounce((e) => { st.busca = e.target.value; render(main); const i = main.querySelector('[data-busca]'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250));
      corpo.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => { st.grupo = b.dataset.g; render(main); }));
      corpo.querySelectorAll('[data-usar]').forEach((b) => b.addEventListener('click', () => construtor({ base: b.dataset.usar })));
    } else if (st.aba === 'biblioteca') {
      corpo.innerHTML = bib.length ? `
        <div class="grid cards">${bib.map((p) => { const b = LD.byKey(LD.PODERES, p.base) || {}; const meu = LD.store.canEdit('poderes', p); return `
          <article class="card pcard">
            <div class="card-meta"><span class="tag">${esc(b.nome || '')} ${p.grau}</span><span class="tag gold">${R.custoPoder(p).total} PP</span></div>
            <div class="card-title">${esc(p.nome)}</div>
            <div class="card-desc">${esc(p.descritor || b.efeito || '')}</div>
            <div class="card-foot"><span class="caps">${esc(p.ownerName || '')}</span>
              <span>${meu ? `<button class="btn plain" data-edit="${esc(p.id)}">Editar</button><button class="btn danger plain" data-rm="${esc(p.id)}">Apagar</button>` : ''}</span></div>
            <button class="btn" data-pegar="${esc(p.id)}">Pôr numa ficha</button>
          </article>`; }).join('')}</div>` : '<div class="empty">A biblioteca está vazia.</div>';
      corpo.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => {
        const p = LD.store.get('poderes', b.dataset.edit);
        construtor({ poder: p, onSave: (x) => LD.store.save('poderes', Object.assign({}, p, x, { id: p.id })) });
      }));
      corpo.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => { if (LD.ui.confirmar('Apagar da biblioteca?')) LD.store.remove('poderes', b.dataset.rm); }));
      corpo.querySelectorAll('[data-pegar]').forEach((b) => b.addEventListener('click', () => pegarParaFicha(b.dataset.pegar)));
    } else {
      corpo.innerHTML = `
        <table class="tbl"><thead><tr><th>Grau</th><th>Dano</th><th>Alcance</th><th>Área</th><th>Duração</th><th>CD (atributo 4)</th></tr></thead><tbody>
          ${LD.GRAUS.slice(1).map((g) => `<tr><td>${g.g}</td><td>${g.dano}</td><td>${esc(g.alcance)}</td><td>${esc(g.area)}</td><td>${esc(g.duracao)}</td><td>${14 + g.g}</td></tr>`).join('')}</tbody></table>
        <p class="muted small">Dano de um poder = Grau d6 + Atributo-chave + Potência (Classe × 5, arredondada). Grau máximo 4 na criação (5 com Incêndio e Supernova), 5 na Classe 1,7, 6 na 2,7 e 7 na 3,7.</p>
        <div class="grid two" style="margin-top:20px">
          <div><div class="subsect"><span>Extras</span></div><table class="tbl"><tbody>${LD.EXTRAS.map((x) => `<tr><td><b>${esc(x.nome)}</b></td><td class="r">+${x.custo}${x.tipo === 'grau' ? '/Grau' : ''}</td><td class="small">${esc(x.efeito)}</td></tr>`).join('')}</tbody></table></div>
          <div><div class="subsect"><span>Falhas</span></div><table class="tbl"><tbody>${LD.FALHAS.map((x) => `<tr><td><b>${esc(x.nome)}</b></td><td class="r">−1/Grau</td><td class="small">${esc(x.efeito)}</td></tr>`).join('')}</tbody></table>
          <p class="muted small">Falhas não descem de 1 PP por Grau. Variações custam +1 PP cada.</p></div>
        </div>
        <div class="subsect"><span>Façanhas de Poder</span></div>
        <p class="paper-2">Uma vez por cena, 2 Energia: um uso novo do poder, coerente com o descritor, com efeito de Grau − 1. Atributo do poder + Domínio do Poder contra CD 15. Se a mesa gostar, vira uma Variação comprada no próximo nível.</p>`;
    }
    main.querySelectorAll('[data-aba]').forEach((b) => b.addEventListener('click', () => { st.aba = b.dataset.aba; render(main); }));
    main.querySelector('[data-montar]').addEventListener('click', () => construtor({}));
  }

  function pegarParaFicha(bibId) {
    const fichas = minhasFichas();
    if (!fichas.length) { LD.ui.toast('Crie uma ficha primeiro.', 'erro'); return; }
    LD.ui.openDrawer({
      eyebrow: 'Biblioteca', title: 'Para qual ficha?',
      body: fichas.map((x) => `<button class="pick" data-f="${esc(x.id)}"><b>${esc(x.codinome || x.nome || 'Herói')}</b></button>`).join(''),
      onMount: (d) => d.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => {
        const f = LD.fichas.ficha(b.dataset.f);
        const p = JSON.parse(JSON.stringify(LD.store.get('poderes', bibId)));
        const novo = Object.assign({}, p, { id: LD.store.newId('pd'), bibliotecaId: p.id });
        delete novo.ownerId; delete novo.ownerName; delete novo.updatedAt;
        LD.ui.closeDrawer();
        setTimeout(() => construtor({ ficha: f, poder: novo, onSave: (x) => LD.fichas.mudar(f.id, (fx) => { fx.poderes.push(x); }) }), 350);
      }))
    });
  }

  LD.poderUI = { construtor, construtorFeitico, escolherDaBiblioteca, publicar, escolherPronto, novoPronto };
  LD.views.poderes = { titulo: 'Poderes', numeral: 'II', render };
})();
