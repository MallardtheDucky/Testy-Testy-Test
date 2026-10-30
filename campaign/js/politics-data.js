/* REPUBLIKA Politics: CONTENT ONLY. Names, dates and descriptions here are PLACEHOLDERS to be replaced with researched history.
   The engine is js/politics.js. Nothing in this file needs code changes to extend: add entries in the same shape.

   situations[]  { from:[y,m], title, mood, text, tensions:[[label, 0..3]] }   latest entry whose date has passed is shown. Months are 0-based.
   orgs[]        { id, group:"authority"|"movement"|"interest", name, mono, color, aud, kind, tag, holder?, desc, goals[], beliefs,
                   leaders:[{id, role}], phases:[{from:[y,m], status, influence 0-4, desc?}], careers:[opportunityIds],
                   from?:[y,m], needs?:[cond], actions:[...] }
        Timeline gate: an org is invisible (not even locked) until now >= from AND (no needs OR any one need holds).
        needs cond (any one): {flag}, {letter:ref}, {story:id}, {event:id}, {public:flag}.
        !! Revolutionary or later institutions MUST carry both `from` and `needs`, so they only appear through an in-world discovery. !!
        aud = whose opinion of the player reflects this body: authorities | reformers | church | merchants
   action        { id, label, note, kind: support|oppose|attend|join|reform|cooperate|leave, text (what the character writes in the journal),
                   outcome, pts?, repeat? (months before it can be done again; default once), stance?:[stances it is shown for],
                   from?, until?, req:{tags (hidden unless background fits), minAge, rep, funds, quals, conn:[{person,min}], view:{aud:min},
                   flags:[[flag,label]], noFlags:[[flag,label]], orgs:{id:[stances]}},
                   fx:{funds, rep, flags[], public[], view:{aud:n}, rel:{personId:n}, meet:[personIds], stance:"support"|"member"|"oppose"|"none"} }
   figures[]     New people for the People & Connections roster (same shape as D.people) plus  pol:{ role, orgs[], public, offers, hint, where?, access?:{req, text, outcome, fx} }
   tags{}        Political data added to people who already exist in people.js.
   favors{}      Extra introductions added to existing people (they are written for as letters in People & Connections). */
