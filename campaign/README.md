# REPUBLIKA — Campaign Interface + Map

## Map included (latest)
The Philippines map (1892 political map, trade lanes, tags) now lives in `map/` and is embedded as the full-screen background of the campaign (`<iframe src="map/index.html?embed=1">` inside `#map-mount`). `?embed` hides the map's own title and moves its breadcrumb, Tags button and scale clear of the campaign HUD (see the `.embed` rules at the end of `map/style.css`). Open `map/index.html` on its own for the standalone map; `map/README.txt` documents it. Space pressed with the map focused still advances the month (postMessage to `app.js`). The map is not yet driven by game state; to react to turns, listen for `republika:turn` and `postMessage` into the frame. Start date is July 1892. Host everything from the repo root (`.nojekyll` included); open `index.html` through GitHub Pages or a local server (iframes may be blocked from `file://` in some browsers).

---
# Campaign interface (module)

The main campaign screen: date and turn, character indicators, map slot, navigation
(Letters, Journal, Newspaper, Politics, Personal Standing), unread badges, briefing
panel and a turn control ("Advance to" plaque, seal button, confirm step, transition; Space also advances). It does not include or modify the opening,
character creation or the map.

## Structure
```
index.html        Page shell; every HUD element has an id
css/tokens.css    Colours, fonts, shared values (matches the opening: Cinzel, gold, oxblood)
css/layout.css    Positions of HUD pieces and the full-screen map slot
css/components.css  Look of each component
css/screens.css   1892 paper/ink/wax styling for Letters and Journal
js/screens.js     Letters and Journal full-screen views (register + letter, diary book)
js/data.js        Placeholder state (date, turn, funds, reputation, badges, briefing)
js/app.js         Rendering, panels, month advance, public API (window.Republika)
```

## Emblem
The top-left emblem is `assets/emblem.png` (coat of arms, transparent PNG). Replace that file to change it.

## Running
Open `index.html`, or upload the folder to GitHub Pages. It can sit beside your
existing files (e.g. `/campaign/`) and shares no names with them. Fonts load from Google Fonts.

## Connecting to the opening
Set the starting values before `app.js` runs (or call `Republika.refresh()` afterwards):
```js
Republika.state.character.name = "Andrés Bonifacio";
Republika.state.funds = 800; Republika.state.reputation = 40;
Republika.refresh();
```
The portrait box in `index.html` (`.portrait`) is where the chosen character's image goes.

## Integrating the map later
The map fills the whole screen behind the HUD, inside `<div id="map-mount">`, which
currently holds the "Map area" label. Either:
1. Replace the contents of `#map-mount` with your map markup/SVG/canvas, or
2. Call `Republika.mountMap(container => yourMap.init(container))` — this clears the placeholder.

Keep the map sized to 100% of `#map-mount`. HUD elements have higher `z-index`
(4–6) than the map, so they stay clickable. Keep the map's own controls clear of
the corners and the right-hand rail. Remove the grid texture by deleting `.map-area::before`
in `layout.css` and the background gradient on `.map-area` if your map has its own.

## Events and hooks
- `document` event `republika:turn` fires after each advance with `{turn, from, to}` — attach events, income, battles here.
- `Republika.openPanel("letters" | "journal" | "newspaper" | "politics" | "standing")`
- Panels render in `PANELS` in `app.js`; replace a panel's `render` with a real module when ready.
- Badge counts live in `REPUBLIKA_DATA.badges`; opening a panel clears its count.

## Letters and Journal
Both open as full-screen desk views (`screens.js`, `screens.css`) fed by `REPUBLIKA_DATA.letters` and `.journal`. Letter fields: `ref, subject, from, role, place, date, salutation, body[], sign, unread`. Journal fields: `date, place, title, body[], unread`. Selecting an item marks it read, and the nav badges count unread items automatically. Fonts: IM Fell English (print), Pinyon Script (handwriting).

## 1892 update (newspapers: `D.newspaper` is a list of papers, each with `articles[]`; month strip removed)
- Start date moved to July 1892; all placeholder content re-dated.
- **Letters** have four kinds (`kind`): `hand` (formal copperplate), `quick` (hurried hand), `type` (typewriter + printed letterhead + pen signature), `tg` (telegram strips). Paper stocks via `paper`: `cream | laid | ruled | blue`. Optional `seal`, `postmark`, `letterhead`, `tg`.
- **Journal** is handwritten on ruled pages; use `~~strike~~` and `__underline__` in entries.
- **Newspaper** is now a full-screen front page (`El Porvenir de Manila`) with back issues. Each turn adds an edition via `RepublikaScreens.newEdition(date, headline)`.
- New Google fonts: Italianno, La Belle Aurore, Special Elite, Old Standard TT, UnifrakturCook.

