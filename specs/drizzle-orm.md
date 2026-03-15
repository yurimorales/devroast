# DevRoast - Drizzle ORM Specification

## Overview

- **Database**: PostgreSQL (via Docker Compose)
- **ORM**: Drizzle ORM
- **Environment**: Docker Compose para desenvolvimento local

## Database

### Docker Compose

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
      POSTGRES_DB: devroast
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Connection URL

```
postgresql://devroast:devroast@localhost:5432/devroast
```

---

## Tables

### 1. `submissions`

Armazena cada código submetido para análise.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY | Identificador único |
| `code` | `text` | NOT NULL | Código fonte submetido |
| `language` | `language_enum` | NOT NULL | Linguagem de programação |
| `score` | `decimal(2,1)` | NOT NULL, CHECK (0-10) | Nota de 0 a 10 |
| `roast_mode` | `boolean` | NOT NULL DEFAULT true | Se roast mode estava ativo |
| `status` | `submission_status_enum` | NOT NULL DEFAULT 'pending' | Status da análise |
| `ip_hash` | `varchar(64)` | | Hash IP para rate limiting anônimo |
| `created_at` | `timestamp` | NOT NULL DEFAULT NOW() | Data de criação |

### 2. `analyses`

Armazena cada issue/encontrado na análise do código.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY | Identificador único |
| `submission_id` | `uuid` | NOT NULL, FK → submissions.id | Referência à submissão |
| `severity` | `severity_enum` | NOT NULL | Nível de severidade |
| `message` | `text` | NOT NULL | Descrição do problema |
| `line_start` | `integer` | | Linha inicial (opcional) |
| `line_end` | `integer` | | Linha final (opcional) |
| `column_start` | `integer` | | Coluna inicial (opcional) |
| `column_end` | `integer` | | Coluna final (opcional) |
| `rule_code` | `varchar(50)` | | Código da regra violada |
| `created_at` | `timestamp` | NOT NULL DEFAULT NOW() | Data de criação |

### 3. `suggestions`

Armazena sugestões de correção (diff) para cada análise.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY | Identificador único |
| `analysis_id` | `uuid` | NOT NULL, FK → analyses.id | Referência à análise |
| `original_code` | `text` | NOT NULL | Trecho original |
| `fixed_code` | `text` | NOT NULL | Trecho corrigido |
| `explanation` | `text` | | Explicação da correção |
| `created_at` | `timestamp` | NOT NULL DEFAULT NOW() | Data de criação |

---

## Enums

### `language_enum`

```sql
CREATE TYPE language_enum AS ENUM (
  'javascript',
  'typescript',
  'python',
  'java',
  'csharp',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'sql',
  'html',
  'css',
  'json',
  'yaml',
  'markdown',
  'bash',
  'plaintext'
);
```

### `severity_enum`

```sql
CREATE TYPE severity_enum AS ENUM (
  'critical',
  'warning',
  'good'
);
```

### `submission_status_enum`

```sql
CREATE TYPE submission_status_enum AS ENUM (
  'pending',
  'analyzed',
  'error'
);
```

---

## Relationships

```
submissions (1) ──────< (N) analyses
analyses (1) ──────< (N) suggestions
```

---

## To-Do List

### Phase 1: Setup

- [ ] Criar `docker-compose.yml` com PostgreSQL
- [ ] Criar arquivo `.env` com `DATABASE_URL`
- [ ] Instalar dependências: `drizzle-orm`, `drizzle-kit`, `postgres`
- [ ] Criar `drizzle.config.ts` com configurações

### Phase 2: Schema Definition

- [ ] Criar arquivo `src/db/schema/submissions.ts`
- [ ] Criar arquivo `src/db/schema/analyses.ts`
- [ ] Criar arquivo `src/db/schema/suggestions.ts`
- [ ] Criar arquivo `src/db/schema/enums.ts`
- [ ] Criar arquivo `src/db/schema/index.ts` (exports)

### Phase 3: Database Operations

- [ ] Criar arquivo `src/db/index.ts` (db instance)
- [ ] Criar arquivo `src/db/submissions.ts` (CRUD)
- [ ] Criar arquivo `src/db/analyses.ts` (CRUD)
- [ ] Criar arquivo `src/db/suggestions.ts` (CRUD)
- [ ] Criar migrations com `drizzle-kit`

### Phase 4: Integration

- [ ] Integrar submissões com o CodeEditor existente
- [ ] Criar service de análise local (regras estáticas)
- [ ] Conectar ScoreRing com dados do banco
- [ ] Implementar Leaderboard com dados reais

### Phase 5: Polish

- [ ] Adicionar índices para performance (submissions.score, submissions.created_at)
- [ ] Configurar rate limiting via ip_hash
- [ ] Adicionar script de seed para testing

---

## File Structure

```
src/
  db/
    index.ts           # Database instance
    schema/
      index.ts         # Schema exports
      submissions.ts   # Submissions table
      analyses.ts      # Analyses table
      suggestions.ts   # Suggestions table
      enums.ts         # Enum definitions
    submissions.ts     # Submissions CRUD
    analyses.ts       # Analyses CRUD
    suggestions.ts    # Suggestions CRUD
  lib/
    analysis.ts        # Local static analysis logic
drizzle.config.ts
docker-compose.yml
.env
.env.example
```

---

## Notes

- **Análises locais**: Sem API externa, implementar regras estáticas (ex: detectar `var` em JS, `console.log` em produção, etc.)
- **Anónimo**: Sem autenticação, usar IP hash para rate limiting
- **Score calculation**: Implementar fórmula que combina数量 de critical/warnings/goods
