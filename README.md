# Égide · Registro de Heróis

O site do sistema da Égide, com visual de revista de super-heróis. Substitui o site da Ascensão Delta e usa o mesmo Firebase e as mesmas contas.

A tela mostra só o essencial. As Perícias (31, por Atributo) e a Energia entram sozinhas nas contas da ficha. Detalhes (efeitos, técnicas, tabelas, números secundários) abrem com um clique nos botões **+**.

O site faz as contas e o jogador escolhe. Ele cobre:

- **PT, PP e pontos de Atributo**, com o orçamento à vista.
- **Valores derivados**: PV, Defesa, Proteção, Resistência, Potência, Energia, Determinação, Salvaguardas e Dinheiro (US$).
- **Ataques**: o bônus e o dano de cada estilo e de cada poder.
- **Magia**: a CD e o custo dos feitiços.
- **Avisos**: o que ainda falta na ficha, incluindo a Regra do Preço.

Com a ficha pronta, o jogador joga direto nela: rola testes, ataques e dano, controla os medidores, gasta Kits e descansa.

## Páginas

### I. Fichas

A criação vai em 7 passos:

1. Conceito e Arquétipo.
2. Origem e Potencial.
3. Atributos.
4. Poderes e Grimório.
5. Estilos de Luta e Perícias.
6. Traços e Fraquezas.
7. Vida civil e dinheiro.

Ao lado fica o orçamento de pontos, com a lista de pendências. A ficha tem quatro abas:

- **Jogar**: rolagens, medidores, condições, Kits e descanso.
- **Construção**: os 7 passos de criação.
- **Inventário**: o que o herói carrega.
- **História**: aparência, história e anotações.

### II. Poderes

- **Construtor de poderes**: monta um poder do catálogo ou de um efeito básico, com Grau, Extras, Falhas e Variações. O custo em PP e o efeito no Grau aparecem na hora.
- **Biblioteca compartilhada**: os poderes que os jogadores montaram.
- **Tabela de Graus**.

### III. Arsenal

Compra em dólares (US$). Cada item tem preço; o site desconta do saldo e anota no extrato.

- Saldo = dinheiro inicial + salário e recompensas − compras.
- Dinheiro inicial: Sem nada US$ 50, Apertado US$ 500, Com emprego US$ 1.500 (Família rica US$ 10.000, Oficina lendária US$ 50.000, Traço Rico +US$ 15.000, Sem Lugar US$ 0). Fica congelado quando a mestragem aprova a ficha.
- Salário semanal: a mestragem define; o jogador recebe uma vez por semana no Inventário.
- Recompensas e multas: a mestragem lança no Inventário (valor + motivo).
- As regras do Firestore impedem o jogador de baixar os gastos, mexer no salário ou receber o salário duas vezes na mesma semana.

Quem é da Nova Égide pega de graça o que está no Arsenal do Observatório. Os itens especiais só a mestragem dá.

### IV. Referência

Origens, Potencial, Arquétipos, Estilos de Luta e de Poder, Traços e Magia.

### V. Oficina

- Calculadora de ataque e dano, com Brecha e tipos de dano.
- Testes rápidos.
- Para a mestragem:
  - o painel da mesa, com aprovação e "nova sessão";
  - o catálogo do Arsenal;
  - exportar e importar os dados.

### VI. Códice

As regras de mesa numa página. A Referência e o Códice abrem sem login.

## Como pôr no ar

### 1. Publicar os arquivos

1. No repositório do site (o do GitHub Pages), troque o conteúdo pelos arquivos deste zip.
2. A pasta `legacy/` e a música do site antigo podem sair. O site novo não usa nenhuma das duas.

Não precisa de build: basta servir a pasta.

### 2. Atualizar as regras do Firebase

No console do Firebase, abra **Firestore → Regras** e cole o conteúdo de `firestore.rules`.

O arquivo:

- mantém as regras do site antigo;
- acrescenta as coleções novas:
  - `egide_personagens`
  - `egide_poderes`
  - `egide_itens`

### 3. Carregar o catálogo do Arsenal

Entre como mestre (`mestre` ou `admin`) e, na Oficina, clique em **Carregar o catálogo inicial do Arsenal**.

## Quem pode o quê

- **Jogadores**:
  - criam e editam só as próprias fichas;
  - montam poderes;
  - põem os seus poderes na biblioteca.
- **Campos travados para jogadores** (só a mestragem muda): Classe (degrau), bônus de PT, PP e Determinação, PT de treino, salário e aprovação. Não existe nível: a Classe é a progressão.
- **Depois da aprovação**: Origem e Potencial ficam travados para o jogador.
- **Mestragem**:
  - mexe em todas as fichas;
  - cria e edita itens no Arsenal;
  - dá itens especiais;
  - aprova fichas.

As regras do Firestore garantem essas travas, não só a tela.

## Potencial e o bot

A Rolagem de Potencial continua no Discord, em público:

1. O jogador usa `!egide-potencial` no canal de aprovação. O bot rola 2d100 e fica com o maior.
2. O jogador digita o número na ficha do site.
3. Se ficou com a primeira rolagem, marca **Fé no Destino** (+2 PT).

O site aplica sozinho os ajustes da Origem:

- Mítico: Linhagem, de 40 a 94.
- Visitante: +15.
- Arcano: +2 PT.

Na ficha, o botão **Comandos do bot** gera os comandos que deixam a ficha de jogo do Discord igual à do site: `!egide-atributos`, `!egide-pericia`, `!egide-estilo` e `!egide-protecao`.

## Testar sem Firebase

Abra o endereço com `?local=1` no fim. Nesse modo:

- os dados ficam só no navegador;
- você tem acesso de mestre;
- dá para simular a rolagem de Potencial.

## Estrutura

```
index.html
firestore.rules                 regras (as antigas + egide_*)
assets/css/egide.css            visual
assets/js/regras.js             regras, tabelas e fórmulas do vault
assets/js/catalogo.js           catálogo inicial do Arsenal
assets/js/store.js              Firebase e modo local
assets/js/ui.js                 componentes e rolagens
assets/js/views/fichas.js       fichas: lista, criação, jogo, inventário, história
assets/js/views/poderes.js      construtor de poderes e feitiços, biblioteca
assets/js/views/arsenal.js      compra em dólares
assets/js/views/catalogo.js     Referência
assets/js/views/oficina.js      calculadora e painel da mesa
assets/js/views/codice.js       Códice
assets/js/app.js                menu e rotas
```

Para mudar uma regra (um custo, uma tabela, uma fórmula), edite `assets/js/regras.js`. Todas as páginas leem dali.
