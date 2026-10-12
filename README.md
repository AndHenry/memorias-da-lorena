# 🌟 Memórias da Lorena — Uma Noite Estrelada

> **Plataforma web de álbum colaborativo de fotos e vídeos para a festa de 15 anos de Lorena Rayla.**  
> Inspirado na experiência de eventos ao vivo (como *Dots Memories*), permitindo que convidados compartilhem fotos e vídeos instantaneamente via QR Code nas mesas, com moderação administrativa em tempo real, galeria compartilhada, contadores ao vivo e download em alta resolução.

---

## 📋 Sumário
- [Recursos Principais](#-recursos-principais)
- [Arquitetura e Stack Tecnológica](#-arquitetura-e-stack-tecnol%C3%B3gica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação e Execução Local](#-instala%C3%A7%C3%A3o-e-execu%C3%A7%C3%A3o-local)
- [Configuração do Supabase (Passo a Passo)](#-configura%C3%A7%C3%A3o-do-supabase-passo-a-passo)
- [Painel Administrativo](#-painel-administrativo)
- [Geração de QR Code e Totens de Mesa](#-gera%C3%A7%C3%A3o-de-qr-code-e-totens-de-mesa)
- [Deploy na Vercel](#-deploy-na-vercel)
- [Dicas para o Dia do Evento](#-dicas-para-o-dia-do-evento)

---

## ✨ Recursos Principais

### Para os Convidados (Público)
- **Acesso Instantâneo via QR Code:** O convidado aponta a câmera do celular no display da mesa e entra direto na experiência `/e/lorena-rayla-xv`.
- **Identificação Descomplicada:** Entrada rápida apenas com o nome e concordância com os termos, sem necessidade de cadastros lentos ou senhas.
- **Upload Múltiplo e em Tempo Real:** Envio de até 10 fotos e vídeos de uma só vez, com barra de progresso individual e preview das imagens.
- **Galeria Interativa:** Visualização em grade responsiva com animações cósmicas, filtros por fotos/vídeos e lightbox com reprodução de vídeo e download em alta qualidade.
- **Identidade Visual Temática ("Uma Noite Estrelada"):** Design premium com tons de azul meia-noite, violeta cósmico e detalhes em ouro estelar, com efeito interativo de constelações.

### Para a Anfitriã / Administradores
- **Autenticação Segura:** Login protegido via Supabase Auth.
- **Dashboard com Métricas em Tempo Real:** Total de fotos, vídeos, espaço de armazenamento utilizado e quantidade de convidados participantes.
- **Moderação Completa da Galeria:** Aprovação, rejeição ou exclusão de mídias enviadas, com histórico de auditoria.
- **Controle Dinâmico do Evento:** Ative/desative uploads a qualquer momento, configure limites de tamanho (MB) e altere a visibilidade da galeria (pública/privada).
- **Gerador de QR Code de Alta Resolução:** Prévia ao vivo, download em PNG (até 1200px), vetor SVG para gráficas e modo de **impressão direta para display de mesa (A4)**.

---

## 🛠 Arquitetura e Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) + React 19 + TypeScript | SSR, Rotas Dinâmicas e Client Components otimizados |
| **Estilização** | Tailwind CSS v4 + Vanilla CSS | Design system personalizado com glassmorphism e partículas estelares |
| **Backend** | Next.js API Routes (Serverless) | Rate limiting por IP, validação de MIME types e URLs assinadas |
| **Banco de Dados** | Supabase (PostgreSQL) | RLS (Row Level Security), triggers e índices otimizados |
| **Armazenamento** | Supabase Storage (`event-media`) | Bucket seguro com políticas de acesso e signed URLs |
| **Autenticação** | Supabase Auth | Sessão segura por cookies para o painel administrativo |
| **QR Code** | `qrcode` (PNG, SVG, Buffer) | Geração server-side e client-side em alta definição |

---

## 📂 Estrutura do Projeto

```
memorias-da-lorena/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Layout raiz e metadados SEO
│   │   ├── page.tsx                    # Landing page do evento (Hero, contadores, atalhos)
│   │   ├── globals.css                 # Variáveis de cor, glassmorphism e animações
│   │   ├── e/[slug]/page.tsx           # Ponto de entrada do QR Code de mesa
│   │   ├── identificacao/page.tsx      # Identificação do convidado
│   │   ├── enviar/page.tsx             # Área de upload com drag-and-drop e preview
│   │   ├── galeria/page.tsx            # Galeria colaborativa com lightbox
│   │   ├── admin/
│   │   │   ├── layout.tsx              # Layout administrativo com sidebar e proteção de rota
│   │   │   ├── login/page.tsx          # Login de administradores
│   │   │   ├── dashboard/page.tsx      # Dashboard com contadores e gráficos
│   │   │   ├── galeria/page.tsx        # Moderação de fotos (aprovar/rejeitar/excluir)
│   │   │   ├── configuracoes/page.tsx  # Configurações do evento em tempo real
│   │   │   └── qrcode/page.tsx         # Central de download e impressão de QR Code
│   │   └── api/
│   │       ├── upload/route.ts         # Endpoint de upload validado
│   │       ├── media/route.ts          # Listagem paginada da galeria
│   │       ├── media/[id]/...          # Download, thumbnail e signed-url
│   │       ├── admin/stats/route.ts    # Estatísticas do dashboard
│   │       ├── admin/moderate/route.ts # Ações de moderação com auditoria
│   │       ├── admin/event/route.ts    # Consulta e atualização de regras do evento
│   │       └── qrcode/route.ts         # Geração de PNG e SVG do QR Code
│   ├── components/ui/                  # Componentes reutilizáveis (StarField, Toast, Spinner)
│   ├── hooks/                          # Hooks customizados (useGuest, useUpload)
│   ├── lib/                            # Clientes Supabase, rate limiter, validações e QR Code
│   └── types/                          # Interfaces TypeScript e definições do banco
├── supabase/
│   └── migrations/
│       ├── 001_create_tables.sql       # Criação de tabelas, índices e dados iniciais
│       ├── 002_rls_policies.sql        # Políticas de segurança RLS
│       └── 003_storage_policies.sql    # Bucket de armazenamento e regras do storage
├── .env.example                        # Modelo de variáveis de ambiente
└── README.md
```

---

## 🚀 Instalação e Execução Local

### Pré-requisitos
- Node.js 18+ ou 20+
- Conta gratuita no [Supabase](https://supabase.com)

### 1. Clonar e instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie o arquivo de exemplo para `.env.local`:
```bash
cp .env.example .env.local
```

Abra `.env.local` e preencha as credenciais obtidas no seu painel do Supabase.

### 3. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🗄 Configuração do Supabase (Passo a Passo)

1. **Crie um novo projeto** no painel do [Supabase](https://supabase.com).
2. No menu lateral esquerdo, vá em **SQL Editor**.
3. Execute sequencialmente os scripts contidos em `supabase/migrations/`:
   - Cole e execute `001_create_tables.sql` (cria tabelas e insere o evento inicial).
   - Cole e execute `002_rls_policies.sql` (ativa segurança em todas as tabelas).
   - Cole e execute `003_storage_policies.sql` (cria o bucket `event-media` e regras de upload).
4. **Crie o usuário administrador**:
   - No menu lateral, acesse **Authentication** -> **Users**.
   - Clique em **Add User** -> **Create User**.
   - Digite um email (ex: `admin@lorena.com`) e uma senha forte.
   - Marque a opção "Auto Confirm User".
5. **Obtenha as chaves de API**:
   - Vá em **Project Settings** -> **API**.
   - Copie o **Project URL** para `NEXT_PUBLIC_SUPABASE_URL`.
   - Copie a chave **anon public** para `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Copie a chave **service_role secret** para `SUPABASE_SERVICE_ROLE_KEY`.

---

## 🛡 Painel Administrativo

- **Acesso:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Email e Senha:** O usuário criado no Supabase Auth.
- **Ações disponíveis:**
  - **Dashboard:** Acompanhe o fluxo de fotos enviadas em tempo real.
  - **Galeria:** Aprove ou delete fotos inadequadas antes que apareçam na galeria pública (se a moderação estiver ativada).
  - **Configurações:** Bloqueie uploads ao fim da festa, aumente ou diminua os limites de arquivo em MB.
  - **QR Code:** Exporte o QR Code em alta definição ou imprima plaquinhas de mesa.

---

## 📱 Geração de QR Code e Totens de Mesa

O sistema possui uma página dedicada para impressão em `/admin/qrcode`:
1. Acesse o menu **QR Code** no painel administrativo.
2. Você pode baixar:
   - **PNG (1200px):** Perfeito para enviar para designers ou gráficas.
   - **SVG:** Formato vetorial nítido em qualquer tamanho.
3. Ou clicar em **"Imprimir Plaquinha de Mesa (A4)"**:
   - O sistema gera automaticamente um cartão vertical com design elegante pronto para imprimir em papel couchê ou colocar em displays de acrílico nas mesas.

---

## 🌐 Deploy na Vercel

1. Suba o repositório para o seu **GitHub**.
2. Conecte sua conta na [Vercel](https://vercel.com) e importe o projeto.
3. Na seção **Environment Variables**, adicione as mesmas variáveis de `.env.example`:
   - `NEXT_PUBLIC_SITE_URL`: `https://seu-dominio.vercel.app`
   - `NEXT_PUBLIC_EVENT_SLUG`: `lorena-rayla-xv`
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://...supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `...`
   - `SUPABASE_SERVICE_ROLE_KEY`: `...`
4. Clique em **Deploy**. Sua aplicação estará online em segundos com certificado SSL gratuito!

---

## 💡 Dicas para o Dia do Evento

1. **Displays de Mesa:** Coloque ao menos uma plaquinha com QR Code em cada mesa de convidados e nas ilhas de buffet/bar.
2. **Moderação Dinâmica:** Durante o início da festa, você pode manter a moderação desativada para as fotos aparecerem imediatamente na galeria. Se houver necessidade, ative a moderação prévia com 1 clique no painel em `/admin/configuracoes`.
3. **Download Geral das Fotos:** No dia seguinte ao evento, você pode desativar o recebimento de novas mídias mantendo a galeria aberta para que os convidados apreciem as lembranças!