## Latest update
- **Month strip removed** from above the turn timer (markup and CSS). Only the "Advance to" plaque and seal remain.
- **Diary** is centred on screen (tabs counted in the centring) and larger: book up to 1500 x 880, bigger handwriting and titles.
- **Newspapers** now work like Suzerain's News screen: a rail of six rival papers (`El Porvenir de Manila`, `Diario Mercantil`, `El Reformista`, `Boletín Eclesiástico`, `The Eastern Courier`, `Hoja Suelta`), each with its own masthead style, unread count, a lead story and a column grid of further stories. Every turn `RepublikaScreens.newEdition(date, headline)` adds a story to every paper in that paper's voice (max 6 kept per paper). Paper fields: `name, tag, cls, place, voice, articles[]`; article fields: `date, unread, head, deck, body[]` (`"a|b"` = price row).

## Letters module
`REPUBLIKA_DATA.letters` is the inbox, `.outbox` the sent letters. Screens: **Inbox / Sent / Pending** tabs; each letter shows From, To, Written, Received, the document, and response buttons. Picking a response shows the draft the player would write; **Seal & send** files it, applies `rep`/`funds`, and (if the option has `reply`) schedules a reply letter that arrives `in` turns later (default 2, or 3 for `far` letters; delivery 1 or 2). `RepublikaScreens.deliver()` runs each turn and moves due replies into the inbox. Letters with `req: ["official"]` only appear if `state.character.tags` contains one of those tags, so correspondence follows occupation. Letters without `opts` are information only. Invitations or decisions can later be new option fields with an `action` hook; nothing is simulated beyond monthly delivery.

## Letters update (this revision)
- Inbox is kept in order of date received (newest first), including replies that arrive on later turns.
- Reply letters now keep the original sender's greeting, letterhead and seal.
- Response options can be gated by occupation: `opts[].req: ["clerk"]` shows that option only if `state.character.tags` has one of those tags (example: "Offer to audit the books"). Letters with `req` stay hidden entirely.
- Hooks for later features (invitations, decisions): an option may carry `action: {type, id}`. Sending fires `document` event `republika:letter` with `{letter, from, option, action, outbox}`; a reply arriving fires `republika:delivered`. Nothing is simulated yet.
- The "Advance" confirmation now counts letters awaiting your reply, not just unread ones.

## Journal and event system
- `js/events.js` holds `EVENTS` (id, type `historical|personal|conditional`, title, date, text[], `when` conditions, `choices[]` with `outcome` and `effects`) and the engine `RepublikaEvents` (`check()` each turn, `decide(id, choiceId)`, `get`, `choices`, `pending`).
- Conditions (`when`): `from/until [y,m]`, `tags`, `flags`, `anyFlags`, `notFlags`, `minRep`, `minFunds`, `after {event, choice, delay}`. Choices may carry `req: [tags]`.
- Effects: `funds`, `rep`, `flags[]`, `rel {name: n}` (stored in `state.relations`). Records: `D.eventLog[id]` (occurred? open/decided) and `D.history` (decisions with outcomes).
- An event that occurs writes an entry in the Journal (Diary tab) with a decision block; once chosen it shows "Decision recorded". The **Decisions** tab reviews past choices and outcomes. Newspaper content stays in the Newspaper module.
- Examples: *The Prisoner at Fort Santiago* (historical), *A Better Stool at the Counting House* (personal, clerks only), *A Knock After Curfew* (conditional on an earlier choice or an accepted letter invitation). Accepting a letter option with `action: {id}` sets a flag of that id.
- Events: `republika:decision` is fired on each choice.

### Journal decisions work like letters
A choice now has `text`, the first-person diary entry the character would write. Picking an option shows that pre-written entry as a draft; **Write & record** commits it, applies the effects and files the decision (with `written` stored in `D.history`). The recorded entry then shows what you wrote, the outcome and the effects.

## Newspaper system
- `js/news.js`: `STORIES` are public developments. Each story has a `topic` (admin, reform, society, local, economy, world, controversy, history), an optional `date`, availability `when` conditions and `frames` per paper. A paper that does not appear in `frames` ignores the story. Each frame has its own `label` (`fact` / `opinion` / `rumor`), headline, deck and body, so the same event can be reported, argued over or whispered depending on the paper.
- Conditions (`when`): `from/until [y,m]`, `known` / `notKnown` (public flags), `after {event, choice, delay}`, `minRep`. Publication is recorded in `D.newsLog`.
- Public vs private: journal decisions set private flags; only what a choice lists in `effects.public` (or `RepublikaNews.reveal(flag)`) becomes publicly known and can trigger news. Example: joining the vigil makes `vigil-seen` public, and a later story appears in three papers.
- `RepublikaNews.publish()` runs every turn. To select stories by other rules later (access to a paper, region, literacy), extend `available()`.
- The papers are: El Porvenir de Manila (government), Diario Mercantil (trade), El Reformista (reform, Madrid), Boletín Eclesiástico (Church), The Eastern Courier (foreign press), Hoja Suelta (underground).

