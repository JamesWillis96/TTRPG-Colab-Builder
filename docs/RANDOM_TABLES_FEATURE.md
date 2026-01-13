# Random Tables - Feature Documentation

## Overview
The Random Tables feature is a creative tool for generating instant ideas for your TTRPG campaign. It combines the playful, low-friction experience of sites like fantasynamegenerator.com with powerful community-driven content creation.

## Core Features

### 1. **Instant Rolling** 🎲
- Click the "Roll" button on any table to generate a random result
- Results appear immediately with a subtle animation
- Weighted entries allow more common results to appear more frequently
- Perfect for on-the-fly GM decisions

### 2. **Roll History Sidebar**
- Automatically tracks your last 20 rolls
- **Lock results** 🔒 to save important ones
- **Copy to clipboard** 📋 with one click
- Shows which table each result came from
- Clear non-locked results with one button

### 3. **Table Browser**
- **Category filters**: Names, NPCs, Locations, Items, Events, Encounters, Weather, Quests, Treasures, Other
- **Search**: Find tables by name, description, or tags
- **Official vs Community**: Official tables are highlighted with a special badge
- **Favorites**: Star tables you use frequently (client-side only)
- **Expandable entries**: Click ▼ to view all table entries before rolling

### 4. **Table Creation**
Users can create their own custom tables with:
- **Title & Description**: Clear naming and explanation
- **Category**: Organize into predefined categories
- **Tags**: Free-form tags for better searchability
- **Weighted Entries**: Each entry has a weight (1-100)
  - Higher weight = more likely to appear
  - Default weight is 1 (equal probability)
  - Great for making common results appear more often

### 5. **Permissions**
- **All users** can create tables
- **Table creators** can edit/delete their own tables
- **Admins** can edit/delete any table
- **Official tables** can only be created/edited by admins

## Database Schema

```sql
CREATE TABLE random_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'Other',
  tags TEXT[] DEFAULT '{}',
  entries JSONB NOT NULL,  -- Array of {text: string, weight: number}
  is_official BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Entry Format (JSONB)
```json
[
  {"text": "The Prancing Pony", "weight": 1},
  {"text": "The Dragon's Breath", "weight": 2},
  {"text": "Common Tavern Name", "weight": 5}
]
```

## UX Design Principles

### Low Friction
- **1-click rolls**: No confirmation dialogs or multi-step processes
- **Instant results**: No loading states or delays (beyond a 300ms animation)
- **Clear actions**: Large, obvious "Roll" buttons with dice emoji

### Playful & Inspiring
- **Emoji icons**: 🎲 for rolling, ⭐ for favorites, 🔒 for locking
- **Visual hierarchy**: Official tables have colored borders
- **Subtle animations**: Brief delay before showing results adds anticipation

### Mobile-Friendly
- **Responsive layout**: Works on all screen sizes
- **Touch-friendly buttons**: Large click targets
- **Scrollable modals**: Content adapts to small screens

### Power User Features
- **Weighted entries**: Advanced users can fine-tune probability
- **Tags**: Flexible organization beyond categories
- **Lock results**: Save important rolls while continuing to generate new ones
- **Bulk entry management**: Add/remove entries quickly in the form

## Component Breakdown

### Main Page Component
- **Header**: Title + "Create Table" button
- **Filters**: Category buttons + search input
- **Tables Grid**: List of `TableCard` components
- **Roll History Sidebar**: Fixed position, scrollable
- **Create/Edit Modal**: Form overlay

### TableCard Component
- **Header**: Title, official badge, description
- **Metadata**: Category badge, entry count, creator name
- **Tags**: Displayed as chips below metadata
- **Action Buttons**:
  - ⭐ Favorite toggle
  - 🎲 Roll button (primary action)
  - ▼ Expand/collapse entries
  - ✏️ Edit (if owner/admin)
- **Expandable Content**: All table entries with weights

### Create/Edit Modal
- **Form Fields**:
  - Title (required)
  - Description (optional)
  - Category dropdown (required)
  - Tags input (comma-separated)
  - Entry list (dynamic, minimum 1)
- **Entry Row**:
  - Text input (required)
  - Weight number input (1-100, default 1)
  - Remove button (disabled if only 1 entry)
- **Actions**:
  - Delete Table (edit mode only, if owner/admin)
  - Create/Save button (disabled if invalid)
  - Close button

## Technical Implementation

### Weighted Random Selection
```typescript
const rollOnTable = (table: RandomTable) => {
  const totalWeight = table.entries.reduce((sum, e) => sum + (e.weight || 1), 0)
  let random = Math.random() * totalWeight
  
  for (const entry of table.entries) {
    random -= (entry.weight || 1)
    if (random <= 0) {
      return entry.text
    }
  }
}
```

### Filter Logic
```typescript
// Category filter
if (selectedCategory !== 'All') {
  filtered = filtered.filter(t => t.category === selectedCategory)
}

