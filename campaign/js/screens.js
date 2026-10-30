/* Letters, Journal and Newspaper full-screen views (1892). Reads REPUBLIKA_DATA.letters / .journal / .newspaper. */
(function () {
  const D = window.REPUBLIKA_DATA;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const rich = (s) => esc(s).replace(/~~(.+?)~~/g, '<s class="sx">$1</s>').replace(/__(.+?)__/g, '<u class="ul">$1</u>');
  const S = { dk: 0, cur: null, letters: 0, journal: 0, newspaper: 0, tab: "diary" };
  const char = () => D.state.character;
  const vis = () => D.letters.filter((l) => !l.req || l.req.some((t) => (char().tags || []).includes(t)));
  const monthOf = (n) => { const m = D.state.month + n; return D.months[m % 12] + " " + (D.state.year + Math.floor(m / 12)); };
  const today = () => "8 " + monthOf(0);
  const unread = (k) => k === "letters" ? vis().filter((x) => x.unread).length : k === "newspaper" ? D.newspaper.reduce((n, p) => n + p.articles.filter((a) => a.unread).length, 0) : D[k].filter((x) => x.unread).length;
  const KIND = { hand: "Manuscrito", quick: "Manuscrito", type: "A máquina", tg: "Telegrama" };
  const ICON = {
    letters: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="M4 7l8 6 8-6"/></svg>',
    journal: '<svg viewBox="0 0 24 24"><path d="M12 6c-2-1.5-5-2-8-1.500v13c3-.5 6 0 8 1.500 2-1.500 5-2 8-1.500v-13c-3-.5-6 0-8 1.500zM12 6v13"/></svg>'
  };

  function sheet(c) {
    const k = c.kind || "hand", cls = "letter paper k-" + k + " p-" + (c.paper || "cream");
    const seal = c.seal ? '<i class="seal-w">' + esc(c.seal) + "</i>" : "";
    if (k === "tg") {
      const t = c.tg || {};
      return '<article class="' + cls + '"><header class="tgh">Telégrafos del Estado<small>Nº ' + esc(t.no || "") + " · Words " + esc(t.words || "") + " · Handed in " + esc(t.time || "") + " · " + esc(c.date) +
        '</small></header><div class="body tg-body"><p class="tgfrom">From: ' + esc(c.place) + "</p><p>" + c.body.map((w) => '<span class="st">' + esc(w) + "</span>").join(" ") + "</p></div></article>";
    }
    const pm = c.postmark ? '<div class="pm"><b>' + esc(c.postmark[0]) + "</b><span>" + esc(c.postmark[1]) + "</span></div>" : "";
    const lh = c.letterhead ? '<header class="lh"><b>' + esc(c.letterhead.name) + "</b><span>" + esc(c.letterhead.sub) + "</span></header>" : "";
    const ref = k === "type" ? '<div class="dateline">Our ref: ' + esc(c.ref) + "<br>" + esc(c.place) + ", " + esc(c.date) + "</div>" : '<div class="dateline">' + esc(c.place) + "<br>" + esc(c.date) + "</div>";
    return "<article class=\"" + cls + '">' + seal + pm + lh + ref + '<p class="sal">' + esc(c.salutation) + '</p><div class="body">' + c.body.map((p) => "<p>" + esc(p) + "</p>").join("") + "</div>" +
      (c.close ? '<p class="close">' + esc(c.close) + "</p>" : "") + '<p class="sign">' + esc(c.sign) + "<small>" + esc(c.role) + "</small></p>" + (k === "quick" ? '<i class="blot"></i>' : "") + "</article>";
  }

  const avail = (c) => c.opts && c.opts.filter((x) => !x.req || x.req.some((t) => (char().tags || []).includes(t)));
  const awaiting = () => vis().filter((l) => !l.answered && avail(l) && avail(l).length).length;
  const turn = () => D.state.turn;
  const pend = () => D.outbox.filter((o) => o.reply && turn() < o.due);
  const status = (o) => turn() < o.delivers ? "In transit · arrives " + o.arrivesLabel : o.reply && turn() < o.due ? "Delivered · reply expected " + o.dueLabel : "Delivered";
  const meta = (rows) => '<dl class="lmeta">' + rows.map((r) => "<div><dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>").join("") + "</dl>";
  function sentSheet(o) { return '<article class="letter paper k-hand p-cream"><div class="dateline">' + esc(o.written) + '</div><p class="sal">' + esc(o.sal) + '</p><div class="body"><p>' + esc(o.body) + '</p></div><p class="sign">' + esc(char().name) + "<small>" + esc(char().occupation) + "</small></p></article>"; }
  function responses(c) {
    if (c.answered) return '<div class="resp done">You replied: <em>' + esc(c.answered) + "</em> · " + esc(c.answeredOn) + "</div>";
    if (!avail(c) || !avail(c).length) return '<div class="resp done">No reply is expected.</div>';
    const o = S.opt != null && S.optFor === c.ref ? avail(c)[S.opt] : null;
    const btns = avail(c).map((x, i) => '<button class="opt' + (o === x ? " on" : "") + '" data-opt="' + i + '">' + esc(x.label) + "</button>").join("");
    const draft = o ? '<article class="letter paper k-hand p-cream draft"><div class="dateline">' + today() + '</div><p class="sal">To ' + esc(c.from) + ',</p><div class="body"><p>' + esc(o.text) + '</p></div><p class="sign">' + esc(char().name) + '</p></article><div class="sendrow"><span>' + (o.funds ? "Cost: ₱" + Math.abs(o.funds) + " · " : "") + "Delivery: " + (c.far ? "two months" : "next month") + '</span><button class="send" data-send="1">Seal &amp; send</button></div>' : "";
    return '<div class="resp"><h4>Your reply</h4><p class="hint">Choose a response to see what you would write.</p><div class="opts">' + btns + "</div>" + draft + "</div>";
  }
  function send(c, o) {
    const far = c.far ? 2 : 1, dl = o.in || (c.far ? 3 : 2), n = D.outbox.length + 1;
    const it = { ref: "OUT-92-" + (100 + n), to: c.from, subject: "Re: " + c.subject.replace(/^Re: /, ""), written: today(), sal: "To " + c.from + ",", body: o.text, label: o.label, re: c.ref, delivers: turn() + far, arrivesLabel: monthOf(far), due: turn() + dl, dueLabel: monthOf(dl), reply: !!o.reply };
    if (o.reply) it.replyLetter = { ref: "CORR-92-" + (110 + n), unread: true, kind: c.kind === "tg" ? "quick" : c.kind, paper: c.paper, letterhead: c.letterhead, seal: c.seal, far: c.far, subject: "Re: " + c.subject.replace(/^Re: /, ""), from: c.from, role: c.role, place: c.place, date: "20 " + monthOf(dl - 1), salutation: c.salutation || "Estimado amigo,", body: [o.reply], sign: (c.sign && c.sign !== "—" ? c.sign : c.from) };
    D.outbox.unshift(it); c.answered = o.label; c.answeredOn = today(); S.opt = null;
    D.state.funds += o.funds || 0; D.state.reputation += o.rep || 0;
    document.dispatchEvent(new CustomEvent("republika:letter", { detail: { letter: c.ref, from: c.from, option: o.label, action: o.action || null, outbox: it } }));
  }
  /** Called each turn: moves due replies into the inbox. */
  function deliver() { D.outbox.forEach((o) => { if (o.replyLetter && !o.done && turn() >= o.due) { o.done = true; o.replyLetter.recv = today(); if (o.resolve && window.RepublikaPeople) RepublikaPeople.resolve(o.resolve); D.letters.unshift(o.replyLetter); document.dispatchEvent(new CustomEvent("republika:delivered", { detail: { letter: o.replyLetter.ref, from: o.replyLetter.from } })); } }); sortInbox(); S.letters = 0; }
  const when = (l) => Date.parse(l.recv || l.date) || 0;
  function sortInbox() { D.letters.sort((a, b) => when(b) - when(a)); }

  function letters() {
    const box = S.box || "inbox", L = vis(), P = pend();
    const tabs = [["inbox", "Inbox"], ["sent", "Sent"], ["pending", "Pending"]].map((t) => '<button class="ltab' + (box === t[0] ? " on" : "") + '" data-box="' + t[0] + '">' + t[1] + (t[0] === "pending" && P.length ? " <b>" + P.length + "</b>" : "") + (t[0] === "inbox" && L.some((x) => x.unread) ? " <i></i>" : "") + "</button>").join("");
    let list, main = "";
    if (box === "inbox") {
      const c = L[S.letters]; if (c) c.unread = false;
      list = L.length ? L.map((l, k) => '<li><button class="slip' + (k === S.letters ? " sel" : "") + '" data-k="' + k + '"><span class="ref">' + esc(l.ref) + " · " + KIND[l.kind || "hand"] + "</span>" + (l.unread ? '<em class="stamp">Nueva</em>' : "") + "<strong>" + esc(l.subject) + '</strong><span class="meta">' + esc(l.from) + '</span><span class="meta dts">Written ' + esc(l.date) + " · Received " + esc(l.recv || l.date) + "</span>" + (l.answered ? '<span class="tag">Replied: ' + esc(l.answered) + "</span>" : avail(l) && avail(l).length ? '<span class="tag due">Awaiting your reply</span>' : "") + "</button></li>").join("") : '<li class="empty">No letters have arrived.</li>';
      if (c) main = '<div class="lcol">' + meta([["From", c.from + (c.role ? ", " + c.role : "")], ["To", char().name + ", " + char().occupation], ["Written", c.date + (c.place ? " · " + c.place : "")], ["Received", c.recv || c.date]]) + sheet(c) + responses(c) + "</div>";
    } else {
      const O = box === "sent" ? D.outbox : P, o = O[S.sent] || O[0];
      list = O.length ? O.map((x, k) => '<li><button class="slip' + (x === o ? " sel" : "") + '" data-sk="' + k + '"><span class="ref">' + esc(x.ref) + " · " + esc(x.label) + "</span><strong>" + esc(x.subject) + '</strong><span class="meta">To ' + esc(x.to) + '</span><span class="meta dts">' + esc(status(x)) + "</span></button></li>").join("") : '<li class="empty">' + (box === "sent" ? "You have not sent any letters." : "No replies are pending.") + "</li>";
      if (o) main = '<div class="lcol">' + meta([["To", o.to], ["Written", o.written], ["Delivery", status(o)], ["In reply to", o.re]]) + sentSheet(o) + "</div>";
    }
    return '<div class="desk"><aside class="ledger paper"><header><span class="ico">' + ICON.letters + "</span><div><h2>Registro de Correspondencia</h2><p>" + esc(char().name) + " · " + esc(char().occupation) + '</p></div></header><div class="ltabs">' + tabs + "</div><ul>" + list + "</ul></aside>" + main + "</div>";
  }

  function journal() {
    const J = D.journal, e = J[S.journal];
    if (e) e.unread = false;
    const tabs = [["diary", "Diary"], ["decisions", "Decisions"], ["vows", "Vows"]]
      .map((t) => '<button class="tab' + (S.tab === t[0] ? " on" : "") + '" data-tab="' + t[0] + '">' + t[1] + "</button>").join("");
    let left, right;
    if (S.tab === "diary") {
      left = '<div class="hd"><span class="ico">' + ICON.journal + "</span><div><h2>Diario</h2><p class=\"sub\">Private journal · " + esc(D.state.character.name) + " · " + D.state.year + "</p></div></div><ul class=\"entries\">" +
        J.map((x, k) => '<li><button class="entry' + (k === S.journal ? " sel" : "") + '" data-k="' + k + '"><time>' + esc(x.date) + "</time><span>" + esc(x.title) + "</span>" + (x.unread ? "<i></i>" : "") + "</button></li>").join("") + "</ul>";
      right = e ? '<div class="eyebrow">' + esc(e.place) + " · " + esc(e.date) + '</div><h3 class="etitle">' + esc(e.title) + '</h3><div class="ebody">' + e.body.map((p) => "<p>" + rich(p) + "</p>").join("") + '</div>'+decBlock(e)+'<div class="pageno">— ' + (J.length - S.journal) + " —</div><i class=\"ring\"></i>" : "";
    } else if (S.tab === "decisions") {
      const H = D.history, h = H[S.dk] || H[0];
      left = '<div class="hd"><span class="ico">' + ICON.journal + "</span><div><h2>Decisions</h2><p class=\"sub\">What you chose, and what came of it</p></div></div><ul class=\"entries\">" + (H.length ? H.map((x, k) => '<li><button class="entry' + (x === h ? " sel" : "") + '" data-dk="' + k + '"><time>' + esc(x.date) + "</time><span>" + esc(x.title) + "</span></button></li>").join("") : '<li class="empty">No decisions have been recorded yet.</li>') + "</ul>";
      right = h ? '<div class="eyebrow">' + esc(h.type) + " event · " + esc(h.date) + '</div><h3 class="etitle">' + esc(h.title) + '</h3><div class="dec done"><h4>' + esc(h.label) + '</h4><div class="ebody jwrit"><p>' + esc(h.written || "") + '</p></div><p class="out">' + esc(h.outcome) + '</p><p class="chips">' + h.effects.map((c) => "<span>" + esc(c) + "</span>").join("") + "</p></div>" : '<p class="empty">Decisions you make will be recorded here.</p>';
    } else {
      const name = "Vows";
      left = '<div class="hd"><h2>' + name + '</h2></div><p class="empty">This section has not been written yet.</p>';
      right = '<p class="empty">Placeholder — dedicated module to follow.</p>';
    }
    return '<div class="book"><nav class="tabs">' + tabs + '</nav><section class="page left">' + left + '</section><section class="page right">' + right + "</section></div>";
  }

  function decBlock(e) {
    if (!e.ev || !window.RepublikaEvents) return "";
    const ev = RepublikaEvents.get(e.ev), r = e.decided;
    if (r) return '<div class="dec done"><h4>Decision recorded</h4><p class="dl">You wrote:</p><div class="ebody jwrit"><p>' + esc(r.written || r.label) + '</p></div><p class="out">' + esc(r.outcome) + '</p><p class="chips">' + r.effects.map((c) => "<span>" + esc(c) + "</span>").join("") + "</p></div>";
    const C = RepublikaEvents.choices(ev); if (!C.length) return "";
    const pick = S.jev === ev.id ? C.find((c) => c.id === S.jch) : null;
    return '<div class="dec"><h4>A decision is required</h4><p class="hint">Choose how to act to see what you would write.</p><div class="jopts">' + C.map((c) => '<button class="copt' + (c === pick ? " on" : "") + '" data-ch="' + esc(c.id) + '" data-ev="' + esc(ev.id) + '">' + esc(c.label) + "</button>").join("") + "</div>" +
      (pick ? '<div class="jdraft"><div class="ebody"><p>' + esc(pick.text) + '</p></div><div class="sendrow"><span>Entry for ' + today() + '</span><button class="send" data-jsend="1">Write &amp; record</button></div></div>' : "") + "</div>";
  }
  const row = (l) => { const p = l.split("|"); return p.length > 1 ? '<p class="pr"><span>' + esc(p[0]) + "</span><i></i><span>" + esc(p[1]) + "</span></p>" : "<p>" + esc(l) + "</p>"; };
  const art = (a, lead) => '<article class="nart' + (lead ? " lead" : "") + '"><div class="ndate">' + esc(a.date) + (a.topic ? " · " + esc(RepublikaNews.TOPICS[a.topic]) : "") + (a.label ? ' <em class="lbl lbl-' + a.label + '">' + RepublikaNews.LABELS[a.label] + "</em>" : "") + (a.unread ? ' <em class="nnew">New</em>' : "") + "</div><h2>" + esc(a.head) + "</h2>" + (a.deck ? '<p class="ndeck">' + esc(a.deck) + "</p>" : "") + a.body.map(row).join("") + "</article>";
  function newspaper() {
    const P = D.newspaper, cur = P[S.newspaper] || P[0];
    const rail = P.map((p, k) => { const n = p.articles.filter((a) => a.unread).length;
      return '<button class="pp ' + p.cls + (p === cur ? " on" : "") + '" data-k="' + k + '"><span>' + esc(p.name) + "</span>" + (n ? "<b>" + n + "</b>" : "") + "</button>"; }).join("");
    const lead = cur.articles[0], rest = cur.articles.slice(1);
    const edNo = (D.state.turn * 3 + P.indexOf(cur)) + 40;
    const body = art(lead, true) + (rest.length ? '<div class="ncols">' + rest.map((a) => art(a)).join("") + "</div>" : "");
    cur.articles.forEach((a) => (a.unread = false));
    return '<div class="reader"><nav class="rail-n"><h3>News</h3>' + rail + '</nav><section class="npane paper ' + cur.cls + '"><header class="nmast"><h1>' + esc(cur.name) + "</h1><p>" + esc(cur.tag) + '</p></header><div class="ndl"><span>' + esc(cur.place) + "</span><span>Año " + (D.state.year - 1850) + " · Núm. " + edNo + "</span><span>" + esc(lead.date) + "</span></div>" + body + "</section></div>";
  }

  function render() {
    const host = $("screen"), inner = $("screen-inner"), same = S.drawn === S.cur && !host.hidden, top = host.scrollTop, pos = [];
    const se = document.scrollingElement || document.documentElement, pageY = se.scrollTop, winY = window.scrollY;
    if (same) { inner.style.minHeight = inner.offsetHeight + "px"; inner.querySelectorAll("*").forEach((e, i) => { if (e.scrollTop) pos.push([i, e.scrollTop]); }); } // keep scroll positions on re-render
    inner.innerHTML = { letters, journal, newspaper, people: () => RepublikaPeople.renderPeople(), career: () => RepublikaStanding.render(), standing: () => RepublikaStanding.render(), politics: () => RepublikaPolitics.render() }[S.cur]();
    S.drawn = S.cur;
    if (same) {
      const restore = () => { const els = inner.querySelectorAll("*"); pos.forEach(([i, t]) => { if (els[i]) els[i].scrollTop = t; }); host.scrollTop = top; se.scrollTop = pageY; window.scrollTo(0, winY); };
      restore(); inner.style.minHeight = ""; restore(); requestAnimationFrame(restore);
    }
    if (S.cur === "people") RepublikaPeople.after();
    $("screen").dataset.view = S.cur;
    if (window.Republika) Republika.refresh();
  }
  function open(k) {
    if (k === "career") k = "standing"; // Career and Personal Standing are one section
    S.cur = k; render(); $("screen").hidden = false; $("screen").scrollTop = 0;
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.panel === k));
  }
  function close() {
    $("screen").hidden = true; S.cur = null; S.drawn = null;
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    if (window.Republika) Republika.refresh();
  }
  /** Adds one placeholder story to every paper each turn, in that paper's voice; replace with real generated news later. */
  const VOICE = [
    (h) => ({ head: h, deck: "From our correspondents in the capital and the provinces", body: ["Our readers will find the particulars in due course. The press, as always, is at the pleasure of the censor."] }),
    () => ({ head: "Port and Exchange: The Week in Brief", deck: "Freight, hemp and the mail steamer", body: ["Rice, per cavan|$2.30", "Hemp, Class I, per picul|$11.50", "Business is steady, though buyers are cautious."] }),
    () => ({ head: "The Government Explains Nothing", deck: "A view from Madrid", body: ["We note the latest announcement from Manila and wait, as ever, for the reasons behind it."] }),
    () => ({ head: "Notice to the Faithful", deck: "From the Archbishop’s Palace", body: ["The clergy are reminded to counsel obedience and to report to their superiors any unusual gathering in their parish."] }),
    (h) => ({ head: "Manila Letter: " + h.replace(/\.$/, ""), deck: "From our own correspondent", body: ["The city is outwardly calm. Whether it will stay so is a question put to us, more than once, by men with no interest in the answer."] }),
    () => ({ head: "Count the Days", deck: "", body: ["Another month, another list of names the authorities would like to learn. Keep your own counsel, and keep it short."] })
  ];
  function newEdition(dateLabel, headline) {
    D.newspaper.forEach((p, k) => {
      const v = VOICE[k % VOICE.length](headline);
      p.articles.unshift({ date: p.cls === "n-hoja" ? "No date" : dateLabel, unread: true, head: v.head.replace(/\.$/, ""), deck: v.deck, body: v.body });
      if (p.articles.length > 6) p.articles.length = 6;
    });
  }
  $("screen").addEventListener("click", (ev) => {
    const t = ev.target.closest("button"); if (!t) return;
    if (t.id === "screen-close") return close();
    if (t.dataset.box) { S.box = t.dataset.box; S.sent = 0; S.opt = null; return render(); }
    if (t.dataset.sk !== undefined) { S.sent = +t.dataset.sk; return render(); }
    if (t.dataset.opt !== undefined) { const c = vis()[S.letters]; S.opt = +t.dataset.opt; S.optFor = c.ref; return render(); }
    if (t.dataset.send) { const c = vis()[S.letters]; send(c, avail(c)[S.opt]); return render(); }
    if (t.dataset.k !== undefined && S.cur === "letters") { S.letters = +t.dataset.k; S.opt = null; return render(); }
    if (t.dataset.ch) { S.jev = t.dataset.ev; S.jch = t.dataset.ch; return render(); }
    if (t.dataset.jsend) { RepublikaEvents.decide(S.jev, S.jch); S.jch = null; return render(); }
    if (t.dataset.dk !== undefined) { S.dk = +t.dataset.dk; return render(); }
    if (t.dataset.tab) { S.tab = t.dataset.tab; return render(); }
    if (t.dataset.k !== undefined) { S[S.cur] = +t.dataset.k; render(); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("screen").hidden) close(); });

  window.RepublikaScreens = { has: (k) => ["letters", "journal", "newspaper", "people", "career", "standing", "politics"].includes(k), render, open, close, unread, awaiting, newEdition, deliver, sortInbox };
})();
