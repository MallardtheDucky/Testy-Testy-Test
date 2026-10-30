/* REPUBLIKA Politics (1892). Reads js/politics-data.js (content) and the existing People, Journal, News and Career modules.
   Political figures ARE people: they are added to D.people, so meeting one puts them in People & Connections, and their standing is
   the same score used everywhere else. There is no second relationship system.
   Public API: window.RepublikaPolitics { render, sync, fresh, line, stance, view, act, meet, orgs, figures, U } */
(function () {
  const D = window.REPUBLIKA_DATA, S = D.state, X = window.REPUBLIKA_POLITICS, PP = window.RepublikaPeople, $ = (i) => document.getElementById(i);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const idx = (a) => a[0] * 12 + a[1], now = () => S.year * 12 + S.month, today = () => "8 " + D.months[S.month] + " " + S.year, has = (t) => (S.character.tags || []).includes(t);
  const sg = (n) => (n > 0 ? "+" : "−") + Math.abs(n);
  S.character.age = S.character.age || 19; // the opening can set the real age
  const P = (D.pol = D.pol || { stance: {}, view: { authorities: 0, reformers: 0, church: 0, merchants: 0 }, pts: 0, done: {}, log: [], seen: {}, fseen: {}, known: {} });
  const U = { tab: "overview", org: null, fig: null, prev: null, ffl: "all" };

  // ---------- register content: political figures are ordinary people ----------
  X.figures.forEach((f) => { if (!PP.byKey(f.id)) D.people.push(f); });
  Object.entries(X.tags).forEach(([id, pol]) => { const p = PP.byKey(id); if (p) p.pol = pol; });
  Object.entries(X.favors).forEach(([id, fs]) => { const p = PP.byKey(id); if (p) p.favors = (p.favors || []).concat(fs); });
  Object.assign(PP.ASK, X.ask);
  PP.sync(); D.people.forEach((p) => (p.fresh = false));
  const ORGS = X.orgs; ORGS.forEach((o) => (o.actions || []).forEach((a) => (a.org = o.id)));

  // ---------- state of the world ----------
  const cnd = (c) => !!((c.flag && S.flags.includes(c.flag)) || (c.letter && D.letters.some((l) => l.ref === c.letter)) || (c.story && D.newsLog[c.story]) || (c.event && D.eventLog[c.event]) || (c.public && (S.public || []).includes(c.public)) || c.start);
  const orgOn = (o) => (!o.from || now() >= idx(o.from)) && (!o.needs || o.needs.some(cnd));
  const orgs = () => ORGS.filter(orgOn), org = (id) => ORGS.find((o) => o.id === id);
  const phase = (o) => { let r = o.phases[0]; o.phases.forEach((p) => { if (now() >= idx(p.from)) r = p; }); return r; };
  const situation = () => { let r = X.situations[0]; X.situations.forEach((s) => { if (now() >= idx(s.from)) r = s; }); return r; };
  const figs = () => D.people.filter((p) => p.pol && p.status);
  const stance = (id) => P.stance[id] || "none";
  const STN = { none: "No ties", support: "Supporter", member: "Member", oppose: "Opponent" }, STC = { none: "#9a8f78", support: "#7fae6e", member: "#d2b068", oppose: "#c4453a" };
  const INF = ["Marginal", "Minor", "Notable", "Strong", "Dominant"];
  const AUD = { authorities: ["The authorities", ["Marked man", "Watched", "Unnoticed", "Trusted", "Favoured"]], reformers: ["Reformists", ["Distrusted", "Doubted", "Unknown to them", "Welcomed", "Counted upon"]],
    church: ["The Church", ["Denounced", "Under suspicion", "Unremarked", "In good standing", "A pillar of the parish"]], merchants: ["Commerce and the town", ["A bad risk", "Doubted", "Unknown", "Respected", "Well regarded"]] };
  const band = (v) => (v <= -4 ? 0 : v <= -2 ? 1 : v <= 1 ? 2 : v <= 3 ? 3 : 4);
  const view = (a) => { let v = P.view[a] || 0; S.flags.forEach((f) => { v += (X.flagfx[f] || {})[a] || 0; }); return Math.max(-5, Math.min(5, v)); };
  const vlabel = (a) => AUD[a][1][band(view(a))];
  const TIER = [[0, "Bystander"], [1, "Observer"], [3, "Sympathiser"], [6, "Participant"], [10, "Committed"]];
  const tier = () => TIER.reduce((r, t) => (P.pts >= t[0] ? t[1] : r), "Bystander");
  const QL = { literate: "Literate in Spanish and Tagalog", spanish: "Spanish", bookkeeping: "Bookkeeping", tagalog: "Tagalog", writing: "Practised writing" };
  const KIND = { support: "Show support", oppose: "Take a stand", attend: "Gathering", join: "Join", reform: "Reform effort", cooperate: "Cooperate", leave: "Change course" };

  // ---------- requirements (same look as Career) ----------
  function checks(r) {
    r = r || {}; const c = S.character, out = [];
    if (r.minAge) out.push([c.age >= r.minAge, "Age: " + c.age + " of " + r.minAge]);
    (r.quals || []).forEach((q) => out.push([(c.quals || []).includes(q), QL[q] || q]));
    if (r.rep) out.push([S.reputation >= r.rep, "Reputation: " + S.reputation + " of " + r.rep]);
    if (r.funds) out.push([S.funds >= r.funds, "Funds: ₱" + S.funds.toLocaleString("en-US") + " of ₱" + r.funds.toLocaleString("en-US")]);
    (r.conn || []).forEach((k) => { const p = PP.byKey(k.person), met = p && p.status === "met";
      out.push([!!met && p.score >= k.min, (p && p.status ? p.name : "A contact you have not yet met") + " as " + (k.min >= 6 ? "an ally" : k.min >= 3 ? "a friend" : "an acquaintance") + " (now: " + (met ? PP.REL[PP.relOf(p)][0] : "not met") + ")"]); });
    Object.entries(r.view || {}).forEach(([a, m]) => out.push([view(a) >= m, AUD[a][0] + ": " + AUD[a][1][band(m)] + " or better (now: " + vlabel(a) + ")"]));
    (r.flags || []).forEach((f) => out.push([S.flags.includes(f[0]), f[1]]));
    (r.noFlags || []).forEach((f) => out.push([!S.flags.includes(f[0]), f[1]]));
    Object.entries(r.orgs || {}).forEach(([id, st]) => out.push([st.includes(stance(id)), st.map((x) => STN[x]).join(" or ") + ": " + (org(id) || {}).name]));
    return out;
  }
  const hidden = (a) => (a.req && a.req.tags && !a.req.tags.some(has)) || (a.from && now() < idx(a.from)) || (a.until && now() > idx(a.until)) || (a.stance && !a.stance.includes(stance(a.org)));
  function state(a) { const t = P.done[a.id]; if (t == null) return ""; if (!a.repeat) return "Done"; const left = a.repeat - (S.turn - t); return left > 0 ? "Again in " + left + (left === 1 ? " month" : " months") : ""; }
  const ready = (a) => !hidden(a) && !state(a) && checks(a.req).every((x) => x[0]);
  const openings = () => orgs().reduce((n, o) => n + (o.actions || []).filter(ready).length, 0);

  // ---------- effects (dry = preview only) ----------
  function apply(fx, label, dry) {
    fx = fx || {}; const out = [];
    if (fx.funds) { out.push((fx.funds > 0 ? "+" : "−") + "₱" + Math.abs(fx.funds)); if (!dry) S.funds += fx.funds; }
    if (fx.rep) { out.push("Reputation " + sg(fx.rep)); if (!dry) S.reputation += fx.rep; }
    Object.entries(fx.view || {}).forEach(([a, v]) => { out.push(AUD[a][0] + " " + sg(v)); if (!dry) P.view[a] = (P.view[a] || 0) + v; });
    Object.entries(fx.rel || {}).forEach(([k, v]) => { const p = PP.byKey(k); if (p && p.status === "met") { out.push(p.name + " " + sg(v)); if (!dry) PP.adjust(k, v, label); } });
    (fx.meet || []).forEach((m) => { const p = PP.byKey(m); if (p && p.status !== "met") { out.push("You meet " + p.name); if (!dry && !D.intros.includes(m)) D.intros.push(m); } });
    if (fx.stance) out.push(fx.stance === "none" ? "Ties cut" : "You become a " + STN[fx.stance].toLowerCase());
    if (!dry) { (fx.flags || []).forEach((f) => !S.flags.includes(f) && S.flags.push(f)); (fx.public || []).forEach((f) => window.RepublikaNews && RepublikaNews.reveal(f)); }
    return out;
  }
  function record(title, label, text, outcome, effects, key) {
    D.journal.unshift({ date: today(), place: "Manila", unread: true, title, body: [text] });
    D.history.unshift({ event: key, type: "political", title, date: today(), turn: S.turn, choice: key, label, written: text, outcome, effects });
    P.log.unshift({ when: today(), title, label });
  }
  function act(oid, aid) {
    const o = org(oid), a = o && (o.actions || []).find((x) => x.id === aid); if (!a || !ready(a)) return;
    const fx = apply(a.fx, a.label); if (a.fx && a.fx.stance) P.stance[oid] = a.fx.stance;
    P.pts += a.pts || 1; P.done[aid] = S.turn; U.prev = null;
    record(o.name, a.label, a.text, a.outcome, fx, "pol-" + aid); PP.sync();
    document.dispatchEvent(new CustomEvent("republika:politics", { detail: { org: oid, action: aid, stance: stance(oid) } }));
    if (window.Republika) Republika.refresh();
  }
  function meet(id) {
    const p = PP.byKey(id), a = p && p.pol && p.pol.access; if (!a || p.status === "met" || !checks(a.req).every((x) => x[0])) return;
    if (!D.intros.includes(id)) D.intros.push(id);
    const fx = apply(a.fx, "Met " + p.name); P.pts += 1; P.done["meet-" + id] = S.turn;
    PP.sync(); record("Calling on " + p.name, "Seek an audience with " + p.name, a.text, a.outcome, ["You meet " + p.name].concat(fx), "pol-meet-" + id);
    if (window.Republika) Republika.refresh();
  }
  function sync() {
    const first = !P.init, when = D.months[S.month] + " " + S.year; P.init = true;
    orgs().forEach((o) => { if (!P.known[o.id]) { P.known[o.id] = 1; if (!first) D.briefing.unshift({ when, text: "Word reaches you of " + o.name + "." }); } });
    const s = situation(); if (P.sit && P.sit !== s.title) D.briefing.unshift({ when, text: "The political climate has shifted: " + s.title + "." }); P.sit = s.title;
    D.briefing = D.briefing.slice(0, 6);
  }
  const fresh = () => orgs().filter((o) => !P.seen[o.id]).length + figs().filter((p) => !P.fseen[p.id]).length;
  /** One line for a person's panel in People & Connections. */
  const line = (p) => '<h4>Political life</h4><p>' + esc(p.pol.role) + (p.pol.orgs.length ? " · " + p.pol.orgs.map((id) => esc((org(id) || {}).name || "")).filter(Boolean).join(", ") : "") + "</p>";

  // ---------- pieces ----------
  const disc = (o, big) => '<span class="pol-disc' + (big ? " big" : "") + '" style="--rc:' + o.color + '">' + (o.emblem ? '<img alt="" src="' + esc(o.emblem) + '">' : esc(o.mono)) + "</span>";
  const pips = (n, c) => '<span class="pips" style="--rc:' + (c || "#d2b068") + '" title="Influence: ' + INF[n] + '">' + [1, 2, 3, 4].map((i) => '<i class="' + (i <= n ? "on" : "") + '"></i>').join("") + "</span>";
  const stChip = (id) => '<span class="rchip" style="--rc:' + STC[stance(id)] + '">' + STN[stance(id)] + "</span>";
  const relChip = (p) => p.status === "met" ? '<span class="rchip" style="--rc:' + PP.REL[PP.relOf(p)][1] + '">' + PP.REL[PP.relOf(p)][0] + "</span>" : '<span class="rchip hd">Known of</span>';
  const reqList = (ck) => ck.length ? '<ul class="req">' + ck.map((x) => '<li class="' + (x[0] ? "y" : "n") + '">' + esc(x[1]) + "</li>").join("") + "</ul>" : "";
  const chips = (l) => l.length ? '<p class="pol-chips">' + l.map((c) => "<span>" + esc(c) + "</span>").join("") + "</p>" : "";
  const row = (o) => '<button class="pol-row' + (o.id === U.org && U.tab === "orgs" ? " on" : "") + '" style="--rc:' + o.color + '" data-pol-org="' + o.id + '">' + disc(o) + "<span><b>" + esc(o.name) + "</b><small>" + esc(phase(o).status) + "</small></span><span class=\"rt\">" + (P.seen[o.id] ? "" : '<em class="newt">New</em>') + pips(phase(o).influence, o.color) + (stance(o.id) !== "none" ? '<em class="mk" style="--rc:' + STC[stance(o.id)] + '">' + STN[stance(o.id)] + "</em>" : "") + "</span></button>";
  const frame = (p) => '<span class="pol-fr' + (p.status === "heard" ? " blank" : "") + '">' + (p.status === "heard" ? "?" : p.portrait ? '<img alt="" src="' + esc(p.portrait) + '">' : "") + "</span>";

  // ---------- Overview ----------
  function headlines() {
    const seen = {}, out = [];
    D.newspaper.forEach((pp) => pp.articles.forEach((a) => { if (["admin", "reform", "controversy", "history"].includes(a.topic) && !seen[a.head] && out.length < 4) { seen[a.head] = 1; out.push({ paper: pp.name, head: a.head, date: a.date }); } }));
    return out;
  }
  function overview() {
    const sit = situation(), all = orgs(), A = all.filter((o) => o.group === "authority"), M = all.filter((o) => o.group !== "authority");
    const mem = all.filter((o) => stance(o.id) !== "none"), news = headlines();
    const opps = D.opportunities.filter((o) => o.via !== "self" && PP.careerOpen(o)).length;
    const main = '<section class="pol-sit"><small class="sec">The situation · ' + D.months[S.month] + " " + S.year + "</small><h3>" + esc(sit.title) + '</h3><p class="mood">' + esc(sit.mood) + "</p><p>" + esc(sit.text) + '</p><ul class="pol-tens">' +
      sit.tensions.map((t) => "<li><span>" + esc(t[0]) + '</span><b class="tn tn-' + t[1] + '">' + ["Calm", "Uneasy", "Tense", "Volatile"][t[1]] + "</b></li>").join("") + "</ul></section>" +
      '<h4 class="sec">Ruling authorities and institutions</h4><div class="pol-cards">' + A.map((o) => '<button class="pol-card" style="--rc:' + o.color + '" data-pol-org="' + o.id + '">' + disc(o) + "<span><b>" + esc(o.name) + "</b><small>" + esc(o.holder ? o.holder + " · " : "") + esc(o.tag) + "</small></span></button>").join("") + "</div>" +
      '<h4 class="sec">Movements and competing interests</h4><div class="pol-rows">' + M.map(row).join("") + "</div>" +
      (news.length ? '<h4 class="sec">In the press</h4><ul class="pol-news">' + news.map((n) => "<li><b>" + esc(n.head) + "</b><span>" + esc(n.paper) + " · " + esc(n.date) + "</span></li>").join("") + '</ul><button class="pursue" data-pol-go="newspaper">Read the newspapers</button>' : "");
    const side = '<div class="pdet pol-you"><h4>Where you stand</h4>' + (mem.length ? '<ul class="plist">' + mem.map((o) => '<li><button data-pol-org="' + o.id + '">' + esc(o.name) + "</button>" + stChip(o.id) + "</li>").join("") + "</ul>" : "<p>Unaffiliated. You have taken no side.</p>") +
      "<h4>Involvement</h4><p><b class=\"pol-tier\">" + tier() + "</b> · reputation " + S.reputation + "</p>" +
      "<h4>How you are seen</h4><ul class=\"pol-view\">" + Object.keys(AUD).map((a) => "<li><span>" + AUD[a][0] + "</span><b>" + vlabel(a) + '</b><div class="trust"><i style="left:' + (50 + view(a) * 9) + '%"></i></div></li>').join("") + "</ul>" +
      "<h4>Open to you</h4><p>" + (openings() ? openings() + (openings() === 1 ? " political opening" : " political openings") + " within reach." : "Nothing is within reach at present.") + '</p><button class="pursue" data-pol-tab="orgs">Movements &amp; organizations</button>' +
      (opps ? '<p class="pol-sub">' + opps + (opps === 1 ? " election or appointment" : " elections or appointments") + ' may come your way.</p><button class="pursue" data-pol-go="career">View in Career</button>' : "") +
      (P.log.length ? "<h4>Recent acts</h4><ul class=\"plog\">" + P.log.slice(0, 3).map((l) => "<li><span>" + esc(l.when) + "</span> " + esc(l.label) + "</li>").join("") + "</ul>" : "") + "</div>";
    return '<div class="pc-main">' + main + '</div><aside class="pc-side">' + side + "</aside>";
  }

  // ---------- Organizations ----------
  function actRow(o, a) {
    const ck = checks(a.req), ok = ck.every((x) => x[0]), st = state(a), sel = U.prev === o.id + ":" + a.id;
    const prev = sel && ok && !st ? '<article class="pdraft"><div class="dl">' + today() + "</div><p>" + esc(a.text) + '</p><p class="sg">' + esc(S.character.name) + "</p></article>" + chips(apply(a.fx, a.label, true)) + '<div class="sendrow"><span>Entered in your journal</span><button class="send" data-pol-do="' + o.id + ":" + a.id + '">Write &amp; record</button></div>' : "";
    return '<li class="pol-act' + (sel ? " on" : "") + (ok && !st ? " ok" : "") + '"><div class="ah"><b>' + esc(a.label) + '</b><em>' + KIND[a.kind] + "</em></div><p>" + esc(a.note) + "</p>" + reqList(ck) +
      (st ? '<p class="await">' + st + "</p>" : '<button class="pursue" data-pol-act="' + o.id + ":" + a.id + '"' + (ok ? "" : " disabled") + ">" + (ok ? (sel ? "Hide" : "Consider this") : "Requirements not met") + "</button>") + prev + "</li>";
  }
  function orgDetail(o) {
    const ph = phase(o), lead = (o.leaders || []).map((l) => ({ p: PP.byKey(l.id), role: l.role })).filter((x) => x.p && x.p.status), unk = (o.leaders || []).length - lead.length;
    const acts = (o.actions || []).filter((a) => !hidden(a)), cars = (o.careers || []).map((id) => D.opportunities.find((x) => x.id === id)).filter((x) => x && PP.careerOpen(x));
    return '<div class="pdet pol-det" style="--rc:' + o.color + '"><div class="phead">' + disc(o, 1) + "<div><h3>" + esc(o.name) + "</h3><p>" + esc(o.tag) + "</p><div>" + '<span class="rchip" style="--rc:' + o.color + '">' + esc(o.kind) + "</span>" + stChip(o.id) + "</div></div></div>" +
      "<p>" + esc(ph.desc || o.desc) + '</p><div class="pol-two"><div><h4>Main objectives</h4><ul class="pol-bul">' + o.goals.map((g) => "<li>" + esc(g) + "</li>").join("") + "</ul></div><div><h4>Beliefs</h4><p>" + esc(o.beliefs) + "</p></div></div>" +
      "<h4>Standing and influence</h4><p>" + esc(ph.status) + "</p><p>" + pips(ph.influence, o.color) + " &nbsp;" + INF[ph.influence] + " influence" + "</p>" +
      "<h4>Leaders and members</h4>" + (lead.length ? '<ul class="plist">' + lead.map((x) => '<li><button data-pol-go="person:' + x.p.id + '">' + esc(x.p.name) + "</button><span>" + esc(x.role) + " · " + relChip(x.p) + "</span></li>").join("") + "</ul>" : "<p>You know of no one by name.</p>") + (unk > 0 && lead.length ? '<p class="pol-sub">' + unk + (unk === 1 ? " other is" : " others are") + " not yet known to you.</p>" : "") +
      "<h4>Your relationship</h4><p>" + stChip(o.id) + " &nbsp;" + esc(AUD[o.aud][0]) + " regard you as <b>" + esc(vlabel(o.aud).toLowerCase()) + "</b>.</p>" +
      (cars.length ? "<h4>Elections and appointments</h4><ul class=\"plist\">" + cars.map((c) => "<li><span>" + esc(c.title) + "</span><button data-pol-go=\"career\">" + (PP.careerOk(c) ? "You qualify" : "Not yet") + "</button></li>").join("") + "</ul>" : "") +
      "<h4>What you can do</h4>" + (acts.length ? '<ul class="pol-acts">' + acts.map((a) => actRow(o, a)).join("") + "</ul>" : '<p class="pol-sub">Nothing is open to you here at present.</p>') + "</div>";
  }
  function orgsView() {
    const all = orgs(), G = [["authority", "Ruling authorities"], ["movement", "Movements and societies"], ["interest", "Interests"]], o = org(U.org);
    P.seen[o.id] = 1;
    const list = G.map((g) => { const L = all.filter((x) => x.group === g[0]); return L.length ? "<h5>" + g[1] + "</h5>" + L.map(row).join("") : ""; }).join("");
    return '<aside class="pc-side pol-list">' + list + '</aside><div class="pc-main">' + orgDetail(o) + "</div>";
  }

  // ---------- Figures ----------
  const introsTo = (id) => D.people.filter((q) => q.status === "met" && (q.favors || []).some((f) => f.fx && (f.fx.meet || []).includes(id)));
  function figDetail(p) {
    const pol = p.pol, heard = p.status === "heard", rc = heard ? "#5b5140" : PP.REL[PP.relOf(p)][1], orgChips = pol.orgs.map((id) => org(id)).filter((o) => o && orgOn(o)).map((o) => '<button class="rchip pol-oc" style="--rc:' + o.color + '" data-pol-org="' + o.id + '">' + esc(o.name) + "</button>").join(" ");
    const acc = pol.access, ck = acc ? checks(acc.req) : [], ok = ck.every((x) => x[0]), via = introsTo(p.id);
    const head = '<div class="phead"><span class="pf big' + (heard ? " blank" : "") + '">' + (heard ? "?" : p.portrait ? '<img alt="" src="' + esc(p.portrait) + '">' : "") + "</span><div><h3>" + esc(p.name) + "</h3><p>" + esc(pol.role) + "</p><small>" + esc(p.place) + (heard ? "" : " · age " + p.age) + "</small><div>" + relChip(p) + "</div>" + (heard ? "" : '<div class="trust"><i style="left:' + (50 + p.score * 5) + '%"></i></div>') + "</div></div>";
    if (!heard) { // a person you have met: show the full picture
      const dev = (p.favors || []).map((f) => { const used = (p.used || []).includes(f.id); return '<li><span>' + esc(f.label.replace(/^Ask (for )?/, "").replace(/^./, (c) => c.toUpperCase())) + "</span><span>" + (used ? "Done" : p.score >= f.need ? "Likely" : "Needs " + (f.need >= 6 ? "Ally" : "Friend")) + "</span></li>"; }).join("");
      return '<div class="pdet pol-det" style="--rc:' + rc + '">' + head + "<h4>Their place</h4><p>" + esc(pol.role) + "</p><p>" + orgChips + "</p><h4>What you know</h4><p>" + esc(p.info) + (pol.offers ? " " + esc(pol.offers) : "") + "</p>" +
        (pol.hint ? "<h4>What helps</h4><p>" + esc(pol.hint) + "</p>" : "") + (dev ? '<h4>What they can do for you</h4><ul class="plist">' + dev + "</ul>" : "") +
        '<button class="pursue" data-pol-go="person:' + p.id + '">Open in People &amp; Connections</button></div>';
    }
    return '<div class="pdet pol-det" style="--rc:' + rc + '">' + head + "<h4>What is publicly known</h4><p>" + esc(pol.public) + "</p><h4>Their place</h4><p>" + orgChips + "</p>" +
      "<h4>How to meet them</h4>" + (pol.where ? "<p>" + esc(pol.where) + "</p>" : "") +
      (acc ? "<p class=\"pol-sub\">Seeking an audience yourself:</p>" + reqList(ck) + '<button class="pursue" data-pol-seek="' + p.id + '"' + (ok ? "" : " disabled") + ">" + (ok ? "Seek an audience" : "Requirements not met") + "</button>" : "") +
      (via.length ? '<p class="pol-sub">Or ask someone who knows them:</p><ul class="plist">' + via.map((q) => '<li><button data-pol-go="person:' + q.id + '">' + esc(q.name) + "</button><span>" + relChip(q) + "</span></li>").join("") + "</ul>" : "") +
      (!pol.where && !acc && !via.length ? '<p class="pol-sub">You cannot see a way to them yet. Widen your circle.</p>' : "") + "</div>";
  }
  function figuresView() {
    const all = figs(), L = all.filter((p) => U.ffl === "all" || (U.ffl === "met") === (p.status === "met")), p = PP.byKey(U.fig);
    P.fseen[p.id] = 1;
    const FL = [["all", "All"], ["met", "Met"], ["heard", "Known of"]];
    const list = '<div class="seg flt">' + FL.map((f) => '<button data-pol-ffl="' + f[0] + '"' + (U.ffl === f[0] ? ' class="on"' : "") + ">" + f[1] + "</button>").join("") + "</div>" + (L.length ? L.map((q) => '<button class="pol-row fig' + (q.id === U.fig ? " on" : "") + '" style="--rc:' + (q.status === "heard" ? "#5b5140" : PP.REL[PP.relOf(q)][1]) + '" data-pol-fig="' + q.id + '">' + frame(q) + "<span><b>" + esc(q.name) + "</b><small>" + esc(q.pol.role) + '</small></span><span class="rt">' + (P.fseen[q.id] ? "" : '<em class="newt">New</em>') + relChip(q) + "</span></button>").join("") : '<p class="empty">No one fits this filter yet.</p>');
    return '<aside class="pc-side pol-list">' + list + '</aside><div class="pc-main">' + figDetail(p) + "</div>";
  }

  function render() {
    const O = orgs(), F = figs();
    if (!U.org || !O.some((o) => o.id === U.org)) U.org = (O[0] || {}).id;
    if (!U.fig || !F.some((p) => p.id === U.fig)) U.fig = (F[0] || {}).id;
    const sit = situation(), o = org(U.org), p = PP.byKey(U.fig);
    const T = [["overview", "Overview"], ["orgs", "Movements & Organizations"], ["figures", "Political Figures"]];
    const ttl = U.tab === "orgs" && o ? [o.name, o.kind] : U.tab === "figures" && p ? [p.name, p.pol.role] : ["Politics", sit.title + " · " + sit.mood];
    const body = U.tab === "orgs" ? orgsView() : U.tab === "figures" ? figuresView() : overview();
    return '<div class="pc pol"><header class="pc-top"><div class="pc-name"><small>Politics · ' + D.months[S.month] + " " + S.year + "</small><h2>" + esc(ttl[0]) + "</h2><p>" + esc(ttl[1]) + '</p></div><div class="seg">' + T.map((t) => '<button data-pol-tab="' + t[0] + '"' + (U.tab === t[0] ? ' class="on"' : "") + ">" + t[1] + "</button>").join("") + '</div></header><div class="pc-body' + (U.tab === "overview" ? "" : " split") + '">' + body + "</div></div>";
  }

  // ---------- clicks ----------
  const host = $("screen");
  if (host) host.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-pol-tab],[data-pol-org],[data-pol-fig],[data-pol-ffl],[data-pol-act],[data-pol-do],[data-pol-seek],[data-pol-go]"); if (!t || t.disabled) return;
    const d = t.dataset;
    if (d.polTab) { U.tab = d.polTab; U.prev = null; }
    else if (d.polOrg) { U.org = d.polOrg; U.tab = "orgs"; U.prev = null; }
    else if (d.polFig) U.fig = d.polFig;
    else if (d.polFfl) U.ffl = d.polFfl;
    else if (d.polAct) U.prev = U.prev === d.polAct ? null : d.polAct;
    else if (d.polDo) { const [o, a] = d.polDo.split(":"); act(o, a); }
    else if (d.polSeek) meet(d.polSeek);
    else if (d.polGo) {
      const [k, id] = d.polGo.split(":");
      if (k === "person") { PP.P.sel = id; PP.P.flt = "all"; PP.P.wr = null; }
      return RepublikaScreens.open(k === "person" ? "people" : k);
    }
    RepublikaScreens.render();
  });
  window.RepublikaPolitics = { AUD, label: vlabel, render, sync, fresh, line, stance, view, act, meet, orgs, figures: figs, U, checks };
  sync(); orgs().forEach((o) => (P.seen[o.id] = 1)); figs().forEach((p) => (P.fseen[p.id] = 1));
})();
