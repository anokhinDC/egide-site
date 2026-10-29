/* Égide · Pontos Sexy (PS): o lado íntimo da ficha, na aba NSFW.
 * Funciona como Traços e Fraquezas: Atributos íntimos e Qualidades custam PS; Pontos Fracos devolvem PS.
 * Teste íntimo = d20 + Atributo íntimo. Todos os personagens são adultos. */
(function () {
  'use strict';
  const LD = window.LD;
  const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : (d || 0); };

  const PS_INICIAIS = 4;
  const TETO_CRIACAO = 3;   // Atributo íntimo na criação
  const TETO = 3;            // limite de cada Atributo íntimo, sempre
  const MAX_PS_FRACOS = 4;  // Pontos Fracos devolvem no máximo 4 PS

  const ATRIBUTOS_INTIMOS = [
    { key: 'charme', nome: 'Charme', desc: 'Atrair, seduzir, deixar alguém sem graça com um olhar.' },
    { key: 'folego', nome: 'Fôlego', desc: 'Aguentar: quanto tempo e quantas vezes.' },
    { key: 'controle', nome: 'Controle', desc: 'Resistir: não se entregar, não perder a cabeça, manter a pose.' },
    { key: 'ousadia', nome: 'Ousadia', desc: 'Tomar a iniciativa, propor, inventar, arriscar.' }
  ];

  // [key, nome, custo em PS, efeito, pede detalhe?]
const QUALIDADES = [
  // Originais reescritos
  ['beijo', 'Beijo Marcante', 1, '+2 em Charme quando o beijo é a abordagem principal.'],
  ['olhar', 'Olhar Intenso', 1, 'Uma vez por cena, Vantagem em um teste de Charme usando apenas o olhar.'],
  ['voz', 'Voz Sedutora', 1, '+2 em Charme quando a conversa é a principal ferramenta (incluindo por telefone).'],
  ['maos', 'Mãos Hábeis', 1, '+2 em Ousadia com as mãos: massagem, toque e provocação física.'],
  ['flexivel', 'Flexibilidade', 1, '+2 em Ousadia. Nunca fica em posição desconfortável.'],
  ['recupera', 'Recuperação Rápida', 1, 'Após uma cena intensa, recupera completamente em minutos em vez de horas.'],
  ['lingua', 'Provocação Discreta', 1, 'Provocar e flertar em público sem chamar atenção: Vantagem em Charme discreto.'],
  ['corpo', 'Corpo Atraente', 2, '+1 em Charme sempre que a aparência física é relevante.'],
  ['incansavel', 'Resistência Elevada', 2, 'Vantagem em Fôlego.'],
  ['ferro', 'Autocontrole Elevado', 2, 'Vantagem em Controle.'],
  ['experiente', 'Experiência Íntima', 2, 'Uma vez por cena, pode rerrolar um teste íntimo.'],
  ['dominante', 'Presença Dominante', 2, 'Quem cede a você em uma cena testa Controle com Desvantagem para retomar o controle.'],
  ['rendicao', 'Rendição Consciente', 2, 'Quando escolhe ceder, o parceiro ganha Vantagem e você recebe +2 no próximo teste íntimo da cena.'],
  ['quimica', 'Química Instantânea', 2, 'Com uma pessoa específica (indique quem): Vantagem em todos os testes entre vocês dois.', true],
  ['magnetismo', 'Magnetismo do Poder', 2, 'Seu poder faz parte do charme (calor, eletricidade, luz etc.): +2 em Charme quando usado de forma sutil.'],

  // BDSM
  ['sadico', 'Inclinação Sádica', 2, 'Vantagem em testes envolvendo dor controlada, restrição e humilhação consensual.'],
  ['masoquista', 'Inclinação Masoquista', 2, 'Ao receber dor ou humilhação consensual, recebe +2 no próximo teste íntimo e pode recuperar 1 PS se atingir o clímax com isso.'],
  ['bondage', 'Habilidade com Restrição', 2, 'Uma vez por cena, pode imobilizar alguém com Vantagem. A pessoa imobilizada testa Controle com Desvantagem para se libertar.'],
  ['pet', 'Postura Submissa', 1, '+2 em testes de rendição e obediência. Facilita o uso de coleira, ajoelhar-se e seguir comandos.'],

  // Anal
  ['anal_expert', 'Experiência Anal', 2, '+2 em qualquer teste envolvendo penetração anal (dar ou receber). Dispensa preparo adicional e tolera maior intensidade.'],
  ['cu_sensivel', 'Sensibilidade Anal', 1, 'Quando recebe penetração anal, o parceiro ganha Vantagem e você recebe +2 no próximo teste para atingir o clímax.'],

  // Características físicas
  ['big_cock', 'Genital de Grande Porte', 2, '+2 em Ousadia e Charme quando o tamanho é relevante. Parceiros testam Controle com Desvantagem na primeira penetração.'],
  ['petite', 'Corpo Pequeno e Compacto', 2, '+2 em Ousadia quando é manipulado por alguém maior. Parceiros maiores ganham Vantagem para levantar, posicionar ou manusear o corpo.'],
  ['seios_grandes', 'Seios Volumosos', 2, '+2 em Charme sempre que os seios estão em evidência. Pode usá-los para estimular o parceiro com Vantagem.'],

  // Interação com aliados
  ['group_player', 'Conforto em Grupo', 2, 'Em cenas com três ou mais pessoas, recebe Vantagem em testes íntimos e pode conceder +2 a um aliado.'],
  ['aliado_foda', 'Parceiro Preferencial', 2, 'Com um aliado específico (indique quem): ambos recebem Vantagem quando agem juntos em cenas íntimas.', true],
  ['cuck', 'Observação Consensual', 1, 'Ao observar o parceiro com outra pessoa, pode escolher receber +2 em Controle ou +2 no próximo teste íntimo.'],
  ['shared', 'Disponibilidade Compartilhada', 2, 'Quando é compartilhado com aliados ou participa de cenas com múltiplas pessoas, todos os envolvidos recebem +1 e você recupera 1 PS ao final da cena.']
].map(([key, nome, custo, efeito, detalhe]) => ({ key, nome, custo, efeito, detalhe: !!detalhe }));


const FRACOS = [
  // Originais reescritos
  ['ponto_sensivel', 'Ponto Sensível', 1, 'Um local do corpo (indique qual): quando tocado ali, Controle com Desvantagem.', true],
  ['timido', 'Inibição Inicial', 1, 'Ousadia com Desvantagem para iniciar qualquer interação íntima.'],
  ['cora', 'Reação Visível', 1, 'Dificuldade em esconder reações: Enganação e Controle com −2 quando é provocado.'],
  ['elogio', 'Sensibilidade a Elogios', 1, 'Um elogio sincero concede ao outro +2 em Charme contra você.'],
  ['barulhento', 'Dificuldade de Discrição', 1, 'É difícil manter silêncio: pessoas próximas e dispositivos de comunicação percebem facilmente.'],
  ['folego_curto', 'Resistência Limitada', 1, 'Fôlego com −2.'],
  ['fetiche_fraco', 'Fraqueza Específica', 1, 'Algo específico (indique o quê: uniformes, tom de voz, poder, restrição etc.): diante disso, Controle com Desvantagem.', true],
  ['ciumento', 'Ciúme Intenso', 2, 'Ver a pessoa de interesse com outra: Controle CD 15 ou inicia uma cena.'],
  ['apaixonavel', 'Apego Rápido', 2, 'Com quem possui Vínculo 2 ou superior, Controle com Desvantagem.'],
  ['carente', 'Necessidade de Contato', 2, 'Uma semana sem contato afetivo ou íntimo: −1 em Controle até participar de uma cena.'],
  ['proibido', 'Atração pelo Risco', 2, 'Situações arriscadas, secretas ou proibidas geram Controle com Desvantagem quando há chance de ser descoberto.'],

  // Novos
  ['anal_viciado', 'Preferência Anal', 1, 'Se não houver penetração anal em uma cena intensa, recebe −1 em Controle até satisfazer essa preferência.'],
  ['size_queen', 'Preferência por Tamanho', 1, 'Prefere genitais de grande porte. Com tamanho médio ou menor, Ousadia e Charme com −1. Com tamanho excepcional, recebe Vantagem.'],
  ['peito_sensivel', 'Sensibilidade nos Seios', 1, 'Quando os seios são estimulados, Controle com Desvantagem. Pode atingir o clímax apenas com estímulo nessa região.'],
  ['submisso_fraco', 'Tendência Submissa', 2, 'Diante de alguém com postura claramente dominante, Controle com Desvantagem automática. Dificuldade em recusar comandos.'],
  ['publico', 'Exibicionismo', 1, 'Em situações públicas ou com risco de exposição, Ousadia com Vantagem, mas Controle com Desvantagem.'],
  ['aftercare_need', 'Necessidade de Cuidado Posterior', 1, 'Após cenas intensas de BDSM, se não receber cuidado e atenção, fica com −2 em Controle na próxima interação social.']
].map(([key, nome, ps, efeito, detalhe]) => ({ key, nome, ps, efeito, detalhe: !!detalhe }));
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
