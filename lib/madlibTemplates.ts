// Comprehensive Mad Lib templates for campaign & session creation
// Philosophy: Constrained blanks guide creativity, variable reuse creates cohesion
// All templates designed to generate immediately usable content

export type BlankType = 'creative' | 'constrained' | 'consequence' | 'specific'

export interface MadLibBlank {
  id: string
  name: string
  type: BlankType
  description: string
  constraints?: string[]
  examples?: string[]
  allowRoll?: boolean
  reuseCount?: number // How many times this blank appears in template
}

export interface MadLibTemplate {
  id: string
  title: string
  category: 'NPCs' | 'Encounters' | 'Items' | 'Locations' | 'Session Hooks'
  difficulty: 'simple' | 'moderate' | 'complex'
  tone: string[]
  stakes: 'low' | 'medium' | 'high'
  description: string
  templateText: string // Raw template with [BLANK_ID] markers
  blanks: MadLibBlank[]
  notes: string // Creative constraints & design philosophy
  exampleFill?: Record<string, string> // Example completed fill
  isOfficial: boolean
  createdBy?: string
}

// ============================================================================
// NPC TEMPLATES
// ============================================================================

const npcSimple: MadLibTemplate = {
  id: 'npc-simple-1',
  title: 'The Conflicted Quest-Giver',
  category: 'NPCs',
  difficulty: 'simple',
  tone: ['dramatic', 'personal'],
  stakes: 'medium',
  description: 'A NPC who needs help but has a hidden reason for asking. Their need creates immediate story tension.',
  templateText: `# [CHARACTER_NAME]

**Role:** [ROLE]  
**Race/Species:** [RACE]  
**Appearance:** [APPEARANCE_DETAIL]

## Who Are They?

[CHARACTER_NAME] appears to be a [ROLE] in [LOCATION_NAME], but they're hiding something. They have a reputation for being [REPUTATION], and people often describe them as [DEMEANOR].

## What Do They Want?

They're asking adventurers to [MAIN_QUEST] for them. On the surface, it seems like a straightforward job—they even offer [REWARD] as payment.

## The Complication

But [CHARACTER_NAME] actually needs this done because [SECRET_REASON]. If the adventurers complete the quest without understanding why, they might accidentally [UNINTENDED_CONSEQUENCE].

## The Hook

The question that hooks them in: "[QUESTION]"`,
  blanks: [
    {
      id: 'CHARACTER_NAME',
      name: 'Character Name',
      type: 'creative',
      description: 'An interesting, memorable name. Can be mundane or fantastical.',
      examples: ['Thorn Blackwood', 'Sister Margot', 'Kess the Sharp'],
      reuseCount: 2
    },
    {
      id: 'ROLE',
      name: 'Social Role',
      type: 'specific',
      description: 'What role do they hold? D&D profession/position.',
      constraints: ['Must suggest authority or knowledge', 'Uncommon is better than "tavern keeper"'],
      examples: ['Guild master', 'Former knight', 'Merchant in debt', 'Retired assassin', 'Disgraced cleric'],
      allowRoll: true
    },
    {
      id: 'RACE',
      name: 'Race/Species',
      type: 'specific',
      description: 'What ancestry are they? Encourages non-human options.',
      examples: ['Half-orc', 'Tiefling', 'Dwarf', 'Goblin', 'Changeling'],
      allowRoll: true
    },
    {
      id: 'APPEARANCE_DETAIL',
      name: 'Distinctive Appearance',
      type: 'creative',
      description: 'One specific visual detail that makes them memorable.',
      constraints: ['Must be concrete, not generic', 'Implies something about them (scars, ink, fine clothes, etc)'],
      examples: ['missing two fingers on left hand', 'always wears crimson silks', 'covered in ritual scars']
    },
    {
      id: 'LOCATION_NAME',
      name: 'Location',
      type: 'creative',
      description: 'Where does this NPC make their home/work?',
      examples: ['the coastal city of Saltmere', 'a fortress under siege', 'a caravan heading north'],
      allowRoll: true
    },
    {
      id: 'REPUTATION',
      name: 'Their Reputation',
      type: 'creative',
      description: 'How do people generally describe them? What word comes up?',
      constraints: ['Should not be purely good or evil', 'Implies complexity'],
      examples: ['trustworthy but ruthless', 'generous but unpredictable', 'honest about impossible things']
    },
    {
      id: 'DEMEANOR',
      name: 'How They Seem',
      type: 'creative',
      description: 'What personality trait stands out when you meet them?',
      examples: ['calm even under pressure', 'quick to laugh, quick to anger', 'careful with words']
    },
    {
      id: 'MAIN_QUEST',
      name: 'The Task',
      type: 'consequence',
      description: 'What do they want done? Should be concrete and doable.',
      constraints: ['Must be completable in 2-4 sessions', 'Should have multiple approaches'],
      examples: ['recover a stolen letter', 'eliminate a rival merchant', 'retrieve a family heirloom from a locked vault']
    },
    {
      id: 'REWARD',
      name: 'The Reward',
      type: 'creative',
      description: 'What do they offer? Can be money, information, favors, items.',
      examples: ['500 gold', 'passage out of the city', 'a magical token worth a favor']
    },
    {
      id: 'SECRET_REASON',
      name: 'Their Hidden Motivation',
      type: 'consequence',
      description: 'Why do they REALLY need this done? What stakes hide beneath the surface?',
      constraints: ['Must change the meaning of the quest', 'Should create a moral question'],
      examples: ['they\'re in debt to a crime lord', 'the stolen item belongs to someone else', 'completing it will ruin someone they love']
    },
    {
      id: 'UNINTENDED_CONSEQUENCE',
      name: 'The Twist',
      type: 'consequence',
      description: 'What goes wrong if the adventurers complete the quest without understanding the full context?',
      constraints: ['Must be ironic or thematic', 'Should teach them to ask questions'],
      examples: ['frame an innocent person', 'break a legal oath binding the NPC', 'trigger a war between factions']
    },
    {
      id: 'QUESTION',
      name: 'The Hook Line',
      type: 'creative',
      description: 'A question that once asked, can\'t be unasked. The moment they start wondering about this, they\'re invested.',
      examples: ['"Why do you ask us to do this, and not your friends?"', '"What happens to you if I fail?"', '"Who are you really running from?"']
    }
  ],
  notes: 'This template creates NPCs with immediate dramatic tension. The "hidden reason" is crucial—it transforms a simple fetch quest into a moral choice. Players should feel the weight of what they don\'t know.',
  exampleFill: {
    CHARACTER_NAME: 'Cassian Voss',
    ROLE: 'Spicemaster',
    RACE: 'Half-elf',
    APPEARANCE_DETAIL: 'his left eye is a milky white, seeing things others can\'t',
    LOCATION_NAME: 'the trade quarter of Meridian',
    REPUTATION: 'deeply generous to those who help him, dangerous to those who cross him',
    DEMEANOR: 'speaks slowly and carefully, as if each word costs him something',
    MAIN_QUEST: 'retrieve a locked chest from his old business partner without violence',
    REWARD: 'a year\'s supply of rare spices and a debt owed to him',
    SECRET_REASON: 'the chest contains evidence his partner murdered his wife, but he\'s been paid to stay silent by a more powerful enemy',
    UNINTENDED_CONSEQUENCE: 'delivering the chest starts a silent war between three factions all competing for its contents',
    QUESTION: '"Would you do this differently if you knew the truth?"'
  },
  isOfficial: true
}

