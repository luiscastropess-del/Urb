# Script de Configuração para a Gemini: Ferramenta de Gerenciamento de Planos

Copie o prompt abaixo e cole para a IA (Gemini) a fim de criar e configurar o sistema completo de gerenciamento de planos para os Guias Locais no Painel Admin:

\`\`\`markdown
Olá Gemini, preciso que você construa o sistema completo de Gerenciamento de Planos para o Painel Admin da nossa aplicação. Este sistema servirá para configurar e vender planos de assinatura aos Guias Locais.

Siga exatamente o passo a passo abaixo para a implementação:

1. **Atualize o Schema do Prisma:**
   Adicione os modelos \`Plan\` (Plano), \`Coupon\` (Cupom) e \`Subscription\` (Assinatura).
   - **Plan:** deve ter nome, descrição, preço (Float), intervalo (mensal/anual), dias de trial grátis (\`trialDays\`), recursos (array de strings), e \`isActive\`.
   - **Coupon:** deve ter código, desconto em % ou valor, limite de usos, contagem de usos, data de validade, e \`isActive\`.
   - **Subscription:** relacione o Guia (\`GuideProfile\`) a um \`Plan\` e possivelmente a um \`Coupon\`, contendo os status da assinatura (active, past_due, canceled, trialing) e a data de renovação.
   *Não esqueça de adicionar a relação \`subscriptions Subscription[]\` no \`GuideProfile\`.* Após adicionar, rode \`npx prisma db push\`.

2. **Crie as Server Actions (\`app/actions.plans.ts\`):**
   Crie funções de CRUD (Create, Read, Update, Delete) completas e seguras (checando a sessão do admin) para os Planos e Cupons.
   Crie também uma action para listar todas as Assinaturas ativas.

3. **Crie o Layout do Painel Admin (\`app/dashboard/admin/layout.tsx\`):**
   Implemente um layout lateral responsivo com links rápidos para "Visão Geral", "Planos de Assinatura", "Cupons" e "Assinaturas". Use ícones da \`lucide-react\` para melhorar o visual (ex: ícone de Package para os Planos, etc).

4. **Crie a Página de Módulos de Planos (\`app/dashboard/admin/planos/page.tsx\`):**
   Crie uma interface administrativa completa listando os planos em formato de tabela com as colunas: Nome, Preço, Ciclo, Teste Grátis e Status.
   Adicione um Modal para Criação/Edição do plano, onde o administrador pode inserir os dados:
   - Nome e Descrição
   - Preço (campo R$) e Ciclo de Cobrança (select de Mensal/Anual)
   - Período de Teste Grátis (input tipo number para dias)
   - Lista de Recursos (um TextArea onde o admin insere uma funcionalidade por linha)
   - Checkbox de status (Ativo/Inativo)
   Neste modal, chame as actions para salvar no banco. Permita deletar planos a partir da listagem também.

5. **Garanta as Integrações de Check-out e Cupons:**
   Deixe a página e os dados prontos para conectarmos a API do Stripe ou Mercado Pago assim que possível, utilizando as informações desses Planos criados no banco. (Como \`stripePriceId\`).

Desejo que o design utilize Tailwind CSS, e preze pela clareza e usabilidade, com cores neutras intercaladas para os estados da tabela. Por favor, comece o quanto antes.
\`\`\`
