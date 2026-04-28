# AI_ARCHITECTURE.md

Este documento serve como mapa arquitetural e manual de diretrizes para inteligências artificiais (e desenvolvedores humanos) que forem contribuir, atualizar ou modificar este aplicativo no futuro, garantindo que o sistema não seja corrompido durante as implementações.

## 1. Visão Geral do Aplicativo
O sistema é uma plataforma híbrida ("Prospector de Locais" & "Sistema Turístico Múltiplo"). 
Possui módulos dedicados a prospecção massiva e automatizada de dados geográficos e painéis para guias turísticos.

## 2. Stack Tecnológica (Core)
*   **Framework Node:** Next.js 15+ (App Router).
*   **Linguagem:** TypeScript (Com tipagem forte em Server Actions e Props de Componentes).
*   **Estilização:** Tailwind CSS v4 integrados no fluxo do Next, ícones gerenciados exclusivamente via `lucide-react`.
*   **Banco de Dados:** PostgreSQL hospedado (através da Neon / provedor serverless) e gerenciado via **Prisma ORM**. (O banco iniciou como SQLite e migrou para lidar perfeitamente com Serverless Concurrency).
*   **Deploy Target:** Otimizado para funcionar em ambientes com de poucos recursos (vCPU/RAM controlados, max-old-space-size ajustado no Node) e Google Cloud Run / Render.

## 3. Topologia de Diretórios e Arquivos

*   `/app/api/*`: Endpoints REST clássicos, importantes primariamente para o Cron Job de automação (`/api/cron`, `/api/search` e manipulação de memória viva em `/api/result`).
*   `/app/actions.*.ts`: "Server Actions" isolados e agrupados por domínio (`actions.cities.ts`, etc.). Onde as queries de banco de dados do Prisma devem residir e as revalidações (`revalidatePath`) operam após mutações de dados para purgar os caches estáticos do Next.js.
*   `/app/dashboard/guia/*`: Área transacional para parceiros gerirem roteiros, pacotes e aceitarem reservas de clientes.
*   `/components/*`: UI modular reutilizável como o `ToastProvider` para notificações de usuário, grids e modais.
*   `prisma/schema.prisma`: A fonte da verdade (Source of Truth) na estrutura de Banco. NUNCA faça queries que não respeitam os Models estritos daqui.

## 4. Funcionalidades Vitais
1.  **Prospector do OpenStreetMap (Overpass API):** O sistema varre cidades e categorias ("Restaurantes", "Hotéis"), extrai propriedades relevantes, e faz um Upsert (`osm_id` como chave única) no BD `Place` sem baixar imagens para economizar filesystem storage memory.
2.  **Motor de Plugins:** Páginas customizáveis onde código HTML (Iframes/Widgets) é injetado via DB e renderizado, servindo para estender o aplicativo de maneira Hot-Swap (plugins são configurados via JSON de Manifest e importados).
3.  **Gestão de Cidades Avançada:** Cidades possuem perfil de cover e imagens de galeria persistidos por URLs de Image Hosting de terceiros.

---

## 5. Diretrizes para Modificações Essenciais (AI Protocol)

Para evitar re-renders em cascata, falhas de sincronia de rotas e problemas no build do Next.js, as futuras atualizações devem seguir REGRAS ESTRITAS DE ARQUITETURA. Considere-as as **Configurações Base** do seu raciocínio contextual:

### Regra 1: Separação de Rotas e Client bounds
Sempre assuma que componentes Next.js App Router são **Server Components** até o momento que necessitem eventos do navegador (`useState`, `useEffect`, `onClick`).
Ao criar botões de clique com lógicas, isole os hooks para `use client` nas bordas do Componente da Interface, transferindo a lógica densa de dados para arquivos puros `actions.tsx` ou mantidos sob uma async API call com `"use server"` explicitado no topo do próprio arquivo de action.

### Regra 2: Componentes Limpos com Hooks (`useEffect`)
Para não quebrar o linter e o build (`eslint`), garanta o seguinte comportamento sobre `useEffect`:
*   As funções chamadas num Hook de Carga inicial (ex: `loadData()`), DEVEM ser declaradas com o parâmetro de loading setado de maneira controlada, cuidando para adicionar o array de dependências rigorosamente alinhado à documentação do react `[]` ou incluir `useCallback`.
*   Nunca utilize chamadas sincrônicas que renderizam em loop infinito o `setState` de fora para dentro.

### Regra 3: Sistema de Toasts em Iframes
Como uma grande parcela da operação interage dentro de frames providos em Studio Environments, em hipótese NENHUMA chame `window.alert()`. A confirmação de ações pode invocar globalmente o contexto do `<ToastProvider>` (`const { showToast } = useToast()`).
Sempre garanta que exceções nas Actions e APIs batam no front-end emitindo mensagens seguras de erro aos usuários (ex: `showToast("Erro ao processar roteiro")`).

### Regra 4: Cuidado Máximo com o Prisma Schema 
Qualquer feature que necessite alterar os modelos de dados:
1.  Altere as colunas no arquivo `schema.prisma`.
2.  Acione imediatamente a tool do terminal `npx prisma db push && npx prisma generate`.
3.  Só depois crie as Server Actions e o respectivo visual no Frontend que consumirá esses dados. O cliente Prisma tipado (`@prisma/client`) sempre precisa estar perfeitamente alinhado com o estado de tempo de Execução (`node_modules`).

### Regra 5: Otimização de Imagens
Não importe imagens como arquivos nativos na plataforma utilizando file transfer local a não ser que exista um Bucket do S3 configurado. Para cidades, lugares e perfis, salve o campo como `<Model>.photoUrl` `String` no banco, e no lado do Client utilize a tag `<img src={} onError={() => setFallback()} />` com graceful error handling para imagens que deram 404.

---
Seguindo as premissas deste documento, todo e qualquer agente AI ou dev poderá prosseguir a jornada de features sem poluir o branch main com logs fatais de ESLint ou Prisma Desincronizado.
