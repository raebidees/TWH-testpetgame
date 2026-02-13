let WORLD = {
    "The Green Forever": {
        "REGIONS": {
            "Blossomjungle": {
                "REGIONS": {
                    "Springrover Ruins": {
                        "SCENES": {
                            "entrance": {
                                "text": "Shards of stone litter the forest floor. At first they seem scattered and random, but as $THEIR eyes adjust, $THEY pick$PLURAL out more and more, buried in leaves, embedded in mud, rising here and there as the ghosts of streets and columns.",
                                "backdrop": "Springrover Entrance",
                                "choices": [{ "text": "Search the ruins for information", "goto": "entrance_info", "cant_have": [["spr_looted", 1]], "hidden": true },
                                { "text": "Dig through the rubble for loot", "goto": "entrance_loot" },
                                { "text": "Head deeper into the ruins", "goto": "plaza" },
                                { "text": "Turn back", "goto": "RANDOM_REGION" }],
                            },
                            "entrance_info": {
                                "text": "The stones are old and worn; anything that can decay did so a long time ago. Still, the cuts on the stones were fine, once, and stone dwellings are rare around here. This was built to last. It simply didn't.",
                                "backdrop": "Springrover Entrance",
                                "choices": [{ "text": "Dig through the rubble for loot", "goto": "entrance_loot" },
                                { "text": "Head deeper into the ruins", "goto": "plaza" },
                                { "text": "Turn back", "goto": "RANDOM_REGION" }],
                            },
                            "entrance_loot": {
                                "text": "The ruins have long since been picked over. But there's a small shrine here, some dried flowers, and a generous helping of fruits for the spirits. Should be enough for rations.",
                                "backdrop": "Springrover Entrance",
                                "choices": [{ "text": "Take the rations", "goto": "entrance", "gives": [["rations", 1], ["nature_vibe", -1], ["spr_looted", 1]] },
                                { "text": "Pray for safety and leave rations as an offering", "consumes": [["rations", 1]], "goto": "entrance", "gives": [["jungle_vibe", 1], ["spr_looted", 1]] },
                                { "text": "Leave it be", "goto": "entrance" }],
                            },
                            "plaza": {
                                "text": "Birds hop around the remains of a plaza. A few bathe themselves in a puddle formed by some collapsed tile, becoming a blur of movement and chirping as they shake themselves off.",
                                "backdrop": "Springrover Plaza",
                                "choices": [{ "text": "Schlorp", "goto": "plaza_schlorp" },
                                { "text": "Feed the birds", "goto": "plaza_feed" },
                                { "text": "Explore the plaza", "goto": "plaza_explore" },
                                { "text": "Head deeper into the ruins", "goto": "depths_explore" },
                                { "text": "Go back to the entrance", "goto": "entrance" }]
                            },
                            "plaza_schlorp": {
                                "text": "The birds startle as $PLAYER kneel$PLURAL to schlorp from the puddle. Muddy, with an aftertaste of bird dust.",
                                "backdrop": "Springrover Plaza Birdless",
                                "choices": [{ "text": "Schlorp", "goto": "plaza_doubleschlorp" },
                                { "text": "Explore the plaza", "goto": "plaza_explore" },
                                { "text": "Head deeper into the ruins", "goto": "rear" },
                                { "text": "Go back to the entrance", "goto": "entrance" }]
                            },
                            "plaza_doubleschlorp": {
                                "text": "And is that a hint of brain-eating amoeba? It's probably fine.",
                                "backdrop": "Springrover Plaza Birdless",
                                "choices": [{ "text": "Schlorp", "goto": "plaza_nchlorp", "title": "Amoeba-Minded" },
                                { "text": "Explore the plaza", "goto": "plaza_explore" },
                                { "text": "Head deeper into the ruins", "goto": "rear" },
                                { "text": "Go back to the entrance", "goto": "entrance" }]
                            },
                            "plaza_nchlorp": {
                                "text": "Schlorp schlorp schlorp schlorp schlorp schlorpschlorpschlorpschlorp.",
                                "backdrop": "Springrover Plaza Birdless",
                                "choices": [{ "text": "Schlorp", "goto": "plaza_nchlorp" },
                                { "text": "Explore the plaza", "goto": "plaza_explore" },
                                { "text": "Head deeper into the ruins", "goto": "rear" },
                                { "text": "Go back to the entrance", "goto": "entrance" }]
                            },
                            "plaza_explore": {
                                "text": "One of the buildings, a windowless hulk set into the earth, is in decent repair. Relatively speaking. There's a slight whistle of wind through the cracks in the stone, and a locking mechanism of a slightly different make than the door itself, both apparent only when you get close. Grey paint flakes away from the lock; the metal beneath shines in the sun.",
                                "backdrop": "Springrover Plaza Birdless",
                                "choices": [{ "text": "Head deeper into the ruins", "goto": "rear" },
                                { "text": "Go back to the entrance", "goto": "entrance" },
                                { "text": "Unlock the door", "goto": "smuggler_bolthole", "requires": [["springrover_key", 1]], "hidden": true }]
                            },
                            "plaza_feed": {
                                "text": "$PLAYER scatter$PLURAL some of $THEIR seeds around the place. More birds gather, hopping around $THEIR feet as they chase down errant treats. One bird stands apart--a sizeable goose with something shiny wrapped around its neck. It tries to peck at it now and again.",
                                "backdrop": "Springrover Plaza Extra Birds",
                                "choices": [{ "text": "Observe the birds", "goto": "rear" },
                                { "text": "Approach the goose", "goto": "goose" },
                                { "text": "Head deeper into the ruins", "goto": "rear" },
                                { "text": "Go back to the entrance", "goto": "entrance" }]
                            },
                            "goose": {
                                "text": "$PLAYER makes $THEIR way towards the goose. Birds hop out of $THEIR way, and hop a little faster as the goose steps up to meet $THEM, hissing a warning. On closer inspection, the glittering thing is a key on a light metal chain, which looks to be tangled around its neck.",
                                "backdrop": "Springrover Plaza Extra Birds",
                                "choices": [{ "text": "Bribe", "goto": "goose_bribe" },
                                { "text": "Pounce", "goto": "goose_wrestle" },
                                { "text": "Commune", "goto": "goose_commune", "requires": [["nature_vibe", 5]] },
                                { "text": "Flee", "goto": "entrance" }]
                            },
                            "goose_bribe": {
                                "text": "What could such a creature want? $PLAYER has nothing to offer. Except, perhaps, a suitably grand meal.",
                                "backdrop": "Springrover Plaza Extra Birds",
                                "choices": [{ "text": "Offer it 3 seeds", "goto": "goose_pay", "requires": [["seeds", 3]] },
                                { "text": "Pounce", "goto": "goose_wrestle" },
                                { "text": "Commune", "goto": "goose_commune", "requires": [["nature_vibe", 5]] },
                                { "text": "Flee", "goto": "entrance" }]
                            },
                            "goose_wrestle": {
                                "text": "Birds startle as $PLAYER pounces on the goose, which answers with a series of pecks and shockingly powerful wing-blows. It's clearly willing to take this to the death!",
                                "backdrop": "Springrover Plaza Birdless",
                                "choices": [{ "text": "THEN DEATH IT IS", "goto": "goose_kill" },
                                { "text": "Just wrestle the key free, don't kill it!", "goto": "goose_save", "title": "Goose-Wrestler" }]
                            },
                            "goose_kill": {
                                "text": "The goose lands some hits, but not enough. It's over.",
                                "backdrop": "Springrover Plaza Birdless",
                                "choices": [{ "text": "Claim the key", "goto": "goose_save" }]
                            },
                            "goose_save": {
                                "text": "$PLAYER pins the wings and grabs the beak, taking quite a few hits in the process. Once it stops struggling, $THEY untangle$PLURAL the key from its neck. The goose explodes from their grip in a flurry of honks and wingflaps, disappearing into the underbrush; it looks to be unharmed.",
                                "backdrop": "Springrover Plaza Birdless",
                                "choices": [{ "text": "Head deeper into the ruins", "goto": "rear" },
                                { "text": "Go back to the entrance", "goto": "entrance" }]
                            },
                        }
                    }
                }
            },
            "Root Maze": {
                "REGIONS": {
                    "Overgrown Root Tunnels": {
                        "SCENES": {
                            "entry cavern": {
                                "text": ["Welcome to the alpha test v2! This lets you string gardens together with an ultra-light, vaguely CYOA interface. It's meant to make clans/events explorable, in a sense. I hope you have fun!"],
                                "backdrop": "entry cavern",
                                "player_pos": [["%7", 3], ["%12", 4]],
                                "choices": [{ "text": "Onwards to showcase area: worldshards", "goto": "alpine meadow" },
                                { "text": "Return to the overgrown tunnels", "goto": "disused entrance", "needs": [["sroot strange package", 1]], "hidden": true },
                                { "text": "Onwards to test area: overgrown tunnels", "goto": "quest prompt entrance", "blocked by": [["sroot strange package", 1]], "hidden": true, "gives": [["sroot strange package", 1]] },
                                { "text": "Pet nigel", "goto": "petted nigel", "needs": [["nigelpets", 1]], "hidden": true },
                                { "text": "Pet nigel", "goto": "pet nigel", "title": "Nigel-approved", "gives": [["nigelpets", 1]], "blocked by": [["nigelpets", 1]], "hidden": true }
                                ]
                            },
                            "pet nigel": {
                                "text": "Nigel receives the pats with grace, poise, and--nevermind he's flopped on his back and started wriggling around. After a bit of that, though, he runs a lap around $PLAYER and returns to watchfulness, though his tail does give an occasional wiggle.",
                                "player_pos": ["%77", 3],
                                "backdrop": "entry cavern",
                                "choices": [{ "text": "A good boy", "goto": "entry cavern" }]
                            },
                            "petted nigel": {
                                "text": "The moment $PLAYER move$PLURALPLAYER back towards Nigel, he starts racing around the place in a frenzy of yips, yaps, and flops. Looks like he's still pretty hyped up--don't want to overstimulate him.",
                                "player_pos": ["%15", 4],
                                "backdrop": "entry cavern",
                                "choices": [{ "text": "A solid lad", "goto": "entry cavern" }]
                            },
                            "quest prompt entrance": {
                                "text": "A network of root tunnels stretches before $PLAYER, shifting, wild, disused--probably not dangerous, per se, but not a place entered by many. Still, this is where the instructions scrawled on the package led. They're much less descriptive after this point, just an arrow pointing down, some waffling about crystals and roots, and a reminder not to anger any \"protectors\". The package itself is small, dense, heavy, barely making a sound when tilted this way or that. How did $THEY come by it?",
                                "player_pos": ["%5", 1],
                                "backdrop": "tunnel entrance",
                                "choices": [{ "text": "Entrusted by a friend", "goto": "examine box", "title": "gladefriend", "after": "It's a sizeable favor to have asked, but $THEY obliged. $THEIR friend had assured them it was important, and promised to make it up to them later, over drinks or food or a nice trip, whatever $PLAYER thought was appropriate after the \"adventure\" was over with. Though $THEIR friend never mentioned what's in it, exactly." },
                                { "text": "Ordered by a superior", "goto": "examine box", "title": "soldier", "gives": [["empty waterskin", 1]], "after": "$THEY had the training and experience to see the job done, and so they would. That simple. $THEY'd been offered whatever time necessary to see it delivered safe, sound, and reasonably discrete. The contents are, of course, above $THEIR pay grade. So it goes." },
                                { "text": "Paid as a courier", "goto": "examine box", "title": "courier", "gives": [["treasure", 100]], "after": "It had seemed a reasonable job at the time. Still is, hopefully. Coins exchanged over the table to get them this far, more promised once the job was done. Assuming $THEY found $THEIR way back, of course. It feels like such a long way aways, now." },
                                { "text": "Taken from the dead", "goto": "examine box", "title": "scavenger", "after": "Loot fairly gained, this. And so heavy and chunky and enticing! Perhaps more awaits. Perhaps danger. Or knowledge. Whatever $THEY can gather and glean." },
                                { "text": "One way or another", "goto": "examine box", "after": "It's not important, not really. It's a heavy, mysterious package--what more could $THEY ask for?" }]
                            },
                            "examine box": {
                                "text": "The twine is frayed, its knot secured with a chipping, dripping blot of wax. Some of the wrapping's come away, revealing polished wood.",
                                "player_pos": ["%5", 1],
                                "backdrop": "$UNCHANGED",
                                "choices": [{ "text": "Open the package", "title": "who snoops on the mail", "goto": "you broke it", "gives": [["sroot depleted fragments", 1]] },
                                { "text": "This all feels a little sketchy -- turn back", "goto": "entry cavern" },
                                { "text": "Package in hand, head into the living tunnels", "goto": "misc hallway" }]
                            },
                            "you broke it": {
                                "text": "As $THEY undo$PLURALES the twine, something catches. The wrapping comes away, but so does something else, and before $THEY can catch it, there's a flash of light. As it fades, it lingers in the plantlife. A few crystalline shards fall to the ground, spent.",
                                "player_pos": ["%2", 1],
                                "backdrop": "you broke it",
                                "choices": [{ "text": "Oops. Well, easy to play off as an accident, it clearly wasn't wrapped well", "goto": "misc hallway", "after": "Really, if the sender hadn't wanted it damaged, they should've wrapped it better. Now, to go \"explain\" things...and get away from the spreading magic." },
                                { "text": "Neat! Too bad that was all of it", "goto": "misc hallway", "after": "The magic ripples its way down the tunnel and settles in its walls. There's a few distant creaks and shifts. Might be good to get away from it...but what a show!" },
                                { "text": "Hmm. Best tell the recipient. Perhaps it can be remade", "goto": "misc hallway", "after": "A moment's curiosity is a moment's curiosity, a mistake is a mistake. Doesn't seem too unreasonable to want to know what's being transported, given the route and destination, if only for safety's sake. Surely the recipient will understand. Best to go meet them." },
                                { "text": "Oh gods oh gods maybe I can replace it?", "goto": "misc hallway", "after": "Ohh nonono that wasn't supposed to happen! Oh gods maybe there's something around here. Crystals, right? Or shiny rocks or something? Better go find some..." }
                                ]
                            },
                            "disused entrance": {
                                "text": ["A living tunnel stretches on and on. Plants cluster on its walls and clog its floor, undisturbed by foot traffic. There's an intermittent breeze, like a slow breath, and the smell of growth is almost overpowering. Where could this tunnel lead?", "The root tunnel widens after its entrance, but only slightly. Light filters in from somewhere, supporting an abundance of growth."],
                                "player_pos": ["%5", 1],
                                "backdrop": "tunnel entrance",
                                "choices": [{ "text": "Go forward", "goto": "misc hallway" },
                                { "text": "Turn back", "goto": "entry cavern" }]
                            },
                            "misc hallway": {
                                "text": ["The tunnel tilts a little up, a little down. Just enough to mark the distance.", "The sound of footfalls is muffled by low greenery as $PLAYER travel$PLURAL onwards.", "This stretch holds little of note, save the occasional flower that seems to turn to watch $PLAYER pass.", "The tunnels are quiet, save for the occasional frog- or insect-sound. They stretch on and on.", "It's hard to mark distance in the tunnels. Plant communities shift slowly and subtly.", "Despite having moved in a straight line for some time, the quiet and the gradual bending of the tunnel make it easy to believe it's somehow doubled back. But then there's a new flower, or a slight mark on the walls, and the spell is broken.", "Much of the upper living tunnels consists of stretches like this: diffuse light, scattered plants, sparse animals. It spreads out before $PLAYER, welcoming $THEM in."],
                                "backdrop": ["misc hallway", "misc hallway 2", "tunnel entrance"],
                                "player_pos": [["%5", 1], ["%10", 2], ["%15", 1], ["%7", 3]],
                                "choices": [{ "text": "Wander onwards", "goto": "$WANDERABLE" },
                                { "text": "Investigate what might be a side passage", "goto": ["dead end", "intersection"], "chance": 0.45, "hidden": true },
                                { "text": "Follow a noise", "goto": "hallway frog", "chance": 0.45, "hidden": true },
                                { "text": "Head to the crevice waterfall", "needs": [["sroot found waterfall", 1]], "hidden": true, "goto": "crevice waterfall" },
                                { "text": "Head to the mysterious dead end", "goto": "dead end", "needs": [["sroot cache discovered", 1]], "blocked by": [["sroot cache discovered", 2]], "hidden": true },
                                { "text": "Head to the crystalline outpost", "goto": "crystalline outpost", "needs": [["sroot found settlement", 1]], "hidden": true },
                                { "text": "Head to the resin cache", "goto": "protector cache", "needs": [["sroot cache discovered", 2]], "hidden": true }],
                                "wanderable": true
                            },
                            "misc hallway 2": {
                                "text": ["Thin, mirror-like roots channel sun from the surface, enough to sustain the colonies of shade-tolerant plants crowding this corridor.", "The living tunnels narrow here and widen there, a frozen ripple of life. Plants cluster in bare patches.", "Gaps in the roots collect decades of leaf litter, which flakes and crumbles as it's stepped on.", "Some of these stretches wander near the surface; the occasional gap in the ceiling lets in sun and noise from the world above"],
                                "backdrop": ["misc hallway", "misc hallway 2", "tunnel entrance"],
                                "player_pos": [["%7", 1], ["%12", 2], ["%25", 1], ["%2", 3]],
                                "choices": [{ "text": "Wander onwards", "goto": "$WANDERABLE" },
                                { "text": "Investigate what might be a side passage", "goto": ["dead end", "intersection"], "chance": 0.35, "hidden": true },
                                { "text": "Follow a noise", "goto": "hallway frog", "chance": 0.35, "hidden": true },
                                { "text": "Head to the crevice waterfall", "goto": "crevice waterfall", "needs": [["sroot found waterfall", 1]], "hidden": true },
                                { "text": "Head to the mysterious dead end", "goto": "dead end", "needs": [["sroot cache discovered", 1]], "blocked by": [["sroot cache discovered", 2]], "hidden": true },
                                { "text": "Head to the crystalline outpost", "goto": "crystalline outpost", "needs": [["sroot found settlement", 1]], "hidden": true },
                                { "text": "Head to the resin cache", "goto": "protector cache", "needs": [["sroot cache discovered", 2]], "hidden": true }],
                                "wanderable": true
                            },
                            "intersection": {
                                "text": ["$PLAYER make$PLURALPLAYER it to a split in the tunnel, a slab of living wood protruding and dividing like the prow of a ship. One side slopes down, the other slightly up.", "The wall gives way, splitting off into a side passage. It leads downwards. The path ahead is a more gradual climb, eventually disappearing above the nearer ceiling."],
                                "backdrop": "intersection",
                                "player_pos": ["%5", 1],
                                "choices": [{ "text": "Downwards", "goto": "settlement slope" },
                                { "text": "Upwards", "goto": "exit slope" },
                                { "text": "Double back..?", "goto": "misc hallway" }],
                                "wanderable": true
                            },
                            "exit slope": {
                                "text": "As $THEY follow$PLURAL the tunnel, the light gets stronger, the plants larger and more numerous. The breeze grows stronger too, carrying smells of sun and rain.",
                                "backdrop": "tunnel entrance",
                                "player_pos": [["%5", 1], ["%37", 1]],
                                "choices": [{ "text": "Onwards and upwards!", "goto": "surface entrance", "title": "suntouched" },
                                { "text": "Back to the tunnels", "goto": "intersection" }]
                            },
                            "settlement slope": {
                                "text": "As the tunnel continues downwards, the ambient light fades, replaced by the light of glowing crystals. Occasionally, the sound of voices echoes from somewhere ahead.",
                                "backdrop": "settlement slope",
                                "player_pos": [["%14", 1], ["%32", 1]],
                                "choices": [{ "text": "Onwards and downwards!", "goto": "crystalline outpost", "gives": [["sroot found settlement", 1]] },
                                { "text": "Back to the tunnels", "goto": "misc hallway" }]
                            },
                            "crystalline outpost": {
                                "text": "The tunnel opens into a chamber studded with crystals. A few basic dwellings are scattered here and there, shaped from packed earth and held together by roots. A smattering of crates and instruments marks this as a research outpost. A dragon rears back to give a cheery wave.",
                                "backdrop": "crystalline outpost",
                                "gives": [["sroot found settlement", 1]],
                                "player_pos": [["%14", 2], ["%0", 2]],
                                "choices": [{ "text": "Go over to the dragon", "hidden": true, "blocked by": [["sroot quest", 1]], "goto": "crystalline firstchat" },
                                { "text": "Go over to the dragon", "hidden": true, "needs": [["sroot quest", 1]], "blocked by": [["sroot quest", 2]], "goto": "quest description" },
                                { "text": "Go over to the dragon", "hidden": true, "needs": [["sroot quest", 2]], "goto": "quest turnin" },
                                { "text": "Head back to the tunnels", "goto": "misc hallway" }
                                ]
                            },
                            "crystalline firstchat": {
                                "text": "The dragon skitters and leaps forward as $PLAYER approach$PLURALPLAYER. \"Whoa! Hey! Do you have the box?\" They seem to remember themselves, skidding to a halt and arranging their body more neatly. \"Ah! Sorry, sorry, must seem a strange thing to ask if you DON'T have it. We've just been waiting a bit, is all. Welcome to Outpost K4-Qim, though we all call it Kuquim. Do you need anything? We don't get many visitors.\"",
                                "backdrop": "crystalline outpost zoom",
                                "player_pos": ["%14", 2],
                                "choices": [{ "text": "\"I've got your box right here, actually.\" (hand it over)", "goto": "box delivery", "consumes": [["sroot strange package", 1]] },
                                { "text": "\"IMPUDENCE! Do you know who you're speaking to?\"", "goto": "crystalline impudence", "title": "Oh Tunnel-Faring One" },
                                { "text": "\"I'm just passing through, really.\"", "goto": "crystalline outpost", "after": "\"Oh!\" They nod. \"Well, I'll let you go then. Feel free to look around the place! We don't have much, I'm afraid. Not yet at least.\"" }
                                ]
                            },
                            "crystalline impudence": {
                                "text": "\"AGH! No I do not!\" The dragon seems properly mollified, if not a little confused. \"Erm, apologies your, uh, you-ness? What can I help you with oh, uh, Tunnel-Faring One?\"",
                                "backdrop": "$UNCHANGED",
                                "choices": [{ "text": "\"Better. I'm here to deliver your box.\" (hand it over)", "goto": "box delivery", "consumes": [["sroot strange package", 1]] },
                                { "text": "\"Nothing.\"", "goto": "crystalline outpost", "after": "\"Uh. Um. Okay then, I'll just get out of your way? I think?\" They step aside to better let $PLAYER explore." }
                                ]
                            },
                            "box delivery": {
                                "text": "The dragon accepts the box with equal parts excitement and reverence. \"Ah, I'm so glad to have it! Thank you for bringing it here, it can't have been easy. Here's something for your troubles. Speaking of, how'd it go?\"",
                                "backdrop": "$UNCHANGED",
                                "gives": [["treasure", 250]],
                                "choices": [{ "text": "Say that it was an easy journey, and that nothing much happened", "blocked by": [["sroot depleted fragments", 1]], "after": "\"I'm so happy!\" They nod, more to themselves than to $PLAYER. \"We pride ourselves on keeping this part of the maze somewhat stable. Now, let me get this open!\"", "goto": "box delivered" },
                                { "text": "Say that it was a difficult journey, with the box kept safe only through chutzpah and derring-do", "blocked by": [["sroot depleted fragments", 1]], "after": "\"Oh no! Usually the tunnels aren't so rough.\" They shake their head, sympathetic. \"Well, you're braver than I am, and I'm glad for that. Now, let me show you what all that effort was for...\"", "goto": "box delivered" },
                                { "text": "Say that you were accosted and the box was damaged during the fight", "needs": [["sroot depleted fragments", 1]], "goto": "box delivered", "after": "\"Aah! What? Was it one of the protectors? Were you hurt? Was the box??? Here, here, let me take a look!\"" },
                                { "text": "Say that the box spontaneously exploded in magic at some point", "needs": [["sroot depleted fragments", 1]], "after": "\"IT WHAT?!\" Their tail writhes. \"That could have been disastrous! Thanks be you weren't hurt, or worse! We'll conduct a full investigation to figure out how that happened, I'm so sorry. Let me see if I can find any hints in the test results...\"", "goto": "box delivered" },
                                { "text": "Say that you peeked in the box and, in doing so, released its magic.", "needs": [["sroot depleted fragments", 1]], "after": "\"Oh! Uh. Well. Uh. Thanks for being honest...\" They look a little disappointed, but shake it off. \"I can't say I would've done any different, not really, so. Um. Yeah, thanks for not lying about it I guess. Don't worry, that wasn't the really valuable part. Here, let me show you.\"", "goto": "box delivered" },
                                ]
                            },
                            "box delivered": {
                                "text": "They unwrap the package fully, then use a claw to force a hidden seam open. A stack of thin stone tablets slide out, each covered in strong-smelling oil. \"There we go. Test results! I see they took some pains to make sure the crystal wouldn't alter them during the journey. Let's see...ooh. Nice. Nice! PERFECT! Yes, this is just what we were looking for! The results-\"",
                                "backdrop": "$UNCHANGED",
                                "gives": [["sroot quest", 1]],
                                "choices": [{ "text": "Politely welcome them to gush about their research", "goto": "crystal quest", "gives": [["nature_vibe", 1]], "after": "They unleash an absolute torrent of highly technical information. A little tricky to absorb, but $PLAYER pick$PLURALPLAYER up a few details. And they look happy to have shared." },
                                { "text": "Recognize some symbols and gush with them", "goto": "crystal quest", "needs": [["gladefriend", 1]], "gives": [["nature_vibe", 1]], "title": "researcher at heart", "after": "$PLAYER and the dragon celebrate together, going over the results in detail. Looks like they've succeeded in binding stable magical energy at a 3% higher rate than the prior theoretical cap! The implications are incredible!" },
                                { "text": "Wait for them to finish up", "goto": "crystal quest", "after": "They babble to themselves a little longer, but do get their enthusiasm under control. Still, their eyes gleam mischievously." },
                                { "text": "Interrupt them", "goto": "crystal quest", "after": "\"-eh? Oh. Um. Right. Sure. Well. Still, we do need to test this...\"" },
                                ]
                            },
                            "crystal quest": {
                                "text": "\"These results you brought me are incredibly promising! I'd like to perform a test, and the reagents aren't anything too terribly complicated. Are you interested?\"",
                                "backdrop": "crystalline outpost zoom",
                                "player_pos": ["%14", 2],
                                "choices": [{ "text": "Yes", "goto": "quest description" },
                                { "text": "No", "goto": "crystalline outpost", "after": "\"Oop, sorry! Well, let me know if you change your mind!\"" },
                                { "text": "Not right now, maybe later?", "goto": "crystalline outpost", "after": "\"Super understandable! You just got here after all. Sorry, I get a little excited sometimes. Let me know if you've got a moment.\"" },
                                { "text": "Ask about the reward", "after": "\"Oh, well, that's fair. Um, I have some treasure left for incidentals, but I imagine you'd be more interested in the shortcut. Let me explain...\"", "goto": "quest description" }
                                ]
                            },
                            "quest description": {
                                "text": "\"So, our research is into the harvest and transport of magical energy. We're able to use compounds dissolved in the water here to grow crystals that can hold a fair bit...it's just releasing it that's the problem. We've got a lot of research left to do there in terms of making it, uh, safe, so we might as well make the release tests useful. There was a rockslide a few weeks ago that blocked one of our exit tunnels. With just a few reagents, we can direct the magic to grow enough roots to clear it.\"",
                                "backdrop": "$UNCHANGED",
                                "choices": [{ "text": "Ask about the reagents", "goto": "quest reagents hard", "hidden": true, "needs": [["sroot depleted fragments", 1]] },
                                { "text": "Ask about the reagents", "goto": "quest reagents", "hidden": true, "blocked by": [["sroot depleted fragments", 1]] },
                                { "text": "Decline for now", "goto": "crystalline outpost" },
                                ]
                            },
                            "quest reagents": {
                                "text": "\"Nothing too wild! All we need is some pure water, magic-cured resin, and the charged crystal you delivered...so I guess we only need two things! I'm happy to grab either one. The water's probably easier, since all you really need to do is look for frogs. The ones around here have sensitive skin, so if you can find one, there's probably some nearby. The resin's harder, since it's only released when the tunnel is injured...don't do that! Just keep a careful eye out.",
                                "backdrop": "$UNCHANGED",
                                "choices": [{ "text": "Agree to collect the pure water", "gives": [["empty waterskin", 1], ["sroot quest", 1], ["sroot quest water", 1]], "after": "\"Thank you! Here's a waterskin, let me know when you've got the water. I'll try to find some resin.\"", "goto": "crystalline outpost" },
                                { "text": "Agree to collect the resin", "gives": [["root protector totem", 1], ["sroot quest", 1], ["sroot quest resin", 1]], "after": "\"Thank you! Here, speaking of magically charged things...this totem will mark you as a druid-friend. Might come in handy if you have to get past a protector construct. Just use it wisely, these are a huge pain to make.\"", "goto": "crystalline outpost" },
                                { "text": "Offer to get both", "gives": [["empty waterskin", 1], ["treasure", 100], ["root protector totem", 1], ["sroot quest", 1], ["sroot quest water", 1], ["sroot quest resin", 1]], "after": "\"WHOA, yeah, if you don't mind, that'll leave me more time to prepare. Thank you so much! Here, least I can do is pay you!\"", "goto": "crystalline outpost" },
                                { "text": "\"You mean these?\"", "consumes": [["pure water", 1], ["sroot resin", 1]], "gives": [["empty waterskin", 1], ["treasure", 100], ["root protector totem", 1], ["sroot quest", 2]], "title": "Truest Root Explorer", "after": "\"HOW? You're incredible! Yes! Thank you! Whoa! LET'S GET STARTED IMMEDIATELY\"", "goto": "win" },
                                { "text": "Decline for now", "goto": "crystalline outpost" },
                                ]
                            },
                            "quest reagents hard": {
                                "text": "\"Nothing too wild! All we need is some pure water, magic-cured resin, and the charged cryst--wait, it exploded. Well, I'll get another, but it'll take some time. While I work on that, you'd get the other two! The water's probably easier, since all you really need to do is look for frogs. The ones around here have sensitive skin, so if you can find one, there's probably some nearby. The resin's harder, since it's only released when the tunnel is injured...don't do that! Just keep a careful eye out.",
                                "backdrop": "$UNCHANGED",
                                "choices": [
                                    { "text": "Agree to get both", "gives": [["empty waterskin", 1], ["root protector totem", 1], ["sroot quest", 1], ["sroot quest resin", 1], ["sroot quest water", 1]], "after": "\"Thank you so much! Here, a waterskin for the water, and a totem in case you need to get past a protector construct. Good luck!\"", "goto": "crystalline outpost" },
                                    { "text": "\"You mean these?\"", "consumes": [["pure water", 1], ["sroot resin", 1]], "gives": [["empty waterskin", 1], ["treasure", 100], ["root protector totem", 1], ["sroot quest", 2]], "title": "Truest Root Explorer", "after": "\"HOW? You're incredible! Yes! Thank you! Whoa! LET'S GET STARTED IMMEDIATELY\"", "goto": "win" },
                                    { "text": "Decline for now", "goto": "crystalline outpost" },
                                ]
                            },
                            "quest turnin": {
                                "text": "\"Oh hey again! How's it going? Any luck with the reagents?\"",
                                "backdrop": "crystalline outpost zoom",
                                "player_pos": ["%14", 2],
                                "choices": [
                                    { "text": "\"I have the resin\"", "consumes": [["sroot resin", 1], ["sroot quest resin", 1]], "after": "\"Excellent, thank you! Hope you didn't get bit too bad.\"", "goto": "quest turnin" },
                                    { "text": "\"I have the water\"", "consumes": [["pure water", 1], ["sroot quest water", 1]], "after": "\"Thanks! Find any cool frogs? Guess that's not too important.\"", "goto": "quest turnin" },
                                    { "text": "\"Let's begin\"", "goto": "win", "blocked by": [["sroot quest resin", 1], ["sroot quest water", 1]] },
                                    { "text": "\"Nothing yet\"", "goto": "crystalline outpost" },
                                ]
                            },
                            "win": {
                                "text": "The dragon beckons $PLAYER to the landslide. They lay the reagents in front of it, drawing lines in the dirt with their claw and murmuring a few syllables. \"And that should do it! Oh, by the way--I'm Emri!\" And with that, Emri slams their fist down on the crystal.",
                                "backdrop": "landslide",
                                "player_pos": ["%34", 1],
                                "choices": [
                                    { "text": "BRACE!", "goto": "winsplosion" },
                                    { "text": "EMBRACE!", "goto": "winsplosion" },
                                    { "text": "TRY TO RUN OH GOD TOO LATE", "goto": "winsplosion" }
                                ]
                            },
                            "winsplosion": {
                                "text": "The cave quakes with an explosion of growth. Flashes of green glow brighter than daylight, brighter, brighter...",
                                "backdrop": "landslide explosion",
                                "player_pos": ["%34", 3],
                                "choices": [
                                    { "text": "AAAAAAAAA", "goto": "win screen" },
                                    { "text": "HELL YEAAAAAA", "goto": "win screen" }
                                ]
                            },
                            "win screen": {
                                "text": "Congratulations! $PLAYER completed the demo and (probably) survived to the end. What lies beyond the landslide? More importantly, what other gardens could be built and explored (maybe yours)? And what title do you have down there in the bottom left? Thanks for playing, and tell me what you think!",
                                "backdrop": "landslide explosion",
                                "player_pos": ["%34", 3],
                                "choices": []
                            },
                            "surface entrance": {
                                "text": ["$PLAYER arrive$PLURALPLAYER at the mouth of the living tunnel system. There's an explosion of life on both sides, one a cathedral-like forest, one dense and cramped and lively."],
                                "backdrop": "exterior tunnel entrance",
                                "player_pos": [["%5", 1], ["%37", 1]],
                                "choices": [{ "text": "Enter the root tunnels", "goto": "exit slope" },
                                { "text": "Enter the woods (can't, not yet)", "needs": [["unattainable", 1]] }]
                            },
                            "berry patch": {
                                "text": ["Some parts of the tunnel receive enough light to be used for informal cultivation. These berries look ripe and delicious; there's no indication they're claimed by anyone, either."],
                                "backdrop": "berry patch",
                                "player_pos": [["%5", 1], ["%37", 1], ["%12", 1], ["%22", 1]],
                                "choices": [{ "text": "Eat some now", "goto": "berry patch eaten" },
                                { "text": "Harvest some for later", "gives": [["berries", 2]], "goto": "berry patch harvested" },
                                { "text": "Ignore them and continue walking", "goto": "$WANDERABLE" }],
                                "wanderable": true
                            },
                            "berry patch harvested": {
                                "text": ["$THEY pick$PLURAL some bright, juicy berries. Plenty remain dormant and ripening, ready for some other traveler."],
                                "backdrop": "$UNCHANGED",
                                "choices": [{ "text": "Harvest every last one", "gives": [["berries", 3]], "goto": "berry patch fullharvest" },
                                { "text": "Continue on, sated", "goto": ["misc hallway"] }]
                            },
                            "berry patch eaten": {
                                "text": ["$THEY chow$PLURAL down on some some sweet, juicy berries. Plenty remain dormant and ripening, ready for some other traveler."],
                                "backdrop": "$UNCHANGED",
                                "choices": [{ "text": "Eat and eat and eat", "goto": "berry patch fullharvest", "title": "glutton" },
                                { "text": "Continue on, sated", "goto": ["misc hallway"] }]
                            },
                            "berry patch fullharvest": {
                                "text": ["To leave is to waste. Surely there will be more patches."],
                                "backdrop": "berry patch fullharvest",
                                "player_pos": ["%40", 1],
                                "choices": [{ "text": "That's better. Onwards.", "goto": ["misc hallway"] }]
                            },
                            "collapsed hallway": {
                                "text": "Looks like part of the tunnel has collapsed. Cold air wafts from below, though the tunnel also continues ahead.",
                                "backdrop": "tunnel collapse",
                                "player_pos": ["%30", 1],
                                "choices": [{ "text": "Glide, scramble, and/or vine swing to the other side", "goto": "little garden" },
                                { "text": "Explore what lies below", "goto": "settlement slope" },
                                { "text": "Return to the maze", "goto": "$WANDERABLE" },
                                ],
                                "wanderable": true
                            },
                            "little garden": {
                                "text": "There isn't much past the breach; the tunnel here sealed itself a long time ago. But due to its seclusion or some other trick of the maze, the flowers that grow here grow in profusion.",
                                "backdrop": "little garden",
                                "player_pos": [["%20", 3], ["%40", 3], ["%60<", 3]],
                                "choices": [{ "text": "Climb back down", "goto": "collapsed hallway" },
                                { "text": "Meditate awhile", "goto": "little meditate", "title": "who rested in forgotten flowers" }
                                ]
                            },
                            "little meditate": {
                                "text": ["It's so quiet here. The air barely stirs, and when it does, it's filled with smells of nectar and life. $PLAYER can almost feel the grass grow around $THEM, one more fixture in this forgotten corner of the root maze.",
                                    "As $THEIR mind stills, $THEIR eyes pick out a claw-marked stone set into the earth. No names or dates, just tally marks, the most basic guestbook imaginable. It's been given over to moss now. Breathe in, breathe out, and feel that long-gone presence.",
                                    "The ground is soft and only the slightest bit damp. Generations of moss and leaf litter cover the floor entirely, allowing $PLAYER to sink into a small but comfortable dip.",
                                    "There's a certain coherence to the flowers here. Perhaps this was a garden, once? Nature tends itself now. Perhaps that was the intent. $PLAYER still$PLURALPLAYER $THEIR mind..."],
                                "backdrop": "$UNCHANGED",
                                "choices": [{ "text": "Climb back down", "goto": "collapsed hallway" },
                                { "text": "Meditate awhile longer", "goto": "little meditate" }]
                            },
                            "crevice": {
                                "text": "Looks like there's a crack in the living wall. $PLAYER should be able to squeeze through, albeit with some difficulty.",
                                "backdrop": "crevice",
                                "player_pos": ["%5", 1],
                                "choices": [{ "text": "Attempt to squeeze through", "goto": "crevice stuck" },
                                { "text": "SMASH THROUGH", "gives": [["health", -2]], "after": "$PLAYER lower$PLURALPLAYER $THEIR head and shoulder-charge$PLURAL the crevice. $THEY pop$PLURAL through to the other side, albeit with a slight headache.", "goto": "crevice waterfall" },
                                { "text": "Double back", "goto": "misc hallway" }],
                            },
                            "crevice waterfall": {
                                "text": ["Beyond the crevice, water rains from someplace high above, carrying smells of sun and nectar. Plants sprout in profusion.", "The space behind the crevice reverberates with the sound of falling water. Plants drip with condensed mist.", "The water pouring into the hollow is transparent as glass where it pools, but turns the air cold and humid where it falls. Fireflies gather around the puddles."],
                                "backdrop": "crevice waterfall",
                                "gives": [["sroot found waterfall", 4]],
                                "player_pos": [["%6", 5]],
                                "choices": [{ "text": "Bathe in the waters", "goto": ["crevice bathe"], "title": "who stood beneath the buried waters" },
                                { "text": "Fill a waterskin", "after": "$THEY hold$PLURAL the skin beneath the flow as the force tries to tear it away. It's filled in no time.", "goto": "crevice waterfall", "gives": [["pure water", 1]], "consumes": [["empty waterskin", 1]] }, //, "blocked by": [["pure water", 1]]},
                                { "text": "Leave the hollow", "goto": "misc hallway 2" }],
                            },
                            "crevice bathe": {
                                "text": ["$PLAYER enter$PLURALPLAYER the stream. Water hammers $THEIR back, pure, cold, and cleansing."],
                                "backdrop": "crevice waterfall",
                                "player_pos": ["%45", 5],
                                "choices": [{ "text": "Fill a waterskin", "after": "$THEY hold$PLURAL the skin beneath the flow as the force tries to tear it away. It's filled in no time.", "goto": "crevice waterfall", "gives": [["pure water", 1]], "consumes": [["empty waterskin", 1]] }, //, "blocked by": [["pure water", 1]]},
                                { "text": "Leave the hollow", "goto": "misc hallway 2" }]
                            },
                            "crevice stuck": {
                                "text": ["Well...it's a tighter fit than expected.\n\nHmm.\n\n$THEY may be stuck."],
                                "backdrop": "crevice",
                                "player_pos": ["%72", 1],
                                "choices": [{ "text": "Commence panic wiggles", "goto": "crevice waterfall", "after": "$THEY wiggle$PLURAL like mad, popping through in a heap, dishelved but unharmed." },
                                { "text": "TIME TO SMASH", "gives": [["health", -2]], "after": "$PLAYER slam$PLURAL $THEIR full weight against the crevice. $THEY pop$PLURAL through to the other side, albeit with a slight headache.", "goto": "crevice waterfall" },
                                { "text": "Stay calm and push forward", "goto": "crevice waterfall", "after": "$THEY keep$PLURAL $THEIR cool, moving with slow precision as $THEY push$PLURALES forward. $THEY emerge$PLURAL into a hollow beyond..." },
                                { "text": "Nopenopenope get OUT", "goto": "misc hallway 2", "after": "With a writhing CRACK, $THEY pull$PLURAL free, taking a tiny bit of bark with $THEM. $THEY skitter$PLURAL down the hallway to calm down." },
                                ],
                            },
                            "protector cache": {
                                "text": ["Beyond the crevice is a tiny cavern. It reeks of growth and sap, the smell much stronger than anything in the hallways outside. A vaguely canine construct paces in front of a lump of amber. The light filling its hollow, woodwrought head spills towards you. Possibly curiosity, possibly threat, possibly nothing at all."],
                                "backdrop": "protector cache",
                                "gives": [["sroot cache discovered", 1]],
                                "player_pos": ["%10", 2],
                                "choices": [{ "text": "Back away slowly...", "goto": "misc hallway 2", "after": "$PLAYER retreat$PLURALPLAYER through the crevice. The construct does not respond except, possibly, in the slightest tilt of the head." },
                                { "text": "Challenge it", "goto": "protector fight" },
                                { "text": "Make an offering", "consumes": [["root protector totem", 1]], "gives": [["nature_vibe", 1]], "goto": "protector cache gone", "after": "$PLAYER lay$PLURALPLAYER the offering totem on the ground. The construct trots over, inspects it, takes it in its mouth, and disappears through a too-small crack in the tunnel bark." },
                                { "text": "Commune", "needs": [["nature_vibe", 3]], "goto": "protector cache gone", "after": "It recognizes $PLAYER, somehow. It inclines its head and trots away." },
                                ],
                            },
                            "protector fight": {
                                "text": ["It lunges for $PLAYER, jaws dripping with toxic nectar."],
                                "backdrop": "protector cache",
                                "player_pos": ["%20", 2],
                                "choices": [{ "text": "Uppercut", "goto": ["protector fight ineffective", "protector fight graze"] },
                                { "text": "Try to get it by the neck", "goto": ["protector fight effective", "protector fight dodged", "protector fight bit"] },
                                { "text": "Bite it back", "goto": ["protector fight bit", "protector fight dodged"] },
                                { "text": "Kick it away", "goto": ["protector fight ineffective", "protector fight dodged"] },
                                ],
                            },
                            "protector fight bit": {
                                "text": ["Going in close was risky--too risky. Its jaws clamp onto $THEM, sap and venom oozing from the wound. The pain is distracting.", "Not fast enough! It bites into $PLAYER with barbed teeth. The marks burn, acrid and chemical."],
                                "backdrop": "protector cache",
                                "gives": [["health", -15]],
                                "player_pos": ["%25<", 2],
                                "choices": [{ "text": "Uppercut", "goto": ["protector fight ineffective", "protector fight graze", "protector fight dodged"] },
                                { "text": "Slam it against the wall", "goto": ["protector fight effective", "protector fight dodged"] },
                                { "text": "Kick it away", "goto": ["protector fight ineffective", "protector fight dodged"] },
                                ],
                            },
                            "protector fight ineffective": {
                                "text": ["The hit seems to stun it a bit. It lunges towards $THEM, its aim off. Light leaks from a new crack.", "It sags a little, then surges forward again, though it seems somewhat clumsier.", "There's a nasty CRACK. Pieces of living bark rain from it, but it's still coming at $PLAYER."],
                                "backdrop": "protector cache",
                                "player_pos": ["%22<", 2],
                                "choices": [{ "text": "Uppercut", "goto": ["protector fight effective", "protector fight graze"] },
                                { "text": "Slam it against the wall", "goto": ["protector fight effective", "protector fight graze"] },
                                { "text": "Kick it away", "goto": ["protector fight effective", "protector fight graze"] },
                                ],
                            },
                            "protector fight effective": {
                                "text": ["It stumbles badly; it wasn't built to take hits. It tries to stand, dribbling green venom."],
                                "backdrop": "protector cache",
                                "player_pos": ["%10", 2],
                                "choices": [{ "text": "End it", "goto": "protector cache gone", "after": "Its form cracks and crumbles away. Strange, magical light starts to filter into the space. %PLAYER can't help but feel watched." },
                                { "text": "Spare it", "goto": "protector cache gone", "after": "It stares at $THEM, maybe baleful, maybe tired, maybe nothing at all. It drags itself through a crevice. The nodules shed a slight light on its retreat, the glow intensifying." },
                                ],
                            },
                            "protector fight graze": {
                                "text": ["It dodges around $THEM and goes for a bite. Unable to adjust its aim enough, it only grazes.", "Too fast to hit, not quite fast enough to reorient in time; it rakes $PLAYER with a wooden claw, but it's not much of a wound."],
                                "backdrop": "protector cache",
                                "gives": [["health", -3]],
                                "player_pos": ["%14", 2],
                                "choices": [{ "text": "Uppercut", "goto": ["protector fight ineffective", "protector fight dodged"] },
                                { "text": "Try to get it by the neck", "goto": ["protector fight effective", "protector fight dodged", "protector fight bit"] },
                                { "text": "Bite it back", "goto": ["protector fight bit", "protector fight dodged"] },
                                { "text": "Kick it away", "goto": ["protector fight ineffective", "protector fight dodged"] },
                                ],
                            },
                            "protector fight dodged": {
                                "text": ["It leaps away from $THEIR strike, bounding off the edge of the tunnel and back towards $PLAYER, jaws wide!", "It kicks away at the last moment, leaving clawmarks in the greenery as it skids, reorients, and leaps!"],
                                "backdrop": "protector cache",
                                "player_pos": ["%18<", 2],
                                "choices": [{ "text": "Uppercut", "goto": "protector fight ineffective" },
                                { "text": "Slam it against the wall", "goto": ["protector fight effective", "protector fight bit"] },
                                { "text": "Try to bite it out of the air", "goto": ["protector fight bit", "protector fight effective"] },
                                { "text": "Kick it away", "goto": "protector fight ineffective" },
                                ],
                            },
                            "protector cache gone": {
                                "text": "This little cavern seems somehow rougher than the rest. Gnarls of wood knot and join around nodules of resin, most still curing. Strange veins spider their way through the thickest of the deposits. Looks like they originate somewhere inside it.",
                                "backdrop": "protector cache gone",
                                "player_pos": ["%20", 1],
                                "choices": [{ "text": "Take some resin", "goto": "protector cache gone", "gives": [["sroot resin", 1]], "blocked by": [["sroot resin", 1]], "after": "$PLAYER carve$PLURALPLAYER away a sample of the resin. More flows into place, though it's far too liquid to handle." },
                                { "text": "Investigate what's embedded in the largest nodule", "goto": "protector cache crystalwary", "blocked by": [["sroot evilcrystal", 1]] },
                                { "text": "Return to the maze", "goto": "misc hallway 2" }
                                ],
                            },
                            "protector cache crystalwary": {
                                "text": "$PLAYER dig$PLURALPLAYER into the resin, just enough to see what's trapped within. Some sort of crystal? The resin's already flowing back into the hollow to bury it. The veins definitely originate from the crystal, and the whole assemblage seems...off.",
                                "backdrop": "protector cache gone",
                                "player_pos": ["%25", 1],
                                "choices": [{ "text": "Take the crystal", "title": "curse-pricked", "goto": "protector cache gone", "gives": [["sroot evilcrystal", 1], ["health", -10]], "blocked by": [["sroot evilcrystal", 1]], "after": "$PLAYER dig$PLURALPLAYER into the resin, just enough to free what's trapped within. Some sort of crystal? It hurts like nothing else when touched...not more, just different. A strange and otherworldly pain, as if it's digging into something outside $THEIR body. The nearby plants seem to stand a little straighter with the thing removed." },
                                { "text": "Don't take it", "goto": "protector cache gone" }
                                ],
                            },
                            "dead end": {
                                "text": "The ever-shifting tunnels have ceased their shifting here, at least; the tunnel ends with neither fanfare nor direction.",
                                "backdrop": "dead end",
                                "player_pos": ["%11", 1],
                                "choices": [{ "text": "The wall looks weak. I'll MAKE a way", "gives": [["sroot cache discovered", 1], ["health", -3]], "blocked by": [["sroot cache discovered", 2]], "goto": "protector cache", "after": "$PLAYER charge$PLURALPLAYER forwards! When $THEY slam$PLURAL into the wall, the barrier of bark collapses with an awful cracking sound, and $THEY tumble$PLURAL into a chamber beyond..." },
                                { "text": "Inspect the area closely", "title": "root sleuth", "goto": "dead end inspect", "blocked by": [["sroot cache discovered", 1]] },
                                { "hidden": true, "text": "Hold out a totem?", "goto": "protector cache", "needs": [["root protector totem", 1]], "blocked by": [["sroot cache discovered", 1]], "after": "Astonishingly the roots react. Not much, just barely enough space to wiggle through. The space opens up beyond..." },
                                { "text": "Back to the maze then", "goto": "misc hallway" }],
                                "wanderable": true
                            },
                            "dead end inspect": {
                                "text": "Something seems a little off about this dead end...",
                                "backdrop": "$UNCHANGED",
                                "player_pos": ["%40", 1],
                                "choices": [{ "text": "Inspect the floor", "goto": "dead end inspect", "after": "There isn't much leaf litter or other debris on the floor, though many of the hallways are nearly choked with the stuff. What is here is distributed strangely, as if a strong wind had been through." },
                                { "text": "Inspect the plants", "goto": "dead end inspect", "after": "The plants here are fresh and young. Their variety seems somewhat limited compared to elsewhere in the maze, though there's one cluster that seems intentionally planted, going by some clawmarks in the floor." },
                                { "text": "Inspect the walls", "goto": "dead end inspect", "after": "The walls are almost warm to the touch, and their bark is thinner. There's a depressed area near a cluster of flowers." },
                                { "text": "Listen closely", "goto": "dead end inspect", "after": "The dead end is eerily silent. If $PLAYER listen$PLURALPLAYER hard enough, $THEY can pick out a very slight rhythmic clacking from behind the far wall." },
                                { "text": "There's nothing more to learn here", "goto": "dead end", "gives": [["sroot cache discovered", 1]] }],
                            },
                            "hallway frog": {
                                "text": "$PLAYER follow$PLURAL the noise until $THEY reach...a tiny frog? Must be feeding off the fireflies; it seems almost transfixed.",
                                "backdrop": "frog",
                                "choices": [{ "text": "Watch for awhile", "goto": ["frogwatch"] },
                                { "text": "Catch a few for it", "goto": ["froghelp"] },
                                { "text": "Eat some fireflies", "goto": ["eat fireflies"], "title": "glowbelly" },
                                { "text": "Ignore this and journey onwards", "goto": ["$WANDERABLE"] }],
                            },
                            "buried glade": {
                                "text": "what is this?",
                                "backdrop": "buried glade",
                                "player_pos": ["%2", 1],
                                "choices": [{ "text": "where is this?", "goto": "buried glade" }],
                            },
                            "frogwatch": {
                                "text": "Frogsong fills the tunnel, echoing a little off its wooden walls. The soft plops and plips of the frog's hunt, the slow blinking of the fireflies, the far-off sounds of wind and water, the rustle of the tunnel plants...it's a contemplative moment that lasts and lasts. Eventually the frog is sated and hops beneath a leaf, blinking slowly through its own sort of reflection.",
                                "backdrop": "frog retreated",
                                "choices": [{ "text": "Enjoy the peace awhile longer", "goto": "frogcontemplate", "title": "watcher of amphibities" },
                                { "text": "Journey onwards", "goto": ["$WANDERABLE"] }],
                            },
                            "frogcontemplate": {
                                "text": ["$PLAYER and the frog study each other. What passes between isn't anything inherently magical--just time, peace, and quiet, and perhaps that is enough. The frog hops away, towards a small crevice..."],
                                "backdrop": "$UNCHANGED",
                                "choices": [{ "text": "Journey onwards", "goto": ["$WANDERABLE"] },
                                { "text": "Follow the frog", "goto": ["crevice"] },],
                            },
                            "froghelp": {
                                "text": ["Though well-intentioned, $THEIR movements spook frog and firefly alike. The former retreats towards a crevice $THEY didn't previously notice...", "$THEY manage$PLURAL to snag a few for it. Though far from tame, the frog is still able to understand the notion of easy food, and goes for the downed fireflies. Content, it hops away, and towards a previously-unnoticed crevice."],
                                "backdrop": "frog retreated",
                                "choices": [{ "text": "Follow that frog!", "goto": ["crevice"] },
                                { "text": "Journey onwards", "goto": ["$WANDERABLE"] }],
                            },
                            "eat fireflies": {
                                "text": ["$PLAYER lunges for the fireflies. Some escape, some end up as lunch. The frog flees before it can join them."],
                                "backdrop": "frog retreated",
                                "choices": [{ "text": "Follow that frog!", "goto": ["crevice"] },
                                { "text": "Journey onwards, belly mildly glowier", "goto": ["$WANDERABLE"] }],
                            },
                            "alpine meadow": {
                                "text": ["Dusk settles over an alpine valley, painting the lavender and lupine with streaks of rich red. $PLAYER can feel the chill as it creeps into the air, whisps of hoarfrost not far behind."],
                                "backdrop": "alpine meadow",
                                "player_pos": [["%10", 2], ["%40<", 3], ["%20", 3], ["%60<", 2]],
                                "choices": [{ "text": "Go to next", "goto": "desert pillars" }],
                            },
                            "desert pillars": {
                                "text": ["There's no sign of what these pillars were. A road, maybe? But the land around them rises up in jagged chunks, crackling like fresh snow or salt. The air seems thicker between them, the mountains far behind blurred and somehow warped."],
                                "backdrop": "desert pillars",
                                "player_pos": [["%15", 1], ["%25<", 1], ["%50", 1], ["%60", 4]],
                                "choices": [{ "text": "That's all for now", "goto": "entry cavern", "title": "worldstrider" }],
                            }
                        }
                    }
                }
            }
        }
    }
}

