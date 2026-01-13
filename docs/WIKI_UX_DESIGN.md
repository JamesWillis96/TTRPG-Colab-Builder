# Wiki Page UX Design & Architecture

## Design Overview

### Two-Pane Architecture
```
┌─────────────────────────────────────────────────────────┐
│ Header: Search + Category Filter                        │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│  LEFT PANE           │    RIGHT PANE                    │
│  (Navigation)        │    (Content Viewer)              │
│                      │                                  │
│  • Entry List        │    • Rich Content                │
│  • Search Results    │    • Cross-links                 │
│  • Recent Entries    │    • Related Entries             │
│                      │    • Breadcrumbs                 │
│                      │                                  │
│  Active indicator    │    Independent scroll            │
│  on selected entry   │                                  │
└──────────────────────┴──────────────────────────────────┘
```

### Left Pane (Navigation)
- **Width**: 320px (desktop), 100% (mobile)
- **Features**:
  - Search input (top, sticky)
  - Category/tag filter buttons
  - Scrollable entry list
  - "Recently Viewed" section (collapsible)
  - Visual selection indicator (left border + background)
  - Entry preview on hover (optional)

### Right Pane (Content Viewer)
- **Width**: Flex (fills remaining space)
- **Features**:
  - Breadcrumbs at top
  - Entry title + metadata (word count, last updated)
  - Rich markdown content with images
  - Callout boxes for important info
  - Inline wiki-links (highlighted)
  - "Related Entries" sidebar (sticky)
  - "Open Full Page" button for focused reading
  - Loading skeleton during content transition

## Component Breakdown

### Components
1. `WikiPage` - Main container, manages state
2. `WikiSidebar` - Left pane (search, filters, entry list)
3. `WikiContent` - Right pane (markdown renderer)
4. `WikiEntryCard` - Single entry in list
5. `WikiSearchBar` - Search input with debounce
6. `WikiFilters` - Category/tag filter buttons
7. `WikiBreadcrumbs` - Navigation hierarchy
8. `WikiMetadata` - Word count, updated date, author
9. `WikiRelatedEntries` - Sidebar suggestions
10. `WikiLoadingSkeleton` - Content loading state

## CSS Layout Strategy

### Grid-based Container
```css
.wiki-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  grid-template-rows: auto 1fr;
  height: 100vh;
  gap: 0;
}

.wiki-header {
  grid-column: 1 / -1;
  /* Search & filters span both columns */
}

.wiki-sidebar {
  grid-column: 1;
  grid-row: 2;
  overflow-y: auto;
  /* Independent scroll */
}

.wiki-content {
  grid-column: 2;
  grid-row: 2;
  overflow-y: auto;
  /* Independent scroll */
}
```

### Responsive Behavior (Mobile)
```css
@media (max-width: 768px) {
  .wiki-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
  }

  .wiki-sidebar {
    grid-column: 1;
    grid-row: 2;
    max-height: 200px;
    /* Swipe toggle handled by JavaScript */
  }

  .wiki-content {
    grid-column: 1;
    grid-row: 3;
    /* Stack below sidebar */
  }

  .wiki-sidebar.hidden {
    display: none;
  }

  .wiki-content.full {
    grid-row: 2 / -1;
    /* Expand when sidebar hidden */
  }
}
```

## JavaScript Logic

### State Management
```typescript
interface WikiState {
  entries: WikiEntry[]
  selectedId: string | null
  selectedContent: string | null
  searchQuery: string
  selectedCategory: string
  recentlyViewed: string[]
  loading: boolean
}
```

### Key Functions

#### 1. Entry Selection
- Update selectedId in state
- Load content dynamically
- Push to browser history (with deep link)
- Scroll entry into view in sidebar
- Add to recentlyViewed array

#### 2. Search & Filter
- Debounce search input (300ms)
- Filter entries by query + category
- Highlight search terms in results
- Reset to top of list

#### 3. Keyboard Navigation
- `↓` / `↑` : Move to next/previous entry
- `Enter` : Select entry
- `Escape` : Clear search
- `/` : Focus search (global shortcut)