const npcModerate: MadLibTemplate = {
  id: 'npc-moderate-1',
  title: 'The Recurring Rival',
  category: 'NPCs',
  difficulty: 'moderate',
  tone: ['competitive', 'personal', 'dramatic'],
  stakes: 'medium',
  description: 'An NPC who opposes the party in interesting ways. Each encounter escalates, creating an arc of rivalry.',
  templateText: `# [RIVAL_NAME]: A Rival\'s Tale

**The Rival:** [RIVAL_NAME]  
**Their Profession:** [PROFESSION]  
**Why They Started:** [RIVAL_RACE]

## The First Meeting

When the party first encounters [RIVAL_NAME], they are [FIRST_IMPRESSION]. At first, it seems like a simple conflict over [INITIAL_CONFLICT]—nothing personal, just business.

But [RIVAL_NAME] is driven by something deeper. Years ago, [BACKSTORY]. Now they see the party as [PARTY_ROLE_IN_RIVALRY], and they can't let this slide.

## What They Want

[RIVAL_NAME]'s goal is to [PRIMARY_GOAL]. They don't necessarily want the party destroyed—they want to [TRUE_GOAL]. Each encounter with them escalates because they're testing the party, trying to prove [WHAT_THEY_BELIEVE].

## The Turning Point

There will come a moment when [RIVAL_NAME] reveals [REVELATION]. This changes everything. Suddenly, the party might [PARTY_REALIZATION].

## The Endgame

The rivalry only ends when either:
- The party defeats [RIVAL_NAME] in [FINAL_CONFLICT_TYPE]
- [RIVAL_NAME] achieves [THEIR_VICTORY_CONDITION]
- Something unexpected: [TWIST]`,
  blanks: [
    {
      id: 'RIVAL_NAME',
      name: 'Rival\'s Name',
      type: 'creative',
      description: 'A memorable name for the antagonist.',
      examples: ['Vex Ironbound', 'The Crow', 'Mother Alchemist'],
      reuseCount: 5
    },
    {
      id: 'PROFESSION',
      name: 'Their Profession',
      type: 'specific',
      description: 'What do they do? How do they survive?',
      constraints: ['Should be something that could plausibly compete with adventurers'],
      examples: ['bounty hunter', 'crime lord', 'ambitious general', 'rival adventuring company leader']
    },
    {
      id: 'RIVAL_RACE',
      name: 'Their Race/Species',
      type: 'specific',
      description: 'What are they?',
      examples: ['Dragonborn', 'Warforged', 'Eladrin', 'Kobold'],
      allowRoll: true
    },
    {
      id: 'FIRST_IMPRESSION',
      name: 'First Meeting Appearance',
      type: 'creative',
      description: 'How do they present themselves initially?',
      examples: ['confident to the point of arrogance', 'polite but with steel underneath', 'battered but still standing']
    },
    {
      id: 'INITIAL_CONFLICT',
      name: 'Initial Conflict Reason',
      type: 'consequence',
      description: 'Why do they clash with the party the first time?',
      examples: ['they\'re both after the same contract', 'the party interferes in their plans', 'an old debt comes due']
    },
    {
      id: 'BACKSTORY',
      name: 'The Wound',
      type: 'consequence',
      description: 'What happened in their past that drives this rivalry?',
      constraints: ['Must be personal, not abstract', 'Must make their actions understandable (not excusable)'],
      examples: ['the party\'s mentor left them for dead', 'they lost something irreplaceable', 'they were made a fool of']
    },
    {
      id: 'PARTY_ROLE_IN_RIVALRY',
      name: 'What the Party Represents',
      type: 'consequence',
      description: 'In their mind, what do the party symbolize or remind them of?',
      examples: ['the heroes they could never be', 'the people who hurt them before', 'a second chance gone wrong']
    },
    {
      id: 'PRIMARY_GOAL',
      name: 'Surface-Level Goal',
      type: 'consequence',
      description: 'What do they say they want?',
      examples: ['destroy the party\'s reputation', 'claim the same prize the party seeks', 'become legendary']
    },
    {
      id: 'TRUE_GOAL',
      name: 'What They Actually Want',
      type: 'consequence',
      description: 'What do they really need? (May differ from stated goal.)',
      examples: ['to be acknowledged as superior', 'to make the party feel their pain', 'to prove they were right all along']
    },
    {
      id: 'WHAT_THEY_BELIEVE',
      name: 'Their Core Belief',
      type: 'creative',
      description: 'What do they believe about themselves, the party, or the world?',
      examples: ['"Only the strong deserve happiness"', '"I was destined for greatness"', '"Mercy is weakness"']
    },
    {
      id: 'REVELATION',
      name: 'The Turning Point',
      type: 'consequence',
      description: 'What secret does [RIVAL_NAME] reveal that changes the dynamic?',
      constraints: ['Must force the party to reconsider'],
      examples: ['they\'re dying and this is their last chance', 'the party and rival were manipulated by the same enemy', 'the rival is actually connected to one of the party members']
    },
    {
      id: 'PARTY_REALIZATION',
      name: 'Party\'s Response',
      type: 'creative',
      description: 'What might the party realize or feel when the truth comes out?',
      examples: ['sympathy for their enemy', 'shared enemies', 'a chance for alliance']
    },
    {
      id: 'FINAL_CONFLICT_TYPE',
      name: 'Final Conflict Arena',
      type: 'specific',
      description: 'Where/how does this rivalry climax?',
      examples: ['a grand duel before witnesses', 'a contest of wit and cunning', 'a stand together against a greater threat']
    },
    {
      id: 'THEIR_VICTORY_CONDITION',
      name: 'Rival\'s Victory Condition',
      type: 'consequence',
      description: 'What would it take for [RIVAL_NAME] to "win"?',
      examples: ['the party admits defeat', 'they gain power the party sought', 'they prove their belief was right']
    },
    {
      id: 'TWIST',
      name: 'Unexpected Resolution',
      type: 'creative',
      description: 'A third option. What could change everything?',
      examples: ['a greater enemy emerges, forcing partnership', 'one party member chooses the rival\'s side', 'the real enemy was inside all along']
    }
  ],
  notes: 'This creates a multi-encounter arc. Rivalries grow more complex—the NPC should feel like a real person with reasons, not just an obstacle. Each encounter should escalate stakes and reveal new information.',
  isOfficial: true
}

