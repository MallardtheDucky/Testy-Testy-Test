/* REPUBLIKA Career & Personal Standing (1892). One section: who you are in the world and where your life may go next.
   Content: js/standing-data.js (documented there). Reuses D.career / D.opportunities and take() from people.js.
   Connects to:
     People    requirements read relationship standing; an unmet one links to the person who can help; careers introduce new people (fx.meet)
     Politics  requirements read organisation membership and how audiences see you; careers shift those audiences (fx.view); orgs list their openings
     Letters   offers, invitations and requests arrive as ordinary letters; Accept / Ask / Decline use the existing reply flow
     Newspaper only public achievements and controversies become stories (opp.news), not every personal step
     Journal   every change of post, a refused offer and a lapsed offer are written up in the Diary and filed in Decisions
   Public API: window.RepublikaStanding { render, sync, fresh, open }  — events: "republika:career" {id, opp} */
(function () {
  const D = window.REPUBLIKA_DATA, S = D.state, X = window.REPUBLIKA_STANDING, PP = window.RepublikaPeople, $ = (i) => document.getElementById(i);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const today = () => "8 " + D.months[S.month] + " " + S.year, monthYear = () => D.months[S.month] + " " + S.year;
  const sg = (n) => (n > 0 ? "+" : "−") + Math.abs(n);
  const name = (s) => String(s).replace(/\{name\}/g, S.character.name);
  const ST = { cat: "all" };

  // ---------- register content in the existing systems ----------
  Object.assign(PP.QL, X.quals);
  X.people.forEach((p) => { if (!PP.byKey(p.id)) D.people.push(p); });
  Object.entries(X.favors).forEach(([id, fs]) => { const p = PP.byKey(id); if (p) p.favors = (p.favors || []).concat(fs); });
  Object.assign(PP.ASK, X.ask);
  Object.entries(X.patch).forEach(([id, pt]) => { const o = D.opportunities.find((x) => x.id === id); if (!o) return;
    Object.keys(pt).forEach((k) => { o[k] = k === "becomes" ? Object.assign({}, o.becomes, pt.becomes) : pt[k]; }); });
  X.opportunities.forEach((o) => { if (!D.opportunities.some((x) => x.id === o.id)) D.opportunities.push(o); });
  const POLX = window.REPUBLIKA_POLITICS;
  if (POLX) Object.entries(X.orgCareers || {}).forEach(([id, list]) => { const o = POLX.orgs.find((q) => q.id === id); if (o) o.careers = (o.careers || []).concat(list.filter((c) => !(o.careers || []).includes(c))); });
  if (window.RepublikaNews) X.stories.forEach((st) => RepublikaNews.STORIES.push(st));
  Object.assign(D.career, { gone: {}, offers: {}, followed: {}, n: 0, paid: S.turn, expYear: S.year });
  D.career.current.pay = D.career.current.pay || 8;
  if (S.character.quals.includes("literate") && !S.character.tags.includes("literate")) S.character.tags.push("literate");
  D.badges.standing = 0;

  // ---------- helpers ----------
  const find = (id) => D.opportunities.find((o) => o.id === id);
  const live = (o) => PP.careerOpen(o);                       // right background, right period, not taken, not turned down or lapsed
  const ready = (o) => live(o) && PP.careerOk(o);
  const band = (list, v) => list.reduce((r, t, i) => (v >= t[0] ? { text: t[1], i } : r), { text: list[0][1], i: 0 });
  const offerOpen = (o) => D.career.offers[o.id] && !D.career.offers[o.id].done;
  function fxText(e) { e = e || {}; return [e.funds ? "₱" + sg(e.funds) : "", e.rep ? "Reputation " + sg(e.rep) : ""].concat(Object.entries(e.view || {}).map(([a, n]) => (window.RepublikaPolitics ? RepublikaPolitics.AUD[a][0] : a) + " " + sg(n)), (e.qual || []).map((q) => "Gained: " + (PP.QL[q] || q)), Object.entries(e.rel || {}).map(([k, v]) => k + " " + sg(v))).filter(Boolean); }
  function record(o, label, written, outcome, effects) {
    const rec = { event: "career-" + o.id, type: "career", title: o.title, date: today(), turn: S.turn, choice: label, label, written, outcome, effects };
    D.history.unshift(rec); return rec;
  }
  function diary(title, place, body, ev) { D.journal.unshift({ date: today(), place: place || "Manila", unread: true, title, body: [body], career: ev }); }
  function extras(fx, note) {
    fx = fx || {};
    (fx.qual || []).forEach((q) => !S.character.quals.includes(q) && S.character.quals.push(q));
    if (fx.exp) S.character.experience += fx.exp;
    Object.entries(fx.view || {}).forEach(([a, n]) => { if (D.pol) D.pol.view[a] = (D.pol.view[a] || 0) + n; });
    (fx.meet || []).forEach((m) => !D.intros.includes(m) && D.intros.push(m));
    Object.entries(fx.rel || {}).forEach(([k, v]) => PP.adjust(k, v, note));
    if (fx.flag && !S.flags.includes(fx.flag)) S.flags.push(fx.flag);
    PP.sync();
  }

  // ---------- letters: offers, invitations, requests ----------
  const letterBase = (f) => { D.career.n++; return { ref: "CORR-92-" + (200 + D.career.n), unread: true, kind: f.kind || "hand", paper: f.paper || "cream", seal: f.seal, letterhead: f.letterhead, subject: f.subject, from: f.from, role: f.role, place: f.place, date: today(), recv: today(), salutation: f.salutation, body: f.body.slice(), close: f.close, sign: f.sign }; };
  function filed(L) { D.letters.unshift(L); if (window.RepublikaScreens) RepublikaScreens.sortInbox(); D.briefing.unshift({ when: monthYear(), text: "A letter from " + L.from + ": “" + L.subject + "”." }); D.briefing = D.briefing.slice(0, 6); }
  function sendOffer(o) {
    const f = o.offer, L = letterBase(f); L.careerOffer = o.id;
    L.opts = [{ label: "Accept", action: { type: "career", do: "accept", opp: o.id }, text: f.accept.text, rep: f.accept.rep || 0, in: 2, reply: f.accept.reply },
      { label: "Ask a question", text: f.ask.text, reply: f.ask.reply },
      { label: "Decline", action: { type: "career", do: "decline", opp: o.id }, text: f.decline.text, rep: f.decline.rep || 0 }];
    D.career.offers[o.id] = { turn: S.turn, ref: L.ref }; filed(L);
  }
  function sendFollow(o, f, key) {
    const L = letterBase(f.letter); D.career.followed[key] = S.turn;
    L.opts = f.opts.map((q) => ({ label: q.label, text: q.text, funds: q.funds || 0, rep: q.rep || 0, reply: q.reply, action: q.fx ? { type: "career", do: "fx", fx: q.fx, label: q.label } : null }));
    filed(L);
  }
  function lapse(o) {
    const off = D.career.offers[o.id], L = D.letters.find((l) => l.ref === off.ref); off.done = "lapsed"; D.career.gone[o.id] = "lapsed";
    if (L && !L.answered) { L.answered = "No answer sent; the offer lapsed"; L.answeredOn = today(); }
    const text = "I left the letter from " + o.offer.from + " unanswered too long. When I looked again the matter had been settled without me. ~~I told myself I was thinking.~~ __I was afraid of choosing.__";
    diary("An offer lapsed", "", text, "career-" + o.id);
    record(o, "Let the offer lapse", text.replace(/~~|__/g, ""), "The post went elsewhere. " + o.offer.from + " will remember that no answer came.", ["Opportunity lost: " + o.title]);
    PP.adjust(o.offer.from, -1, "Left an offer unanswered");
  }
  document.addEventListener("republika:letter", (e) => {
    const a = e.detail.action, L = D.letters.find((l) => l.ref === e.detail.letter);
    if (L && L.careerOffer && e.detail.option === "Ask a question") { delete L.answered; delete L.answeredOn; }  // a question does not close an offer
    if (!a || a.type !== "career") return;
    const o = a.opp && find(a.opp);
    if (a.do === "accept" && o && D.career.offers[o.id]) { D.career.offers[o.id].done = "accepted"; PP.take(o.id, true); }
    else if (a.do === "decline" && o && D.career.offers[o.id]) {
      D.career.offers[o.id].done = "declined"; D.career.gone[o.id] = "declined";
      const text = "I wrote to " + o.offer.from + " and declined, with thanks. It was the sensible answer. I have not stopped wondering about it since.";
      diary("A door I closed", "", text, "career-" + o.id);
      record(o, "Declined the offer", text, "You turned down: " + o.title + ". The offer will not be made again.", [o.title + ": declined"]);
    } else if (a.do === "fx") extras(a.fx, a.label);
    if (window.Republika) Republika.refresh();
  });

  // ---------- a career step is taken ----------
  document.addEventListener("republika:career", (e) => {
    const o = e.detail.opp, b = o.becomes, e1 = o.fx || {};
    extras({ qual: e1.qual, exp: e1.exp, view: e1.view, meet: e1.meet, rel: e1.rel }, o.title);
    const text = o.diary || "A change in my circumstances, recorded here so I remember how it began.";
    diary(b ? "New post: " + b.title : o.title, b ? b.place : "Manila", text, "career-" + o.id);
    record(o, b ? "Took the post: " + b.title : o.title, text, b ? b.employer + ", " + b.place + ". " + (b.pay ? "You put aside about ₱" + b.pay + " a month." : "") : o.sum, fxText(e1));
    D.briefing.unshift({ when: monthYear(), text: b ? "You are now " + b.title + "." : "Done: " + o.title + "." }); D.briefing = D.briefing.slice(0, 6);
    if (o.news && window.RepublikaNews) {
      const fr = {}; Object.entries(o.news.frames).forEach(([k, f]) => (fr[k] = { label: f.label, head: name(f.head), deck: name(f.deck || ""), body: f.body.map(name) }));
      RepublikaNews.STORIES.push({ id: "career-" + o.id, topic: o.news.topic || "admin", when: { known: ["career-" + o.id] }, frames: fr }); RepublikaNews.reveal("career-" + o.id);
    }
    D.career.seen[o.id] = true; if (window.Republika) Republika.refresh();
  });

  // ---------- each turn ----------
  function sync() {
    const c = D.career;
    if (c.paid !== S.turn) { c.paid = S.turn; S.funds += (c.current && c.current.pay) || 0; }
    if (S.month === 6 && c.expYear !== S.year) { c.expYear = S.year; S.character.experience++; }
    D.opportunities.forEach((o) => {
      if (!o.offer) return; const off = c.offers[o.id];
      if (!off) { if (ready(o)) sendOffer(o); } else if (!off.done && S.turn >= off.turn + (o.offer.lapse || 3)) lapse(o);
    });
    Object.entries(c.taken).forEach(([id, t]) => { const o = find(id); if (o) (o.follow || []).forEach((f, k) => { const key = id + ":" + k; if (!c.followed[key] && S.turn >= t + f.delay) sendFollow(o, f, key); }); });
    if (window.Republika) Republika.refresh();
  }
  const waiting = () => D.letters.filter((l) => l.careerOffer && !l.answered).length;
  const fresh = () => PP.careerNew() + waiting();

  // ---------- screen ----------
  const FIRST = (n) => n.replace(/^(Don|Doña|Rev\. Fr\.|Sr\.|Mr\.|Cabo|Lic\.|Dr\.|Fr\.|Comandante|Gen\.) /, "");
  const goLabel = (g) => (g.startsWith("person:") ? "Ask " + FIRST((PP.byKey(g.slice(7)) || { name: "them" }).name).split(" ")[0] : g.startsWith("pol:") ? "See Politics" : "Open");
  const via = (o) => (o.via === "self" ? "Apply" : o.via === "election" ? "By election" : "By appointment") + (o.offer ? " · arrives by letter" : "");
  const leads = (o) => { const g = o.gain || [o.id]; return D.opportunities.filter((x) => x !== o && !D.career.taken[x.id] && !D.career.gone[x.id] && x.tags && x.tags.some((t) => g.includes(t))).map((x) => x.title); };
  function card(o) {
    const ck = PP.careerChecks(o), ok = ck.every((x) => x[0]), self = o.via === "self", lead = leads(o);
    const reqs = ck.map((x) => '<li class="' + (x[0] ? "y" : "n") + '">' + esc(x[1]) + (x[2] ? ' <button class="lnk" data-st="go:' + esc(x[2]) + '">' + esc(goLabel(x[2])) + "</button>" : "") + "</li>").join("");
    const foot = self ? '<button class="pursue" data-st="pursue:' + o.id + '"' + (ok ? "" : " disabled") + ">" + (ok ? (o.becomes ? "Pursue this" : "Do this") : "Requirements not met") + "</button>"
      : offerOpen(o) ? '<p class="await">An offer is waiting for your answer.</p><button class="pursue" data-st="go:letters">Open Letters</button>'
      : '<p class="await">' + (ok ? "You qualify. Word may come by letter." : "Not yet within reach.") + "</p>";
    return '<article class="opp' + (ok ? " ok" : "") + '"><h4>' + esc(o.title) + '</h4><p class="via">' + esc(o.cat || "") + " · " + esc(via(o)) + (o.from && !self ? " · from " + D.months[o.from[1]] + " " + o.from[0] : "") + "</p><p>" + esc(o.sum) + '</p><ul class="req">' + reqs + "</ul>" +
      (o.becomes && o.becomes.pay ? '<p class="st-pay">Puts aside about ₱' + o.becomes.pay + " a month.</p>" : "") + (lead.length ? '<p class="st-lead">May lead on to: ' + esc(lead.slice(0, 2).join("; ")) + "</p>" : "") + foot + "</article>";
  }
  function audiences() {
    const POL = window.RepublikaPolitics; if (!POL) return "";
    return '<ul class="pol-view st-aud">' + Object.keys(POL.AUD).map((a) => '<li><span>' + POL.AUD[a][0] + "</span><b>" + POL.label(a) + '</b><div class="trust"><i style="left:' + (50 + POL.view(a) * 9) + '%"></i></div></li>').join("") + "</ul>";
  }
  function render() {
    const c = D.career.current, ch = S.character, W = band(X.wealth, S.funds), R = band(X.recognition, S.reputation);
    const all = D.opportunities.filter(live); all.forEach((o) => (D.career.seen[o.id] = true));
    const cats = Array.from(new Set(all.map((o) => o.cat).filter(Boolean)));
    if (ST.cat !== "all" && !cats.includes(ST.cat)) ST.cat = "all";
    const shown = all.filter((o) => ST.cat === "all" || o.cat === ST.cat), rd = shown.filter(ready), nr = shown.filter((o) => !ready(o));
    const pips = X.recognition.slice(1).map((_, i) => '<i class="' + (i < R.i ? "on" : "") + '"></i>').join("");
    const known = Object.keys(X.known).filter((k) => (S.public || []).includes(k)).map((k) => X.known[k]);
    const w = waiting(), pay = c.pay ? "Puts aside about ₱" + c.pay + " a month." : "No regular income from this.";
    const chips = ch.quals.map((q) => "<span>" + esc(PP.QL[q] || q) + "</span>").join("");
    const hist = D.career.history.map((h) => "<li><span>" + esc(h.when) + "</span><b>" + esc(h.title) + "</b><small>" + esc(h.note) + "</small></li>").join("");
    return '<div class="pc career st"><header class="pc-top"><div><h2>Career &amp; Personal Standing</h2><p>' + esc(ch.name) + " · " + esc(ch.occupation) + " · age " + (ch.age || 19) + '</p></div><div class="seg"><button data-st="go:letters">Letters' + (w ? " (" + w + ")" : "") + '</button><button data-st="go:people">People</button><button data-st="go:politics">Politics</button></div></header>' +
      '<div class="pc-body"><div class="pc-main">' +
      '<div class="st-strip"><section><small>Means</small><h3>' + esc(W.text) + "</h3><p>₱" + S.funds.toLocaleString("en-US") + " in hand</p><p class=\"st-sub\">" + esc(pay) + '</p></section><section><small>Public recognition</small><h3>' + esc(R.text) + '</h3><div class="st-pips">' + pips + "</div><p class=\"st-sub\">Reputation " + S.reputation + "</p></section></div>" +
      '<section class="cur"><small>Current position</small><h3>' + esc(c.title) + "</h3><p>" + esc(c.employer) + " · " + esc(c.place) + " · since " + esc(c.since) + "</p><p>" + esc(c.note) + "</p></section>" +
      (w ? '<div class="st-alert">' + w + (w === 1 ? " offer awaits" : " offers await") + ' your answer in Letters. <button class="lnk" data-st="go:letters">Open Letters</button></div>' : "") +
      '<h4 class="sec">Opportunities</h4><div class="st-cats"><button data-st="cat:all"' + (ST.cat === "all" ? ' class="on"' : "") + ">All</button>" + cats.map((k) => '<button data-st="cat:' + esc(k) + '"' + (ST.cat === k ? ' class="on"' : "") + ">" + esc(k) + "</button>").join("") + "</div>" +
      (rd.length ? '<h5 class="st-grp">Open to you now</h5><div class="opps">' + rd.map(card).join("") + "</div>" : "") +
      (nr.length ? '<h5 class="st-grp">Within reach, with something missing</h5><div class="opps">' + nr.map(card).join("") + "</div>" : "") +
      (shown.length ? "" : '<p class="empty">Nothing of this kind is open to you at present. Circumstances, introductions and the times change what is possible.</p>') +
      '</div><aside class="pc-side"><div class="pdet"><h4>How you are seen</h4>' + audiences() + '<h4>What is said of you</h4>' + (known.length ? '<ul class="plist st-known">' + known.map((k) => "<li>" + esc(k) + "</li>").join("") + "</ul>" : '<p class="st-sub">Nothing public yet. A quiet life leaves little to report.</p>') +
      '<h4>Qualifications</h4><p class="tr">' + chips + '</p><p class="st-sub">' + ch.experience + " years of working life.</p>" +
      '<h4>Milestones and past work</h4><ol class="mile">' + hist + "</ol></div></aside></div></div>";
  }
  function goTo(g) {
    const [k, id] = g.split(":");
    if (k === "person") { PP.P.sel = id; PP.P.flt = "all"; PP.P.wr = null; return RepublikaScreens.open("people"); }
    if (k === "pol") { const U = RepublikaPolitics.U; U.org = id; U.tab = "orgs"; U.prev = null; return RepublikaScreens.open("politics"); }
    RepublikaScreens.open(k);
  }
  const host = $("screen");
  if (host) host.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-st]"); if (!t || t.disabled) return;
    const i = t.dataset.st.indexOf(":"), k = t.dataset.st.slice(0, i), v = t.dataset.st.slice(i + 1);
    if (k === "cat") { ST.cat = v; return RepublikaScreens.render(); }
    if (k === "pursue") { PP.take(v); return RepublikaScreens.render(); }
    if (k === "go") goTo(v);
  });
  window.RepublikaStanding = { render, sync, fresh, open: () => RepublikaScreens.open("standing") };
  PP.sync(); D.people.forEach((p) => (p.fresh = false));
})();