window.REPUBLIKA_POLITICS = {
  situations: [
    { from: [1892, 0], title: "A Colony Under Watch", mood: "Tense but orderly",
      text: "The Governor-General rules from Malacañang with the Guardia Civil at his back and the friar orders at his elbow. The reform movement that began among students in Madrid has come home: Dr. Rizal is in Manila, gentlemen of the Propaganda are meeting in private houses, and the authorities have begun to count who attends. Most people keep working and keep quiet.",
      tensions: [["Reform and reaction", 2], ["Guardia Civil vigilance", 2], ["Friar estates and tribute", 2], ["Trade and port duties", 1]] },
    { from: [1892, 7], title: "After the Arrest", mood: "Uneasy",
      text: "The physician has been sent to Dapitan and the League he founded has been broken up before it could do anything. The authorities are relieved and watchful. Reformists are divided between patience and impatience, and everyone who attended a meeting is wondering whose name is on a list.",
      tensions: [["Reform and reaction", 3], ["Guardia Civil vigilance", 3], ["Friar estates and tribute", 2], ["Trade and port duties", 1]] },
    { from: [1893, 5], title: "A Season of Reforms on Paper", mood: "Watchful",
      text: "Madrid has decreed a reform of municipal government, and a new hand holds the Palace. Some see an opening for the principales; others see a way of keeping the same men in the same chairs. The reform circles are quieter, and the quiet is not trusted.",
      tensions: [["Reform and reaction", 2], ["Guardia Civil vigilance", 2], ["Municipal reform", 2], ["Trade and port duties", 1]] }
  ],

  // Past decisions already recorded in the game colour how each audience sees the player.
  flagfx: {
    "vigil": { reformers: 1, authorities: -1, church: 1 }, "quiet-donor": { reformers: 1 }, "kept-clear": { authorities: 1, reformers: -1 },
    "known-to-guardia": { authorities: -1 }, "ilaya-meeting": { reformers: 2, authorities: -1, church: -1 },
    "strongroom-keys": { merchants: 1 }, "licensed-trader": { merchants: 1 }, "ref-eusebio": { merchants: 1 }
  },

  tags: {
    isidro:   { role: "Bookseller and host of a reading circle", orgs: ["propaganda", "liga"], public: "A Quiapo bookseller said to lend more than he sells.", offers: "Introductions to the reform circles and to Madrid." },
    ilagan:   { role: "Trader, friendly to reform", orgs: ["propaganda", "merchants"], public: "A Cavite trader who carries news both ways.", offers: "Knows the principales of Cavite." },
    anselmo:  { role: "Parish priest, counsel to the Filipino clergy", orgs: ["church", "filclergy"], public: "A secular priest, respected in Tondo.", offers: "Can speak for you to the parish and the town." },
    ambrosio: { role: "Clerk at City Hall", orgs: ["city"], public: "A long-serving clerk at the Ayuntamiento.", offers: "Knows which door leads to which office." },
    eusebio:  { role: "Merchant of standing", orgs: ["merchants"], public: "A Binondo merchant with a long-established house.", offers: "Weight among the Binondo houses." },
    ferrer:   { role: "Corporal of the Guardia Civil", orgs: ["guardia"], public: "A Guardia corporal who patrols Tondo.", offers: "Decides whose name is written down." }
  },

  favors: {
    isidro:   [{ id: "lodge", label: "Ask for an introduction to a lodge master", need: 5, result: "He will arrange for you to be received by Don Nicolás Aguirre.", fx: { meet: ["lodgemaster"] } }],
    anselmo:  [{ id: "town", label: "Ask for an introduction to the gobernadorcillo", need: 3, result: "Fr. Anselmo mentioned your name to Don Gonzalo at the convento.", fx: { meet: ["gobernadorcillo"] } },
               { id: "clergy", label: "Ask for an introduction to a Filipino priest", need: 4, result: "He will bring you to Fr. Mateo after Sunday Mass.", fx: { meet: ["fsecular"] } }],
    eusebio:  [{ id: "guild", label: "Ask for an introduction to a leading merchant", need: 4, result: "He wrote a card of introduction to Don Ildefonso.", fx: { meet: ["merchantlead"] } }],
    ambrosio: [{ id: "palace", label: "Ask for an introduction to the Palace secretary", need: 4, result: "He will see that Sr. Quirós hears your name.", fx: { meet: ["secretary"] } }]
  },
  ask: { "isidro:lodge": "an introduction to a master of one of the lodges", "anselmo:town": "an introduction to the gobernadorcillo of Tondo", "anselmo:clergy": "an introduction to one of the Filipino priests",
         "eusebio:guild": "an introduction to one of the leading merchants", "ambrosio:palace": "an introduction to the secretary at the Palace" },

  figures: [
    { id: "despujol", name: "Gen. Eulogio Despujol", occ: "Governor-General", age: 58, place: "Malacañang, Manila", bg: "A career soldier sent from Madrid to restore order and revenue. He prefers firmness to flattery.", traits: ["Firm", "Proud", "Calculating"], info: "Receives few and forgets none.", how: "The Governor-General.", score: 0, links: [{ to: "secretary", kind: "business" }], met: [{ intro: "despujol" }], heard: [{ start: 1 }],
      pol: { role: "Governor-General of the Philippines", orgs: ["governor"], public: "Appointed from Madrid. The final authority in the islands.", offers: "Appointments, pardons and petitions all pass his desk.", where: "An audience is not given to a clerk. Reputation and a senior introduction come first.",
        access: { req: { rep: 70, flags: [["palace-intro", "A senior official’s introduction"]] }, text: "I was shown into a room the size of our whole house. He asked three questions and listened to none of the answers. I left with the feeling of having been weighed.", outcome: "You stood in the Palace and were weighed.", fx: { rep: 2, view: { authorities: 1 } } } } },
    { id: "secretary", name: "Sr. Aurelio Quirós", occ: "Secretary, Governor-General’s office", age: 44, place: "Malacañang, Manila", bg: "Keeps the Governor-General’s correspondence and, it is said, his temper.", traits: ["Discreet", "Exact"], info: "Decides which petitions reach the desk.", how: "Introduced through the Palace clerks.", score: 0, links: [{ to: "ambrosio", kind: "business" }], met: [{ intro: "secretary" }], heard: [{ via: "ambrosio" }],
      pol: { role: "Secretary to the Governor-General", orgs: ["governor"], public: "The man who decides which petitions reach the Governor-General.", offers: "Can see a petition read, or not.", hint: "Prefers correct Spanish and short requests.",
        access: { req: { rep: 45, quals: ["spanish"], conn: [{ person: "ambrosio", min: 3 }] }, text: "Sr. Quirós received me for ten minutes, read my card, and asked what exactly I wanted. I said very little, and it seemed to be the right amount.", outcome: "He now knows your name and your handwriting.", fx: { rep: 1, view: { authorities: 1 } } } } },
    { id: "ortega", name: "Comandante Rafael Ortega", occ: "Commander, Guardia Civil, Manila", age: 47, place: "Manila", bg: "An officer of the Peninsula who regards the capital as a long patrol.", traits: ["Suspicious", "Dutiful"], info: "Reads the corporals’ lists himself.", how: "Introduced at the Comandancia.", score: -1, links: [{ to: "ferrer", kind: "business" }], met: [{ intro: "ortega" }], heard: [{ via: "ferrer" }],
      pol: { role: "Commander of the Guardia Civil in Manila", orgs: ["guardia"], public: "Commands the Guardia detachments in the capital.", offers: "Can strike a name from a list, or add one.", hint: "Responds to usefulness and to nothing else.",
        access: { req: { flags: [["known-to-guardia", "The Guardia have already taken note of you"]], view: { authorities: 0 } }, text: "I was called to the Comandancia and kept waiting an hour. The Comandante was courteous in the way of a man who has already decided.", outcome: "You are known to the Comandancia by more than a line in a ledger.", fx: { view: { authorities: 1 } } } } },
    { id: "provincial", name: "Fr. Ignacio Santa Cruz", occ: "Friar provincial", age: 61, place: "Intramuros", bg: "Heads his order’s houses and estates in the islands. Seldom seen outside the walls.", traits: ["Learned", "Unbending", "Powerful"], info: "His word settles parish appointments.", how: "Received at the convento.", score: -1, links: [{ to: "anselmo", kind: "parish" }], met: [{ intro: "provincial" }], heard: [{ via: "anselmo" }],
      pol: { role: "Provincial of a friar order", orgs: ["church"], public: "Head of an order that owns land across several provinces.", offers: "Parish appointments and the goodwill of the Church.", hint: "Approves of devotion, order and tact.",
        access: { req: { rep: 55, conn: [{ person: "anselmo", min: 4 }], view: { church: 2 } }, text: "I was received in a cool room with no chairs but his. I spoke of the parish and he spoke of the estates, and neither of us changed the subject.", outcome: "You have been seen by a man whose notice is rarely given.", fx: { view: { church: 1 } } } } },
    { id: "gobernadorcillo", name: "Don Gonzalo Villanueva", occ: "Gobernadorcillo of Tondo", age: 55, place: "Tondo", bg: "A principal who has held the town’s staff of office twice and expects to hold it again.", traits: ["Stately", "Cautious", "Vain"], info: "Answers to the alcalde and to his own pride.", how: "Received at the casa tribunal.", score: 0, links: [{ to: "anselmo", kind: "parish" }], met: [{ intro: "gobernadorcillo" }], heard: [{ via: "anselmo" }],
      pol: { role: "Chief municipal officer of Tondo", orgs: ["principales"], public: "The elected chief of the town, chosen by the principales.", offers: "Names the cabezas and sits on every town committee.", hint: "Likes to be consulted before he is asked.",
        access: { req: { rep: 35, conn: [{ person: "anselmo", min: 2 }] }, text: "I called at the casa tribunal after the Angelus and gave my name. Don Gonzalo received me standing and asked who had sent me, which was the whole interview.", outcome: "The gobernadorcillo knows who you are.", fx: { rep: 1, view: { merchants: 1 } } } } },
    { id: "lodgemaster", name: "Don Nicolás Aguirre", occ: "Master of a Manila lodge", age: 50, place: "Manila", bg: "A man of business who keeps another life behind a door he does not discuss.", traits: ["Secretive", "Generous", "Cultivated"], info: "Receives only by introduction.", how: "Received at the lodge.", score: 0, links: [{ to: "isidro", kind: "friend" }], met: [{ intro: "lodgemaster" }], heard: [{ via: "isidro" }],
      pol: { role: "Venerable master of a lodge", orgs: ["masons"], public: "Spoken of in low voices as a leading Freemason.", offers: "Admission to the lodge, and what comes with it.", where: "Reached through a friend in the Propaganda, or on seeking initiation.", hint: "Judges you by who vouches for you." } },
    { id: "fsecular", name: "Fr. Mateo Villar", occ: "Secular priest", age: 46, place: "Manila", bg: "A Filipino priest who has waited twenty years to be given a parish of his own.", traits: ["Patient", "Eloquent", "Bruised"], info: "Speaks for the Filipino clergy in quiet company.", how: "Introduced after Mass.", score: 0, links: [{ to: "anselmo", kind: "parish" }], met: [{ intro: "fsecular" }], heard: [{ via: "anselmo" }],
      pol: { role: "Spokesman of the Filipino secular clergy", orgs: ["filclergy"], public: "A Filipino priest who has petitioned for parishes more than once.", offers: "Standing among the Filipino clergy.", hint: "Values a layman who is seen at Mass and speaks with care.",
        access: { req: { minAge: 18, conn: [{ person: "anselmo", min: 3 }], view: { church: 1 } }, text: "Fr. Anselmo brought me to Fr. Mateo after Mass. We spoke of parishes and of patience, and I understood that those were two words for the same grievance.", outcome: "You are known among the Filipino clergy as a layman worth speaking to.", fx: { rep: 1, view: { church: 1 } } } } },
    { id: "merchantlead", name: "Don Ildefonso Carrillo", occ: "Presiding merchant, Binondo trade", age: 56, place: "Binondo", bg: "Speaks for the trading houses when they must be seen to agree.", traits: ["Diplomatic", "Wealthy", "Impatient"], info: "Hears every price before it is posted.", how: "A card of introduction.", score: 0, links: [{ to: "eusebio", kind: "business" }], met: [{ intro: "merchantlead" }], heard: [{ via: "eusebio" }],
      pol: { role: "Spokesman of the Binondo trading houses", orgs: ["merchants"], public: "The merchant the other merchants send to the Palace.", offers: "A hearing among the trading houses.", hint: "Respects solvency above sentiment.",
        access: { req: { rep: 40, funds: 200, conn: [{ person: "eusebio", min: 3 }] }, text: "Don Ildefonso looked at my card, then at my coat, then at my card again. We spoke of freight rates. Nobody said it, but I was being priced.", outcome: "A leading merchant now knows your name.", fx: { rep: 1, view: { merchants: 1 } } } } },
    { id: "rizal", name: "Dr. José Rizal", occ: "Physician and author", age: 31, place: "Manila", bg: "A physician and writer lately returned from Europe, welcomed by some and watched by many more.", traits: ["Brilliant", "Reserved", "Determined"], info: "Believes in reform by pen, schooling and law.", how: "Met at the gathering on Ilaya Street.", score: 1, links: [{ to: "isidro", kind: "friend" }], met: [{ flag: "ilaya-meeting" }], heard: [{ start: 1 }],
      pol: { role: "Reformist author and founder of the League", orgs: ["propaganda", "liga"], public: "The celebrated author of Noli Me Tángere, lately returned to Manila.", offers: "The reform cause looks to him above all others.", where: "He is expected at the gathering on Ilaya Street. Accept the invitation, and you may meet him." } }
  ],

  orgs: [
    { id: "governor", group: "authority", name: "Governor-General & Malacañang", mono: "GG", color: "#c9a14a", aud: "authorities", kind: "Colonial government", holder: "Gen. Eulogio Despujol",
      tag: "The Crown’s representative in the islands",
      desc: "The Governor-General holds civil and military command and answers to the Ministry of Overseas in Madrid. He may appoint, pardon or exile at his own discretion.",
      goals: ["Keep order and keep the revenue flowing", "Prevent any society that could challenge Spanish rule", "Reward the loyal and discourage the troublesome"], beliefs: "Order first, reform later, and only when Madrid says so.",
      leaders: [{ id: "despujol", role: "Governor-General" }, { id: "secretary", role: "Secretary" }],
      phases: [{ from: [1892, 0], status: "In firm command. Watching the reformist circles closely.", influence: 4 }, { from: [1893, 5], status: "A new Governor-General has settled in; policy is under review.", influence: 4 }],
      actions: [
        { id: "petition", label: "Send a respectful petition to the Palace", note: "A grievance, set out in proper Spanish.", kind: "reform", req: { quals: ["spanish"], rep: 40 },
          text: "I drew up the petition in my best Spanish and had it read over by a man who knows the forms. It is short, and respectful to the point of pain. Whether anyone reads it is another matter.", outcome: "The petition was received and filed. You were not answered, but your name is on a page the Palace reads.", fx: { funds: -2, rep: 1, view: { authorities: 1 } } },
        { id: "reception", label: "Attend the Governor-General’s public reception", note: "Be seen among the notable men of the city.", kind: "attend", repeat: 6, req: { rep: 55 },
          text: "I stood in the line of gentlemen and bowed when it was my turn. He did not look at me, which in such a place is a safe thing to be.", outcome: "You were seen at the Palace among men of standing.", fx: { rep: 2, view: { authorities: 1, merchants: 1 } } }
      ] },
    { id: "guardia", group: "authority", name: "Guardia Civil & the Comandancia", mono: "GC", color: "#6f8f6a", aud: "authorities", kind: "Police and rural constabulary", holder: "",
      tag: "The colony’s police, with a long memory",
      desc: "The Guardia Civil patrols town and country. It answers to the Governor-General and keeps its own lists of persons who attend meetings, travel or read the wrong papers.",
      goals: ["Prevent disorder before it starts", "Learn who meets whom, and where", "Be obeyed in the street"], beliefs: "A quiet town is a well-governed town, and a name written down is a problem solved.",
      leaders: [{ id: "ortega", role: "Comandante" }, { id: "ferrer", role: "Corporal in Tondo" }],
      phases: [{ from: [1892, 0], status: "Reinforced along the bay. Keeping lists.", influence: 3 }],
      actions: [
        { id: "inform", label: "Offer to tell the Comandancia what you hear", note: "Safety, of a kind, at someone else’s expense.", kind: "cooperate", stance: ["none"], pts: 2, req: { noFlags: [["informer", "You have not already offered your services"]] },
          text: "I told the corporal that I hear things at the counting house and that I would not wish any harm to come to the peace of the city. He thanked me. I washed my hands after, and it did not help.", outcome: "The corporal wrote your name in a different column. You may find that harder to cross out.", fx: { funds: 20, rep: -2, flags: ["informer"], view: { authorities: 2, reformers: -3 }, rel: { ferrer: 2 }, stance: "support" } },
        { id: "civil", label: "Make yourself known to the local corporal", note: "Courteous, correct and unmemorable.", kind: "cooperate", req: { flags: [["known-to-guardia", "The Guardia have already taken note of you"]] },
          text: "I stopped the corporal on his round and gave him good evening and my cédula without being asked. A man whom the Guardia knows to be civil is a man they leave alone, or so I hope.", outcome: "He nodded and walked on. It is the best you could have hoped for.", fx: { view: { authorities: 1 }, rel: { ferrer: 1 } } },
        { id: "recant", label: "Withdraw your offer to the Comandancia", note: "Stop reporting and accept what follows.", kind: "leave", stance: ["support"], req: { flags: [["informer", "You offered to inform"]] },
          text: "I told the corporal I had nothing more to tell him, and that I would not come again. He looked at me for some time. I could not tell whether it was threat or disappointment.", outcome: "He noted it, and so did you.", fx: { rep: 1, view: { authorities: -1, reformers: 1 }, stance: "none" } }
      ] },
    { id: "city", group: "authority", name: "Ayuntamiento & Municipal Offices", mono: "AY", color: "#9a8f78", aud: "authorities", kind: "Municipal government", holder: "The Alcalde and the council",
      tag: "The city’s council, clerks and tax rolls",
      desc: "The Ayuntamiento collects the city’s taxes, issues its papers and employs its clerks. It is slow, formal and entirely dependent on the Palace.",
      goals: ["Collect the revenue and issue the papers", "Keep the streets, markets and fiestas orderly"], beliefs: "A correct form is a form that has been stamped.",
      leaders: [{ id: "ambrosio", role: "Clerk" }],
      phases: [{ from: [1892, 0], status: "Routine. Understaffed and anxious about the next inspection.", influence: 2 }],
      careers: ["escribiente"],
      actions: [
        { id: "session", label: "Sit in the public gallery of the council", note: "Learn how the city really decides things.", kind: "attend", repeat: 3, req: { tags: ["clerk", "official"] },
          text: "The council sat for three hours over a drain in Binondo and a dispute about a stall. I learned that nothing is decided in the room. It is decided on the stairs, beforehand.", outcome: "You learned who decides things, and where.", fx: { rep: 1, view: { authorities: 1 }, rel: { ambrosio: 1 } } }
      ] },
    { id: "church", group: "authority", name: "The Church & Friar Orders", mono: "IC", color: "#8f7fc0", aud: "church", kind: "Church and religious orders", holder: "The Archbishop and the friar provincials",
      tag: "Parish, pulpit and landlord",
      desc: "The Church runs the parishes, schools and many charities, and the friar orders own great estates. The parish priest is often the only Spanish official a villager ever speaks to.",
      goals: ["Keep the faithful obedient and the parishes in friar hands", "Condemn secret societies and foreign ideas", "Protect the estates and their rents"], beliefs: "Authority comes from God, and the friar knows the native better than he knows himself.",
      leaders: [{ id: "provincial", role: "Friar provincial" }, { id: "anselmo", role: "Parish priest, Tondo" }],
      phases: [{ from: [1892, 0], status: "Firmly entrenched, and uneasy about the reformists.", influence: 4 }],
      actions: [
        { id: "cofradia", label: "Join the parish confraternity", note: "Be counted among the devout.", kind: "join", stance: ["none"], req: { minAge: 18 },
          text: "I gave my name to the sacristan and paid the entrance fee of ten pesos. Fr. Anselmo said nothing, but I saw him write it down with some satisfaction.", outcome: "Your name is on the roll of the confraternity.", fx: { funds: -10, rep: 1, view: { church: 2 }, rel: { anselmo: 1 }, stance: "member" } },
        { id: "estates", label: "Speak against the friar estates among friends", note: "A grievance that has many owners.", kind: "oppose", stance: ["none", "support"], req: { rep: 40 },
          text: "At supper I said what half the table was thinking: that the rents on the estates have no end and no reason. Nobody agreed aloud, and nobody left the table either.", outcome: "Word of what you said will travel, and not in one direction only.", fx: { rep: 1, view: { church: -2, reformers: 2, authorities: -1 }, stance: "oppose" } },
        { id: "leave", label: "Let your place in the confraternity lapse", note: "Quietly.", kind: "leave", stance: ["member"],
          text: "I stopped going on the first Friday, and then on the second. A man in a parish does not need to announce what he is no longer.", outcome: "No one remarked on it, which is a kind of remark.", fx: { rep: -1, view: { church: -1 }, stance: "none" } }
      ] },

    { id: "propaganda", group: "movement", name: "The Propaganda Movement", mono: "PM", color: "#4f8fbf", aud: "reformers", kind: "Reform movement", holder: "",
      tag: "Reform by pen, petition and schooling",
      desc: "Filipinos in Madrid and Manila who ask for equal rights, representation in the Cortes and an end to friar privilege, through peaceful, lawful means. Its journal is La Solidaridad.",
      goals: ["Representation for the islands in the Cortes", "Equal treatment before the law", "Schools, and the secularisation of parishes"], beliefs: "Spain can be persuaded; the case must be made clearly and without violence.",
      leaders: [{ id: "rizal", role: "Leading voice" }, { id: "isidro", role: "Circle host, Quiapo" }, { id: "ilagan", role: "Sympathiser, Cavite" }],
      phases: [{ from: [1892, 0], status: "Active but watched. Its journal is read in secret.", influence: 2 }],
      careers: ["solidaridad"],
      actions: [
        { id: "subscribe", label: "Subscribe to La Solidaridad", note: "Read what it prints, and be seen to.", kind: "support", stance: ["none"], req: { quals: ["literate"], funds: 15 },
          text: "I sent fifteen pesos to Madrid by a trusted hand. When it comes I shall read it twice and burn the wrapper. A man may agree with something without declaring it in the street.", outcome: "You now receive the reformist press, by the back stairs.", fx: { funds: -15, rep: 1, view: { reformers: 1, authorities: -1 }, stance: "support" } },
        { id: "circle", label: "Join a reading circle at the bookseller’s", note: "Meet people who talk about more than prices.", kind: "attend", repeat: 4, req: { conn: [{ person: "isidro", min: 3 }] },
          text: "Six of us sat among the almanacs while Isidro read from a letter out of Madrid. We spoke of schools and of the Cortes and nobody said a word that could not be repeated to a priest. It felt like the opposite of safety.", outcome: "You were counted among those who attend.", pts: 2, fx: { view: { reformers: 1 }, rel: { isidro: 1 }, flags: ["reform-circle"] } },
        { id: "denounce", label: "Denounce the agitators in respectable company", note: "Choose order, and be heard to.", kind: "oppose", stance: ["none", "support"], req: {},
          text: "At the casino I said that men who stir the public mind for their own vanity do more harm than any tax. I was warmly applauded. I will remember the sound of it for a long time.", outcome: "The respectable are pleased. The reformists will hear of it.", fx: { rep: 1, view: { authorities: 2, church: 1, reformers: -2 }, rel: { isidro: -2 }, stance: "oppose" } },
        { id: "lapse", label: "Let your subscription lapse", note: "Step back without a word.", kind: "leave", stance: ["support"],
          text: "I did not renew. It is not cowardice, I tell myself, merely arithmetic.", outcome: "No one remarked on it. You noticed the silence.", fx: { view: { reformers: -1 }, stance: "none" } }
      ] },
    { id: "liga", group: "movement", name: "La Liga Filipina", mono: "LF", color: "#3f9a4a", aud: "reformers", kind: "Mutual-aid society", holder: "",
      tag: "A league for mutual aid, schooling and defence",
      needs: [{ letter: "CORR-92-035" }, { story: "league-talk" }],
      desc: "A new society meant to unite the islands in one body, with mutual aid, schools, legal defence and a council of its own. It is lawful on paper and alarming to the authorities in practice.",
      goals: ["Unite the islands in a single association", "Aid its members in trade, education and law", "Prepare reforms to be proposed lawfully"], beliefs: "Strength lies in union, and in dull, steady organisation.",
      leaders: [{ id: "rizal", role: "Founder" }, { id: "isidro", role: "Early member" }],
      phases: [{ from: [1892, 0], status: "Newly founded. Meets in private houses.", influence: 1 }, { from: [1892, 7], status: "Broken up after its founder’s arrest. Scattered circles remain.", influence: 0, desc: "The League was broken up within days of its founder’s arrest. What survives is a handful of members who still know one another and still keep their own counsel." }],
      actions: [
        { id: "join", label: "Add your name to the League", note: "A name on a list, and a promise to keep it in your head.", kind: "join", stance: ["none", "support"], until: [1892, 6], pts: 3,
          req: { minAge: 18, rep: 30, conn: [{ person: "isidro", min: 3 }], flags: [["ilaya-meeting", "You attended the gathering at Ilaya Street"]] },
          text: "I said my name and the room wrote it down in no hand I could see. I came away with a sheet of rules that I read once and put in the stove. I belong to something now, and I will not be able to say what.", outcome: "You belong to something that has not yet been tested.", fx: { rep: 2, flags: ["liga-member"], view: { reformers: 2, authorities: -2, church: -1 }, rel: { isidro: 1 }, stance: "member" } },
        { id: "circles", label: "Keep in touch with the scattered circles", note: "Carry on quietly, in small company.", kind: "support", from: [1892, 7], repeat: 4, req: { flags: [["liga-member", "You were a member of the League"]] },
          text: "We meet in twos now, never in threes, and we speak of nothing that could not be called a christening. It is a smaller thing than it was, and perhaps a harder one to break.", outcome: "The thread is not cut. It is thin.", fx: { view: { reformers: 1, authorities: -1 } } }
      ] },
    { id: "masons", group: "movement", name: "The Masonic Lodges", mono: "ML", color: "#7aa0b8", aud: "reformers", kind: "Secret society", holder: "",
      tag: "Brotherhood, and trouble with the Church",
      desc: "Lodges of the Spanish Grand Orient meet in Manila and Cavite. Many members are professionals and reformists. The Church condemns them and the authorities distrust them.",
      goals: ["Mutual aid and fraternity among members", "Quietly advance liberal causes", "Protect members from persecution"], beliefs: "Reason, fraternity and discretion.",
      leaders: [{ id: "lodgemaster", role: "Venerable master" }],
      phases: [{ from: [1892, 0], status: "Active, discreet and unpopular with the Church.", influence: 1 }],
      actions: [
        { id: "initiate", label: "Seek initiation into a lodge", note: "A serious step, and not an inexpensive one.", kind: "join", stance: ["none", "support"], pts: 3, req: { minAge: 21, rep: 40, funds: 60, conn: [{ person: "isidro", min: 4 }] },
          text: "I was led blindfolded up a staircase I had thought I knew. What was said there I will not write, even here. I paid my sixty pesos, and I do not think I will tell Fr. Anselmo.", outcome: "You are a brother. The Church would call you worse.", fx: { funds: -60, rep: 1, flags: ["mason"], view: { reformers: 2, church: -3, authorities: -1 }, meet: ["lodgemaster"], stance: "member" } },
        { id: "resign", label: "Resign from the lodge", note: "Break with the brotherhood.", kind: "leave", stance: ["member"],
          text: "I wrote my resignation in four lines and gave it to the secretary without looking at his face. A man may belong to many things, but not to all at once.", outcome: "The brothers accepted your resignation. They did not forget it.", fx: { rep: -1, view: { reformers: -1, church: 1 }, stance: "none" } }
      ] },
    { id: "filclergy", group: "movement", name: "The Filipino Secular Clergy", mono: "FC", color: "#d0607a", aud: "church", kind: "Clergy movement", holder: "",
      tag: "Priests who ask to keep their own parishes",
      desc: "Filipino priests who have long asked to hold the parishes the friar orders keep. They are loyal to the Church, and a grievance to the friars.",
      goals: ["Parishes for Filipino priests", "Equal standing with the friars"], beliefs: "The Church is for the faithful, not for the orders that hold it.",
      leaders: [{ id: "fsecular", role: "Spokesman" }, { id: "anselmo", role: "Sympathiser" }],
      phases: [{ from: [1892, 0], status: "Patient, and not much listened to.", influence: 1 }],
      actions: [
        { id: "petition", label: "Sign the petition for Filipino parish priests", note: "A lawful, dutiful request.", kind: "reform", stance: ["none", "oppose"], req: { minAge: 18, conn: [{ person: "anselmo", min: 3 }] },
          text: "I signed below Fr. Anselmo’s name, and I was careful to write my name the same way I write it for my cédula. It is a harmless thing to sign, and it will not be thought so by everybody.", outcome: "Your name stands under a petition the friars will read.", fx: { rep: 1, view: { church: -1, reformers: 1 }, rel: { anselmo: 1 }, stance: "support" } },
        { id: "talk", label: "Attend a talk after Mass", note: "Listen to the case being made.", kind: "attend", repeat: 4, req: { tags: ["tondo"] },
          text: "A priest I did not know spoke for a quarter of an hour after the last Mass, and nobody left the church. It was the most political speech I have heard, and it never once used the word.", outcome: "You heard the Filipino clergy’s case, unhurried.", fx: { view: { church: 1, reformers: 1 } } }
      ] },

    { id: "merchants", group: "interest", name: "The Binondo Trading Houses", mono: "BT", color: "#c9a14a", aud: "merchants", kind: "Commercial interest", holder: "",
      tag: "Hemp, sugar, freight and a quiet word at the Palace",
      desc: "The merchants of Binondo, Spanish, Chinese, mestizo and foreign, whose interest is steady trade, low duties and a government that does not frighten the market.",
      goals: ["Lower port duties and fewer inspections", "A government that does not frighten the market", "Contracts that are honoured"], beliefs: "Order is good for trade; disorder is bad for it; politics is mainly a cost.",
      leaders: [{ id: "merchantlead", role: "Presiding merchant" }, { id: "eusebio", role: "Merchant" }, { id: "lowe", role: "Commission merchant" }],
      phases: [{ from: [1892, 0], status: "Cautious, with an eye on insurance rates.", influence: 3 }],
      actions: [
        { id: "dinner", label: "Attend the Binondo merchants’ dinner", note: "Eat well and listen harder.", kind: "attend", repeat: 4, req: { tags: ["trader", "clerk"], conn: [{ person: "eusebio", min: 2 }] },
          text: "There were forty at table and three subjects: freight, duties, and whoever was not there. I spoke twice, briefly. I was introduced as Don Eusebio’s man, which was true and not entirely welcome.", outcome: "You were seen at table among the trading houses.", fx: { funds: -10, view: { merchants: 1 }, rel: { eusebio: 1, lowe: 1 } } },
        { id: "duties", label: "Back the merchants’ petition on port duties", note: "Sign, and contribute to the costs.", kind: "support", stance: ["none"], req: { rep: 40, funds: 25 },
          text: "I signed below nine firms and contributed twenty-five pesos toward the lawyer’s fee. If it succeeds I shall have lost nothing, and if it fails I shall have been in good company.", outcome: "The trading houses counted you among their number.", fx: { funds: -25, rep: 1, view: { merchants: 2, authorities: -1 }, stance: "support" } }
      ] },
    { id: "principales", group: "interest", name: "The Principalía", mono: "PR", color: "#b98a62", aud: "merchants", kind: "Local elite", holder: "",
      tag: "The landed families who run the towns",
      desc: "The established families of each town, who provide its gobernadorcillo, its cabezas de barangay and most of its fiesta money. They are loyal to the Crown and ambitious within it.",
      goals: ["Hold the town offices", "Protect their land and standing", "Gain recognition from Manila"], beliefs: "Rank, property and public service, in that order.",
      leaders: [{ id: "gobernadorcillo", role: "Gobernadorcillo of Tondo" }],
      phases: [{ from: [1892, 0], status: "Secure in office and anxious about talk of reform.", influence: 3 }],
      careers: ["cabeza", "capitan"],
      actions: [
        { id: "fiesta", label: "Offer to serve on the fiesta committee", note: "Time and a little money, for visibility.", kind: "reform", repeat: 12, req: { rep: 35, tags: ["tondo"] },
          text: "I volunteered for the committee and was given the lanterns. It is not a position of power, but the men who give out the lanterns are seen by everyone, and are remembered.", outcome: "You are known to the men who run the town.", fx: { funds: -15, rep: 1, view: { merchants: 1, authorities: 1 }, rel: { gobernadorcillo: 1 } } }
      ] },

    // ---- Gated entries: invisible until their date AND a discovery. Placeholders showing the pattern. ----
    { id: "reform1893", group: "authority", name: "The Municipal Reform Decree", mono: "MR", color: "#d2b068", aud: "authorities", kind: "Law", holder: "Ministry of Overseas",
      tag: "A new way to choose the town’s officers",
      from: [1893, 5],
      desc: "A decree from Madrid reorganising municipal government, giving towns a capitán municipal and a council. It takes effect first in the larger towns.",
      goals: ["Modernise municipal government", "Keep authority in loyal hands"], beliefs: "Reform from above is safer than reform from below.",
      leaders: [], phases: [{ from: [1893, 5], status: "Decreed. To be put into effect town by town.", influence: 2 }], careers: ["capitan", "cabeza"], actions: []
    },
    { id: "secret1893", group: "movement", name: "A Secret Brotherhood", mono: "??", color: "#c4453a", aud: "reformers", kind: "Secret society", holder: "",
      tag: "Known only to those it invites",
      from: [1893, 6], needs: [{ flag: "secret-rumor" }],
      desc: "Placeholder. A later, secret association that must only appear through an in-world discovery after its period. Replace this entry when the 1890s content is written.",
      goals: ["To be written"], beliefs: "To be written.", leaders: [],
      phases: [{ from: [1893, 6], status: "Hidden. Known only to its members.", influence: 0 }], actions: []
    }
  ]
};
