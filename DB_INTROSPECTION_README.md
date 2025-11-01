# Database Introspection System

This project includes automated database schema introspection and RLS policy smell detection.

## Setup

### 1. Environment Variables

Add to `.env.local` (never commit real secrets):

```env
SUPABASE_DB_URL=postgresql://postgres:<SERVICE_ROLE_PASSWORD>@<HOST>:5432/postgres
```

**How to get the connection string:**
1. Go to Supabase Dashboard → Project Settings → Database
2. Find "Connection string" section
3. Select "URI" tab
4. Copy the connection string and replace `[YOUR-PASSWORD]` with your service role password

### 2. Install Dependencies

Already installed:
- `tsx` - TypeScript execution
- `@types/node` - Node.js types
- `pg` - PostgreSQL client

### 3. Optional: Create Helper Views

Run `supabase/introspection-views.sql` in Supabase SQL Editor once to create helper views:

```sql
-- Creates introspection.table_overview and introspection.policy_smells views
```

## Usage

### Generate Schema Documentation

```bash
npm run db:introspect
```

This generates:
- `schema/catalog.md` - Human-readable markdown documentation
- `schema/catalog.json` - Machine-readable JSON for tooling

### Check for Policy Smells

```bash
npm run db:check
```

Exits with code 1 if suspicious RLS policies are detected. Use in CI to fail builds on risky patterns.

### What Gets Documented

For each table:
- **Schema and name**
- **RLS status** (enabled/disabled)
- **Primary key** presence
- **All columns** with types, nullability, defaults
- **Constraints** (PK, FK, UNIQUE, CHECK)
- **Indexes** including unique indexes
- **RLS policies** with USING and WITH CHECK clauses

### Policy Smell Detection

The system flags policies with:
- Self-table references (table name appears in its own policy)
- Subquery patterns (`IN (SELECT ...)`, `EXISTS (SELECT ...)`)
- Specific function calls (`user_org_ids`, etc.)

**Example of a "smell":**
```sql
-- ❌ BAD: Policy queries the same table it protects
CREATE POLICY "agents_select_org"
  ON sales_agents FOR SELECT
  USING (org_id IN (SELECT org_id FROM sales_agents WHERE user_id = auth.uid()));
```

**Better approach:**
```sql
-- ✅ GOOD: Direct user_id check or use a helper function
CREATE POLICY "agents_select_own"
  ON sales_agents FOR SELECT
  USING (user_id = auth.uid());
```

## CI/CD Integration

GitHub Actions workflow (`.github/workflows/db-check.yml`) runs automatically on:
- Pushes to `main` and `develop`
- Pull requests to `main` and `develop`

**Setup:**
1. Add `SUPABASE_DB_URL` secret to GitHub repository settings
2. Workflow will fail CI if policy smells are detected
3. Schema catalog is uploaded as artifact for review

## Output Files

### `schema/catalog.md`

Human-readable documentation with:
- Tables grouped by schema
- Column details in markdown tables
- Constraint definitions
- Index listings
- Policy details with USING/WITH CHECK clauses
- Policy smell warnings at the end

### `schema/catalog.json`

Structured JSON with:
```json
{
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "tables": [...],
  "policySmells": [...]
}
```

## Maintenance

- **Commit `schema/catalog.md`** to track schema changes over time
- **Review policy smells** regularly and refactor risky policies
- **Update `SCHEMAS` array** in `scripts/introspect-db.ts` if using non-public schemas
- **Adjust smell patterns** in `smellPatterns` array for custom detection rules

## Troubleshooting

### Connection Error

```
Error: Missing SUPABASE_DB_URL or DATABASE_URL
```

**Fix:** Ensure `.env.local` contains `SUPABASE_DB_URL`

### Permission Denied

```
error: permission denied for schema public
```

**Fix:** Use service role connection string, not anon key

### No Tables Found

**Fix:** Check `SCHEMAS` array in `scripts/introspect-db.ts` includes your schema names

## Best Practices

1. **Run introspection before major schema changes** to document current state
2. **Fix policy smells proactively** to avoid RLS performance issues
3. **Use direct checks** (`auth.uid() = user_id`) instead of subqueries when possible
4. **Document exceptions** if a "smelly" policy is intentionally complex
5. **Keep catalog in version control** to track schema evolution