## People & Connections and Career
- `js/people.js` holds `D.people` (only people met or heard of are shown), the roster grid, the detail panel, the Network view, and the Career section.
- Person: `{id, name, occ, age, place, look{}, bg, traits[], info, how, score, links[], met[], heard[], favors[]}`. Portraits are generated from `look` (skin, hair, cloth, hat, glasses, moustache, collar, `f` for long hair).
- Relationship is derived from `score` (−10..10): ally ≥ 6, friend ≥ 3, acquaintance, rival ≤ −3, enemy ≤ −6. Change it with `RepublikaPeople.adjust(idOrName, delta, note)`; a journal choice's `effects.rel {name: delta}` already does this.
- Meeting: `met`/`heard` take conditions (any one): `{start}`, `{letter: ref}`, `{event: id}`, `{flag}`, `{story: id}`, `{intro: personId}`. A favour with `fx.meet:[id]` is an introduction.
- Favours need a minimum score and can be used once. They can pay funds, reputation or set a flag.
- Career: `D.career {current, history[], taken{}}` and `D.opportunities[]` with `tags` (background), `via` (`self` | `election` | `appointment`), `from [y,m]` (period gate), `req {quals, exp, rep, funds, conn[{person,min}], flags}`, `becomes`, `fx`. Opportunities appear only if the character’s tags fit and the date allows; `self` ones have a Pursue button, others wait for an event (`RepublikaPeople.grant(id)`).
- Period gating examples: the village-head election appears only from December 1892; the capitán municipal post only from 1894.

### Roster update
- Portraits are empty rectangular frames for now. Set `person.portrait = "image url"` to show art later (the old generated faces are removed).
- A person you only know through others (`heard`, e.g. `{via:"eusebio"}` or a news story) shows a blank dashed frame with "?", and the panel hides their background and personality until you meet them.
- Connections are shown like Empire of Sin: hover a portrait to draw lines to the people tied to them, with a badge for the kind of tie (♥ kin, + friend, ★ ally, $ business, ✝ parish, ! rival, ✕ enemy). Click any portrait, or a name in the panel, to open that person. The separate Network tab is gone.

### Favours go through letters
In a person's panel, **Write a letter** lists their requests (references, loans, introductions). Pick one, choose a tone (Friendly, Formal, Firm, Harsh) to see the pre-written letter, then **Seal & send**. It appears in Letters (Sent / Pending) and the reply arrives two turns later. Tone matters: it shifts the standing needed (friendly −1, formal 0, firm +1, harsh +2) and changes standing when the reply lands (+1, 0, −1, −2). A granted request pays out (funds, reputation, a flag, or an introduction). Requests in the post cannot be sent twice. Connection lines now run behind the portraits, with the badge on the connected portrait’s corner; unrelated portraits dim while you hover.

Connections are drawn like Empire of Sin: thin coloured lines run from the hovered or selected person (white outline) to each tie, and the connected portrait is covered by a coloured icon disc: thumbs-up (friend, ally, green), heart (kin), coin (business), cross (parish), thumbs-down (rival orange, enemy red). Tune the icons and colours in `BADGE` in `js/people.js`.

