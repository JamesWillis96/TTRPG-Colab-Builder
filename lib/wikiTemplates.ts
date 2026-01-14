// Centralized wiki page templates for all categories
export const wikiTemplates: Record<string, string> = {
  npc: `# [NPC Name]
**Race:** [Race]  
**Class/Profession:** [Class/Profession]  
**Background:** [Background]  
**Alignment:** [Alignment]
----
## Who is this character? What is their role in the world?

[Description]

## What do they look like? What stands out about their appearance?

[Description]

## What motivates them? What are their goals, fears, or secrets?

**Motivation**: [Motivation]

**Goal**: [Goal]

**Fear**: [Fear]

**Secret**: [Secret]

## Who are their friends, allies, or enemies?

- **Allies**: [Allies]
- **Enemies**: [Enemies]
- **Complicated**: [Complicated relationships]

## What is a memorable quote or saying from this character?

"[Quote]"

## What is something unexpected about them?

[Unexpected detail]

## Additional Notes

[Add any other interesting details or story hooks.]
`,
  'player character': `# [Player Character Name]
**Race:** [Race]  
**Class:** [Class]  
**Background:** [Background]  
**Alignment:** [Alignment]  
**Favorite Color:** [Favorite Color]
----
## What is your character's background and origin story?

[Description]

## What are their core beliefs, values, or driving motivations?

[Description]

## What do they look like? Any distinguishing features?

[Description]

## What is their greatest strength? What is their greatest flaw?

**Strength**: [Strength]

**Flaw**: [Flaw]

## Who are their closest allies or rivals?

[Description]

## What is a secret your character keeps (from the party or the world)?

[Secret]

## What is a goal your character wants to achieve?

[Goal]

## What is a memorable moment from their adventures so far?

[Moment]

## Additional Notes

[Add any other personal details, quirks, or aspirations.]
`,
  location: `# [Location Name]
**Type:** [e.g., City, Forest, Dungeon, etc.]  
**Region:** [Region or area]  
**Notable NPCs:** [Key NPCs]  
**Factions Present:** [Factions]
----
## What makes this place unique or important?

[Description]

## What is the environment like? (Climate, terrain, notable features)

[Description]

## Who lives here or frequents this location?

[Description]

## What is the history or legend behind this place?

[Description]

## What dangers or mysteries might visitors encounter?

[Description]

## What is a rumor or secret about this location?

[Rumor/Secret]

## Additional Notes

[Add any other interesting facts, hooks, or connections.]
`,
  lore: `# [Lore Topic]
**Origin:** [How did this lore begin?]  
**Key Figures:** [People or creatures involved]  
**Era:** [Time period]
----
## What is the essence of this lore or story element?

[Description]

## How did it originate? Who or what is involved?

[Description]

## What are the key events or turning points?

[Description]

## How does this lore impact the world or its people?

[Description]

## What mysteries or unresolved questions surround it?

[Description]

## Why does this matter to the campaign or characters?

[Description]

## Additional Notes

[Add any other context, theories, or implications.]
`,
  item: `# [Item Name]
**Type:** [Weapon, Armor, Potion, Artifact, etc.]  
**Rarity:** [Common, Uncommon, Rare, Legendary, etc.]  
**Value:** [Gold piece equivalent or other value]
----
## What is this item and what does it look like?

[Description]

## What powers, abilities, or properties does it have?

[Description]

## What is its origin or history?

[Description]

## Who can use it, and are there any requirements or restrictions?

[Description]

## What is a story or rumor associated with this item?

[Story/Rumor]

## What is a drawback, risk, or cost of using it?

[Description]

## Additional Notes

[Add any other details, plot hooks, or secrets.]
`,
  faction: `# [Faction Name]
**Leader:** [Name and title]  
**Base of Operations:** [Location]  
**Primary Goal:** [Goal or ideology]
----
## What is the purpose or ideology of this group?

[Description]

## Who leads it, and how is it organized?

[Description]

## What is the group's history or origin?

[Description]

## Who are its allies and enemies?

[Description]

## What resources, power, or influence does it have?

[Description]

## What are its current goals or activities?

[Description]

## What is a secret or internal conflict within the faction?

[Secret/Conflict]

## Additional Notes

[Add any other relevant information, rumors, or story hooks.]
`
}

export function getWikiTemplate(category: string): string {
  return wikiTemplates[category] || wikiTemplates['player character']
}