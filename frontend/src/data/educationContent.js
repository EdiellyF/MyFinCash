// Conteúdo da trilha "Educação Financeira".
// Os ids de pílula, módulo e item de checklist são a chave de persistência
// (backend/src/services/learningProgressService.js). Renomear um id aqui
// reinicia o progresso daquele item para quem já tinha concluído.

export const GLOSSARY = [
  { term: 'CDI', meaning: 'A taxa que os bancos cobram entre si quando um empresta dinheiro ao outro. Serve de régua: "110% do CDI" compara produtos de igual para igual.' },
  { term: 'Liquidez', meaning: 'A facilidade de tirar o dinheiro quando você quiser. Dinheiro na conta é 100% líquido.' },
  { term: 'FGC', meaning: 'Fundo Garantidor de Crédito. Devolve até R$ 250 mil por banco (R$ 1 milhão por CPF no total) se o banco quebrar e você tiver CDB, LCI ou LCA.' },
  { term: 'LCI / LCA', meaning: 'Títulos que o banco emite contra empréstimos de imóveis. Para pessoa física, os rendimentos não pagam imposto.' },
  { term: 'Debênture', meaning: 'Título que uma empresa emite para conseguir dinheiro. Você vira credor da empresa.' },
  { term: 'Cota', meaning: 'Um pedacinho de um FII. Cada cota rende uma parte dos aluguéis.' },
  { term: 'Vacância', meaning: 'Quanto do imóvel do fundo está vazio. Vacância alta é ruim.' },
  { term: 'Home broker', meaning: 'O aplicativo da corretora onde você compra e vende investimento.' },
];

export const LEVELS = [
  { id: 'curioso', name: 'Curioso', minXp: 0, icon: '🌱' },
  { id: 'guardiao', name: 'Guardião do Futuro', minXp: 60, icon: '🛡️' },
  { id: 'iniciante', name: 'Investidor Iniciante', minXp: 120, icon: '📈' },
  { id: 'imoveis', name: 'Conhecedor de Imóveis', minXp: 200, icon: '🏠' },
];

export function levelForXp(xp) {
  return LEVELS.reduce((current, level) => (xp >= level.minXp ? level : current), LEVELS[0]);
}

export const CHECKLIST = [
  {
    id: 'alimentacao',
    title: 'Alimentação',
    icon: 'Utensils',
    items: [
      { id: 'food-ru', text: 'Uso o restaurante universitário nas horas de aula', saving: 200 },
      { id: 'food-market', text: 'Compro comida no mercado em vez de pedir pronta', saving: 120 },
      { id: 'food-delivery', text: 'Divido a delivery com colegas, ou busco no balcão', saving: 90 },
      { id: 'food-feira', text: 'Compro fruta e verdura em promoção de feira', saving: 40 },
    ],
  },
  {
    id: 'transporte',
    title: 'Transporte',
    icon: 'Bus',
    items: [
      { id: 'trans-pass', text: 'Uso o passe estudantil no ônibus', saving: 60 },
      { id: 'trans-carona', text: 'Combino carona com colegas do curso', saving: 80 },
      { id: 'trans-bilhete', text: 'Compro bilhete de viagem antes', saving: 50, period: 'por viagem' },
    ],
  },
  {
    id: 'estudo',
    title: 'Material de estudo',
    icon: 'BookOpen',
    items: [
      { id: 'study-used', text: 'Pego livro usado de colega ou na OLX', saving: 100, period: 'por semestre' },
      { id: 'study-library', text: 'Uso a biblioteca antes de comprar', saving: 0, period: 'sem custo' },
      { id: 'study-share', text: 'Divido material com a turma', saving: 50, period: 'por semestre' },
    ],
  },
  {
    id: 'descontos',
    title: 'Descontos que quase ninguém usa',
    icon: 'Zap',
    items: [
      { id: 'discount-cine', text: 'Mostro a carteirinha na entrada de cinema, teatro e museu', saving: 0, period: '50% off' },
      { id: 'discount-m365', text: 'Assino o Microsoft 365 Education (grátis com e-mail institucional)', saving: 0, period: 'R$ 0' },
      { id: 'discount-celular', text: 'Vejo se a minha cidade tem plano de celular estudantil', saving: 0, period: 'variável' },
    ],
  },
  {
    id: 'local',
    title: 'Vida em Palmas/TO',
    icon: 'MapPin',
    items: [
      { id: 'local-food', text: 'Faço as refeições dentro da universidade', saving: 200 },
      { id: 'local-moradia', text: 'Divido apartamento com outros estudantes', saving: 150 },
    ],
  },
];