const npcComplex: MadLibTemplate = {
  id: 'npc-complex-1',
  title: 'The Faction Leader\'s Dilemma',
  category: 'NPCs',
  difficulty: 'complex',
  tone: ['political', 'moral', 'dramatic', 'tragic'],
  stakes: 'high',
  description: 'A powerful NPC torn between duty, loyalty, and survival. Players become entangled in faction politics.',
  templateText: `# [LEADER_NAME]: The Weight of Command

**Title:** [LEADER_TITLE]  
**Faction:** [FACTION_NAME]  
**Symbol:** [FACTION_SYMBOL]

## The Surface: Power

To most, [LEADER_NAME] is the undisputed [LEADER_TITLE] of the [FACTION_NAME]. They command [FACTION_SIZE] and answer to no one. Their symbol is the [FACTION_SYMBOL], seen on [FACTION_TRADEMARK]. Most believe [LEADER_NAME] is [PUBLIC_PERCEPTION].

## The Reality: Fragmentation

But within the [FACTION_NAME], [LEADER_NAME] faces a growing [FACTION_CONFLICT]. There are at least two factions within the faction:

**The [HARDLINE_FACTION_NAME]** believes [HARDLINE_BELIEF] and will [HARDLINE_ACTION] to achieve it.

**The [MODERATE_FACTION_NAME]** argues [MODERATE_BELIEF] and has been quietly [MODERATE_ACTION].

[LEADER_NAME] is caught between them, supporting neither publicly but benefiting from both privately. However, this balance is cracking.

## The Pressure Point

[LEADER_NAME] made a deal [TIME_PERIOD] with [ALLY_NPC]. The deal was: in exchange for [CONCESSION], [ALLY_NPC] would [THEIR_PROMISE]. 

But [ALLY_NPC] is [ALLY_STATUS], and the [FACTION_NAME] is starting to notice the broken promise. The hardliners want [HARDLINE_CONSEQUENCE]. The moderates are losing faith.

## The Test

When the party becomes involved, [LEADER_NAME] sees them as [PARTY_POTENTIAL]. They will test the party with [FIRST_TEST]. If the party passes, [LEADER_NAME] will ask them to [HIDDEN_REQUEST].

But completing this request would mean:
- Betraying [PERSON_OR_GROUP]
- Breaking [PRINCIPLE_OR_RULE]
- Enabling [UGLY_OUTCOME]

## The Endgame

[LEADER_NAME]'s faction will shatter unless [CONDITION]. This could happen through:
- The party's actions: [PARTY_OPTION_1]
- An external event: [PARTY_OPTION_2]
- [LEADER_NAME]'s choice: [PARTY_OPTION_3]

No matter what, someone loses.`,
  blanks: [
    {
      id: 'LEADER_NAME',
      name: 'Leader\'s Name',
      type: 'creative',
      description: 'A name that suggests authority and complexity.',
      examples: ['Lord Cassius', 'Magistra Yenwick', 'The Architect'],
      reuseCount: 3
    },
    {
      id: 'LEADER_TITLE',
      name: 'Their Title',
      type: 'specific',
      description: 'What is their official position?',
      examples: ['Guild Master', 'High Priestess', 'Captain-Commander', 'Crime Lord'],
      reuseCount: 2
    },
    {
      id: 'FACTION_NAME',
      name: 'Faction Name',
      type: 'creative',
      description: 'The organization they lead.',
      examples: ['The Silent Hand', 'The Merchant Consortium', 'The Temple of Three Moons'],
      reuseCount: 5
    },
    {
      id: 'FACTION_SYMBOL',
      name: 'The Symbol',
      type: 'creative',
      description: 'What visual represents the faction?',
      examples: ['a silver key', 'a burning crown', 'an open eye']
    },
    {
      id: 'FACTION_SIZE',
      name: 'How Many Follow Them',
      type: 'specific',
      description: 'Approximate scale of their power.',
      examples: ['hundreds', 'thousands', 'everyone in three cities'],
      reuseCount: 2
    },
    {
      id: 'FACTION_TRADEMARK',
      name: 'Where the Symbol Appears',
      type: 'creative',
      description: 'How is the faction marked in the world?',
      examples: ['doors', 'coins', 'tattoos on members']
    },
    {
      id: 'PUBLIC_PERCEPTION',
      name: 'What the Public Thinks',
      type: 'creative',
      description: 'The official narrative about the leader.',
      examples: ['wise and just', 'ruthless but effective', 'mysterious but fair']
    },
    {
      id: 'FACTION_CONFLICT',
      name: 'The Internal Tension',
      type: 'consequence',
      description: 'What tears at the faction from within?',
      constraints: ['Must be ideological or practical, not petty'],
      examples: ['schism between old and new methods', 'competition over succession', 'disagreement on moral limits']
    },
    {
      id: 'HARDLINE_FACTION_NAME',
      name: 'The Hardliners\' Name',
      type: 'creative',
      description: 'What do the traditionalists/extremists call themselves (or what would you call them)?',
      examples: ['The Purists', 'The Old Guard', 'The Iron Core']
    },
    {
      id: 'HARDLINE_BELIEF',
      name: 'Hardliners\' Core Belief',
      type: 'consequence',
      description: 'What do they truly believe?',
      examples: ['"Power is the only law"', '"Our ways must not change"', '"Compromise is death"']
    },
    {
      id: 'HARDLINE_ACTION',
      name: 'What Hardliners Are Doing',
      type: 'consequence',
      description: 'What moves are they making?',
      examples: ['building their own army', 'gathering blackmail', 'preparing to split the faction']
    },
    {
      id: 'MODERATE_FACTION_NAME',
      name: 'The Moderates\' Name',
      type: 'creative',
      description: 'What do the reform-minded call themselves?',
      examples: ['The New Order', 'The Council of Reform', 'The Voices']
    },
    {
      id: 'MODERATE_BELIEF',
      name: 'Moderates\' Core Belief',
      type: 'consequence',
      description: 'What is their philosophy?',
      examples: ['"We must change or die"', '"Power should serve people, not rule them"', '"The world has changed; we must too"']
    },
    {
      id: 'MODERATE_ACTION',
      name: 'What Moderates Are Doing',
      type: 'consequence',
      description: 'How are they making their case?',
      examples: ['organizing meetings in secret', 'recruiting younger members', 'documenting the leader\'s failures']
    },
    {
      id: 'TIME_PERIOD',
      name: 'When the Deal Was Made',
      type: 'creative',
      description: 'How long ago was this promise made?',
      examples: ['five years ago', 'before the war', 'when the leader was young']
    },
    {
      id: 'ALLY_NPC',
      name: 'The Ally',
      type: 'creative',
      description: 'Who did the leader make this deal with?',
      examples: ['the previous faction leader', 'a foreign power', 'a dangerous criminal']
    },
    {
      id: 'CONCESSION',
      name: 'What the Leader Gave',
      type: 'consequence',
      description: 'What did [LEADER_NAME] give up to seal the deal?',
      examples: ['territory', 'a sibling as hostage', 'their original name']
    },
    {
      id: 'ALLY_STATUS',
      name: 'Ally\'s Current Status',
      type: 'consequence',
      description: 'What happened to them?',
      examples: ['dead', 'turned against the leader', 'revealed as a traitor']
    },
    {
      id: 'HARDLINE_CONSEQUENCE',
      name: 'What Hardliners Want as Consequence',
      type: 'consequence',
      description: 'How do the hardliners want to respond to the broken deal?',
      examples: ['declare war', 'execute the leader', 'reclaim what was given']
    },
    {
      id: 'PARTY_POTENTIAL',
      name: 'Why the Party Matters',
      type: 'consequence',
      description: 'Why does the leader suddenly care about the party?',
      examples: ['they have power the leader needs', 'they\'re outsiders who can act without faction suspicion', 'they\'re connected to the broken deal']
    },
    {
      id: 'FIRST_TEST',
      name: 'The Initial Test',
      type: 'consequence',
      description: 'How does the leader test the party\'s loyalty or capability?',
      examples: ['a mission that benefits one internal faction', 'a task that reveals their capabilities', 'something that compromises them']
    },
    {
      id: 'HIDDEN_REQUEST',
      name: 'The Real Ask',
      type: 'consequence',
      description: 'What does the leader ultimately want them to do?',
      constraints: ['Should be morally complicated'],
      examples: ['eliminate a rival faction leader', 'steal evidence of a secret deal', 'turn a key faction member']
    },
    {
      id: 'PERSON_OR_GROUP',
      name: 'Who Would Be Betrayed',
      type: 'consequence',
      description: 'Who suffers from completing the hidden request?',
      examples: ['an innocent faction member', 'a neighboring settlement', 'the party member who\'s actually related to the rival']
    },
    {
      id: 'PRINCIPLE_OR_RULE',
      name: 'What Rule Would Break',
      type: 'consequence',
      description: 'What code or law would the party violate?',
      examples: ['an oath they swore', 'the faction\'s own laws', 'a moral line they\'ve maintained']
    },
    {
      id: 'UGLY_OUTCOME',
      name: 'The Ugly Consequence',
      type: 'consequence',
      description: 'What would actually happen if the party went through with it?',
      examples: ['the faction civil war they were trying to prevent', 'a tyrant gains unchecked power', 'a cycle of revenge begins']
    },
    {
      id: 'CONDITION',
      name: 'The Pivot Point',
      type: 'consequence',
      description: 'What one thing could change the trajectory?',
      examples: ['both factions uniting against an external threat', 'a beloved member choosing reconciliation', 'the faction splitting cleanly instead of tearing']
    },
    {
      id: 'PARTY_OPTION_1',
      name: 'Party Action Outcome',
      type: 'consequence',
      description: 'How could the party\'s choices determine the outcome?',
      examples: ['supporting one faction openly', 'revealing the leader\'s secret', 'forcing a public choice']
    },
    {
      id: 'PARTY_OPTION_2',
      name: 'External Event Outcome',
      type: 'consequence',
      description: 'What external force could intervene?',
      examples: ['a greater threat emerges', 'the broken deal comes due', 'a prophecy fulfills']
    },
    {
      id: 'PARTY_OPTION_3',
      name: 'Leader\'s Choice Outcome',
      type: 'consequence',
      description: 'What might the leader decide to do?',
      examples: ['step down', 'choose a faction and purge the other', 'make a final sacrifice']
    }
  ],
  notes: 'This creates a deep faction conflict where the party isn\'t just fighting enemies—they\'re navigating politics. The leader should feel real: principled but compromised, powerful but trapped. Multiple playthroughs should feel different based on party choices.',
  isOfficial: true
}

