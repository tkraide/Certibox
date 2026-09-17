# CertiBox

Gestão pessoal de horas complementares e de extensão — Hackathon SeCoT XVIII (UFSCar).

O aluno envia certificados, acompanha o progresso das horas por categoria e gera
relatórios prontos para a coordenação. O professor aprova ou rejeita os
certificados pendentes. Autenticação, banco de dados e armazenamento de
arquivos rodam no Supabase.

## Perfis de acesso

O papel do usuário é resolvido pelo domínio do e-mail institucional
(`@estudante.ufscar.br` → aluno, `@ufscar.br` → professor) e muda o que a
pessoa vê:

- **Aluno**: Dashboard, Meus Certificados, Relatórios, Regulamentos e
  Configurações.
- **Professor**: a página inicial é **Gerenciar certificados** — lista os
  alunos com certificados pendentes e leva direto para a aprovação de cada
  um. O menu mostra só Gerenciar certificados, Regulamentos e Configurações;
  acesso direto às páginas exclusivas de aluno redireciona de volta.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **React 19**
- **Supabase** — Auth (Google OAuth + login anônimo "SIGA simulado"), Postgres
  com RLS e Storage (arquivos dos certificados)
- **Tailwind CSS 3.4** — dark mode por classe, cor primária `#ff6c29`
- **next-themes** — tema claro/escuro/sistema sem flash
- **jsPDF** / **JSZip** — geração de relatório em PDF e ZIP de certificados
- **Resend** — envio de relatório por e-mail (`app/api/send-report`)
- **Recharts** — gráfico de progresso por categoria
- **VLibras** — widget oficial de tradução para Libras
- **lucide-react** — ícones

## Rodando

```bash
npm install
cp .env.local.example .env.local   # preencha com os dados do seu projeto Supabase
npm run dev
```

Acesse http://localhost:3000. As chaves do Supabase ficam em **Project
Settings > API** no painel do projeto; `.env.local` já está no `.gitignore`.

## Funcionalidades

- **Dashboard** — progresso de horas por categoria (Complementares/Extensão),
  gráfico de barras, insights com sugestões de atividades.
- **Meus Certificados** — upload (imagem/PDF), status (pendente/aprovado/
  rejeitado), remoção, link compartilhável para o professor.
- **Aprovação (professor)** — via link compartilhável (`/certificados/
  compartilhado/[token]`) ou pela home "Gerenciar certificados": aprovar,
  rejeitar com motivo, histórico de decisões.
- **Relatórios** — PDF (imprimir/salvar ou enviar por e-mail), ZIP com todos
  os certificados, exportação CSV/Excel.
- **Configurações** — perfil e logout, tema (claro/escuro/sistema),
  acessibilidade, sobre o CertiBox.
- **Acessibilidade** — toolbar própria (fonte, alto contraste, redução de
  movimento), widget VLibras, foco visível na cor primária, HTML semântico e
  ARIA nas telas principais.

## Estrutura

```
src/
├── app/
│   ├── layout.tsx                          # Root layout: fonte, script anti-flash de a11y, ThemeProvider, AppShell
│   ├── globals.css                         # Foco visível, alto contraste, redução de movimento, escala de fonte
│   ├── page.tsx                            # "/" — Dashboard (aluno) ou Gerenciar certificados (professor)
│   ├── login/page.tsx
│   ├── certificados/
│   │   ├── page.tsx                        # Meus Certificados (só aluno)
│   │   └── compartilhado/[token]/page.tsx  # Página de aprovação (professor) / leitura (aluno dono)
│   ├── relatorios/page.tsx                 # Só aluno
│   ├── regulamentos/page.tsx
│   ├── configuracoes/page.tsx
│   ├── auth/callback/route.ts              # Callback do OAuth Google
│   └── api/send-report/route.ts            # Envio do relatório por e-mail (Resend)
├── components/
│   ├── layout/        # app-shell, header, page-header
│   ├── navigation/     # nav-items (fonte única dos links, filtrados por papel), sidebar, bottom-nav, brand
│   ├── home/           # home-content.tsx — decide Dashboard x Gerenciar certificados
│   ├── dashboard/      # summary-cards, category-meter, insights-panel
│   ├── certificates/   # upload, listagem, visualização, ações de revisão, link compartilhável
│   ├── teacher/        # teacher-review-content.tsx — lista de alunos pendentes
│   ├── reports/        # relatorios-page-content, report-dialog
│   ├── settings/       # perfil, tema, acessibilidade, sobre
│   ├── accessibility/  # toolbar, widget VLibras
│   ├── auth/           # login-form, user-menu, user-avatar, logout-button
│   └── ui/             # dialog (base para os modais)
├── hooks/              # use-auth, use-certificates, use-shared-certificates, use-pending-reviews,
│                       # use-student-only, use-accessibility-prefs, use-certificate-file-url
└── lib/
    ├── supabase/       # client, server, middleware, certificates (queries e RLS-aware helpers)
    ├── auth/roles.ts   # resolveRoleFromEmail
    └── hours/          # categories, aggregate, insights, export-csv, generate-report-pdf, types
```

## Banco de dados (Supabase)

Tabelas em `public`, todas com RLS habilitado:

| Tabela              | Conteúdo                                                              |
| ------------------- | ---------------------------------------------------------------------- |
| `profiles`           | Perfil por usuário (nome, e-mail, papel, `share_token` do link)       |
| `categories`         | As duas categorias de horas e seus limites (Complementares/Extensão)  |
| `certificates`       | Certificados enviados (categoria, carga horária, status, arquivo)     |
| `certificate_logs`   | Histórico de mudanças de status (quem, quando, motivo da rejeição)     |

Regra geral do RLS: aluno só lê/edita os próprios certificados; professor lê
todos os certificados e perfis, e só ele pode atualizar status
(`alterar_status_certificado`, que também grava o log). Arquivos ficam no
bucket privado `certificados` do Storage, servidos por signed URL.

## Tema e contraste (WCAG AA)

| Uso                          | Tema claro                          | Tema escuro                        |
| ---------------------------- | ------------------------------------ | ------------------------------------ |
| Fundo da página              | `neutral-50` / `white`               | `neutral-950`                        |
| Superfícies (cards, sidebar) | `white`                              | `neutral-900` / `neutral-950`        |
| Texto principal              | `neutral-900`                        | `neutral-100`                        |
| Texto secundário             | `neutral-600` (7.7:1)                | `neutral-400` (7.8:1)                |
| Texto laranja                | `primary-700` (5.3:1)                | `primary-400` (8.3:1)                |
| Botão primário               | fundo `primary-500` + texto `neutral-950` (7.4:1)                            |

`primary-500` (#ff6c29) sobre branco tem apenas ~2.8:1, por isso é usado só em ícones,
indicadores, bordas e fundos de botão — nunca como texto sobre fundo claro.

Estado ativo do menu é sinalizado por **ícone + texto + peso da fonte + barra lateral + `aria-current`**, nunca só por cor. O indicador de foco (Tab) usa `ring-primary-500` em ambos os temas.
