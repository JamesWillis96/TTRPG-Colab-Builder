-- Professional Random Tables for TTRPG Colab Builder
-- High-quality, non-generic content for creative inspiration
-- Each entry designed to spark questions and implications

-- TABLE 1: NPCs with Complications
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'NPCs with Hidden Stakes',
  'Characters whose problems invite player involvement through moral complexity, not combat.',
  'NPCs',
  ARRAY['npc', 'character', 'hooks', 'motivation', 'tension'],
  '[
    {"text": "A scholar hoarding books from a banned collection because they''re the only thing her late daughter read to her", "weight": 1},
    {"text": "A carpenter who''s been subtly sabotaging buildings for a faction to slowly collapse the city''s infrastructure", "weight": 1},
    {"text": "An informant who trades secrets not for coin but to build leverage in a custody dispute with a noble", "weight": 1},
    {"text": "A healer refusing to treat plague victims until their fees fund a missing person search—their own child", "weight": 1},
    {"text": "A cartographer selling maps to both a kingdom and an invading force, playing both sides to stay neutral", "weight": 1},
    {"text": "A fortune teller genuinely cannot distinguish between what she''s read and what she''s predicted", "weight": 1},
    {"text": "A blacksmith training students in secret who might not know their master is a former war criminal trying to reform", "weight": 1},
    {"text": "A merchant whose entire wealth is counterfeit, but business runs so smoothly no one''s noticed yet", "weight": 1},
    {"text": "A priest who''s slowly rewriting scripture to eliminate contradictions, unaware they''re erasing doctrine", "weight": 1},
    {"text": "A guard captain recruiting guards by testing them in ways that mirror a crime only they remember", "weight": 1},
    {"text": "An alchemist pursuing an obsessive experiment they believe will resurrect someone, funded by criminals", "weight": 2}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 2: Locations with Environmental Storytelling
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Locations with Built-In Conflict',
  'Places that carry history and tension in their architecture and geography, prompting investigation.',
  'Locations',
  ARRAY['location', 'setting', 'environment', 'atmosphere', 'geography'],
  '[
    {"text": "A marketplace built atop a filled-in canal system where buildings periodically sink as the earth settles unevenly", "weight": 1},
    {"text": "A monastery in a valley that ''owns'' the only mountain pass, charging passage tolls and growing wealthy enough to rival the crown", "weight": 1},
    {"text": "An old military fort repurposed as a town, but the original defensive walls now trap residents during emergencies", "weight": 1},
    {"text": "A riverside village where each building is owned by different families descended from a single treaty of marriage rights", "weight": 1},
    {"text": "A forest grove where the trees are older than recorded history and locals won''t log them, making the settlement perpetually wood-poor", "weight": 1},
    {"text": "A plague-abandoned town still maintained by a small cult who believe the disease was divine judgment", "weight": 1},
    {"text": "A crossroads trading post where three nations all claim sovereignty, resulting in tripled taxation and no enforced law", "weight": 2},
    {"text": "A library built around an ancient tree that locals swear ''grows'' new books into its hollows during rain", "weight": 1},
    {"text": "A coastal town where salvage from wrecked ships forms the primary income, making storms both blessing and curse", "weight": 1},
    {"text": "A mountain settlement powered by an underground geothermal spring that''s slowly acidifying the bedrock beneath them", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 3: Magical Items with Costs
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Items with Consequences',
  'Objects of power that want something from their wielder, or whose presence complicates situations.',
  'Items',
  ARRAY['item', 'magic', 'artifact', 'consequence', 'cost'],
  '[
    {"text": "A mirror that shows the viewer as they see themselves, not as they are; wielders become convinced of false truths about their appearance", "weight": 1},
    {"text": "A ledger where recorded debts become magically binding contracts, but you cannot erase mistakes without the debtor''s consent", "weight": 1},
    {"text": "A compass that always points toward the thing you want most, which is not always where you want to go", "weight": 1},
    {"text": "A quill that writes your darkest thoughts in the margins of any document you use it on, visible only to the writer", "weight": 1},
    {"text": "A lockpick that opens anything but can''t be removed from the lock until the room has been entered and exited once", "weight": 1},
    {"text": "A cloak that makes you forgettable to anyone you choose, but wearers develop severe attachment anxiety and paranoia", "weight": 2},
    {"text": "A coin that always lands on the side you desire, but flips it must, once per day—missing even one flip breaks the magic permanently", "weight": 1},
    {"text": "A signet ring that forges any signature perfectly, but authorities have learned to look for its telltale impressions", "weight": 1},
    {"text": "A music box that heals wounds when played, but the melody becomes embedded in the minds of listeners and drives them to seek it obsessively", "weight": 1},
    {"text": "A ledger that records only truthful entries, which makes it invaluable as proof but marks its users as obsessive record-keepers", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 4: Events That Shift Power
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Events with Political Ripples',
  'Happenings that change jurisdiction, loyalty, or resource distribution in unexpected ways.',
  'Events',
  ARRAY['event', 'politics', 'change', 'consequence', 'catalyst'],
  '[
    {"text": "A beloved nobleman dies under suspicious circumstances, and the investigation threatens to expose an affair that would shift succession laws", "weight": 1},
    {"text": "A drought forces two neighboring settlements to share a single well for the first time in generations, violating ancient agreements", "weight": 1},
    {"text": "A discovered crypt reveals a saint wasn''t born where the major church claims, delegitimizing their claim to a holy relic", "weight": 1},
    {"text": "A merchant fleet is lost at sea; their insurance debts now own half the city''s warehouses to the banks that fronted the money", "weight": 1},
    {"text": "A child born to an ''impossible'' union demands their place in a succession, supported by an unexpected faction", "weight": 2},
    {"text": "A bridge collapses during peace negotiations, killing ambassadors from both sides and reigniting conflict before blame can be assigned", "weight": 1},
    {"text": "A historical document surfaces proving a major trade monopoly was built on theft, throwing commerce into chaos", "weight": 1},
    {"text": "A plague sweeps through servant classes only, suddenly collapsing the economy of any family reliant on cheap labor", "weight": 1},
    {"text": "A criminal reveals they were working for a respected council member, forcing a purge of loyalists and creating a power vacuum", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 5: Factions with Competing Goals
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Factions with Internal Fractures',
  'Organizations where even success for one goal undermines another, creating useful moral ambiguity.',
  'Factions',
  ARRAY['faction', 'organization', 'conflict', 'goal', 'tension'],
  '[
    {"text": "A trade guild that needs cheap labor to compete but wealthy merchants to fund it, creating constant tension between expansion and exploitation", "weight": 1},
    {"text": "A militant religious order that grew powerful through warfare but whose scripture demands peace—leaders disagree on interpretation", "weight": 1},
    {"text": "Healers who hoard medical knowledge to maintain prestige but whose own code demands helping the dying regardless of status", "weight": 1},
    {"text": "Assassins'' guild where leadership wants to go legitimate and respectable, but the rank-and-file''s survival depends on staying dangerous", "weight": 2},
    {"text": "A noble house where the primary branch funds the family''s influence but the junior branch produces the best strategists and warriors", "weight": 1},
    {"text": "Scholars who want to preserve knowledge but must destroy certain texts to keep dangerous information from spreading", "weight": 1},
    {"text": "A thieves'' collective that''s become so organized and wealthy they''re now indistinguishable from legitimate business—members don''t want to return to poverty", "weight": 1},
    {"text": "A kingdom''s military where the generals are old rivals from a civil war, united only by external threats but divided on all other policy", "weight": 1},
    {"text": "An adventure company whose founding principle was democracy, but success requires mercenary discipline and hierarchy—they''re fracturing over it", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 6: Mysteries That Defy Easy Answers
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Mysteries with No Clean Solution',
  'Puzzles where investigation leads to contradictions or where solving one problem creates another.',
  'Mysteries',
  ARRAY['mystery', 'puzzle', 'investigation', 'contradiction', 'enigma'],
  '[
    {"text": "A noble''s sealed records prove they were born months before their parents married, but revealing it would destroy a child''s legitimacy—whose inheritance is it anyway?", "weight": 1},
    {"text": "Multiple witnesses claim to be the ''true'' heir to a merchant fortune; handwriting, birthmarks, and documents all support at least two of them equally", "weight": 1},
    {"text": "A series of ''accidents'' at a rival business only profit the victim more each time; they''re somehow getting richer by being sabotaged", "weight": 1},
    {"text": "A historian discovers a major historical event was deliberately staged by someone in power, but exposing it would delegitimize the entire government", "weight": 2},
    {"text": "Someone is stealing only incomplete items—left boots, partial maps, torn letters—as if trying to tell a story through the things taken", "weight": 1},
    {"text": "A missing person''s body is found, but their diary suggests they were in two places simultaneously the day they disappeared", "weight": 1},
    {"text": "A vault is broken into and left completely empty, but records prove it was empty before the theft—the thief created the crime", "weight": 1},
    {"text": "A poisoning victim identifies their poisoner, but the accused has ironclad alibis and their motive is self-destructive; why would they confess to a crime they didn''t commit?", "weight": 1},
    {"text": "Letters suggest a conspiracy, but each conspirator claims the others wrote them falsely; the evidence proving honesty also proves dishonesty", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 7: Rumors That Blur Truth
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Rumors with Kernel of Truth',
  'Gossip that might be partly true, entirely false, or dangerous precisely because it''s plausible.',
  'Rumors',
  ARRAY['rumor', 'gossip', 'hearsay', 'intrigue', 'deception'],
  '[
    {"text": "They say the guard captain is resigning, but his replacement has already been chosen in secret—someone wanted him gone", "weight": 1},
    {"text": "Word is a noble''s entire estate is built on land that was stolen, and the true owner''s descendants are gathering evidence", "weight": 1},
    {"text": "Whispers claim a beloved healer''s cures work because they trade with fey, but then again, people do recover faster under their care", "weight": 1},
    {"text": "The story goes that the library burned down intentionally to hide a secret section, but the current librarian seems genuinely distraught about it", "weight": 2},
    {"text": "They say a merchant has been selling counterfeits for years, but his customers swear by his goods and prices are too good to be false", "weight": 1},
    {"text": "Rumor has it a crime was staged by someone inside the investigation itself to cover up something worse", "weight": 1},
    {"text": "People whisper that a settlement''s prosperity comes from a deal made with something inhuman, and the debt is coming due", "weight": 1},
    {"text": "Word is a council member is embezzling, but their accounting is so intricate that no auditor can prove or disprove it", "weight": 1},
    {"text": "The tale spreads that a respected warrior was actually defeated in combat and pays the victor tribute in secret to keep their reputation", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 8: Complications (Multi-Purpose)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Complications That Escalate',
  'Situations that can be injected anywhere to add friction, cost, or consequence to plans.',
  'Events',
  ARRAY['complication', 'obstacle', 'cost', 'friction', 'escalation'],
  '[
    {"text": "The solution requires something from an enemy—but refusing to deal with them means the original problem becomes critical", "weight": 1},
    {"text": "Success attracts the attention of someone with more power than anyone currently involved, who has their own agenda", "weight": 1},
    {"text": "The cost of solving this problem becomes so well-known that it attracts competitors and imitators who complicate it further", "weight": 1},
    {"text": "The solution is available, but only from someone who will call in a favor later that the party can''t predict or refuse", "weight": 2},
    {"text": "Fixing one problem requires breaking something else that''s been holding back a bigger crisis", "weight": 1},
    {"text": "The time limit is shorter than initially stated, and the person who delayed the information reveals a conflict of interest", "weight": 1},
    {"text": "The obvious solution has already been tried by someone else, and their failure cost something the party now has to account for", "weight": 1},
    {"text": "Success would destroy the party''s relationship with someone they need for a different problem they don''t know is coming yet", "weight": 1},
    {"text": "The authority to solve this is disputed between two factions that will see any action as favoring the other side", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 9: Story Hooks (Specific Scenarios)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Story Hooks with Built-In Conflict',
  'Starting points that already contain contradiction, tension, or moral complexity—not just ''you meet in a tavern.''',
  'Events',
  ARRAY['hook', 'story', 'scenario', 'beginning', 'tension'],
  '[
    {"text": "A faction hires the party for a job, but the target is someone the party has an unrevealed debt or relationship with", "weight": 1},
    {"text": "The party receives payment for something they didn''t do, and now must decide whether to keep it or face the real guilty party''s gratitude", "weight": 1},
    {"text": "Someone in authority offers the party a deal that benefits them but would require breaking a minor law they didn''t know existed", "weight": 1},
    {"text": "The party witnesses a crime but identifying the perpetrator would cause them collateral damage the party didn''t anticipate", "weight": 2},
    {"text": "An NPC asks the party for a favor in a way that suggests they know something about the party''s past", "weight": 1},
    {"text": "A town''s problem is only solvable by choosing between two equally deserving factions with equally good reasons for their demands", "weight": 1},
    {"text": "The party is mistaken for someone else, and the real version is going to arrive soon with expectations of cooperation", "weight": 1},
    {"text": "Someone offers the party resources and protection in exchange for appearing to support a cause the party is morally uncertain about", "weight": 1},
    {"text": "The party discovers that a problem they ''solved'' earlier was a symptom, and the real issue is now their responsibility by precedent", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 10: Environmental Details (Flavor)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Environmental Details with Implication',
  'Observational details that suggest history, conflict, or hidden narratives without stating them.',
  'Locations',
  ARRAY['detail', 'environment', 'observation', 'atmosphere', 'worldbuilding'],
  '[
    {"text": "Fresh flowers placed at a specific street corner daily, but no one claims to know who leaves them or why", "weight": 1},
    {"text": "A section of town where buildings are uniformly expensive and beautiful, but windows are all shuttered and no one shops there", "weight": 1},
    {"text": "Graffiti that changes weekly with messages that seem to be in conversation with each other, written by different hands", "weight": 1},
    {"text": "A well-maintained road leading nowhere, stopping abruptly in the wilderness; nothing at the end but locals treat it as significant", "weight": 1},
    {"text": "Buildings where the doors have been moved or relocated recently—locals navigate by the old entrances, creating confusion", "weight": 1},
    {"text": "A section of forest where trees are marked with symbols that seem deliberate but no one living knows what they mean anymore", "weight": 1},
    {"text": "Merchant stalls that shift location daily in a seemingly random pattern, but merchants seem to know where to find each other", "weight": 2},
    {"text": "A town square statue of someone famous where locals deliberately avoid looking at it, and children are taught to do the same", "weight": 1},
    {"text": "Multiple buildings with windows sealed shut from the inside, no visible reason, and owners won''t discuss why", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);