// ============================================================================
// ENCOUNTER TEMPLATES
// ============================================================================

const encounterSimple: MadLibTemplate = {
  id: 'encounter-simple-1',
  title: 'The Unexpected Meeting',
  category: 'Encounters',
  difficulty: 'simple',
  tone: ['tense', 'immediate'],
  stakes: 'low',
  description: 'A chance meeting that turns into a conflict. Perfect for random encounters or session momentum.',
  templateText: `# The Unexpected Meeting

While traveling through [LOCATION], the party encounters [OPPONENT_COUNT] [OPPONENT_TYPE] led by [OPPONENT_LEADER].

## Initial Situation

[OPPONENT_LEADER] is in the middle of [ACTIVITY] when they notice the party. Their first reaction is to [FIRST_REACTION].

## Why They Care

They're not initially hostile—they only become dangerous if the party [TRIGGER]. However, [COMPLICATION] makes the situation worse.

## How It Ends

If combat starts, [OPPONENT_TYPE] will [COMBAT_TACTICS]. 

If dialogue happens, [OPPONENT_LEADER] will only stop if the party [NEGOTIATION_WIN].

## The Twist

Afterwards, the party discovers [REVELATION]. This encounter was never what it seemed.`,
  blanks: [
    {
      id: 'LOCATION',
      name: 'Location',
      type: 'creative',
      description: 'Where does this encounter happen?',
      examples: ['a narrow canyon', 'the outskirts of a town', 'a ruined temple'],
      allowRoll: true
    },
    {
      id: 'OPPONENT_COUNT',
      name: 'Number of Opponents',
      type: 'specific',
      description: 'How many enemies? Use numbers appropriate to party size/level.',
      examples: ['3', '5-7', '2 elite + 4 minions']
    },
    {
      id: 'OPPONENT_TYPE',
      name: 'Type of Opponent',
      type: 'specific',
      description: 'What are they? Cultists, bandits, monsters, soldiers?',
      examples: ['mercenaries', 'corrupted townsfolk', 'cult followers', 'wildlife protecting territory'],
      allowRoll: true
    },
    {
      id: 'OPPONENT_LEADER',
      name: 'Opponent Leader',
      type: 'creative',
      description: 'Who leads them? Give them a name and role.',
      examples: ['Captain Dex the Scarred', 'Priestess Vorn', 'The Plague Speaker'],
      reuseCount: 3
    },
    {
      id: 'ACTIVITY',
      name: 'What They\'re Doing',
      type: 'consequence',
      description: 'What interrupts? Must make sense for the location.',
      examples: ['performing a ritual', 'ambushing someone else', 'collecting a debt']
    },
    {
      id: 'FIRST_REACTION',
      name: 'Their Initial Response',
      type: 'creative',
      description: 'Do they immediately fight, talk, flee, or something else?',
      examples: ['draws weapons', 'demands tribute', 'freezes in shock']
    },
    {
      id: 'TRIGGER',
      name: 'The Fight Trigger',
      type: 'consequence',
      description: 'What would make them violent? What line does the party cross?',
      examples: ['interfere with their activity', 'recognize the leader as an old enemy', 'block their escape route']
    },
    {
      id: 'COMPLICATION',
      name: 'The Complication',
      type: 'consequence',
      description: 'What makes the conflict worse? Reinforcements, hazard, innocents at risk?',
      examples: ['reinforcements are 2 rounds away', 'the area is unstable/burning', 'a hostage is threatened']
    },
    {
      id: 'COMBAT_TACTICS',
      name: 'Combat Strategy',
      type: 'consequence',
      description: 'How will they fight? Smart or desperate?',
      examples: ['try to overwhelm quickly', 'use terrain advantages', 'attempt to flee if losing']
    },
    {
      id: 'NEGOTIATION_WIN',
      name: 'Negotiation Victory',
      type: 'consequence',
      description: 'What would convince them to stand down?',
      examples: ['proving mutual enemies', 'offering to help with their real problem', 'showing proof of authority']
    },
    {
      id: 'REVELATION',
      name: 'The Twist',
      type: 'consequence',
      description: 'What do they learn after that changes the meaning of this encounter?',
      constraints: ['Should connect to larger campaign themes'],
      examples: ['the opponent leader was actually protecting someone the party cares about', 'they were being manipulated by a greater enemy', 'it was a test by a faction the party offended']
    }
  ],
  notes: 'Simple encounters are about immediacy. This should be playable in one scene, but the revelation hooks them into larger story.',
  isOfficial: true
}

