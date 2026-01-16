# Mad Libs – UX Design & Flow

## Goals
- Guided creativity: blanks that prompt high-quality content, not clichés.
- Immediate usability: outputs read like ready-to-use wiki/session notes.
- Low friction: fast selection, fast fill, autosave, quick export.
- Cohesive feel: variable reuse and constraints keep results consistent.
- Mobile-first resilience: smooth on phones; power on desktop.

## Information Architecture
- Hub (browse): discover templates; filter by category, difficulty, tone; search.
- Detail (fill): two-panel flow — blanks on the left, preview on the right.
- Actions: roll per blank, autosave drafts, copy, export to wiki.

## Page Designs

### 1) Hub – `/madlibs`
- Header: "Mad Libs" + short subtitle.
- Controls bar:
  - Search input: substring match on title/description.
  - Category select: All, NPCs, Encounters, Items, Locations, Session Hooks.
  - Difficulty select: All, simple, moderate, complex.
  - Sort select: Title (A→Z), Difficulty (simple→complex).
- Grid: Cards show title, category, difficulty chip (colored), tone tags, 1–2 line description.
- Hover affordances (desktop): subtle raise (shadow), focus ring.
- Empty state: "No templates match your filters" + reset button.
- Mobile: single column grid; controls stack; large tap targets.

### 2) Detail – `/madlibs/[id]`
- Title block: title, meta (category • difficulty • stakes), description.
- Draft toolbar: Load Draft, Save Draft; last-saved timestamp.
- Layout:
  - Desktop: split vertically; left "Fill Blanks", right "Preview".
  - Mobile: stacked; preview collapses under form.
- Fill Blanks section:
  - Progress header: X/Y filled + progress bar.
  - Each blank card:
    - Label + description (concise microcopy).
    - Input (single-line for creative/specific, textarea for consequence).
    - Constraints list and example chips (click-to-fill).
    - Roll button when `allowRoll`.
  - Sticky header (desktop): keep progress visible while scrolling.
- Preview section:
  - Renders markdown-like text with placeholders for unfilled `[ID]`.
  - Actions: Copy, Save to Wiki.
  - Optional: read-aloud in future.

## Interactions & States
- Autosave: debounce ~1.2s after edits; show "Saving…" then "Saved just now".
- Roll: show transient "Rolling…" state on the specific blank.
- Empty inputs: preview shows `[BLANK_ID]` to signal remaining work.
- Errors: inline non-blocking messages (e.g., export failed).
- Accessibility: labels tied to inputs; keyboard focus order; large touch targets.

## Visual System (Theme)
- Difficulty colors: simple → `success`, moderate → `secondary`, complex → `danger`.
- Cards and inputs use inline styles via `useTheme()`.
- Responsive: breakpoints based on container width; avoid CSS frameworks.

## Mobile Responsiveness
- Controls stack; inputs full-width; reduced padding.
- Sticky progress header transforms to compact pill with X/Y.
- Preview collapses; add toggle to expand if needed.

## Future Enhancements
- Table picker for Roll when multiple matches; show source table.
- Draft history (versions) with quick restore.
- Wiki export options: category override, theme selection, backlink to template.
- Tone/Difficulty multi-select chips with keyboard navigation.
- Inline validation for implied constraints.

## Success Metrics
- Time-to-first-output: select → fill ≥3 blanks → export in <60s.
- Fewer placeholders in exported content (≥80% blanks filled).
- Return rate: users reopen drafts and complete them.
