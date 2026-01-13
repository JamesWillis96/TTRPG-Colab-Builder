-- 20 Premium Random Tables for Professional Worldbuilding
-- Each table explores a distinct conceptual axis
-- Scale: personal to cosmic | Focus: emotional to mundane-but-strange
-- All entries create tension, choice, or consequence

-- TABLE 1: Social Complications (Relationship Dynamics Gone Wrong)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Social Complications',
  'Relationship problems that can''t be solved by talking it out. Friction points where people want different things and both reasons are valid.',
  'Social',
  ARRAY['relationship', 'complication', 'conflict', 'social', 'tension'],
  '[
    {"text": "A marriage has a built-in expiration date (cultural or legal); they must renegotiate or part when the date arrives", "weight": 1},
    {"text": "Someone is respected because they''re believed to be something they''re not—revealing the truth would humiliate those who stand by them", "weight": 1},
    {"text": "Two people have made conflicting promises to the same person; honor requires betraying one of them", "weight": 1},
    {"text": "A friendship is stable only because both people believe a specific lie about the other; the truth would destroy it", "weight": 1},
    {"text": "Someone must maintain an inheritance condition (stay married, live here, keep the name) that makes them unhappy—breaking it loses everything", "weight": 2},
    {"text": "Two groups both consider the person part of their community; obligations to one directly contradict obligations to the other", "weight": 1},
    {"text": "A secret alliance between two people would devastate a third person who trusts them both—keeping the secret requires lying actively", "weight": 1},
    {"text": "Someone provided crucial help years ago; now they expect a favor that will harm a dependent or loved one", "weight": 1},
    {"text": "A former enemy has changed sides but the community refuses to accept it; protecting them requires betraying the community''s trust", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 2: Dangerous Conveniences (Things That Solve Problems But Create New Ones)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Dangerous Conveniences',
  'Shortcuts, solutions, and services that work perfectly—at a cost no one fully considers until later.',
  'Items',
  ARRAY['convenience', 'danger', 'cost', 'solution', 'trap'],
  '[
    {"text": "A memory-erasing drug that removes trauma cleanly; users become hollow and emotionless when used regularly", "weight": 1},
    {"text": "A communication method that works across any distance instantly, except users can''t tell if they''re being listened to by hostile parties", "weight": 1},
    {"text": "A service that pays excellent money for a simple task; the task itself is harmless but financially ties the person to a criminal organization", "weight": 2},
    {"text": "A loan shark who will fund anything at reasonable interest, but the contract uses identical wording for two very different clauses", "weight": 1},
    {"text": "A food crop that grows in any climate and yields double harvests—but consumes soil nutrients so thoroughly the land becomes barren after 5 years", "weight": 1},
    {"text": "A substance that grants perfect confidence and removes fear; users become reckless and don''t process pain or failure correctly", "weight": 1},
    {"text": "An organization that eliminates problems for a fee; they always solve them, but the solutions are disproportionately violent", "weight": 1},
    {"text": "A magical practice that works only if you never question whether it works; the moment you doubt, it stops functioning", "weight": 1},
    {"text": "A medication that cures a disease but the side effect becomes hereditary in descendants", "weight": 1},
    {"text": "A shortcut to power that requires sacrificing something that seemed worthless at the time; the sacrifice compounds over years", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 3: Costs of Magic (Mundane Prices for Supernatural Power)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Costs of Magic',
  'Every spell, enchantment, or supernatural benefit carries a price—but not the obvious one.',
  'Magic',
  ARRAY['magic', 'cost', 'consequence', 'supernatural', 'price'],
  '[
    {"text": "Magic requires the caster to forget one real memory each use; over time, identity becomes fragmented", "weight": 1},
    {"text": "Spells work perfectly but age the caster''s hands visibly; after 20 spells, the hands are ancient and brittle", "weight": 1},
    {"text": "Magic requires speaking a true statement about the caster—the more powerful the spell, the more damaging the truth must be", "weight": 2},
    {"text": "Enchanted objects grant wishes but slowly align the owner''s personality to the object''s nature—weapons make owners violent, mirrors make them vain", "weight": 1},
    {"text": "Magic drains the color from the caster''s environment—after years, they live in a gray world", "weight": 1},
    {"text": "Spells work but create a ''debt'' that manifests as persistent bad luck until repaid through physical labor", "weight": 1},
    {"text": "Magic requires the caster to trade 1 day of life for 1 spell cast; years of magic study means dying young", "weight": 1},
    {"text": "Enchantments work only if no one benefits who doesn''t ''deserve'' it—the magic judges morality", "weight": 1},
    {"text": "Magic requires the caster to burn something irreplaceable each time—documents, relationships, opportunities", "weight": 1},
    {"text": "Spells work but the caster must speak in rhyme for 24 hours afterward; breaking rhythm cancels the spell retroactively", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 4: Places with Rules (Locations That Enforce Their Own Logic)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Places with Rules',
  'Locations where the rules are physical, not social. Break them and the place itself responds.',
  'Locations',
  ARRAY['location', 'rules', 'structure', 'physics', 'danger'],
  '[
    {"text": "A library where books reorganize themselves if you return them misplaced; patrons who return books wrong are forbidden entry the next day", "weight": 1},
    {"text": "A village where no one can lie; the pressure of enforced truth breeds resentment and people communicate only essentials", "weight": 1},
    {"text": "A bridge that requires a toll—not money, but a genuine secret about yourself; travelers are forced to give away vulnerabilities", "weight": 2},
    {"text": "A market where prices change based on the buyer''s emotional state; anxious buyers pay more, confident ones pay less", "weight": 1},
    {"text": "A forest where violence is impossible; weapons jam, muscles won''t obey, making it useless for defense", "weight": 1},
    {"text": "A building where rooms exist only when needed; people searching for a room keep finding it, but the layout changes constantly", "weight": 1},
    {"text": "A garden where plants grow in reverse time; the more you tend them, the less mature they become, eventually vanishing", "weight": 1},
    {"text": "A street where every action echoes—loud voices trigger loud responses from the street itself", "weight": 1},
    {"text": "A building with doors that open only to people who can justify why they deserve entry; the judgment is instant and final", "weight": 1},
    {"text": "A threshold where you must trade your name to pass; once across, you have no name until you trade something equally valuable to return", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 5: Events That Already Happened (The Past Reaching Forward)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Events That Already Happened',
  'History that remains consequential. Past events still shaping present conflicts.',
  'Events',
  ARRAY['event', 'history', 'past', 'consequence', 'legacy'],
  '[
    {"text": "A betrayal from 30 years ago created factional splits that communities still organize around, even if no one remembers the original cause", "weight": 1},
    {"text": "A war ended in peace, but the maps were never redrawn; people live in wrong districts, and boundaries remain contested", "weight": 1},
    {"text": "A disease was cured by a doctor—but the cure came from an evil ritual; communities that used it are tainted by association", "weight": 1},
    {"text": "A cult was disbanded but their philosophy persists; people follow their practices without knowing the source", "weight": 2},
    {"text": "A bridge was destroyed in conflict; rebuilding it requires passing through territory controlled by people who profit from its absence", "weight": 1},
    {"text": "An alliance sealed by marriage created blood ties that now complicate a new political conflict", "weight": 1},
    {"text": "A leader made a promise their successor is expected to keep, but circumstances have made it ruinous", "weight": 1},
    {"text": "A library burned down; people still argue about what knowledge was lost and rebuild plans around recovering it", "weight": 1},
    {"text": "An evacuation from centuries ago created a permanent settlement in an unexpected place; returning to original lands means displacing these people", "weight": 1},
    {"text": "A murder was never solved; the accused was exonerated but treated as guilty anyway, and their family carries the stigma", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 6: Favors Owed (Debts and Obligations with Teeth)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Favors Owed',
  'Unpaid debts that become more valuable and dangerous the longer they wait to be called.',
  'Social',
  ARRAY['debt', 'favor', 'obligation', 'leverage', 'risk'],
  '[
    {"text": "Someone smuggled a child away during a conflict; now they call asking the child to commit a crime to repay", "weight": 1},
    {"text": "A person saved someone''s life; the debt-holder expects repayment by dying in their place", "weight": 1},
    {"text": "A merchant paid for someone''s disease cure; the debt now requires the person to work for them at sub-living wages", "weight": 1},
    {"text": "A fixer once removed evidence of a crime; now they demand the person commit a similar crime to repay", "weight": 2},
    {"text": "Someone tutored a child who became powerful; they claim the child owes them political support", "weight": 1},
    {"text": "A soldier fought beside someone; they now expect absolute loyalty despite conflicting orders", "weight": 1},
    {"text": "Someone once backed a risky business venture; now they demand a percentage of profits and decision-making power", "weight": 1},
    {"text": "A person was allowed to hide on someone''s property during persecution; the debt is their permanent availability for unspecified tasks", "weight": 1},
    {"text": "Someone covered for another during a crucial moment; they claim veto power over the person''s major decisions", "weight": 1},
    {"text": "A teacher invested years training someone; they now expect the student to teach their enemy''s children", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 7: Misunderstood Threats (Dangers Perceived Incorrectly)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Misunderstood Threats',
  'Things feared for the wrong reasons. The real danger is different from the perceived one.',
  'Threats',
  ARRAY['threat', 'misunderstanding', 'perception', 'danger', 'assumption'],
  '[
    {"text": "A monster everyone hunts actually prevents a worse predator from hunting; killing it creates a real crisis", "weight": 2},
    {"text": "A disease people flee from is spread by the cure-seekers, not the sick; isolation would have contained it", "weight": 1},
    {"text": "A cult is believed to be evil, but they''re actually a disaster relief organization practicing what looks like heretical rituals", "weight": 1},
    {"text": "A foreign group is feared as invaders; they''re actually refugees fleeing something worse", "weight": 1},
    {"text": "A natural phenomenon is blamed on a person; that person is actually trying to prevent the phenomenon from worsening", "weight": 1},
    {"text": "A criminal is hunted for murders they didn''t commit; the real killer is someone the community trusts", "weight": 1},
    {"text": "A poison is feared but is actually the only treatment for a slow condition; people die from refusing it", "weight": 1},
    {"text": "A power source is believed corrupting; it''s actually stabilizing, and abandoning it causes collapse", "weight": 1},
    {"text": "A tradition is followed to prevent a disaster that already happened; continuing it prevents something unrelated", "weight": 1},
    {"text": "A group is exiled as dangerous; they were actually protecting the settlement from something still present", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 8: Cultural Taboos (Things Everyone Knows Not to Do)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Cultural Taboos',
  'Prohibitions so embedded in culture that breaking them marks you as dangerous, even if rational justification is forgotten.',
  'Culture',
  ARRAY['taboo', 'culture', 'prohibition', 'tradition', 'violation'],
  '[
    {"text": "Criticism of the founders is forbidden; repeating their words exactly is mandated. The original texts contradict current policy", "weight": 1},
    {"text": "Speaking names of the dead aloud is prohibited; people with common names must use replacements, complicating communication", "weight": 1},
    {"text": "Trading certain colors is forbidden; this restricts trade agreements with outside nations", "weight": 1},
    {"text": "Touching a certain plant is taboo; it''s actually edible and nutritious, but hunger can''t override the cultural prohibition", "weight": 2},
    {"text": "Stories about specific events can''t be told during certain seasons; when crisis strikes that season, people can''t consult relevant history", "weight": 1},
    {"text": "Building on certain ground is forbidden; this prevents settlement of valuable land and drives expansion into dangerous regions", "weight": 1},
    {"text": "Questions about leadership lineage can''t be asked; this hides that the current leader''s claim is weak", "weight": 1},
    {"text": "Studying a historical war is prohibited; ignorance of that conflict means repeating its mistakes", "weight": 1},
    {"text": "Creating art in a particular style invokes curse rumors; artists self-censor rather than risk reputation", "weight": 1},
    {"text": "Entering a specific building without ritual preparation is forbidden; the interior contains knowledge the community doesn''t want accessed", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 9: Failed Solutions (Things That Were Meant to Fix Problems)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Failed Solutions',
  'Interventions, reforms, and fixes that didn''t work and now complicate everything they touch.',
  'Systems',
  ARRAY['failure', 'solution', 'reform', 'consequence', 'system'],
  '[
    {"text": "A price control meant to help the poor created black markets and reduced supply; now legitimate sellers charge twice as much", "weight": 1},
    {"text": "A law requiring registration of magic users drove magic practitioners underground where no oversight exists", "weight": 1},
    {"text": "An amnesty program meant to reduce conflict created resentment among victims; the conflict is worse now", "weight": 1},
    {"text": "A trade agreement meant to reduce conflict made the region economically dependent on a hostile nation", "weight": 2},
    {"text": "A technological breakthrough meant to replace labor has left thousands without income and no path to new work", "weight": 1},
    {"text": "A vaccination program reduced disease but caused long-term infertility; the population is aging into crisis", "weight": 1},
    {"text": "A military disarmament treaty left the region defenseless; a new threat has appeared", "weight": 1},
    {"text": "A dam built for irrigation destroyed the ecosystem; the water it provides is now the only resource keeping people alive in the region", "weight": 1},
    {"text": "A forced assimilation policy eliminated cultural conflicts but erased history and identity; a cultural revival movement is destabilizing", "weight": 1},
    {"text": "An education reform made the school system cheaper but eliminated apprenticeships; now no one learns practical skills", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 10: Secrets That Want Out (Information Under Pressure to Be Revealed)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Secrets That Want Out',
  'Information so volatile that keeping it requires active effort. People slip, documents survive, witnesses talk.',
  'Secrets',
  ARRAY['secret', 'information', 'pressure', 'revelation', 'knowledge'],
  '[
    {"text": "A leader''s child is the product of an affair; multiple people know and the lie requires constant management", "weight": 1},
    {"text": "A trusted institution is built on fraud; auditors are paid to miss inconsistencies, creating a system that must constantly expand lies", "weight": 2},
    {"text": "A medicine works but uses forbidden ingredients; manufacturers live with constant fear of exposure", "weight": 1},
    {"text": "A famous victory was actually a defeat that someone strategically misreported; documents exist that contradict the official history", "weight": 1},
    {"text": "Multiple people witnessed a crime involving someone powerful; witnesses must coordinate to keep the secret", "weight": 1},
    {"text": "A settlement''s prosperity is built on resources stolen from another group; descendants of the victims know", "weight": 1},
    {"text": "A religious figure lost faith decades ago but maintains the appearance; they confided in one person who must keep the secret", "weight": 1},
    {"text": "A government agency is conducting illegal experiments; documents are stored in multiple locations to prevent total loss", "weight": 1},
    {"text": "A historical atrocity was committed by ancestors; descendants carry shame they''re not allowed to acknowledge", "weight": 1},
    {"text": "Someone knows the location of a valuable resource; telling anyone else means losing the advantage, but keeping the secret means dying with it", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 11: Things That Almost Work (Near-Solutions with Fatal Flaws)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Things That Almost Work',
  'Plans, systems, and approaches that function 95% of the time. The 5% failure rate is catastrophic.',
  'Systems',
  ARRAY['flaw', 'limitation', 'failure', 'system', 'edge-case'],
  '[
    {"text": "A communication network fails whenever it rains; the society developed for dry seasons but expanding into wet regions now has blind spots", "weight": 1},
    {"text": "A defense system works against expected threats but has one critical vulnerability that one person discovered", "weight": 1},
    {"text": "A food production method yields abundantly except on the winter solstice; that one day creates annual starvation risk", "weight": 2},
    {"text": "A peace treaty holds except when specific people meet; their ancestral conflict overrides the agreement", "weight": 1},
    {"text": "A spell works perfectly except in one specific location; people keep trying to use it there with unexpected results", "weight": 1},
    {"text": "A legal system ensures justice except when the accused is connected to power; one exception has corrupted the whole system", "weight": 1},
    {"text": "A predictive method forecasts events with 99% accuracy until someone learns to work around it", "weight": 1},
    {"text": "A building is perfectly designed except for one corner room where the architecture creates a fatal flaw", "weight": 1},
    {"text": "A relationship works except when certain topics arise; the couple avoids those topics but resentment builds", "weight": 1},
    {"text": "A political compromise satisfies everyone except for one minority group whose interests were sacrificed", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 12: Bargains with Hidden Timelines (Deals with Delayed Consequences)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Bargains with Hidden Timelines',
  'Agreements where consequences emerge slowly. The person paying the price might not realize for years.',
  'Bargains',
  ARRAY['bargain', 'deal', 'consequence', 'delayed', 'trap'],
  '[
    {"text": "A contract exchanges wealth for health; each payment buys one year of vitality, but the cost compounds and becomes unpayable", "weight": 1},
    {"text": "A bargain grants success in exchange for comfort; the person succeeds but happiness diminishes proportionally", "weight": 1},
    {"text": "A deal exchanges poverty for luck; fortune arrives but alienates everyone close to the person", "weight": 2},
    {"text": "An agreement grants immortality on condition of solitude; the person realizes after centuries that the condition was the goal", "weight": 1},
    {"text": "A contract trades memory for knowledge; the person forgets themselves while gaining expertise", "weight": 1},
    {"text": "An exchange gives power but requires increasing sacrifice; the person doesn''t realize the sacrifices compound until trapped", "weight": 1},
    {"text": "A deal provides resources with the clause that they must be used within the year; failure to use them costs more next year", "weight": 1},
    {"text": "A bargain grants a wish with the requirement that the person perform an unrelated task monthly; years in, tasks become difficult", "weight": 1},
    {"text": "An agreement provides healing with the side-effect that pain is redistributed; the person feels everyone''s suffering instead", "weight": 1},
    {"text": "A contract grants victory on condition of silence; the person wins but can never speak about it, and the silence damages relationships", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 13: Authority Figures Under Pressure (Leaders in Impossible Positions)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Authority Figures Under Pressure',
  'Leaders forced to choose between impossible options. Their decisions will harm someone no matter what.',
  'Politics',
  ARRAY['authority', 'leader', 'pressure', 'impossible', 'choice'],
  '[
    {"text": "A commander must choose between abandoning soldiers or disobeying orders that would save them; both choices destroy their career", "weight": 1},
    {"text": "A judge must sentence their mentor or release a known criminal; conviction means betraying someone who taught them everything", "weight": 1},
    {"text": "A parent leading a community must enforce a law that would exile their own child", "weight": 2},
    {"text": "A ruler''s advisor loves the enemy general; the advisor must choose between personal happiness and state security", "weight": 1},
    {"text": "A religious leader discovers the foundation of their faith is false; revealing it destroys their community", "weight": 1},
    {"text": "An official is blackmailed with proof that a family member committed a crime; turning over evidence means destroying that family", "weight": 1},
    {"text": "A merchant guild leader must choose between increasing prices (harming the poor) or going bankrupt", "weight": 1},
    {"text": "A city magistrate must relocate a neighborhood for development; the displaced residents have nowhere to go", "weight": 1},
    {"text": "A military leader discovers their government is committing atrocities; revealing it ends careers and might start a civil war", "weight": 1},
    {"text": "A guardian must choose between keeping an impossible promise to a deceased person or violating the wishes of the living", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 14: Infrastructure with Personality (Systems That Resist or Enable)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Infrastructure with Personality',
  'Physical systems and structures that shape behavior and politics just by existing the way they do.',
  'Systems',
  ARRAY['infrastructure', 'structure', 'system', 'design', 'consequence'],
  '[
    {"text": "A bridge connects two hostile regions perfectly, making conflict inevitable rather than avoidable; removing it is impossible", "weight": 1},
    {"text": "A road network accidentally created a single point of control; whoever holds the center controls all trade", "weight": 1},
    {"text": "A city layout forces different classes to share markets; conflict is built into commerce", "weight": 1},
    {"text": "A harbor design makes it perfect for trade but impossible to defend from naval attack", "weight": 2},
    {"text": "Water infrastructure was designed by someone hostile to the current government; it fails at critical moments", "weight": 1},
    {"text": "A wall was meant to protect but instead trapped a population; removing it requires military intervention", "weight": 1},
    {"text": "A building was designed by an architect with a specific ideology; the structure reinforces it despite changing politics", "weight": 1},
    {"text": "A road network makes certain areas unreachable; those areas became criminal havens because isolation bred lawlessness", "weight": 1},
    {"text": "A fortification was designed to stop external threats but is equally effective at preventing internal escape", "weight": 1},
    {"text": "A communication network''s structure means certain groups can''t speak to each other without going through intermediaries", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 15: Objects with Social Weight (Things That Matter Beyond Utility)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Objects with Social Weight',
  'Items whose value isn''t functional but symbolic. Possessing them carries expectations and obligations.',
  'Items',
  ARRAY['object', 'symbol', 'weight', 'social', 'obligation'],
  '[
    {"text": "A ring marks membership in an organization; wearing it means the wearer represents the group in all actions", "weight": 1},
    {"text": "A family heirloom comes with unwritten rules about who can possess it; the current owner is expected to make decisions based on tradition", "weight": 1},
    {"text": "A book is believed to be written by a founder; possessing it means people petition you for wisdom constantly", "weight": 2},
    {"text": "A weapon is known to have killed a legendary enemy; owning it makes the owner a target for those seeking proof of worth", "weight": 1},
    {"text": "A piece of art is understood to represent a period; owning it means curating its story in perpetuity", "weight": 1},
    {"text": "A name title comes from an object; losing the object means losing the title and associated authority", "weight": 1},
    {"text": "A medal marks survival of an event; wearing it invokes expectations of wisdom from that experience", "weight": 1},
    {"text": "A piece of currency from a defunct nation is valuable for its rarity; collectors compete dangerously for it", "weight": 1},
    {"text": "A key is believed to unlock something important; possessing it means everyone believes you''re responsible for accessing it", "weight": 1},
    {"text": "A portrait marks ancestry; displaying it publicly claims status that others might dispute violently", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 16: Promises Made in Desperation (Vows with Unforeseen Implications)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Promises Made in Desperation',
  'Vows sworn in crisis, now impossible to keep or break without severe consequence.',
  'Promises',
  ARRAY['promise', 'vow', 'desperation', 'consequence', 'obligation'],
  '[
    {"text": "Someone swore to never leave a city to save themselves; that city is now in danger and leaving is survival", "weight": 1},
    {"text": "A person vowed to protect someone who later becomes a danger to everyone else", "weight": 1},
    {"text": "A promise to ''always choose family first'' now conflicts with a promise to ''always support the cause''", "weight": 2},
    {"text": "Someone swore to continue a practice that has become morally indefensible", "weight": 1},
    {"text": "A vow to ''never speak of'' something means the person carries exclusive knowledge of critical danger", "weight": 1},
    {"text": "Someone promised to raise a child as their own; the child has become someone the parent despises", "weight": 1},
    {"text": "A promise to ''always trust'' someone was made to a person who later proves trustworthy only to the person''s enemies", "weight": 1},
    {"text": "Someone vowed to pass a position/power to a specific person; that person has proven unfit", "weight": 1},
    {"text": "A deathbed promise requires action that would harm the living", "weight": 1},
    {"text": "A sworn oath binds the person to a cause that has fundamentally changed", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 17: Situations Worsened by Help (Good Intentions Creating Worse Problems)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Situations Worsened by Help',
  'Interventions that make everything worse. The helpers meant well. The recipients are now worse off.',
  'Consequences',
  ARRAY['help', 'intervention', 'consequence', 'worsened', 'mistake'],
  '[
    {"text": "A doctor treated someone for a misdiagnosed condition, worsening the real illness; the person trusts no medical help now", "weight": 1},
    {"text": "A military alliance sent troops that were defeated; the region is now occupied", "weight": 1},
    {"text": "A relative paid off debts; now the debtor is obligated to the relative in ways that dominate their life", "weight": 2},
    {"text": "A friend offered advice that seemed wise; it put the person in a precarious position", "weight": 1},
    {"text": "A teacher ''corrected'' someone''s technique, damaging their natural ability", "weight": 1},
    {"text": "Someone intervened in a conflict, picking a side that lost", "weight": 1},
    {"text": "An organization provided aid that created dependency; without it, people would have adjusted independently", "weight": 1},
    {"text": "A well-meaning rule was created to fix one problem; it created five new ones", "weight": 1},
    {"text": "Someone ''helped'' by removing a difficult person; that person was actually crucial", "weight": 1},
    {"text": "Financial support was provided unconditionally; the recipient developed terrible spending habits", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 18: Truths Everyone Knows But Won't Say (Social Consensus Maintaining Lies)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Truths Everyone Knows But Won''t Say',
  'Open secrets upheld by collective denial. Speaking them aloud means social exile.',
  'Secrets',
  ARRAY['truth', 'secret', 'denial', 'social', 'consensus'],
  '[
    {"text": "A leader is unfit but everyone pretends competence; speaking up means being labeled disloyal", "weight": 1},
    {"text": "A community''s prosperity is built on exploitation; acknowledging it would require dismantling the system", "weight": 1},
    {"text": "A tradition is based on false history; revealing the truth means invalidating community identity", "weight": 2},
    {"text": "A group''s authority is enforced by fear, not respect; saying so would mean confronting the violence", "weight": 1},
    {"text": "A institution is corrupt; everyone benefits slightly, so no one exposes it", "weight": 1},
    {"text": "A shared belief is superstition; believing anyway is easier than admitting irrationality", "weight": 1},
    {"text": "A person ''in charge'' has never actually made a decision; others quietly manage them", "weight": 1},
    {"text": "A law is never enforced against the wealthy; everyone knows and says nothing", "weight": 1},
    {"text": "A history is inverted; actual victims are portrayed as perpetrators and vice versa", "weight": 1},
    {"text": "A shared sacrifice is unnecessary; people do it anyway because questioning it means abandoning the group", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 19: Unlikely Allies (Enemies Who Must Work Together)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Unlikely Allies',
  'Groups with contradictory goals who must cooperate. Trust is impossible. Betrayal is inevitable.',
  'Factions',
  ARRAY['alliance', 'enemy', 'temporary', 'cooperation', 'conflict'],
  '[
    {"text": "A criminal organization and government agency must work together against a third threat; both sides assume double-crossing", "weight": 1},
    {"text": "A religious order and secular institution align temporarily; their doctrines contradict", "weight": 1},
    {"text": "Rival merchants must cooperate to face an external monopoly; once it''s dealt with, they resume competition", "weight": 2},
    {"text": "An occupier and occupied population must collaborate to fight a worse invader", "weight": 1},
    {"text": "A victim and perpetrator must work together; reconciliation is impossible but necessity is urgent", "weight": 1},
    {"text": "An ideological enemy and pragmatist must unite; their reasons for joining are opposite", "weight": 1},
    {"text": "A dying empire and rising nation ally briefly; each positions to dominate after", "weight": 1},
    {"text": "A collective of individuals who should be competing must collaborate; individual incentive will break the coalition", "weight": 1},
    {"text": "Two factions with completely different values must negotiate; communication is nearly impossible", "weight": 1},
    {"text": "An outsider group and insular community are forced to trust each other; cultural misunderstanding could cause catastrophe", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- TABLE 20: Inconvenient Inheritances (Things Passed Down That Nobody Wants)
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Inconvenient Inheritances',
  'Legacies—material or not—that the heir can''t refuse without consequences but can''t accept without cost.',
  'Legacy',
  ARRAY['inheritance', 'legacy', 'burden', 'responsibility', 'curse'],
  '[
    {"text": "An entire library of forbidden books passes to someone; keeping them is illegal, destroying them is sacrilege", "weight": 1},
    {"text": "A debt inherited from an ancestor; the heir never incurred it but creditors don''t care", "weight": 1},
    {"text": "A leadership position with a title and no actual authority; the heir is expected to maintain a facade", "weight": 2},
    {"text": "An ancestral enemy; the feud passes automatically to the new generation", "weight": 1},
    {"text": "A secret responsibility; the previous keeper died before fully explaining it", "weight": 1},
    {"text": "A building that must be maintained perfectly; failing ruins family status", "weight": 1},
    {"text": "A collection of objects that must never be separated; selling or losing one piece breaks a curse", "weight": 1},
    {"text": "A reputation for something the heir didn''t do; living up to it is expected", "weight": 1},
    {"text": "A cause that consumed the previous generation; the heir is expected to continue the work", "weight": 1},
    {"text": "An obligation to an organization or person; the heir inherits servitude along with property", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);
