import { supabase } from './supabase'

// Fetch is_public status for a wiki page by id
export async function getWikiPagePublicStatus(id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('wiki_pages')
    .select('is_public')
    .eq('id', id)
    .single()
  if (error) throw error
  return !!data?.is_public
}

// Update is_public status for a wiki page by id
export async function setWikiPagePublicStatus(id: string, isPublic: boolean): Promise<void> {
  const { error } = await supabase
    .from('wiki_pages')
    .update({ is_public: isPublic })
    .eq('id', id)
  if (error) throw error
}
/**
 * Wiki utilities and helpers
 */

export function toSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createHeadingIdGenerator() {
  const counts = new Map<string, number>()
  return (text: string) => {
    const base = slugifyHeading(text)
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)
    return count === 0 ? base : `${base}-${count}`
  }
}

export interface Heading {
  id: string
  text: string
  level: number
}

export function extractHeadings(content: string): Heading[] {
  const generateId = createHeadingIdGenerator()
  const headings: Heading[] = []

  const lines = content.split('\n')
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.*)/)
    if (!match) continue

    const level = match[1].length
    const text = match[2].trim()
    const id = `section-${generateId(text)}`

    headings.push({ id, text, level })
  }

  return headings
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.max(1, Math.round(wordCount / wordsPerMinute))
}

export const WIKI_CATEGORIES = [
  'Location',
  'NPC',
  'Faction',
  'Item',
  'Lore',
  'Mechanic',
  'Event'
] as const

export type WikiCategory = (typeof WIKI_CATEGORIES)[number]

export const WIKI_STATES = ['draft', 'pending_review', 'published'] as const
