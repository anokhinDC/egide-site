/*
 * Égide · utilitários de interface: escape, avisos, gaveta, formulários, rolagens.
 */
(function () {
  const LD = (window.LD = window.LD || {});

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  const sinal = (n) => (n >= 0 ? '+' : '−') + Math.abs(n);

  function toast(msg, tipo) {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'toast ' + (tipo || '');
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 4200);
  }

  function pips(total, on, cls) {
    let s = `<span class="pips ${cls || ''}">`;
    for (let i = 0; i < total; i++) s += `<i class="pip ${i < on ? 'on' : ''}"></i>`;
    return s + '</span>';
  }

  function classeTag(c) { return `<span class="tag classe c${Math.floor(c)}">Classe ${String(c).replace('.', ',')}</span>`; }

  /* ---------- Gaveta ---------- */
  let drawerEl, backEl, onCloseCb;
  function ensureDrawer() {
    if (drawerEl) return;
    backEl = document.createElement('div');
    backEl.className = 'drawer-back';
    backEl.addEventListener('click', closeDrawer);
    drawerEl = document.createElement('aside');
    drawerEl.className = 'drawer';
    drawerEl.setAttribute('role', 'dialog');
    document.body.append(backEl, drawerEl);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawerEl.classList.contains('open')) closeDrawer(); });
  }
  function openDrawer({ eyebrow, title, body, foot, onMount, onClose, wide }) {
    ensureDrawer();
    onCloseCb = onClose;
    drawerEl.classList.toggle('wide', !!wide);
    drawerEl.innerHTML = `
      <div class="drawer-head">
        <div><div class="eyebrow">${esc(eyebrow || '')}</div><h2>${esc(title || '')}</h2></div>
        <button class="icon-btn" data-close aria-label="Fechar">×</button>
      </div>
      <div class="drawer-body">${body || ''}</div>
      ${foot ? `<div class="drawer-foot">${foot}</div>` : ''}`;
    drawerEl.querySelector('[data-close]').addEventListener('click', closeDrawer);
    requestAnimationFrame(() => { backEl.classList.add('open'); drawerEl.classList.add('open'); });
    if (onMount) onMount(drawerEl);
    return drawerEl;
  }
  function closeDrawer() {
    if (!drawerEl) return;
    drawerEl.classList.remove('open');
    backEl.classList.remove('open');
    if (onCloseCb) { const cb = onCloseCb; onCloseCb = null; cb(); }
  }

  /* ---------- Formulários ---------- */
  function field(label, inner, hint) {
    return `<div class="field"><label>${esc(label)}</label>${inner}${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
  }
  const input = (name, value, attrs) => `<input name="${name}" value="${esc(value == null ? '' : value)}" ${attrs || ''}>`;
  const textarea = (name, value, attrs) => `<textarea name="${name}" ${attrs || ''}>${esc(value || '')}</textarea>`;
  function select(name, options, value, attrs) {
    return `<select name="${name}" ${attrs || ''}>${options
      .map((o) => `<option value="${esc(o.key)}" ${String(o.key) === String(value) ? 'selected' : ''}>${esc(o.nome)}</option>`).join('')}</select>`;
  }
  const checkbox = (name, checked, label, attrs) => `<label class="check"><input type="checkbox" name="${name}" ${checked ? 'checked' : ''} ${attrs || ''}><span>${esc(label)}</span></label>`;

  function readForm(root) {
    const out = {};
    root.querySelectorAll('[name]').forEach((el) => {
      if (el.closest('[data-skip]')) return;
      const path = el.name.split('.');
      let v;
      if (el.type === 'checkbox') v = el.checked;
      else if (el.type === 'number') v = el.value === '' ? '' : Number(el.value);
      else v = el.value;
      let o = out;
      path.slice(0, -1).forEach((p) => { o[p] = o[p] || {}; o = o[p]; });
      o[path[path.length - 1]] = v;
    });
    return out;
  }

  /* Contador − valor + */
  function stepper(name, value, min, max, extra) {
    return `<span class="stepper" data-stepper="${esc(name)}" data-min="${min}" data-max="${max}">
      <button type="button" data-step="-1" aria-label="Menos">−</button><b>${esc(value)}</b><button type="button" data-step="1" aria-label="Mais">+</button>${extra || ''}</span>`;
  }
  function bindSteppers(root, cb) {
    root.querySelectorAll('[data-stepper]').forEach((s) => {
      s.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
        const v = Number(s.querySelector('b').textContent) || 0;
        const n = Math.max(Number(s.dataset.min), Math.min(Number(s.dataset.max), v + Number(b.dataset.step)));
        if (n !== v) cb(s.dataset.stepper, n);
      }));
    });
  }

  /* ---------- Rolagens ---------- */
  const historico = [];
  function registrarRolagem(r) {
    historico.unshift(Object.assign({ quando: new Date() }, r));
    historico.splice(12);
    renderRolagens();
  }
  function renderRolagens() {
    let box = document.querySelector('.dice-log');
    if (!box) {
      box = document.createElement('div');
      box.className = 'dice-log';
      document.body.appendChild(box);
      box.addEventListener('click', (e) => { if (e.target.matches('[data-limpar]')) { historico.splice(0); renderRolagens(); } });
    }
    box.classList.toggle('show', historico.length > 0);
    box.innerHTML = historico.length ? `<div class="dl-head"><span class="caps">Rolagens</span><button class="btn plain" data-limpar>Limpar</button></div>` +
      historico.slice(0, 6).map((r, i) => `<div class="dl-row ${i === 0 ? 'new' : ''} ${r.classe || ''}">
        <div class="dl-what">${esc(r.titulo)}</div>
        <div class="dl-res"><b>${esc(r.total)}</b>${r.alvo ? `<small>${esc(r.alvo)}</small>` : ''}</div>
        <div class="dl-det">${esc(r.detalhe || '')}</div></div>`).join('') : '';
  }

  // Teste de d20 com bônus. Retorna o resultado e mostra no registro.
  function rolarTeste(titulo, bonus, opts) {
    opts = opts || {};
    const r = LD.rules.rolarD20(opts.modo);
    const total = r.valor + bonus;
    let classe = '';
    let alvo = '';
    if (opts.cd != null) { const ok = total >= opts.cd || r.valor === 20; alvo = `CD ${opts.cd} · ${ok ? 'passou' : 'falhou'}`; classe = ok ? 'ok' : 'bad'; }
    if (r.valor === 20) classe += ' nat20';
    if (r.valor === 1) classe += ' nat1';
    const det = `d20 [${r.dados.join(', ')}]${r.dados.length > 1 ? (opts.modo === 'vantagem' ? ' ↑' : ' ↓') : ''} ${sinal(bonus)}${r.valor === 20 ? ' · 20 natural' : r.valor === 1 ? ' · 1 natural' : ''}`;
    registrarRolagem({ titulo, total, alvo, detalhe: det, classe });
    return { total, natural: r.valor, dados: r.dados, passou: opts.cd != null ? total >= opts.cd || r.valor === 20 : null };
  }
  function rolarDano(titulo, expr, critico) {
    const r = LD.rules.rolarExpr(expr, critico);
    if (!r) { toast('Expressão de dado inválida: ' + expr, 'erro'); return null; }
    registrarRolagem({ titulo: titulo + (critico ? ' · crítico' : ''), total: r.total, detalhe: `${expr} [${r.dados.join(', ')}]${critico ? ' + dados no máximo' : ''}` });
    return r;
  }

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
  const confirmar = (msg) => window.confirm(msg);
  function baixar(nome, texto, tipo) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([texto], { type: tipo || 'application/json' }));
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function copiar(texto) {
    const ok = () => toast('Copiado.');
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(texto).then(ok, () => fallback());
    fallback();
    function fallback() {
      const t = document.createElement('textarea'); t.value = texto; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); ok(); } catch (e) { toast('Não consegui copiar.', 'erro'); }
      t.remove();
    }
  }

  // <details> que lembram se estavam abertos depois de a página redesenhar.
  const abertos = new Set();
  document.addEventListener('toggle', (e) => {
    const k = e.target && e.target.dataset && e.target.dataset.keep;
    if (k) { if (e.target.open) abertos.add(k); else abertos.delete(k); }
  }, true);
  const keep = (k) => `data-keep="${esc(k)}" ${abertos.has(k) ? 'open' : ''}`;

  LD.views = LD.views || {};
  LD.ui = {
    keep, esc, sinal, toast, pips, classeTag, openDrawer, closeDrawer, field, input, textarea, select, checkbox, readForm,
    stepper, bindSteppers, rolarTeste, rolarDano, registrarRolagem, debounce, confirmar, baixar, copiar
  };
})();
