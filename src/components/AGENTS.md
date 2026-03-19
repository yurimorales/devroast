# components/ — Feature Components

Guia para componentes de feature em `src/components/` (não `ui/`).

## Estrutura

```
src/components/
├── ui/                   # Primitivos reutilizáveis (ver ui/AGENTS.md)
├── navbar.tsx            # Navegação principal
├── code-editor.tsx       # Editor de código
├── metrics.tsx           # Métricas da homepage
├── leaderboard.tsx       # Lista de melhores
└── [feature].tsx         # Componentes específicos de feature
```

## Regras

1. **Feature components** vão em `src/components/`, não em `ui/`
2. **UI primitives** (Button, Badge, Card, etc.) vão em `src/components/ui/`
3. Componentes complexos podem usar composição com sub-componentes
4. Manter componentes focados — cada arquivo = 1 responsabilidade

## Exemplo: Componente Feature

```tsx
// src/components/code-editor.tsx
"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/ui/code-block";
import { LanguageSelector } from "./language-selector";

interface CodeEditorProps {
  initialCode?: string;
  onSubmit: (code: string, language: string) => void;
}

export function CodeEditor({ initialCode, onSubmit }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode ?? "");
  const [language, setLanguage] = useState("typescript");

  return (
    <div className="flex flex-col gap-4">
      <LanguageSelector value={language} onChange={setLanguage} />
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="min-h-[300px] font-mono text-sm"
      />
      <button onClick={() => onSubmit(code, language)}>Submit</button>
    </div>
  );
}
```

## Composicao vs Primitivos

| Tipo | Local | Exemplo |
|------|-------|---------|
| Primitivo reutilizável | `components/ui/` | Button, Badge, Card |
| Feature/composição | `components/` | CodeEditor, Metrics, Leaderboard |