let BACKDROPS = {
    "tunnel entrance": { "version": 0.1, "w": 500, "h": 100, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 0, "y": 5, "w": 500, "h": 100, "seeds": ["CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "B+0TfCQ-6g", "B+0TfCQ-6g", "CbJ79C3N2j", "CbJ79C3N2j"], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 195, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 2, "x": 0, "y": 0, "w": 1000, "h": 100, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 1, "x": 0, "y": 3, "w": 600, "h": 100, "seeds": ["CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "B+0TfCQ-6g", "COjSfCM1-J", "COjSfCM1-J", "COjSfCM1-J<", "D5kJfCXV+P", "D5kJfCXV+P<", "D5kJfCXV+P", "D5kJfCXV+P", "CU3FeBy63P", "CWLkfCaAtv", "CU3FeBy63P", "CWLkfCaAtv"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1 }, { "type": 1, "x": 0, "y": 100, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] },
    "you broke it": { "version": 0.1, "w": 500, "h": 100, "s": 2, "layers": [{ "type": 1, "x": 0, "y": 2, "w": 250, "h": 100, "seeds": ["D8odwCXsty", "D8odwCXsty<"], "palette": "CbJ79C3N2j", "gcover": "grass [palette]", "ground": "none", "s": 1 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 0, "y": 5, "w": 500, "h": 100, "seeds": ["CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "B+0TfCQ-6g", "B+0TfCQ-6g", "CbJ79C3N2j", "CbJ79C3N2j", "D8odwCXsty<", "D8odwCXsty"], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 195, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 2, "x": 0, "y": 0, "w": 1000, "h": 100, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 1, "x": -30, "y": 3, "w": 500, "h": 100, "seeds": ["CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "B+0TfCQ-6g", "COjSfCM1-J", "COjSfCM1-J", "COjSfCM1-J<", "D5kJfCXV+P", "D5kJfCXV+P<", "D5kJfCXV+P", "D5kJfCXV+P", "CU3FeBy63P", "CWLkfCaAtv", "CU3FeBy63P", "CWLkfCaAtv", "D8odwCXsty"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1.25 }, { "type": 1, "x": 0, "y": 100, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] }, "misc hallway": { "version": 0.1, "w": 500, "h": 100, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.07 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 0, "y": 5, "w": 500, "h": 100, "seeds": ["CbJ79C3N2j", "CIcqeCEoys", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CIcqeCEoys", "CIcqeCEoys", "CGim9CQdYo", "CQF6fC62fc"], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 195, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 2, "x": -45, "y": 0, "w": 600, "h": 100, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 1, "x": 0, "y": 3, "w": 600, "h": 100, "seeds": ["CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "B+0TfCQ-6g", "CU3FeBy63P", "CWLkfCaAtv", "CU3FeBy63P", "CWLkfCaAtv", "CQF6fC62fc", "CQF6fC62fc"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1 }, { "type": 1, "x": -15, "y": 100, "w": 515, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] },
    "misc hallway 2": { "version": 0.1, "w": 500, "h": 100, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.07 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 0, "y": 5, "w": 500, "h": 100, "seeds": ["CbJ79C3N2j", "CIcqeCEoys", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CIcqeCEoys", "CIcqeCEoys", "CGim9CQdYo", "C-dhsB-A+Y"], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 195, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 2, "x": -45, "y": 0, "w": 600, "h": 100, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 1, "x": 0, "y": 3, "w": 600, "h": 100, "seeds": ["D5kJfCMRh4", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "B+0TfCQ-6g", "CU3FeBy63P", "CWLkfCaAtv", "CU3FeBy63P", "CWLkfCaAtv", "C-dhsB-A+Y", "C-dhsB-A+Y<", "C-dhsB-A+Y", "COL28B+Pba"], "palette": "CQF6fC62fc", "gcover": "grass [palette]", "ground": "none", "s": 1 }, { "type": 1, "x": -32, "y": 100, "w": 532, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] },
    "intersection": { "version": 0.1, "w": 500, "h": 100, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.07 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 0, "y": 5, "w": 500, "h": 100, "seeds": ["CbJ79C3N2j%77.80", "CbJ79C3N2j%46.60", "CbJ79C3N2j%26.00", "CbJ79C3N2j%9.80", "CbJ79C3N2j%35.80", "CGim9CQdYo%33.40", "COL28B+Pba%0.00", "CU3FeBy63P%57.80"], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 195, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 2, "x": -60, "y": 0, "w": 560, "h": 100, "content": "vines", "palette": "CU3FeBy63P", "s": 1 }, { "type": 1, "x": 0, "y": 3, "w": 400, "h": 100, "seeds": ["CbJ79C3N2j%12.75", "CbJ79C3N2j%23.25", "CbJ79C3N2j%75.00", "CbJ79C3N2j%33.75", "B+0TfCQ-6g%41.25", "CU3FeBy63P%42.50", "CWLkfCaAtv%73.75", "CU3FeBy63P%1.75", "CWLkfCaAtv%53.50", "COL28B+Pba%55.25"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1 }, { "type": 1, "x": 0, "y": -5, "w": 325, "h": 100, "seeds": ["CvvXHCPVJK%76.20", "CvvXHCPVJK%48.00<"], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1.75 }, { "type": 1, "x": -160, "y": 100, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 1, "x": 480, "y": 100, "w": 20, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.4 }, { "type": 1, "x": 325, "y": 5, "w": 200, "h": 100, "seeds": ["CbJ79C3N2j%1.50", "CbJ79C3N2j%50.00", "CbJ79C3N2j%26.50", "CbJ79C3N2j%30.46", "CIcqeCEoys%75.71", "CIcqeCEoys%15.99", "CGim9CQdYo%0.50", "COL28B+Pba%2.53"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1 }, { "type": 1, "x": 0, "y": 100, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] },
    "entry cavern": { "version": 0.1, "w": 450, "h": 150, "s": 2, "layers": [{ "type": 1, "x": 0, "y": -2, "w": 250, "h": 150, "seeds": ["CGkRzCCXU2%0.00", "CGkRzCCXU2%70.00"], "palette": "CGkRzCCXU2", "gcover": "grass [palette]", "ground": "grass", "s": 2 }, { "type": 1, "x": 0, "y": 20, "w": 450, "h": 150, "seeds": ["D8ogqC3knb%5.00", "D8ogqC3knb%87.00"], "palette": "CGkRzCCXU2", "gcover": "none", "ground": "none", "s": 1 }, { "type": 3, "content": "Stars", "palette": "early evening", "cust": [], "a": 1 }, { "type": 3, "content": "Stars", "palette": "early evening", "cust": [], "a": 1 }, { "type": 3, "content": "Sky_Gradient", "palette": "night", "cust": [], "a": 1 }, { "type": 3, "content": "Fog", "palette": "shallow water", "cust": [], "a": 0.2 }, { "type": 1, "x": 0, "y": 9, "w": 450, "h": 150, "seeds": ["D7dwTCUqjQ%35.00", "D7dwTCUqjQ%-5.00", "!nigel%79.00<", "D7dwTCUqjQ%50.00", "D7dwTCUqjQ%92.00", "C7xKvCUqjQ%31.00", "C7xKvCUqjQ%10.00<", "C7xKvCUqjQ%81.00<"], "palette": "CGkRzCCXU2", "gcover": "grass [palette]", "ground": "grass", "s": 1 }, { "type": 1, "x": 90, "y": 10, "w": 290, "h": 150, "seeds": [], "palette": "D7dwTCUqjQ", "gcover": "carved stone [palette]", "ground": "chunky dirt", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.6 }, { "type": 1, "x": -20, "y": 0, "w": 350, "h": 150, "seeds": ["CM3ADCOkuw%31.71", "CM3ADCOkuw%59.71", "CM3ADCOkuw%2.57<", "CM3ADCOkuw%48.41", "CM3ADCOkuw%18.22<", "CM3ADCOkuw%68.30", "CBNaDCOkus%2.47", "CBNaDCOkus%27.26<", "CBNaDCOkus%1.93<"], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1.5 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#000000"], "a": 0.9 }, { "type": 1, "x": -20, "y": 0, "w": 350, "h": 150, "seeds": ["CM3ADCOkuw%29.43", "CM3ADCOkuw%54.57<", "CM3ADCOkuw%77.14", "CM3ADCOkuw%4.29", "CM3ADCOkuw%40.16<", "CM3ADCOkuw%13.65<", "CM3ADCOkuw%22.13"], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1.5 }] },
    "buried glade": { "version": 0.1, "w": 1000, "h": 200, "s": 1, "layers": [{ "type": 3, "content": "Fog", "palette": "forest murk", "cust": [], "a": 0.15 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.8 }, { "type": 1, "x": 0, "y": 5, "w": 1000, "h": 200, "seeds": [], "palette": "Cn7K0CURmR", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 2, "x": 0, "y": 0, "w": 1000, "h": 200, "content": "tall_trunks", "palette": "Cn7K0CURmR", "s": 1.5 }, { "type": 1, "x": 0, "y": 0, "w": 350, "h": 200, "seeds": ["D5kJfCMRh4%31.14", "D5kJfCMRh4%58.29", "D5kJfCMRh4%80.86<", "Cc2y4CH5nw%4.00", "Cc2y4CH5nw%43.67", "Cd+3nB-v-w%23.33", "Cd+3nB-v-w%0.89<", "#night%70"], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 3 }, { "type": 3, "content": "Fog", "palette": "early evening", "cust": [], "a": 0.7 }, { "type": 1, "x": 0, "y": 200, "w": 1000, "h": 200, "seeds": [], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1 }] },
    "frog": { "version": 0.1, "w": 500, "h": 100, "s": 2, "layers": [{ "type": 1, "x": 0, "y": 12, "w": 500, "h": 100, "seeds": ["CZ0ZTC943n%41.00"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 1.1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.14 }, { "type": 1, "x": 50, "y": 3, "w": 400, "h": 100, "seeds": ["!tree_frog%37.00", "CZ0ZTC943n%30.00"], "palette": "CWk99CERpp", "gcover": "grass [palette]", "ground": "none", "s": 1 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 0, "y": 5, "w": 500, "h": 100, "seeds": ["CbJ79C3N2j%0.40", "CWk99CERpp%79.80", "CbJ79C3N2j%48.20", "CbJ79C3N2j%58.80", "CbJ79C3N2j%26.80", "CbJ79C3N2j%18.00", "CWk99CERpp%12.00", "CWk99CERpp%29.60<", "CWk99CERpp%67.40", "CGim9CQdYo%4.20", "CqBGeCS8lE%15.20"], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 195, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 2, "x": -30, "y": 0, "w": 600, "h": 100, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 1, "x": 0, "y": 3, "w": 600, "h": 100, "seeds": ["CbJ79C3N2j%59.67", "CbJ79C3N2j%88.33", "CbJ79C3N2j%51.83", "CbJ79C3N2j%81.83", "B+0TfCQ-6g%40.50", "CU3FeBy63P%74.50", "CWLkfCaAtv%79.00", "CU3FeBy63P%14.00", "CWLkfCaAtv%23.50", "CqBGeCS8lE%65.83", "C+sseCaxvL%56.00", "C+sseCaxvL%1.67<"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1 }, { "type": 1, "x": 0, "y": 100, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] },
    "frog retreated": { "version": 0.1, "w": 500, "h": 100, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.4 }, { "type": 1, "x": 50, "y": 3, "w": 400, "h": 100, "seeds": [], "palette": "CWk99CERpp", "gcover": "grass [palette]", "ground": "none", "s": 1 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 0, "y": 5, "w": 500, "h": 100, "seeds": ["CbJ79C3N2j%0.40", "CWk99CERpp%79.80", "CbJ79C3N2j%48.20", "CbJ79C3N2j%58.80", "CbJ79C3N2j%26.80", "CbJ79C3N2j%18.00", "CWk99CERpp%12.00", "CWk99CERpp%29.60<", "CWk99CERpp%67.40", "CGim9CQdYo%4.20", "CqBGeCS8lE%15.20"], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 195, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 2, "x": -30, "y": 0, "w": 600, "h": 100, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 1, "x": 0, "y": 3, "w": 600, "h": 100, "seeds": ["CbJ79C3N2j%59.67", "CbJ79C3N2j%88.33", "CbJ79C3N2j%51.83", "CbJ79C3N2j%81.83", "B+0TfCQ-6g%40.50", "CU3FeBy63P%74.50", "CWLkfCaAtv%79.00", "CU3FeBy63P%14.00", "CWLkfCaAtv%23.50", "CqBGeCS8lE%65.83", "C+sseCaxvL%56.00", "C+sseCaxvL%1.67<"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1 }, { "type": 1, "x": 0, "y": 100, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] },
    "dead end": { "version": 0.1, "w": 500, "h": 100, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 0, "y": 5, "w": 420, "h": 100, "seeds": ["CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "B+0TfCQ-6g", "B+0TfCQ-6g", "CbJ79C3N2j", "CbJ79C3N2j", "CoIN8CPUun", "C2D18CXs-r"], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 128, "y": 0, "w": 200, "h": 100, "seeds": ["D33Q8CPTaM%60"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1.7 }, { "type": 1, "x": 400, "y": 100, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 195, "w": 500, "h": 100, "seeds": ["CunqCC3ke6", "CoIN8CPUun%91<"], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 2, "x": 0, "y": 0, "w": 1000, "h": 100, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 1, "x": 0, "y": 3, "w": 400, "h": 100, "seeds": ["CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "B+0TfCQ-6g", "D5kJfCXV+P", "D5kJfCXV+P<", "D5kJfCXV+P", "D5kJfCXV+P", "CU3FeBy63P", "CWLkfCaAtv", "CU3FeBy63P", "CQF6eC6nPp", "CQF6eC6nPp", "C2D18CXs-r", "C2D18CXs-r"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1 }, { "type": 1, "x": -34, "y": 100, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] },
    "crevice": { "version": 0.1, "w": 500, "h": 100, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.07 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 0, "y": 5, "w": 500, "h": 100, "seeds": ["CbJ79C3N2j%0.40", "CZ0ZTC943n", "C1qceCPVJL%65.00", "CWk99CERpp%79.80", "CbJ79C3N2j%48.20", "CbJ79C3N2j%58.80", "CbJ79C3N2j%26.80", "CbJ79C3N2j%18.00", "CWk99CERpp%12.00", "CWk99CERpp%29.60<", "CWk99CERpp%67.40", "CGim9CQdYo%4.20", "D5kJfCMRh4%89.00", "C1qceCPVJL%20.00", "C1qceCPVJL%-5.00"], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 195, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 200, "y": 3, "w": 250, "h": 100, "seeds": ["CogLWCPVjz%60.00", "CunqCC3ke6%60.00", "#night%70", "CoIN8CPUun%48.00", "CoIN8CPUun%68.00<"], "palette": "CGim9CQdYo", "gcover": "grass [palette]", "ground": "none", "s": 1.2 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 2, "x": -30, "y": 0, "w": 600, "h": 100, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 1, "x": 0, "y": 3, "w": 600, "h": 100, "seeds": ["CbJ79C3N2j%59.67", "CbJ79C3N2j%88.33", "CbJ79C3N2j%51.83", "CbJ79C3N2j%81.83", "B+0TfCQ-6g%40.50", "CU3FeBy63P%74.50", "CWLkfCaAtv%79.00", "CU3FeBy63P%14.00", "CWLkfCaAtv%23.50"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1 }, { "type": 1, "x": 0, "y": 100, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] },
    "berry patch": { "version": 0.1, "w": 500, "h": 150, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.07 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 0, "y": 5, "w": 500, "h": 150, "seeds": ["CNydfCGJQS%48.60", "CbJ79C3N2j%84.60", "CbJ79C3N2j%41.00", "CbJ79C3N2j%57.40", "CbJ79C3N2j%31.40", "CbJ79C3N2j%67.40", "CGim9CQdYo%0.80", "CWk99CERpp%77.60", "CWk99CERpp%54.20", "CNydfCGJQS%74.40", "CNydfCGJQS%20.20", "CNydfCGJQS%1.20", "CNydfCGJQS%10.00", "CNydfCGJQS%48.46"], "palette": "Ctc-8CPTYy", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 1, "x": 0, "y": 290, "w": 500, "h": 150, "seeds": [], "palette": "Ctc-8CPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 10, "w": 500, "h": 150, "seeds": ["CGim9CQdYo%12.40", "CWk99CERpp%55.20", "CWk99CERpp%0.80", "CNydfCGJQS%65.40", "CNydfCGJQS%72.60", "CNydfCGJQS%12.00", "CNydfCGJQS%38.80", "CNydfCGJQS%28.40"], "palette": "Ctc-8CPTYy", "gcover": "grass [palette]", "ground": "grass", "s": 1 }, { "type": 1, "x": 0, "y": 3, "w": 600, "h": 150, "seeds": ["CNydfCGJQS%23.17", "CNydfCGJQS%0.00", "CNydfCGJQS%77.00", "CNydfCGJQS%7.50", "CbJ79C3N2j%70.00", "CbJ79C3N2j%53.00", "CbJ79C3N2j%85.17", "CbJ79C3N2j%39.00", "B+0TfCQ-6g%52.50", "CU3FeBy63P%31.50", "CWLkfCaAtv%13.00", "CU3FeBy63P%62.00", "CWLkfCaAtv%56.67", "COjSfCM1-J%45.83", "COjSfCM1-J%16.50", "COL28B+Pba%52.91"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1 }, { "type": 3, "content": "Fog", "palette": "forest murk", "cust": [], "a": 0.5 }, { "type": 1, "x": -32, "y": 80, "w": 632, "h": 150, "seeds": ["CNydfCA+jj%13.13", "CNydfCA+jj%37.82", "CNydfCA+jj%77.22", "CNydfCA+jj%62.50", "CNydfCA+jj%21.68", "CbJ79C3N2j%69.94", "CbJ79C3N2j%54.43", "CbJ79C3N2j%30.38", "CGim9CQdYo%38.61", "CWLkfCaAtv%2.06", "CWLkfCaAtv%67.25", "CNydfCA+jj%45.89", "CbJ79C3N2j%6.65", "CbJ79C3N2j%0.32", "CbJ79C3N2j%85.76", "CGim9CQdYo%56.49", "CWLkfCaAtv%78.96", "CWLkfCaAtv%89.40"], "palette": "Ctc-8CPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.2 }, { "type": 1, "x": 0, "y": 200, "w": 500, "h": 150, "seeds": [], "palette": "Ctc-8CPTYy", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1 }] },
    "berry patch fullharvest": { "version": 0.1, "w": 500, "h": 150, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.07 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 0, "y": 5, "w": 500, "h": 150, "seeds": ["CNydfCA+jj%48.60", "CbJ79C3N2j%84.60", "CbJ79C3N2j%41.00", "CbJ79C3N2j%57.40", "CbJ79C3N2j%31.40", "CbJ79C3N2j%67.40", "CGim9CQdYo%0.80", "CWk99CERpp%77.60", "CWk99CERpp%54.20", "CNydfCA+jj%1.20", "CNydfCA+jj%10.00"], "palette": "Ctc-8CPTYy", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 1, "x": 0, "y": 290, "w": 500, "h": 150, "seeds": [], "palette": "Ctc-8CPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 10, "w": 500, "h": 150, "seeds": ["CGim9CQdYo%12.40", "CWk99CERpp%55.20", "CWk99CERpp%0.80", "CNydfCA+jj%12.00", "CNydfCA+jj%38.80", "CNydfCA+jj%28.40"], "palette": "Ctc-8CPTYy", "gcover": "grass [palette]", "ground": "grass", "s": 1 }, { "type": 1, "x": 0, "y": 3, "w": 600, "h": 150, "seeds": ["CNydfCA+jj%23.17", "CNydfCA+jj%0.00", "CNydfCA+jj%77.00", "CNydfCA+jj%7.50", "CbJ79C3N2j%70.00", "CbJ79C3N2j%53.00", "CbJ79C3N2j%85.17", "CbJ79C3N2j%39.00", "B+0TfCQ-6g%52.50", "CU3FeBy63P%31.50", "CWLkfCaAtv%13.00", "CU3FeBy63P%62.00", "CWLkfCaAtv%56.67", "COjSfCM1-J%45.83", "COjSfCM1-J%16.50", "COL28B+Pba%52.91"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1 }, { "type": 3, "content": "Fog", "palette": "forest murk", "cust": [], "a": 0.5 }, { "type": 1, "x": -32, "y": 80, "w": 632, "h": 150, "seeds": ["CNydfCA+jj%13.13", "CNydfCA+jj%37.82", "CNydfCA+jj%77.22", "CNydfCA+jj%62.50", "CNydfCA+jj%21.68", "CbJ79C3N2j%69.94", "CbJ79C3N2j%54.43", "CbJ79C3N2j%30.38", "CGim9CQdYo%38.61", "CWLkfCaAtv%2.06", "CWLkfCaAtv%67.25", "CNydfCA+jj%45.89", "CbJ79C3N2j%6.65", "CbJ79C3N2j%0.32", "CbJ79C3N2j%85.76", "CGim9CQdYo%56.49", "CWLkfCaAtv%78.96", "CWLkfCaAtv%89.40"], "palette": "Ctc-8CPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.2 }, { "type": 1, "x": 0, "y": 200, "w": 500, "h": 150, "seeds": [], "palette": "Ctc-8CPTYy", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1 }] },
    "alpine meadow": { "version": 0.1, "w": 500, "h": 130, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "shallow water", "cust": [], "a": 0.2 }, { "type": 1, "x": 0, "y": -40, "w": 500, "h": 130, "seeds": ["C+tM6CUro8", "C+tM6CP63h", "C+tLuCQejr", "C+tLuCQejr", "C+tM6CP63h", "C+tM6CUro8", "C+tM6CP63h", "C+tM6CP63h", "CogLXC0JFV", "Cv9fCC0KIh"], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1.2 }, { "type": 1, "x": 0, "y": 0, "w": 500, "h": 130, "seeds": [], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 1 }, { "type": 3, "content": "Fog", "palette": "rose dusk", "cust": [], "a": "0.20" }, { "type": 1, "x": -50, "y": 0, "w": 800, "h": 130, "seeds": ["C+tM6CP63h", "C+tLuCQdEU", "B+0yvB+Q9a", "C6oUcCC7J7", "C8iZ6C9SlM", "C+tM6CUro8", "BwzevCWlTk", "BytjcC95wX", "Cv9fCC0KIh", "CE2LuCOj0j", "C+tM6CVbIs", "CunEjC0KIh", "C+tM6CUro8", "C+tM6CP63h", "C+tLuCQejr", "C+tLuCQejr", "C+tM6CP63h", "C+tM6CUro8", "C+tM6CP63h", "C+tM6CP63h", "CogLXC0JFV<", "Cv9fCC0KIh", "CogLXC0JFV", "Cv9fCC0KIh<", "Cv9fCC0KIh", "C+tM6CP63h", "C+tLuCQejr", "C+tM6CVbIs", "CLIDPCWlTk", "CLIDPCWlTk", "CLIDPCWlTk", "CE2LuCOj0j", "CE2LuCOj0j", "CE2LuCOj0j", "BytjcC95wX", "CE2LuCOj0j"], "palette": "CqBluCUrQm", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 0.75 }, { "type": 2, "x": 0, "y": -24, "w": 1000, "h": 130, "content": "hills", "palette": "CqBluCUrQm", "s": 0.8 }, { "type": 2, "x": 0, "y": 0, "w": 500, "h": 130, "content": "mountains", "palette": "CunEjC0KIh", "s": 1 }, { "type": 2, "x": -10, "y": 60, "w": 500, "h": 130, "content": "mountains", "palette": "CunEjC0KIh", "s": 1.3 }, { "type": 3, "content": "Stars", "palette": "rose dusk", "cust": [], "a": 1 }, { "type": 3, "content": "Sky_Gradient", "palette": "rose dusk", "cust": [], "a": 1 }] },
    "desert pillars": { "version": 0.1, "w": 500, "h": 130, "s": 2, "layers": [{ "type": 3, "content": "Sky_Gradient", "palette": "early evening", "cust": [], "a": 1 }, { "type": 1, "x": 0, "y": 0, "w": 500, "h": 130, "seeds": ["D7fL5CGhqr%36.00", "C7xdeCGhpJ%53.00<"], "palette": "Cc2y4CH5nw", "gcover": "sand", "ground": "grass", "s": 1 }, { "type": 1, "x": 0, "y": 10, "w": 560, "h": 130, "seeds": ["D7fL5CGhqr%50.00"], "palette": "Cc2y4CH5nw", "gcover": "sand", "ground": "gravel", "s": 0.9 }, { "type": 3, "content": "Fog", "palette": "early evening", "cust": [], "a": 0.1 }, { "type": 1, "x": -4, "y": 25, "w": 800, "h": 130, "seeds": ["D7fL5CGhqr%38.00"], "palette": "Cc2y4CH5nw", "gcover": "sand [palette]", "ground": "gravel", "s": 0.7 }, { "type": 1, "x": 0, "y": 37, "w": 1000, "h": 130, "seeds": ["D7fL5CGhqr%50.00"], "palette": "Cc2y4CH5nw", "gcover": "sand", "ground": "gravel", "s": 0.5 }, { "type": 3, "content": "Fog", "palette": "early evening", "cust": [], "a": 0.1 }, { "type": 1, "x": 0, "y": 50, "w": 1800, "h": 130, "seeds": ["D7fL5CGhqr%43.60"], "palette": "Cc2y4CH5nw", "gcover": "sand", "ground": "gravel", "s": 0.3 }, { "type": 2, "x": 0, "y": -30, "w": 1300, "h": 130, "content": "hills", "palette": "CTIpeCOjUM", "s": 0.4 }] },
    "crevice waterfall": { "version": 0.1, "w": 500, "h": 130, "s": 2, "layers": [{ "type": 1, "x": 0, "y": 0, "w": 500, "h": 130, "seeds": ["CZ0ZTC943n<"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 1 }, { "type": 1, "x": 0, "y": 30, "w": 500, "h": 130, "seeds": ["CZ0ZTC943n"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.2 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 0, "y": 130, "w": 5, "h": 130, "seeds": [], "palette": "D33Q8CPTaM", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 1, "x": 495, "y": 130, "w": 10, "h": 130, "seeds": [], "palette": "D33Q8CPTaM", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 5, "w": 500, "h": 130, "seeds": ["D33Q8CPTaM%91.00", "CoIN8CPUun%-5.00<", "CbJ79C3N2j%85.40", "CIcqeCEoys%47.20", "CbJ79C3N2j%10.20", "CbJ79C3N2j%77.60", "CbJ79C3N2j%27.80", "CbJ79C3N2j%57.60", "CIcqeCEoys%1.40", "CIcqeCEoys%18.20", "CGim9CQdYo%50.20", "C-dhsB-A+Y%37.80"], "palette": "D33Q8CPTaM", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.2 }, { "type": 2, "x": -45, "y": 15, "w": 600, "h": 130, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 2, "x": 240, "y": 0, "w": 60, "h": 130, "content": "waterfall", "palette": "CunEjC0KIh", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.3 }, { "type": 1, "x": 0, "y": 3, "w": 600, "h": 130, "seeds": ["D5kJfCMRh4%13.83", "CbJ79C3N2j%1.50", "CbJ79C3N2j%18.50", "CbJ79C3N2j%10.83", "CbJ79C3N2j%76.00", "B+0TfCQ-6g%0.00", "CU3FeBy63P%69.83", "CWLkfCaAtv%71.33", "CU3FeBy63P%24.67", "CWLkfCaAtv%15.17", "C-dhsB-A+Y%33.83", "C-dhsB-A+Y%64.00<", "C-dhsB-A+Y%41.00", "COL28B+Pba%56.33"], "palette": "CQF6fC62fc", "gcover": "grass [palette]", "ground": "none", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.3 }, { "type": 1, "x": 0, "y": 20, "w": 400, "h": 130, "seeds": ["D5kJfCMRh4%76.00<", "CWLkfCaAtv%20.75", "CWLkfCaAtv%53.50", "CWLkfCaAtv%39.00<", "CU3FeBy63P%11.75", "CU3FeBy63P%56.50<", "CE1seB-w1X%38.50", "CGim9CQdYo%80.00", "CGim9CQdYo%61.00", "C5GSyCE1Tm%4.75", "C5GSyCE1Tm%45.00", "D80y1C4uyM%20.00"], "palette": "D33Q8CPTaM", "gcover": "grass [palette]", "ground": "grass", "s": 1.25 }, { "type": 1, "x": -22, "y": 130, "w": 532, "h": 130, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] },
    "exterior tunnel entrance": { "version": 0.1, "w": 500, "h": 130, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "forest murk", "cust": [], "a": 0.4 }, { "type": 1, "x": 0, "y": 2, "w": 425, "h": 130, "seeds": ["CyCzDCMQdq%2.59", "CyCzDCMQdq%39.76", "CIcvLCGLAp%60.94", "CIcvLCGLAp%71.76", "CIcvLCGLAp%0.71", "CIcvLCGLAp%26.35", "CIcvLCGLAp%47.76", "CIcvLCGLAp%13.65", "B-veLC4tOS%83.76", "CfVf4ByU3K%39.06", "Cd+5LC62h3%57.65", "Cd+5LC62h3%22.59", "CofhLC61Sx%-5.00<"], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "grass", "s": 1.2 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.1 }, { "type": 3, "content": "Fog", "palette": "forest murk", "cust": [], "a": 0.4 }, { "type": 1, "x": -20, "y": 0, "w": 425, "h": 130, "seeds": ["Cd+5LC62h3%20.71", "CEQLrC61GV%1.65", "Cgd+mCZnWR%45.65", "CK8ZKCVBjB%40.94", "Cd+5LC62h3%67.06<", "CEQLrC61GV%28.18", "Cgd+mCZnWR%60.94", "CK8ZKCVBjB%41.07", "Cd+5LC62h3%17.00", "CEQLrC61GV%74.56", "Cgd+mCZnWR%80.94<"], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1.25 }, { "type": 1, "x": 0, "y": 0, "w": 500, "h": 130, "seeds": ["D33UrC60St%-3.00<", "CofhLC61Sx%0.00"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 1.75 }, { "type": 2, "x": 0, "y": 0, "w": 500, "h": 130, "content": "tall_trunks", "palette": "Cgd+mCZnWR", "s": 1 }, { "type": 1, "x": -40, "y": 12, "w": 400, "h": 130, "seeds": ["Cd+5LC62h3%5.00", "CEQLrC61GV%52.25", "Cgd+mCZnWR%30.50", "CK8ZKCVBjB%78.75", "Cd+5LC62h3%57.84", "CEQLrC61GV%16.00", "Cgd+mCZnWR%27.78", "CK8ZKCVBjB%68.28", "Cd+5LC62h3%2.92", "CEQLrC61GV%54.22", "Cgd+mCZnWR%34.61", "CK8ZKCVBjB%71.18", "Cd+5LC62h3%4.89", "CEQLrC61GV%36.73", "Cgd+mCZnWR%6.17", "CK8ZKCVBjB%57.02", "Cd+5LC62h3%42.49", "CEQLrC61GV%23.72", "Cgd+mCZnWR%10.80", "CK8ZKCVBjB%62.14", "Cd+5LC62h3%70.14", "CEQLrC61GV%13.35", "Cgd+mCZnWR%30.44", "CK8ZKCVBjB%32.33"], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1.7 }, { "type": 3, "content": "Sky_Gradient", "palette": "overcast", "cust": [], "a": 1 }] },
    "protector cache": { "version": 0.1, "w": 300, "h": 100, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 125, "y": 1, "w": 115, "h": 100, "seeds": ["D0OZnB-vpM"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 1 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#111800"], "a": 0.55 }, { "type": 1, "x": 0, "y": 5, "w": 320, "h": 100, "seeds": ["Ck4KKCPUR2%37.00", "CbJ79C3N2j%54.06", "CbJ79C3N2j%79.06", "CbJ79C3N2j%36.56", "B+0TfCQ-6g%16.25", "B+0TfCQ-6g%8.75", "CbJ79C3N2j%3.13", "CbJ79C3N2j%67.81", "C2D18CXs-r%20.63"], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 0, "w": 250, "h": 100, "seeds": ["D33Q8CPTaM%50.00", "D33Q8CPTaM%0.00<"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1.6 }, { "type": 1, "x": 265, "y": 100, "w": 50, "h": 100, "seeds": [], "palette": "D33Q8CPTaM", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 100, "w": 38, "h": 100, "seeds": [], "palette": "D33Q8CPTaM", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 190, "w": 300, "h": 100, "seeds": [], "palette": "D33Q8CPTaM", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 2, "x": -14, "y": 0, "w": 300, "h": 100, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 1, "x": 0, "y": 0, "w": 300, "h": 100, "seeds": ["D8PD8CPUR2%62.00", "D8PD8CPUR2%18.00<"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 1 }, { "type": 1, "x": 0, "y": 3, "w": 400, "h": 100, "seeds": ["CbJ79C3N2j%57.00", "CbJ79C3N2j%82.00", "CbJ79C3N2j%24.25", "CbJ79C3N2j%45.50", "CbJ79C3N2j%0.00", "CbJ79C3N2j%33.25", "B+0TfCQ-6g%61.00", "D5kJfCXV+P%4.75", "D5kJfCXV+P%74.25<", "D5kJfCXV+P%50.25", "D5kJfCXV+P%23.50", "CU3FeBy63P%68.25", "CWLkfCaAtv%1.00", "CU3FeBy63P%12.00", "CQF6eC6nPp%59.25", "CQF6eC6nPp%38.75", "C2D18CXs-r%58.25", "C2D18CXs-r%58.17"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1 }, { "type": 1, "x": -34, "y": 100, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] },
    "protector cache gone": { "version": 0.1, "w": 300, "h": 100, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 0, "y": 5, "w": 320, "h": 100, "seeds": ["Ck4KKCPUR2%37.00", "CbJ79C3N2j%54.06", "CbJ79C3N2j%79.06", "CbJ79C3N2j%36.56", "B+0TfCQ-6g%16.25", "B+0TfCQ-6g%8.75", "CbJ79C3N2j%3.13", "CbJ79C3N2j%67.81", "C2D18CXs-r%20.63"], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 0, "w": 250, "h": 100, "seeds": ["D33Q8CPTaM%50.00", "D33Q8CPTaM%0.00<"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1.6 }, { "type": 1, "x": 265, "y": 100, "w": 50, "h": 100, "seeds": [], "palette": "D33Q8CPTaM", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 100, "w": 38, "h": 100, "seeds": [], "palette": "D33Q8CPTaM", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 190, "w": 300, "h": 100, "seeds": [], "palette": "D33Q8CPTaM", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 2, "x": -14, "y": 0, "w": 300, "h": 100, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 1, "x": 0, "y": 0, "w": 300, "h": 100, "seeds": ["D8PD8CPUR2%62.00", "D8PD8CPUR2%18.00<"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 1 }, { "type": 1, "x": 0, "y": 3, "w": 400, "h": 100, "seeds": ["CbJ79C3N2j%57.00", "CbJ79C3N2j%82.00", "CbJ79C3N2j%24.25", "CbJ79C3N2j%45.50", "CbJ79C3N2j%0.00", "CbJ79C3N2j%33.25", "B+0TfCQ-6g%61.00", "D5kJfCXV+P%4.75", "D5kJfCXV+P%74.25<", "D5kJfCXV+P%50.25", "D5kJfCXV+P%23.50", "CU3FeBy63P%68.25", "CWLkfCaAtv%1.00", "CU3FeBy63P%12.00", "CQF6eC6nPp%59.25", "CQF6eC6nPp%38.75", "C2D18CXs-r%58.25", "C2D18CXs-r%58.17"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1 }, { "type": 1, "x": -34, "y": 100, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] },
    "settlement slope": { "version": 0.1, "w": 500, "h": 100, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.35 }, { "type": 1, "x": 0, "y": 6, "w": 500, "h": 100, "seeds": ["CFCOzCQfEZ%0.60", "CFA4XC9sjq%27.80", "CFCOzCQfEZ%74.60"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.2 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": 0, "y": 5, "w": 500, "h": 100, "seeds": ["CFA4XC9sjq%50.00", "CbJ79C3N2j%11.20", "CbJ79C3N2j%78.20", "CbJ79C3N2j%46.60", "B+0TfCQ-6g%79.40", "B+0TfCQ-6g%17.20", "CbJ79C3N2j%0.20", "CbJ79C3N2j%38.20", "CFCOzCQfEZ%10.00<"], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 195, "w": 500, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 2, "x": 0, "y": 0, "w": 1000, "h": 100, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 1, "x": 0, "y": 3, "w": 600, "h": 100, "seeds": ["CbJ79C3N2j%83.17", "CbJ79C3N2j%75.67", "CbJ79C3N2j%58.67", "CbJ79C3N2j%67.00", "CbJ79C3N2j%10.17", "CbJ79C3N2j%26.83", "B+0TfCQ-6g%11.17", "COjSfCM1-J%1.17", "COjSfCM1-J%18.67", "COjSfCM1-J%34.83<", "D5kJfCXV+P%85.33", "D5kJfCXV+P%16.17<", "D5kJfCXV+P%33.50", "D5kJfCXV+P%52.33", "CU3FeBy63P%43.33", "CWLkfCaAtv%1.33", "CU3FeBy63P%50.50", "CWLkfCaAtv%23.50"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1 }, { "type": 1, "x": -21, "y": 100, "w": 521, "h": 100, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] },
    "crystalline outpost": { "version": 0.1, "w": 500, "h": 130, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.2 }, { "type": 1, "x": 0, "y": 3, "w": 500, "h": 130, "seeds": ["CFCOzCQfEZ%50.00", "CqynPBzeNf%67.00"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 1 }, { "type": 1, "x": 0, "y": 3, "w": 500, "h": 130, "seeds": ["D2f+ECUro3%48.00"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 0.7 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.3 }, { "type": 2, "x": 400, "y": 10, "w": 100, "h": 130, "content": "town", "palette": "CFaeXCIEpJ", "s": 1.5 }, { "type": 1, "x": 0, "y": 0, "w": 450, "h": 130, "seeds": [], "palette": "CunEjC0KIh", "gcover": "sand [palette]", "ground": "clumpy dirt", "s": 1 }, { "type": 2, "x": 200, "y": 0, "w": 166, "h": 130, "content": "town", "palette": "CFaeXCIEpJ", "s": 1 }, { "type": 1, "x": 0, "y": 0, "w": 500, "h": 130, "seeds": ["CqzOSC0Kg7%83.00", "CqynPBzeNf%56.00", "CqxovC0hZi%41.80", "CqxovC0hZi%13.80", "CqxfXCGiCE%0.00", "BytjcC95wX%56.20", "BytjcC95wX%72.80", "BytjcC95wX%1.60"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#003314"], "a": 0.3 }, { "type": 1, "x": 0, "y": 22, "w": 600, "h": 130, "seeds": ["B+0yvB+Q9a%40.00", "B+0yvB+Q9a%66.17", "CqzOSC0Kg7%25.00", "CqynPBzeNf%38.00", "CqxovC0hZi%77.00", "CqxovC0hZi%62.83", "CqxfXCGiCE%52.00", "BytjcC95wX%38.83", "BytjcC95wX%68.83", "B+0yvB+Q9a%8.33"], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "chunky dirt", "s": 0.8 }, { "type": 2, "x": -150, "y": -12, "w": 332, "h": 130, "content": "town", "palette": "CFaeXCIEpJ", "s": 0.75 }, { "type": 2, "x": 0, "y": 0, "w": 500, "h": 130, "content": "cavern", "palette": "CavoqC0Iu8", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.8 }, { "type": 1, "x": 0, "y": 130, "w": 500, "h": 130, "seeds": [], "palette": "CFaeXCIEpJ", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1 }] },
    "crystalline outpost zoom": { "version": 0.1, "w": 500, "h": 130, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.2 }, { "type": 1, "x": 0, "y": 3, "w": 350, "h": 130, "seeds": ["CFCOzCQfEZ%52.00", "CqynPBzeNf%76.00"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 1.5 }, { "type": 1, "x": 0, "y": 3, "w": 350, "h": 130, "seeds": ["D2f+ECUro3%38.00"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.3 }, { "type": 1, "x": 0, "y": 0, "w": 350, "h": 130, "seeds": [], "palette": "CunEjC0KIh", "gcover": "sand [palette]", "ground": "clumpy dirt", "s": 1.5 }, { "type": 2, "x": 200, "y": 70, "w": 166, "h": 130, "content": "town", "palette": "CFaeXCIEpJ", "s": 1.5 }, { "type": 1, "x": -60, "y": 0, "w": 300, "h": 130, "seeds": ["CqynPBzeNf%56.00", "CqxovC0hZi%13.80", "BytjcC95wX%56.20", "BytjcC95wX%72.80", "BytjcC95wX%1.60"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "clumpy dirt", "s": 1.5 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#003314"], "a": 0.3 }, { "type": 1, "x": -135, "y": 35, "w": 600, "h": 130, "seeds": ["B+0yvB+Q9a%40.00", "B+0yvB+Q9a%66.17", "CqzOSC0Kg7%25.00", "CqynPBzeNf%38.00", "CqxovC0hZi%77.00", "CqxovC0hZi%62.83", "CqxfXCGiCE%52.00", "BytjcC95wX%38.83", "BytjcC95wX%68.83", "B+0yvB+Q9a%8.33"], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "chunky dirt", "s": 1.5 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.8 }, { "type": 1, "x": 0, "y": 130, "w": 500, "h": 130, "seeds": [], "palette": "CFaeXCIEpJ", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1 }] },
    "landslide": { "version": 0.1, "w": 500, "h": 130, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.2 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.3 }, { "type": 1, "x": 0, "y": 0, "w": 500, "h": 130, "seeds": ["CqzOSC0Kg7%15.80", "CqynPBzeNf%84.20", "CqxovC0hZi%0.00", "CqxovC0hZi%54.20", "CqxfXCGiCE%43.00", "BytjcC95wX%10.80", "BytjcC95wX%19.40", "BytjcC95wX%0.20", "D2f+ECUro3%73.40"], "palette": "CunEjC0KIh", "gcover": "sand [palette]", "ground": "clumpy dirt", "s": 1 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#003314"], "a": 0.3 }, { "type": 1, "x": 150, "y": 0, "w": 150, "h": 130, "seeds": ["CogIPC0J9F%28.00", "Cv9fCC0KIh%56.00", "CogIPC0J9F%2.00", "CunEjC0KIh%7.33", "CunEjC0KIh%62.00<"], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 2 }, { "type": 1, "x": 215, "y": 80, "w": 130, "h": 130, "seeds": ["Cv9fCC0KIh%6.15", "CogIPC0J9F%46.15", "CoIN9C0JZp%65.00<"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "chunky dirt", "s": 1.4 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.8 }, { "type": 1, "x": 0, "y": 130, "w": 500, "h": 130, "seeds": [], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1 }] },
    "landslide explosion": { "version": 0.1, "w": 500, "h": 130, "s": 2, "layers": [{ "type": 1, "x": 0, "y": -38, "w": 500, "h": 130, "seeds": ["D8odwCXsty%65.20", "D8odwCXsty%33.00<", "D8odwCXsty%48.20<", "D8odwCXsty%15.00", "D8odwCXsty%0.40", "D8odwCXsty%53.08<", "D8odwCXsty%36.10<", "D8odwCXsty%2.51", "D8odwCXsty%75.70", "D8odwCXsty%63.15"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 2 }, { "type": 3, "content": "Fog", "palette": "early evening", "cust": [], "a": 0.3 }, { "type": 1, "x": 0, "y": 0, "w": 500, "h": 130, "seeds": ["D8odwCXsty%39.40", "D8odwCXsty%3.80", "D8odwCXsty%57.60", "D8odwCXsty%19.60", "D8odwCXsty%80.20", "D8odwCXsty%43.73", "D8odwCXsty%0.43", "D8odwCXsty%60.54"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "none", "s": 2 }, { "type": 1, "x": 0, "y": 0, "w": 500, "h": 130, "seeds": ["CqzOSC0Kg7%15.80", "CqynPBzeNf%84.20", "CqxovC0hZi%0.00", "CqxovC0hZi%54.20", "CqxfXCGiCE%43.00", "BytjcC95wX%10.80", "BytjcC95wX%19.40", "BytjcC95wX%0.20", "D2f+ECUro3%73.40"], "palette": "CunEjC0KIh", "gcover": "sand [palette]", "ground": "clumpy dirt", "s": 1 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#003314"], "a": 0.3 }, { "type": 1, "x": 150, "y": 0, "w": 150, "h": 130, "seeds": ["CogIPC0J9F%28.00", "Cv9fCC0KIh%56.00", "CogIPC0J9F%2.00", "CunEjC0KIh%7.33", "CunEjC0KIh%62.00<"], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 2 }, { "type": 1, "x": 215, "y": 80, "w": 130, "h": 130, "seeds": ["Cv9fCC0KIh%6.15", "CogIPC0J9F%46.15", "CoIN9C0JZp%65.00<"], "palette": "CunEjC0KIh", "gcover": "none", "ground": "chunky dirt", "s": 1.4 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.4 }, { "type": 1, "x": 0, "y": 130, "w": 500, "h": 130, "seeds": [], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1 }] },
    "tunnel collapse": { "version": 0.1, "w": 500, "h": 150, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.12 }, { "type": 2, "x": 396, "y": -90, "w": 105, "h": 150, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 3, "content": "Fog", "palette": "custom", "cust": ["#8fbe99", "#58906f", "#3f7252", "#215a3f"], "a": 0.1 }, { "type": 1, "x": -30, "y": 12, "w": 200, "h": 150, "seeds": ["CNydfCA+jj%28.50", "CbJ79C3N2j%56.00", "CIcqeCEoys%2.00", "CbJ79C3N2j%66.14", "CbJ79C3N2j%51.75", "CIcqeCEoys%74.57", "CIcqeCEoys%25.58", "CGim9CQdYo%1.00", "CFCOzCQfEZ%55.00"], "palette": "D33Q8CPTaM", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 1, "x": 400, "y": 60, "w": 150, "h": 150, "seeds": ["CNydfCA+jj%53.33", "CNydfCA+jj%24.67", "CbJ79C3N2j%0.67", "CIcqeCEoys%46.69", "CbJ79C3N2j%52.83", "CbJ79C3N2j%39.53", "CIcqeCEoys%16.26", "CIcqeCEoys%45.42", "CGim9CQdYo%0.67"], "palette": "D33Q8CPTaM", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 295, "w": 500, "h": 150, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "none", "ground": "growth", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.45 }, { "type": 1, "x": 0, "y": -10, "w": 500, "h": 150, "seeds": ["CqxovC0hZi%40.00", "CFCOzCQfEZ%48.00"], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 0.75 }, { "type": 2, "x": -45, "y": 0, "w": 600, "h": 150, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 1, "x": 0, "y": 2, "w": 600, "h": 150, "seeds": ["CWLkfCaAtv%56.50", "CWLkfCaAtv%75.83", "D5kJfCMRh4%28.33", "CbJ79C3N2j%79.33", "CbJ79C3N2j%71.33", "CbJ79C3N2j%49.17", "CbJ79C3N2j%64.17", "B+0TfCQ-6g%55.83", "CU3FeBy63P%20.67", "CWLkfCaAtv%88.33", "CU3FeBy63P%36.00", "CWLkfCaAtv%10.33", "C-dhsB-A+Y%1.33", "C-dhsB-A+Y%14.33<", "C-dhsB-A+Y%43.00"], "palette": "CQF6fC62fc", "gcover": "grass [palette]", "ground": "none", "s": 1 }, { "type": 1, "x": -32, "y": 150, "w": 532, "h": 150, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] },
    "little garden": { "version": 0.1, "w": 500, "h": 130, "s": 2, "layers": [{ "type": 3, "content": "Fog", "palette": "forest murk", "cust": [], "a": 0.1 }, { "type": 3, "content": "Fog", "palette": "dusk", "cust": [], "a": 0.06 }, { "type": 1, "x": 495, "y": 130, "w": 10, "h": 130, "seeds": [], "palette": "D33Q8CPTaM", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 255, "w": 500, "h": 130, "seeds": [], "palette": "D33Q8CPTaM", "gcover": "grass [palette]", "ground": "growth", "s": 1 }, { "type": 1, "x": 0, "y": 2, "w": 520, "h": 130, "seeds": ["C+sseCPUD3", "CiAa8CPTlT", "C+sseCPUD3", "Czjd9CPUiJ", "C+sr4C4uLJ", "CDH1eCawOP", "CWk99CERpp", "CGim9CQdYo", "CGim9CQdYo", "CGim9CQdYo", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "CbJ79C3N2j", "C+sseCPUD3", "CyBz9CPUUE", "CyBz9CPUUE", "C+sr4C4uLJ"], "palette": "D33Q8CPTaM", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1 }, { "type": 1, "x": 0, "y": 0, "w": 500, "h": 130, "seeds": ["CyBz9CPUUE", "CyBz9CPUUE", "CyBz9CPUUE", "CyBz9CPUUE", "CyBz9CPUUE", "CyBz9CPUUE", "#003321%40"], "palette": "CunEjC0KIh", "gcover": "grass [palette]", "ground": "clumpy dirt", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.2 }, { "type": 2, "x": -45, "y": 0, "w": 600, "h": 130, "content": "vines", "palette": "CbJ79C3N2j", "s": 1 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.3 }, { "type": 3, "content": "Fog", "palette": "night", "cust": [], "a": 0.3 }, { "type": 1, "x": 0, "y": 20, "w": 400, "h": 130, "seeds": ["Czjd9CPUiJ", "C+sseCPUD3", "C+sr4C4uLJ", "CqBGeCS8lE", "CqBGeCS8lE", "D5kJfCMRh4<", "CWLkfCaAtv", "CWLkfCaAtv", "CWLkfCaAtv<", "CU3FeBy63P", "CU3FeBy63P<", "CE1seB-w1X", "CGim9CQdYo", "CGim9CQdYo"], "palette": "D33Q8CPTaM", "gcover": "grass [palette]", "ground": "grass", "s": 1.25 }, { "type": 3, "content": "Fog", "palette": "rose dusk", "cust": [], "a": 0.5 }, { "type": 1, "x": -22, "y": 130, "w": 532, "h": 130, "seeds": [], "palette": "Ctc3mCPTYy", "gcover": "grass [palette]", "ground": "growth", "s": 1 }] },
};

let ITEMS = {
    "sroot strange package": { "name": "strange package", "description": "A small but heavy package meant to be delivered somewhere in the root tunnels" },
    "sroot depleted fragments": { "name": "depleted fragments", "description": "A few shards of something, now grey and lifeless. Fell out of a strange package when it was opened." },
    "pure water": { "name": "pure water", "description": "A flask of water of uncommon purity. Completely safe to drink and suitable for many magical rites." },
    "empty waterskin": { "name": "empty waterskin", "description": "A watertight skin suitable for storing fluids. This one's empty." },
    "treasure": { "name": "treasure", "description": "All that glitters is gold" },
    "berries": { "name": "berries", "description": "Reasonably tasty berries known to be edible" },
    "health": { "name": "health", "description": "All you really have at the end of the day." },
    "root protector totem": { "name": "root protector totem", "description": "A totem fashioned to resemble one of the constructs that patrols the root maze, and the Endless Green as a whole. Can be used to appease one, so long as it's not too angered." },
    "sroot resin": { "name": "magic-cured resin", "description": "A lump of curing resin gathered from a tunnel root. This magically potent substance is secreted in response to damage." },
    "sroot quest resin": { "name": "QUEST: gather magic-cured resin", "description": "Find magic-cured resin and return it to the crystalline outpost." },
    "sroot quest water": { "name": "QUEST: gather pure water", "description": "Find pure water and return it to the crystalline outpost." },
    "sroot evilcrystal": { "name": "strange crystal?", "description": "A shard of...something. Just looking at it hurts. Hard to tell what color it is, if any, as even light seems to shatter off it." }
};

export {WORLD, BACKDROPS, ITEMS};
