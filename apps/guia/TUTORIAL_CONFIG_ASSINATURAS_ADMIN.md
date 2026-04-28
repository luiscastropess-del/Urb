# Tutorial para a Gemini (Painel Admin): Configuração de Planos de Assinatura

Copie o prompt abaixo e envie para a Gemini que está desenvolvendo o seu **Painel Admin**, para que ela construa a gestão de assinaturas corretamente integrada com o banco de dados atualizado:

---

**[Copie a partir daqui]**

Olá, Gemini! Preciso da sua ajuda para configurar a gestão completa dos **Planos de Assinatura** e do **Status de Pagamento (Checkout)** no nosso Painel Admin.

Acabamos de realizar uma atualização importante no nosso banco de dados central (Prisma). Por favor, aplique as seguintes mudanças no Painel de Administração e crie as integrações de pagamento baseando-se nestas diretrizes:

### 1. Atualização do Schema Prisma
Foi adicionado o campo `paymentStatus` no modelo `Subscription`. Certifique-se de que o seu `schema.prisma` no repositório do Admin (ou o seu modelo da base de dados caso compartilhe centralmente) reflita a Tabela de Assinatura assim:

```prisma
model Subscription {
  id                     String   @id @default(uuid())
  guideId                String   @unique
  planId                 String
  status                 String   @default("active")
  currentPeriodEnd       DateTime
  cancelAtPeriodEnd      Boolean  @default(false)
  couponId               String?
  externalSubscriptionId String?  @unique
  paymentStatus          String?  // <-- NOVO CAMPO ADICIONADO
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  guide  GuideProfile @relation(fields: [guideId], references: [id], onDelete: Cascade)
  plan   Plan         @relation(fields: [planId], references: [id], onDelete: Cascade)
  coupon Coupon?      @relation(fields: [couponId], references: [id], onDelete: SetNull)
}
```

### 2. Painel de Gestão de Assinaturas (Admin UI)
Por favor, atualize (ou crie) a tela de **Gestão de Assinaturas** (`/dashboard/admin/assinaturas`):
- Deve exibir a listagem de todos os guias assinantes.
- Adicione uma nova coluna na tabela chamada **Situação do Pagamento** que vai ler o campo `paymentStatus` (ex: "Pago", "Pendente", "Recusado").
- Crie um modal para "Editar Assinatura" onde o Admin pode manualmente marcar o `paymentStatus` como "paid" (Pago) e alterar o `status` da assinatura (ex: "active" para "canceled").

### 3. Funções de Backend (Server Actions)
Atualize as Server Actions ou Controllers de Assinatura:
- Na função que processa novos assinantes ou webhooks de gateways de pagamento, além de definir o `status` da Subscription para `active`, armazene agora em `paymentStatus` o status da transição que vem da operadora de pagamento (por exemplo, `"paid"`, `"pending"`, `"failed"`).
- Inclua tratamentos de erro caso um destes campos venha nulo.

### 4. Integração com API (Se utilizável externamente)
Se você estiver utilizando a API do sistema principal para alterar assinaturas (via `PUT /api/admin/guides/[id]`), passe a enviar também o novo campo `paymentStatus` e exibi-lo nos dados recebidos no GET. 

Desejo isso utilizando uma UI moderna em Tailwind CSS, priorizando um visual de Dashboard administrativo claro e intuitivo.

**[Fim do Prompt]**
---

O arquivo acima contém todas as instruções necessárias para que a IA (do Admin Panel) atualize suas páginas, integre a leitura correta dos novos campos (como o `paymentStatus`) e não sofra erros de compatibilidade com as tabelas de banco de dados do sistema principal.