#### 4. Deep Linking
- URL format: `/wiki?entry=slug`
- On page load, check URL params
- Load selected entry automatically
- Allows sharing/bookmarking

#### 5. Loading States
- Show skeleton while fetching content
- Fade transition between entries
- Disabled state during load

## Performance Optimization

### Lazy Loading
- Render only visible entries in list
- Virtual scrolling for 100+ entries
- Load content on demand (not all at once)

### Caching
- Cache recently viewed entries
- Use React Query or SWR for fetching
- Memoize rendered components

### Debouncing
- Search input: 300ms debounce
- Scroll listeners: 200ms throttle

## Accessibility

- ARIA labels on buttons
- Semantic HTML structure
- Keyboard navigation support
- Color contrast ratios met
- Screen reader friendly
- Focus indicators visible

## Mobile Behavior

### Responsive Strategy
- **Mobile-First**: Design for mobile, enhance for desktop
- **Touch-Friendly**: 44px+ tap targets
- **Simplified**: Hide filters on mobile (search only)
- **Toggle View**: Button to switch between list/content

### Gesture Support
- **Swipe Left**: Next entry
- **Swipe Right**: Previous entry
- **Tap Entry**: Select and view
- **Pinch Zoom**: Not recommended for text (users should use native zoom)

## Visual Hierarchy

### Typography
- **Entry Title**: 28px, bold, primary color
- **Headings**: 20px/16px/14px (h1/h2/h3)
- **Body**: 14px, 1.6 line height, readable max-width
- **Metadata**: 12px, muted color, monospace

### Colors & Contrast
- **Selected Entry**: Accent color background + left border
- **Links**: Underlined, distinguishable from body text
- **Code Blocks**: Light background, monospace font
- **Callouts**: Left border + light background

### Spacing
- **Padding**: 16px inside content areas
- **Gap Between Entries**: 8px
- **Section Gap**: 24px
- **Related Entries Gap**: 12px

## Content Structure (Per Entry)

```markdown
# Entry Title

**Last Updated**: Jan 13, 2026 | **Author**: Game Master | **Word Count**: 342

---

## Overview
Brief intro to the topic (1-2 sentences)

## Details
Main content in sections

### Related Concepts
- [[Link to other entry]]
- [[Another entry]]

---

## Related Entries (Sidebar)
- Entry A
- Entry B
- Entry C
```

## UX Enhancements Included

✅ **Recently Viewed**: Quick access to last 5 browsed entries
✅ **Search Highlighting**: Search terms highlighted in list
✅ **Entry Previews**: Hover shows first 2 lines of content
✅ **Breadcrumbs**: Shows category > entry path
✅ **Related Links**: Suggested entries at bottom
✅ **Deep Linking**: Shareable URLs
✅ **Keyboard Navigation**: Arrow keys + Enter support
✅ **Mobile Toggle**: Switch between list/content views
✅ **Loading States**: Skeleton screens during fetch
✅ **Smooth Transitions**: Fade between entries

## Browser History Management

```typescript
// On entry select:
const slug = entry.id.toLowerCase().replace(/\s+/g, '-')
window.history.pushState(
  { entryId: entry.id },
  entry.title,
  `/wiki?entry=${slug}`
)

// On page load:
const params = new URLSearchParams(window.location.search)
const entrySlug = params.get('entry')
if (entrySlug) {
  const entry = entries.find(e => 
    e.id.toLowerCase().replace(/\s+/g, '-') === entrySlug
  )
  if (entry) selectEntry(entry)
}

// Handle browser back button:
window.addEventListener('popstate', (e) => {
  if (e.state?.entryId) selectEntry(e.state.entryId)
})
```

## Summary

**Key Design Principles**:
1. **Dual Focus**: Navigate left, read right
2. **No Context Loss**: Stay oriented while browsing
3. **Fast Exploration**: Rapid entry switching
4. **Mobile First**: Works on phones and desktops
5. **Accessible**: Keyboard + screen reader support
6. **Readable**: Generous spacing, clear hierarchy
7. **Performant**: Lazy loading, caching, debouncing

This design enables users to explore your wiki naturally, discovering connections between entries while maintaining reading focus.