const encounterModerate: MadLibTemplate = {
  id: 'encounter-moderate-1',
  title: 'The Social Negotiation',
  category: 'Encounters',
  difficulty: 'moderate',
  tone: ['intrigue', 'tense', 'personal'],
  stakes: 'medium',
  description: 'A high-stakes social encounter where combat might happen but doesn\'t have to. Conversation is the weapon.',
  templateText: `# The Negotiation

The party arrives at [MEETING_LOCATION] to meet with [PRIMARY_NPC] and their delegation of [DELEGATION_SIZE] [DELEGATION_TYPE].

## The Stakes

The meeting is happening because [REASON_FOR_MEETING]. [PRIMARY_NPC] needs [WHAT_THEY_WANT] from the party. In exchange, they offer [WHAT_THEY_OFFER].

It sounds fair on the surface, but there are three problems:

1. [HIDDEN_PROBLEM_1]
2. [HIDDEN_PROBLEM_2]
3. [HIDDEN_PROBLEM_3]

## The Pressure

[PRIMARY_NPC] is under pressure from [WHO_IS_PRESSURING] to make this deal happen. They're willing to [ESCALATION] if the party refuses.

Additionally, one member of the delegation—[DELEGATION_MEMBER_NAME]—[DELEGATION_MEMBER_SECRET].

## The Turning Point

At some point, someone will [CRISIS_EVENT]. When this happens, the negotiation becomes [SITUATION_AFTER_CRISIS].

The party now has seconds to decide:
- Give [PRIMARY_NPC] what they want to preserve the deal
- Refuse and [CONSEQUENCE_OF_REFUSAL]
- [UNEXPECTED_THIRD_OPTION]

## The Outcome

If the party chooses wisely: [GOOD_OUTCOME]

If they choose poorly: [POOR_OUTCOME]

If they improvise brilliantly: [BRILLIANT_OUTCOME]`,
  blanks: [
    {
      id: 'MEETING_LOCATION',
      name: 'Meeting Place',
      type: 'creative',
      description: 'Where does this delicate negotiation happen?',
      examples: ['a neutral temple', 'a private manor', 'a ship at anchor', 'the ruins of an old fort']
    },
    {
      id: 'PRIMARY_NPC',
      name: 'Lead Negotiator',
      type: 'creative',
      description: 'Who are they meeting with? Important NPC or organization representative.',
      examples: ['Lady Cassandra, the Merchant Prince', 'General Kael', 'The Crown\'s Ambassador'],
      reuseCount: 3
    },
    {
      id: 'DELEGATION_SIZE',
      name: 'Number in Delegation',
      type: 'specific',
      description: 'How many support staff/guards?',
      examples: ['3', '7-10', 'a full entourage']
    },
    {
      id: 'DELEGATION_TYPE',
      name: 'Type of Delegation',
      type: 'creative',
      description: 'What kind of support? Soldiers, clerks, bodyguards, assassins?',
      examples: ['elite guards', 'scribes and witnesses', 'armed diplomats']
    },
    {
      id: 'REASON_FOR_MEETING',
      name: 'Why This Meeting',
      type: 'consequence',
      description: 'What brings them all together?',
      examples: ['[PRIMARY_NPC] needs the party\'s help with a problem', 'the party approached them', 'mutual allies demanded the meeting']
    },
    {
      id: 'WHAT_THEY_WANT',
      name: 'What [PRIMARY_NPC] Wants',
      type: 'consequence',
      description: 'What is their ask?',
      examples: ['military support against a rival', 'a stolen item recovered', 'silence about a secret']
    },
    {
      id: 'WHAT_THEY_OFFER',
      name: 'What [PRIMARY_NPC] Offers',
      type: 'creative',
      description: 'The stated reward.',
      examples: ['significant coin', 'political favor', 'a location of power', 'information they need']
    },
    {
      id: 'HIDDEN_PROBLEM_1',
      name: 'Problem 1',
      type: 'consequence',
      description: 'First hidden complication.',
      constraints: ['Should be discoverable through investigation'],
      examples: ['the reward is stolen', 'they plan to betray the party after the deal', 'their rival will attack the party if they agree']
    },
    {
      id: 'HIDDEN_PROBLEM_2',
      name: 'Problem 2',
      type: 'consequence',
      description: 'Second hidden complication.',
      examples: ['completing the task ruins an innocent party', 'the offer is worth less than claimed', 'accepting makes them an enemy of the party\'s ally']
    },
    {
      id: 'HIDDEN_PROBLEM_3',
      name: 'Problem 3',
      type: 'consequence',
      description: 'Third hidden complication.',
      examples: ['refusing will cause [PRIMARY_NPC] to become a dangerous enemy', 'the task is actually impossible', 'someone is secretly recording this deal']
    },
    {
      id: 'WHO_IS_PRESSURING',
      name: 'Who\'s Pressuring Them',
      type: 'creative',
      description: 'Who wants this deal to happen?',
      examples: ['a crime lord holding their family', 'their government', 'a more powerful faction']
    },
    {
      id: 'ESCALATION',
      name: 'Their Escalation Threat',
      type: 'consequence',
      description: 'What do they threaten?',
      examples: ['declare the party enemies of their faction', 'reveal damaging information about them', 'make their own dangerous move']
    },
    {
      id: 'DELEGATION_MEMBER_NAME',
      name: 'The Unexpected Ally/Threat',
      type: 'creative',
      description: 'Someone in the delegation has a secret.',
      examples: ['Ser Aldric', 'The scribe in the corner', 'The captain of the guard'],
      reuseCount: 2
    },
    {
      id: 'DELEGATION_MEMBER_SECRET',
      name: 'Their Secret',
      type: 'consequence',
      description: 'What\'s their hidden agenda?',
      examples: ['is actually a spy for a rival', 'wants the deal to fail', 'is a relative of someone the party wronged', 'has evidence [PRIMARY_NPC] is lying']
    },
    {
      id: 'CRISIS_EVENT',
      name: 'The Crisis',
      type: 'consequence',
      description: 'What disrupts the negotiation?',
      examples: ['an assassin appears', 'soldiers arrive with new orders', 'the delegation member reveals their secret', 'news arrives that changes everything']
    },
    {
      id: 'SITUATION_AFTER_CRISIS',
      name: 'New Situation',
      type: 'consequence',
      description: 'How is the situation now different?',
      examples: ['allies are now enemies', 'the deal is impossible', 'time is running out', 'everyone must choose sides']
    },
    {
      id: 'CONSEQUENCE_OF_REFUSAL',
      name: 'Refusal Consequence',
      type: 'consequence',
      description: 'What happens if the party walks away?',
      examples: ['[PRIMARY_NPC] becomes a powerful enemy', 'a war begins', 'innocents suffer', 'a prophecy begins to unfold']
    },
    {
      id: 'UNEXPECTED_THIRD_OPTION',
      name: 'Unexpected Third Path',
      type: 'creative',
      description: 'An unconventional solution the party might find.',
      examples: ['ally with [DELEGATION_MEMBER_NAME] to create a counter-proposal', 'turn [WHO_IS_PRESSURING] against [PRIMARY_NPC]', 'expose the hidden problems and renegotiate']
    },
    {
      id: 'GOOD_OUTCOME',
      name: 'Good Outcome',
      type: 'consequence',
      description: 'If they handle it well.',
      examples: ['make a powerful ally and get the reward', 'resolve the situation without bloodshed', 'prevent a larger conflict']
    },
    {
      id: 'POOR_OUTCOME',
      name: 'Poor Outcome',
      type: 'consequence',
      description: 'If they handle it badly.',
      examples: ['both [PRIMARY_NPC] and their pressurer become enemies', 'they\'re trapped into a dangerous deal', 'violence erupts and innocents suffer']
    },
    {
      id: 'BRILLIANT_OUTCOME',
      name: 'Brilliant Outcome',
      type: 'creative',
      description: 'If they find an unexpectedly great solution.',
      examples: ['gain both the reward AND prevent the coming conflict', 'turn enemies into allies', 'expose a conspiracy and rise in status']
    }
  ],
  notes: 'Social encounters are about information, pressure, and choice. The party should feel like they\'re navigating a minefield of hidden agendas. No single choice is obviously correct.',
  isOfficial: true
}

