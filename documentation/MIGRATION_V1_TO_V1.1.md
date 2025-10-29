# 🔄 Migration Guide: v1.0 → v1.1

## ⚠️ Breaking Changes

### 1. Team Structure Changed

**v1.0 Structure:**
```
sales_agents
├── team_leader_id (references sales_agents.id)
```

**v1.1 Structure:**
```
sales_agents
├── org_id (references organizations.id)
├── branch_id (references branches.id)
├── team_id (references teams.id)

teams
├── team_leader_id (references sales_agents.id)
```

### 2. Required Frontend Updates

The following files need updating to work with v1.1:

#### Files Requiring Updates:
- `app/crm/sales/page.tsx` - Uses old `team_leader_id`
- `components/crm/agent-form-dialog.tsx` - Uses old `team_leader_id`
- `components/crm/agents-table.tsx` - Uses old `team_leader_id`
- `app/crm/teams/[teamLeaderId]/page.tsx` - Uses old structure
- `components/crm/team-card.tsx` - Uses old structure

### 3. Quick Fix Options

**Option A: Backward Compatibility (Temporary)**
Keep using v1.0 CRM pages until v1.1 CRM pages are updated.

**Option B: Update CRM Pages (Recommended)**
Refactor CRM pages to use new team structure:
- Filter agents by `team_id` instead of `team_leader_id`
- Load team data to get team leader
- Update forms to select team instead of team leader

**Option C: Dual Schema (Migration Period)**
Add a view or computed field for backward compatibility.

---

## 🚀 Recommended Migration Path

### Phase 1: Database (DONE ✅)
- [x] Run schema-v1_1.sql
- [x] Run rls-v1_1.sql

### Phase 2: Data Migration (TODO)
```sql
-- Create default team for existing agents
INSERT INTO teams (org_id, name)
SELECT DISTINCT org_id, 'Default Team'
FROM sales_agents
WHERE team_id IS NULL AND org_id IS NOT NULL;

-- Assign agents to default team
UPDATE sales_agents sa
SET team_id = (
  SELECT t.id FROM teams t 
  WHERE t.org_id = sa.org_id 
  AND t.name = 'Default Team'
  LIMIT 1
)
WHERE team_id IS NULL AND org_id IS NOT NULL;
```

### Phase 3: Frontend Update (TODO)
Update the 5 CRM files to use new structure.

---

## 📝 Current Status

**Database:** ✅ v1.1 schema active  
**Frontend:** ⚠️ Still using v1.0 structure  
**Recommendation:** Complete v1.1 CRM page updates

---

## 🔧 Temporary Workaround

For now, the existing v1.0 CRM pages will have type errors but can still function if you:

1. Add `team_leader_id` back to `SalesAgent` type temporarily
2. Create a database view for backward compatibility
3. Or wait for full v1.1 CRM page updates

**This is a known issue and will be resolved in the complete Phase-2 implementation.**

---

**Last Updated:** January 2025

