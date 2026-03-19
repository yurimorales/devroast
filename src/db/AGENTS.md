# db/ — Drizzle ORM

Guia para schema, migrations e operações de banco.

## Estrutura

```
src/db/
├── index.ts              # Instância do cliente
├── schema/
│   ├── index.ts          # Exports do schema
│   ├── enums.ts          # Definições de enums
│   ├── submissions.ts    # Tabela submissions
│   ├── analyses.ts       # Tabela analyses
│   └── suggestions.ts    # Tabela suggestions
├── submissions.ts         # CRUD submissions
├── analyses.ts           # CRUD analyses
└── suggestions.ts        # CRUD suggestions
```

## Schema

### Definir tabelas com Drizzle

```ts
// src/db/schema/submissions.ts
import { pgTable, uuid, text, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";

export const languageEnum = pgEnum("language_enum", [
  "javascript",
  "typescript",
  "python",
  // ...
]);

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull(),
  language: languageEnum("language").notNull(),
  score: decimal("score", { precision: 2, scale: 1 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

### Enums

```ts
// src/db/schema/enums.ts
import { pgEnum } from "drizzle-orm/pg-core";

export const severityEnum = pgEnum("severity_enum", [
  "critical",
  "warning", 
  "good",
]);

export const submissionStatusEnum = pgEnum("submission_status_enum", [
  "pending",
  "analyzed",
  "error",
]);
```

## CRUD Operations

```ts
// src/db/submissions.ts
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createSubmission(data: {
  code: string;
  language: string;
  score: number;
}) {
  return db.insert(submissions).values(data).returning();
}

export async function getSubmission(id: string) {
  return db.query.submissions.findFirst({
    where: eq(submissions.id, id),
  });
}
```

## Migrations

```bash
# Gerar migration
pnpm drizzle-kit generate

# Aplicar migrations
pnpm drizzle-kit migrate

# Push schema (desenvolvimento)
pnpm drizzle-kit push
```

## Connection URL

```
postgresql://devroast:devroast@localhost:5432/devroast
```

Configure em `.env`:
```
DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast
```

## Regras

- Usar `pgTable` para tabelas PostgreSQL
- UUIDs para IDs: `.primaryKey().defaultRandom()`
- Timestamps: `.notNull().defaultNow()`
- Queries via `db.query.<table>` (Drizzle Query API)
- Enums via `pgEnum` para tipo safety
