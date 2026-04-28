# Configurações de Integração de Plataformas para Agentes Gemini

Este documento contém os prompts de configuração para alinhar os Agentes Gemini (AI) responsáveis pela manutenção e expansão das plataformas complementares do Ecossistema Urbano Holambra:
- Guia Local (https://local-urbano.onrender.com)
- Admin Urbano (https://adm-urbano.onrender.com/)

## Instruções para o Gemini (PGuia)

```markdown
# [SYSTEM] PGuia Integration Directives

### Contexto
O portal central (Urbano Holambra) agora possui perfis dinâmicos para Guias Locais que suportam **Planos de Assinatura (Free e Pro/Ultimate)**. 
- A vitrine **gratuita** baseia-se num modelo de *Profile Glassmorphism* focado apenas na divulgação do currículo e restrições de pacotes.
- A vitrine **PRO** possui badges exclusivos, contato direto via botão WhatsApp e liberação ilimitada de vídeos, galerias, pacotes e roteiros.
- A vitrine **ULTIMATE** baseia-se num design premium focado em alta conversão. Contém banner diferenciado de fundo, selos VIP e FAQ interativa (além de liberação ilimitada de todos os recursos da Pro).

### Ação Imediata na Base de Dados
O banco de dados oficial contém a coluna `plan` na tabela `GuideProfile` (valores aceitos: `"free", "pro", "ultimate"`).

### Atualização da UI no PGuia
Ao exibir o status do plano na Dashboard do Guia local (https://local-urbano.onrender.com):
1. **Guias Free**: Emita um card de Upsell "Quer mais visibilidade?" oferecendo os planos `Pro` e detalhe os benefícios da exibição PRO no Urbano Holambra.
2. **Guias Pro/Ultimate**: Exiba um painel VIP detalhando as visualizações, ressaltando o botão do WhatsApp direto que ganharam na vitrine e as permissões ilimitadas de galerias/vídeos.
3. **Edição do Perfil**: Liberar o upload de recursos de Vídeo e Galeria ilimitada apenas se o usuário tiver \`plan === "pro" || plan === "ultimate"\`.
4. **Link Único:** Atualize a página do dashboard fornecendo o "Link Único" do Guia de volta para o Urbano Holambra no formato `/guias/[id_do_guia]`.
```

## Instruções para o Gemini (AdminGuide)

```markdown
# [SYSTEM] AdminGuide Integration Directives

### Contexto
Painel Administrativo da Redes PGuia (https://adm-urbano.onrender.com/). Foram implementadas novas interfaces gratuitas e PRO nos aplicativos cliente do "Urbano Holambra".

### Ação Imediata: Gestão de Planos
1. **Nova métrica na Tabela `GuideProfile`:** A coluna `plan` precisa ser visualizável na lista de "Guias Pendentes e Aprovados". Filtros de busca por "Pro" ou "Free" são bem-vindos.
2. Na tela de aprovação de guias, definir por default `plan: "free"` no evento de "Aprovar Cadastro".
3. Criar uma nova tabela/tab na UI central listando a contagem e Analytics de conversões de "Guias Free" para "Guias Pro".

### Integração de Faturamento e Permissões
1. O painel deve disponibilizar ações na UI que efetuem chamadas REST para dar "Upgrade ou Downgrade" manual nos planos. O endpoint correspondente deve acionar no Prisma:
   `await prisma.guideProfile.update({ where: { id }, data: { plan: "pro" }})`
   Sempre que um comprovante de pagamento de upgrade for aprovado no app adminguide, acione esta rota.
```
