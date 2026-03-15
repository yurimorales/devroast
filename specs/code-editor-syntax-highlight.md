# Especificação: Editor de Código com Syntax Highlight

## 1. Requisito Confirmado

**Modo de operação**: Editor editável com highlight em tempo real (como um IDE).

Isso significa que precisamos de uma biblioteca de editor de código completa, não apenas rendering de syntax highlight estático.

---

## 2. Abordagem do Ray So (Referência)

O Ray So usa uma abordagem inteligente de **textarea + overlay de highlight**:

```
┌─────────────────────────────┐
│  HighlightedCode (behind)   │  ← Shiki renderiza HTML com cores
│  <pre><code>...</code></pre>│
├─────────────────────────────┤
│  Textarea (transparent)     │  ← Input do usuário
│  (texto transparente)       │
└─────────────────────────────┘
```

**Como funciona:**
1. `textarea` fica em cima com texto transparente
2. `HighlightedCode` fica atrás com o código renderizado pelo Shiki
3. O usuário digita no textarea, mas vê as cores do componente atrás

**Benefícios:**
- Editor nativo com todas as funcionalidades (tab, enter, seleção, etc)
- Performance boa (highlight é renderizado de forma assíncrona)
- Mesma qualidade visual do VS Code (shiki)

---

## 3. Recomendação de Implementação

### Biblioteca recomendada: **Shiki** (já está no projeto)

O projeto já usa Shiki no `CodeBlock`. A abordagem será:

1. **Highlighting**: Shiki (mesma engine do VS Code)
2. **Detecção de linguagem**: `highlight.js` (para auto-detecção)
3. **UI**: Textarea + Overlay (como Ray So)

### Componentes necessários:

- `CodeEditor` (reimplementar): Textarea + Highlight overlay
- `LanguageSelector`: Dropdown para selecionar linguagem
- `useLanguageDetection`: Hook para detectar linguagem automaticamente

---

## 4. Detecção Automática de Linguagem

### Opções:

1. **highlight.js** (`highlightAuto`): ~60-80% acurácia, leve
2. **@vscode/vscode-languagedetection**: ML-based, ~93% acurácia (mesmo do VS Code)
3. **Heurísticas simples**: shebang, imports, keywords (fallback)

### Recomendação:

Combinar **highlight.js** (detecção primária) + heurísticas (fallback).

---

## 5. Tasks de Implementação

### Fase 1: Infraestrutura
- [x] Install `highlight.js` 
- [x] Criar utilitário de detecção de linguagem

### Fase 2: Editor com Highlight
- [x] Reimplementar `CodeEditor` com abordagem textarea + overlay
- [x] Integrar Shiki para renderizar código com cores
- [x] Sincronizar scroll entre textarea e highlight

### Fase 3: Detecção Automática
- [x] Adicionar detecção automática ao colar código
- [x] Conectar com `LanguageSelector` (dropdown)
- [x] Permitir override manual da linguagem

### Fase 4: UI/UX
- [x] Adicionar `LanguageSelector` no header do editor
- [x] Mostrar linguagem detectada vs selecionada
- [ ] Debounce na detecção

---

## 6. Referências

- [Ray So Editor.tsx](https://github.com/raycast/ray-so/blob/main/app/(navigation)/(code)/components/Editor.tsx)
- [Ray So HighlightedCode.tsx](https://github.com/raycast/ray-so/blob/main/app/(navigation)/(code)/components/HighlightedCode.tsx)
- [Shiki Docs](https://shiki.matsu.io)
- [highlight.js](https://highlightjs.org)
