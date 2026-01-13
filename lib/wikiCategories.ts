export const wikiCategories = [
  'npc',
  'player character',
  'location',
  'lore',
  'item',
  'faction',
  'general'
] as const

export type WikiCategory = typeof wikiCategories[number]

export function ensureCategory(value: string): WikiCategory {
  return (wikiCategories as readonly string[]).includes(value) ? (value as WikiCategory) : 'general'
}
