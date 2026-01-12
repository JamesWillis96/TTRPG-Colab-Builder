# The Loom - AI Coding Agent Instructions

## Architecture Overview
West Marches TTRPG campaign management app using Next.js 16 App Router with client-side rendering, Supabase for backend/auth, and a centralized theming system. All pages are `'use client'` components with global state via React Context.

## Critical Patterns

### Styling: Inline Styles with Theme Objects (NOT Tailwind)
**This project does NOT use Tailwind utility classes.** Styling is exclusively done through inline `style` props using centralized theme objects from `lib/theme.ts`.

```tsx
// ✅ CORRECT - Use theme object with inline styles
import { useTheme } from '../contexts/ThemeContext'

const { theme, styles } = useTheme()
return <div style={{ 
  background: theme.colors.background.secondary,
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius
}}>Content</div>

// ❌ WRONG - Never use Tailwind classes
return <div className="bg-gray-100 p-4 rounded">Content</div>
```

**Key theme locations:**
- Theme definitions: `lib/theme.ts` (lightTheme, darkTheme, createStyles)
- Theme context: `contexts/ThemeContext.tsx`
- Global CSS (minimal): `app/globals.css` (only for `.theme-background`, `.markdown-content`, and Tailwind base)

### Authentication Pattern
All authenticated pages must redirect unauthenticated users:

```tsx
'use client'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'

const { user, profile, loading: authLoading } = useAuth()
const router = useRouter()

useEffect(() => {
  if (!authLoading && !user) {
    router.push('/login')
  }
}, [user, authLoading, router])
```

**Auth context provides:** `user` (Supabase User), `profile` (from profiles table), `signIn()`, `signUp()`, `signOut()`

### Supabase Data Access
Direct client-side queries (no API routes):

```tsx
import { supabase } from '../lib/supabase'

// Fetch with error handling
const { data, error } = await supabase
  .from('wiki_pages')
  .select('*')
  .order('updated_at', { ascending: false })

if (error) throw error
```

**Database tables:** `profiles`, `wiki_pages`, `sessions`, `session_players`, `map_pois`, `random_tables`

### Wiki Template System
Templates defined in `lib/wikiTemplates.ts` with markdown structure for each category:

```tsx
import { wikiTemplates } from '../../../lib/wikiTemplates'

// Get template content
const template = wikiTemplates['location'] // or 'npc', 'item', 'lore', 'faction', 'player character'
```

**Categories:** npc, player character, location, lore, item, faction

## File Structure Patterns

### App Router Convention
- **Pages:** `app/[feature]/page.tsx` (always `'use client'`)
- **Dynamic routes:** `app/sessions/[id]/page.tsx`, `app/wiki/[slug]/page.tsx`
- **Edit pages:** `app/wiki/[slug]/edit/page.tsx`
- **Create pages:** `app/wiki/create/page.tsx`

### Component Structure
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'

export default function PageName() {
  const { user, profile } = useAuth()
  const { theme, styles } = useTheme()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Load data
  }, [])
  
  return (
    <main style={styles.container}>
      {/* Content using inline styles */}
    </main>
  )
}
```

## Development Commands
```bash
npm run dev    # Start dev server on :3000
npm run build  # Production build
npm run lint   # ESLint check
```

## Common Gotchas
1. **All pages are client components** - Always start with `'use client'`
2. **No Tailwind classes in JSX** - Use `theme.colors.*` and inline styles
3. **Relative imports** - Use `'../../contexts/AuthContext'` style paths (no aliases configured)
4. **Dark mode** - Handled via `[data-theme="dark"]` CSS selectors in `globals.css`
5. **Mobile responsiveness** - Use `isMobile` state with window resize listener pattern (see `NavBar.tsx`)

## Key Files Reference
- Auth flow: `contexts/AuthContext.tsx`, `app/login/page.tsx`, `app/signup/page.tsx`
- Theme system: `lib/theme.ts`, `contexts/ThemeContext.tsx`
- Layout wrapper: `app/layout.tsx` (wraps with ThemeProvider + AuthProvider)
- Navigation: `components/NavBar.tsx` (mobile-responsive with theme toggle)
