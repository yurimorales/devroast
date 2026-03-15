# Implementação do tRPC

## 1. Requisito Confirmado

O projeto DevRoast precisa de uma camada de API type-safe para comunicação entre frontend e backend. O Next.js App Router requer uma integração específica com tRPC que suporte React Server Components (RSC) e Server Side Rendering (SSR).

---

## 2. Abordagem

Utilizar o tRPC v11 com integração TanStack React Query, configurando:
- **Backend**: API route handlers do Next.js com fetch adapter
- **Server Components**: Prefetch de queries com hydration
- **Client Components**: Hooks do TanStack React Query via tRPC provider
- **Type Safety**: Compartilhamento de tipos entre backend e frontend

### Arquitetura

```
src/
├── app/api/trpc/[trpc]/route.ts   # API handler
├── server/                         # Backend tRPC
│   ├── init.ts                    # Configuração tRPC
│   ├── query-client.ts            # QueryClient factory
│   ├── server.ts                  # Server components helpers
│   └── routers/                   # Routers da aplicação
│       └── _app.ts               # AppRouter principal
└── lib/
    └── trpc/                      # Client tRPC
        └── client.ts              # Provider para client components
```

---

## 3. Detalhes Técnicos

### Dependências necessárias

```bash
pnpm add @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query zod server-only client-only superjson
```

### Configurações importantes

- **QueryClient**: Criar um por request no server, singleton no browser
- **Hydration**: Usar `HydrationBoundary` para SSR
- **Prefetch**: `prefetchQuery` ou `fetchQuery` em Server Components
- **Cache**: `staleTime` configurado para evitar refetch imediato
- **Transformers**: superjson para serialização de datas/dados complexos

### Alternativas consideradas

- **Server Actions**: Mais simples, mas menos type-safe
- **API Routes REST**: Mais trabalho manual, sem type safety
- **GraphQL**: Overkill para este projeto

---

## 4. Tasks de Implementação

### Fase 1: Instalação e Configuração Base
- [ ] Instalar dependências do tRPC e TanStack Query
- [ ] Criar `src/server/init.ts` com `initTRPC` e context
- [ ] Criar `src/server/query-client.ts` com factory

### Fase 2: Backend API
- [ ] Criar router exemplo em `src/server/routers/_app.ts`
- [ ] Criar API route em `src/app/api/trpc/[trpc]/route.ts`
- [ ] Configurar superjson como transformer

### Fase 3: Client Setup
- [ ] Criar `src/lib/trpc/client.tsx` com TRPCProvider
- [ ] Integrar provider no `src/app/layout.tsx`
- [ ] Criar helper `getQueryClient` para Server Components

### Fase 4: Utilização
- [ ] Criar exemplo de query em Server Component
- [ ] Criar exemplo de mutation em Client Component
- [ ] Testar hydration SSR

---

## 5. Referências

- [tRPC Server Components](https://trpc.io/docs/client/tanstack-react-query/server-components)
- [tRPC Setup](https://trpc.io/docs/client/tanstack-react-query/setup)
- [TanStack Query SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
