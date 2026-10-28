/*
 * Égide · Poderes prontos
 * Os poderes clássicos dos quadrinhos, prontos para pôr na ficha. Cada um usa um efeito do catálogo
 * (que dá o custo e as contas) e diz, em números concretos, o que cada Grau faz.
 * Aprimorar = subir o Grau (custa o PP por Grau do poder). A Classe continua sendo o teto da escala.
 */
(function () {
  const LD = (window.LD = window.LD || {});

  // [key, nome, efeito base, atributo, grupo, descrição, [o que faz no Grau 1 … 8], extras padrão]
  const P = (key, nome, base, attr, grupo, desc, graus, extras) => ({ key, nome, base, attr, grupo, desc, graus, extras: extras || [] });

  const PRONTOS = [
    // ---------------- Movimento ----------------
    P('voo', 'Voo', 'voo', 'AGI', 'Movimento', 'Voa pelos céus de Aldória.', [
      'Voa a 30 km/h, até 50 m de altura.', 'Voa a 80 km/h (um carro na avenida).', 'Voa a 150 km/h e carrega uma pessoa.',
      'Voa a 300 km/h (um trem-bala).', 'Voa a 900 km/h (um avião a jato).', 'Voa a 2.500 km/h (Mach 2).',
      'Voa a 12.000 km/h (Mach 10) e aguenta a estratosfera.', 'Chega à órbita.']),
    P('supervelocidade', 'Supervelocidade', 'velocidade', 'AGI', 'Movimento', 'Corre mais rápido que qualquer coisa viva.', [
      'Corre a 60 km/h. +1 na Iniciativa.', 'Corre a 120 km/h. +2 na Iniciativa.', 'Corre a 300 km/h. Uma ação extra por rodada só para mover, Resgatar ou Ajudar.',
      'Corre a 700 km/h. Corre sobre a água.', 'Corre a 1.200 km/h (Mach 1). Duas ações extras de movimento.', 'Corre a 3.500 km/h. Sobe paredes de prédios correndo.',
      'Corre a 12.000 km/h. Atravessa Aldória num piscar de olhos.', 'Mais rápido que o pensamento: o mundo parece parado.']),
    P('teletransporte', 'Teletransporte', 'teleporte', 'VON', 'Movimento', 'Some de um lugar e aparece em outro.', [
      'Salta até 10 m, para onde vê.', 'Salta até 50 m.', 'Salta até 200 m, mesmo sem ver (lugar que conhece).',
      'Salta até 1 km e leva uma pessoa.', 'Salta até 10 km e leva até 3 pessoas.', 'Salta entre cidades (100 km).',
      'Salta 1.000 km e leva um grupo.', 'Vai a qualquer lugar do planeta que conheça.']),
    P('escalada', 'Escalada', 'movimento', 'AGI', 'Movimento', 'Gruda em paredes e tetos.', [
      'Anda em paredes devagar.', 'Anda em paredes e tetos na velocidade normal.', 'Corre em paredes e tetos; não cai nem atordoado.',
      'Gruda em vidro molhado e metal liso; segura um carro pendurado.', 'Gruda em qualquer superfície, até na água.', 'Pode grudar outros na parede.',
      'Gruda em superfícies no ar (fumaça, chuva).', 'Gruda no que quiser, quando quiser.']),
    P('salto', 'Super-salto', 'movimento', 'FOR', 'Movimento', 'Pula prédios num único impulso.', [
      'Salta 10 m.', 'Salta 30 m (um prédio de 5 andares).', 'Salta 100 m.', 'Salta 300 m (de um prédio a outro na avenida).',
      'Salta 1 km.', 'Salta 5 km.', 'Salta 20 km, de um lado da baía ao outro.', 'Salta 100 km.']),
    P('passo_sombras', 'Passo das Sombras', 'movimento', 'VON', 'Movimento', 'Entra numa sombra e sai em outra.', [
      'Entre sombras a 5 m.', 'Entre sombras a 20 m.', 'Entre sombras a 100 m, sem ver o destino.', 'Entre sombras a 500 m, levando alguém.',
      'Entre sombras a 2 km.', 'Qualquer sombra da cidade.', 'Sombras de outra cidade.', 'Qualquer sombra do mundo.']),
    P('intangibilidade', 'Intangibilidade', 'intangibilidade', 'VON', 'Movimento', 'Atravessa paredes e golpes.', [
      'Atravessa uma porta, prendendo a respiração.', 'Atravessa paredes; golpes físicos passam.', 'Atravessa prédios inteiros.',
      'Afunda no chão e volta.', 'Torna outra pessoa intangível pelo toque.', 'Fica intangível como Reação.',
      'Atravessa campos de força comuns.', 'Atravessa quase tudo, até energia comum.']),
    // ---------------- Corpo ----------------
    P('superforca', 'Super-força', 'forca', 'FOR', 'Corpo', 'Ergue carros, entorta aço, para trens.', [
      'Ergue 500 kg.', 'Ergue 1 t (um carro pequeno).', 'Ergue 5 t (um caminhão). +1d6 nos golpes.', 'Ergue 20 t (um ônibus cheio).',
      'Ergue 100 t (um avião). +2d6 nos golpes.', 'Ergue 1.000 t (um navio).', 'Ergue 10.000 t (um prédio). +3d6 nos golpes.', 'Ergue 100.000 t (uma montanha pequena).']),
    P('superresistencia', 'Super-resistência', 'invulnerabilidade', 'VIG', 'Corpo', 'Balas ricocheteiam na pele.', [
      'Proteção 5: socos e facas quase não machucam.', 'Proteção 10: pistolas machucam pouco.', 'Proteção 15: aguenta fuzil.',
      'Proteção 20: aguenta explosivos.', 'Proteção 25: aguenta artilharia.', 'Proteção 30: aguenta um míssil.',
      'Proteção 35: aguenta a queda de um prédio.', 'Proteção 40: quase nada da Terra o arranha.']),
    P('regeneracao', 'Regeneração', 'regeneracao', 'VIG', 'Corpo', 'Feridas fecham sozinhas.', [
      'Recupera 2 PV por turno.', 'Recupera 4 PV por turno.', 'Recupera 6 PV por turno; ossos se fixam em uma hora.', 'Recupera 8 PV por turno; Cicatrizes somem em uma semana.',
      'Recupera 10 PV por turno; imune a doenças.', 'Recupera 12 PV por turno; membros crescem de novo.', 'Recupera 14 PV por turno; quase impossível de matar.', 'Recupera 16 PV por turno; volta até de cinzas.']),
    P('elasticidade', 'Elasticidade', 'elasticidade', 'AGI', 'Corpo', 'Estica, torce e molda o corpo.', [
      'Alcance de 2 m.', 'Alcance de 4 m; passa por grades.', 'Alcance de 6 m; vira uma rede ou um paraquedas.', 'Alcance de 8 m; amortece balas.',
      'Alcance de 10 m; envolve um carro.', 'Alcance de 12 m; vira uma ponte.', 'Alcance de 14 m.', 'Alcance de 16 m; molda-se em qualquer forma.']),
    P('tamanho', 'Mudar de Tamanho', 'crescer', 'FOR', 'Corpo', 'Cresce como um gigante ou encolhe como um inseto.', [
      'Cresce até 3 m (ou encolhe a 50 cm).', 'Cresce até 5 m (ou encolhe a 15 cm).', 'Cresce até 8 m (ou encolhe a 3 cm).', 'Cresce até 15 m (ou encolhe ao tamanho de uma formiga).',
      'Cresce até 30 m.', 'Cresce até 60 m (ou encolhe a um grão de areia).', 'Cresce até 120 m.', 'Do tamanho de um arranha-céu, ou microscópico.']),
    P('garras', 'Garras e Presas', 'armas_naturais', 'FOR', 'Corpo', 'Garras, espinhos ou presas que cortam aço.', [
      '+1d6 nos golpes.', '+2d6 nos golpes.', '+3d6; corta madeira e portas.', '+4d6; corta aço.', '+5d6; corta blindagem.', '+6d6.', '+7d6.', '+8d6; corta quase tudo.']),
    P('adaptacao', 'Adaptação', 'adaptacao', 'VIG', 'Corpo', 'Sobrevive onde ninguém sobrevive.', [
      'Ignora um ambiente (frio, calor, fome…).', 'Ignora dois.', 'Ignora três, incluindo respirar debaixo da água.', 'Ignora quatro, incluindo veneno.',
      'Ignora cinco, incluindo radiação.', 'Ignora seis, incluindo pressão do fundo do mar.', 'Ignora sete, incluindo o vácuo.', 'Ignora todos.']),
    P('atributo', 'Atributo Sobre-humano', 'atributo', 'FOR', 'Corpo', 'Um Atributo além do limite humano.', [
      '+1 num Atributo.', '+2.', '+3.', '+4.', '+5.', '+6.', '+7.', '+8 (máximo 12).']),
    P('metamorfose', 'Metamorfose', 'metamorfose', 'VIG', 'Corpo', 'Muda de forma e de rosto.', [
      'Muda detalhes do rosto e da voz.', 'Vira qualquer pessoa.', 'Vira animais.', 'Formas monstruosas, com garras ou asas.',
      'Formas com poderes (Grau 2) da forma copiada.', 'Copia objetos simples.', 'Formas gigantes.', 'Qualquer forma imaginável.']),
    // ---------------- Energia e elementos ----------------
    P('rajada', 'Rajada de Energia', 'rajada', 'VON', 'Energia', 'Raios de luz, força ou energia pura.', [
      '1d6 a 5 m.', '2d6 a 20 m.', '3d6 a 50 m.', '4d6 a 100 m.', '5d6 a 500 m.', '6d6 até onde vê.', '7d6 até o horizonte.', '8d6 até o horizonte.']),
    P('fogo', 'Pirocinese', 'elemento', 'VON', 'Energia', 'Cria e controla o fogo.', [
      'Acende e apaga chamas; 1d6 de Fogo.', '2d6 de Fogo; muralha de fogo de 3 m.', '3d6; controla um incêndio de uma sala.', '4d6; derrete metal.',
      '5d6; controla o incêndio de um prédio.', '6d6; tempestade de fogo de 50 m.', '7d6; derrete aço em segundos.', '8d6; um quarteirão em chamas.']),
    P('gelo', 'Criocinese', 'elemento', 'VON', 'Energia', 'Gelo, frio e neve.', [
      'Congela um copo; 1d6 de Gelo.', '2d6; patina no gelo que cria.', '3d6; muralha de gelo de 5 m.', '4d6; congela um rio raso.',
      '5d6; congela uma rua inteira.', '6d6; nevasca de 50 m.', '7d6; congela a baía.', '8d6; inverno num quarteirão.']),
    P('eletricidade', 'Eletrocinese', 'elemento', 'VON', 'Energia', 'Raios e controle da eletricidade.', [
      'Choque de 1d6; liga aparelhos.', '2d6; apaga uma sala.', '3d6; Desliga um aparelho no alcance.', '4d6; apaga um prédio.',
      '5d6; raio que salta entre inimigos.', '6d6; apaga um bairro.', '7d6; chama um raio do céu.', '8d6; a rede elétrica da cidade.']),
    P('agua', 'Hidrocinese', 'elemento', 'VON', 'Energia', 'Molda e lança água.', [
      'Move um balde de água; 1d6.', '2d6; jato que derruba.', '3d6; anda sobre a água.', '4d6; ergue uma onda de 5 m.',
      '5d6; abre um caminho no mar.', '6d6; tromba d’água.', '7d6; uma onda que cobre o cais.', '8d6; um maremoto pequeno.']),
    P('vento', 'Aerocinese', 'elemento', 'VON', 'Energia', 'Vento, ar e tempestade.', [
      'Rajada que apaga velas; 1d6.', '2d6; derruba pessoas.', '3d6; plana no vento.', '4d6; vira um carro.',
      '5d6; furacão de 20 m.', '6d6; tornado.', '7d6; tempestade sobre a cidade.', '8d6; furacão de verdade.']),
    P('terra', 'Geocinese', 'elemento', 'VON', 'Energia', 'Pedra, terra e tremores.', [
      'Move uma pedra; 1d6.', '2d6; abre um buraco.', '3d6; muralha de pedra de 5 m.', '4d6; racha uma rua.',
      '5d6; ergue um pilar de 20 m.', '6d6; terremoto de 50 m.', '7d6; derruba um prédio.', '8d6; abre uma fenda na cidade.']),
    P('sonico', 'Grito Sônico', 'rajada', 'PRE', 'Energia', 'A voz quebra vidro, concreto e ossos.', [
      '1d6 em área; quebra vidro.', '2d6; ensurdece.', '3d6; racha paredes.', '4d6; derruba um muro.',
      '5d6; estoura janelas de um quarteirão.', '6d6; derruba um prédio.', '7d6.', '8d6.'], ['area']),
    P('campo', 'Campo de Força', 'campo_forca', 'VON', 'Energia', 'Uma bolha de energia sólida.', [
      'Proteção 5 em si.', 'Proteção 10; cobre um aliado.', 'Proteção 15; cobre um carro.', 'Proteção 20; cobre uma sala.',
      'Proteção 25; segura um prédio caindo.', 'Proteção 30; cobre um quarteirão.', 'Proteção 35.', 'Proteção 40.']),
    P('construtos', 'Construtos de Energia', 'construtos', 'VON', 'Energia', 'Cria objetos sólidos de energia.', [
      'Objetos pequenos (5 PV): uma corda, uma chave.', 'Do tamanho de uma pessoa (10 PV): uma escada, um escudo.', 'Do tamanho de um carro (15 PV): uma ponte curta, uma gaiola.', 'Do tamanho de um ônibus (20 PV).',
      'Do tamanho de uma casa (25 PV).', 'Do tamanho de um prédio (30 PV).', 'Um quarteirão (35 PV).', 'Qualquer coisa que imaginar (40 PV).']),
    P('absorcao', 'Absorção de Energia', 'absorcao', 'VIG', 'Energia', 'Bebe a energia que o atinge.', [
      'Absorve 3 de um tipo de dano por golpe.', 'Absorve 6.', 'Absorve 9 e ganha 1 Energia.', 'Absorve 12.',
      'Absorve 15 e devolve o golpe.', 'Absorve 18.', 'Absorve 21.', 'Absorve 24.']),
    // ---------------- Mente e sentidos ----------------
    P('sentidos', 'Sentidos Aguçados', 'sentidos', 'VON', 'Mente', 'Vê, ouve e fareja o que ninguém nota.', [
      'Um sentido aguçado, alcance de 50 m.', 'Dois sentidos, 200 m.', 'Três sentidos, 1 km; visão no escuro.', 'Quatro sentidos, 5 km; ouve batimentos.',
      'Cinco sentidos, 20 km; visão de raio X.', 'Seis sentidos, a cidade toda.', 'Sente o perigo antes de ele existir.', 'Percebe tudo num raio de 100 km.']),
    P('telepatia', 'Telepatia', 'telepatia', 'VON', 'Mente', 'Lê e fala com mentes.', [
      'Lê emoções pelo toque.', 'Lê pensamentos a 20 m.', 'Conversa mente a mente a 100 m.', 'Lê memórias a 1 km.',
      'Liga a mente do grupo pela cidade.', 'Alcança qualquer um que conheça no país.', 'Ouve a cidade inteira.', 'Qualquer mente do planeta.']),
    P('telecinese', 'Telecinese', 'telecinese', 'VON', 'Mente', 'Move coisas com a mente.', [
      'Move 10 kg.', 'Move 100 kg (uma pessoa).', 'Move 500 kg.', 'Move 2 t (um carro).',
      'Move 10 t (um caminhão).', 'Move 100 t.', 'Move 1.000 t (um navio).', 'Move 10.000 t.']),
    P('controle_mental', 'Controle Mental', 'controle_mental', 'VON', 'Mente', 'Dá ordens que a vítima obedece.', [
      'Uma ordem simples, a 5 m.', 'Ordens de uma frase, a 20 m.', 'Controla uma pessoa por 1 minuto.', 'Controla uma pessoa por uma cena.',
      'Controla um grupo pequeno.', 'Controla uma multidão.', 'Controla por um dia.', 'Controle permanente (com preço).']),
    P('ilusao', 'Ilusões', 'ilusao', 'PRE', 'Mente', 'Imagens e sons que não existem.', [
      'Uma imagem parada pequena.', 'Uma imagem com som, de uma pessoa.', 'Ilusões que se mexem numa sala.', 'Engana todos os sentidos de uma pessoa.',
      'Uma rua inteira.', 'Um quarteirão.', 'Ilusões que machucam quem acredita.', 'Um mundo falso.']),
    P('precognicao', 'Precognição', 'precognicao', 'VON', 'Mente', 'Vê um segundo do futuro.', [
      'Rerrola 1 d20 por sessão.', 'Rerrola 2.', 'Rerrola 3; nunca é surpreendido.', 'Rerrola 4.',
      'Rerrola 5; visões do dia seguinte.', 'Rerrola 6.', 'Rerrola 7; visões da semana.', 'Rerrola 8.']),
    P('invisibilidade', 'Invisibilidade', 'invisibilidade', 'AGI', 'Mente', 'Some da vista.', [
      'Fica invisível parado.', 'Fica invisível andando.', 'Correndo, e sem cheiro.', 'Sem som, e invisível a câmeras.',
      'Torna um aliado invisível.', 'Invisível a sensores e poderes de sentido.', 'Torna um carro invisível.', 'Torna um prédio invisível.']),
    // ---------------- Matéria e outros ----------------
    P('cura', 'Toque Curador', 'cura', 'PRE', 'Matéria', 'Fecha feridas com as mãos.', [
      'Cura 1d6 PV pelo toque.', 'Cura 2d6.', 'Cura 3d6; tira venenos.', 'Cura 4d6; a 20 m.',
      'Cura 5d6; tira uma Cicatriz.', 'Cura 6d6 em todos os aliados por perto.', 'Cura 7d6; recoloca membros.', 'Cura 8d6; quase traz de volta.']),
    P('duplicacao', 'Duplicação', 'duplicacao', 'VIG', 'Matéria', 'Cria cópias de si.', [
      '1 cópia.', '2 cópias.', '3 cópias.', '4 cópias; elas usam as Perícias dele.', '5 cópias.', '6 cópias.', '7 cópias.', '8 cópias, cada uma com um poder dele.']),
    P('animais', 'Falar com Animais', 'animais', 'PRE', 'Matéria', 'Conversa e comanda animais.', [
      'Entende um tipo de animal.', 'Conversa com todos os animais.', 'Pede favores a animais por perto.', 'Comanda um enxame (ataque em área).',
      'Comanda os animais de um bairro.', 'Vê pelos olhos de um animal.', 'Os animais da cidade.', 'Qualquer animal do continente.']),
    P('tecnopatia', 'Tecnopatia', 'controle_materia', 'INT', 'Matéria', 'Fala com máquinas e as controla.', [
      'Liga e desliga um aparelho pelo toque.', 'Controla um celular ou uma câmera.', 'Controla um carro ou um drone.', 'Controla os sistemas de um prédio.',
      'Controla uma frota de drones.', 'Controla a rede de um bairro.', 'Controla a rede da cidade.', 'Qualquer máquina do país.'], ['limitado']),
    P('drenar', 'Drenar Vida', 'drenar', 'VON', 'Matéria', 'O toque que rouba vida e força.', [
      'Rouba 1d6 PV pelo toque.', '2d6.', '3d6; rouba Energia.', '4d6; copia um poder por uma cena.',
      '5d6.', '6d6; a distância.', '7d6.', '8d6.']),
    P('sorte', 'Sorte', 'probabilidade', 'VON', 'Matéria', 'As coisas dão certo para ele, e errado para os outros.', [
      '1 Vantagem ou Desvantagem por cena.', '2 por cena.', '3 por cena.', '4 por cena.', '5 por cena.', '6 por cena.', '7 por cena.', '8 por cena.'])
  ];

  // O que o poder faz no Grau g (texto), e no próximo.
  function efeitoPronto(key, g) {
    const p = PRONTOS.find((x) => x.key === key);
    if (!p) return null;
    const i = Math.max(1, Math.min(8, Math.floor(g || 1)));
    return { agora: p.graus[i - 1], proximo: i < 8 ? p.graus[i] : null };
  }

  LD.PRONTOS = PRONTOS;
  LD.GRUPOS_PRONTOS = ['Movimento', 'Corpo', 'Energia', 'Mente', 'Matéria'];
  LD.efeitoPronto = efeitoPronto;
})();