// ============================================================================
// ITEMS TEMPLATES
// ============================================================================

const itemSimple: MadLibTemplate = {
  id: 'item-simple-1',
  title: 'The Magical Artifact',
  category: 'Items',
  difficulty: 'simple',
  tone: ['mysterious', 'wonder'],
  stakes: 'low',
  description: 'A magical item with a clear purpose and one interesting side effect.',
  templateText: `# [ITEM_NAME]

*A [ITEM_TYPE] that [BASIC_FUNCTION]*

## What It Is

[ITEM_NAME] is a [ITEM_MATERIAL] [ITEM_TYPE]. It was created [CREATION_BACKSTORY].

To activate it, you must [ACTIVATION_METHOD].

## What It Does

When activated, [ITEM_NAME] can [PRIMARY_POWER]. This effect lasts [DURATION] and can be used [FREQUENCY].

The power level is [POWER_LEVEL]—it solves [PROBLEM_IT_SOLVES] but won't stop [WHAT_IT_CANT_DO].

## The Catch

There's always a catch. Whenever [ITEM_NAME] is used, [CONSEQUENCE] happens. It's not dangerous, but it's [CONSEQUENCE_DESCRIPTION].

## History & Hooks

- [PREVIOUS_OWNER] once owned this and used it to [HISTORICAL_EVENT]
- It's been lost/hidden since [WHEN_LOST]
- [RUMOR] claim that [HIDDEN_PROPERTY]

## Upgrade Potential

Legends say that if [UPGRADE_CONDITION], it could [UPGRADED_POWER].`,
  blanks: [
    {
      id: 'ITEM_NAME',
      name: 'Item Name',
      type: 'creative',
      description: 'What is it called?',
      examples: ['The Warden\'s Compass', 'Shadowveil', 'The Truthstone'],
      reuseCount: 3
    },
    {
      id: 'ITEM_TYPE',
      name: 'What Kind of Item',
      type: 'specific',
      description: 'Weapon, tool, jewelry, etc?',
      examples: ['amulet', 'sword', 'key', 'cloak', 'mirror'],
      allowRoll: true
    },
    {
      id: 'BASIC_FUNCTION',
      name: 'Basic Function Hint',
      type: 'creative',
      description: 'One-sentence hint of what it does.',
      examples: ['grants the wielder unnatural luck', 'reveals hidden truths', 'opens paths to other places']
    },
    {
      id: 'ITEM_MATERIAL',
      name: 'Material',
      type: 'creative',
      description: 'What is it made from?',
      examples: ['cold iron etched with silver', 'bone carved with strange runes', 'crystal that never breaks']
    },
    {
      id: 'CREATION_BACKSTORY',
      name: 'Who Made It',
      type: 'creative',
      description: 'How did it come to exist?',
      examples: ['by a now-dead wizard', 'by an enemy faction to serve a purpose', 'as a reward for a god\'s favorite']
    },
    {
      id: 'ACTIVATION_METHOD',
      name: 'How to Activate',
      type: 'creative',
      description: 'What must the user do?',
      examples: ['speak a word of power', 'spill blood on it', 'hold it under moonlight']
    },
    {
      id: 'PRIMARY_POWER',
      name: 'What It Does',
      type: 'consequence',
      description: 'The main effect.',
      examples: ['reveal the true name of any creature', 'summon a protective barrier', 'navigate perfectly in darkness']
    },
    {
      id: 'DURATION',
      name: 'How Long It Lasts',
      type: 'specific',
      description: 'Duration of the effect.',
      examples: ['1 hour', '1 day', 'until sunset']
    },
    {
      id: 'FREQUENCY',
      name: 'How Often',
      type: 'specific',
      description: 'Recharge rate or limitations.',
      examples: ['once per day', 'up to 3 times', 'as often as desired']
    },
    {
      id: 'POWER_LEVEL',
      name: 'Power Assessment',
      type: 'creative',
      description: 'How strong is this item relative to party level?',
      examples: ['quite powerful but not game-breaking', 'useful for specific situations', 'subtle but invaluable']
    },
    {
      id: 'PROBLEM_IT_SOLVES',
      name: 'What Problem It Solves',
      type: 'consequence',
      description: 'What does it make easy?',
      examples: ['finding people who don\'t want to be found', 'surviving lethal poison', 'seeing through deception']
    },
    {
      id: 'WHAT_IT_CANT_DO',
      name: 'Its Limitation',
      type: 'consequence',
      description: 'What won\'t it solve?',
      examples: ['stop a god\'s curse', 'bring back the dead', 'change how people feel about you']
    },
    {
      id: 'CONSEQUENCE',
      name: 'The Cost',
      type: 'consequence',
      description: 'What happens every time it\'s used?',
      examples: ['the user ages slightly', 'echoes of past users appear', 'nearby animals grow uneasy']
    },
    {
      id: 'CONSEQUENCE_DESCRIPTION',
      name: 'How It Feels',
      type: 'creative',
      description: 'Describe the side effect.',
      examples: ['unsettling but harmless', 'fascinating in retrospect', 'a small price for the power']
    },
    {
      id: 'PREVIOUS_OWNER',
      name: 'Famous Previous Owner',
      type: 'creative',
      description: 'Who had this before?',
      examples: ['A legendary hero', 'An exiled queen', 'A mad prophet']
    },
    {
      id: 'HISTORICAL_EVENT',
      name: 'What They Did With It',
      type: 'consequence',
      description: 'How did the previous owner use it?',
      examples: ['won a war thought unwinnable', 'discovered a hidden kingdom', 'prevented a catastrophe']
    },
    {
      id: 'WHEN_LOST',
      name: 'When It Was Lost',
      type: 'creative',
      description: 'How long has it been missing?',
      examples: ['a hundred years', 'in a cataclysm few remember', 'during a betrayal']
    },
    {
      id: 'RUMOR',
      name: 'Rumor Starter',
      type: 'creative',
      description: 'What do people whisper about it?',
      examples: ['Scholars', 'Thieves', 'Priests']
    },
    {
      id: 'HIDDEN_PROPERTY',
      name: 'The Hidden Secret',
      type: 'consequence',
      description: 'What don\'t people know about it?',
      examples: ['it\'s sentient and has its own agenda', 'it can only be used by someone with a specific bloodline', 'it\'s slowly corrupting its owner']
    },
    {
      id: 'UPGRADE_CONDITION',
      name: 'Upgrade Condition',
      type: 'consequence',
      description: 'What would improve it?',
      examples: ['it\'s submerged in a god\'s sacred pool', 'a master crafter remakes it', 'it\'s wielded in a moment of true heroism']
    },
    {
      id: 'UPGRADED_POWER',
      name: 'Upgraded Version',
      type: 'consequence',
      description: 'What could it become?',
      examples: ['grant the user temporary immortality', 'rewrite reality in a small way', 'open doors between worlds']
    }
  ],
  notes: 'Simple items are straightforward tools with personality. The catch should be interesting but not punishing.',
  isOfficial: true
}