// Search across multiple fields
if (searchQuery) {
  const query = searchQuery.toLowerCase()
  filtered = filtered.filter(t =>
    t.title.toLowerCase().includes(query) ||
    t.description?.toLowerCase().includes(query) ||
    t.tags?.some(tag => tag.toLowerCase().includes(query))
  )
}
```

### Real-time Updates
Currently using client-side state. To add real-time:
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('random_tables_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'random_tables' },
      () => loadTables()
    )
    .subscribe()
  
  return () => subscription.unsubscribe()
}, [])
```

## Migration Guide

1. **Run the SQL migration**: Execute `docs/MIGRATE_RANDOM_TABLES.sql` in Supabase SQL Editor
2. **Verify schema**: Check that new columns exist and indexes are created
3. **Test RLS policies**: Ensure users can create/read/update/delete appropriately
4. **Add official tables** (optional): Uncomment and customize the sample INSERT statements
5. **Test the UI**: Create a table, roll on it, verify history sidebar

## Future Enhancements

### Short Term
- [ ] Save favorites to database (user_table_favorites table)
- [ ] Export tables as JSON
- [ ] Import tables from JSON
- [ ] Duplicate table feature

### Medium Term
- [ ] Table versioning/history
- [ ] Collaborative editing (share tables with specific users)
- [ ] Table collections/groups
- [ ] Advanced search (filter by creator, date, etc.)

### Long Term
- [ ] Dice notation support (e.g., "1d6 gold pieces")
- [ ] Nested tables (roll on other tables within results)
- [ ] Formula-based weights (e.g., based on campaign state)
- [ ] Public table repository (opt-in sharing)

## Accessibility

- **Keyboard navigation**: All actions accessible via keyboard
- **Color contrast**: Meets WCAG AA standards in both light/dark mode
- **Button labels**: Clear, descriptive text
- **Focus indicators**: Visible focus states on all interactive elements
- **Screen reader support**: Semantic HTML with proper ARIA labels

## Performance Considerations

- **Lazy loading**: Only load tables when page mounts
- **Optimistic updates**: Form updates feel instant
- **Debounced search**: Search input doesn't query on every keystroke (if implemented)
- **Index optimization**: Database indexes on category, is_official, and tags
- **Limited history**: Only keep 20 most recent rolls in memory

## Testing Checklist

- [ ] Create a new table with basic entries
- [ ] Create a table with weighted entries
- [ ] Roll on a table multiple times
- [ ] Lock a result and continue rolling
- [ ] Copy a result to clipboard
- [ ] Clear roll history
- [ ] Edit your own table
- [ ] Delete your own table
- [ ] Try to edit someone else's table (should fail if not admin)
- [ ] Filter by each category
- [ ] Search by table name
- [ ] Search by tag
- [ ] Expand/collapse table entries
- [ ] Favorite/unfavorite a table
- [ ] Test on mobile device

## Support & Troubleshooting

### Common Issues

**Problem**: Tables not loading  
**Solution**: Check RLS policies, ensure user is authenticated

**Problem**: Can't edit table  
**Solution**: Verify you're the creator or an admin

**Problem**: Weights not working  
**Solution**: Ensure entries are in JSONB format with weight property

**Problem**: Search not finding tables  
**Solution**: Check that GIN index on tags exists

**Problem**: History sidebar overlaps content  
**Solution**: Reduce browser width to trigger responsive layout (or add responsive CSS)

### Database Queries for Debugging

```sql
-- Check table structure
SELECT * FROM random_tables LIMIT 1;

-- Find orphaned tables (creator deleted)
SELECT id, title, created_by 
FROM random_tables 
WHERE created_by NOT IN (SELECT id FROM profiles);

-- Count tables by category
SELECT category, COUNT(*) 
FROM random_tables 
GROUP BY category 
ORDER BY COUNT(*) DESC;

-- Find most popular tags
SELECT UNNEST(tags) as tag, COUNT(*) as usage_count
FROM random_tables
WHERE tags IS NOT NULL
GROUP BY tag
ORDER BY usage_count DESC
LIMIT 20;
```

---

**Created**: 2026-01-13  
**Last Updated**: 2026-01-13  
**Maintainer**: Development Team