## Politics
Opens full-screen from the Politics button. Three tabs: **Overview**, **Movements & Organizations**, **Political Figures**.
- `js/politics-data.js` is *content only* (placeholders, to be replaced with researched history). `js/politics.js` is the engine and UI. The file header of the data file documents every field.
- **Overview**: the situation for the current date (`situations[]`, latest whose date has passed), ruling authorities as compact cards, movements and interests as rows, a short "In the press" list (headlines only; the Newspaper module stays the source), and "Where you stand": affiliations, involvement tier, and how four audiences (authorities, reformists, the Church, commerce and the town) see you.
- **Organizations** (`orgs[]`): name, description, objectives, beliefs, leaders (named only once you have met or heard of them), a status and influence level that change by date (`phases[]`), your stance (member / supporter / opponent / none), the audience's regard for you, linked Career openings (`careers: [opportunityId]`, from the Career module, not duplicated), and actions.
- **Timeline gating**: an org is invisible until `from` has passed *and* one of its `needs` conditions holds (`{flag}`, `{letter}`, `{story}`, `{event}`, `{public}`). Revolutionary or later institutions must carry both. The 1893 municipal reform and the placeholder secret society show the pattern; neither appears in 1892.
- **Actions** (support, oppose, attend, join, reform effort, cooperate, leave): `req.tags` hides an action from characters whose background does not fit; other requirements (`minAge`, `rep`, `funds`, `quals`, `conn` people standing, `view` audience regard, `flags`, `noFlags`) show as a checklist and lock the button until met. `from`/`until` gate by period, `stance` limits an action to certain affiliations (this is how you change sides or withdraw), `repeat` sets a cooldown in months. Picking an action shows the diary entry the character would write; **Write & record** applies the effects, writes the Journal entry, and files the decision in Journal > Decisions (type `political`). Event `republika:politics` fires.
- **No duplicate relationship system.** Political figures are ordinary people in `D.people` (tagged with `pol`). *Known of* figures appear on the roster as "?" and in Politics with their public reputation only. Meeting one (by Seek an audience here, or by an introduction request in People & Connections, as before) puts them on the roster. Their standing is the existing `score`; requirements such as `conn:[{person:"isidro", min:3}]` read it, so existing relationships open or close political doors. `introsTo` lists who in your roster can introduce a figure. New favours on existing people (`favors{}` in the data file) work through the existing letters flow.
- **Your reputation**: `D.pol.view` holds four audience scores (-5..5), added to what earlier choices already imply through `flagfx` (e.g. `vigil`, `kept-clear`, `ilaya-meeting`), so decisions made elsewhere in the game colour your political standing. Involvement tier comes from `D.pol.pts`.
- Hooks: `RepublikaPolitics.sync()` runs each turn (briefing notes when a new organisation or a new situation appears); `.fresh()` drives the nav badge; `S.character.age` (default 19) is read for age requirements, so set it from the opening.
- Small edits elsewhere: `people.js` exports `REL, ASK, byKey, careerOpen/careerOk/careerChecks` and shows a "Political life" line on a person's panel; `screens.js` registers the view; `app.js` calls `sync()` and sets the badge.

## Career & Personal Standing (one section)
Career and Personal Standing are now a single screen, opened from the briefcase button (or by clicking the character card). `openPanel("career")` and `openPanel("standing")` both open it. The old separate Career button is gone.
- `js/standing-data.js` is **content only** (its header documents every field). `js/standing.js` is the engine and screen. The old career list in `people.js` is reused: `D.career`, `D.opportunities`, `take()`; standing-data patches those and adds more, so nothing is duplicated.
- **The screen**: Means (a word plus pesos, and monthly savings from the current post), Public recognition (a word and six pips), Current position, Opportunities (filter by field; “Open to you now” and “Within reach, with something missing”), and a side column with how the four audiences see you, what is said of you publicly, qualifications and experience, and Milestones.
- **No rigid tree**: opportunities are flat. A post you hold adds its own tag, which can make others appear (“May lead on to…”). Fields: Commerce, Government, Law, Press, Education, Military, Public life, Learning. Background `tags` and `from [y,m]` decide what appears. Closed realities are stated (e.g. no commissions for natives in 1892).
- **Requirements** (checklist, unmet items link to where they can be worked on): `quals, exp, rep, funds, conn` (standing with a person; links to People), `flags` / `any` (a reference or introduction; links to the person whose favour provides it), `not` (a past choice that blocks it, e.g. being noted by the Guardia Civil), `stance` (Politics membership; links to that organisation), `view` (how the authorities / reformists / Church / commerce see you).
- **People**: relationships gate and unlock posts; posts introduce people (`fx.meet`); new people (a lawyer, an editor) and new favours (introductions) were added to the existing roster.
- **Politics**: membership and standing open or close posts; posts shift the audiences (`fx.view`); each organisation’s page lists its openings (`orgCareers`).
- **Letters**: when you qualify for a post with an `offer`, it arrives as a letter (Accept / Ask a question / Decline). Asking a question keeps the offer open; leaving it unanswered lets it lapse. Posts can also send follow-up letters (invitations, requests) via `follow[]`. Hooks: option `action: {type:"career", do:"accept|decline|fx", opp}`.
- **Newspaper**: only public developments (`news` on an opportunity) become stories, through the existing story system.
- **Journal**: every new post, refused offer and lapsed offer writes a Diary entry and is filed in Decisions (type `career`). Event `republika:career` fires when a step is taken.
- Small edits elsewhere: `people.js` (`take(id, force)`, richer `checks`, exports `QL`/`flagSource`), `politics.js` (exports `AUD`, `label`), `screens.js` (registers the view), `app.js` and `index.html` (one button, badge, per-turn `sync()`).
