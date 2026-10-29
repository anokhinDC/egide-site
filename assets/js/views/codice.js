/*
 * Égide · Códice: as regras de mesa numa página. Abre sem login.
 */
(function () {
  const LD = window.LD;
  const { esc } = LD.ui;

  const tabela = (cab, linhas) => `<table class="tbl"><thead><tr>${cab.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${linhas.map((l) => `<tr>${l.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

  const SECOES = [
    ['teste', 'O teste', () => `
      <pre class="code">1d20 + Atributo + Perícia  ≥  CD</pre>
      ${tabela(['Dificuldade', 'CD', 'Exemplo'], [['Fácil', '10', 'Pular de um telhado para o vizinho.'], ['Médio', '15', 'Hackear uma câmera da Kael Dynamics.'], ['Difícil', '20', 'Atravessar a névoa de Hespéria.'], ['Heroico', '25', 'Algo que só a Tríade fez.'], ['Lendário', '30', 'Algo que não deveria ser possível.']])}
      <p><b>20 natural:</b> sucesso e algo a mais (em ataque, crítico). <b>1 natural:</b> falha e uma complicação. Empate é sucesso.</p>
      <p><b>Vantagem:</b> 2d20, fica o maior. <b>Desvantagem:</b> 2d20, fica o menor. Elas se cancelam e nunca se acumulam. <b>Ajuda:</b> um aliado que passa de CD 10 dá +2 (Vantagem com Vínculo 2+).</p>`],
    ['determinacao', 'Determinação', () => `
      <p>3 por sessão (Treinados 4; Faísca e Brasa +1). Um ponto para:</p>
      ${tabela(['Uso', 'Efeito'], [['Insistir', 'Rerrolar um d20 e ficar com o melhor.'], ['Superar', '+5 numa rolagem depois de ver o resultado.'], ['Aguentar', 'Ignorar uma condição até o fim do próximo turno.'], ['Achar a Brecha', 'O próximo ataque é em Brecha.'], ['Esforço Heroico', 'Agir uma Classe acima por uma ação. Depois, 2 de Fadiga. Uma vez por cena.'], ['Reagir ao impossível', 'Reagir a um Golpe Supremo.']])}`],
    ['combate', 'Combate', () => `
      <pre class="code">RODADA   Iniciativa 1d20 + AGI · 1 Ação + 1 Movimento + 1 Ação Rápida · 1 Reação por rodada
ATACAR   1d20 + atributo + Perícia (Luta, Lâminas, Pontaria ou Domínio do Poder)  ≥  Defesa
DANO     dados + atributo + Potência − Resistência do alvo   (Brecha: Resistência = só o VIG)
CRÍTICO  20 natural: dados no máximo + rola os dados de novo (+1 Energia)
REAÇÕES  Esquivar 1d20 + AGI + Esquiva ≥ ataque → errou
         Bloquear 1d20 + FOR + Guarda ≥ ataque → metade (escudo: nada)
         Aguentar: sem rolar, soma o VIG de novo e ignora a condição
ÁREA     AGI (ou VIG) contra a CD → metade. Proteção 5 ou menos: Evasão (nada)</pre>
      <p><b>Ataque de poder:</b> atributo do poder + Domínio do Poder (ou metade do Grau, o que for maior). <b>Ainda de Pé:</b> uma vez por cena, quem tem Proteção 5 ou menos e levaria de mais da metade dos PV direto a 0 fica com 1 PV.</p>
      ${tabela(['Cobertura', 'Efeito'], [['Meia (carro, mesa)', '+2 de Defesa e Reflexos'], ['Três quartos (pilastra, janela)', '+5'], ['Total (parede)', 'Não pode ser alvo direto']])}`],
    ['classes', 'Classes de Poder', () => `
      <p><b>A Classe é a progressão.</b> Todo herói começa na Classe 1 e sobe um degrau a cada marco da história (não existe nível). Potência = Classe × 5, arredondada. Treinados sobem os mesmos degraus como <b>Ápice</b>: ganham PT e Perícias, mas a força continua humana.</p>
      ${tabela(['Classe', 'O que ganha'], [['1', 'Criação.'], ['Todo degrau', '+2 PT, +2 PP (Treinados +4 PT), +3 PV.'], ['1,7', 'Grau máximo 5, Perícias até 4, +1 Energia.'], ['2', '+1 num Atributo.'], ['2,7', 'Grau máximo 6, Suprema, Perícias até 5, +1 Energia.'], ['3,3', '+1 num Atributo.'], ['3,7', 'Grau máximo 7, +1 Energia.'], ['4', 'O teto dos jogadores.']])}
      <p>Degraus: 1 → 1,3 → 1,7 → 2 → 2,3 → 2,7 → 3 → 3,3 → 3,7 → 4.</p>
      ${tabela(['Classe', 'Nome', 'Potência', 'Feito típico'], [['0', 'Civil', '0', 'Ferir uma pessoa.'], ['1', 'Ápice', '5', 'Derrubar dez capangas.'], ['2', 'Quarteirão', '10', 'Virar um caminhão.'], ['3', 'Cidade', '15', 'Derrubar um arranha-céu.'], ['4', 'Nação', '20', 'Erguer uma montanha.'], ['5', 'Planeta', '25', 'Mover um continente.']])}
      <p>Proteção: a maior, mais metade da segunda. Teto: Classe × 5 + 5. O teto dos jogadores é a Classe 4.</p>`],
    ['status', 'Valores derivados', () => tabela(['Valor', 'Fórmula'], [
      ['PV máximo', '20 + VIG × 5 + 3 por degrau de Classe'], ['Defesa', '10 + Esquiva + bônus'], ['Resistência', 'VIG + Proteção (mínimo Classe × 5)'], ['Potência', 'Classe × 5 em todo dano (Treinados 5; com arma, a maior)'],
      ['Iniciativa', '1d20 + AGI + Percepção'], ['Energia máxima', '3 + VIG (Arcanos: 3 + VON), +1 na Classe 1,7, 2,7 e 3,7'], ['Percepção passiva', '10 + VON + Percepção'], ['CD dos poderes', '10 + Grau'],
      ['Reflexos / Fortitude / Mente', 'AGI + Acrobacia / VIG + Resiliência / VON + Concentração'], ['Carga', '25 kg (a mochila, sempre)']])],
    ['energia', 'Energia', () => `${tabela(['Gasto', 'Custo'], [['Intensificar (+2d6 no dano)', '1 por uso, até 3'], ['Técnica', '2'], ['Façanha de Poder', '2'], ['Suprema', '5'], ['Sustentar', '1 por rodada'], ['Feitiço', 'o Grau']])}
      <p>Ganha-se: 2 no início de cada combate; +1 num crítico, numa Quebra, num Resgate; +2 ao trazer a Fraqueza; tudo num descanso de verdade.</p>`],
    ['medidores', 'Fadiga, Sussurro e descanso', () => `
      ${tabela(['Fadiga', 'Efeito'], LD.FADIGA.map((x, i) => [String(i), esc(x)]))}
      <p><b>Sussurro</b> (0 a 3): −1 em todas as rolagens por ponto. Com 3, Controlado.</p>
      ${tabela(['Como', 'Recupera'], [['Segundo Fôlego (uma vez por combate)', 'VIG + degrau de Classe em PV'], ['Descanso curto (uma hora)', '¼ do PV, Energia até a metade, −1 Fadiga'], ['Descanso longo (uma noite)', 'PV e Energia cheios, −1 Fadiga'], ['Em lugar seguro', 'E ainda Fadiga 0, −1 Sussurro, Kits reabastecidos'], ['Nova sessão', 'Determinação cheia']])}`],
    ['criacao', 'Criação em 11 passos', () => `<ol class="steps-ol">
      <li><b>Conceito:</b> uma frase, um nome de herói e um símbolo.</li><li><b>Origem:</b> Desperto, Mítico, Arcano, Engenhoso, Treinado ou Visitante.</li>
      <li><b>Potencial:</b> <code>!egide-potencial</code> (2d100, fica o maior). Treinados: Ápice; Engenhosos: Oficina.</li>
      <li><b>Atributos:</b> todos em 1, mais 12 pontos (máximo 5; Treinados 6), mais a Origem.</li><li><b>Arquétipo.</b></li>
      <li><b>Estilo de Poder e poderes</b> com os PP. Grau máximo 4 (5 com Incêndio e Supernova).</li>
      <li><b>Perícias e Traços</b> com os PT: 10 + Potencial (+2 de Fé no Destino). Cada grau de Perícia custa 1 PT.</li>
      <li><b>Fraqueza</b> (Regra do Preço).</li><li><b>Identidade secreta e vida civil.</b></li><li><b>A Perda</b>, em privado.</li><li><b>Valores derivados</b>: o site calcula.</li></ol>
      <p><a class="btn" href="#/fichas">Criar uma ficha</a></p>`],
    ['dinheiro', 'Dinheiro', () => `<p>O dinheiro da Égide é em <b>dólares (US$)</b> e fica no site. O saldo de cada herói = dinheiro inicial + salário e recompensas − compras.</p>
      ${tabela(['Começa com', 'Valor'], [['Sem nada', 'US$ 50'], ['Apertado (padrão)', 'US$ 500'], ['Com emprego', 'US$ 1.500'], ['Família rica (Treinado, 2 PT)', 'US$ 10.000'], ['Oficina lendária (Engenhoso, 6 PT)', 'US$ 50.000'], ['Traço Rico', '+US$ 15.000']])}
      <p>O salário (definido pela mestragem) cai uma vez por semana, no botão do Inventário. Recompensas e multas, a mestragem lança na ficha. <a href="#/arsenal">Arsenal</a></p>`],
    ['bot', 'No Discord', () => `<pre class="code">!egide-potencial                 a Rolagem de Potencial (2d100, fica o maior)
!egide-ficha-criar Nome          cria a ficha de jogo no bot
!egide-teste 7 Difícil vantagem  1d20 + 7 contra CD 20, com Vantagem
!egide-ataque 9 16 4d6+19 18     ataque +9 contra Defesa 16, dano menos Resistência 18
!egide-pv -12  !egide-energia -2  !egide-det -1  !egide-fadiga +1</pre>
      <p>Na ficha do site, o botão <b>Comandos do bot</b> gera os comandos que deixam a ficha do Discord igual à do site.</p>`]
  ];

  function render(main) {
    main.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">As regras numa página</div><h1>Códice</h1></div></div>
      <div class="codex">
        <nav class="codex-toc">${SECOES.map(([k, n]) => `<a href="#/codice" data-ir="${k}">${esc(n)}</a>`).join('')}</nav>
        <div>${SECOES.map(([k, n, fn]) => `<section id="cx-${k}"><h2>${esc(n)}</h2>${fn()}</section>`).join('')}</div>
      </div>`;
    main.querySelectorAll('[data-ir]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const s = document.getElementById('cx-' + a.dataset.ir); if (s) s.scrollIntoView({ behavior: 'smooth' }); }));
  }

  LD.views.codice = { titulo: 'Códice', numeral: 'VI', render };
})();
