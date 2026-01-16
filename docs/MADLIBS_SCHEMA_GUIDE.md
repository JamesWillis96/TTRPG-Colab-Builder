# Mad Libs Database Schema - Setup Guide

**Status:** ✅ Schema + Seed Data Complete  
**Created:** January 16, 2026

## Overview

The Mad Libs feature uses three main database tables:

1. **madlib_templates** - Template definitions with blanks
2. **madlib_fills** - User's fills (drafts and completed)
3. Database utilities and RLS policies

## Files

- `MADLIBS_MIGRATION.sql` - Creates tables, indexes, RLS policies, helper functions
- `MADLIBS_SEED_DATA.sql` - Populates 8 official templates

## Quick Setup

### Step 1: Run Main Migration
```sql
-- In your Supabase SQL editor:
\i docs/MADLIBS_MIGRATION.sql
```

This creates:
- ✅ `madlib_templates` table
- ✅ `madlib_fills` table
- ✅ 5 indexes on templates (category, difficulty, is_official, created_by, created_at)
- ✅ 5 indexes on fills (user_id, template_id, is_draft, saved_at, compound user_draft)
- ✅ GIN index for tone array search
- ✅ RLS policies for both tables
- ✅ Helper functions (is_admin, soft_delete_madlib_template, soft_delete_madlib_fill)

### Step 2: Run Seed Data
```sql
-- In your Supabase SQL editor:
\i docs/MADLIBS_SEED_DATA.sql
```

This inserts:
- ✅ 3 NPC templates (simple/moderate/complex)
- ✅ 2 Encounter templates (simple/moderate)
- ✅ 1 Item template (simple)
- ✅ 1 Location template (simple)
- ✅ 1 Session Hook template (simple)

**Total: 8 official templates across 5 categories**

## Table Structures

### madlib_templates

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| title | text | Template name |
| description | text | What it generates |
| category | varchar | NPCs, Encounters, Items, Locations, Session Hooks |
| difficulty | varchar | simple, moderate, complex |
| tone | text[] | ["dramatic", "personal", etc] |
| stakes | varchar | low, medium, high |
| template_text | text | Raw template with [BLANK_ID] markers |
| blanks | jsonb | Array of MadLibBlank objects (constraints, examples, etc) |
| notes | text | Design philosophy & creative constraints |
| example_fill | jsonb | { BLANK_ID: "example value", ... } |
| is_official | boolean | true = curated, false = user-created |
| created_by | uuid | FK to profiles |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-updated |
| deleted_at | timestamp | Soft delete (NULL if active) |
| deleted_by | uuid | Who soft-deleted |

### madlib_fills

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| template_id | uuid | FK to madlib_templates |
| user_id | uuid | FK to profiles (who filled it) |
| answers | jsonb | { BLANK_ID: { value: "...", rolled: true/false }, ... } |
| output | text | Final rendered template |
| is_draft | boolean | true = unsaved, false = completed |
| saved_to_wiki_id | uuid | FK to wiki_pages (if exported) |
| saved_at | timestamp | When saved |
| updated_at | timestamp | Last updated |
| deleted_at | timestamp | Soft delete |
| deleted_by | uuid | Who soft-deleted |

### Blank Objects (JSONB format)

**Structure in madlib_templates.blanks:**
```json
[
  {
    "id": "CHARACTER_NAME",
    "name": "Character Name",
    "type": "creative|constrained|consequence|specific",
    "description": "What this blank is for",
    "constraints": ["array of constraints"],
    "examples": ["example 1", "example 2"],
    "allowRoll": true/false,
    "reuseCount": 2
  },
  ...
]
```

**Structure in madlib_fills.answers:**
```json
{
  "CHARACTER_NAME": {
    "value": "Cassian Voss",
    "rolled": false
  },
  "ROLE": {
    "value": "Spicemaster",
    "rolled": true
  }
}
```

## Row Level Security (RLS)

### madlib_templates Policies

| Policy | Access |
|--------|--------|
| Official templates | Public READ |
| Non-deleted templates | Authenticated READ |
| Update own | Owner + Admin UPDATE |
| Delete own | Owner + Admin DELETE |
| Create template | Authenticated INSERT |

### madlib_fills Policies

