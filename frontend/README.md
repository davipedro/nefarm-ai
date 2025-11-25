# Nefarm AI - Frontend

Interface de pesquisa e extração de dados de gráficos científicos.

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Radix UI
- Sonner (Toast notifications)
- Lucide React (Ícones)

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Build

```bash
npm run build
npm start
```

## Estrutura

```
frontend/
├── app/
│   ├── globals.css      # Estilos globais + Tailwind config
│   ├── layout.tsx       # Layout raiz
│   └── page.tsx         # Página principal
├── components/
│   ├── ui/              # Componentes UI (shadcn/ui)
│   ├── Header.tsx       # Cabeçalho
│   └── ChatInterface.tsx # Interface de chat principal
└── lib/
    ├── mockData.ts      # Dados mockados para testes
    └── utils.ts         # Funções auxiliares
```

## Funcionalidades

### Implementado (Mockado)
- ✅ Busca de artigos científicos
- ✅ Exibição de lista de artigos
- ✅ Visualização de detalhes do artigo
- ✅ Lista de gráficos por artigo
- ✅ Extração de dados (simulada)
- ✅ Visualização de dados em tabela
- ✅ Exportação para CSV

### Próximos Passos
- 🔜 Integração com backend real (mcp_client)
- 🔜 Integração com Europe PMC API
- 🔜 Extração real de dados usando Gemini API

## Notas

Este frontend foi projetado para ser uma interface simples e focada, sem sidebar, em tela única, seguindo o padrão de chatbot.
