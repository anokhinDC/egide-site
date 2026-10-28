(function () {
  const LD = window.LD;
  const { esc } = LD.ui;

  const MENU = [
    { rota: 'fichas', nome: 'Fichas', rn: 'I', ativo: ['fichas', 'ficha'] },
    { rota: 'poderes', nome: 'Poderes', rn: 'II' },
    { rota: 'arsenal', nome: 'Arsenal', rn: 'III' },
    { rota: 'referencia', nome: 'Referência', rn: 'IV' },
    { sep: true },
    { rota: 'oficina', nome: 'Oficina', rn: 'V' },
    { rota: 'codice', nome: 'Códice', rn: 'VI' }
  ];
  const LIVRES = ['codice', 'referencia']; // abertas sem login

  const nav = document.querySelector('[data-nav]');
  const main = document.querySelector('[data-main]');
  const numeral = { set textContent(v) {} };

  function rotaAtual() {
    const h = location.hash.replace(/^#\/?/, '');
    const [nome, param] = h.split('/');
    return { nome: nome || 'fichas', param: param ? decodeURIComponent(param) : null };
  }

  function renderNav() {
    const r = rotaAtual();
    const s = LD.store.state;
    const user = s.user ? (s.user.email || '').split('@')[0] : null;
    nav.innerHTML = `
      <a class="brand" href="#/fichas">
        <span class="emblem" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M32 3 L57 13 V32 C57 47 46 57 32 61 C18 57 7 47 7 32 V13 Z" fill="#e2232f" stroke="#111318" stroke-width="4"/><path d="M32 14 L35.8 26 L48.4 26 L38.2 33.4 L42 45.4 L32 38 L22 45.4 L25.8 33.4 L15.6 26 L28.2 26 Z" fill="#ffd23f" stroke="#111318" stroke-width="2.5" stroke-linejoin="round"/></svg></span>
        <span><span class="title">ÉGIDE</span><br><span class="sub">Registro de Heróis</span></span>
      </a>
      <button class="icon-btn menu-btn" data-menu aria-label="Menu">≡</button>
      <ul class="menu">${MENU.map((m) => m.sep ? '<li class="sep"></li>' : `
        <li><a href="#/${m.rota}" class="${(m.ativo || [m.rota]).includes(r.nome) ? 'on' : ''}">${m.nome}</a></li>`).join('')}
      </ul>
      <div class="nav-foot">
        ${s.local ? '<span class="caps">Modo local</span>' : user
          ? `<span>${LD.store.isMaster() ? '★ ' : ''}${esc(user)}</span><button class="btn plain" data-sair>Sair</button>`
          : '<a href="#/fichas" class="btn">Entrar</a>'}
      </div>`;
    nav.querySelector('[data-menu]').addEventListener('click', () => document.querySelector('[data-topnav]').classList.toggle('open'));
    const sair = nav.querySelector('[data-sair]');
    if (sair) sair.addEventListener('click', () => LD.store.logout());
  }

  function renderLogin() {
    main.innerHTML = `
      <div class="gate">
        <div class="eyebrow">Égide · Aldória</div>
        <h1>Vista a máscara!</h1>
        <p class="lead">Entre com o seu usuário e senha (os mesmos do site antigo). Se for a primeira vez, a conta é criada agora.</p>
        <form data-login class="panel framed">
          <div class="field"><label>Usuário</label><input name="u" required autocomplete="username" class="big"></div>
          <div class="field"><label>Senha</label><input name="p" type="password" required autocomplete="current-password"></div>
          <button class="btn-primary" type="submit">Entrar</button>
        </form>
        <p class="muted small">Só quer ler as regras? <a href="#/codice">Abra o Códice</a> ou a <a href="#/referencia">Referência</a>.</p>
      </div>`;
    main.querySelector('[data-login]').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      LD.store.login(f.get('u'), f.get('p')).catch((err) => LD.ui.toast(err.message, 'erro'));
    });
  }

  let pendente = false;
  function render() {
    const s = LD.store.state;
    renderNav();
    const r = rotaAtual();
    const view = LD.views[r.nome] || LD.views.fichas;
    numeral.textContent = view.numeral || '';
    document.title = `${view.titulo} · Égide`;
    if (!s.ready) { main.innerHTML = '<div class="empty">Acendendo o farol…</div>'; return; }
    if (!s.local && !s.user && !LIVRES.includes(r.nome)) { renderLogin(); return; }
    try {
      view.render(main, r.param);
      if (s.negadas && s.negadas.length) {
        const aviso = document.createElement('div');
        aviso.className = 'caption aviso-regras';
        aviso.innerHTML = LD.store.isMaster()
          ? `<b>Falta liberar o banco de dados.</b> O Firebase ainda está com as regras antigas e bloqueia as coleções da Égide (${s.negadas.map(esc).join(', ')}). Abra o <a href="https://console.firebase.google.com/project/beyon-depths/firestore/rules" target="_blank" rel="noopener">console do Firebase → Firestore → Regras</a>, apague tudo, cole o conteúdo do arquivo <code>firestore.rules</code> deste site e clique em <b>Publicar</b>. Depois recarregue a página.`
          : '<b>O site ainda está sendo liberado.</b> A mestragem precisa atualizar as regras do banco de dados. Até lá, nada salva.';
        main.prepend(aviso);
      }
    } catch (e) { console.error(e); main.innerHTML = `<div class="empty">Algo deu errado nesta página.<br><span class="small">${esc(e.message)}</span></div>`; }
  }

  // Não redesenha enquanto alguém digita: espera o campo perder o foco.
  function talvezRender() {
    const a = document.activeElement;
    const digitando = a && main.contains(a) && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && a.type !== 'checkbox' && a.type !== 'range';
    const gaveta = document.querySelector('.drawer.open');
    if (digitando || gaveta) { pendente = true; return; }
    pendente = false;
    render();
  }
  main.addEventListener('focusout', () => setTimeout(() => { if (pendente) talvezRender(); }, 60));
  document.addEventListener('transitionend', (e) => {
    if (e.target.classList && e.target.classList.contains('drawer') && !e.target.classList.contains('open') && pendente) talvezRender();
  });

  window.addEventListener('hashchange', () => {
    document.querySelector('[data-topnav]').classList.remove('open');
    LD.ui.closeDrawer();
    window.scrollTo(0, 0);
    render();
  });

  LD.app = { render };
  LD.store.on(talvezRender);
  LD.store.init();
  render();
})();
