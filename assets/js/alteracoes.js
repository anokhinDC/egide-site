/* Égide · Log de alterações das fichas.
 * descrever(antes, depois) devolve frases curtas com o que mudou ("Luta: 1 → 2", "PV: 38 → 30"). */
(function () {
  'use strict';
  const LD = window.LD;

  // Campos que não entram no log (técnicos ou repetidos em outro lugar).
  const IGNORAR = new Set(['updatedAt', 'ownerId', 'ownerName', 'id', 'extrato', 'compras', 'aluguelAte', 'semanaSalario', 'kits', 'estilos', 'potencial.rolagens']);
  // Textos longos: só avisa que mudou.
  const TEXTOS = { 'nsfw.galeria': 'Galeria NSFW', historia: 'História', aparencia: 'Aparência', notas: 'Notas', perda: 'A Perda', 'adulto.fetiches': 'Fetiches', 'adulto.limites': 'Limites', retrato: 'Imagem do personagem', conceito: 'Conceito' };

  const NOMES = {
    nome: 'Nome civil', codinome: 'Nome de herói', simbolo: 'Símbolo', alinhamento: 'Alinhamento', origem: 'Origem', arquetipo: 'Arquétipo',
    estiloPoder: 'Estilo de Poder', tradicao: 'Tradição', 'potencial.resultado': 'Potencial', feNoDestino: 'Fé no Destino',
    ascensao: 'Classe', aprovada: 'Aprovação', novaEgide: 'Nova Égide', salario: 'Salário', creditos: 'Créditos', gastoTotal: 'Gastos',
    recursos: 'Dinheiro inicial', recursosOpcao: 'Opção de dinheiro', inicialFixo: 'Dinheiro inicial (aprovado)', ptTreino: 'PT de treino (mestragem)', bonusPV: 'Bônus de PV',
    'bonus.pt': 'Bônus de PT', 'bonus.pp': 'Bônus de PP', 'bonus.det': 'Bônus de Determinação',
    'medidores.pv': 'PV', 'medidores.energia': 'Energia', 'medidores.det': 'Determinação', 'medidores.fadiga': 'Fadiga', 'medidores.sussurro': 'Sussurro',
    'vidaCivil.emprego': 'Emprego', 'vidaCivil.mora': 'Bairro', 'vidaCivil.moradia': 'Moradia', 'vidaCivil.identidadeSecreta': 'Identidade secreta', 'vidaCivil.quemSabe': 'Quem sabe'
  };

  const vazio = (v) => v === undefined || v === null || v === '' || v === 0 || v === false || (Array.isArray(v) && !v.length) || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length);
  const igual = (a, b) => (vazio(a) && vazio(b)) || JSON.stringify(a) === JSON.stringify(b);
  const mostrar = (v) => (v === true ? 'sim' : v === false ? 'não' : vazio(v) ? '—' : String(v));
  const byKey = (l, k) => (l || []).find((x) => x.key === k);

  function nomeCampo(caminho) {
    if (NOMES[caminho]) return NOMES[caminho];
    const [a, b] = caminho.split('.');
    if (a === 'atributos') return b;
    if (a === 'pericias') return (byKey(LD.PERICIAS, b) || {}).nome || b;
    if (a === 'tracoNotas') return 'Nota do Traço';
    return caminho;
  }
  function valorCampo(caminho, v) {
    if (caminho === 'origem') return (byKey(LD.ORIGENS, v) || {}).nome || mostrar(v);
    if (caminho === 'arquetipo') return (byKey(LD.ARQUETIPOS, v) || {}).nome || mostrar(v);
    if (caminho === 'ascensao') return LD.DEGRAUS_CLASSE ? String(LD.DEGRAUS_CLASSE[Math.max(0, Math.min(9, +v || 0))]).replace('.', ',') : mostrar(v);
    if (caminho === 'vidaCivil.moradia') return (byKey(LD.MORADIAS_TIPOS, v) || {}).nome || mostrar(v);
    if (['salario', 'creditos', 'gastoTotal', 'inicialFixo'].includes(caminho) && LD.rules) return vazio(v) ? 'US$ 0' : LD.rules.fmtUS(v);
    return mostrar(v);
  }

  // Listas: diz o que entrou e o que saiu, pelo nome.
  function rotuloItem(campo, x) {
    if (typeof x === 'string') return (byKey(LD.QUALIDADES, x) || byKey(LD.DEFEITOS, x) || {}).nome || x;
    return x.nome || x.key || x.itemId || 'item';
  }
  function difLista(campo, nome, a, b) {
    a = a || []; b = b || [];
    const ja = a.map((x) => JSON.stringify(x)); const jb = b.map((x) => JSON.stringify(x));
    const entrou = b.filter((x, i) => !ja.includes(jb[i])).map((x) => rotuloItem(campo, x));
    const saiu = a.filter((x, i) => !jb.includes(ja[i])).map((x) => rotuloItem(campo, x));
    // Item que só mudou por dentro (mesmo nome dos dois lados): "editado".
    const editados = entrou.filter((n) => saiu.includes(n));
    const out = [];
    const so = (l) => l.filter((n) => !editados.includes(n));
    if (so(entrou).length) out.push(`${nome}: + ${so(entrou).join(', ')}`);
    if (so(saiu).length) out.push(`${nome}: − ${so(saiu).join(', ')}`);
    if (editados.length) out.push(`${nome}: ${editados.join(', ')} alterado`);
    return out;
  }
  const LISTAS = { poderes: 'Poderes', grimorio: 'Grimório', inventario: 'Inventário', qualidades: 'Qualidades', defeitos: 'Defeitos', fraquezas: 'Fraquezas', aumentos: 'Aumentos de Atributo', origemBonus: 'Bônus da Origem', 'medidores.condicoes': 'Condições' };

  function achatar(o, pre, out) {
    Object.keys(o || {}).forEach((k) => {
      const c = pre ? `${pre}.${k}` : k;
      if (IGNORAR.has(c) || IGNORAR.has(k) && !pre) return;
      const v = o[k];
      if (LISTAS[c] || TEXTOS[c]) { out[c] = v; return; }
      if (v && typeof v === 'object' && !Array.isArray(v)) achatar(v, c, out); else out[c] = v;
    });
    return out;
  }

  function descrever(antes, depois) {
    const A = achatar(antes, '', {}); const B = achatar(depois, '', {});
    // Antes da aprovação os medidores enchem sozinhos: não é alteração.
    if (!depois.aprovada) Object.keys(B).filter((k) => k.startsWith('medidores.') && !LISTAS[k]).forEach((k) => { delete A[k]; delete B[k]; });
    const out = [];
    new Set(Object.keys(A).concat(Object.keys(B))).forEach((c) => {
      if (igual(A[c], B[c])) return;
      if (c.startsWith('treino')) return; // o treino tem o próprio diário
      if (LISTAS[c]) { out.push(...difLista(c, LISTAS[c], A[c], B[c])); return; }
      if (TEXTOS[c]) { out.push(`${TEXTOS[c]} editado`); return; }
      if (c.startsWith('nsfw.respostas.')) { out.push(`NSFW: resposta "${c.slice(15).replace(/_/g, ' ')}" editada`); return; }
      if (c.startsWith('nsfw.marcas.')) { out.push(`NSFW: ${c.slice(12).replace(/_/g, ' ')}: ${mostrar(A[c])} → ${mostrar(B[c])}`); return; }
      out.push(`${nomeCampo(c)}: ${valorCampo(c, A[c])} → ${valorCampo(c, B[c])}`);
    });
    const ta = (antes.treino || {}).log || []; const tb = (depois.treino || {}).log || [];
    if (tb.length > ta.length || (tb.length && ta.length && tb[tb.length - 1].quando !== ta[ta.length - 1].quando)) {
      const e = tb[tb.length - 1]; out.push(`Treino anotado: ${e.area} (${e.passou ? `+${e.marcas} Marcas` : 'falhou'})`);
    }
    return out;
  }

  LD.alteracoes = { descrever };
})();
