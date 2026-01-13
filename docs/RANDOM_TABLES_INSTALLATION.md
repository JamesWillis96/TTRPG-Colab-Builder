# Random Tables - Installation & Setup Guide

## Files Created

### Database
- `docs/OFFICIAL_RANDOM_TABLES_SEED_DATA.sql` - 10 official tables (90+ entries) ready to import

### Documentation
- `docs/RANDOM_TABLES_FEATURE.md` - Full technical documentation
- `docs/RANDOM_TABLES_DESIGN_PHILOSOPHY.md` - Why/how the tables work
- `docs/RANDOM_TABLES_QUICK_REFERENCE.md` - How to use at the table
- `docs/RANDOM_TABLES_LAYOUT.md` - Visual design guide
- `docs/MIGRATE_RANDOM_TABLES.sql` - Database schema migration

### Application
- `app/tables/page.tsx` - Complete React component (already deployed)

---

## Installation Steps

### Step 1: Database Migration
Execute this in Supabase SQL Editor:

```sql
-- Copy from: docs/MIGRATE_RANDOM_TABLES.sql
```

This adds:
- New columns: `description`, `category`, `tags`, `is_official`, `created_at`
- Changes `entries` format from TEXT[] to JSONB
- Adds performance indexes
- Updates RLS policies

### Step 2: Load Official Tables
Execute this in Supabase SQL Editor:

```sql
-- Copy from: docs/OFFICIAL_RANDOM_TABLES_SEED_DATA.sql
```

This inserts 10 official tables with ~90 entries total.

**Note**: You must have at least one admin user in your profiles table. The SQL uses:
```sql
(SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
```

If this fails, either:
1. Create an admin user first, OR
2. Replace `admin` selection with a UUID of an existing user

### Step 3: Verify Installation
- Navigate to `/tables` in your app
- You should see the 10 official tables
- Click Category filters and select "NPCs"—you should see "NPCs with Hidden Stakes"
- Click one and expand (▼) to see entries
- Click "🎲 Roll" and verify results appear in the sidebar

### Step 4: Test Create Table
- Click "Create Table"
- Fill in form with test data
- Verify table appears in the list
- Test rolling on your custom table

---

## Database Schema

### random_tables table structure:
```sql
Column           | Type      | Purpose
-----------------+-----------+------------------------------------
id               | uuid      | Primary key
title            | text      | Table name (required)
description      | text      | What it generates (optional)
category         | varchar   | NPCs, Locations, Items, etc.
tags             | text[]    | Search/filter tags
entries          | jsonb     | [{"text": "...", "weight": 1}, ...]
is_official      | boolean   | Admin-created = true
created_by       | uuid      | FK to profiles
created_at       | timestamp | Auto-set to now()
```

### Entry object structure:
```json
{
  "text": "The Prancing Pony",
  "weight": 1
}
```

- `weight` optional, defaults to 1
- Higher weight = more likely to appear (proportional probability)

---

## Migration Verification Queries

Run these in Supabase SQL Editor to verify success:

### Check schema:
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'random_tables';
```

Should return columns including: id, title, description, category, tags, entries, is_official, created_by, created_at

### Check official tables loaded:
```sql
SELECT COUNT(*) as table_count, SUM(jsonb_array_length(entries)) as total_entries 
FROM random_tables 
WHERE is_official = true;
```

Should return: ~10 tables, ~90 entries

### Check indexes:
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'random_tables';
```

Should include: idx_random_tables_category, idx_random_tables_is_official, idx_random_tables_tags

### Check RLS policies:
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'random_tables';
```

Should include: Users can view all tables, Users can edit own tables, Users can create tables, etc.

---

## Troubleshooting

### Issue: "Error 42P01 - relation 'random_tables' does not exist"
**Cause**: Schema hasn't been created  
**Fix**: Run MIGRATE_RANDOM_TABLES.sql first

### Issue: Tables load but don't roll
**Cause**: Entries format is wrong (still TEXT[] instead of JSONB)  
**Fix**: Run the migration function in MIGRATE_RANDOM_TABLES.sql to convert existing tables

### Issue: "Permission denied" when creating tables
**Cause**: RLS policies not updated  
**Fix**: Re-run the policy updates from MIGRATE_RANDOM_TABLES.sql

### Issue: Official tables not appearing
**Cause**: Admin user not found  
**Fix**: Either:
```sql
-- Option 1: Create admin user
UPDATE profiles SET role = 'admin' WHERE id = 'your-uuid-here';

