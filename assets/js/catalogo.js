/*
 * Égide · catálogo inicial do Arsenal (Equipamento e Itens, Perseguições, Recursos e Vida Civil).
 * "preco" é o preço em dólares (US$).
 * "observatorio": a Nova Égide pega de graça no Arsenal do Observatório.
 * "especial": só a mestragem dá (não aparece à venda).
 * Os ids são fixos: carregar de novo não duplica.
 */
(function () {
  const LD = (window.LD = window.LD || {});
  const I = (id, cat, nome, recursos, extra) => Object.assign({ id: 'it_' + id, cat, nome, recursos, observatorio: false, especial: false, descricao: '' }, extra);

  const itens = [
    // Armas
    I('faca', 'arma', 'Faca, porrete ou soco-inglês', 1, { preco: 40, pericia: 'laminas', bonusFixo: 1, dano: 'Lâminas + 1', potencia: 2, propriedades: 'Escondível.' }),
    I('espada', 'arma', 'Espada, lança ou bastão', 2, { preco: 300, pericia: 'laminas', dadosExtra: '1d6', dano: 'Lâminas + 1d6', potencia: 3, propriedades: 'Lança: alcance 3 m. Bastão: não letal.' }),
    I('martelo', 'arma', 'Martelo ou machado grande', 2, { preco: 250, pericia: 'pesadas', dadosExtra: '1d6', dano: 'Armas Pesadas + 1d6', potencia: 4, propriedades: 'Duas mãos. +1 de Quebra por acerto.' }),
    I('arco', 'arma', 'Arco ou besta', 2, { preco: 400, pericia: 'pontaria', dadosBase: '2d6', dano: '2d6', potencia: 3, propriedades: 'Silencioso. Alcance 50 m.' }),
    I('pistola', 'arma', 'Pistola', 2, { preco: 600, pericia: 'pontaria', dadosBase: '2d6', dano: '2d6', potencia: 5, propriedades: 'Alcance 30 m. Barulho: todos na quadra ouvem.' }),
    I('escopeta', 'arma', 'Escopeta', 3, { preco: 1200, pericia: 'pontaria', dadosBase: '3d6', dano: '3d6, cone 6 m', potencia: 6, propriedades: 'Metade do dano além de 10 m.' }),
    I('fuzil', 'arma', 'Fuzil', 3, { preco: 3000, pericia: 'pontaria', dadosBase: '3d6', dano: '3d6', potencia: 8, propriedades: 'Alcance 200 m. Usado em público: +1 no Relógio do Registro.' }),
    I('explosivos', 'arma', 'Explosivos', 4, { preco: 5000, pericia: 'pontaria', dadosBase: '4d6', dano: '4d6, área 5 m', potencia: 10, propriedades: 'Estrago +1. Reflexos para metade.', cargas: 1 }),
    I('choque', 'arma', 'Arma de choque', 2, { preco: 350, pericia: 'pontaria', dadosBase: '2d6', dano: '2d6 Elétrico', potencia: 3, propriedades: 'Fortitude CD 14 ou Desligado (tecnologia) / Atordoado (pessoas).', observatorio: true }),
    I('bumerangue', 'arma', 'Bumerangue ou disco', 1, { preco: 100, pericia: 'arremesso', dadosBase: '1d6', dano: '1d6', potencia: 2, propriedades: 'Arremesso que volta. Pode levar uma granada.' }),
    // Proteção
    I('roupa', 'protecao', 'Roupa reforçada ou jaqueta de couro', 1, { preco: 150, protecao: 1, propriedades: 'Discreta.', observatorio: true }),
    I('colete', 'protecao', 'Colete à prova de balas', 2, { preco: 800, protecao: 3, propriedades: 'Por baixo da roupa. Rasga num crítico.', observatorio: true }),
    I('traje', 'protecao', 'Traje tático', 3, { preco: 3500, protecao: 4, defesa: -1, propriedades: '−2 em Furtividade e Acrobacia.', observatorio: true }),
    I('escudo_p', 'protecao', 'Escudo pequeno', 1, { preco: 120, defesa: 1, propriedades: 'Com Lança e Escudo: Bloquear anula o dano.' }),
    I('escudo_g', 'protecao', 'Escudo grande (de Vigia)', 3, { preco: 900, defesa: 2, propriedades: 'Pesado. Duas mãos para lançar.' }),
    // Kits (cargas extras)
    I('kit_cura', 'kit', 'Carga de Kit de Cura', 2, { preco: 200, kit: 'cura', propriedades: '2d6 + Medicina de quem usa em PV, e tira Sangramento. Clínica de Rua.' }),
    I('kit_energia', 'kit', 'Carga de Kit de Energia', 2, { preco: 400, kit: 'energia', propriedades: '+3 Energia. Ampola de luz da estrela.' }),
    I('kit_reerguer', 'kit', 'Carga de Kit de Reerguer', 2, { preco: 600, kit: 'reerguer', propriedades: 'Levanta um Nocauteado com metade do PV.' }),
    I('kit_contencao', 'kit', 'Kit de Contenção', 3, { preco: 2500, kit: 'contencao', propriedades: 'Algemas de supressão: um Desperto preso não usa poder de fragmento.' }),
    // Gadgets
    I('gancho', 'gadget', 'Gancho e cabo', 2, { preco: 250, propriedades: 'Sobe 30 m num Movimento. Balançar: AGI + Acrobacia, Fácil. Permanente.', observatorio: true }),
    I('fumaca', 'gadget', 'Granada de fumaça', 2, { preco: 60, cargas: 1, propriedades: 'Área de 5 m: ataques à distância através dela com Desvantagem.' }),
    I('luz', 'gadget', 'Granada de luz', 2, { preco: 80, cargas: 1, propriedades: 'Área de 3 m: Fortitude CD 14 ou Atordoado. Sombras ficam Lentas.' }),
    I('gude', 'gadget', 'Bolas de gude e óleo', 1, { preco: 15, cargas: 1, propriedades: 'Área de 3 m: Reflexos CD 13 ou Derrubado.' }),
    I('comunicador', 'gadget', 'Comunicador', 2, { preco: 300, propriedades: 'O grupo fala a até 10 km. Sem carga.', observatorio: true }),
    I('visor', 'gadget', 'Visor noturno', 2, { preco: 700, propriedades: 'Enxerga no escuro (não na escuridão do Eclipse). Sem carga.', observatorio: true }),
    I('rastreador', 'gadget', 'Rastreador', 3, { preco: 500, cargas: 1, propriedades: 'Preso no alvo (ataque com −5): o grupo sabe onde ele está por uma semana.' }),
    I('escuta', 'gadget', 'Escuta', 2, { preco: 250, cargas: 1, propriedades: 'Grava uma sala por uma noite. Plantar: AGI + Furtividade.' }),
    I('arrombamento', 'gadget', 'Kit de arrombamento', 2, { preco: 200, propriedades: 'Vantagem para abrir fechaduras e cofres mecânicos. Sem carga.' }),
    I('interferidor', 'gadget', 'Interferidor', 3, { preco: 1500, cargas: 1, propriedades: '20 m sem rádio, celular nem câmera por um minuto. Drones Vigias caem.' }),
    I('algemas', 'gadget', 'Algemas reforçadas', 2, { preco: 350, cargas: 1, propriedades: 'Seguram até Classe 1.' }),
    I('paraquedas', 'gadget', 'Paraquedas compacto', 2, { preco: 600, cargas: 1, propriedades: 'Uma queda sem dano.' }),
    // Veículos
    I('moto', 'veiculo', 'Moto', 2, { preco: 4000, propriedades: 'Defesa 13 · PV 25 · Resistência 5 · Rápido. +2 em Acelerar no trânsito.' }),
    I('carro', 'veiculo', 'Carro comum', 3, { preco: 18000, propriedades: 'Defesa 10 · PV 50 · Resistência 8 · Médio. Cinco lugares.' }),
    I('van', 'veiculo', 'Van ou caminhão', 3, { preco: 30000, propriedades: 'Defesa 8 · PV 80 · Resistência 10 · Lento. Bloqueia uma rua.' }),
    I('lancha', 'veiculo', 'Lancha', 4, { preco: 45000, propriedades: 'Defesa 12 · PV 40 · Resistência 6 · Rápido. Vantagem para despistar na neblina.' }),
    I('blindado', 'veiculo', 'Carro blindado', 5, { preco: 150000, propriedades: 'Defesa 9 · PV 90 · Resistência 15 · Médio. Ignora tiros de pistola.' }),
    // Serviços
    I('informacao', 'servico', 'Informação no Bar Sem Nome', 1, { preco: 50, propriedades: 'Uma resposta de quem sabe das ruas.' }),
    I('lancha_cais', 'servico', 'Lancha no Cais da Névoa', 2, { preco: 300, propriedades: 'Uma travessia sem perguntas.' }),
    I('meridiano', 'servico', 'Uma noite no Hotel Meridiano', 3, { preco: 250, propriedades: 'Quarto, discrição e o porteiro que ouve tudo.' }),
    I('suborno', 'servico', 'Suborno pesado', 4, { preco: 2000, propriedades: 'Um guarda, um fiscal, um policial que olha para o outro lado.' }),
    // ===== Novos (50) =====
    // Armas
    I('canivete', 'arma', 'Canivete automático', 1, { preco: 25, pericia: 'laminas', bonusFixo: 1, dano: 'Lâminas + 1', potencia: 1, propriedades: 'Escondível. Abre com uma mão.' }),
    I('taco', 'arma', 'Taco de beisebol', 1, { preco: 60, pericia: 'pesadas', dadosExtra: '1d6', dano: 'Armas Pesadas + 1d6', potencia: 2, propriedades: 'Não letal, se quiser.' }),
    I('corrente', 'arma', 'Corrente de moto', 1, { preco: 45, pericia: 'pesadas', dadosExtra: '1d6', dano: 'Armas Pesadas + 1d6', potencia: 2, propriedades: 'Alcance 2 m. Agarrar ou Desarmar à distância.' }),
    I('katana', 'arma', 'Katana', 3, { preco: 1500, pericia: 'laminas', dadosExtra: '1d6', dano: 'Lâminas + 1d6', potencia: 4, propriedades: 'Crítico no 19 ou 20.' }),
    I('bastao_choque', 'arma', 'Bastão de choque', 2, { preco: 450, pericia: 'pesadas', dadosExtra: '1d6', dano: 'Armas Pesadas + 1d6 Elétrico', potencia: 3, propriedades: 'Tecnologia atingida: Fortitude CD 13 ou Desligada.' }),
    I('machadinha', 'arma', 'Machadinha de arremesso', 1, { preco: 80, pericia: 'arremesso', dadosBase: '1d6', dano: '1d6', potencia: 3, propriedades: 'Corpo a corpo ou arremesso (10 m).' }),
    I('facas_arremesso', 'arma', 'Facas de arremesso (6)', 1, { preco: 120, pericia: 'arremesso', dadosBase: '1d6', dano: '1d6', potencia: 2, cargas: 6, propriedades: 'Seis facas. Uma carga por arremesso; recolha depois da luta.' }),
    I('granada_frag', 'arma', 'Granada de fragmentação', 3, { preco: 300, pericia: 'arremesso', dadosBase: '3d6', dano: '3d6, área 5 m', potencia: 6, cargas: 1, propriedades: 'Reflexos para metade. Estrago +1.' }),
    I('molotov', 'arma', 'Coquetel molotov', 1, { preco: 20, pericia: 'arremesso', dadosBase: '2d6', dano: '2d6 Fogo, área 3 m', potencia: 3, cargas: 1, propriedades: 'Queimadura. Estrago +1.' }),
    I('revolver', 'arma', 'Revólver', 2, { preco: 500, pericia: 'pontaria', dadosBase: '2d6', dano: '2d6', potencia: 5, propriedades: 'Alcance 30 m. Não trava.' }),
    I('smg', 'arma', 'Submetralhadora', 3, { preco: 2500, pericia: 'pontaria', dadosBase: '2d6', dano: '2d6, rajada', potencia: 5, propriedades: 'Rajada: área de 3 m, −2 no acerto. Usada em público: +1 no Relógio do Registro.' }),
    I('rifle_precisao', 'arma', 'Rifle de precisão', 4, { preco: 6000, pericia: 'pontaria', dadosBase: '3d6', dano: '3d6', potencia: 9, propriedades: 'Alcance 800 m. Mirar tem 2 de penalidade a menos. Precisa de apoio.' }),
    I('besta_pesada', 'arma', 'Besta pesada', 2, { preco: 900, pericia: 'pontaria', dadosBase: '3d6', dano: '3d6', potencia: 6, propriedades: 'Silenciosa. Recarregar gasta a Ação.' }),
    I('taser', 'arma', 'Taser de mão', 1, { preco: 150, pericia: 'pontaria', dadosBase: '1d6', dano: '1d6 Elétrico', potencia: 1, cargas: 3, propriedades: 'Alcance 5 m. Fortitude CD 12 ou Atordoado.' }),
    I('arpao', 'arma', 'Arma de arpão', 2, { preco: 700, pericia: 'pontaria', dadosBase: '2d6', dano: '2d6', potencia: 4, propriedades: 'Alcance 15 m. Acertou: puxa o alvo 5 m, ou o deixa Agarrado ao cabo.' }),
    // Proteção
    I('capacete', 'protecao', 'Capacete', 1, { preco: 90, protecao: 1, propriedades: 'Uma vez por combate, um crítico contra você vira acerto normal.', observatorio: true }),
    I('jaqueta_kevlar', 'protecao', 'Jaqueta de kevlar', 2, { preco: 1200, protecao: 2, propriedades: 'Parece uma jaqueta comum.' }),
    I('colete_pesado', 'protecao', 'Colete pesado (polícia)', 3, { preco: 2200, protecao: 4, defesa: -1, propriedades: 'Volumoso: todo mundo vê.' }),
    I('armadura_sucata', 'protecao', 'Armadura de sucata', 1, { preco: 400, protecao: 3, defesa: -2, propriedades: 'Feita nas Fundições. Barulhenta: −2 em Furtividade.' }),
    I('traje_termico', 'protecao', 'Traje térmico', 2, { preco: 600, protecao: 1, propriedades: 'Vantagem em Aclimatação contra frio e calor.' }),
    I('mascara_gas', 'protecao', 'Máscara de gás', 1, { preco: 150, propriedades: 'Imune a gás, fumaça e esporos enquanto usar.', observatorio: true }),
    I('escudo_balistico', 'protecao', 'Escudo balístico', 3, { preco: 1800, defesa: 2, propriedades: 'Parado atrás dele: cobertura de três quartos contra tiros.' }),
    // Gadgets
    I('lanterna', 'gadget', 'Lanterna tática', 1, { preco: 120, propriedades: 'Ação Rápida: um alvo a 10 m ataca com Desvantagem no próximo turno. Sombras recuam.', observatorio: true }),
    I('binoculo', 'gadget', 'Binóculo', 1, { preco: 150, propriedades: 'Vantagem em Percepção a mais de 100 m.', observatorio: true }),
    I('corda', 'gadget', 'Corda e mosquetões', 1, { preco: 60, propriedades: '30 m. Escalar com Vantagem.', observatorio: true }),
    I('caixa_ferramentas', 'gadget', 'Caixa de ferramentas', 1, { preco: 180, propriedades: 'Vantagem em Tecnologia para consertar.', observatorio: true }),
    I('kit_disfarce', 'gadget', 'Kit de disfarce', 2, { preco: 250, propriedades: 'Vantagem em Disfarce. Dez minutos para montar.' }),
    I('notebook', 'gadget', 'Notebook de invasão', 3, { preco: 2000, propriedades: 'Vantagem em Computação. Rastreável se usado na rede do DAME.' }),
    I('drone', 'gadget', 'Drone com câmera', 3, { preco: 1800, propriedades: 'Voa 500 m e mostra o que vê. Defesa 14, cai com qualquer acerto.' }),
    I('detector', 'gadget', 'Detector de fragmento', 4, { preco: 3000, propriedades: 'Apita perto de um Desperto ou de um fragmento (20 m).' }),
    I('clonador', 'gadget', 'Clonador de cartão', 2, { preco: 400, cargas: 3, propriedades: 'Abre uma porta com crachá ou uma conta, uma vez por carga.' }),
    I('spray_pimenta', 'gadget', 'Spray de pimenta', 1, { preco: 30, cargas: 3, propriedades: 'Alcance 3 m. Fortitude CD 12 ou Cego por 1 turno.' }),
    I('granada_cola', 'gadget', 'Granada de cola', 2, { preco: 250, cargas: 1, propriedades: 'Área de 3 m: Reflexos CD 14 ou Agarrado (sai com FOR + Força Bruta, CD 14).' }),
    I('pulso_em', 'gadget', 'Bomba de pulso eletromagnético', 4, { preco: 4000, cargas: 1, propriedades: '30 m: todo eletrônico Desligado por um minuto, inclusive o seu.' }),
    I('adrenalina', 'gadget', 'Injeção de adrenalina', 2, { preco: 350, cargas: 1, propriedades: 'Ação Rápida: tira 1 de Fadiga agora. No fim da cena, +1 de Fadiga.' }),
    I('fita_reparo', 'gadget', 'Fita de reparo rápido', 1, { preco: 40, cargas: 2, propriedades: 'Um equipamento quebrado volta a funcionar até o fim da cena.' }),
    // Medicina (com carga)
    I('bandagens', 'kit', 'Bandagens', 1, { preco: 20, cargas: 3, propriedades: 'Tira Sangramento. Sem teste.' }),
    I('sutura', 'kit', 'Kit de sutura', 1, { preco: 90, cargas: 2, propriedades: 'Fora de combate: cura 1d6 + Medicina em PV.' }),
    I('antidoto', 'kit', 'Antídoto', 2, { preco: 150, cargas: 1, propriedades: 'Encerra um veneno ou uma doença comum.' }),
    // Veículos
    I('bicicleta', 'veiculo', 'Bicicleta', 1, { preco: 300, propriedades: 'Defesa 14 · PV 10 · Resistência 2 · Médio. Passa onde carro não passa.' }),
    I('moto_esportiva', 'veiculo', 'Moto esportiva', 3, { preco: 12000, propriedades: 'Defesa 14 · PV 25 · Resistência 5 · Muito rápido. +2 em perseguições.' }),
    I('jetski', 'veiculo', 'Jet ski', 3, { preco: 12000, propriedades: 'Defesa 13 · PV 20 · Resistência 4 · Rápido. Baía e canais.' }),
    I('ambulancia', 'veiculo', 'Ambulância usada', 3, { preco: 25000, propriedades: 'Defesa 9 · PV 60 · Resistência 8 · Médio. A sirene abre caminho. Uma maca.' }),
    // Serviços
    I('medico_rua', 'servico', 'Médico sem perguntas', 2, { preco: 500, propriedades: 'Cura todos os PV de um herói durante a noite, sem registro.' }),
    I('documentos', 'servico', 'Documentos falsos', 3, { preco: 3000, propriedades: 'Uma identidade nova que aguenta uma checagem comum.' }),
    I('advogado', 'servico', 'Advogado', 3, { preco: 1500, propriedades: 'Tira alguém da delegacia em uma noite (não do DAME).' }),
    I('esconderijo', 'servico', 'Esconderijo por uma semana', 2, { preco: 400, propriedades: 'Um quarto que ninguém conhece.' }),
    I('conserto', 'servico', 'Conserto de equipamento', 1, { preco: 300, propriedades: 'Um item quebrado volta novo em um dia.' }),
    I('informante', 'servico', 'Informante no DAME', 4, { preco: 1000, propriedades: 'Uma resposta sobre um registro ou uma operação do DAME.' }),
    // ===== +18 (só aparece para quem liga "Mostrar itens +18" na Loja) =====
    I('vinho', 'adulto', 'Garrafa de vinho', 1, { preco: 40, cargas: 1, propriedades: 'Uma noite boa. Quem bebe a garrafa sozinho fica Cansado (Fadiga 1) até dormir.' }),
    I('champanhe', 'adulto', 'Champanhe importado', 2, { preco: 250, cargas: 1, propriedades: 'Abre portas na Avenida das Nações: Vantagem em Persuasão numa festa.' }),
    I('whisky', 'adulto', 'Whisky envelhecido', 2, { preco: 180, cargas: 3, propriedades: 'Três doses. Uma dose: +1 em Coragem até o fim da cena, −1 em Percepção.' }),
    I('cigarros', 'adulto', 'Maço de cigarros', 1, { preco: 12, cargas: 10, propriedades: 'Puxa conversa em qualquer esquina de Vésper.' }),
    I('charutos', 'adulto', 'Caixa de charutos', 2, { preco: 150, cargas: 10, propriedades: 'O presente certo para um chefão do porto.' }),
    I('fichas_cassino', 'adulto', 'Fichas do Cassino Lua Nova', 2, { preco: 500, propriedades: 'Entrada e US$ 500 em fichas. Sorte: role 1d20; 15+ dobra, 5 ou menos perde tudo.' }),
    I('clube_privado', 'adulto', 'Entrada num clube privado', 3, { preco: 800, propriedades: 'Uma noite num clube discreto da Avenida das Nações. Ninguém pergunta, ninguém conta.' }),
    I('motel', 'adulto', 'Noite no motel', 1, { preco: 90, propriedades: 'Um quarto por uma noite, sem nome no registro.' }),
    I('suite', 'adulto', 'Suíte temática', 2, { preco: 350, propriedades: 'Hidromassagem, espelhos e serviço de quarto. Uma noite.' }),
    I('preservativos', 'adulto', 'Preservativos', 1, { preco: 10, cargas: 6, propriedades: 'Seis unidades.' }),
    I('lubrificante', 'adulto', 'Lubrificante', 1, { preco: 15, cargas: 5, propriedades: 'Cinco usos.' }),
    I('oleo_massagem', 'adulto', 'Óleo de massagem', 1, { preco: 35, cargas: 4, propriedades: 'Aroma de baunilha ou sândalo.' }),
    I('velas', 'adulto', 'Velas aromáticas', 1, { preco: 30, cargas: 3, propriedades: 'Para o clima. Uma noite cada.' }),
    I('lingerie', 'adulto', 'Lingerie', 1, { preco: 120, propriedades: 'Renda, seda ou couro, à escolha.' }),
    I('fantasia', 'adulto', 'Fantasia', 1, { preco: 150, propriedades: 'Enfermeira, policial, super-herói (genérico)… Não engana ninguém de verdade.' }),
    I('venda', 'adulto', 'Venda de cetim', 1, { preco: 25, propriedades: 'Para os olhos.' }),
    I('algemas_pelucia', 'adulto', 'Algemas de pelúcia', 1, { preco: 40, propriedades: 'Seguram quem quer ser segurado. Abrem com um puxão (não servem para prender ninguém).' }),
    I('chicote', 'adulto', 'Chicote de couro', 1, { preco: 70, propriedades: 'De brinquedo: não serve como arma.' }),
    I('vibrador', 'adulto', 'Vibrador', 1, { preco: 90, propriedades: 'Discreto, recarregável.' }),
    I('kit_casal', 'adulto', 'Kit para casal', 2, { preco: 200, propriedades: 'Uma caixa-surpresa com um pouco de tudo desta seção.' }),
    I('ensaio', 'adulto', 'Ensaio fotográfico sensual', 2, { preco: 400, propriedades: 'Um estúdio discreto em Lúmen. As fotos são suas, e só suas.' }),
    // Especiais (só a mestragem dá)
    I('bronze', 'arma', 'Arma de bronze celeste', 5, { especial: true, pericia: 'laminas', dadosExtra: '1d6', dano: 'Lâminas + 1d6', potencia: 8, propriedades: 'Místico (+5 de Potência, Brecha contra o sobrenatural). Exige o Juramento dos Vigias ou permissão de Tália.' }),
    I('pedra_vidro', 'especial', 'Pedra de vidro', 5, { especial: true, cargas: 1, propriedades: '+1 Grau num poder de Fonte, uma vez. Depois vira pó.' }),
    I('fragmento', 'especial', 'Fragmento solto', 5, { especial: true, cargas: 1, propriedades: 'Um Desperto que o segura recupera toda a Energia. Um não Desperto ouve vozes.' }),
    I('manto', 'especial', 'Manto de Penumbra', 5, { especial: true, propriedades: 'Uma vez por combate: invisível por 1 turno, e o próximo ataque é com Vantagem e em Brecha.' }),
    I('escudo_talia', 'especial', 'Escudo de Tália', 5, { especial: true, defesa: 2, propriedades: '+2 de Defesa; uma vez por combate, um golpe em Brecha vira golpe normal.' }),
    I('selo', 'especial', 'Selo do Limiar', 5, { especial: true, cargas: 1, propriedades: 'Fecha uma fenda entre mundos por um minuto.' }),
    I('luva', 'especial', 'Luva de Prisma', 5, { especial: true, propriedades: 'Rouba 1 Energia de um inimigo a cada ataque de alvo único que acertar.' })
  ];

  LD.CATEGORIAS = [
    { key: 'arma', nome: 'Armas' }, { key: 'protecao', nome: 'Proteção' }, { key: 'kit', nome: 'Kits' },
    { key: 'gadget', nome: 'Gadgets' }, { key: 'veiculo', nome: 'Veículos' }, { key: 'servico', nome: 'Serviços' },
    { key: 'especial', nome: 'Especiais' }, { key: 'adulto', nome: '+18' }
  ];
  LD.seed = { itens };
})();