const locationSimple: MadLibTemplate = {
  id: 'location-simple-1',
  title: 'The Interesting Tavern',
  category: 'Locations',
  difficulty: 'simple',
  tone: ['atmospheric', 'welcoming', 'mysterious'],
  stakes: 'low',
  description: 'A tavern or inn that\'s more than just a drinking spot. It has personality and hooks.',
  templateText: `# [TAVERN_NAME]

*A tavern in [LOCATION] with a reputation for [REPUTATION]*

## The Place

[TAVERN_NAME] occupies [BUILDING_TYPE] on [LOCATION_DETAIL]. To enter, you pass [ENTRANCE_DETAIL].

The interior is [ATMOSPHERE]. The regular crowd is mostly [REGULAR_CROWD], though strangers are welcomed—if they know [UNSPOKEN_RULE].

## The Proprietor

The place is run by [PROPRIETOR_NAME], a [PROPRIETOR_TYPE] who [PROPRIETOR_PERSONALITY]. Regular patrons say [PROPRIETOR_REPUTATION].

[PROPRIETOR_NAME] keeps a [SPECIAL_THING] in the back room that [SPECIAL_THING_PURPOSE].

## The Hook

Something unusual happens here regularly: [UNUSUAL_EVENT]. 

It's harmless so far, but [COMPLICATION_NOTE]. Local scholars/priests/guards disagree about whether it's [EXPLANATION_OPTION_1] or [EXPLANATION_OPTION_2].

## Information & Favors

If a patron gains [PROPRIETOR_NAME]'s trust, they can learn [SECRET_INFORMATION] or call in favors like [POSSIBLE_FAVOR].

## Why PCs Might Return

- [PATRON_HOOK_1] is a regular and always has work
- [MYSTERIOUS_ELEMENT] keeps drawing people back
- [DANGER] makes it more interesting than it should be`,
  blanks: [
    {
      id: 'TAVERN_NAME',
      name: 'Tavern Name',
      type: 'creative',
      description: 'What is it called?',
      examples: ['The Copper Flagon', 'The Starfall', 'The Broken Wheel'],
      reuseCount: 2
    },
    {
      id: 'LOCATION',
      name: 'City/Region',
      type: 'creative',
      description: 'Where is the tavern?',
      allowRoll: true
    },
    {
      id: 'REPUTATION',
      name: 'What It\'s Known For',
      type: 'creative',
      description: 'What brings people here?',
      examples: ['the best ale in three regions', 'being a neutral ground', 'strange occurrences']
    },
    {
      id: 'BUILDING_TYPE',
      name: 'Building Type',
      type: 'creative',
      description: 'What kind of structure?',
      examples: ['a renovated guardhouse', 'a converted manor', 'an old mill']
    },
    {
      id: 'LOCATION_DETAIL',
      name: 'Specific Location',
      type: 'creative',
      description: 'Where exactly is it?',
      examples: ['the corner of Market and Crown Streets', 'by the river at the bridge', 'in the Shadow Quarter']
    },
    {
      id: 'ENTRANCE_DETAIL',
      name: 'Entrance Characteristic',
      type: 'creative',
      description: 'What stands out about how you enter?',
      examples: ['a door marked with an old symbol', 'heavy curtains blocking the view inside', 'a doorman who knows everyone\'s name']
    },
    {
      id: 'ATMOSPHERE',
      name: 'How It Feels Inside',
      type: 'creative',
      description: 'Describe the ambiance.',
      examples: ['warm and smoky, with low-hanging lanterns', 'newer than it should be, with fresh wood', 'ancient and worn, like time moves slowly here']
    },
    {
      id: 'REGULAR_CROWD',
      name: 'Usual Patrons',
      type: 'creative',
      description: 'Who normally drinks here?',
      examples: ['dock workers and merchants', 'scholars and musicians', 'mercenaries and sellswords']
    },
    {
      id: 'UNSPOKEN_RULE',
      name: 'The Unspoken Rule',
      type: 'consequence',
      description: 'What customs must be observed?',
      examples: ['weapons stay sheathed', 'you mind your own business', 'you pay for any damage you cause']
    },
    {
      id: 'PROPRIETOR_NAME',
      name: 'Owner/Proprietor',
      type: 'creative',
      description: 'Who runs this place?',
      examples: ['Marta Strongarm', 'Old Daven', 'The Keeper'],
      reuseCount: 3
    },
    {
      id: 'PROPRIETOR_TYPE',
      name: 'Proprietor Type',
      type: 'creative',
      description: 'What are they? (Race, profession)',
      examples: ['dwarf', 'tiefling ex-adventurer', 'human who\'s lived here for 40 years']
    },
    {
      id: 'PROPRIETOR_PERSONALITY',
      name: 'Their Personality',
      type: 'creative',
      description: 'How do they act?',
      examples: ['keeps their own counsel but misses nothing', 'laughs at everything and speaks truth when drunk', 'seems kind but dangerous if crossed']
    },
    {
      id: 'PROPRIETOR_REPUTATION',
      name: 'What People Say About Them',
      type: 'creative',
      description: 'Their reputation.',
      examples: ['"they know everyone\'s secrets"', '"fair but not soft"', '"protected us from worse things"']
    },
    {
      id: 'SPECIAL_THING',
      name: 'The Special Thing',
      type: 'creative',
      description: 'What hidden object or item?',
      examples: ['a map to a lost place', 'a journal from a dead adventurer', 'a collection of bizarre trinkets']
    },
    {
      id: 'SPECIAL_THING_PURPOSE',
      name: 'Why They Keep It',
      type: 'consequence',
      description: 'Why is this in the back?',
      examples: ['might help someone find redemption', 'proof of something important', 'too dangerous to destroy']
    },
    {
      id: 'UNUSUAL_EVENT',
      name: 'The Unusual Happening',
      type: 'consequence',
      description: 'What strange thing happens here?',
      examples: ['every full moon, the tavern fills with voices of the dead', 'at midnight, a hooded figure appears and speaks in riddles', 'sometimes drinks taste like memories']
    },
    {
      id: 'COMPLICATION_NOTE',
      name: 'The Complication',
      type: 'consequence',
      description: 'Why might it become a problem?',
      examples: ['it\'s growing more frequent', 'it hurt someone last time', 'the city guard is getting suspicious']
    },
    {
      id: 'EXPLANATION_OPTION_1',
      name: 'Theory 1',
      type: 'creative',
      description: 'One explanation people propose.',
      examples: ['a ghost haunts the place', 'it\'s a curse or blessing', 'it\'s a natural phenomenon they don\'t understand']
    },
    {
      id: 'EXPLANATION_OPTION_2',
      name: 'Theory 2',
      type: 'creative',
      description: 'A conflicting explanation.',
      examples: ['someone is using magic', 'it\'s a hoax for profit', 'it\'s a sign of something coming']
    },
    {
      id: 'SECRET_INFORMATION',
      name: 'Secret the Owner Knows',
      type: 'consequence',
      description: 'What will they tell trusted patrons?',
      examples: ['what\'s really causing the strange events', 'who\'s looking for certain people', 'a path to somewhere important']
    },
    {
      id: 'POSSIBLE_FAVOR',
      name: 'Favor Example',
      type: 'consequence',
      description: 'What might the owner do for someone they trust?',
      examples: ['hide someone from pursuers', 'delay guards asking questions', 'introduce them to the right person']
    },
    {
      id: 'PATRON_HOOK_1',
      name: 'Regular Patron/NPC Hook',
      type: 'creative',
      description: 'A regular patron who has work.',
      examples: ['A retired captain', 'A merchant with a problem', 'A scholar researching something']
    },
    {
      id: 'MYSTERIOUS_ELEMENT',
      name: 'The Mystery',
      type: 'creative',
      description: 'What keeps drawing people back?',
      examples: ['no one stays here loses important things', 'it\'s the only safe place in the city', 'you find what you need if you come at the right time']
    },
    {
      id: 'DANGER',
      name: 'The Danger',
      type: 'consequence',
      description: 'What makes it risky?',
      examples: ['a rival faction uses it as neutral ground', 'the guard wants to shut it down', 'someone important went missing here']
    }
  ],
  notes: 'Good taverns are character hubs. They need personality, mysteries, and reasons to return. The unusual event should create session hooks without being a plot hook by itself.',
  isOfficial: true
}

