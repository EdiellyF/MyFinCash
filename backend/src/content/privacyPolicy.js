/**
 * Conteúdo da Política de Privacidade do MyFinCash.
 *
 * Este texto descreve o que o sistema realmente faz. Ao editar, confira
 * contra o código antes de publicar — em especial:
 *  - services/aiService/context.js  (dados enviados a Groq/Gemini)
 *  - services/transactionExtractionService.js (envio de PDF)
 *  - prisma/schema.prisma  (categorias de dados coletados)
 */

export const privacyPolicy = {
  version: '2.0',
  lastUpdated: '2026-09-27',
  title: 'Política de Privacidade do MyFinCash',
  summary:
    'O MyFinCash guarda os seus dados financeiros para que você organize suas contas. Esta política explica, em linguagem simples, o que coletamos, para que usamos, com quem compartilhamos e como você pode exercer seus direitos.',

  sections: [
    {
      id: 'controller',
      icon: 'Building2',
      title: 'Quem é o responsável pelos seus dados',
      blocks: [
        {
          type: 'p',
          text: 'O responsável por este tratamento é o projeto MyFinCash, desenvolvido como programa de extensão do IFTO — Programa de Capacitação em Letramento Financeiro e Inclusão Digital. O tratamento observa a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018, a LGPD).',
        },
      ],
    },

    {
      id: 'legalBasis',
      icon: 'Scale',
      title: 'Por que podemos usar seus dados',
      blocks: [
        {
          type: 'p',
          text: 'A LGPD permite tratar dados pessoais desde que exista uma base legal. O MyFinCash se apoia nestas:',
        },
        {
          type: 'list',
          items: [
            'Execução de contrato: para criar sua conta, guardar suas transações e manter o serviço funcionando.',
            'Consentimento: para usos pontuais e opcionais, como o envio de documentos para extração por inteligência artificial. Você pode revogar quando quiser.',
            'Legítimo interesse: para proteger a segurança do sistema e detectar acessos suspeitos.',
            'Cumprimento de obrigação legal: quando houverdeterminação de autoridade competente.',
          ],
        },
      ],
    },

    {
      id: 'collection',
      icon: 'Database',
      title: 'O que coletamos',
      blocks: [
        {
          type: 'group',
          title: 'Dados que você informa',
          items: [
            'Nome e e-mail, para identificar a conta e recuperar o acesso.',
            'Senha, guardada apenas como hash bcrypt. O MyFinCash nunca armazena a senha em texto legível, e nem nós conseguimos recuperá-la.',
            'Foto de perfil, apenas se você enviar.',
          ],
        },
        {
          type: 'group',
          title: 'Dados financeiros que você registra',
          items: [
            'Transações: valor, data, descrição e categoria.',
            'Categorias de gasto.',
            'Metas financeiras: nome, valor-alvo, valor atual e prazo.',
            'Orçamentos: limite por categoria e por mês.',
            'Notificações geradas pelo sistema, como avisos de meta atingida e orçamento estourado.',
            'Seu progresso na trilha de Educação Financeira: pílulas lidas, quizzes respondidos e itens do checklist marcados.',
          ],
        },
        {
          type: 'group',
          title: 'Arquivos que você pode enviar',
          items: [
            'Extratos bancários ou de cartão em PDF, usados para extrair transações. O arquivo é processado em memória e não é gravado em disco pelo MyFinCash.',
          ],
        },
        {
          type: 'group',
          title: 'Dados técnicos e de segurança',
          items: [
            'Registros de acesso, com data, rota e endereço IP, para monitorar segurança e desempenho.',
            'Sessões ativas e tokens de acesso, para manter você logado com segurança.',
            'Chave de autenticação em dois fatores e códigos de backup, se você ativar esse recurso.',
            'Contadores de uso dos provedores de inteligência artificial, para aplicar limites de requisições.',
          ],
        },
      ],
    },

    {
      id: 'usage',
      icon: 'Target',
      title: 'Para que usamos seus dados',
      blocks: [
        {
          type: 'list',
          items: [
            'Criar e manter sua conta e seu login.',
            'Guardar, organizar e somar suas transações, metas e orçamentos.',
            'Gerar os relatórios e gráficos que você vê no sistema.',
            'Disparar os avisos de orçamento estourado e meta atingida, inclusive em tempo real.',
            'Dar andamento à trilha de Educação Financeira e guardar seu progresso.',
            'Responder às suas perguntas no assistente financeiro.',
            'Proteger o sistema contra fraude e uso indevido.',
            'Manter o serviço funcionando e corrigir falhas.',
          ],
        },
      ],
    },

    {
      id: 'ai',
      icon: 'Bot',
      title: 'Uso de inteligência artificial',
      tone: 'terracotta',
      blocks: [
        {
          type: 'p',
          text: 'O assistente financeiro e a extração de transações de PDF usam serviços de inteligência artificial de terceiros. Isso significa que parte do que você escreve e parte dos seus dados financeiros saem do MyFinCash.',
        },
        {
          type: 'list',
          items: [
            'Provedores: Groq e Google Gemini. O sistema tenta um e, se não houver resposta, usa o outro.',
            'Quando você usa o assistente, enviamos a sua mensagem, o histórico da conversa e um resumo do seu contexto financeiro — até 50 transações recentes com suas categorias, além das suas metas e orçamentos do mês.',
            'Quando você envia um PDF de extrato, o arquivo é enviado ao provedor de IA para que as transações sejam lidas.',
          ],
        },
        {
          type: 'callout',
          tone: 'terracotta',
          text: 'Atenção: esses provedores podem processar os dados em servidores fora do Brasil. Eles atuam como operadores junto ao MyFinCash e não podem usar suas informações para finalidade comercial.',
        },
        {
          type: 'p',
          text: 'Se preferir não enviar seus dados a provedores externos, você pode não usar esses dois recursos. O restante do MyFinCash — transações, metas, orçamentos, relatórios e trilha de Educação Financeira — funciona normalmente sem eles.',
        },
      ],
    },

    {
      id: 'sharing',
      icon: 'Share2',
      title: 'Com quem compartilhamos',
      blocks: [
        {
          type: 'p',
          text: 'O MyFinCash não vende seus dados pessoais e não os usa para publicidade.',
        },
        {
          type: 'group',
          title: 'Operadores de infraestrutura e serviço',
          items: [
            'Provedores de inteligência artificial (Groq e Google Gemini), conforme a seção anterior.',
            'Provedor de hospedagem do banco de dados e da aplicação.',
          ],
        },
        {
          type: 'group',
          title: 'Casos excepcionais',
          items: [
            'Autoridade competente, quando houver ordem judicial ou obrigação legal.',
            'Proteção do sistema e da sua conta, em caso de atividade suspeita ou incidente de segurança.',
          ],
        },
      ],
    },

    {
      id: 'transfers',
      icon: 'Globe',
      title: 'Transferência internacional',
      blocks: [
        {
          type: 'p',
          text: 'Alguns dos nossos fornecedores de infraestrutura e de inteligência artificial processam dados em servidores fora do Brasil. Nesses casos há transferência internacional de dados, com as salvaguardas previstas na LGPD.',
        },
        {
          type: 'p',
          text: 'Ao usar o assistente financeiro ou enviar um extrato em PDF, você está concordando com essa transferência para o provedor de IA selecionado naquele momento.',
        },
      ],
    },

    {
      id: 'storage',
      icon: 'HardDrive',
      title: 'Cookies e armazenamento no seu navegador',
      blocks: [
        {
          type: 'p',
          text: 'O MyFinCash não usa cookies de publicidade nem rastreadores de terceiros.',
        },
        {
          type: 'p',
          text: 'Usamos o armazenamento local do navegador para manter você logado e para lembrar preferências, como o tema claro ou escuro. Esses dados ficam no seu aparelho e podem ser apagados limpando o histórico do navegador, mas você será desconectado.',
        },
      ],
    },

    {
      id: 'security',
      icon: 'Lock',
      title: 'Como protegemos seus dados',
      blocks: [
        {
          type: 'list',
          items: [
            'Senhas, códigos de backup e tokens de sessão são guardados apenas como hash bcrypt, e nunca em texto legível.',
            'A comunicação entre o seu navegador e o MyFinCash usa HTTPS.',
            'O acesso aos seus dados exige autenticação: a sua senha e, se você ativar, um código do seu aplicativo autenticador.',
            'O acesso interno aos dados é restrito à equipe de desenvolvimento e restrito ao necessário para operar o sistema.',
            'Cada requisição de inteligência artificial é registrada e há limite diário de uso por conta, para reduzir a exposição de dados.',
          ],
        },
        {
          type: 'p',
          text: 'Nenhum sistema é totalmente imune a incidentes. Se ocorrer algo que afete seus dados, o MyFinCash avisará você e a Autoridade Nacional de Proteção de Dados (ANPD), conforme determina a LGPD.',
        },
      ],
    },

    {
      id: 'retention',
      icon: 'Clock',
      title: 'Por quanto tempo guardamos',
      blocks: [
        {
          type: 'p',
          text: 'Mantemos seus dados enquanto sua conta estiver ativa.',
        },
        {
          type: 'list',
          items: [
            'Ao excluir a conta, seus dados são removidos permanentemente, por cascade no banco de dados.',
            'Registros de acesso podem ser mantidos por um período adicional, apenas para atender obrigações legais de segurança.',
            'O histórico de conversas com o assistente é mantido junto da sua conta e some junto com ela.',
          ],
        },
      ],
    },

    {
      id: 'rights',
      icon: 'UserCheck',
      title: 'Seus direitos',
      blocks: [
        {
          type: 'p',
          text: 'A LGPD garante a você, sobre seus dados, os seguintes direitos:',
        },
        {
          type: 'list',
          items: [
            'Confirmação e acesso: saber se tratamos seus dados e obter uma cópia deles.',
            'Correção: atualizar dados incorretos ou desatualizados, direto no seu perfil.',
            'Exclusão: apagar sua conta e todos os dados associados.',
            'Portabilidade: receber seus dados em formato aberto, para levar a outro serviço.',
            'Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a LGPD.',
            'Revogação do consentimento, para os usos que dependem dele.',
            'Informação sobre com quem compartilhamos seus dados.',
            'Portabilidade e eliminação dos dados tratados com consentimento.',
          ],
        },
        {
          type: 'p',
          text: 'Boa parte desses direitos você exerce sozinho: os dados de cadastro e a exclusão de conta ficam na tela de Perfil. Para uma cópia completa dos dados, para portabilidade ou para revogar consentimento, fale com a equipe do projeto pelo mesmo canal usado para o seu cadastro.',
        },
      ],
    },

    {
      id: 'deletion',
      icon: 'Trash2',
      title: 'Exclusão de conta',
      blocks: [
        {
          type: 'steps',
          items: [
            { title: 'Abra a tela de Perfil', text: 'A opção fica no final da página.' },
            { title: 'Clique em "Excluir minha conta"', text: 'O sistema pede a sua senha atual como confirmação, para garantir que não seja outra pessoa.' },
            { title: 'Confirme', text: 'A exclusão é imediata e definitiva.' },
          ],
        },
        {
          type: 'p',
          text: 'A exclusão remove permanentemente: perfil, transações, categorias, metas, orçamentos, notificações, conversas com o assistente e progresso na trilha de Educação Financeira. Não é possível recuperar.',
        },
      ],
    },

    {
      id: 'automated',
      icon: 'Cpu',
      title: 'Decisões automatizadas',
      blocks: [
        {
          type: 'p',
          text: 'O sistema toma decisões automatizadas sobre os seus próprios dados em dois casos, sempre de forma vinculada a um dado que você informou:',
        },
        {
          type: 'list',
          items: [
            'Aviso de orçamento estourado: disparado quando o gasto de uma categoria ultrapassa o limite que você definiu, pela primeira vez no mês.',
            'Aviso de meta atingida: disparado quando o progresso de uma meta que você cadastrou chega a 100%.',
          ],
        },
        {
          type: 'p',
          text: 'Nenhuma dessas decisões produz efeito jurídico sobre você, nem gera bloqueio, negação de serviço ou alteração de valor. Você pode corrigir os dados de origem a qualquer momento na tela de Transações, Metas e Orçamentos.',
        },
        {
          type: 'p',
          text: 'O conteúdo de Educação Financeira é informativo. Nada no sistema decide investimento, crédito ou recomendação financeira para você.',
        },
      ],
    },

    {
      id: 'children',
      icon: 'Users',
      title: 'Crianças e adolescentes',
      blocks: [
        {
          type: 'p',
          text: 'O MyFinCash é voltado a pessoas adultas. O público principal são estudantes universitários e jovens adultos.',
        },
        {
          type: 'p',
          text: 'Não coletamos intencionalmente dados de crianças e adolescentes menores de 18 anos. Se você não tiver 18 anos, precisa da autorização de um responsável legal para criar uma conta, e o responsável deve ser o titular do canal de contato sobre estes dados.',
        },
      ],
    },

    {
      id: 'changes',
      icon: 'RefreshCw',
      title: 'Alterações nesta política',
      blocks: [
        {
          type: 'p',
          text: 'Esta política pode ser atualizada. Quando houver mudança relevante, o MyFinCash avisará você dentro do sistema, por e-mail ou por aviso na tela inicial, indicando o que mudou e a data da nova versão.',
        },
        {
          type: 'p',
          text: 'A versão vigente fica sempre disponível nesta tela, com a data da última atualização no topo.',
        },
      ],
    },
  ],
};

export default privacyPolicy;
