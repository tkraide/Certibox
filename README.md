# CertiBox

Gestão pessoal de horas complementares e de extensão — Hackathon SeCoT XVIII (UFSCar).

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS 3.4** — dark mode por classe, cor primária `#ff6c29`
- **next-themes** — alternância claro/escuro sem flash
- **lucide-react** — ícones

## Rodando

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

## Estrutura

```
src/
├── app/
│   ├── layout.tsx            # Root layout (fonte, ThemeProvider, AppShell)
│   ├── globals.css           # Base: foco visível, redução de movimento, escala de fonte
│   ├── page.tsx              # Dashboard
│   ├── certificados/page.tsx # Meus Certificados
│   ├── relatorios/page.tsx   # Relatórios
│   └── configuracoes/page.tsx# Configurações (Acessibilidade)
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx     # Sidebar + Header + main + BottomNav + skip link
│   │   ├── header.tsx        # Cabeçalho com botão de tema
│   │   └── page-header.tsx
│   ├── navigation/
│   │   ├── nav-items.ts      # Fonte única dos links do menu
│   │   ├── sidebar.tsx       # Menu lateral (desktop)
│   │   ├── bottom-nav.tsx    # Barra inferior (mobile)
│   │   └── brand.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
└── lib/utils.ts              # cn()
```

## Tema e contraste (WCAG AA)

| Uso                          | Tema claro                          | Tema escuro                        |
| ---------------------------- | ----------------------------------- | ---------------------------------- |
| Fundo da página              | `neutral-50` / `white`              | `neutral-950`                      |
| Superfícies (cards, sidebar) | `white`                             | `neutral-900` / `neutral-950`      |
| Texto principal              | `neutral-900`                       | `neutral-100`                      |
| Texto secundário             | `neutral-600` (7.7:1)               | `neutral-400` (7.8:1)              |
| Texto laranja                | `primary-700` (5.3:1)               | `primary-400` (8.3:1)              |
| Botão primário               | fundo `primary-500` + texto `neutral-950` (7.4:1)                        |

`primary-500` (#ff6c29) sobre branco tem apenas ~2.8:1, por isso é usado só em ícones,
indicadores, bordas e fundos de botão — nunca como texto sobre fundo claro.

Estado ativo do menu é sinalizado por **ícone + texto + peso da fonte + barra lateral + `aria-current`**, nunca só por cor.
