# Feature: Roast - Análise de Código via IA

## 1. Requisito Confirmado

Permitir que o usuário envie trechos de código para análise sarcástica (roast mode) ou construtiva, utilizando Google Gemini como motor de IA. O resultado é armazenado no banco de dados e exibido em uma página de resultado.

## 2. Abordagem

### Arquitetura

```
User (HomeEditor)
    │
    ▼
tRPC Mutation (createRoast)
    │
    ▼
AI Service (Gemini via .env)
    │
    ▼
Database (submissions + analyses)
    │
    ▼
Roast Result Page (/roast/[id])
```

### Fluxo

1. Usuário digita código no editor + seleciona roastMode
2. Mutation cria submission (status: pending)
3. Chama Gemini com prompt conforme roastMode
4. Parse da resposta → cria analyses + score
5. Atualiza submission (status: analyzed)
6. Client recebe id → router.push('/roast/[id]')
7. Página busca dados reais do DB

## 3. Detalhes Técnicos

### Configuração

**.env.example**:
```
GEMINI_API_KEY=your_api_key_here
```

**.env** (não versionado):
```
GEMINI_API_KEY=AIzaSyAHvlRroztgj0Gbm1FJii48tIQOvsPaLis
```

### tRPC Procedures

**createRoast** (mutation):
- Input: `{ code, language, roastMode }`
- Output: `{ id }`

**getRoast** (query):
- Input: `{ id }`
- Output: `{ submission, analyses }`

### Schema (existente)

- **submissions**: id, code, language, score, roastMode, status, createdAt
- **analyses**: id, submissionId, severity, message, lineStart, lineEnd, ruleCode

### Prompts Gemini

**Roast Mode (sarcástico)**:
```
Analyze this code and provide a humorous, sarcastic roast.
Respond with JSON:
{
  "score": 0-10 (lower = worse),
  "title": "short sarcastic title",
  "analyses": [
    {
      "severity": "critical|warning|good",
      "message": "sarcastic comment",
      "line": line number (optional)
    }
  ]
}
```

**Normal Mode (construtivo)**:
```
Analyze this code constructively.
Respond with JSON:
{
  "score": 0-10 (higher = better),
  "title": "constructive feedback title",
  "analyses": [
    {
      "severity": "critical|warning|good",
      "message": "helpful suggestion",
      "line": line number (optional)
    }
  ]
}
```

## 4. Tasks de Implementação

### Fase 1: Configuração
- [ ] Criar .env com GEMINI_API_KEY
- [ ] Criar .env.example

### Fase 2: Backend
- [ ] Adicionar createRoast mutation em _app.ts
- [ ] Adicionar getRoast query em _app.ts
- [ ] Criar serviço Gemini em lib/ai/gemini.ts

### Fase 3: Frontend Integration
- [ ] Conectar HomeEditor botão ao mutation
- [ ] Implementar router.push após mutation
- [ ] Atualizar /roast/[id] para buscar dados reais

---

## Referências

- Schema: src/db/schema/submissions.ts, analyses.ts
- tRPC: src/server/routers/_app.ts
- Editor: src/components/code-editor.tsx
- Toggle: src/components/ui/toggle.tsx