-- Option 2: Re-run seed data with different user
-- Edit SEED_DATA.sql, replace:
(SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
-- With:
'your-uuid-here'::uuid
```

### Issue: Categories not filtering correctly
**Cause**: Categories have wrong names  
**Fix**: Verify category values in seed data. Current valid categories:
```
'NPCs', 'Locations', 'Items', 'Events', 'Factions', 
'Mysteries', 'Rumors', 'Other'
```

### Issue: Search not finding tables with tags
**Cause**: GIN index not created  
**Fix**: Run this in SQL Editor:
```sql
CREATE INDEX IF NOT EXISTS idx_random_tables_tags ON random_tables USING GIN(tags);
```

---

## Customization

### Add Your Own Tables

Via the UI (simplest):
1. Go to `/tables`
2. Click "Create Table"
3. Fill in form
4. Done

Via SQL (for bulk import):
```sql
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES (
  'Your Table Name',
  'What it generates',
  'Category',
  ARRAY['tag1', 'tag2'],
  '[
    {"text": "entry one", "weight": 1},
    {"text": "entry two", "weight": 2}
  ]'::jsonb,
  FALSE,
  'your-user-uuid'::uuid
);
```

### Modify Official Tables

You can edit them like any other table if you're an admin:
1. Go to `/tables`
2. Click on an official table
3. Click the ✏️ edit button (only appears if you're admin)
4. Modify and save

Or via SQL:
```sql
UPDATE random_tables 
SET entries = '[{"text": "new entry", "weight": 1}]'::jsonb,
    description = 'Updated description'
WHERE title = 'NPCs with Hidden Stakes' AND is_official = true;
```

### Add Weights to Existing Entries

If you want to make certain entries more common:
```sql
UPDATE random_tables
SET entries = jsonb_set(
  entries,
  '{0,weight}',  -- Index 0, weight field
  '2'::jsonb      -- New weight value
)
WHERE title = 'Your Table Name';
```

---

## Usage Scenarios

### Solo Play (Learning)
1. Roll on "Story Hooks with Built-In Conflict"
2. Roll on "Locations with Built-In Conflict"
3. Roll on "NPCs with Hidden Stakes"
4. Spend 10 minutes connecting them into a scene
5. Play it out solo to understand the system

### GM Prep
1. Before session, roll on tables matching next plot point
2. Customize rolls to fit your campaign
3. Have 2-3 backup complications rolled as "if pacing stalls"
4. Print or bookmark the "Recent Rolls" for reference

### At-Table Improvisation
1. Party is stalling? Roll "Complications That Escalate"
2. Need a quick NPC? Roll "NPCs with Hidden Stakes"
3. Party wants to know what locals are talking about? Roll "Rumors That Blur Truth"
4. Drop the result naturally into conversation

### Campaign Escalation
1. Session 1: Use "Story Hooks" and "Locations"
2. Session 2-3: Add "Factions" and "Complications"
3. Mid-campaign: Introduce "Mysteries" and "Events"
4. Late-campaign: Use "Rumors" and contradictions for paranoia

---

## Performance Considerations

### Database
- Indexes on category, is_official, tags ensure fast filtering
- GIN index on tags enables quick tag searches
- JSONB entries optimized for queries

### Frontend
- Tables load once on mount, then cached in React state
- Search/filter happens client-side (fast)
- Rolling is instant (weighted random in JavaScript)
- History keeps last 20 rolls (prevents memory bloat)

### Optimization Tips
- Use category filters before search (narrows dataset)
- If you have 1000+ tables, consider pagination
- Consider archiving very old custom tables

---

## Backup & Export

### Backup official tables:
```sql
SELECT * FROM random_tables WHERE is_official = true;
```

Copy results, save as JSON or CSV.

### Export for sharing:
```sql
SELECT 
  title, 
  description, 
  category, 
  tags, 
  entries 
FROM random_tables 
WHERE is_official = false AND created_by = 'your-uuid'::uuid;
```

This format can be shared with other users who can manually import.

### Bulk import from JSON:
Use the SQL template above to INSERT multiple tables at once.

---

## Security Notes

### RLS is Enabled
- Users can only see all tables (SELECT allowed for everyone)
- Users can only edit/delete their own tables (unless admin)
- Admin users can edit/delete any table
- Table creation requires authentication

### API Calls Are Client-Side
- All queries use Supabase client directly
- No server middleware to bypass security
- RLS policies enforced at database level

### Data Validation
- Weight must be 1-100 (enforced in UI)
- Entries must have text (enforced in UI)
- Category must match defined list (enforced in UI)

---

## Monitoring

### Check table usage:
```sql
SELECT category, COUNT(*) FROM random_tables GROUP BY category;
```

### Find largest tables:
```sql
SELECT title, jsonb_array_length(entries) as entry_count 
FROM random_tables 
ORDER BY entry_count DESC 
LIMIT 10;
```

### Check recent activity:
```sql
SELECT title, created_by, created_at 
FROM random_tables 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Next Steps After Installation

1. ✅ Run migrations and seed data
2. ✅ Test at `/tables` page
3. 🔄 Create 1-2 custom tables to test creation
4. 📖 Read Quick Reference guide for usage patterns
5. 🎲 Start rolling in your next session
6. 📝 Create campaign-specific tables as needed

---

## Support Resources

- **Technical**: See RANDOM_TABLES_FEATURE.md
- **Usage**: See RANDOM_TABLES_QUICK_REFERENCE.md
- **Design**: See RANDOM_TABLES_DESIGN_PHILOSOPHY.md
- **Layout**: See RANDOM_TABLES_LAYOUT.md

---

**Installation Status**: Ready for deployment  
**Last Updated**: Jan 13, 2026  
**Version**: 1.0
