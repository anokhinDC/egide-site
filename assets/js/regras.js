/*
 * Égide · Registro de Heróis
 * Regras e fórmulas do sistema (copiadas do vault: Status, Poderes, Criando Poderes,
 * Rolagem de Potencial, Fontes de Poder, Estilos, Traços, Magia, Equipamento e Recursos).
 * Tudo o que é número sai daqui: as páginas só mostram.
 */
(function () {
  const LD = (window.LD = window.LD || {});
  LD.byKey = (arr, key) => arr.find((x) => x.key === key);

  /* ---------- Atributos ---------- */
  const ATRIBUTOS = [
    { key: 'FOR', nome: 'Força', desc: 'Golpes corpo a corpo, levantar, quebrar, agarrar.' },
    { key: 'AGI', nome: 'Agilidade', desc: 'Defesa, iniciativa, esquiva, armas de longe.' },
    { key: 'VIG', nome: 'Vigor', desc: 'PV, Resistência, fôlego, veneno, frio, dor.' },
    { key: 'INT', nome: 'Intelecto', desc: 'Ciência, tecnologia, investigação, achar a Brecha.' },
    { key: 'VON', nome: 'Vontade', desc: 'Controle dos poderes, resistir à mente e à Fome.' },
    { key: 'PRE', nome: 'Presença', desc: 'Inspirar, liderar, intimidar, mentir, convencer.' }
  ];
  // A escala de um Atributo depende da Classe: o teto é 5 + Classe, e cada valor usa uma parte da Classe.
  // No teto, o Atributo trabalha na escala da Classe inteira; abaixo dele, numa fração.
  const ESCALA_HUMANA = ['', 'Fraco', 'Comum', 'Treinado', 'Atleta', 'Elite', 'Ápice humano'];
  const ESCALA_CLASSE = ['Humano', 'Ápice', 'Quarteirão', 'Cidade', 'Nação', 'Planeta', 'Estrela', 'Cósmico'];
  const ESCALA_ATRIBUTO = ESCALA_HUMANA;
  const PONTOS_DE_ATRIBUTO = 12;

  /* ---------- Perícias ----------
   * 42 Perícias, 7 por Atributo. Grau 0 a 5: cada grau custa 1 PT e dá +1 no teste. Teste = d20 + Atributo + Perícia.
   * "efeito" diz o que o site soma sozinho na ficha. */
  const P_ = (key, nome, attr, desc, efeito) => ({ key, nome, attr, desc, efeito: efeito || '' });
  const PERICIAS = [
    // Força
    P_('luta', 'Luta', 'FOR', 'Socos, chutes, briga de rua.', 'Ataque desarmado +1 por grau. Dano: 1d6, mais 1d6 a cada 2 graus.'),
    P_('pesadas', 'Armas Pesadas', 'FOR', 'Martelos, machados, marretas, correntes.', 'Ataque com arma pesada +1 por grau. +1d6 de dano a cada 2 graus.'),
    P_('arremesso', 'Arremesso', 'FOR', 'Facas, bumerangues, granadas, um carro.', 'Ataque de arremesso +1 por grau. +1d6 de dano a cada 2 graus.'),
    P_('agarrar', 'Agarrar', 'FOR', 'Imobilizar, derrubar, escapar.', 'Manobras +1 por grau.'),
    P_('guarda', 'Guarda', 'FOR', 'Bloquear golpes, cobrir quem está ao lado.', 'Bloquear +1 por grau.'),
    P_('atletismo', 'Atletismo', 'FOR', 'Escalar, nadar, saltar.'),
    P_('forca_bruta', 'Força Bruta', 'FOR', 'Arrombar, quebrar, erguer, segurar o que cai.', 'Empurrar +1 m por grau.'),
    // Agilidade
    P_('laminas', 'Lâminas', 'AGI', 'Facas, espadas, lanças.', 'Ataque com lâmina +1 por grau. +1d6 de dano a cada 2 graus.'),
    P_('pontaria', 'Pontaria', 'AGI', 'Armas de fogo e arcos.', 'Ataque à distância +1 por grau. +1d6 de dano a cada 2 graus.'),
    P_('esquiva', 'Esquiva', 'AGI', 'Não estar onde o golpe chega.', 'Defesa e Esquivar +1 por grau.'),
    P_('acrobacia', 'Acrobacia', 'AGI', 'Equilíbrio, quedas, telhados.', 'Reflexos +1 por grau.'),
    P_('furtividade', 'Furtividade', 'AGI', 'Esconder-se, andar sem ruído, seguir alguém.'),
    P_('pilotagem', 'Pilotagem', 'AGI', 'Carros, motos, barcos, perseguições.'),
    P_('prestidigitacao', 'Prestidigitação', 'AGI', 'Bater carteira, fechaduras, truques de mão.'),
    // Vigor
    P_('resiliencia', 'Resiliência', 'VIG', 'Aguentar dor e golpes.', 'Fortitude +1 por grau. PV +3 por grau.'),
    P_('vitalidade', 'Vitalidade', 'VIG', 'Se recuperar rápido.', 'Segundo Fôlego e descanso curto: +2 PV por grau.'),
    P_('imunidade', 'Imunidade', 'VIG', 'Veneno, gás, doença, bebida.', 'Contra veneno, gás e doença: +1 por grau.'),
    P_('folego', 'Fôlego', 'VIG', 'Prender a respiração, aguentar o cansaço.', 'Fôlego +1 rodada por grau. Energia +1 a cada 2 graus (quem não é Arcano).'),
    P_('corrida', 'Corrida', 'VIG', 'Correr rápido e longe, perseguições a pé.', 'Deslocamento +2 m por grau.'),
    P_('aclimatacao', 'Aclimatação', 'VIG', 'Frio, calor, altitude, fundo do mar.', 'Contra o ambiente: +1 por grau.'),
    P_('sobrevivencia', 'Sobrevivência', 'VIG', 'Mato, rua, fome, abrigo.'),
    // Intelecto
    P_('investigacao', 'Investigação', 'INT', 'Pistas, arquivos, deduções.'),
    P_('tatica', 'Tática', 'INT', 'Ler o combate, achar a Brecha, planejar.', 'Ler a Brecha +1 por grau.'),
    P_('conhecimento', 'Conhecimento', 'INT', 'História, leis, ciência, idiomas.'),
    P_('tecnologia', 'Tecnologia', 'INT', 'Máquinas, armaduras, consertar, sabotar.'),
    P_('computacao', 'Computação', 'INT', 'Hackear, redes, câmeras, rastrear sinais.'),
    P_('medicina', 'Medicina', 'INT', 'Primeiros socorros, cirurgia, levantar um Nocauteado.', 'Kit de Cura cura +1 por grau.'),
    P_('ocultismo', 'Ocultismo', 'INT', 'Magia, deuses, rituais.', 'Conjurar +1 por grau.'),
    // Vontade
    P_('percepcao', 'Percepção', 'VON', 'Ver, ouvir, notar a emboscada.', 'Percepção passiva e Iniciativa +1 por grau.'),
    P_('intuicao', 'Intuição', 'VON', 'Sentir a mentira, ler intenções.'),
    P_('rastreio', 'Rastreio', 'VON', 'Seguir trilhas, achar quem sumiu.'),
    P_('concentracao', 'Concentração', 'VON', 'Sustentar poderes, resistir à mente.', 'Mente +1 por grau. Para Arcanos, Energia +1 a cada 2 graus.'),
    P_('coragem', 'Coragem', 'VON', 'Não recuar diante do medo.', 'Contra Medo e Intimidação: +1 por grau.'),
    P_('dominio', 'Domínio do Poder', 'VON', 'Mirar e controlar os próprios poderes.', 'Acerto dos poderes +1 por grau.'),
    P_('adestramento', 'Adestramento', 'VON', 'Animais e criaturas.'),
    // Presença
    P_('persuasao', 'Persuasão', 'PRE', 'Convencer, negociar, inspirar.'),
    P_('enganacao', 'Enganação', 'PRE', 'Mentir, blefar.'),
    P_('disfarce', 'Disfarce', 'PRE', 'Se passar por outra pessoa.'),
    P_('intimidacao', 'Intimidação', 'PRE', 'Ameaçar, interrogar.'),
    P_('lideranca', 'Liderança', 'PRE', 'Comandar, levantar o moral.', 'Ajudar um aliado dá +1 extra por grau.'),
    P_('performance', 'Performance', 'PRE', 'Discurso, arte, distrair.'),
    P_('malandragem', 'Malandragem', 'PRE', 'A rua, o submundo, quem vende o quê.')
  ];
  // Perícias que saíram ou mudaram de nome: a ficha antiga é convertida (fica o maior grau).
  const PERICIAS_ANTIGAS = { ciencia: 'conhecimento' };
  const CARGA_MOCHILA = 25; // kg, sempre
  const GRAUS_PERICIA = ['—', 'Treinado', 'Experiente', 'Especialista', 'Mestre', 'Lenda'];
  const CUSTO_PERICIA = [0, 1, 2, 3, 4, 5]; // total: 1 PT por grau

  /* ---------- Potencial ---------- */
  const FAIXAS = [
    { min: 1, max: 17, nome: 'Faísca', emoji: '✨', classe: 1, pp: 10, pt: 6, det: 1, chance: '3%', preco: '' },
    { min: 18, max: 39, nome: 'Brasa', emoji: '🔸', classe: 2, pp: 13, pt: 4, det: 1, chance: '12%', preco: '' },
    { min: 40, max: 77, nome: 'Chama', emoji: '🔥', classe: 2, pp: 16, pt: 2, det: 0, chance: '44%', preco: '' },
    { min: 78, max: 94, nome: 'Fogueira', emoji: '🏕️', classe: 3, pp: 19, pt: 0, det: 0, chance: '29%', preco: '' },
    { min: 95, max: 99, nome: 'Incêndio', emoji: '🌋', classe: 3, pp: 22, pt: 0, det: 0, chance: '10%', preco: 'Uma segunda Fraqueza.' },
    { min: 100, max: 100, nome: 'Supernova', emoji: '🌟', classe: 4, pp: 25, pt: 0, det: 0, chance: '2%', preco: 'Uma Fraqueza grave, e o Eclipse sente o herói desde o primeiro dia.' }
  ];
  const FE_NO_DESTINO = 2;

  /* ---------- Origens ---------- */
  const ORIGENS = [
    { key: 'desperto', nome: 'Desperto', fonte: 'Um fragmento da estrela', rola: true,
      bonus: { fixo: ['VON'], escolha: 0 }, protecaoFonte: 0,
      vantagem: 'Poderes sempre ligados, sem foco. Uma Assinatura a mais.', limite: 'A meia-noite: falha junto com o fragmento.' },
    { key: 'mitico', nome: 'Mítico', fonte: 'Sangue, bênção ou treino dos deuses', rola: true, piso: 40, teto: 94,
      bonus: { fixo: [], escolha: 1, opcoes: ['FOR', 'PRE'] }, protecaoFonte: 2,
      vantagem: 'Armas e golpes Místicos: em Brecha contra criaturas sobrenaturais.', limite: 'Juramento: quebrar a palavra tira toda a Energia.' },
    { key: 'arcano', nome: 'Arcano', fonte: 'Magia aprendida', rola: true, ptExtra: 2,
      bonus: { fixo: [], escolha: 1, opcoes: ['INT', 'VON'] }, protecaoFonte: 0,
      vantagem: 'Versatilidade: qualquer efeito das escolas que conhece. +2 PT.', limite: 'Conjuração: todo feitiço pede teste, e a falha cobra um Preço.' },
    { key: 'engenhoso', nome: 'Engenhoso', fonte: 'Tecnologia', rola: false,
      bonus: { fixo: ['INT'], escolha: 0 }, protecaoFonte: 0,
      vantagem: 'Preparação: troca e melhora poderes entre edições. PP de Equipamento = 10 + INT × 2, +4 PT.', limite: 'Equipamento: pode ser roubado, quebrado e Desligado.' },
    { key: 'treinado', nome: 'Treinado', fonte: 'O corpo e a mente', rola: false,
      bonus: { fixo: ['AGI'], escolha: 1, opcoes: ['FOR', 'VIG', 'INT', 'VON', 'PRE'] }, protecaoFonte: 0,
      vantagem: 'Ápice: Ler a Brecha como Ação Rápida, +14 PT, 4 de Determinação.', limite: 'Carne e osso: sem Proteção de Fonte e sem PP.' },
    { key: 'visitante', nome: 'Visitante', fonte: 'Outro mundo, outra dimensão', rola: true, somaRolagem: 15,
      bonus: { fixo: [], escolha: 1, opcoes: ['FOR', 'AGI', 'VIG', 'INT', 'VON', 'PRE'] }, protecaoFonte: 3,
      vantagem: 'Corpo de outro mundo: Proteção de Fonte (Classe × 3) e Classe alta.', limite: 'Fraqueza grave e Estranheza (−2 em Persuasão e Enganação com humanos).' }
  ];

  /* ---------- Arquétipos ---------- */
  const ARQUETIPOS = [
    { key: 'pilar', nome: 'O Pilar', papel: 'Linha de frente.', habilidade: 'Inabalável: ao Aguentar, soma o VIG mais uma vez (três no total).' },
    { key: 'farol', nome: 'O Farol', papel: 'Inspira, lidera, cura.', habilidade: 'Palavra de Ordem: uma vez por combate, sem gastar ação, dá Vantagem a um aliado.' },
    { key: 'detetive', nome: 'O Detetive', papel: 'Investiga, descobre, planeja.', habilidade: 'Já Vi Isso: +2 para Ler a Brecha; fora de combate, uma pergunta direta à mestragem por cena.' },
    { key: 'artilheiro', nome: 'O Artilheiro', papel: 'Dano à distância, precisão.', habilidade: 'Na Mosca: Mirar tem 2 de penalidade a menos.' },
    { key: 'veloz', nome: 'O Veloz', papel: 'Mobilidade, resgate.', habilidade: 'Primeiro a Chegar: Resgatar como Ação Rápida, uma vez por rodada.' },
    { key: 'mistico', nome: 'O Místico', papel: 'Conhece o que não é deste mundo.', habilidade: 'Selo: uma vez por combate, Reação: VON + Ocultismo contra um poder de Sombra ou Místico; passou, cancela.' },
    { key: 'proprio', nome: 'Arquétipo próprio', papel: 'Criado com a mestragem.', habilidade: '' }
  ];

  /* ---------- Fraquezas ---------- */
  const FRAQUEZAS = [
    ['Escuridão total', 'Fica Apagado enquanto durar.', 'leve'],
    ['Juramento', 'Não pode mentir / recusar um desafio / atacar quem se rendeu. Quebrar: perde toda a Energia.', 'leve'],
    ['Material', 'Perto do material, perde a Proteção e age duas Classes abaixo.', 'grave'],
    ['Metal frio', 'Vulnerável a armas de ferro e aço.', 'seria'],
    ['Sobrecarga', 'Depois de uma Suprema, ou de Intensificar três vezes, fica Atordoado.', 'leve'],
    ['Rastro', 'O poder deixa marca: inimigos sempre sabem onde ele está.', 'leve'],
    ['Dependência', 'Precisa de algo. Sem ela, −2 em tudo.', 'leve'],
    ['Fonte', 'O poder precisa de algo do ambiente. Sem ela, age uma Classe abaixo.', 'seria'],
    ['Coração mole', 'Com um civil em perigo ao alcance, a Ação do turno tem que ser o Resgate.', 'leve'],
    ['Passado', 'Alguém sabe quem ele é e cobra. Uma vez por edição, o mestre traz esse alguém.', 'leve'],
    ['Descontrole', 'Num 1 natural com poder, o poder age sozinho e o Estrago sobe 2.', 'leve'],
    // As da Origem: entram sozinhas na ficha e não saem.
    ['Carne e osso', 'Controle Mental, Medo e Sussurro contra ele têm Vantagem.', 'leve', 'treinado'],
    ['Meia-noite', 'Quando o fragmento falha, fica Apagado.', 'leve', 'desperto'],
    ['Palavra dada', 'Quebrar a palavra tira toda a Energia.', 'leve', 'mitico'],
    ['Equipamento', 'O equipamento pode ser roubado, quebrado e Desligado.', 'leve', 'engenhoso'],
    ['Estranheza', '−2 em Persuasão e Enganação com humanos.', 'leve', 'visitante']
  ].map(([nome, efeito, gravidade, origem]) => ({ key: slug(nome), nome, efeito, gravidade, origem: origem || null }));
  // Fraquezas que a ficha tem: a da Origem (fixa) + as escolhidas.
  function fraquezasDe(f) {
    const fixas = FRAQUEZAS.filter((w) => w.origem && w.origem === f.origem).map((w) => Object.assign({ fixa: true }, w));
    return fixas.concat((f.fraquezas || []).filter((w) => !FRAQUEZAS.some((x) => x.origem && x.key === w.key)));
  }
  // O que Traços e Fraquezas mudam em cada Perícia (aparece na ficha e na rolagem).
  const MARCAS_TRACO = {
    mentiroso_ruim: { enganacao: ['des', 'Mentiroso Ruim'] },
    maos_de_ouro: { tecnologia: ['van', 'Mãos de Ouro (sem ferramentas)'] },
    sangue_frio: { coragem: ['van', 'Sangue-Frio (Medo)'], concentracao: ['van', 'Sangue-Frio (Medo)'] },
    memoria: { investigacao: ['van', 'Memória Fotográfica (lembrar)'], conhecimento: ['van', 'Memória Fotográfica (lembrar)'] },
    rosto_comum: { furtividade: ['van', 'Rosto Comum (se misturar)'], disfarce: ['van', 'Rosto Comum (se misturar)'] },
    bom_de_copo: { imunidade: ['van', 'Bom de Copo (venenos ingeridos)'] },
    direcao: { sobrevivencia: ['van', 'Sentido de Direção (nunca se perde)'] },
    maos_leves: {},
    estranheza: { persuasao: ['menos2', 'Estranheza (com humanos)'], enganacao: ['menos2', 'Estranheza (com humanos)'] },
    carne_e_osso: { concentracao: ['nota', 'Carne e osso: Controle Mental e Medo contra você têm Vantagem'], coragem: ['nota', 'Carne e osso: Medo contra você tem Vantagem'] }
  };
  function marcasPericias(f) {
    const ks = (f.qualidades || []).concat(f.defeitos || [], fraquezasDe(f).map((w) => w.key));
    const out = {};
    ks.forEach((k) => Object.entries(MARCAS_TRACO[k] || {}).forEach(([p, m]) => { (out[p] = out[p] || []).push({ tipo: m[0], txt: m[1] }); }));
    return out;
  }
  const GRAVIDADES = [
    { key: 'leve', nome: 'Leve', efeito: '−2 em tudo, ou perde uma Reação, ou um poder age um Grau abaixo.' },
    { key: 'seria', nome: 'Séria', efeito: 'Desvantagem em tudo, ou um poder some, ou age uma Classe abaixo.' },
    { key: 'grave', nome: 'Grave', efeito: 'Perde a Proteção e age duas Classes abaixo, ou fica Apagado, ou Controlado.' }
  ];

  /* ---------- Traços ---------- */
  const QUALIDADES = [
    ['ambidestro', 'Ambidestro', 1, 'Sem penalidade com a mão ruim. Com duas armas leves, +1 dado de dano uma vez por rodada.'],
    ['memoria', 'Memória Fotográfica', 1, 'Vantagem para lembrar detalhes, rostos, plantas, números.'],
    ['poliglota', 'Poliglota', 1, 'Fala cinco línguas. Aprende uma nova em um mês.'],
    ['sono_leve', 'Sono Leve', 1, 'Nunca é pego dormindo; não perde a Reação numa emboscada.'],
    ['sangue_frio', 'Sangue-Frio', 1, 'Vantagem em Mente contra Medo.'],
    ['direcao', 'Sentido de Direção', 1, 'Nunca se perde.'],
    ['rosto_comum', 'Rosto Comum', 1, 'Ninguém lembra dele. Vantagem para se misturar e seguir alguém.'],
    ['corredor', 'Corredor', 1, '+5 m de Deslocamento.'],
    ['bom_de_copo', 'Bom de Copo', 1, 'Imune a bebida e Vantagem contra venenos ingeridos.'],
    ['contato', 'Contato', 1, 'Um NPC menor confia no herói. Cada compra, um contato.'],
    ['mergulhador', 'Pulmões de Mergulhador', 1, 'O Fôlego dobra.'],
    ['reflexos_gato', 'Reflexos de Gato', 2, '+2 na Iniciativa. Nunca fica Desequilibrado por queda.'],
    ['duro_de_matar', 'Duro de Matar', 2, '+5 PV, e o Ainda de Pé funciona uma vez a mais por sessão.'],
    ['maos_de_ouro', 'Mãos de Ouro', 2, 'Vantagem em Tecnologia sem ferramentas.'],
    ['heroi_do_povo', 'Herói do Povo', 2, 'Começa com Reputação +1. Civis de um distrito ajudam sem pedir.'],
    ['rico', 'Rico', 2, 'Começa com US$ 15.000 a mais.'],
    ['sexto_sentido', 'Sexto Sentido', 2, 'Uma vez por cena, age primeiro numa emboscada.'],
    ['treino_militar', 'Treino Militar', 2, '+1 grau de graça em Pontaria (pode passar do teto).'],
    ['fragmento_estavel', 'Fragmento Estável', 3, '(Despertos) A meia-noite dura uma rodada a menos.', 'desperto'],
    ['coracao_antigo', 'Coração Antigo', 3, '(Míticos) Fala com qualquer Vigia como igual.', 'mitico'],
    ['vontade_ferro', 'Vontade de Ferro', 3, 'Sussurro só pesa a partir de 2, e Controlado só acontece com 4.']
  ].map(([key, nome, custo, efeito, origem]) => ({ key, nome, custo, efeito, origem: origem || null }));
  const DEFEITOS = [
    ['medo', 'Medo', 1, 'Diante da coisa: Mente CD 15 ou Desvantagem em tudo até sair dali.'],
    ['divida', 'Dívida', 1, 'Uma vez por edição, alguém vem cobrar.'],
    ['inimigo', 'Inimigo', 1, 'Alguém quer o mal dele e aparece quando menos se espera.'],
    ['distraido', 'Distraído', 1, 'Percepção passiva −3.'],
    ['pavio_curto', 'Pavio Curto', 1, 'Provocado, Mente CD 15 ou ataca quem provocou.'],
    ['mentiroso_ruim', 'Mentiroso Ruim', 1, 'Desvantagem em Enganação.'],
    ['procurado', 'Procurado', 1, 'O DAME tem a ficha dele. Ser identificado sobe o Relógio do Registro.'],
    ['cicatriz_antiga', 'Cicatriz Antiga', 1, '−1 em testes de um Atributo físico em cenas longas.'],
    ['dependente', 'Dependente', 2, 'Alguém que depende do herói: o alvo preferido dos vilões.'],
    ['codigo_rigido', 'Código Rígido', 2, 'Uma regra que nunca quebra, mesmo quando custa caro.'],
    ['fragil', 'Frágil', 2, '−5 PV.'],
    ['fama_ruim', 'Fama Ruim', 2, 'Começa com Reputação −1.'],
    ['sem_lugar', 'Sem Lugar', 2, 'Sem casa e sem emprego: começa sem dinheiro.']
  ].map(([key, nome, custo, efeito]) => ({ key, nome, custo, efeito }));
  const MAX_DEFEITOS = 2;
  const MAX_PT_DEFEITOS = 4;

  /* ---------- Estilos de Poder ---------- */
  const ESTILOS_PODER = [
    ['tita', 'Titã', 'FOR', 'Força Sobre-humana, Invulnerabilidade, FOR Sobre-humana.', 'Inabalável: não pode ser empurrado nem Derrubado por quem é de Classe igual ou menor.', 'Segurar o Mundo: por uma rodada, aguenta peso da própria Classe +1.'],
    ['velocista', 'Velocista', 'AGI', 'Supervelocidade, Regeneração leve, Sentidos.', 'Primeiro a Chegar: age sempre primeiro na primeira rodada, e o Resgate não gasta a ação.', 'Passo Fora do Tempo: Reação contra um ataque que já acertou: ele erra.'],
    ['energetico', 'Energético', 'VON', 'Rajada, Voo ou Campo de Força, Absorção.', 'Recarga: sempre que recebe dano do tipo da Rajada, ganha 1 Energia.', 'Feixe Contínuo: o ataque seguinte contra o mesmo alvo acerta sozinho.'],
    ['elementalista', 'Elementalista', 'VON', 'Elemento, Adaptação, Voo ou Movimento pelo elemento.', 'Domínio: imune ao próprio elemento, e +2 nos testes de Controle com ele.', 'Mudar o Campo: inimigos na área testam com Desvantagem.'],
    ['construtor', 'Construtor', 'VON', 'Construtos, Campo de Força, Voo.', 'Ferramenta Certa: uma vez por cena, um construto que dá Vantagem num teste.', 'Grande Construção: um construto do tamanho de um prédio por uma rodada.'],
    ['psiquico', 'Psíquico', 'VON', 'Telepatia, Telecinese ou Controle Mental, Sentidos.', 'Mente Aberta: ninguém o pega desprevenido.', 'Ligação: aliados +2 nas Reações até o fim da rodada.'],
    ['metamorfo', 'Metamorfo', 'VIG', 'Metamorfose, Elasticidade ou Crescer, Regeneração.', 'Rosto Nenhum: muda de rosto como Ação Rápida.', 'Forma de Combate: +2 em FOR e Armas Naturais Grau 2 por uma cena.'],
    ['feiticeiro', 'Feiticeiro', 'INT', 'Duas ou três escolas de Magia.', 'Grimório: um feitiço de cada escola não pede teste até o Grau 2.', 'Selo: Reação: contrafeitiço com +4.'],
    ['mitico', 'Mítico', 'FOR', 'Força Sobre-humana, arma mítica (Removível), uma escola.', 'Bênção: os golpes são Místicos.', 'Laço da Verdade: quem o herói toca não consegue mentir.'],
    ['armadurado', 'Armadurado', 'INT', 'Armadura, Rajada, Voo, Sentidos, tudo Removível.', 'Oficina: entre edições, troca até metade dos PP de equipamento.', 'Protocolo: o próximo ataque contra uma ameaça estudada é em Brecha.'],
    ['cosmico', 'Cósmico', 'VON', 'Rajada, Voo, Adaptação (vácuo), Invulnerabilidade.', 'Fora de Escala: uma vez por sessão, um feito de escala duas Classes acima.', 'Radiação: um ataque de poder que tira 2 Energia do alvo.'],
    ['sombrio', 'Sombrio', 'VON', 'Rajada de Sombra, Necromancia, atravessar sombras, Ilusão.', 'Filho da Noite: no escuro, +2 em ataque e em Furtividade.', 'Pavor: ataque que também causa Medo.'],
    ['bestial', 'Bestial', 'AGI', 'Armas Naturais, Sentidos, Regeneração, Movimento Especial.', 'Faro: não pode ser surpreendido e acha qualquer rastro de menos de um dia.', 'Frenesi: dois ataques por uma rodada, com Desvantagem na Defesa.'],
    ['furia', 'Fúria', 'FOR', 'Força Sobre-humana (Limitado), Regeneração, Invulnerabilidade.', 'Quanto Mais Apanho: cada vez que recebe dano, +1 no próximo dano.', 'Explodir: sobe a Fúria uma Classe na hora.'],
    ['imortal', 'Imortal', 'VIG', 'Regeneração alta, Adaptação, um Estilo de Luta forte.', 'Ainda Não: quando cairia a 0 PV, uma vez por cena, fica com Regeneração × 2 PV.', 'Ferida Aberta: ignora uma condição física até o fim da cena.'],
    ['tecnomante', 'Tecnomante', 'INT', 'Controle de Matéria (máquinas), Duplicação (drones), Sentidos.', 'Rede: sabe onde estão as câmeras e drones num quarteirão.', 'Desligar: tecnologia na linha de visão fica Desligada.']
  ].map(([key, nome, attr, nucleo, assinatura, tecnica]) => ({ key, nome, attr, nucleo, assinatura, tecnica }));

  /* ---------- Graus ---------- */
  const GRAUS = [
    null,
    { g: 1, dano: '1d6', alcance: 'Toque, 5 m', area: '1 m', duracao: 'Um instante' },
    { g: 2, dano: '2d6', alcance: '20 m', area: '3 m', duracao: '1 rodada' },
    { g: 3, dano: '3d6', alcance: '50 m', area: '5 m', duracao: '1 minuto' },
    { g: 4, dano: '4d6', alcance: '100 m', area: '10 m', duracao: 'Uma cena' },
    { g: 5, dano: '5d6', alcance: '500 m', area: '20 m', duracao: 'Uma hora' },
    { g: 6, dano: '6d6', alcance: 'Linha de visão', area: '50 m', duracao: 'Um dia' },
    { g: 7, dano: '7d6', alcance: 'Horizonte', area: 'Um quarteirão', duracao: 'Permanente' },
    { g: 8, dano: '8d6', alcance: 'Horizonte', area: 'Mais de um quarteirão', duracao: 'Permanente' }
  ];

  /* ---------- Poderes: catálogo, efeitos básicos e escolas ---------- */
  // tipo: ataque (dano), protecao (Proteção), defesa (Defesa), outro.
  const P = (key, nome, grupo, custo, attrs, efeito, extra) => Object.assign({ key, nome, grupo, custo, attrs, efeito, tipo: 'outro' }, extra);
  const PODERES = [
    P('forca', 'Força Sobre-humana', 'Corpo', 2, ['FOR'], 'Golpes físicos usam Potência = Classe × 5. Levanta conforme a Classe. +1 dado de dano físico a cada 2 Graus.'),
    P('atributo', 'Atributo Sobre-humano', 'Corpo', 1, [], '+1 num Atributo por Grau, passando do teto (5 + Classe). Máximo 12.', { alvoAtributo: true }),
    P('invulnerabilidade', 'Invulnerabilidade', 'Corpo', 2, ['VIG'], 'Proteção = Grau × 5 (teto Classe × 5).', { tipo: 'protecao', protecao: (g, c) => Math.min(g * 5, x5(c)) }),
    P('armadura', 'Armadura', 'Corpo', 2, ['INT'], 'Traje tecnológico: Proteção = Grau × 4 (teto Classe × 5). Sempre Removível.', { tipo: 'protecao', protecao: (g, c) => Math.min(g * 4, x5(c)), falhaPadrao: 'removivel' }),
    P('regeneracao', 'Regeneração', 'Corpo', 2, ['VIG'], 'No início do turno, recupera Grau × 2 PV. Grau 4+: volta de Cicatrizes em uma semana.'),
    P('elasticidade', 'Elasticidade', 'Corpo', 2, ['AGI'], 'Alcance corpo a corpo de Grau × 2 m, +Grau em Agarrar e Escapar.'),
    P('crescer', 'Crescer / Encolher', 'Corpo', 2, ['FOR', 'AGI'], 'Crescer: +Grau em FOR, −Grau/2 em Defesa. Encolher: +Grau em Defesa e Furtividade.'),
    P('adaptacao', 'Adaptação', 'Corpo', 1, ['VIG'], 'Por Grau, ignora um ambiente: frio, calor, fundo do mar, vácuo, veneno, fome e sono.'),
    P('armas_naturais', 'Armas Naturais', 'Corpo', 1, ['FOR'], 'Garras, presas, espinhos: +1d6 por Grau nos golpes, e Sangramento num crítico.'),
    P('voo', 'Voo', 'Movimento', 2, ['AGI'], 'Voa com a velocidade da Classe. +1 de Defesa contra quem não voa.'),
    P('velocidade', 'Supervelocidade', 'Movimento', 2, ['AGI'], 'Deslocamento × Grau, +Grau na Iniciativa. Grau 3+: uma ação extra só para mover, Resgatar ou Ajudar.', { iniciativa: (g) => g }),
    P('teleporte', 'Teleporte', 'Movimento', 2, ['VON'], 'Some e aparece até o alcance do Grau. Grau 4+: leva outras pessoas.'),
    P('movimento', 'Movimento Especial', 'Movimento', 1, ['AGI'], 'Andar em paredes, respirar na água, saltar prédios, balançar em cabos. Um por Grau.'),
    P('intangibilidade', 'Intangibilidade', 'Movimento', 2, ['VON'], 'Atravessa matéria. Só Energia, Mental e Místico o afetam. 1 Energia por rodada.'),
    P('rajada', 'Rajada', 'Energia', 2, ['VON', 'AGI'], 'Ataque à distância de Energia, Luz, Fogo, Gelo, Elétrico, Sônico ou Sombra.', { tipo: 'ataque' }),
    P('elemento', 'Elemento', 'Energia', 2, ['VON'], 'Controla um elemento: ataca, defende, cria, molda.', { tipo: 'ataque' }),
    P('todos_elementos', 'Todos os Elementos', 'Energia', 3, ['VON'], 'Como Elemento, para todos.', { tipo: 'ataque' }),
    P('construtos', 'Construtos', 'Energia', 3, ['VON', 'INT'], 'Objetos sólidos de energia com Grau × 5 PV.'),
    P('campo_forca', 'Campo de Força', 'Energia', 2, ['VON'], 'Proteção Grau × 5 enquanto sustentado (1 Energia por rodada).', { tipo: 'protecao', sustentado: true, protecao: (g, c) => Math.min(g * 5, x5(c)) }),
    P('absorcao', 'Absorção', 'Energia', 2, ['VIG'], 'Absorve Grau × 3 de um tipo de dano por golpe e ganha 1 Energia.'),
    P('telepatia', 'Telepatia', 'Mente', 2, ['VON'], 'Ler e falar com mentes no alcance do Grau.'),
    P('controle_mental', 'Controle Mental', 'Mente', 3, ['VON'], 'VON do alvo contra a CD, ou fica Controlado. Grau 5+: um grupo. Pede um Preço narrativo.'),
    P('ilusao', 'Ilusão', 'Mente', 2, ['PRE', 'VON'], 'Imagens e sons falsos. Quem desconfiar faz Intuição contra a CD.'),
    P('telecinese', 'Telecinese', 'Mente', 3, ['VON'], 'Move objetos e pessoas com a força da Classe. Ataca e defende.', { tipo: 'ataque' }),
    P('sentidos', 'Sentidos', 'Mente', 1, ['VON'], 'Por Grau, um sentido especial.'),
    P('precognicao', 'Precognição', 'Mente', 2, ['VON'], 'Grau vezes por sessão, rerrola um d20 de qualquer pessoa na cena.'),
    P('metamorfose', 'Metamorfose', 'Matéria', 3, ['VIG', 'PRE'], 'Muda de forma: pessoas (Grau 2), animais (3), formas monstruosas (4+).'),
    P('duplicacao', 'Duplicação', 'Matéria', 2, ['VIG'], 'Grau cópias que agem como Lacaios e somem com um acerto.'),
    P('invisibilidade', 'Invisibilidade', 'Matéria', 2, ['AGI'], 'Atacá-lo é com Desvantagem; ele ataca com Vantagem. 1 Energia por rodada em combate.'),
    P('controle_materia', 'Controle de Matéria', 'Matéria', 3, ['INT'], 'Transforma uma substância em outra. Grau 2: objetos pequenos. Grau 5: prédios.'),
    P('probabilidade', 'Probabilidade', 'Matéria', 3, ['VON'], 'Grau vezes por cena, Vantagem a um aliado ou Desvantagem a um inimigo.'),
    P('drenar', 'Drenar', 'Matéria', 2, ['VON'], 'Toque que rouba PV ou Energia, ou copia um poder por uma cena (Grau 4+).', { tipo: 'ataque' }),
    P('animais', 'Animais', 'Matéria', 2, ['PRE'], 'Comanda animais. Grau 4+: um enxame ataca em área.'),
    P('necromancia', 'Necromancia', 'Matéria', 3, ['VON'], 'Fala com os mortos, ergue ossos e sombras como Lacaios. É Sombra.'),
    P('tempo', 'Tempo', 'Cósmico', 4, ['INT'], 'Grau 1: uma ação extra por cena. Grau 2: volta 1 rodada, uma vez por sessão.', { cosmico: true }),
    P('realidade', 'Realidade', 'Cósmico', 4, ['VON'], 'Grau 1: um "e se" pequeno por sessão. Grau 2: um milagre por arco, com preço.', { cosmico: true }),
    // Efeitos básicos (Criando Poderes)
    P('ataque', 'Ataque', 'Efeito básico', 2, ['VON', 'AGI', 'FOR', 'INT', 'PRE', 'VIG'], 'Grau d6 + atributo + Potência, contra a Defesa (ou área contra Reflexos).', { tipo: 'ataque' }),
    P('defesa', 'Defesa', 'Efeito básico', 2, ['VIG', 'VON', 'AGI', 'INT'], 'Proteção Grau × 5 (teto Classe × 5), ou +Grau/2 de Defesa, ou Absorção Grau × 3.', { tipo: 'protecao', protecao: (g, c) => Math.min(g * 5, x5(c)), modos: true }),
    P('mov_especial', 'Movimento (especial)', 'Efeito básico', 1, ['AGI'], 'Um movimento especial: paredes, água, sombras.'),
    P('mov_rapido', 'Movimento (rápido)', 'Efeito básico', 2, ['AGI', 'VON'], 'Voo, Supervelocidade ou Teleporte.'),
    P('sentido', 'Sentido', 'Efeito básico', 1, ['VON', 'INT'], 'Um sentido novo por Grau, ou o alcance de um sentido.'),
    P('controle', 'Controle', 'Efeito básico', 2, ['VON', 'INT', 'PRE'], 'Lento, Agarrado, Derrubado, Desequilibrado, Cego ou Medo, contra Salvaguarda.'),
    P('controle_forte', 'Controle (forte)', 'Efeito básico', 3, ['VON', 'INT', 'PRE'], 'Controlado, Atordoado ou Congelado, contra Salvaguarda.'),
    P('alteracao', 'Alteração', 'Efeito básico', 2, ['VIG', 'FOR', 'AGI'], 'Muda o próprio corpo: +Grau num atributo físico ou +Grau/2 de Defesa.'),
    P('criacao', 'Criação', 'Efeito básico', 3, ['VON', 'INT'], 'Cria objetos ou barreiras com Grau × 5 PV.'),
    P('cura', 'Cura', 'Efeito básico', 2, ['PRE', 'VON', 'INT'], 'Recupera Grau d6 + atributo de PV, ou tira uma condição, num toque.', { tipo: 'cura' }),
    P('suporte', 'Suporte', 'Efeito básico', 2, ['PRE', 'VON'], 'Aliados +Grau/2 em um tipo de rolagem, ou Vantagem num teste por cena por Grau.'),
    P('mente', 'Mente', 'Efeito básico', 2, ['VON', 'PRE'], 'Telepatia, ilusão, empatia, memórias, contra a Mente do alvo.'),
    P('transformacao', 'Transformação', 'Efeito básico', 3, ['INT', 'VON'], 'Muda o que outra coisa é: matéria, forma, estado.'),
    P('realidade_basica', 'Realidade (efeito)', 'Efeito básico', 4, ['VON'], 'Probabilidade, tempo, sorte. Só com a mestragem.', { cosmico: true }),
    // Escolas de Magia
    P('escola_elementar', 'Escola Elementar', 'Magia', 2, ['INT', 'VON'], 'Fogo, gelo, raio, vento, terra.', { escola: true }),
    P('escola_protecao', 'Escola de Proteção', 'Magia', 2, ['INT', 'VON'], 'Escudos, selos, banimento, quebrar maldições.', { escola: true }),
    P('escola_ilusao', 'Escola de Ilusão', 'Magia', 2, ['INT', 'VON'], 'Enganar os sentidos.', { escola: true }),
    P('escola_mente', 'Escola da Mente', 'Magia', 3, ['INT', 'VON'], 'Ler, acalmar, confundir, apagar memórias.', { escola: true }),
    P('escola_vida', 'Escola da Vida', 'Magia', 2, ['INT', 'VON'], 'Curar, purificar, fazer crescer.', { escola: true }),
    P('escola_sombra', 'Escola da Sombra', 'Magia', 2, ['INT', 'VON'], 'Escuridão, medo, os mortos. Atrai a Fome.', { escola: true }),
    P('escola_portais', 'Escola de Portais', 'Magia', 3, ['INT', 'VON'], 'Abrir passagens, invocar, banir.', { escola: true }),
    P('escola_transmutacao', 'Escola de Transmutação', 'Magia', 3, ['INT', 'VON'], 'Mudar o que as coisas são.', { escola: true }),
    P('escola_visao', 'Escola da Visão', 'Magia', 1, ['INT', 'VON'], 'Adivinhar, achar, ver o que está escondido.', { escola: true }),
    P('escola_caos', 'Escola do Caos', 'Magia', 3, ['INT', 'VON'], 'Sorte, probabilidade, o imprevisível.', { escola: true })
  ];
  const GRUPOS_PODER = ['Corpo', 'Movimento', 'Energia', 'Mente', 'Matéria', 'Cósmico', 'Efeito básico', 'Magia'];

  const EXTRAS = [
    ['area', 'Área', 'grau', 1, 'Afeta todos numa área do Grau (Reflexos para metade).'],
    ['seletivo', 'Seletivo', 'fixo', 1, 'Com Área: escolhe quem é afetado.'],
    ['alcance', 'Alcance', 'grau', 1, 'Um efeito de toque passa a ter o alcance do Grau.'],
    ['longo', 'Longo Alcance', 'fixo', 1, 'Alcance como se fosse 2 Graus acima.'],
    ['penetrante', 'Penetrante', 'grau', 1, 'Ignora 5 de Proteção.'],
    ['preciso', 'Preciso', 'grau', 1, '+2 para acertar, ou crítico em 19–20.'],
    ['multiplos', 'Múltiplos Alvos', 'grau', 1, 'Até Grau/2 alvos, cada um com o próprio ataque.'],
    ['condicao', 'Condição', 'grau', 1, 'Um acerto também aplica uma condição (Salvaguarda contra a CD).'],
    ['persistente', 'Persistente', 'grau', 1, 'Dura um Grau de duração a mais sem Sustentar.'],
    ['reacao', 'Reação', 'fixo', 2, 'Pode ser usado como Reação.'],
    ['rapido', 'Rápido', 'fixo', 2, 'Usa como Ação Rápida.'],
    ['afeta_outros', 'Afeta Outros', 'grau', 1, 'Dá o efeito a um aliado tocado.'],
    ['sutil', 'Sutil', 'grau', 1, 'Não deixa rastro visível nem sonoro.'],
    ['intangiveis', 'Afeta Intangíveis', 'grau', 1, 'Acerta fantasmas, intangíveis e Sombras.'],
    ['mistico', 'Místico', 'grau', 1, 'Brecha contra criaturas sobrenaturais. Só Míticos e Arcanos.']
  ].map(([key, nome, tipo, custo, efeito]) => ({ key, nome, tipo, custo, efeito }));
  const FALHAS = [
    ['cansativo', 'Cansativo', 'Cada uso custa 1 Energia.'],
    ['ativacao', 'Ativação', 'Precisa de uma Ação Rápida antes de funcionar na cena.'],
    ['limitado', 'Limitado', 'Só funciona em certa condição.'],
    ['incontrolavel', 'Incontrolável', 'Num 1 ou 2 natural, age sozinho e o Estrago sobe 1.'],
    ['removivel', 'Removível', 'Vem de um objeto que pode ser tirado.'],
    ['concentracao', 'Concentração', 'Exige Sustentar; sofrer dano pede Mente para manter.'],
    ['colateral', 'Efeito Colateral', 'Quando falha (ou num 1), o herói sofre o efeito.'],
    ['lento', 'Lento', 'Só funciona a cada duas rodadas.'],
    ['exposto', 'Exposto', 'Enquanto usa, −2 de Defesa.'],
    ['fonte', 'Fonte', 'Precisa de algo do ambiente. Sem a fonte, age 2 Graus abaixo.']
  ].map(([key, nome, efeito]) => ({ key, nome, efeito }));

  /* ---------- Magia ---------- */
  const TRADICOES = [
    ['estudo', 'Estudo', 'INT', 'ocultismo', '+2 em rituais. Aprende uma escola nova lendo um grimório.', 'Precisa do grimório para feitiços de Grau 3 ou mais.'],
    ['runas', 'Runas', 'INT', 'ocultismo', 'Prepara um feitiço antes da cena e usa como Ação Rápida, sem teste.', 'Preparar leva dez minutos e a Energia já sai na preparação.'],
    ['musica', 'Música', 'PRE', 'ocultismo', 'Suporte, Mente e Cura afetam todos os aliados que ouvem.', 'Silêncio ou mordaça bloqueia.'],
    ['sangue', 'Sangue', 'VIG', 'ocultismo', 'Paga o feitiço em PV (Grau × 3) em vez de Energia.', 'O Preço do Sangue acontece sempre que falha.'],
    ['pacto', 'Pacto', 'VON', 'ocultismo', 'Uma vez por sessão, o patrono paga a Energia de um feitiço.', 'Cada vez, a Dívida cresce.'],
    ['fe', 'Fé', 'PRE', 'ocultismo', 'Vida e Proteção com +2 na conjuração.', 'Um Juramento: quebrar tira a magia até a próxima sessão.'],
    ['cartas', 'Cartas e Sorte', 'VON', 'ocultismo', 'Uma vez por cena, rerrola uma conjuração.', 'Caos é obrigatória como primeira escola.'],
    ['alquimia', 'Alquimia', 'INT', 'conhecimento', 'Feitiços viram poções: até INT por descanso.', 'Sem laboratório, não prepara.'],
    ['dom', 'Dom', 'VON', 'ocultismo', 'Feitiço livre de Grau 2 em vez de 1.', 'Não aprende escola nova sem a mestragem.']
  ].map(([key, nome, attr, pericia, vantagem, limite]) => ({ key, nome, attr, pericia, vantagem, limite }));
  const PRECOS_MAGIA = ['Memória: esquece algo.', 'Sangue: perde Grau × 3 PV.', 'Eco: o Estrago sobe 1.', 'Dívida: alguém do outro lado anota.', 'Apagão: a escola fica bloqueada até o fim da cena.', 'Atenção: algo olha para o Arcano. +1 Sussurro.'];

  /* ---------- Condições, recursos, CDs ---------- */
  const CONDICOES = ['Atordoado', 'Derrubado', 'Agarrado', 'Lento', 'Desequilibrado', 'Marcado', 'Exposto', 'Medo', 'Controlado', 'Queimadura', 'Sangramento', 'Congelado', 'Desligado', 'Apagado', 'Brilhando'];
  const RECURSOS = [
    { n: 0, nome: 'Sem nada', paga: 'Comida do dia.' },
    { n: 1, nome: 'Apertado', paga: 'Ônibus, um lanche, um remédio.' },
    { n: 2, nome: 'Comum', paga: 'Uma moto usada, uma carga de Kit, um mês de aluguel.' },
    { n: 3, nome: 'Confortável', paga: 'Um carro, uma viagem, equipamento tático.' },
    { n: 4, nome: 'Rico', paga: 'Uma casa, um laboratório, subornos pesados.' },
    { n: 5, nome: 'Fortuna', paga: 'Um prédio, um avião, uma empresa.' }
  ];
  const CDS = [{ key: 10, nome: 'Fácil' }, { key: 15, nome: 'Médio' }, { key: 20, nome: 'Difícil' }, { key: 25, nome: 'Heroico' }, { key: 30, nome: 'Lendário' }];
  const FADIGA = ['Descansado', 'Cansado (−2 em Perícias)', 'Exausto (−2 em tudo)', 'Esgotado (−2, metade do Deslocamento, sem Reação)'];
  const KITS_PADRAO = { cura: 3, energia: 2, reerguer: 1, contencao: 0 };
  const KITS = [
    { key: 'cura', nome: 'Kit de Cura', efeito: '2d6 + Medicina de quem usa, e tira Sangramento.' },
    { key: 'energia', nome: 'Kit de Energia', efeito: '+3 Energia.' },
    { key: 'reerguer', nome: 'Kit de Reerguer', efeito: 'Levanta um Nocauteado com metade do PV.' },
    { key: 'contencao', nome: 'Kit de Contenção', efeito: 'Algemas de supressão para um Desperto.' }
  ];

  function slug(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : (d || 0); };

  /* =====================================================================
   * Fórmulas
   * ===================================================================== */

  function faixaDe(n) { return FAIXAS.find((f) => n >= f.min && n <= f.max) || null; }

  // O resultado que vale para a tabela, depois do ajuste da Origem.
  function resultadoAjustado(f) {
    const o = LD.byKey(ORIGENS, f.origem);
    let n = Math.floor(num(f.potencial && f.potencial.resultado));
    if (!o || !o.rola || n < 1) return null;
    n = clamp(n, 1, 100);
    if (o.somaRolagem) n = Math.min(100, n + o.somaRolagem);
    if (o.piso) n = clamp(n, o.piso, o.teto);
    return n;
  }

  // O que o Potencial dá: classe, PP, PT extra, Determinação extra, nome do pacote.
  function potencial(f) {
    const o = f.origem;
    if (o === 'treinado') return { nome: 'Ápice', classe: 1, pp: 0, pt: 14, det: 1, grauBonus: 0, rolou: false };
    if (o === 'engenhoso') {
      const lend = !!(f.recursosOpcao === 'lendarios');
      return { nome: lend ? 'Oficina (lendária)' : 'Oficina', classe: 1, pp: 10 + atributos(f, true).INT * 2, pt: 4, det: 0, grauBonus: 0, rolou: false, equipamento: true };
    }
    const n = resultadoAjustado(f);
    const fx = n ? faixaDe(n) : null;
    if (!fx) return { nome: '—', classe: 1, pp: 0, pt: 0, det: 0, grauBonus: 0, rolou: false, pendente: true };
    return {
      nome: fx.nome, emoji: fx.emoji, faixa: fx, resultado: n, classe: 1, pp: fx.pp,
      pt: fx.pt + (o === 'arcano' ? 2 : 0), det: fx.det, grauBonus: ['Incêndio', 'Supernova'].includes(fx.nome) ? 1 : 0, rolou: true, preco: fx.preco
    };
  }

  // A progressão é a Classe: todo herói começa na Classe 1 e sobe um degrau a cada marco da história.
  // 1 → 1,3 → 1,7 → 2 → 2,3 → 2,7 → 3 → 3,3 → 3,7 → 4 (teto para jogadores). Os degraus substituem os níveis.
  const DEGRAUS_CLASSE = [1, 1.3, 1.7, 2, 2.3, 2.7, 3, 3.3, 3.7, 4];
  // Degrau: 1 (Classe 1) a 10 (Classe 4).
  function degrau(f) { return clamp(Math.floor(num(f.ascensao, 0)), 0, DEGRAUS_CLASSE.length - 1) + 1; }
  // Classe do degrau (o que aparece na ficha). Treinados sobem degraus de Ápice.
  function classeDoDegrau(f) { return DEGRAUS_CLASSE[degrau(f) - 1]; }
  // Classe que mede a força: Treinados ficam na escala humana (Classe 1).
  function classe(f) { return f.origem === 'treinado' ? 1 : classeDoDegrau(f); }
  function rotuloClasse(f) { return `${f.origem === 'treinado' ? 'Ápice' : 'Classe'} ${String(classeDoDegrau(f)).replace('.', ',')}`; }
  // Os marcos de cada ganho, em degraus (n = degrau 1..10).
  const MARCOS = { grau5: 3, atributo1: 4, grau6: 6, atributo2: 8, grau7: 9 };
  const fmtClasse = (c) => String(c).replace('.', ',');
  const x5 = (c) => Math.round(c * 5);

  // Atributos finais: 1 + pontos + bônus de Origem + aumentos (níveis 4 e 8) + poderes de Atributo Sobre-humano.
  function atributos(f, semPoderes) {
    const out = {};
    const pts = f.atributos || {};
    const ob = f.origemBonus || [];
    const origem = LD.byKey(ORIGENS, f.origem);
    const fixos = origem ? origem.bonus.fixo : [];
    const aum = f.aumentos || [];
    ATRIBUTOS.forEach(({ key }) => {
      let v = 1 + clamp(Math.floor(num(pts[key])), 0, 9);
      v += fixos.filter((x) => x === key).length;
      v += ob.filter((x) => x === key).length;
      v += aum.filter((x) => x === key).length;
      out[key] = v;
    });
    if (!semPoderes) {
      (f.poderes || []).forEach((p) => {
        if (p.base === 'atributo' && p.alvo && out[p.alvo] != null) out[p.alvo] = Math.min(12, out[p.alvo] + num(p.grau, 1));
      });
    }
    return out;
  }

  function tetoAtributo(f) { return 5 + Math.floor(classe(f)); }

  // Em que escala um valor de Atributo trabalha, para uma Classe: {classe, nome, pct, teto}.
  function escalaAtributo(v, cls) {
    cls = Math.max(0, num(cls, 1));
    const teto = 5 + Math.floor(cls);
    const ef = Math.max(0, Math.min(7, Math.floor((cls * v) / teto)));
    const nome = ef > 0 ? ESCALA_CLASSE[ef] : ESCALA_HUMANA[Math.max(1, Math.min(5, v))];
    return { classe: ef, nome, pct: Math.round((v / teto) * 100), teto };
  }

  function grauMaximo(f) {
    const n = degrau(f);
    let g = n >= MARCOS.grau7 ? 7 : n >= MARCOS.grau6 ? 6 : n >= MARCOS.grau5 ? 5 : 4;
    if (potencial(f).grauBonus && g < 8) g += 1;
    return Math.min(g, 8);
  }

  // Custo de um poder montado (catálogo ou efeito básico) com Extras, Falhas e Variações.
  function custoPoder(p) {
    const base = LD.byKey(PODERES, p.base);
    const g = clamp(Math.floor(num(p.grau, 1)), 1, 8);
    let porGrau = base ? base.custo : num(p.custoBase, 2);
    let fixo = 0;
    (p.extras || []).forEach((k) => {
      const x = LD.byKey(EXTRAS, k);
      if (!x) return;
      if (x.tipo === 'grau') porGrau += x.custo; else fixo += x.custo;
    });
    porGrau -= (p.falhas || []).filter((k) => LD.byKey(FALHAS, k)).length;
    porGrau = Math.max(1, porGrau);
    const variacoes = (p.variacoes || []).filter((v) => v && (v.nome || v.efeito)).length;
    return { porGrau, fixo, variacoes, total: porGrau * g + fixo + variacoes };
  }

  // Grau de uma Perícia, já com os Traços que dão grau de graça.
  function grau(f, key) {
    let g = num((f.pericias || {})[key]);
    if (key === 'pontaria' && hasTraco(f, 'treino_militar')) g += 1;
    return clamp(g, 0, 6);
  }
  // Teto do grau: 3 na criação (Treinados 4), +1 na Classe 1,7 e na 2,7.
  function tetoPericia(f) {
    const n = degrau(f);
    return (f.origem === 'treinado' ? 4 : 3) + (n >= MARCOS.grau5 ? 1 : 0) + (n >= MARCOS.grau6 ? 1 : 0);
  }

  function temPoder(f, keys) { return (f.poderes || []).some((p) => keys.includes(p.base)); }

  // Itens do inventário que contam agora (equipados).
  function itensEquipados(f) {
    return (f.inventario || []).filter((i) => i.equipado).map((i) => Object.assign({}, LD.store ? (LD.store.get('itens', i.itemId) || {}) : {}, i));
  }

  function combinarProtecoes(lista) {
    const v = lista.filter((x) => x > 0).sort((a, b) => b - a);
    if (!v.length) return 0;
    return v[0] + Math.floor((v[1] || 0) / 2);
  }

  /* ---------- Dinheiro (US$) ----------
   * O saldo é derivado: inicial + créditos (salário, mestragem) − gastos.
   * Antes da aprovação, o inicial segue as escolhas da ficha; na aprovação, a mestragem o congela. */
  const DINHEIRO_PARTIDA = [
    { key: 0, nome: 'Sem nada', valor: 50 }, { key: 1, nome: 'Apertado', valor: 500 }, { key: 2, nome: 'Com emprego', valor: 1500 }
  ];
  const SALARIOS = [
    { key: 0, nome: 'Sem renda' }, { key: 150, nome: 'Bico (US$ 150/semana)' }, { key: 400, nome: 'Emprego comum (US$ 400/semana)' },
    { key: 900, nome: 'Bom emprego (US$ 900/semana)' }, { key: 2500, nome: 'Rico (US$ 2.500/semana)' }
  ];
  function dinheiroInicial(f) {
    if (f.aprovada && f.inicialFixo != null) return num(f.inicialFixo);
    if (hasTraco(f, 'sem_lugar')) return 0;
    let v = (DINHEIRO_PARTIDA.find((x) => x.key === num(f.recursos, 1)) || DINHEIRO_PARTIDA[1]).valor;
    if (f.recursosOpcao === 'familia_rica') v = Math.max(v, 10000);
    if (f.recursosOpcao === 'lendarios') v = Math.max(v, 50000);
    if (hasTraco(f, 'rico')) v += 15000;
    return v;
  }
  function dinheiro(f) { return dinheiroInicial(f) + num(f.creditos) - num(f.gastoTotal); }
  function salarioDe(f) { return hasTraco(f, 'sem_lugar') ? 0 : num(f.salario); }
  const fmtUS = (v) => 'US$ ' + Math.round(num(v)).toLocaleString('pt-BR');
  function semanaAtual(d) {
    d = d || new Date();
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dia = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dia);
    const ini = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return `${t.getUTCFullYear()}-W${String(Math.ceil(((t - ini) / 86400000 + 1) / 7)).padStart(2, '0')}`;
  }

  /* ---------- Treinamento ---------- */
  const TREINO_CENA_MIN = 1000;
  const TREINO_INTERVALO = 12 * 3600 * 1000;
  const INTENSIDADES = [
    { key: 'leve', nome: 'Leve', cd: 10, marcas: 1, risco: 'Nenhum. Falhar não machuca.' },
    { key: 'duro', nome: 'Duro', cd: 15, marcas: 2, risco: 'Lesão num 1 natural.' },
    { key: 'extremo', nome: 'Extremo', cd: 20, marcas: 3, risco: '+1 de Fadiga sempre. Lesão num 1 natural ou se falhar por 5 ou mais.' }
  ];
  const LESOES = [
    null,
    { key: 'distensao', nome: 'Distensão', txt: '−2 nos treinos desta área até um descanso longo.' },
    { key: 'distensao', nome: 'Distensão', txt: '−2 nos treinos desta área até um descanso longo.' },
    { key: 'esgotamento', nome: 'Esgotamento', txt: '+1 de Fadiga.' },
    { key: 'esgotamento', nome: 'Esgotamento', txt: '+1 de Fadiga.' },
    { key: 'pancada', nome: 'Pancada feia', txt: 'Perde 2d6 PV.' },
    { key: 'seria', nome: 'Lesão séria', txt: 'Não pode treinar por 3 dias.' }
  ];
  const TUDO = '*';
  const LUGARES_TREINO = [
    { key: '', nome: 'Outro lugar da cidade', areas: [] },
    { key: 'sala_treino', nome: 'Sala de Treino (Observatório)', areas: [TUDO] },
    { key: 'simulacao', nome: 'Sala de Simulação (Observatório)', areas: [TUDO] },
    { key: 'oficina', nome: 'A Oficina (Observatório)', areas: ['tecnologia', 'conhecimento', 'computacao'] },
    { key: 'biblioteca', nome: 'A Biblioteca (Observatório)', areas: ['ocultismo', 'investigacao', 'conhecimento', 'magia'] },
    { key: 'santuario', nome: 'O Santuário (Observatório)', areas: ['poder', 'dominio', 'concentracao', 'coragem', 'magia', 'intuicao'] },
    { key: 'enfermaria', nome: 'Enfermaria (Observatório)', areas: ['medicina'] },
    { key: 'trilha', nome: 'Trilha do Monte Vigia', areas: ['atletismo', 'corrida', 'sobrevivencia', 'aclimatacao', 'rastreio', 'acrobacia', 'folego'] },
    { key: 'academia', nome: 'Academia do Porto (Vésper)', areas: ['luta', 'guarda', 'atletismo', 'intimidacao', 'agarrar', 'malandragem'] },
    { key: 'clinica', nome: 'Clínica de Rua (Vésper)', areas: ['medicina'] },
    { key: 'quartel', nome: 'Quartel dos Registrados (Lúmen)', areas: [TUDO] },
    { key: 'patio', nome: 'Pátio de Armas (Hespéria)', areas: [TUDO] },
    { key: 'forja', nome: 'Forja dos Vigias (Hespéria)', areas: ['pesadas', 'laminas', 'arremesso', 'guarda', 'tecnologia'] }
  ];
  // Áreas: as 31 Perícias, mais Poder e Magia.
  function areasTreino() {
    return PERICIAS.map((p) => ({ key: p.key, nome: p.nome, attr: p.attr, pericia: p.key, destino: p.nome }))
      .concat([
        { key: 'poder', nome: 'Poder', attr: 'VON', pericia: 'dominio', destino: 'Domínio do Poder ou Concentração' },
        { key: 'magia', nome: 'Magia', attr: 'INT', pericia: 'ocultismo', destino: 'Ocultismo (Arcanos: ou 1 PP de magia a cada 2 PT)' }
      ]);
  }
  const vale = (lista, area) => lista.includes(TUDO) || lista.includes(area);
  function treinoDe(f) {
    const t = f.treino || {};
    return {
      marcas: t.marcas || {}, ptArea: t.ptArea || {}, ptGanho: num(t.ptGanho), trocas: num(t.trocas), porNivel: t.porNivel || {},
      n: num(t.n), em: num(t.em), semana: t.semana || '', naSemana: num(t.naSemana), distensao: t.distensao || [], bloqueadoAte: num(t.bloqueadoAte), log: t.log || []
    };
  }
  function limiteTreinos(f) { return f.origem === 'treinado' ? 4 : 3; }
  function tetoPTTreino(f) { return f.origem === 'treinado' ? 5 : 3; }
  // Pode treinar agora? Devolve {ok, motivo, naSemana, limite}
  function podeTreinar(f, agora) {
    agora = agora || Date.now();
    const t = treinoDe(f); const sem = semanaAtual(new Date(agora));
    const naSemana = t.semana === sem ? t.naSemana : 0; const limite = limiteTreinos(f);
    if (t.bloqueadoAte > agora) return { ok: false, motivo: `Lesão séria: volta a treinar em ${new Date(t.bloqueadoAte).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}.`, naSemana, limite };
    if (naSemana >= limite) return { ok: false, motivo: `Já fez os ${limite} treinos desta semana. A semana vira na segunda-feira.`, naSemana, limite };
    if (t.em && agora - t.em < TREINO_INTERVALO) return { ok: false, motivo: `Próximo treino às ${new Date(t.em + TREINO_INTERVALO).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} (12 horas entre treinos).`, naSemana, limite };
    return { ok: true, naSemana, limite };
  }
  // Bônus da rolagem de treino (sem Fadiga/Sussurro, que a ficha aplica).
  function bonusTreino(f, areaKey, lugarKey) {
    const a = areasTreino().find((x) => x.key === areaKey); if (!a) return null;
    const A = atributos(f); const g = grau(f, a.pericia);
    const lugar = LUGARES_TREINO.find((x) => x.key === (lugarKey || '')) || LUGARES_TREINO[0];
    const bLugar = vale(lugar.areas, areaKey) || vale(lugar.areas, a.pericia) ? 2 : 0;
    const dist = treinoDe(f).distensao.includes(areaKey) ? -2 : 0;
    return { area: a, attr: A[a.attr], grau: g, pericia: g, lugar: bLugar, distensao: dist, total: A[a.attr] + g + bLugar + dist };
  }
  // Aplica um treino já rolado à ficha x (muta). r = {area, intensidade, lugar, cena, natural, total}
  function aplicarTreino(x, r, agora) {
    agora = agora || Date.now();
    const t = treinoDe(x); const it = INTENSIDADES.find((i) => i.key === r.intensidade);
    const passou = r.total >= it.cd || r.natural === 20;
    let marcas = passou ? it.marcas + (r.natural === 20 ? 1 : 0) : 0;
    const sem = semanaAtual(new Date(agora));
    t.naSemana = (t.semana === sem ? t.naSemana : 0) + 1; t.semana = sem; t.em = agora; t.n += 1;
    t.marcas[r.area] = num(t.marcas[r.area]) + marcas;
    // Marcas viram PT: 5 por PT, até o teto do nível (as outras ficam guardadas).
    const nivel = String(degrau(x)); const teto = tetoPTTreino(x);
    let novosPT = 0;
    Object.keys(t.marcas).forEach((k) => {
      while (t.marcas[k] >= 5 && num(t.porNivel[nivel]) < teto && novosPT < 3) {
        t.marcas[k] -= 5; t.porNivel[nivel] = num(t.porNivel[nivel]) + 1; t.ptArea[k] = num(t.ptArea[k]) + 1; t.ptGanho += 1; novosPT += 1;
      }
    });
    // Custos e Lesões
    const m = x.medidores || {};
    let fadiga = 0; let lesao = null; let pvPerdido = 0;
    if (r.intensidade === 'extremo') fadiga += 1;
    const temRisco = (r.intensidade === 'duro' && r.natural === 1) || (r.intensidade === 'extremo' && (r.natural === 1 || (!passou && it.cd - r.total >= 5)));
    if (temRisco) {
      const d6 = r.d6 || (1 + Math.floor(Math.random() * 6)); lesao = Object.assign({ d6 }, LESOES[d6]);
      if (lesao.key === 'distensao' && !t.distensao.includes(r.area)) t.distensao.push(r.area);
      if (lesao.key === 'esgotamento') fadiga += 1;
      if (lesao.key === 'pancada') { pvPerdido = r.pancada || ((1 + Math.floor(Math.random() * 6)) + (1 + Math.floor(Math.random() * 6))); }
      if (lesao.key === 'seria') t.bloqueadoAte = agora + 3 * 86400000;
    }
    if (m && fadiga) m.fadiga = clamp(num(m.fadiga) + fadiga, 0, 3);
    if (m && pvPerdido) m.pv = num(m.pv) - pvPerdido;
    const entrada = { quando: agora, area: r.area, intensidade: r.intensidade, lugar: r.lugar || '', natural: r.natural, dados: r.dados || [r.natural], total: r.total, cd: it.cd, passou, marcas, novosPT, fadiga, lesao: lesao ? `${lesao.nome} (1d6: ${lesao.d6})${pvPerdido ? `: −${pvPerdido} PV` : ''}` : '', cena: String(r.cena || '').slice(0, 4000) };
    t.log = t.log.concat(entrada).slice(-20);
    x.treino = t;
    return entrada;
  }

  function recursos(f) {
    if (hasTraco(f, 'sem_lugar')) return 0;
    let r = num(f.recursos, 1);
    if (f.recursosOpcao === 'familia_rica') r = Math.max(r, 3);
    if (f.recursosOpcao === 'lendarios') r = Math.max(r, 4);
    if (hasTraco(f, 'rico')) r += 2;
    r += num(f.recursosMod, 0);
    return clamp(r, 0, 5);
  }

  function hasTraco(f, key) { return (f.qualidades || []).includes(key) || (f.defeitos || []).includes(key); }

  // Tudo o que a ficha calcula, num objeto só.
  function calc(f) {
    const pot = potencial(f);
    const cls = classe(f);
    const nivel = degrau(f);
    const A = atributos(f);
    const treinado = f.origem === 'treinado';
    const origem = LD.byKey(ORIGENS, f.origem);
    const G = (k) => grau(f, k);
    const pericia = (k) => G(k);
    const equip = itensEquipados(f);

    // Proteção
    const fontesProt = [];
    const detalheProt = [];
    (f.poderes || []).forEach((p) => {
      const b = LD.byKey(PODERES, p.base);
      if (b && b.protecao && !b.sustentado && (!b.modos || (p.modo || 'protecao') === 'protecao')) {
        const v = b.protecao(num(p.grau, 1), cls);
        fontesProt.push(v); detalheProt.push(`${p.nome || b.nome} ${v}`);
      }
    });
    if (origem && origem.protecaoFonte) { const v = Math.round(cls * origem.protecaoFonte); fontesProt.push(v); detalheProt.push(`Fonte ${v}`); }
    equip.forEach((i) => { if (num(i.protecao) > 0) { fontesProt.push(num(i.protecao)); detalheProt.push(`${i.nome} ${num(i.protecao)}`); } });
    const tetoProt = x5(cls) + 5;
    const protecao = Math.min(combinarProtecoes(fontesProt), tetoProt);

    // Defesa
    const profDef = G('esquiva');
    let bonusDef = 0;
    equip.forEach((i) => { bonusDef += num(i.defesa); });
    (f.poderes || []).forEach((p) => { if (p.base === 'defesa' && p.modo === 'defesa') bonusDef += Math.ceil(num(p.grau, 1) / 2); });
    const defesa = 10 + A.AGI + profDef + bonusDef;

    // PV
    let pvMax = 20 + A.VIG * 5 + nivel * 3 + 3 * G('resiliencia');
    if (hasTraco(f, 'duro_de_matar')) pvMax += 5;
    if (hasTraco(f, 'fragil')) pvMax -= 5;
    pvMax += num(f.bonusPV, 0);

    // Energia: o fôlego dos poderes. Vem do Vigor (corpo) ou, para Arcanos, da Vontade.
    const energiaAttr = f.origem === 'arcano' ? 'VON' : 'VIG';
    const energiaMax = 3 + A[energiaAttr] + [MARCOS.grau5, MARCOS.grau6, MARCOS.grau7].filter((n) => nivel >= n).length + Math.floor(G(energiaAttr === 'VON' ? 'concentracao' : 'folego') / 2);
    const alinh = f.alinhamento || 'heroi';
    const recursoNome = alinh === 'vilao' ? 'Ambição' : alinh === 'anti_heroi' ? 'Rancor' : 'Determinação';
    const detMax = recursoNome === 'Determinação' ? 3 + (pot.det || 0) + num((f.bonus || {}).det) : 2 + num((f.bonus || {}).det);

    let iniciativa = A.AGI + G('percepcao');
    (f.poderes || []).forEach((p) => { const b = LD.byKey(PODERES, p.base); if (b && b.iniciativa) iniciativa += b.iniciativa(num(p.grau, 1)); });
    if (hasTraco(f, 'reflexos_gato')) iniciativa += 2;

    let deslocamento = 10 + (hasTraco(f, 'corredor') ? 5 : 0) + 2 * G('corrida');
    const percepcaoPassiva = 10 + A.VON + pericia('percepcao') - (hasTraco(f, 'distraido') ? 3 : 0);

    // Potência
    const potPoder = x5(cls);
    const temForca = temPoder(f, ['forca']);
    const potGolpe = temForca ? x5(cls) : (treinado || A.FOR >= 6) ? 5 : 0;

    // Pontos
    const porNivel = treinado ? 4 : 2;
    const fe = f.feNoDestino && pot.rolou ? FE_NO_DESTINO : 0;
    const defeitosPT = Math.min(MAX_PT_DEFEITOS, (f.defeitos || []).slice(0, MAX_DEFEITOS).reduce((s, k) => s + ((LD.byKey(DEFEITOS, k) || {}).custo || 0), 0));
    const ptTotal = 10 + pot.pt + fe + porNivel * (nivel - 1) + num((f.bonus || {}).pt) + num(f.ptTreino) + treinoDe(f).ptGanho - 2 * treinoDe(f).trocas + defeitosPT;
    const ptPericias = Object.values(f.pericias || {}).reduce((s, g) => s + clamp(num(g), 0, 6), 0);
    const ptEstilos = 0;
    const ptQualidades = (f.qualidades || []).reduce((s, k) => s + ((LD.byKey(QUALIDADES, k) || {}).custo || 0), 0);
    const ptOpcao = f.recursosOpcao === 'familia_rica' ? 2 : f.recursosOpcao === 'lendarios' ? 6 : 0;
    const ptGastos = ptPericias + ptEstilos + ptQualidades + ptOpcao;
    const ppTotal = (treinado ? num((f.bonus || {}).pp) : pot.pp + 2 * (nivel - 1) + num((f.bonus || {}).pp)) + treinoDe(f).trocas;
    const ppGastos = (f.poderes || []).reduce((s, p) => s + custoPoder(p).total, 0);

    const profAtaque = 0;
    const profEnergetico = G('dominio');

    const c = {
      pot, classe: cls, classeDegrau: classeDoDegrau(f), rotuloClasse: rotuloClasse(f), nivel, degrau: nivel, A, protecao, tetoProt, detalheProt, defesa, profDef, bonusDef, pvMax, energiaMax, energiaAttr, detMax, recursoNome,
      resistencia: A.VIG + protecao, potPoder, potGolpe, iniciativa, deslocamento, percepcaoPassiva,
      reflexos: A.AGI + pericia('acrobacia'), fortitude: A.VIG + pericia('resiliencia'), mente: A.VON + pericia('concentracao'),
      esquivar: A.AGI + pericia('esquiva'), brecha: A.INT + pericia('tatica'), kitCura: `2d6+${pericia('medicina')}`, folego: (A.VIG + 1 + G('folego')) * (hasTraco(f, 'mergulhador') ? 2 : 1), bloquear: A.FOR + pericia('guarda'),
      carga: CARGA_MOCHILA, tetoPericia: tetoPericia(f), G, teto: 5 + Math.floor(cls), ptTotal, ptGastos, ptLivres: ptTotal - ptGastos, ptPericias, ptEstilos, ptQualidades, ptOpcao, defeitosPT, fe,
      ppTotal, ppGastos, ppLivres: ppTotal - ppGastos, grauMax: grauMaximo(f), profAtaque, profEnergetico,
      recursos: recursos(f), dinheiro: dinheiro(f), dinheiroInicial: dinheiroInicial(f), equip, pericia
    };
    c.avisos = avisos(f, c);
    return c;
  }

  // Bônus de ataque e dano de um poder, para a ficha e a calculadora.
  function ataquePoder(f, p, c) {
    c = c || calc(f);
    const b = LD.byKey(PODERES, p.base) || {};
    const attr = p.attr || (b.attrs && b.attrs[0]) || 'VON';
    const g = num(p.grau, 1);
    const profi = Math.max(c.profEnergetico, Math.ceil(g / 2));
    const preciso = (p.extras || []).includes('preciso') ? 2 : 0;
    const bonus = c.A[attr] + profi + preciso;
    const danoFixo = c.A[attr] + c.potPoder;
    return { attr, bonus, dados: `${g}d6`, danoFixo, expr: `${g}d6+${danoFixo}`, cd: 10 + g, penetrante: (p.extras || []).includes('penetrante') };
  }

  // Quantos d6 tem um texto ("2d6" -> 2).
  const d6 = (t) => { const m = String(t || '').match(/(\d+)d6/); return m ? +m[1] : 0; };

  // Todos os ataques da ficha: desarmado, armas em uso e poderes de ataque.
  function ataques(f, c) {
    c = c || calc(f);
    const out = [];
    const extra = (g) => Math.floor(g / 2);
    const armas = (f.inventario || []).filter((i) => i.equipado && i.cat === 'arma')
      .map((i) => Object.assign({}, LD.store ? (LD.store.get('itens', i.itemId) || {}) : {}, i));
    armas.forEach((w) => {
      const p = LD.byKey(PERICIAS, w.pericia) || LD.byKey(PERICIAS, 'luta');
      const g = c.G(p.key);
      const attr = p.attr;
      let dados, pot;
      if (p.key === 'pontaria' || (p.key === 'arremesso' && w.dadosBase)) { dados = (d6(w.dadosBase) || 1) + extra(g); pot = num(w.potencia); }
      else { dados = 1 + extra(g) + d6(w.dadosExtra); pot = Math.max(num(w.potencia), c.potGolpe); }
      const danoFixo = c.A[attr] + pot + num(w.bonusFixo);
      out.push({ nome: w.nome, sub: `${p.nome} ${g}`, attr, bonus: c.A[attr] + g, dados: `${dados}d6`, danoFixo, expr: `${dados}d6+${danoFixo}` });
    });
    const gL = c.G('luta');
    if (!armas.some((w) => (w.pericia || 'luta') === 'luta') && (gL || !armas.length)) {
      const dados = 1 + extra(gL);
      const danoFixo = c.A.FOR + c.potGolpe;
      out.unshift({ nome: 'Desarmado', sub: `Luta ${gL}`, attr: 'FOR', bonus: c.A.FOR + gL, dados: `${dados}d6`, danoFixo, expr: `${dados}d6+${danoFixo}` });
    }
    (f.poderes || []).forEach((p) => {
      const b = LD.byKey(PODERES, p.base);
      if (b && b.tipo === 'ataque') out.push(Object.assign({ nome: p.nome || b.nome, sub: `Grau ${p.grau}` }, ataquePoder(f, p, c)));
    });
    return out;
  }

  function avisos(f, c) {
    const out = [];
    const origem = LD.byKey(ORIGENS, f.origem);
    if (!origem) out.push({ passo: 'origem', msg: 'Escolha uma Origem.' });
    if (origem && origem.rola && c.pot.pendente) out.push({ passo: 'potencial', msg: 'Anote o resultado do !egide-potencial.' });
    // Atributos
    const pts = f.atributos || {};
    const soma = ATRIBUTOS.reduce((s, a) => s + num(pts[a.key]), 0);
    const cap = tetoAtributo(f);
    if (soma !== PONTOS_DE_ATRIBUTO) out.push({ passo: 'atributos', msg: `Distribua exatamente ${PONTOS_DE_ATRIBUTO} pontos de Atributo (agora: ${soma}).` });
    ATRIBUTOS.forEach((a) => { if (1 + num(pts[a.key]) > cap) out.push({ passo: 'atributos', msg: `${a.nome} passa de ${cap} antes do bônus da Origem.` }); });
    if (origem && origem.bonus.escolha && (f.origemBonus || []).length < origem.bonus.escolha) out.push({ passo: 'atributos', msg: 'Escolha o bônus de Atributo da Origem.' });
    const aumPermitidos = [4, 8].filter((n) => c.nivel >= n).length;
    if ((f.aumentos || []).length > aumPermitidos) out.push({ passo: 'atributos', msg: `Aumentos de Atributo demais para o nível (${aumPermitidos} permitidos).` });
    // Pontos
    if (c.ptLivres < 0) out.push({ passo: 'treino', msg: `PT gastos a mais: ${-c.ptLivres}.` });
    if (c.ppLivres < 0) out.push({ passo: 'poderes', msg: `PP gastos a mais: ${-c.ppLivres}.` });
    // Poderes
    (f.poderes || []).forEach((p) => {
      const b = LD.byKey(PODERES, p.base);
      const nm = p.nome || (b && b.nome) || 'Poder';
      if (num(p.grau) > c.grauMax) out.push({ passo: 'poderes', msg: `${nm}: Grau ${p.grau} passa do máximo (${c.grauMax}).` });
      if (b && b.cosmico && num(p.grau) > 2) out.push({ passo: 'poderes', msg: `${nm}: Cósmico só até Grau 2 para jogadores.` });
      if (b && b.cosmico) out.push({ passo: 'poderes', msg: `${nm}: Cósmico precisa da aprovação da mestragem.`, leve: true });
      if (b && b.key === 'controle_mental') out.push({ passo: 'poderes', msg: `${nm}: Controle Mental pede um Preço narrativo.`, leve: true });
      if ((p.extras || []).includes('mistico') && !['mitico', 'arcano'].includes(f.origem)) out.push({ passo: 'poderes', msg: `${nm}: o Extra Místico é só de Míticos e Arcanos.` });
      (p.variacoes || []).forEach((v) => { if (num(v.grau) > num(p.grau)) out.push({ passo: 'poderes', msg: `${nm}: a Variação "${v.nome || '?'}" tem Grau maior que o poder.` }); });
    });
    // Perícias acima do teto
    Object.entries(f.pericias || {}).forEach(([k, g]) => {
      const p = LD.byKey(PERICIAS, k);
      if (p && num(g) > c.tetoPericia) out.push({ passo: 'treino', msg: `${p.nome} passa do grau máximo (${c.tetoPericia}).` });
    });
    if (c.ptLivres > 0) out.push({ passo: 'treino', msg: `Sobram ${c.ptLivres} PT para gastar.`, leve: true });
    if (c.ppLivres > 0) out.push({ passo: 'poderes', msg: `Sobram ${c.ppLivres} PP para gastar.`, leve: true });
    // Traços
    if ((f.defeitos || []).length > MAX_DEFEITOS) out.push({ passo: 'tracos', msg: `No máximo ${MAX_DEFEITOS} Defeitos.` });
    (f.qualidades || []).forEach((k) => { const q = LD.byKey(QUALIDADES, k); if (q && q.origem && q.origem !== f.origem) out.push({ passo: 'tracos', msg: `${q.nome} é só para ${(LD.byKey(ORIGENS, q.origem) || {}).nome}.` }); });
    // Fraquezas (Regra do Preço)
    const fr = fraquezasDe(f);
    if (!fr.length) out.push({ passo: 'tracos', msg: 'Falta a Fraqueza.' });
    const grav = (x) => x.gravidade || ((LD.byKey(FRAQUEZAS, x.key) || {}).gravidade) || 'leve';
    const temGrave = fr.some((x) => grav(x) === 'grave');
    const temSeria = fr.some((x) => ['seria', 'grave'].includes(grav(x)));
    if ((Math.floor(c.classe) >= 4 || c.pot.nome === 'Supernova' || f.origem === 'visitante') && !temGrave) out.push({ passo: 'tracos', msg: 'Classe 4, Supernova e Visitantes pedem uma Fraqueza grave.' });
    else if (Math.floor(c.classe) === 3 && !temSeria) out.push({ passo: 'tracos', msg: 'Classe 3 pede uma Fraqueza séria (Regra do Preço).' });
    if (c.pot.nome === 'Incêndio' && fr.length < 2) out.push({ passo: 'tracos', msg: 'Incêndio traz uma segunda Fraqueza.' });
    if (!f.arquetipo) out.push({ passo: 'conceito', msg: 'Escolha um Arquétipo.' });
    if (f.origem === 'arcano' && !f.tradicao) out.push({ passo: 'poderes', msg: 'Arcanos escolhem uma Tradição.' });
    return out;
  }

  // Feitiço do Grimório: Extras sobem o Grau (CD e Energia), Falhas descem (mínimo 1).
  function feitico(f, ft, c) {
    c = c || calc(f);
    const g = clamp(Math.floor(num(ft.grau, 1)), 1, 8);
    const final = Math.max(1, g + (ft.extras || []).length - (ft.falhas || []).length);
    const trad = LD.byKey(TRADICOES, f.tradicao) || { attr: 'INT', pericia: 'ocultismo', key: '' };
    const escola = (f.poderes || []).find((p) => p.id === ft.escolaId) || null;
    let bonus = c.A[trad.attr] + c.pericia(trad.pericia) + (ft.componente ? 2 : 0);
    if (trad.key === 'fe' && escola && ['escola_vida', 'escola_protecao'].includes(escola.base)) bonus += 2;
    const custo = trad.key === 'sangue' ? `${final * 3} PV` : `${final} Energia`;
    return { grau: g, final, cd: 10 + final * 2 + (ft.novo ? 2 : 0), bonus, custo, escola, attr: trad.attr, livre: final <= (trad.key === 'dom' ? 2 : 1) };
  }

  // Os comandos do bot que deixam a ficha de jogo igual à do site.
  function comandosBot(f) {
    const A = atributos(f);
    const c = calc(f);
    const linhas = [`!egide-atributos ${ATRIBUTOS.map((a) => `${a.key} ${A[a.key]}`).join(' ')}`];
    PERICIAS.forEach((p) => { const g = num((f.pericias || {})[p.key]); if (g) linhas.push(`!egide-pericia ${p.nome} ${g}`); });
    if (c.protecao) linhas.push(`!egide-protecao ${c.protecao}`);
    return linhas;
  }

  // Rolagens
  function d(n) { return 1 + Math.floor(Math.random() * n); }
  function rolarD20(modo) {
    const a = d(20), b = d(20);
    if (modo === 'vantagem') return { valor: Math.max(a, b), dados: [a, b] };
    if (modo === 'desvantagem') return { valor: Math.min(a, b), dados: [a, b] };
    return { valor: a, dados: [a] };
  }
  // "3d6+5" -> {total, dados}
  function rolarExpr(expr, critico) {
    const m = String(expr || '').replace(/\s/g, '').match(/^(\d+)d(\d+)([+-]\d+)?$/i);
    if (!m) return null;
    const n = +m[1], lados = +m[2], mod = m[3] ? +m[3] : 0;
    const dados = Array.from({ length: n }, () => d(lados));
    let total = dados.reduce((s, x) => s + x, 0) + mod;
    if (critico) total += n * lados;
    return { total, dados, mod, critico: !!critico };
  }

  LD.ATRIBUTOS = ATRIBUTOS; LD.ESCALA_ATRIBUTO = ESCALA_ATRIBUTO; LD.ESCALA_CLASSE = ESCALA_CLASSE; LD.ESCALA_HUMANA = ESCALA_HUMANA; LD.PONTOS_DE_ATRIBUTO = PONTOS_DE_ATRIBUTO;
  LD.PERICIAS = PERICIAS; LD.GRAUS_PERICIA = GRAUS_PERICIA; LD.CUSTO_PERICIA = CUSTO_PERICIA;
  LD.FAIXAS = FAIXAS; LD.FE_NO_DESTINO = FE_NO_DESTINO; LD.ORIGENS = ORIGENS; LD.ARQUETIPOS = ARQUETIPOS;
  LD.FRAQUEZAS = FRAQUEZAS; LD.PERICIAS_ANTIGAS = PERICIAS_ANTIGAS; LD.CARGA_MOCHILA = CARGA_MOCHILA; LD.GRAVIDADES = GRAVIDADES; LD.QUALIDADES = QUALIDADES; LD.DEFEITOS = DEFEITOS;
  LD.MAX_DEFEITOS = MAX_DEFEITOS; LD.MAX_PT_DEFEITOS = MAX_PT_DEFEITOS;
  LD.ESTILOS_PODER = ESTILOS_PODER; LD.GRAUS = GRAUS; LD.PODERES = PODERES; LD.GRUPOS_PODER = GRUPOS_PODER;
  LD.EXTRAS = EXTRAS; LD.FALHAS = FALHAS; LD.TRADICOES = TRADICOES; LD.PRECOS_MAGIA = PRECOS_MAGIA;
  LD.CONDICOES = CONDICOES; LD.RECURSOS = RECURSOS; LD.CDS = CDS; LD.FADIGA = FADIGA; LD.KITS = KITS; LD.KITS_PADRAO = KITS_PADRAO;
  LD.INTENSIDADES = INTENSIDADES; LD.LUGARES_TREINO = LUGARES_TREINO; LD.TREINO_CENA_MIN = TREINO_CENA_MIN;
  LD.DEGRAUS_CLASSE = DEGRAUS_CLASSE;
  LD.DINHEIRO_PARTIDA = DINHEIRO_PARTIDA; LD.SALARIOS = SALARIOS;
  LD.DEGRAUS_CLASSE = DEGRAUS_CLASSE; LD.MARCOS = MARCOS;
  LD.rules = { salarioDe, fraquezasDe, marcasPericias, degrau, classeDoDegrau, rotuloClasse, areasTreino, treinoDe, podeTreinar, bonusTreino, aplicarTreino, tetoPTTreino, valeTreino: vale, dinheiro, dinheiroInicial, fmtUS, semanaAtual, fmtClasse, slug, clamp, num, faixaDe, resultadoAjustado, potencial, classe, atributos, grauMaximo, custoPoder, calc, tetoAtributo, escalaAtributo, ataquePoder, ataques, grau, tetoPericia, comandosBot, feitico, rolarD20, rolarExpr, recursos, hasTraco, combinarProtecoes };
})();
