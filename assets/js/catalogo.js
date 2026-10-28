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
    I('martelo', 'arma', 'Martelo ou machado grande', 2, { preco: 250, pericia: 'luta', dadosExtra: '1d6', dano: 'Luta + 1d6', potencia: 4, propriedades: 'Duas mãos. +1 de Quebra por acerto.' }),
    I('arco', 'arma', 'Arco ou facas de arremesso', 2, { preco: 400, pericia: 'pontaria', dadosBase: '2d6', dano: '2d6', potencia: 3, propriedades: 'Silencioso. Alcance 50 m.' }),
    I('pistola', 'arma', 'Pistola', 2, { preco: 600, pericia: 'pontaria', dadosBase: '2d6', dano: '2d6', potencia: 5, propriedades: 'Alcance 30 m. Barulho: todos na quadra ouvem.' }),
    I('escopeta', 'arma', 'Escopeta', 3, { preco: 1200, pericia: 'pontaria', dadosBase: '3d6', dano: '3d6, cone 6 m', potencia: 6, propriedades: 'Metade do dano além de 10 m.' }),
    I('fuzil', 'arma', 'Fuzil', 3, { preco: 3000, pericia: 'pontaria', dadosBase: '3d6', dano: '3d6', potencia: 8, propriedades: 'Alcance 200 m. Usado em público: +1 no Relógio do Registro.' }),
    I('explosivos', 'arma', 'Explosivos', 4, { preco: 5000, pericia: 'pontaria', dadosBase: '4d6', dano: '4d6, área 5 m', potencia: 10, propriedades: 'Estrago +1. Reflexos para metade.', cargas: 1 }),
    I('choque', 'arma', 'Arma de choque', 2, { preco: 350, pericia: 'pontaria', dadosBase: '2d6', dano: '2d6 Elétrico', potencia: 3, propriedades: 'Fortitude CD 14 ou Desligado (tecnologia) / Atordoado (pessoas).', observatorio: true }),
    I('bumerangue', 'arma', 'Bumerangue ou disco', 1, { preco: 100, pericia: 'pontaria', dadosBase: '1d6', dano: '1d6', potencia: 2, propriedades: 'Arremesso que volta. Pode levar uma granada.' }),
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
    I('fumaca', 'gadget', 'Granada de fumaça', 2, { preco: 60, cargas: 1, propriedades: 'Área de 5 m: ataques à distância através dela com Desvantagem.', observatorio: true }),
    I('luz', 'gadget', 'Granada de luz', 2, { preco: 80, cargas: 1, propriedades: 'Área de 3 m: Fortitude CD 14 ou Atordoado. Sombras ficam Lentas.', observatorio: true }),
    I('gude', 'gadget', 'Bolas de gude e óleo', 1, { preco: 15, cargas: 1, propriedades: 'Área de 3 m: Reflexos CD 13 ou Derrubado.', observatorio: true }),
    I('comunicador', 'gadget', 'Comunicador', 2, { preco: 300, propriedades: 'O grupo fala a até 10 km. Sem carga.', observatorio: true }),
    I('visor', 'gadget', 'Visor noturno', 2, { preco: 700, propriedades: 'Enxerga no escuro (não na escuridão do Eclipse). Sem carga.', observatorio: true }),
    I('rastreador', 'gadget', 'Rastreador', 3, { preco: 500, cargas: 1, propriedades: 'Preso no alvo (ataque com −5): o grupo sabe onde ele está por uma semana.', observatorio: true }),
    I('escuta', 'gadget', 'Escuta', 2, { preco: 250, cargas: 1, propriedades: 'Grava uma sala por uma noite. Plantar: AGI + Furtividade.', observatorio: true }),
    I('arrombamento', 'gadget', 'Kit de arrombamento', 2, { preco: 200, propriedades: 'Vantagem para abrir fechaduras e cofres mecânicos. Sem carga.' }),
    I('interferidor', 'gadget', 'Interferidor', 3, { preco: 1500, cargas: 1, propriedades: '20 m sem rádio, celular nem câmera por um minuto. Drones Vigias caem.', observatorio: true }),
    I('algemas', 'gadget', 'Algemas reforçadas', 2, { preco: 350, cargas: 1, propriedades: 'Seguram até Classe 1.', observatorio: true }),
    I('paraquedas', 'gadget', 'Paraquedas compacto', 2, { preco: 600, cargas: 1, propriedades: 'Uma queda sem dano.', observatorio: true }),
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
    { key: 'especial', nome: 'Especiais' }
  ];
  LD.seed = { itens };
})();