| Policy | Access |
|--------|--------|
| Read own fills | Owner SELECT |
| Create fill | Authenticated INSERT (own user_id) |
| Update own | Owner UPDATE |
| Delete own | Owner DELETE |

## Indexes (Performance)

### On madlib_templates:
- `idx_madlib_templates_category` - Fast filtering by category
- `idx_madlib_templates_difficulty` - Fast filtering by difficulty
- `idx_madlib_templates_is_official` - Separate official/user templates
- `idx_madlib_templates_created_by` - Find user's templates
- `idx_madlib_templates_created_at` - Order by newest first
- `idx_madlib_templates_tone` (GIN) - Search by tone arrays

### On madlib_fills:
- `idx_madlib_fills_user_id` - User's all fills
- `idx_madlib_fills_template_id` - Fills for a template
- `idx_madlib_fills_is_draft` - Draft vs completed
- `idx_madlib_fills_saved_at` - Recent saves first
- `idx_madlib_fills_user_draft` - User's drafts (compound)

## Helper Functions

### `is_admin(user_id UUID) → BOOLEAN`
Checks if user role is 'admin' in profiles table.

### `soft_delete_madlib_template(template_id, deleting_user_id)`
Marks template as deleted. Only creator or admin can delete.

### `soft_delete_madlib_fill(fill_id, deleting_user_id)`
Marks fill as deleted. Only owner or admin can delete.

## Usage Examples

### Create a Template (Client Code)

```typescript
const { data, error } = await supabase
  .from('madlib_templates')
  .insert({
    title: 'My Custom Template',
    category: 'NPCs',
    difficulty: 'simple',
    tone: ['dramatic'],
    stakes: 'medium',
    template_text: '# [NAME]...',
    blanks: [{ id: 'NAME', ... }],
    is_official: false,
    created_by: user.id
  })
```

### Save a Fill (Draft)

```typescript
const { data, error } = await supabase
  .from('madlib_fills')
  .insert({
    template_id: templateId,
    user_id: user.id,
    answers: {
      CHARACTER_NAME: { value: 'Cassian Voss', rolled: false },
      ROLE: { value: 'Spicemaster', rolled: true }
    },
    is_draft: true
  })
```

### Complete a Fill

```typescript
const { data, error } = await supabase
  .from('madlib_fills')
  .update({
    output: '# Cassian Voss...',
    is_draft: false,
    saved_to_wiki_id: wikiPageId
  })
  .eq('id', fillId)
```

### Get User's Drafts

```typescript
const { data, error } = await supabase
  .from('madlib_fills')
  .select('*')
  .eq('user_id', user.id)
  .eq('is_draft', true)
  .order('saved_at', { ascending: false })
```

### Get Official Templates in Category

```typescript
const { data, error } = await supabase
  .from('madlib_templates')
  .select('*')
  .eq('category', 'NPCs')
  .eq('is_official', true)
  .is('deleted_at', null)
```

## Future Enhancements

### Phase 2 (Post-MVP)
- Template sharing between users
- Public/private template visibility
- Template versioning & history
- Community ratings on templates

### Phase 3
- Multi-template combinations (encounter = NPC + Location + Event)
- Template import/export across campaigns
- AI-suggested fills
- Template remixing/forking

## Troubleshooting

### Issue: RLS blocks reads
**Solution:** Check that user is authenticated or viewing official templates

### Issue: Indexes slow to create
**Solution:** Can run migration during off-hours. GIN index on tone array is the largest.

### Issue: JSONB queries are slow
**Solution:** Consider denormalizing frequently-queried fields to top level

## Performance Notes

- **Most queries:** O(1) with indexes
- **Text search in template_text:** Full-table scan (consider adding full-text search in future)
- **GIN index on tone:** Good for array searches like `tone && ARRAY['dramatic']`
- **Soft deletes:** Use `WHERE deleted_at IS NULL` in all queries

## Validation Rules

- Template difficulty must be: simple, moderate, complex
- Stakes must be: low, medium, high
- Category must be one of: NPCs, Encounters, Items, Locations, Session Hooks
- Tone is free-form text array (no validation)
- At least one blank required in template
- RLS ensures users can only modify their own templates/fills
