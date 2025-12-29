// Centralized wiki page templates for all categories
export const wikiTemplates: Record<string, string> = {
  npc: `# [NPC Name]
----
**Race:** [Race]  
**Class/Profession:** [Class/Profession]  
**Background:** [Background]  
**Alignment:** [Alignment]
----
***Who is this character? What is their role in the world?***
***What do they look like? What stands out about their appearance?***
***What motivates them? What are their goals, fears, or secrets?***
***Who are their friends, allies, or enemies?***
***What is a memorable quote or saying from this character?***
***What is something unexpected about them?***
***Additional Notes***
[Add any other interesting details or story hooks.]
`,
  'player character': `# [Player Character Name]
----
**Race:** [Race]  
**Class:** [Class]  
**Background:** [Background]  
**Alignment:** [Alignment]  
**Favorite Color:** [Favorite Color]
----
***What is your character's background and origin story?***
***What are their core beliefs, values, or driving motivations?***
***What do they look like? Any distinguishing features?***
***What is their greatest strength? What is their greatest flaw?***
***Who are their closest allies or rivals?***
***What is a secret your character keeps (from the party or the world)?***
***What is a goal your character wants to achieve?***
***What is a memorable moment from their adventures so far?***
***Additional Notes***
[Add any other personal details, quirks, or aspirations.]
`,
  location: `# [Location Name]
----
**Type:** [e.g., City, Forest, Dungeon, etc.]  
**Region:** [Region or area]  
**Notable NPCs:** [Key NPCs]  
**Factions Present:** [Factions]
----
***What makes this place unique or important?***
***What is the environment like? (Climate, terrain, notable features)***
***Who lives here or frequents this location?***
***What is the history or legend behind this place?***
***What dangers or mysteries might visitors encounter?***
***What is a rumor or secret about this location?***
***Additional Notes***
[Add any other interesting facts, hooks, or connections.]
`,
  lore: `# [Lore Topic]
----
**Origin:** [How did this lore begin?]  
**Key Figures:** [People or creatures involved]  
**Era:** [Time period]
----
***What is the essence of this lore or story element?***
***How did it originate? Who or what is involved?***
***What are the key events or turning points?***
***How does this lore impact the world or its people?***
***What mysteries or unresolved questions surround it?***
***Why does this matter to the campaign or characters?***
***Additional Notes***
[Add any other context, theories, or implications.]
`,
  item: `# [Item Name]
----
**Type:** [Weapon, Armor, Potion, Artifact, etc.]  
**Rarity:** [Common, Uncommon, Rare, Legendary, etc.]  
**Value:** [Gold piece equivalent or other value]
----
***What is this item and what does it look like?***
***What powers, abilities, or properties does it have?***
***What is its origin or history?***
***Who can use it, and are there any requirements or restrictions?***
***What is a story or rumor associated with this item?***
***What is a drawback, risk, or cost of using it?***
***Additional Notes***
[Add any other details, plot hooks, or secrets.]
`,
  faction: `# [Faction Name]
----
**Leader:** [Name and title]  
**Base of Operations:** [Location]  
**Primary Goal:** [Goal or ideology]
----
***What is the purpose or ideology of this group?***
***Who leads it, and how is it organized?***
***What is the group's history or origin?***
***Who are its allies and enemies?***
***What resources, power, or influence does it have?***
***What are its current goals or activities?***
***What is a secret or internal conflict within the faction?***
***Additional Notes***
[Add any other relevant information, rumors, or story hooks.]
`
}

export function getWikiTemplate(category: string): string {
  return wikiTemplates[category] || wikiTemplates['player character']
}