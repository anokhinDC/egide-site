/* Égide · Pontos Sexy (PS): o lado íntimo da ficha, na aba NSFW.
 * Funciona como Traços e Fraquezas: Atributos íntimos e Qualidades custam PS; Pontos Fracos devolvem PS.
 * Teste íntimo = d20 + Atributo íntimo. Todos os personagens são adultos. */
(function () {
  'use strict';
  const LD = window.LD;
  const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : (d || 0); };

  const PS_INICIAIS = 8;
  const TETO_CRIACAO = 3;   // Atributo íntimo na criação
  const TETO = 5;
  const MAX_PS_FRACOS = 4;  // Pontos Fracos devolvem no máximo 4 PS

  const ATRIBUTOS_INTIMOS = [
    { key: 'charme', nome: 'Charme', desc: 'Atrair, seduzir, deixar alguém sem graça com um olhar.' },
    { key: 'folego', nome: 'Fôlego', desc: 'Aguentar: quanto tempo e quantas vezes.' },
    { key: 'controle', nome: 'Controle', desc: 'Resistir: não se entregar, não perder a cabeça, manter a pose.' },
    { key: 'ousadia', nome: 'Ousadia', desc: 'Tomar a iniciativa, propor, inventar, arriscar.' }
  ];

  // [key, nome, custo em PS, efeito, pede detalhe?]
  const QUALIDADES = [
    ['beijo', 'Beijo Inesquecível', 1, '+2 em Charme quando o beijo é a abordagem.'],
    ['olhar', 'Olhar Magnético', 1, 'Uma vez por cena, Vantagem num teste de Charme só com o olhar.'],
    ['voz', 'Voz de Veludo', 1, '+2 em Charme quando a conversa é a arma (ao telefone também).'],
    ['maos', 'Mãos Habilidosas', 1, '+2 em Ousadia com as mãos: massagem, toque, provocação.'],
    ['flexivel', 'Flexível', 1, '+2 em Ousadia, e nunca fica em posição desconfortável.'],
    ['recupera', 'Recuperação Rápida', 1, 'Depois de uma cena intensa, volta inteiro em minutos, não em horas.'],
    ['lingua', 'Língua Afiada', 1, 'Provocar e flertar em público sem ninguém perceber: Vantagem em Charme discreto.'],
    ['corpo', 'Corpo Escultural', 2, '+1 em Charme sempre que o visual conta.'],
    ['incansavel', 'Incansável', 2, 'Vantagem em Fôlego.'],
    ['ferro', 'Autocontrole de Ferro', 2, 'Vantagem em Controle.'],
    ['experiente', 'Experiente', 2, 'Uma vez por cena, rerrola um teste íntimo.'],
    ['dominante', 'Dominante Natural', 2, 'Quem cede a você numa cena testa Controle com Desvantagem para retomar as rédeas.'],
    ['rendicao', 'Rendição Graciosa', 2, 'Quando escolhe ceder, o parceiro ganha Vantagem, e você ganha +2 no próximo teste íntimo da cena.'],
    ['quimica', 'Química Instantânea', 2, 'Com uma pessoa (escreva quem): Vantagem em tudo entre vocês dois.', true],
    ['magnetismo', 'Magnetismo do Poder', 2, 'Seu poder faz parte do charme (calor, eletricidade, luz): +2 em Charme quando o usa de forma sutil.']
  ].map(([key, nome, custo, efeito, detalhe]) => ({ key, nome, custo, efeito, detalhe: !!detalhe }));

  // Pontos Fracos: devolvem PS. [key, nome, PS devolvidos, efeito, pede detalhe?]
  const FRACOS = [
    ['ponto_sensivel', 'Ponto Sensível', 1, 'Um lugar do corpo (escreva qual): tocado ali, Controle com Desvantagem.', true],
    ['timido', 'Tímido(a)', 1, 'Ousadia com Desvantagem para começar qualquer coisa.'],
    ['cora', 'Cora Fácil', 1, 'Não consegue esconder o que sente: Enganação e Controle com −2 quando provocado.'],
    ['elogio', 'Não Resiste a Elogio', 1, 'Um elogio sincero dá ao outro +2 em Charme contra você.'],
    ['barulhento', 'Barulhento(a)', 1, 'Discrição é impossível: o vizinho, a equipe e o comunicador sabem.'],
    ['folego_curto', 'Fôlego Curto', 1, 'Fôlego com −2.'],
    ['fetiche_fraco', 'Fraqueza por…', 1, 'Algo específico (escreva o quê: uniformes, voz grave, poder…): diante disso, Controle com Desvantagem.', true],
    ['ciumento', 'Ciumento(a)', 2, 'Ver quem você quer com outra pessoa: Controle CD 15 ou faz cena.'],
    ['apaixonavel', 'Apaixona Fácil', 2, 'Com quem tem Vínculo 2 ou mais com você, Controle com Desvantagem.'],
    ['carente', 'Carente', 2, 'Uma semana sem carinho: −1 em Controle até ter uma cena.'],
    ['proibido', 'Atração pelo Proibido', 2, 'O que é arriscado, secreto ou errado atrai: Controle com Desvantagem quando há perigo de ser pego.']
  ].map(([key, nome, ps, efeito, detalhe]) => ({ key, nome, ps, efeito, detalhe: !!detalhe }));

  const byKey = (l, k) => l.find((x) => x.key === k);

  function dados(f) {
    const n = (f && f.nsfw) || {};
    return { atributos: n.atributos || {}, qualidades: n.qualidades || [], fracos: n.fracos || [], detalhes: n.detalhes || {}, bonusPS: num(n.bonusPS) };
  }

  // Tudo o que a parte íntima calcula.
  function calc(f) {
    const d = dados(f);
    const A = {}; ATRIBUTOS_INTIMOS.forEach((a) => { A[a.key] = Math.max(0, Math.min(TETO, Math.floor(num(d.atributos[a.key])))); });
    const gastoAttr = Object.values(A).reduce((s, v) => s + v, 0);
    const gastoQual = d.qualidades.reduce((s, k) => s + ((byKey(QUALIDADES, k) || {}).custo || 0), 0);
    const ganhoFracos = Math.min(MAX_PS_FRACOS, d.fracos.reduce((s, k) => s + ((byKey(FRACOS, k) || {}).ps || 0), 0));
    const total = PS_INICIAIS + ganhoFracos + d.bonusPS;
    const gastos = gastoAttr + gastoQual;
    const avisos = [];
    if (gastos > total) avisos.push(`Você gastou ${gastos - total} PS a mais do que tem.`);
    if (!f.aprovada) ATRIBUTOS_INTIMOS.forEach((a) => { if (A[a.key] > TETO_CRIACAO) avisos.push(`${a.nome} passa de ${TETO_CRIACAO} na criação.`); });
    d.qualidades.concat(d.fracos).forEach((k) => { const t = byKey(QUALIDADES, k) || byKey(FRACOS, k); if (t && t.detalhe && !d.detalhes[k]) avisos.push(`${t.nome}: escreva o detalhe.`); });
    // Marcas de Vantagem/Desvantagem e bônus por atributo, para mostrar e rolar.
    const marcas = { charme: [], folego: [], controle: [], ousadia: [] };
    const tem = (k) => d.qualidades.includes(k) || d.fracos.includes(k);
    if (tem('incansavel')) marcas.folego.push({ tipo: 'van', txt: 'Incansável' });
    if (tem('ferro')) marcas.controle.push({ tipo: 'van', txt: 'Autocontrole de Ferro' });
    if (tem('timido')) marcas.ousadia.push({ tipo: 'des', txt: 'Tímido(a): para começar' });
    if (tem('folego_curto')) marcas.folego.push({ tipo: 'menos2', txt: 'Fôlego Curto' });
    if (tem('ponto_sensivel')) marcas.controle.push({ tipo: 'nota', txt: `Ponto Sensível: ${d.detalhes.ponto_sensivel || '?'}` });
    if (tem('fetiche_fraco')) marcas.controle.push({ tipo: 'nota', txt: `Fraqueza por ${d.detalhes.fetiche_fraco || '?'}` });
    if (tem('apaixonavel')) marcas.controle.push({ tipo: 'nota', txt: 'Apaixona Fácil (Vínculo 2+)' });
    if (tem('corpo')) A.charmeVisual = A.charme + 1;
    const bonusFixo = { charme: 0, folego: tem('folego_curto') ? -2 : 0, controle: 0, ousadia: 0 };
    return { A, total, gastos, livres: total - gastos, gastoAttr, gastoQual, ganhoFracos, avisos, marcas, bonusFixo, d };
  }

  LD.SEXY = { PS_INICIAIS, TETO_CRIACAO, TETO, MAX_PS_FRACOS, ATRIBUTOS_INTIMOS, QUALIDADES, FRACOS, calc };
})();
