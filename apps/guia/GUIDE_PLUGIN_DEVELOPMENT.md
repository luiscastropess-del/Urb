# Guia Completo: Desenvolvimento de Plugins para Prospector de Locais

Este guia fornece instruções detalhadas para desenvolvedores que desejam estender a plataforma **Prospector de Locais & Guia Holambra** através do nosso motor de plugins.

---

## 1. Visão Geral

O sistema de plugins do Holambra Tech permite a inclusão de novas funcionalidades de forma modular e "Hot-Swap" (sem necessidade de novos deploys do núcleo da aplicação). 

Os plugins podem variar de simples widgets visuais (como previsão do tempo) até integrações complexas de IA, sistemas de pagamento e assistentes de chat.

### Tipos de Extensões
*   **Assistentes de IA:** Customização de modelos e tons de resposta.
*   **Widgets de Interface:** Injeção de HTML/JS customizado em dashboards.
*   **Integrações de Dados:** Sincronização via API para CRM ou BI.
*   **Gateways de Pagamento:** Simulação ou integração com provedores externos.

---

## 2. Estrutura do Plugin (Arquitetura)

No banco de dados, cada plugin é representado pelo modelo `Plugin`. A estrutura principal no `prisma/schema.prisma` é:

```prisma
model Plugin {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  description String?
  version     String   @default("1.0.0")
  author      String?
  isActive    Boolean  @default(false)
  manifest    String?  // Configurações de interface (ícone, cor)
  codeHtml    String?  // Código para injeção direta (Widgets)
  settings    String?  // JSON com chaves de configuração do plugin
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 3. Passo a Passo do Desenvolvimento

### Passo 1: Definir o Manifesto e Slug
O `slug` deve ser único e em minúsculas (ex: `meu-plugin-financeiro`). O manifesto é um JSON que define a aparência no dashboard.

**Exemplo de Manifesto:**
```json
{
  "icon": "CreditCard", // Nome do ícone no Lucide-React
  "color": "indigo",    // purple, blue, green, orange, indigo, rose
  "category": "Geral"
}
```

### Passo 2: Implementar a Lógica de Frontend (Opcional)
Se o seu plugin tiver uma parte visual (Widget), você deve preparar o conteúdo para o campo `codeHtml`. Este código será renderizado em um container controlado ou Iframe.

**Exemplo de Widget HTML:**
```html
<div id="weather-widget" style="padding: 1rem; background: #f0f9ff; border-radius: 12px;">
  <h4 style="color: #0369a1; margin: 0;">Previsão Holambra</h4>
  <p id="temp">Carregando...</p>
</div>
<script>
  // Exemplo de lógica JS injetada
  fetch('https://api.exemplo.com/weather')
    .then(r => r.json())
    .then(data => document.getElementById('temp').innerText = data.temp + '°C');
</script>
```

### Passo 3: Registrar o Plugin no Banco de Dados
Atualmente, o registro é feito via Server Actions ou através do script de seed.

No arquivo `app/actions.plugins.ts`, você pode adicionar seu plugin ao array `plugins` na função `seedPlugins()`:

```typescript
{
  name: "Conversor de Moedas",
  slug: "currency-converter",
  description: "Ferramenta para turistas estrangeiros.",
  version: "1.0.0",
  author: "Sua Empresa",
  manifest: JSON.stringify({ icon: "DollarSign", color: "green" }),
  isActive: false
}
```

### Passo 4: Implementar Configurações Dinâmicas
Muitos plugins precisam de chaves de API próprias (ex: Gemini Key, Stripe Key). Utilize o campo `settings` para armazenar esses dados em formato JSON.

**Acesso às configurações no Backend:**
```typescript
const plugin = await db.plugin.findUnique({ where: { slug: "ai-assistant" } });
const settings = JSON.parse(plugin.settings || "{}");
const model = settings.model || "gemini-3-flash-preview";
```

---

## 4. Autenticação via API (Acesso Externo)

Se o seu plugin for um serviço externo que precisa ler ou escrever dados na plataforma, você deve usar chaves de desenvolvedor.

1.  Acesse **Painel do Guia > Módulos & Plugins > Documentação**.
2.  Gere uma **API Key**.
3.  Todas as requisições devem incluir o Header:
    `Authorization: Bearer <SUA_CHAVE_AQUI>`

### Endpoints Principais:
*   **Prospector:** `GET /api/v1/prospector/results`
*   **Reservas:** `POST /api/v1/reservas/create`
*   **Plugins Status:** `GET /api/v1/plugins/status`

---

## 5. Melhores Práticas e Segurança

1.  **Isolamento:** Plugins injetados via `codeHtml` não devem tentar acessar o `localStorage` do domínio principal para evitar vazamento de sessões.
2.  **Performance:** Minimize o uso de scripts pesados em Widgets para não tornar o Dashboard lento.
3.  **Tipagem:** Ao criar Server Actions para o plugin, exporte sempre interfaces TS para garantir que o Frontend saiba o que esperar.
4.  **Imagens:** Nunca hospede imagens locais. Use o campo `photoUrl` e aponte para serviços como AWS S3, Cloudinary ou Imbb.

---

## 6. Publicação e Testes

Para testar seu plugin:
1.  Insira os dados no banco (via `npx prisma studio` ou seed).
2.  Habilite o plugin no painel administrativo (`/dashboard/admin`).
3.  Verifique se o ícone e a descrição aparecem corretamente na área de Plugins do Guia.
4.  Se houver erro de permissão, verifique se a API Key do desenvolvedor está ativa.

---
*Documentação gerada pelo Sistema Holambra Tech AI - v2.0*