export const CHECKLIST_TOTAL = CHECKLIST.reduce((sum, group) => sum + group.items.length, 0);

export const DISCLAIMER =
  'Este conteúdo é educativo e não é recomendação de investimento. Rentabilidade passada não garante resultado futuro. Para decisões sobre o seu dinheiro, fale com um profissional certificado (CFP).';

export const MODULES = [
  {
    id: 'm1',
    number: 1,
    title: 'Reserva de Emergência',
    icon: 'Shield',
    reward: 'Guardião do Futuro',
    rewardIcon: '🛡️',
    intro:
      'Reserva de emergência é o dinheiro que você guarda para quando algo inesperado acontece. Ela existe para você resolver o problema sem entrar no rotativo do cartão.',
    alert: null,
    pills: [
      {
        id: 'm1-p1',
        title: 'Para que serve',
        blocks: [
          { type: 'p', text: 'Reserva de emergência é o dinheiro que você guarda para quando algo inesperado acontece.' },
          { type: 'p', text: 'Uma chave perdida. O notebook quebrou na véspera da entrega. Uma semana sem renda, se você trabalha por freelance. Um problema de saúde que o plano não cobriu.' },
          { type: 'p', text: 'A reserva existe para você resolver isso sem entrar no rotativo do cartão.' },
          { type: 'callout', tone: 'forest', text: 'Sem reserva, um imprevisto vira dívida. Com reserva, vira só um susto.' },
        ],
      },
      {
        id: 'm1-p2',
        title: 'Quanto guardar',
        blocks: [
          { type: 'p', text: 'Não existe número mágico. Existe um prazo.' },
          {
            type: 'table',
            head: ['Sua situação', 'Meta'],
            rows: [
              ['Renda estável (CLT, servidor público)', '3 a 6 meses de despesa'],
              ['Renda variável (freelance, autônomo)', '6 a 12 meses'],
              ['Sem renda estável agora', 'Comece com 1 mês, qualquer valor ajuda'],
            ],
          },
          { type: 'p', text: 'Some tudo que você gasta por mês: aluguel, comida, transporte, internet, celular. Esse é o seu número.' },
          { type: 'callout', tone: 'gold', text: 'Comece pelo que der. R$ 50 por mês já é reserva.' },
        ],
      },
      {
        id: 'm1-p3',
        title: 'Onde guardar',
        blocks: [
          { type: 'p', text: 'A regra é uma só: resgate no mesmo dia, risco baixo.' },
          {
            type: 'cards',
            cards: [
              { title: 'Tesouro Selic', text: 'Você empresta dinheiro ao governo e recebe juros. Resgate quando quiser. É a opção mais segura e mais usada.', tone: 'forest', badges: ['Muito baixo', 'Recomendado'] },
              { title: 'CDB de liquidez diária', text: 'O banco paga os juros e você resgata no mesmo dia. CDB = Certificado de Depósito Bancário, um título emitido pelo banco.', tone: 'neutral', badges: ['Baixo'], glossary: ['CDB', 'FGC'] },
              { title: 'Fundos DI', text: 'Aplicação coletiva em títulos bancários. Aceitam valores pequenos, então dá para começar com pouco.', tone: 'neutral', badges: ['Baixo'] },
            ],
          },
          {
            type: 'alert',
            title: 'Não use para reserva',
            text: 'Ação, cripto e FII. Se você precisar do dinheiro amanhã, não pode estar em algo que demora para resgatar.',
          },
        ],
      },
      { id: 'm1-p4', title: 'Simulador', blocks: [], simulator: 'reserve' },
    ],
    quiz: [
      {
        id: 'm1-q1',
        question: 'Você quebrou o notebook e precisa de R$ 1.500 amanhã. Onde esse dinheiro deve estar?',
        options: [
          { id: 'a', text: 'Em ação, porque rende mais', correct: false, why: 'Ação pode render mais, mas você não consegue sacar amanhã.' },
          { id: 'b', text: 'Em Tesouro Selic ou CDB de liquidez diária', correct: true, why: 'Isso. Reserva precisa estar disponível hoje. O que demora para resgatar não é reserva.' },
          { id: 'c', text: 'Em FII', correct: false, why: 'FII é renda variável e o preço da cota oscila todo dia.' },
          { id: 'd', text: 'Na poupança, mesmo rendendo menos', correct: false, why: 'Funciona, mas a poupança rende menos. Se puder escolher, Tesouro Selic paga mais.' },
        ],
      },
      {
        id: 'm1-q2',
        question: 'Você trabalha como freelancer e gasta R$ 2.000 por mês. Qual meta faz sentido?',
        options: [
          { id: 'a', text: '1 mês', correct: false, why: 'Pouco. Um mês só deixa você desprotegido se o mês atrasar.' },
          { id: 'b', text: '3 meses', correct: false, why: 'Melhor que 1, mas ainda apertado para renda variável.' },
          { id: 'c', text: 'Entre 6 e 12 meses', correct: true, why: 'Isso. Renda variável oscila. Com 6 a 12 meses de despesa você atravessa um mês ruim sem depender de cartão.' },
          { id: 'd', text: '12 meses, mas investidos em ação', correct: false, why: 'Confunde reserva com investimento. A reserva tem que estar disponível.' },
        ],
      },
    ],
  },
  {
    id: 'm2',
    number: 2,
    title: 'Renda Fixa',
    icon: 'TrendingUp',
    reward: 'Investidor Iniciante',
    rewardIcon: '📈',
    intro:
      'Renda fixa é quando você empresta dinheiro e recebe juros em troca. Você não fica dono de nada: você vira credor.',
    alert: null,
    pills: [
      {
        id: 'm2-p1',
        title: 'O que é',
        blocks: [
          { type: 'p', text: 'Renda fixa é quando você empresta dinheiro e recebe juros em troca.' },
          { type: 'p', text: 'Você não fica dono de nada. Você vira credor.' },
          { type: 'p', text: 'Quem paga os juros:' },
          { type: 'list', items: ['O governo, por meio do Tesouro Direto.', 'Bancos e empresas, por meio de CDB, LCI e debêntures.'] },
          { type: 'p', text: 'Por que é bom para começar: você sabe mais ou menos quando vai receber, e o risco é menor.' },
          { type: 'callout', tone: 'terracotta', text: 'Risco existe. A empresa pode falir. É por isso que existe o FGC, mas ele não cobre debênture.' },
        ],
      },
      {
        id: 'm2-p2',
        title: 'Cada produto em uma frase',
        blocks: [
          {
            type: 'table',
            head: ['Produto', 'O que é', 'Risco'],
            rows: [
              ['Tesouro Selic', 'Você empresta ao governo e recebe o equivalente à taxa Selic. Resgate em qualquer dia.', 'Muito baixo'],
              ['Tesouro IPCA+', 'Você empresta ao governo e recebe juros acima da inflação, mais a taxa Selic. Serve para prazo maior.', 'Muito baixo'],
              ['CDB', 'O banco paga juros. Resgate no vencimento, ou na hora se for de liquidez diária.', 'Baixo'],
              ['LCI / LCA', 'Título do banco ligado a empréstimo de imóvel. Menos rendimento, imposto zero.', 'Baixo'],
              ['Debênture', 'Uma empresa capta dinheiro e paga juros. Risco maior, porque empresa pode falir.', 'Médio'],
            ],
            riskColumn: true,
          },
        ],
      },
      {
        id: 'm2-p3',
        title: 'Como comparar',
        blocks: [
          { type: 'p', text: 'Antes de escolher qualquer produto, responda quatro perguntas.' },
          {
            type: 'steps',
            items: [
              { title: 'Por quanto tempo vou ficar com isso?', text: 'Liquidez é a facilidade de sacar rápido. Se você pode precisar no mês que vem, a liquidez é prioridade.', glossary: ['Liquidez'] },
              { title: 'Quanto rende, na mesma base?', text: 'Compare sempre na mesma base. "110% do CDI" e "115% do CDI" são comparáveis. "10% ao ano" e "110% do CDI" não são.', glossary: ['CDI'] },
              { title: 'Quanto vai sumir de imposto?', text: 'Rendimento maior nem sempre é mais dinheiro no bolso. LCI não paga imposto; CDB paga.' },
              { title: 'E se quem me paga quebrar?', text: 'O FGC cobre CDB, LCI e LCA em até R$ 250 mil por banco. Não cobre Tesouro nem debênture.', glossary: ['FGC'] },
            ],
          },
        ],
      },
      { id: 'm2-p4', title: 'Simulador', blocks: [], simulator: 'fixedIncome' },
    ],
    quiz: [
      {
        id: 'm2-q1',
        question: 'CDB A paga 100% do CDI. CDB B paga 115% do CDI. O que isso quer dizer?',
        options: [
          { id: 'a', text: 'O B rende 15% a mais que o A', correct: false, why: 'Confunde "15% do CDI" com "15% a mais". A diferença real é pequena.' },
          { id: 'b', text: 'Os dois rendem acima da taxa Selic', correct: false, why: 'Está errado no A: 100% do CDI equivale à Selic.' },
          { id: 'c', text: 'O A rende o equivalente à Selic; o B rende um pouco acima da Selic', correct: true, why: 'Isso. É essa a ideia do CDI: comparar produtos na mesma régua.' },
          { id: 'd', text: 'Não dá para comparar sem saber o prazo', correct: false, why: 'O prazo importa, mas a comparação pelo CDI continua válida.' },
        ],
      },
      {
        id: 'm2-q2',
        question: 'A LCI paga menos que o CDB, mas não paga imposto. Isso quer dizer que:',
        options: [
          { id: 'a', text: 'A LCI é sempre melhor', correct: false, why: 'Ignora que o CDB pode render bem mais.' },
          { id: 'b', text: 'O CDB é sempre melhor', correct: false, why: 'Ignora que a LCI não paga imposto.' },
          { id: 'c', text: 'Depende de quanto de imposto você pagaria no CDB', correct: true, why: 'Isso. Rendimento maior não é o mesmo que rendimento no bolso. Compare sempre o valor líquido, depois do imposto.' },
          { id: 'd', text: 'Os dois pagam o mesmo imposto no fim', correct: false, why: 'Não é verdade: a LCI é isenta para pessoa física.' },
        ],
      },
    ],
  },
  {
    id: 'm3',
    number: 3,
    title: 'Fundos Imobiliários (FIIs)',
    icon: 'Building2',
    reward: 'Conhecedor de Imóveis',
    rewardIcon: '🏠',
    intro:
      'FII é Fundo de Investimento Imobiliário. É um condomínio de imóveis que você compra em pedaços.',
    alert: {
      title: 'Antes de começar',
      text: 'FII é renda variável. O preço da cota pode cair, e o dividendo não é garantido. Leia este módulo com calma.',
    },
    pills: [
      {
        id: 'm3-p1',
        title: 'O que é',
        blocks: [
          { type: 'p', text: 'FII é Fundo de Investimento Imobiliário. É um condomínio de imóveis que você compra em pedaços.' },
          { type: 'p', text: 'Você compra cotas. Cada cota é um pedacinho do fundo.' },
          { type: 'example', title: 'Do jeito que funciona', text: 'O fundo é dono de 3 galpões e tem 300 cotas. 1 cota = 1/300 dos aluguéis. Se os galpões gerarem R$ 30.000 por mês, cada cota paga R$ 100.', glossary: ['Cota'] },
          { type: 'p', text: 'O que você não precisa fazer: comprar imóvel, pagar IPTU, pagar conta de luz, arrumar inquilino.' },
          { type: 'p', text: 'O que você precisa: ter conta em uma corretora.' },
        ],
      },
      {
        id: 'm3-p2',
        title: 'Tipos',
        blocks: [
          {
            type: 'cards',
            cards: [
              { title: 'Tijolo', text: 'O fundo é dono do imóvel físico: galpão, shopping, hospital, laje de escritório.', tone: 'forest' },
              { title: 'Papel', text: 'O fundo compra títulos ligados a imóveis (CRI, LCI). Mais fácil de vender.', tone: 'neutral' },
              { title: 'Híbrido', text: 'Uma parte de cada. Reduz o risco de um único imóvel.', tone: 'neutral' },
              { title: 'FOF', text: 'Um fundo que compra cotas de outros FIIs. Você diversifica sem escolher nada.', tone: 'neutral' },
            ],
          },
        ],
      },
      {
        id: 'm3-p3',
        title: 'Como comprar',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Abra conta numa corretora', text: 'Corretora é a empresa que compra e vende investimento para você. (Clear, XP, Rico, BTG)' },
              { title: 'Coloque dinheiro na conta', text: 'Por PIX ou TED.' },
              { title: 'Abra o aplicativo', text: 'Procure o código do fundo, por exemplo HGLG11.' },
              { title: 'Olhe três coisas', text: 'Quanto paga por cota por mês, a vacância (quanto do imóvel está vazio) e quem administra o fundo.', glossary: ['Vacância'] },
              { title: 'Compre', text: 'Dá para comprar 1 cota.' },
              { title: 'Receba', text: 'O dinheiro cai na sua conta todo mês.' },
            ],
          },
        ],
      },
      {
        id: 'm3-p4',
        title: 'Os riscos',
        blocks: [
          { type: 'list', items: [
            'A cota pode cair de preço. Se você vende num dia ruim, perde dinheiro. E o seu aluguel continua caindo igual.',
            'O dividendo não é garantido. Depende de o imóvel estar ocupado e de os contratos sendo renovados.',
            'Nada aqui é garantido. FII é renda variável.',
          ] },
          { type: 'alert', title: 'A ordem que evita prejuízo', text: 'Primeiro a reserva de emergência, depois renda fixa, e só então FII. Se você pula etapa, uma emergência te obriga a vender a cota no pior dia.' },
        ],
      },
    ],
    quiz: [
      {
        id: 'm3-q1',
        question: 'Ao investir em FII, os dividendos são isentos de imposto para pessoa física?',
        options: [
          { id: 'a', text: 'Sim, são isentos', correct: true, why: 'Isso. Os dividendos de FII são isentos para pessoa física.' },
          { id: 'b', text: 'Não, pagam a mesma tabela da renda fixa', correct: false, why: 'Invertido: são justamente os FII que têm isenção.' },
          { id: 'c', text: 'Só se o valor for menor que R$ 500 por mês', correct: false, why: 'Não existe essa faixa. A regra é pessoa física, sem limite de valor.' },
          { id: 'd', text: 'Depende da corretora', correct: false, why: 'A isenção é uma regra da lei, não da corretora.' },
        ],
      },
      {
        id: 'm3-q2',
        question: 'Por que a cota pode cair mesmo com todos os galpões alugados?',
        options: [
          { id: 'a', text: 'Porque o mercado mudou de opinião sobre o fundo', correct: true, why: 'Isso. O preço é dado pelo mercado, e pode cair por medo ou por jiro, não só por problema real.' },
          { id: 'b', text: 'Porque o fundo está perdendo dinheiro', correct: false, why: 'Se estivesse perdendo, o dividendo cairia também. Essa não é a causa comum.' },
          { id: 'c', text: 'Porque o dividendo foi cancelado', correct: false, why: 'Cancelamento de dividendo é raro e viria acompanhado de notícia.' },
          { id: 'd', text: 'A cota não cai quando o fundo está saudável', correct: false, why: 'O preço oscila todo dia, saudável ou não.' },
        ],
      },
    ],
  },
];