const sessionHookSimple: MadLibTemplate = {
  id: 'hook-simple-1',
  title: 'The Unexpected Problem',
  category: 'Session Hooks',
  difficulty: 'simple',
  tone: ['immediate', 'urgent'],
  stakes: 'medium',
  description: 'A session-starting hook. Something happens right now, and the party must respond.',
  templateText: `# The Session Begins: [HOOK_TITLE]

## What Just Happened

As the party [PARTY_LOCATION], [INCITING_EVENT].

This is [WHO_DELIVERS_NEWS] who tells them: "[URGENT_MESSAGE]"

## Why It Matters

The party has personal/professional/moral reason to care because [PERSONAL_STAKE].

If they don't act within [TIME_PRESSURE], [CONSEQUENCE_OF_INACTION] will happen.

## The Immediate Problem

The first obvious step is [OBVIOUS_STEP]. This will [OBVIOUS_STEP_RESULT].

But [COMPLICATION] makes it harder than it seems.

## Session Direction

- If they investigate quickly: [INVESTIGATION_HOOK]
- If they ask the wrong questions: [COMPLICATION_HOOK]
- If they delay: [TIME_PRESSURE_HOOK]

## One Unexpected Twist

What they don't know yet: [HIDDEN_INFO]

This will change how they approach [OBVIOUS_STEP] once revealed.`,
  blanks: [
    {
      id: 'HOOK_TITLE',
      name: 'Hook Title',
      type: 'creative',
      description: 'What\'s this session\'s headline?',
      examples: ['The Theft', 'An Old Debt', 'The Missing Sister', 'The Outbreak'],
      reuseCount: 1
    },
    {
      id: 'PARTY_LOCATION',
      name: 'Where Party Starts',
      type: 'creative',
      description: 'Where are they when this hits?',
      examples: ['resting after a long journey', 'in the tavern minding their business', 'traveling the main road']
    },
    {
      id: 'INCITING_EVENT',
      name: 'The Event',
      type: 'consequence',
      description: 'What happens?',
      examples: ['someone bursts through the door, bloodied and panicked', 'a messenger arrives with urgent news', 'the ground shakes and a building collapses']
    },
    {
      id: 'WHO_DELIVERS_NEWS',
      name: 'Who Brings the News',
      type: 'creative',
      description: 'Who tells them?',
      examples: ['a crying child', 'a desperate merchant', 'a city guard', 'an old friend they haven\'t seen in years']
    },
    {
      id: 'URGENT_MESSAGE',
      name: 'The Message',
      type: 'consequence',
      description: 'What exactly are they told? Should be concrete.',
      examples: ['"My daughter was taken from her bed last night"', '"They\'re closing the market district—no one knows why"', '"Help me; they\'re coming for me"']
    },
    {
      id: 'PERSONAL_STAKE',
      name: 'Why This Matters to Them',
      type: 'consequence',
      description: 'Why should the party care?',
      examples: ['the person asking is someone they owe', 'it threatens something they care about', 'ignoring it will cause problems later']
    },
    {
      id: 'TIME_PRESSURE',
      name: 'Time Limit',
      type: 'specific',
      description: 'How much time do they have?',
      examples: ['before sunset', 'before the guard arrives', 'a few hours at most']
    },
    {
      id: 'CONSEQUENCE_OF_INACTION',
      name: 'Cost of Waiting',
      type: 'consequence',
      description: 'What happens if they stall?',
      examples: ['someone dies', 'the situation escalates', 'the party loses an advantage']
    },
    {
      id: 'OBVIOUS_STEP',
      name: 'The Obvious Move',
      type: 'consequence',
      description: 'What would any reasonable person do?',
      examples: ['go to where it happened', 'confront the obvious suspects', 'ask around for information']
    },
    {
      id: 'OBVIOUS_STEP_RESULT',
      name: 'What That Leads To',
      type: 'consequence',
      description: 'What do they find/discover?',
      examples: ['evidence pointing elsewhere', 'a clue that deepens the mystery', 'the hook into the main adventure']
    },
    {
      id: 'COMPLICATION',
      name: 'The Complication',
      type: 'consequence',
      description: 'What makes it harder?',
      examples: ['the guard is already investigating', 'someone doesn\'t want them interfering', 'the location is dangerous']
    },
    {
      id: 'INVESTIGATION_HOOK',
      name: 'Fast Path',
      type: 'consequence',
      description: 'If they move quickly, what do they uncover?',
      examples: ['they catch someone in the act', 'they find a trail while it\'s fresh', 'they prevent the next phase']
    },
    {
      id: 'COMPLICATION_HOOK',
      name: 'Wrong Question Path',
      type: 'consequence',
      description: 'What happens if they ask the wrong people?',
      examples: ['they make an enemy', 'they get false information', 'they alert someone they shouldn\'t']
    },
    {
      id: 'TIME_PRESSURE_HOOK',
      name: 'Delayed Response',
      type: 'consequence',
      description: 'What if they wait?',
      examples: ['the situation escalates dramatically', 'they face an enemy they could have avoided', 'the stakes become personal']
    },
    {
      id: 'HIDDEN_INFO',
      name: 'The Secret',
      type: 'consequence',
      description: 'What changes everything?',
      examples: ['the person asking isn\'t who they seem', 'there are multiple sides to this', 'it connects to a past adventure']
    }
  ],
  notes: 'Session hooks need immediate stakes and a clear reason for the party to care. The complication should prevent the obvious solution from being the right one.',
  isOfficial: true
}

// ============================================================================
// FINAL EXPORTS
// ============================================================================

export const madlibTemplates: MadLibTemplate[] = [
  npcSimple,
  npcModerate,
  npcComplex,
  encounterSimple,
  encounterModerate,
  itemSimple,
  locationSimple,
  sessionHookSimple
]

export const madlibTemplatesMap: Record<string, MadLibTemplate> = {
  [npcSimple.id]: npcSimple,
  [npcModerate.id]: npcModerate,
  [npcComplex.id]: npcComplex,
  [encounterSimple.id]: encounterSimple,
  [encounterModerate.id]: encounterModerate,
  [itemSimple.id]: itemSimple,
  [locationSimple.id]: locationSimple,
  [sessionHookSimple.id]: sessionHookSimple
}
