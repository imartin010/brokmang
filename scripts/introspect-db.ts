// scripts/introspect-db.ts
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Client } from "pg";

type Opts = { check: boolean };
const opts: Opts = { check: process.argv.includes("--check") };

const cnn =
  process.env.SUPABASE_DB_URL ??
  process.env.DATABASE_URL ??
  (() => { throw new Error("Missing SUPABASE_DB_URL or DATABASE_URL"); })();

const SCHEMAS = ["public"]; // extend if needed

async function main() {
  const pg = new Client({ connectionString: cnn });
  await pg.connect();

  // --- Core queries ---
  const tables = await pg.query<{
    table_schema: string; table_name: string; relrowsecurity: boolean;
    has_pkey: boolean;
  }>(`
    SELECT n.nspname AS table_schema,
           c.relname AS table_name,
           c.relrowsecurity,
           EXISTS (
             SELECT 1
             FROM pg_constraint pc
             WHERE pc.conrelid = c.oid AND pc.contype = 'p'
           ) AS has_pkey
    FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname = ANY($1::text[])
    ORDER BY n.nspname, c.relname;
  `, [SCHEMAS]);

  const columns = await pg.query<{
    table_schema: string; table_name: string; column_name: string;
    data_type: string; is_nullable: "YES"|"NO"; column_default: string | null;
    character_maximum_length: number | null; ordinal_position: number;
  }>(`
    SELECT table_schema, table_name, column_name, data_type, is_nullable,
           column_default, character_maximum_length, ordinal_position
    FROM information_schema.columns
    WHERE table_schema = ANY($1::text[])
    ORDER BY table_schema, table_name, ordinal_position;
  `, [SCHEMAS]);

  const constraints = await pg.query<{
    table_schema: string; table_name: string; constraint_name: string;
    constraint_type: "PRIMARY KEY"|"FOREIGN KEY"|"UNIQUE"|"CHECK";
    definition: string;
  }>(`
    SELECT tc.table_schema, tc.table_name, tc.constraint_name, tc.constraint_type,
           pg_get_constraintdef(con.oid) AS definition
    FROM information_schema.table_constraints tc
      JOIN pg_constraint con ON con.conname = tc.constraint_name
      JOIN pg_class c ON c.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE tc.table_schema = ANY($1::text[])
    ORDER BY tc.table_schema, tc.table_name, tc.constraint_type, tc.constraint_name;
  `, [SCHEMAS]);

  const indexes = await pg.query<{
    schemaname: string; tablename: string; indexname: string; indexdef: string;
  }>(`
    SELECT schemaname, tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = ANY($1::text[])
    ORDER BY schemaname, tablename, indexname;
  `, [SCHEMAS]);

  const policies = await pg.query<{
    schemaname: string; tablename: string; policyname: string;
    cmd: "SELECT"|"INSERT"|"UPDATE"|"DELETE"|"ALL";
    qual: string | null; with_check: string | null; roles: string | null;
    permissive: "PERMISSIVE"|"RESTRICTIVE";
  }>(`
    SELECT schemaname, tablename, policyname, cmd, qual::text, with_check::text, roles, permissive
    FROM pg_policies
    WHERE schemaname = ANY($1::text[])
    ORDER BY schemaname, tablename, policyname;
  `, [SCHEMAS]);

  // Suspicious policies (heuristic): self-table name inside qual/check OR typical risky helpers
  const smellPatterns = ["sales_agents", "user_org_ids", "EXISTS (SELECT", " IN (SELECT "];
  const policySmells = policies.rows.filter(p => {
    const t = `${p.qual ?? ""} ${p.with_check ?? ""}`.toLowerCase();
    return smellPatterns.some(s => t.includes(s.toLowerCase()));
  });

  // Unique indexes -> recommend duplicate checks
  const uniqueIndexMap = new Map<string, string[]>();
  for (const idx of indexes.rows) {
    if (idx.indexdef.includes(" UNIQUE INDEX ")) {
      const key = `${idx.schemaname}.${idx.tablename}`;
      const cols = Array.from(idx.indexdef.matchAll(/\(([^)]+)\)/g))[0]?.[1]
        ?.split(",").map(s => s.trim()).filter(Boolean) ?? [];
      uniqueIndexMap.set(key, [...(uniqueIndexMap.get(key) ?? []), cols.join(", ")]);
    }
  }

  // Build structured model
  const byTable = new Map<string, any>();
  for (const t of tables.rows) {
    const key = `${t.table_schema}.${t.table_name}`;
    byTable.set(key, {
      schema: t.table_schema,
      name: t.table_name,
      rls_enabled: t.relrowsecurity,
      has_pkey: t.has_pkey,
      columns: [] as any[],
      constraints: [] as any[],
      indexes: [] as any[],
      policies: [] as any[],
      unique_indexes: uniqueIndexMap.get(key) ?? [],
    });
  }

  for (const c of columns.rows) {
    const key = `${c.table_schema}.${c.table_name}`;
    byTable.get(key)?.columns.push(c);
  }
  for (const con of constraints.rows) {
    const key = `${con.table_schema}.${con.table_name}`;
    byTable.get(key)?.constraints.push(con);
  }
  for (const idx of indexes.rows) {
    const key = `${idx.schemaname}.${idx.tablename}`;
    byTable.get(key)?.indexes.push(idx);
  }
  for (const pol of policies.rows) {
    const key = `${pol.schemaname}.${pol.tablename}`;
    byTable.get(key)?.policies.push(pol);
  }

  // Markdown
  let md = `# Database Catalog\n\nGenerated: ${new Date().toISOString()}\n\n`;
  for (const [, t] of Array.from(byTable.entries()).sort()) {
    md += `## ${t.schema}.${t.name}\n`;
    md += `- RLS: **${t.rls_enabled ? "ENABLED" : "DISABLED"}**\n`;
    md += `- Primary Key: ${t.has_pkey ? "Yes" : "No"}\n`;
    if (t.unique_indexes.length) md += `- Unique Indexes: ${t.unique_indexes.map((u:string)=>"`"+u+"`").join(", ")}\n`;
    md += `\n### Columns\n`;
    md += `| # | Column | Type | Nullable | Default |\n|---|--------|------|----------|---------|\n`;
    for (const c of t.columns) {
      md += `| ${c.ordinal_position} | \`${c.column_name}\` | ${c.data_type}${c.character_maximum_length ? `(${c.character_maximum_length})` : ""} | ${c.is_nullable} | ${c.column_default ?? ""} |\n`;
    }
    if (t.constraints.length) {
      md += `\n### Constraints\n`;
      for (const c of t.constraints) {
        md += `- **${c.constraint_type}** \`${c.constraint_name}\`: ${c.definition}\n`;
      }
    }
    if (t.indexes.length) {
      md += `\n### Indexes\n`;
      for (const i of t.indexes) md += `- \`${i.indexname}\`: ${i.indexdef}\n`;
    }
    if (t.policies.length) {
      md += `\n### RLS Policies\n`;
      for (const p of t.policies) {
        md += `- **${p.policyname}** \`${p.cmd}\` (${p.permissive}) roles=${p.roles ?? "all"}\n`;
        if (p.qual) md += `  - USING: \`${p.qual}\`\n`;
        if (p.with_check) md += `  - WITH CHECK: \`${p.with_check}\`\n`;
      }
    }
    md += `\n---\n\n`;
  }

  // Smell report
  if (policySmells.length) {
    md += `## ⚠️ Policy Smells Detected\n`;
    for (const p of policySmells) {
      md += `- ${p.schemaname}.${p.tablename} → **${p.policyname}** \`${p.cmd}\`\n`;
    }
    md += `\n**Guideline:** Avoid self-table subqueries or functions that read the same table inside USING/WITH CHECK. Prefer direct \`auth.uid() = user_id\` checks.\n\n`;
  } else {
    md += `## ✅ No policy smells detected\n\n`;
  }

  // Write outputs
  mkdirSync("schema", { recursive: true });
  writeFileSync("schema/catalog.md", md);
  writeFileSync("schema/catalog.json", JSON.stringify({
    generatedAt: new Date().toISOString(),
    tables: Array.from(byTable.values()),
    policySmells: policySmells,
  }, null, 2));

  // --check mode: fail CI on smells or obvious risks
  if (opts.check) {
    const risky = policySmells.length > 0;
    if (risky) {
      console.error("RLS policy smells detected. See schema/catalog.md");
      process.exit(1);
    }
  }

  await pg.end();
  console.log("✔ Wrote schema/catalog.md and schema/catalog.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

