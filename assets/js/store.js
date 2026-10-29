/*
 * Égide · dados
 * Firebase (as mesmas contas do site antigo) ou modo local (?local=1, só no navegador).
 * As coleções da Égide têm o prefixo "egide_" e não mexem nas antigas.
 */
(function () {
  const LD = (window.LD = window.LD || {});

  const firebaseConfig = {
    apiKey: 'AIzaSyA9vgfJ_fF0hmIZ95uytdW5ggZgpfm4WlI',
    authDomain: 'beyon-depths.firebaseapp.com',
    projectId: 'beyon-depths',
    storageBucket: 'beyon-depths.firebasestorage.app',
    messagingSenderId: '605571730206',
    appId: '1:605571730206:web:3b371ce0dc4c0a7ce4d70f'
  };

  const COLECOES = {
    personagens: 'egide_personagens',
    poderes: 'egide_poderes',
    itens: 'egide_itens',
    alteracoes: 'egide_alteracoes'
  };

  // Além do mestre, quem pode criar em cada coleção.
  const JOGADOR_PODE_CRIAR = { personagens: true, poderes: true, itens: false, alteracoes: true };

  // Só estas contas são mestre.
  const MESTRES = ['mestre@beyonddepths.com', 'admin@beyonddepths.com'];

  const forceLocal = /[?&]local=1/.test(location.search);

  const state = {
    db: null, auth: null, user: null, local: true, ready: false, negadas: [],
    data: { personagens: [], poderes: [], itens: [], alteracoes: [] }
  };

  const listeners = new Set();
  const unsub = [];
  function emit() { listeners.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } }); }
  function id(prefixo) { return (prefixo || 'eg') + '_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }

  const lsKey = (col) => 'egide_' + col;
  function loadLocal() {
    Object.keys(COLECOES).forEach((col) => {
      try { const raw = localStorage.getItem(lsKey(col)); state.data[col] = raw ? JSON.parse(raw) : []; } catch (e) { state.data[col] = []; }
    });
    if (!state.data.itens.length && LD.seed) {
      state.data.itens = JSON.parse(JSON.stringify(LD.seed.itens));
      saveLocal('itens');
    }
  }
  function saveLocal(col) { try { localStorage.setItem(lsKey(col), JSON.stringify(state.data[col])); } catch (e) { console.warn(e); } }

  function isMaster() {
    if (state.local) return true;
    const e = state.user && state.user.email;
    return !!e && MESTRES.includes(e.toLowerCase());
  }

  function uid() { return state.local ? 'local' : (state.user && state.user.uid) || ''; }
  function userName() { return state.local ? 'local' : ((state.user && state.user.email) || '').split('@')[0]; }

  function canEdit(col, item) {
    if (state.local) return true;
    if (!state.user) return false;
    if (isMaster()) return true;
    if (!item) return !!JOGADOR_PODE_CRIAR[col];
    return item.ownerId === state.user.uid;
  }

  function startListeners() {
    unsub.splice(0).forEach((u) => u && u());
    state.negadas = [];
    if (!state.user) {
      Object.keys(state.data).forEach((k) => (state.data[k] = []));
      state.ready = true; emit(); return;
    }
    const faltam = new Set(Object.keys(COLECOES));
    const liberar = () => { if (!state.ready) { state.ready = true; emit(); } };
    const respondeu = (col) => { faltam.delete(col); if (!faltam.size) liberar(); };
    setTimeout(() => {
      if (state.ready) return;
      LD.ui && LD.ui.toast('Algumas coleções demoraram a responder. Se faltar algo, recarregue a página.', 'erro');
      liberar();
    }, 8000);
    Object.entries(COLECOES).forEach(([col, name]) => {
      // O log de alterações: só as 400 mais recentes.
      const fonte = col === 'alteracoes' ? state.db.collection(name).orderBy('quando', 'desc').limit(400) : state.db.collection(name);
      unsub.push(fonte.onSnapshot(
        (snap) => { state.data[col] = snap.docs.map((d) => d.data()); respondeu(col); emit(); },
        (err) => {
          console.error('Firestore', name, err);
          if (err && err.code === 'permission-denied' && !state.negadas.includes(name)) state.negadas.push(name);
          else LD.ui && LD.ui.toast(`Erro ao ler ${name}: ${err.message}`, 'erro');
          respondeu(col); emit();
        }
      ));
    });
  }

  function init() {
    if (!forceLocal && window.firebase && firebaseConfig.apiKey) {
      try {
        firebase.initializeApp(firebaseConfig);
        state.db = firebase.firestore();
        state.auth = firebase.auth();
        state.local = false;
      } catch (e) { console.warn('Firebase indisponível, modo local.', e); }
    }
    if (state.local) { loadLocal(); state.ready = true; emit(); return; }
    state.auth.onAuthStateChanged((user) => { state.user = user; startListeners(); });
  }

  // Log de alterações das fichas: guarda como a ficha estava e, depois de 4 s sem mudança, grava uma entrada com o que mudou.
  const pendentes = {};
  function registrarAlteracao(antes, depois) {
    const k = depois.id;
    if (!antes) { gravarAlteracao(depois, ['Ficha criada.']); return; }
    if (!pendentes[k]) pendentes[k] = { antes: JSON.parse(JSON.stringify(antes)) };
    clearTimeout(pendentes[k].timer);
    pendentes[k].timer = setTimeout(() => {
      const p = pendentes[k]; delete pendentes[k];
      const agora = state.data.personagens.find((x) => x.id === k);
      if (!agora || !LD.alteracoes) return;
      const mudancas = LD.alteracoes.descrever(p.antes, agora);
      if (mudancas.length) gravarAlteracao(agora, mudancas);
    }, 4000);
  }
  // Saindo da página: grava o que ainda estava esperando.
  window.addEventListener('pagehide', () => {
    Object.keys(pendentes).forEach((k) => {
      const p = pendentes[k]; clearTimeout(p.timer); delete pendentes[k];
      const agora = state.data.personagens.find((x) => x.id === k);
      if (agora && LD.alteracoes) { const m = LD.alteracoes.descrever(p.antes, agora); if (m.length) gravarAlteracao(agora, m); }
    });
  });
  function gravarAlteracao(f, mudancas) {
    const reg = { id: id('al'), fichaId: f.id, ficha: f.codinome || f.nome || 'Herói sem nome', quem: userName(), quemUid: uid(), quando: Date.now(), mudancas: mudancas.slice(0, 25) };
    state.data.alteracoes.unshift(reg);
    if (state.local) { state.data.alteracoes = state.data.alteracoes.slice(0, 400); saveLocal('alteracoes'); emit(); return; }
    emit();
    state.db.collection(COLECOES.alteracoes).doc(reg.id).set(reg).catch((e) => console.warn('Log de alterações', e));
  }

  function save(col, item) {
    if (!item.id) item.id = id(col.slice(0, 2));
    item.updatedAt = Date.now();
    const atual = state.data[col].find((x) => x.id === item.id);
    if (col === 'personagens' && canEdit(col, atual || null)) registrarAlteracao(atual, item);
    if (!canEdit(col, atual || null)) {
      LD.ui && LD.ui.toast('Sem permissão para editar isso.', 'erro');
      return Promise.reject(new Error('permissão'));
    }
    if (!item.ownerId) item.ownerId = uid();
    if (!item.ownerName) item.ownerName = userName();
    const clean = JSON.parse(JSON.stringify(item));
    const arr = state.data[col];
    const i = arr.findIndex((x) => x.id === item.id);
    if (i > -1) arr[i] = clean; else arr.push(clean);
    if (state.local) { saveLocal(col); emit(); return Promise.resolve(clean); }
    emit();
    return state.db.collection(COLECOES[col]).doc(item.id).set(clean).then(() => clean).catch((e) => {
      console.error(e);
      LD.ui && LD.ui.toast('Erro ao salvar: ' + e.message, 'erro');
      throw e;
    });
  }

  function remove(col, itemId) {
    const item = state.data[col].find((x) => x.id === itemId);
    if (!canEdit(col, item)) { LD.ui && LD.ui.toast('Sem permissão.', 'erro'); return Promise.reject(); }
    state.data[col] = state.data[col].filter((x) => x.id !== itemId);
    if (state.local) { saveLocal(col); emit(); return Promise.resolve(); }
    emit();
    return state.db.collection(COLECOES[col]).doc(itemId).delete();
  }

  function login(usuario, senha) {
    if (state.local) return Promise.resolve();
    const email = `${usuario.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@beyonddepths.com`;
    return state.auth.signInWithEmailAndPassword(email, senha).catch((err) => {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        return state.auth.createUserWithEmailAndPassword(email, senha);
      }
      throw err;
    });
  }
  function logout() { if (state.auth) state.auth.signOut(); }

  function semear() {
    if (!LD.seed) return Promise.resolve(0);
    const jobs = LD.seed.itens.map((item) => save('itens', JSON.parse(JSON.stringify(item))));
    return Promise.allSettled(jobs).then((r) => r.filter((x) => x.status === 'fulfilled').length);
  }

  // Só os itens do catálogo que ainda não estão na Loja (não mexe nos que a mestragem editou).
  let semeandoFaltantes = false;
  function semearFaltantes() {
    if (!LD.seed || semeandoFaltantes || !isMaster()) return Promise.resolve(0);
    const tem = new Set(state.data.itens.map((x) => x.id));
    const faltam = LD.seed.itens.filter((x) => !tem.has(x.id));
    if (!faltam.length) return Promise.resolve(0);
    semeandoFaltantes = true;
    return Promise.allSettled(faltam.map((item) => save('itens', JSON.parse(JSON.stringify(item)))))
      .then((r) => { semeandoFaltantes = false; return r.filter((x) => x.status === 'fulfilled').length; });
  }

  function exportar() {
    return JSON.stringify({ sistema: 'egide-v1', exportadoEm: new Date().toISOString(), dados: state.data }, null, 2);
  }
  function importar(json, colecoes) {
    const obj = typeof json === 'string' ? JSON.parse(json) : json;
    const dados = obj.dados || obj;
    const jobs = [];
    (colecoes || Object.keys(COLECOES)).forEach((col) => {
      (dados[col] || []).forEach((item) => {
        const copia = Object.assign({}, item);
        if (!state.local && !isMaster()) delete copia.ownerId;
        jobs.push(save(col, copia));
      });
    });
    return Promise.allSettled(jobs);
  }

  LD.store = {
    state, init, save, remove, login, logout, isMaster, canEdit, semear, semearFaltantes, exportar, importar, newId: id, uid, userName,
    on: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    get: (col, itemId) => state.data[col].find((x) => x.id === itemId),
    list: (col) => state.data[col],
    COLECOES
  };
})();
