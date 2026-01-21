// Centralized wiki page templates for all categories
export const wikiTemplates: Record<string, string> = {
  npc: `# [NPC Name]
**Race:** [Race]  
**Class/Profession:** [Class/Profession]  
**Pronouns:** [Pronouns]  
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
**Pronouns:** [Pronouns]  
**Community:** [Community]  
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
**Type:** [Weapon/Armor/Artifact/Consumable/Other]  
**Rarity:** [Common/Uncommon/Rare/Legendary]  
**Attunement/Use:** [Requirements or cost]  
**Origin:** [Where did it come from?]
----
## Appearance

[Describe materials, craftsmanship, and distinctive features.]

## Powers & Properties

- **Primary Effect:** [What it does]
- **Secondary Effect:** [Optional]
- **Limits:** [Charges, cooldowns, constraints]

## History & Makers

[Who created it and why.]

## Ownership & Provenance

- **Previous Owner:** [Name/role]
- **How it was lost:** [Event]

## Rumors & Lore

- [Rumor 1]
- [Rumor 2]

## Risks & Drawbacks

[Curses, consequences, or trade-offs.]

## Adventure Hooks

- [Hook 1]
- [Hook 2]
- [Hook 3]
`,
  faction: `# [Faction Name]
**Leader:** [Name and title]  
**Symbols/Colors:** [Iconography, colors, banners]  
**Base of Operations:** [HQ or primary region]  
**Primary Goal:** [Goal or ideology]
----
## What is the faction's public face?

[How it presents itself to the world.]

## What is it really about?

[True agenda or hidden purpose.]

## Leadership & Structure

- **Inner Circle:** [Key decision-makers]
- **Ranks:** [Titles or tiers]
- **Recruitment:** [How members are inducted]

## Assets & Influence

- **Resources:** [Wealth, supplies, magic, information]
- **Territory:** [Where it holds power]
- **Leverage:** [Secrets, favors, blackmail]

## Allies & Rivals

- **Allies:** [Friendly groups]
- **Rivals:** [Opposing factions]
- **Wildcards:** [Unpredictable relationships]

## Current Operations

- **Project 1:** [Goal + stakes]
- **Project 2:** [Goal + stakes]
- **Project 3:** [Goal + stakes]

## Secrets & Fault Lines

- **Secret:** [Hidden truth]
- **Conflict:** [Internal schism or pressure point]

## Notable Members

- **Name:** [Role/trait]
- **Name:** [Role/trait]

## Story Hooks

- [Hook 1]
- [Hook 2]
- [Hook 3]
`
  ,
  // Template for Collosi (large ancient constructs/creatures)
  collosi: `# [Colossi Name]
**Type:** [Titan/Construct/Natural/God-forged/etc.]  
**Scale:** [Height/weight/relative size]  
**Location:** [Where it dwells or was found]  
**Known By:** [Cult, nation, explorers]
----
## What is the Colossi's origin or purpose?

[Creation myth, maker, or natural origin]

## Physical Description & Scale

[Describe appearance, materials, markings, notable features]

## Powers, Abilities & Effects on the Environment

- **Primary Power:** [E.g., earth-shaping, storm-summoning]
- **Range/Scale:** [Area affected]
- **Passive Effects:** [Changes to weather, gravity, magic zones]

## Behavior & Motivations

[Is it hostile, benevolent, dormant, wandering? What wakes it?]

## Weaknesses, Limits & How to Affect It

[Known vulnerabilities, rituals, special weapons, or bargains]

## Relationship to People, Factions, & Sites

[How kingdoms, cults, or explorers interact with it; temples, treaties]

## Adventure Hooks

- [Hook 1: Why the party encounters it]
- [Hook 2: A faction wants it awakened/slain]
- [Hook 3: Salvage its remains or harness its power]

## Notes & Rumors

[Ongoing myths, contradictory reports, and named sightings]
`
}

export function getWikiTemplate(category: string): string {
  return wikiTemplates[category] || wikiTemplates['player character']
}