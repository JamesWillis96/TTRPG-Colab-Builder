# Random Tables Database Migration & Seed Data Guide

## Problem: Schema Mismatch (ERROR: 42804)

The seed data insertion failed with:
```
ERROR: 42804: column 'entries' is of type text[] but expression is of type jsonb
```

This means your `random_tables` table has the `entries` column defined as `TEXT[]` (text array), but the official seed data is trying to insert JSONB format.

## Solution Options

### Option 1: Use TEXT[] Seed Data (Quickest)

If your schema has `entries TEXT[]`, use the alternate seed data file:

**File:** `OFFICIAL_RANDOM_TABLES_SEED_DATA_TEXT_ARRAY.sql`

This version stores entries as simple text strings in an array format. The app will still render them correctly—at runtime, the UI treats all entries the same regardless of whether they're stored as TEXT[] or JSONB.

**Steps:**
1. Open Supabase SQL Editor
2. Copy entire contents of `OFFICIAL_RANDOM_TABLES_SEED_DATA_TEXT_ARRAY.sql`
3. Paste into SQL Editor
4. Click **RUN** (or Ctrl+Enter)
5. You should see: "INSERT 0 1" ten times (10 tables inserted)

### Option 2: Convert Schema to JSONB (Recommended for Future Flexibility)

If you want to support weighted entries and advanced features later, convert the schema first:

**File:** `QUICK_FIX_ENTRIES_TO_JSONB.sql`

This script:
- Converts `entries TEXT[]` → `entries JSONB` 
- Preserves existing data by converting each text entry to `{text: "...", weight: 1}`
- Recreates indexes and triggers
- Takes ~1 minute to run

**Steps:**
1. Open Supabase SQL Editor
2. Copy entire contents of `QUICK_FIX_ENTRIES_TO_JSONB.sql`
3. Paste into SQL Editor
4. Click **RUN**
5. You should see: "CREATE TRIGGER", "CREATE INDEX", etc. with no errors
6. Then run `OFFICIAL_RANDOM_TABLES_SEED_DATA.sql` (the original JSONB version)

---

## Quick Decision Matrix

| Scenario | Use This | Why |
|----------|----------|-----|
| "Just want it working now" | `OFFICIAL_RANDOM_TABLES_SEED_DATA_TEXT_ARRAY.sql` | No schema changes needed |
| "Want weighted entries later" | `QUICK_FIX_ENTRIES_TO_JSONB.sql` + original seed data | Supports future weight-based rolling |
| "Not sure what I have" | Check your schema first (see below) | Determines which path to take |

---

## How to Check Your Current Schema

Run this in Supabase SQL Editor to see your column type:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'random_tables' AND column_name = 'entries';
```

**Results interpretation:**
- If `data_type` is `text[]` → Use Option 1
- If `data_type` is `jsonb` → Use original `OFFICIAL_RANDOM_TABLES_SEED_DATA.sql`
- If `data_type` is `character varying[]` → Use Option 1

---

## File Summary

| File | Purpose | Schema Requirement | Format |
|------|---------|-------------------|--------|
| `OFFICIAL_RANDOM_TABLES_SEED_DATA.sql` | Load 10 tables (original) | `entries JSONB` | `[{text: "...", weight: 1}, ...]` |
| `OFFICIAL_RANDOM_TABLES_SEED_DATA_TEXT_ARRAY.sql` | Load 10 tables (alternate) | `entries TEXT[]` | `['entry 1', 'entry 2', ...]` |
| `QUICK_FIX_ENTRIES_TO_JSONB.sql` | Migrate schema TEXT[] → JSONB | Converts schema | Migration script |

---

## Recommended Workflow

**If your current schema is TEXT[]:**

```
Step 1: Run QUICK_FIX_ENTRIES_TO_JSONB.sql
        ↓
Step 2: Run OFFICIAL_RANDOM_TABLES_SEED_DATA.sql (original JSONB version)
        ↓
Step 3: Navigate to /tables in app
        ↓
Step 4: Verify all 10 tables appear ✅
```

**If you just want it working without schema changes:**

```
Step 1: Run OFFICIAL_RANDOM_TABLES_SEED_DATA_TEXT_ARRAY.sql
        ↓
Step 2: Navigate to /tables in app
        ↓
Step 3: Verify all 10 tables appear ✅
```

---

## Troubleshooting

### "ERROR: 42804" when running seed data
→ Your schema is TEXT[] but you're using the JSONB seed data
→ **Solution:** Use `OFFICIAL_RANDOM_TABLES_SEED_DATA_TEXT_ARRAY.sql`

### "ERROR: 22023: invalid input syntax for type json" when running seed data
→ Your schema is JSONB but your syntax is wrong
→ **Solution:** Make sure you're using the original `OFFICIAL_RANDOM_TABLES_SEED_DATA.sql`

### "ERROR: 23503: insert or update on table violates foreign key constraint"
→ No admin user exists in your `profiles` table
→ **Solution:** First run:
```sql
-- Find your user ID (replace with your actual user UUID):
SELECT id, email, role FROM profiles LIMIT 5;

-- Then make yourself admin:
UPDATE profiles SET role = 'admin' WHERE id = 'YOUR-UUID-HERE';

-- Then try the seed data again
```

### "ERROR: duplicate key value violates unique constraint"
→ You've already loaded some tables and are trying to insert duplicates
→ **Solution:** Delete existing tables first:
```sql
DELETE FROM random_tables WHERE is_official = TRUE;
```
Then re-run the seed data.

### App loads /tables but shows empty grid
→ Tables inserted but app can't see them (permission issue)
→ **Solution:** Check RLS policies on `random_tables` table:
```sql
-- View policies
SELECT * FROM pg_policies WHERE tablename = 'random_tables';

-- If empty, apply default policy:
ALTER TABLE random_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for all users" 
ON random_tables FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON random_tables FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');
```

---

## What the Seed Data Contains

The official tables include:

1. **NPCs with Hidden Stakes** — Characters with complex motivations
2. **Locations with Built-In Conflict** — Places with inherent tension
3. **Items with Consequences** — Magic items that want something
4. **Events with Political Ripples** — Changes that cascade through society
5. **Factions with Internal Fractures** — Organizations at odds with themselves
6. **Mysteries with No Clean Solution** — Puzzles without easy answers
7. **Rumors with Kernel of Truth** — Gossip that's partly real
8. **Complications That Escalate** — Obstacles that get worse
9. **Story Hooks with Built-In Conflict** — Scenarios with built-in tension
10. **Environmental Details with Implication** — Observations that hint at history

Each table has 9-11 carefully crafted entries following professional worldbuilding standards.

---

## Performance Notes

- Each seed data insert takes ~100ms
- Total migration time: ~1-2 seconds
- No downtime required (operations are atomic)
- Safe to run multiple times (will skip duplicates if you add unique constraint)

---

## Next Steps After Data Loads

1. **Visit /tables** — Confirm all 10 tables appear in the grid
2. **Test rolling** — Click 🎲 Roll button on a table
3. **Test filters** — Click category tabs to filter
4. **Test search** — Type in search box to find tables
5. **Test creation** — Create a custom table to ensure form works
6. **Read RANDOM_TABLES_QUICK_REFERENCE.md** — Learn GM workflow

---

## Questions or Issues?

Refer to:
- `RANDOM_TABLES_INSTALLATION.md` — Setup guide
- `RANDOM_TABLES_QUICK_REFERENCE.md` — Usage guide
- `RANDOM_TABLES_DESIGN_PHILOSOPHY.md` — Quality standards

