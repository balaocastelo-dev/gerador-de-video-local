# Balão Social Manager

Plataforma SaaS em Next.js para gestao, adaptacao, publicacao e agendamento de conteudo em redes sociais, com autenticacao Supabase, banco Postgres, storage de midia e integracoes mock preparadas para APIs oficiais.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Row Level Security
- Server Actions

## O que o MVP entrega

- Cadastro, login, logout e persistencia de sessao com Supabase Auth
- Rotas privadas em `/app`
- Dashboard com cards de metricas, ultimas publicacoes e status das redes
- Pagina de redes conectadas com conexao mock para:
  - Instagram
  - Facebook Pagina
  - Threads
  - LinkedIn
  - TikTok
  - YouTube
  - X / Twitter
  - Pinterest
- Biblioteca de midia usando Supabase Storage e tabela `media_assets`
- Criador de publicacao com:
  - texto principal
  - objetivo
  - tom
  - selecao de redes conectadas
  - upload de imagem/video
  - selecao de midias existentes
  - adaptacao automatica por rede
  - previa editavel por rede
- Publicacao mock com registro em:
  - `posts`
  - `post_targets`
  - `publish_logs`
- Agendamento com registro em `publish_jobs`
- Pagina de calendario editorial
- Pagina de publicacoes com filtros
- Pagina de logs
- Pagina de configuracoes
- Schema SQL com tabelas, indices, triggers, RLS e policies

## O que ainda esta simulado

- OAuth e conexoes oficiais com Meta, LinkedIn, TikTok, YouTube, X e Pinterest
- Publicacao real nas APIs das redes sociais
- Webhooks de confirmacao de status
- Filas/background workers para processamento automatico

## Estrutura principal

```text
src/
  app/
    app/
      page.tsx
      nova-publicacao/
      calendario/
      publicacoes/
      redes-conectadas/
      biblioteca-de-midia/
      logs/
      configuracoes/
  actions/
  components/
  lib/
  services/
    social/
supabase/
  schema.sql
```

## Variaveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROJECT_REF=nechxnubbxudesyjuxnb
APP_URL=http://localhost:3000
ENCRYPTION_KEY=
MOCK_SOCIAL_APIS=true

META_APP_ID=
META_APP_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
X_API_KEY=
X_API_SECRET=
PINTEREST_APP_ID=
PINTEREST_APP_SECRET=
```

## Seguranca

- Nunca suba `.env.local` para o GitHub
- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend
- O projeto usa `anon key` apenas no lado publico/autenticado quando necessario
- Operacoes privadas ficam em server actions
- O schema aplica RLS em todas as tabelas de dominio
- Cada usuario acessa apenas os proprios dados
- Uploads validam tipo e tamanho

## Como instalar

```bash
npm install
```

## Como rodar localmente

```bash
npm run dev
```

App local:

```text
http://localhost:3000
```

## Se o Windows nao reconhecer npm

Use o script de bootstrap do proprio repositório:

```powershell
.\run-dev.ps1
```

Ou, se preferir:

```powershell
.\scripts\dev.ps1
```

Se o PowerShell bloquear execucao de scripts, rode o launcher `.cmd`:

```powershell
.\run-dev.cmd
```

Ou:

```powershell
powershell -ExecutionPolicy Bypass -File .\run-dev.ps1
```

Esse fluxo:

- baixa um Node.js portatil para `.tools/node`
- instala as dependencias localmente
- sobe o Next.js em `http://localhost:3000`

## Como aplicar o schema no Supabase

1. Abra o projeto `nechxnubbxudesyjuxnb` no dashboard do Supabase.
2. Entre em SQL Editor.
3. Cole o conteudo de `supabase/schema.sql`.
4. Execute o script.

Arquivo de schema:

- [schema.sql](file:///c:/Users/User/Documents/gerador-de-video-local/supabase/schema.sql)

## Bucket de storage

Bucket esperado:

- `social-media-assets`

Configurado no schema com:

- limite de 50 MB
- tipos permitidos:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `video/mp4`
  - `video/quicktime`

## Fluxo recomendado para testar o MVP

1. Instale dependencias
2. Configure `.env.local`
3. Rode `npm run dev`
4. Execute `supabase/schema.sql`
5. Crie um usuario em `/cadastro`
6. Faça login
7. Conecte redes em `/app/redes-conectadas`
8. Envie arquivos em `/app/biblioteca-de-midia`
9. Crie uma publicacao em `/app/nova-publicacao`
10. Gere as previas por rede
11. Publique agora ou agende
12. Consulte `/app/publicacoes`, `/app/logs` e `/app/calendario`
13. Use o botao `Processar agendamentos pendentes`

## Como o modo mock funciona

- `MOCK_SOCIAL_APIS=true` ativa a camada mock
- Cada rede possui service proprio em `src/services/social`
- Os metodos padronizados existem para futura troca por APIs reais:
  - `connect()`
  - `disconnect()`
  - `validateContent()`
  - `formatContent()`
  - `publishPost()`
  - `schedulePost()`
  - `getAccountInfo()`
  - `getPostStatus()`

## Proximos passos para APIs reais

- Implementar OAuth oficial por rede
- Criar refresh token seguro com criptografia obrigatoria
- Adicionar workers/cron para jobs automaticos
- Salvar relacao entre posts e multiplas midias com tabela dedicada
- Criar analytics por desempenho de rede
- Adicionar webhooks e status em tempo real

## Observacao sobre este ambiente

Se o projeto abrir sem as variaveis do Supabase, a aplicacao mostra um aviso de configuracao em vez de quebrar a interface. Assim voce consegue subir o projeto, revisar o layout e depois ativar o fluxo completo ao preencher o `.env.local`.
