/* REPUBLIKA People & Connections + Career (1892). Only people the player has met or heard of are shown.
   Person: { id, name, occ, age, place, kin?, look{}, bg, traits[], info, how, score(-10..10), links[{to,kind}],
             met:[cond], heard:[cond], favors:[{id,label,need,result,fx}] }
   cond (any one): {start}, {letter:"CORR-.."}, {event:id}, {flag:f}, {story:id}, {intro:personId}
   Relationship is derived from score: ally>=6, friend>=3, rival<=-3, enemy<=-6, else acquaintance.
   RepublikaPeople.adjust(idOrName, delta, note) changes a score; favors may carry fx {funds,rep,flag,meet[]}.
   Career: D.career {current,history[],taken{}}; D.opportunities[] {id,title,tags,via,from,req{},becomes,fx}.
   via "self" = Pursue button; "election"/"appointment" = granted by an event via RepublikaPeople.grant(id). */
(function () {
  const D = window.REPUBLIKA_DATA, S = D.state, $ = (i) => document.getElementById(i);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const today = () => "8 " + D.months[S.month] + " " + S.year, now = () => S.year * 12 + S.month;
  S.character.quals = ["literate", "spanish", "bookkeeping", "tagalog"]; S.character.experience = 4;
  D.intros = []; D.badges.people = 0;
  const REL = { acquaintance: ["Acquaintance", "#9a8f78"], friend: ["Friend", "#7fae6e"], ally: ["Ally", "#d2b068"], rival: ["Rival", "#d98f42"], enemy: ["Enemy", "#c4453a"] };
  const L = (s, h, c, x) => Object.assign({ s, h, c }, x || {});
  D.people = [
    { id: "remedios", name: "Doña Remedios", occ: "Your mother, keeps the household", age: 54, place: "Tondo", kin: "Mother", look: L("#c79a70", "#8a8a88", "#4a3a5c", { f: 1 }), bg: "Widowed young, she raised you on a seamstress’s earnings and the goodwill of the parish.", traits: ["Devout", "Practical", "Watchful"], info: "Hosts the family fiesta each year. Worries about every company you keep.", how: "Family.", score: 8, links: [{ to: "felisa", kind: "kin" }, { to: "anselmo", kind: "parish" }], met: [{ start: 1 }] },
    { id: "eusebio", name: "Don Eusebio Maranan", occ: "Merchant and your employer", age: 49, place: "Binondo", look: L("#c99a6e", "#2a2420", "#34455e", { hat: "top", m: 1 }), bg: "Built a counting house from a single warehouse. Respected, careful, and keeping two sets of figures.", traits: ["Shrewd", "Cautious", "Fair"], info: "Trusts those who keep quiet. Has a rival in the hemp trade.", how: "Your employer at the counting house.", score: 2, links: [{ to: "estrada", kind: "rival" }, { to: "lowe", kind: "business" }], met: [{ start: 1 }],
      favors: [{ id: "ref", label: "Ask for a written reference", need: 3, result: "He wrote a warm reference in his own hand.", fx: { flag: "ref-eusebio", rep: 1 } }] },
    { id: "felisa", name: "Doña Felisa Aragón", occ: "Fish dealer", age: 51, place: "Kawit, Cavite", look: L("#b98a62", "#3a2c24", "#7d3b30", { f: 1 }), bg: "A widow who built a trade in dried fish up and down the bay. Knows every boatman and half the principales.", traits: ["Generous", "Blunt", "Well connected"], info: "Treats you as family. Her word opens doors in Cavite.", how: "An old friend of your mother’s.", score: 4, links: [{ to: "remedios", kind: "kin" }, { to: "ilagan", kind: "business" }], met: [{ start: 1 }],
      favors: [{ id: "intro", label: "Ask to be introduced to a Cavite trader", need: 3, result: "She sent word to Don Sebastián Ilagan, who will receive you.", fx: { meet: ["ilagan"] } }, { id: "loan", label: "Ask for a small loan", need: 4, result: "She pressed a hundred pesos on you and refused a receipt.", fx: { funds: 100 } }] },
    { id: "anselmo", name: "Rev. Fr. Anselmo Reyes", occ: "Parish priest", age: 58, place: "Tondo", look: L("#c39a72", "#9a9a98", "#1b1b1f", { collar: 1 }), bg: "A Filipino secular priest who has watched young men come and go. Cautions rather than commands.", traits: ["Gentle", "Wary", "Respected"], info: "Reports to his superiors but is no informer. Speaks for you if you give him reason.", how: "Your parish priest.", score: 1, links: [{ to: "remedios", kind: "parish" }], met: [{ letter: "CORR-92-017" }],
      favors: [{ id: "good", label: "Ask for a letter of good character", need: 3, result: "He vouched for you in writing.", fx: { rep: 2 } }] },
    { id: "isidro", name: "Isidro Bautista", occ: "Bookseller, Propaganda sympathiser", age: 31, place: "Quiapo", look: L("#c99a6e", "#1c1410", "#3a3a40", { g: 1 }), bg: "Sells almanacs and schoolbooks and lends the rest. Writes to friends in Madrid.", traits: ["Idealistic", "Discreet", "Persuasive"], info: "Invited you to Ilaya Street. Believes reform must come by petition and pen.", how: "A friend in the Propaganda, by letter.", score: 4, links: [{ to: "ilagan", kind: "friend" }], met: [{ letter: "CORR-92-035" }],
      favors: [{ id: "madrid", label: "Ask for an introduction to the Madrid editors", need: 4, result: "He will write to Madrid on your behalf.", fx: { flag: "intro-solidaridad" } }] },
    { id: "ambrosio", name: "Sr. Ambrosio Cruz", occ: "Municipal clerk", age: 44, place: "City Hall, Manila", look: L("#c39a72", "#2a2420", "#5a5648", { g: 1, m: 1 }), bg: "Twenty years behind a counter. Knows which form is needed before you do.", traits: ["Precise", "Tired", "Not above a favour"], info: "Issues your cédula. Remembers who is civil.", how: "Wrote about your cédula.", score: 0, links: [], met: [{ letter: "CORR-92-037" }],
      favors: [{ id: "papers", label: "Ask him to hurry your papers", need: 2, result: "Your papers were ready the next morning.", fx: { flag: "papers-ok" } }] },
    { id: "lowe", name: "Mr. Edmund Lowe", occ: "Commission merchant, Hartwell & Lowe", age: 46, place: "Binondo", look: L("#d8b08a", "#8a6a3a", "#2f3d33", { hat: "top", m: 1 }), bg: "An Englishman from Hong Kong who prefers a clean contract to a handshake.", traits: ["Exact", "Fair", "Unsentimental"], info: "Ships hemp and sugar. Pays on time.", how: "Freight correspondence.", score: 1, links: [{ to: "eusebio", kind: "business" }], met: [{ letter: "CORR-92-027" }],
      favors: [{ id: "freight", label: "Ask for a place on the next freight run", need: 2, result: "He let you ship a small parcel at cost.", fx: { funds: 60 } }] },
    { id: "salas", name: "Don Gregorio Salas", occ: "Printer, Imprenta La Fe", age: 57, place: "Manila", look: L("#c39a72", "#9a9a98", "#4b3a2c", { g: 1 }), bg: "Prints almanacs, receipts and the occasional pamphlet he pretends not to read.", traits: ["Dry", "Careful", "Curious"], info: "Hears what is circulating before the censor does.", how: "Your subscription.", score: 1, links: [{ to: "isidro", kind: "business" }], met: [{ letter: "CORR-92-024" }] },
    { id: "ilagan", name: "Don Sebastián Ilagan", occ: "Trader and landowner", age: 40, place: "Cavite", look: L("#b98a62", "#1c1410", "#4a5a46", { hat: "salakot", m: 1 }), bg: "Brings produce from Cavite to Manila and carries news in both directions.", traits: ["Affable", "Ambitious", "Well informed"], info: "Friend to reformists and sceptic of revolutions.", how: "Introduced by Doña Felisa.", score: 1, links: [], met: [{ intro: "ilagan" }], heard: [{ via: "felisa" }] },
    { id: "ferrer", name: "Cabo Isidoro Ferrer", occ: "Corporal, Guardia Civil", age: 36, place: "Tondo", look: L("#b98a62", "#1c1410", "#2c3a2e", { hat: "cap", m: 1 }), bg: "A native of Pampanga in Spanish uniform, with an eye for who is on the street after dark.", traits: ["Dutiful", "Suspicious"], info: "Keeps a list of names. Be civil.", how: "Called at your house after curfew.", score: -3, links: [], met: [{ event: "knock-after-curfew" }] },
    { id: "estrada", name: "Don Ramón Estrada", occ: "Hemp trader", age: 52, place: "Binondo", look: L("#d8b08a", "#6a5a4a", "#5b2f38", { hat: "top", m: 1 }), bg: "Cornered the hemp market two seasons running and resents anyone who sells below him.", traits: ["Ruthless", "Charming", "Proud"], info: "Rival of Don Eusebio. Watches independent traders closely.", how: "A name on the exchange.", score: -3, links: [{ to: "eusebio", kind: "rival" }], met: [{ flag: "licensed-trader" }], heard: [{ via: "eusebio" }, { story: "hemp-prices" }] }
  ];
  const cond = (c) => c.start || (c.letter && D.letters.some((l) => l.ref === c.letter)) || (c.event && D.eventLog[c.event]) || (c.flag && S.flags.includes(c.flag)) || (c.story && D.newsLog[c.story]) || (c.intro && D.intros.includes(c.intro)) || (c.via && (byKey(c.via) || {}).status === "met");
  const relOf = (p) => (p.score >= 6 ? "ally" : p.score >= 3 ? "friend" : p.score <= -6 ? "enemy" : p.score <= -3 ? "rival" : "acquaintance");
  const byKey = (k) => D.people.find((p) => p.id === k || p.name === k);
  function sync() {
    D.people.forEach((p) => {
      if ((p.met || []).some(cond) && p.status !== "met") { p.status = "met"; p.since = p.met[0].start ? "Before 1892" : today(); p.fresh = !p.met[0].start; }
      else if (!p.status && (p.heard || []).some(cond)) { p.status = "heard"; p.via = ((p.heard.find(cond) || {}).via) || null; p.since = today(); p.fresh = true; }
    });
    if (window.Republika) Republika.refresh();
  }
  function adjust(key, d, note) {
    const p = byKey(key); if (!p || p.status !== "met") return;
    p.score = Math.max(-10, Math.min(10, p.score + d)); (p.log = p.log || []).unshift({ when: today(), d, note });
  }
  const fresh = () => D.people.filter((p) => p.fresh).length;
  // ---------- portraits: empty frames for now (set p.portrait = "image url" later) ----------
  const frame = (p, big) => '<span class="pf' + (big ? " big" : "") + (p.status === "heard" ? " blank" : "") + '">' + (p.status === "heard" ? "?" : p.portrait ? '<img alt="" src="' + esc(p.portrait) + '">' : "") + "</span>";
  const P = { flt: "all", sel: null, hov: null };
  const chip = (r) => '<span class="rchip" style="--rc:' + REL[r][1] + '">' + REL[r][0] + "</span>";
  const meter = (p) => '<div class="trust" title="Standing ' + p.score + '"><i style="left:' + (50 + p.score * 5) + '%"></i></div>';
  const known = () => D.people.filter((p) => p.status);
  const FILT = [["all", "All"], ["friend", "Friends"], ["ally", "Allies"], ["rival", "Rivals"], ["enemy", "Enemies"]];
  // Empire of Sin style: a coloured icon disc replaces the connected portrait, with a thin line from the selected person.
  const IC = { up: "M7 11v9H4v-9h3zm2 9V11l4-8c1.500 0 2.500 1.200 2 2.800L14.500 9H20a1.500 1.500 0 0 1 1.500 1.800l-1.500 7.500A2 2 0 0 1 18 20H9z", heart: "M12 21s-8-5.200-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 5.800-8 11-8 11z", cross: "M10 3h4v6h6v4h-6v8h-4v-8H4V9h6z" };
  const BADGE = { friend: ["up", "#3f9a4a"], ally: ["up", "#3f9a4a"], kin: ["heart", "#d0607a"], business: ["coin", "#c9a14a"], parish: ["cross", "#8f7fc0"], rival: ["down", "#d0742e"], enemy: ["down", "#c4453a"] };
  const glyph = (k) => k === "coin" ? '<circle r="9.500" fill="none" stroke="#fff" stroke-width="2"/><text y="5" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">$</text>' : '<g transform="translate(-12,-12)"><path fill="#fff" d="' + (IC[k === "down" ? "up" : k]) + '"' + (k === "down" ? ' transform="rotate(180 12 12)"' : "") + "/></g>";
  /** Ties between two known people, in either direction. */
  function ties(p) {
    const out = (p.links || []).map((k) => ({ q: byKey(k.to), kind: k.kind }));
    D.people.forEach((o) => (o.links || []).forEach((k) => { if (k.to === p.id && !out.some((x) => x.q === o)) out.push({ q: o, kind: k.kind }); }));
    return out.filter((x) => x.q && x.q.status);
  }
  // ---------- favours are asked for by letter; the tone you choose matters ----------
  const TONES = { friendly: ["Friendly", -1, 1], formal: ["Formal", 0, 0], firm: ["Firm", 1, -1], harsh: ["Harsh", 2, -2] }; // [label, extra standing needed, standing change]
  const ASK = { "eusebio:ref": "a written reference for my file", "felisa:intro": "an introduction to Don Sebastián Ilagan", "felisa:loan": "the loan of a hundred pesos until the season turns", "anselmo:good": "a letter vouching for my character", "isidro:madrid": "an introduction to the Madrid editors", "ambrosio:papers": "your help in hurrying my papers", "lowe:freight": "a place for a small parcel on the next freight run" };
  const first = (p) => p.name.replace(/^(Don|Doña|Rev\. Fr\.|Sr\.|Mr\.|Cabo) /, "");
  const mo = (n) => { const m = S.month + n; return D.months[m % 12] + " " + (S.year + Math.floor(m / 12)); };
  function draftOf(p, f, tone) {
    const ask = ASK[p.id + ":" + f.id] || f.label.toLowerCase(), n = p.name;
    return { sal: { friendly: "My dear " + first(p) + ",", formal: "Respected " + n + ",", firm: n + ",", harsh: "To " + n + ":" }[tone],
      body: { friendly: "I hope this finds you and yours well. I would not trouble you if I had anyone else to ask, but I am writing to ask for " + ask + ". I would be truly grateful, and you know I would do the same for you.", formal: "I venture to write to ask for " + ask + ", if it is within your power to give. I should be sensible of the favour, and remain your obedient servant.", firm: "I need " + ask + ". You are in a position to give it, and I would be glad of an answer without delay.", harsh: "After all I have done, " + ask + " is not too much to expect. I will remember how you answer." }[tone] };
  }
  function replyOf(p, f, tone, ok) {
    const pre = { friendly: "Of course, my dear friend. ", formal: "It shall be done as you ask. ", firm: "Very well. I do this once, and I expect it to be remembered. ", harsh: "You ask in a poor manner, but I will not go back on my word. " }[tone];
    const no = { friendly: "I wish I could oblige you, but not yet. Let us know each other a little better first.", formal: "I regret that I cannot oblige you at present.", firm: "I do not answer demands. Ask again when you have earned it.", harsh: "Do not write to me in that way again." }[tone];
    return { sal: { friendly: "My dear friend,", formal: "Respected friend,", firm: "To the point:", harsh: "Sir," }[tone], body: ok ? pre + f.result : no };
  }
  function card(p) {
    const r = relOf(p), heard = p.status === "heard", fv = !heard && (p.favors || []).some((f) => p.score >= f.need && !(p.used || []).includes(f.id));
    return '<button class="pcard' + (p.id === P.sel ? " on" : "") + (heard ? " heard" : "") + '" data-pid="' + p.id + '" style="--rc:' + (heard ? "#5b5140" : REL[r][1]) + '">' + frame(p) + (p.fresh ? '<em class="pnew">New</em>' : "") + (fv ? '<b class="pfav" title="A favour is available">★</b>' : "") + '<span class="pname">' + esc(p.name.replace(/^(Don|Doña|Rev\. Fr\.|Sr\.|Mr\.|Cabo) /, "")) + "</span></button>";
  }
  function detail(p) {
    if (!p) return '<div class="pdet empty"><p>Select a person to see who they are and how you stand.</p></div>';
    const r = relOf(p), heard = p.status === "heard", via = heard && p.via && byKey(p.via);
    const links = ties(p).map((x) => '<li><button data-pid="' + x.q.id + '">' + esc(x.q.name) + "</button><span>" + esc(x.kind) + "</span></li>").join("");
    const wr = P.wr && P.wr.pid === p.id ? P.wr : null, wf = wr && p.favors.find((x) => x.id === wr.fid), dr = wf && draftOf(p, wf, wr.tone);
    const fav = heard || !(p.favors || []).length ? "" : '<ul class="plist">' + p.favors.map((f) => { const used = (p.used || []).includes(f.id), pend = p.pend && p.pend[f.id], st = used ? "Done" : pend ? "In the post" : p.score >= f.need ? "Likely" : "Needs " + REL[f.need >= 6 ? "ally" : "friend"][0];
      return '<li><button class="fav' + (wr && wr.fid === f.id ? " on" : "") + '" data-ask="' + p.id + ":" + f.id + '"' + (used || pend ? " disabled" : "") + ">" + esc(f.label) + "</button><span>" + st + "</span></li>"; }).join("") + "</ul>" +
      (wr ? '<div class="tones">' + Object.entries(TONES).map(([k, v]) => '<button data-tone="' + k + '"' + (wr.tone === k ? ' class="on"' : "") + ">" + v[0] + '</button>').join("") + '</div><article class="pdraft"><div class="dl">' + today() + "</div><p>" + esc(dr.sal) + "</p><p>" + esc(dr.body) + '</p><p class="sg">' + esc(S.character.name) + '</p></article><div class="sendrow"><span>Arrives next month; a reply may follow</span><button class="send" data-sendf="1">Seal &amp; send</button></div><p class="hint">Warm words help. A harsh letter may still get what you ask, but costs you standing.</p>' : '<p class="hint">Choose a request, then the kind of letter to write.</p>');
    const log = (p.log || []).slice(0, 3).map((e) => "<li><span>" + esc(e.when) + "</span> " + (e.d ? "<b>" + (e.d > 0 ? "+" : "−") + Math.abs(e.d) + "</b> " : "") + esc(e.note || "") + "</li>").join("");
    return '<div class="pdet" style="--rc:' + (heard ? "#5b5140" : REL[r][1]) + '"><div class="phead">' + frame(p, 1) + "<div><h3>" + esc(p.name) + "</h3>" +
      (heard ? '<p>You do not know who this is.</p><span class="rchip hd">Known of, not met</span>' : "<p>" + esc(p.occ) + "</p><small>" + esc(p.place) + (p.age ? " · age " + p.age : "") + "</small><div>" + chip(r) + (p.kin ? '<span class="rchip kin">' + esc(p.kin) + "</span>" : "") + "</div>" + meter(p)) + "</div></div>" +
      (heard ? "<h4>What you have heard</h4><p>" + esc(via ? "The name came up through " + via.name + "." : "The name appeared in the papers.") + " You have never seen their face, and know nothing more (" + esc(p.since) + ").</p>"
        : "<h4>Background</h4><p>" + esc(p.bg) + '</p><h4>Personality</h4><p class="tr">' + p.traits.map((t) => "<span>" + esc(t) + "</span>").join("") + "</p><h4>What you know</h4><p>" + esc(p.info) + "</p><h4>How you met</h4><p>" + esc(p.how) + " (" + esc(p.since) + ")</p>" + (window.RepublikaPolitics && p.pol ? RepublikaPolitics.line(p) : "")) +
      (links ? '<h4>Connections</h4><ul class="plist">' + links + "</ul>" : "") + (fav ? "<h4>Write a letter</h4>" + fav : "") + (log ? '<h4>Between you</h4><ul class="plog">' + log + "</ul>" : "") + "</div>";
  }
  function renderPeople() {
    const all = known(), list = all.filter((p) => P.flt === "all" || (p.status === "met" && relOf(p) === P.flt));
    if (!P.sel || !byKey(P.sel) || !byKey(P.sel).status) P.sel = (all[0] || {}).id;
    const s = byKey(P.sel), r = s && relOf(s), heard = s && s.status === "heard";
    const html = '<div class="pc"><header class="pc-top"><div class="pc-name"><small>People &amp; Connections · ' + all.filter((p) => p.status === "met").length + " met · " + all.filter((p) => p.status === "heard").length + " known of</small><h2>" + esc(s ? s.name : "No one yet") + "</h2>" + (s ? "<p>" + (heard ? "Known of, not met" : "Profession <b>" + esc(s.occ) + "</b>") + (heard ? "" : " " + chip(r)) + "</p>" : "") + '</div><div class="seg flt">' + FILT.map((f) => '<button data-pflt="' + f[0] + '"' + (P.flt === f[0] ? ' class="on"' : "") + ">" + f[1] + "</button>").join("") + '</div></header><div class="pc-body"><div class="pc-main"><div class="pgw"><div class="pgrid">' + (list.map(card).join("") || '<p class="empty">No one fits this filter yet.</p>') + '</div><svg class="plines"></svg><svg class="pbadges"></svg></div><p class="hint">Hover a portrait to see who they are tied to. Click a portrait to open that person.</p></div><aside class="pc-side">' + detail(s) + "</aside></div></div>";
    D.people.forEach((p) => (p.fresh = false));
    return html;
  }
  function draw() {
    const w = document.querySelector(".pgw"); if (!w) return;
    const sv = w.querySelector(".plines"), bv = w.querySelector(".pbadges"), p = byKey(P.hov || P.sel), wr = w.getBoundingClientRect(); let ln = "", dc = "";
    w.querySelectorAll(".pcard").forEach((c) => c.classList.remove("lk", "me"));
    const ctr = (id) => { const el = w.querySelector('.pcard[data-pid="' + id + '"] .pf'); if (!el) return null; const r = el.getBoundingClientRect(); return [r.left - wr.left + r.width / 2, r.top - wr.top + r.height / 2]; };
    const a = p && ctr(p.id);
    if (a) { w.querySelector('.pcard[data-pid="' + p.id + '"]').classList.add("me");
      ties(p).forEach((x) => { const b = ctr(x.q.id); if (!b) return; const t = BADGE[x.kind] || BADGE.business;
        w.querySelector('.pcard[data-pid="' + x.q.id + '"]').classList.add("lk");
        ln += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + t[1] + '" stroke-width="1.800" opacity=".95"/>';
        dc += '<g transform="translate(' + b[0] + " " + b[1] + ')"><circle r="29" fill="' + t[1] + '" fill-opacity=".92" stroke="' + t[1] + '" stroke-width="3"/><circle r="29" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1"/>' + glyph(t[0]) + "<title>" + esc(x.q.name) + " (" + esc(x.kind) + ")</title></g>"; }); }
    sv.innerHTML = ""; bv.innerHTML = ln + dc;
  }
  function sendFavor() {
    const w = P.wr, p = w && byKey(w.pid), f = p && p.favors.find((x) => x.id === w.fid); if (!f || (p.used || []).includes(f.id) || (p.pend && p.pend[f.id])) return;
    const ok = p.score >= f.need + TONES[w.tone][1], d = draftOf(p, f, w.tone), r = replyOf(p, f, w.tone, ok), n = D.outbox.length + 1, ask = ASK[p.id + ":" + f.id] || f.label;
    D.outbox.unshift({ ref: "OUT-92-" + (100 + n), to: p.name, subject: "A request: " + ask, written: today(), sal: d.sal, body: d.body, label: TONES[w.tone][0] + " request", re: "", delivers: S.turn + 1, arrivesLabel: mo(1), due: S.turn + 2, dueLabel: mo(2), reply: true,
      resolve: { pid: p.id, fid: f.id, ok, tone: w.tone },
      replyLetter: { ref: "CORR-92-" + (110 + n), unread: true, kind: "hand", paper: "cream", subject: "Re: A request", from: p.name, role: p.occ, place: p.place, date: "20 " + mo(1), salutation: r.sal, body: [r.body], sign: p.name } });
    (p.pend = p.pend || {})[f.id] = true; P.wr = null;
  }
  /** Called when the reply arrives: applies the outcome and the change in standing. */
  function resolve(x) {
    const p = byKey(x.pid), f = p && p.favors.find((q) => q.id === x.fid); if (!f) return;
    if (p.pend) delete p.pend[f.id];
    adjust(p.id, TONES[x.tone][2], TONES[x.tone][0] + " letter" + (x.ok ? "" : ", refused"));
    if (!x.ok) return;
    (p.used = p.used || []).push(f.id); const e = f.fx || {};
    S.funds += e.funds || 0; S.reputation += e.rep || 0; if (e.flag && !S.flags.includes(e.flag)) S.flags.push(e.flag);
    (e.meet || []).forEach((m) => !D.intros.includes(m) && D.intros.push(m));
    (p.log = p.log || []).unshift({ when: today(), d: 0, note: f.result }); sync();
  }
  // ---------- Career ----------
  const QL = { literate: "Literate in Spanish and Tagalog", spanish: "Spanish", bookkeeping: "Bookkeeping", tagalog: "Tagalog", writing: "Practised writing" };
  D.career = { current: { title: "Junior clerk and small trader", employer: "Casa Maranan, counting house", place: "Binondo", since: "1888", note: "Keeps accounts by day and sells small parcels on your own account." },
    history: [{ when: "1888", title: "Entered the counting house as copyist", note: "Don Eusebio took you on at fifteen." }, { when: "1885–88", title: "Apprentice at a Tondo fish stall", note: "Learned figures, weights and bargaining." }], taken: {}, seen: {} };
  D.opportunities = [
    { id: "oficial", title: "Oficial (senior clerk) at a Binondo counting house", tags: ["clerk"], via: "self", sum: "A desk by the window, the strongroom keys and a share of the commissions.", req: { quals: ["bookkeeping"], exp: 5, rep: 40, conn: [{ person: "eusebio", min: 3 }] }, becomes: { title: "Oficial (senior clerk)", employer: "Casa Maranan, counting house", place: "Binondo", note: "Trusted with the strongroom and the second set of books." }, fx: { funds: 40, rep: 2 } },
    { id: "licence", title: "Hold your own trading licence", tags: ["trader", "clerk"], via: "self", sum: "Trade on your own account up and down the bay, with a licence fee of 300 pesos.", req: { quals: ["literate"], exp: 2, funds: 1000 }, becomes: { title: "Licensed small trader", employer: "Own account", place: "Binondo", note: "Ships small cargo to Cavite and Hong Kong." }, fx: { funds: -300, flag: "licensed-trader", rep: 1 } },
    { id: "escribiente", title: "Escribiente (copyist) at the Ayuntamiento", tags: ["clerk"], via: "self", sum: "A modest government post, steady and watched.", req: { quals: ["spanish", "literate"], exp: 1, conn: [{ person: "ambrosio", min: 3 }] }, becomes: { title: "Escribiente, Ayuntamiento", employer: "City Hall", place: "Manila", note: "A salaried post under the municipal authorities." }, fx: { rep: 1 } },
    { id: "solidaridad", title: "Correspondent for the Madrid reformist journal", tags: ["literate"], via: "self", sum: "Send reports from Manila under a pen name. Unpaid, and not without risk.", req: { quals: ["writing"], rep: 45, flags: [["intro-solidaridad", "An introduction to the Madrid editors"]] }, becomes: { title: "Correspondent (pen name)", employer: "Madrid reformist journal", place: "Manila", note: "Writes under a pen name." }, fx: { rep: 3, flag: "correspondent" } },
    { id: "cabeza", title: "Cabeza de barangay (elected head of a village)", tags: ["trader", "tondo"], via: "election", from: [1892, 11], sum: "Collects the tribute and speaks for the village. Chosen by the principales at the year’s end.", req: { rep: 50, exp: 3, conn: [{ person: "anselmo", min: 3 }] }, becomes: { title: "Cabeza de barangay", employer: "Municipality of Tondo", place: "Tondo", note: "Answers to the gobernadorcillo for the tribute of his barangay." }, fx: { rep: 4 } },
    { id: "capitan", title: "Candidate for capitán municipal", tags: ["trader", "tondo"], via: "election", from: [1894, 0], sum: "Under the municipal reform, a town may elect a capitán municipal.", req: { rep: 60, exp: 5 }, becomes: { title: "Capitán municipal", employer: "Municipality", place: "Tondo", note: "Chief municipal officer." }, fx: { rep: 5 } }
  ];
  const hasTag = (o) => !o.tags || o.tags.some((t) => S.character.tags.includes(t)), open = (o) => !D.career.taken[o.id] && !(D.career.gone && D.career.gone[o.id]) && hasTag(o) && (!o.from || now() >= o.from[0] * 12 + o.from[1]);
  /** Who could supply a missing flag (a reference, an introduction)? Returns a person whose unused favour sets it. */
  const flagSource = (f) => D.people.find((p) => p.status === "met" && (p.favors || []).some((q) => q.fx && q.fx.flag === f && !(p.used || []).includes(q.id)));
  /** Requirement checklist: [met?, label, go?]. go = "person:id" | "pol:orgId" points to where it can be worked on. */
  function checks(o) {
    const r = o.req || {}, c = S.character, out = [], POL = window.RepublikaPolitics;
    (r.quals || []).forEach((q) => out.push([c.quals.includes(q), QL[q] || q]));
    if (r.exp) out.push([c.experience >= r.exp, "Experience: " + c.experience + " of " + r.exp + " years"]);
    if (r.rep) out.push([S.reputation >= r.rep, "Reputation: " + S.reputation + " of " + r.rep]);
    if (r.funds) out.push([S.funds >= r.funds, "Funds: ₱" + S.funds + " of ₱" + r.funds]);
    (r.conn || []).forEach((k) => { const p = byKey(k.person), ok = !!p && p.status === "met" && p.score >= k.min; out.push([ok, (p ? p.name : k.person) + " as a " + (k.min >= 6 ? "ally" : k.min >= 3 ? "friend" : "contact") + " (now: " + (p && p.status === "met" ? REL[relOf(p)][0] : "unknown") + ")", ok ? null : (p && p.status === "met" ? "person:" + p.id : null)]); });
    (r.flags || []).forEach((f) => { const ok = S.flags.includes(f[0]), src = ok ? null : flagSource(f[0]); out.push([ok, f[1], src ? "person:" + src.id : null]); });
    (r.any || []).forEach((a) => { const ok = a[0].some((f) => S.flags.includes(f)), src = ok ? null : a[0].map(flagSource).find(Boolean); out.push([ok, a[1], src ? "person:" + src.id : null]); });
    (r.not || []).forEach((f) => out.push([!S.flags.includes(f[0]), f[1]]));
    (r.stance || []).forEach((s) => { const ok = !!POL && s[1].includes(POL.stance(s[0])); out.push([ok, s[2], ok ? null : "pol:" + s[0]]); });
    (r.view || []).forEach((v) => out.push([!!POL && POL.view(v[0]) >= v[1], v[2]]));
    return out;
  }
  const eligible = (o) => checks(o).every((x) => x[0]);
  const careerNew = () => D.opportunities.filter((o) => open(o) && eligible(o) && !D.career.seen[o.id]).length;
  function take(id, force) {
    const o = D.opportunities.find((x) => x.id === id); if (!o || (!force && (!open(o) || !eligible(o)))) return;
    const cur = D.career.current, e = o.fx || {}, when = D.months[S.month] + " " + S.year;
    if (o.becomes) {
      D.career.history.unshift({ when: cur.since + " – " + when, title: cur.title, note: cur.employer });
      D.career.current = Object.assign({ since: when }, o.becomes);
      D.career.history.unshift({ when, title: "Milestone: " + o.becomes.title, note: o.sum });
      S.character.occupation = o.becomes.title + ", " + o.becomes.place;
    } else D.career.history.unshift({ when, title: o.title, note: o.sum });
    D.career.taken[id] = S.turn;
    (o.gain || [o.id]).forEach((t) => !S.character.tags.includes(t) && S.character.tags.push(t));
    S.funds += e.funds || 0; S.reputation += e.rep || 0; if (e.flag && !S.flags.includes(e.flag)) S.flags.push(e.flag); sync();
    document.dispatchEvent(new CustomEvent("republika:career", { detail: { id, opp: o } }));
  }
  /** For events and elections: grants an opportunity directly (requirements still apply when shown). */
  const grant = (id) => { const o = D.opportunities.find((x) => x.id === id); if (o) { o.via = "self"; delete o.from; } };
  function renderCareer() {
    const c = D.career.current, ops = D.opportunities.filter(open);
    ops.forEach((o) => (D.career.seen[o.id] = true));
    const card = (o) => { const ck = checks(o), ok = ck.every((x) => x[0]), self = o.via === "self";
      return '<article class="opp' + (ok ? " ok" : "") + '"><h4>' + esc(o.title) + '</h4><p class="via">' + (self ? "Apply" : o.via === "election" ? "By election" : "By appointment") + (o.from && !self ? " · from " + D.months[o.from[1]] + " " + o.from[0] : "") + "</p><p>" + esc(o.sum) + '</p><ul class="req">' + ck.map((x) => '<li class="' + (x[0] ? "y" : "n") + '">' + esc(x[1]) + "</li>").join("") + "</ul>" +
        (self ? '<button class="pursue" data-pursue="' + o.id + '"' + (ok ? "" : " disabled") + ">" + (ok ? "Pursue this" : "Requirements not met") + "</button>" : '<p class="await">' + (ok ? "You qualify. It will come through an election or appointment." : "Not yet within reach.") + "</p>") + "</article>"; };
    return '<div class="pc career"><header class="pc-top"><div><h2>Career</h2><p>' + esc(S.character.name) + " · " + esc(S.character.occupation) + '</p></div></header><div class="pc-body"><div class="pc-main"><section class="cur"><small>Current position</small><h3>' + esc(c.title) + "</h3><p>" + esc(c.employer) + " · " + esc(c.place) + " · since " + esc(c.since) + "</p><p>" + esc(c.note) + '</p></section><h4 class="sec">Opportunities</h4><div class="opps">' + (ops.map(card).join("") || '<p class="empty">No opportunities fit your circumstances at this time.</p>') + '</div></div><aside class="pc-side"><div class="pdet"><h4>Milestones and past work</h4><ol class="mile">' + D.career.history.map((h) => "<li><span>" + esc(h.when) + "</span><b>" + esc(h.title) + "</b><small>" + esc(h.note) + "</small></li>").join("") + "</ol></div></aside></div></div>";
  }
  const host = $("screen");
  if (host) host.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-pid],[data-ptab],[data-pflt],[data-ask],[data-tone],[data-sendf],[data-pursue]"); if (!t) return;
    const d = t.dataset;
    if (d.pid) { P.sel = d.pid; P.hov = null; P.wr = null; }
    else if (d.pflt) P.flt = d.pflt;
    else if (d.ask) { const [pid, fid] = d.ask.split(":"); P.wr = { pid, fid, tone: P.wr && P.wr.pid === pid ? P.wr.tone : "friendly" }; } else if (d.tone) P.wr.tone = d.tone; else if (d.sendf) sendFavor(); else if (d.pursue) take(d.pursue);
    RepublikaScreens.render();
  });
  if (host) {
    host.addEventListener("mouseover", (ev) => { const c = ev.target.closest(".pcard"), id = c ? c.dataset.pid : null; if (id !== P.hov) { P.hov = id; draw(); } });
    host.addEventListener("mouseleave", () => { if (P.hov) { P.hov = null; draw(); } });
  }
  window.addEventListener("resize", () => draw());
  window.RepublikaPeople = { QL, flagSource, after: draw, P, sync, adjust, fresh, careerNew, grant, take, resolve, renderPeople, renderCareer, relOf, REL, ASK, byKey, careerOpen: open, careerOk: eligible, careerChecks: checks };
  sync(); D.people.forEach((p) => (p.fresh = false));
})();
