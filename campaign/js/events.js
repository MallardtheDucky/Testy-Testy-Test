/* REPUBLIKA event system (lightweight). Events live in EVENTS; the engine checks them each turn,
   writes a Journal entry when one occurs, and records decisions in REPUBLIKA_DATA.history.
   Event: { id, type: "historical"|"personal"|"conditional", title, date?:{day,month,year}, place?, text[],
            when?: { from:[y,m], until:[y,m], tags[], flags[], anyFlags[], notFlags[], minRep, minFunds, after:{event,choice?,delay?} },
            choices?: [{ id, label, note, req?:[tags], outcome, effects:{funds,rep,flags[],rel:{name:n}} }] }
   Months are 0-based. Record of occurrence: D.eventLog[id] = {status:"open"|"decided", turn}. */
(function () {
  const D = window.REPUBLIKA_DATA, S = D.state;
  S.flags = S.flags || []; S.relations = S.relations || {}; D.history = D.history || []; D.eventLog = D.eventLog || {};
  const idx = (a) => a[0] * 12 + a[1], now = () => S.year * 12 + S.month;
  const has = (t) => (S.character.tags || []).includes(t);
  const EVENTS = [
    { id: "fort-santiago", type: "historical", title: "The Prisoner at Fort Santiago", date: { day: 6, month: 6, year: 1892 }, place: "Manila",
      when: { from: [1892, 6], until: [1892, 7] },
      text: ["By evening the whole of Binondo knew that the physician had been taken from the Palace to the fort. No one at the counting house said so aloud; we simply stopped talking about anything else.", "Friends are gathering to pray for him at the church. Others are collecting money for his family. Most are doing nothing, loudly. I must decide which of these I can afford to be."],
      choices: [
        { id: "vigil", text: "I went to the church after work and stood at the back with my hat in my hands. I said no prayer I could not have said in front of the priest. If anyone asks, I went for the prisoner's soul, and that is nearly the whole truth.", label: "Join the prayers at the church", note: "Be seen among the faithful and the curious.", outcome: "You stood at the back with your hat in your hands. Several men nodded to you afterwards, and one wrote your name down, though not for the same reason.", effects: { rep: 2, flags: ["vigil"], public: ["vigil-seen"], rel: { "The Propaganda circle": 1 } } },
        { id: "collect", text: "I left an envelope with a man I did not know, twenty-five pesos I can ill spare, and I gave no name. Money does not need a face, and a clerk's face is better kept out of the matter.", label: "Give quietly to the relief collection", note: "Money does not need a face.", outcome: "You left an envelope with a stranger who asked no questions. It was twenty-five pesos you could ill spare, and no one will ever know it was you.", effects: { funds: -25, rep: 1, flags: ["quiet-donor"] } },
        { id: "stay", text: "I kept to my ledger today and said nothing about the fort. It is no shame to want to keep one's place, I tell myself. I will tell myself so again tomorrow.", label: "Keep to your post and say nothing", note: "A clerk who is not noticed keeps his place.", outcome: "You kept your head down and your ledger open. Your employer approved. A friend did not mention it, which was worse.", effects: { rep: -1, flags: ["kept-clear"] } }
      ] },
    { id: "better-stool", type: "personal", title: "A Better Stool at the Counting House", place: "Binondo",
      when: { from: [1892, 7], tags: ["clerk"], notFlags: ["kept-clear-promo"] },
      text: ["Don Eusebio has offered me the second desk, the one by the window, with the keys to the strongroom. It means a raise, and it means being trusted with the very books he says are wrong.", "It is the first real step up I have been offered. I cannot tell whether it is a reward or a tether."],
      choices: [
        { id: "accept", text: "I told Don Eusebio I would take the window desk and the keys. A steadier wage, and a closer look at the very books he says are wrong. I shall keep my eyes open and my mouth shut.", label: "Accept the desk and the keys", note: "A steadier wage, and a closer look at the accounts.", outcome: "You moved to the window desk on Monday. The pay is better by sixty pesos a quarter, and the strongroom keys are heavier than they look.", effects: { funds: 60, rep: 1, flags: ["strongroom-keys"], rel: { "Don Eusebio Maranan": 1, "Don Ramón Estrada": -1 } } },
        { id: "decline", text: "I thanked Don Eusebio and said I would rather keep my stool. Some doors are best left shut, and I am not yet sure what is behind this one.", label: "Decline, and stay where you are", note: "Some doors are best left closed.", outcome: "You thanked him and kept your stool. He said he understood, in the voice of a man who does.", effects: { rel: { "Don Eusebio Maranan": -1 } } }
      ] },
    { id: "knock-after-curfew", type: "conditional", title: "A Knock After Curfew", place: "Tondo",
      when: { from: [1892, 7], anyFlags: ["vigil", "ilaya-meeting"], notFlags: ["kept-clear"] },
      text: ["Two men of the Guardia Civil called at the house after the lamps were lit. They were polite about it. They said they were making a list of persons who attended certain gatherings, and that it was a courtesy to give them a chance to explain themselves.", "My mother held the door. I could hear her breathing."],
      choices: [
        { id: "calm", text: "I gave the guardia tea and the truth, in that order, and said no more than was asked. I attended what I attended, and I will not pretend otherwise. My mother has not spoken to me since.", label: "Answer them plainly and with courtesy", note: "Say what is true and no more.", outcome: "You gave them tea and the truth, in that order. They wrote something down and left. Your mother did not speak to you until Sunday.", effects: { rep: 1, flags: ["known-to-guardia"], rel: { "Cabo Isidoro Ferrer": 1 } } },
        { id: "cédula", text: "I showed my cédula, which was in order, and told them I know nothing. It was a lie of omission, and a small one. They looked at the house a long while before they left.", label: "Show your cédula and say you know nothing", note: "A clerk with papers in order.", outcome: "Your papers were in order, and so, you hope, was your face. They left without a word, but they looked at the house a long time.", effects: { rep: -1, flags: ["known-to-guardia"] } }
      ] }
  ];
  const get = (id) => EVENTS.find((e) => e.id === id);
  function ok(ev) {
    const w = ev.when || {}, n = now(), f = (x) => S.flags.includes(x);
    if (D.eventLog[ev.id]) return false;
    if (w.from && n < idx(w.from)) return false;
    if (w.until && n > idx(w.until)) return false;
    if (w.tags && !w.tags.some(has)) return false;
    if (w.flags && !w.flags.every(f)) return false;
    if (w.anyFlags && !w.anyFlags.some(f)) return false;
    if (w.notFlags && w.notFlags.some(f)) return false;
    if (w.minRep != null && S.reputation < w.minRep) return false;
    if (w.minFunds != null && S.funds < w.minFunds) return false;
    if (w.after) { const h = D.history.find((x) => x.event === w.after.event && (!w.after.choice || x.choice === w.after.choice)); if (!h || S.turn < h.turn + (w.after.delay || 0)) return false; }
    return true;
  }
  const label = (ev) => ev.date ? ev.date.day + " " + D.months[ev.date.month] + " " + ev.date.year : "8 " + D.months[S.month] + " " + S.year;
  /** Call each turn: opens any event whose conditions are now met and writes its journal entry. */
  function check() {
    EVENTS.forEach((ev) => {
      if (!ok(ev)) return;
      D.eventLog[ev.id] = { status: ev.choices ? "open" : "decided", turn: S.turn };
      if (window.RepublikaPeople) RepublikaPeople.sync();
      D.journal.unshift({ date: label(ev), place: ev.place || "", unread: true, title: ev.title, body: ev.text.slice(), ev: ev.id });
    });
  }
  const fx = (e) => [e.funds ? "₱" + (e.funds > 0 ? "+" : "−") + Math.abs(e.funds) : "", e.rep ? "Reputation " + (e.rep > 0 ? "+" : "−") + Math.abs(e.rep) : ""]
    .concat(Object.entries(e.rel || {}).map(([k, v]) => k + " " + (v > 0 ? "+" : "−") + Math.abs(v))).filter(Boolean);
  function decide(id, cid) {
    const ev = get(id), ch = ev && ev.choices.find((c) => c.id === cid), log = D.eventLog[id];
    if (!ch || !log || log.status !== "open") return null;
    const e = ch.effects || {};
    S.funds += e.funds || 0; S.reputation += e.rep || 0;
    (e.flags || []).forEach((f) => !S.flags.includes(f) && S.flags.push(f));
    (e.public || []).forEach((f) => window.RepublikaNews && RepublikaNews.reveal(f));
    Object.entries(e.rel || {}).forEach(([k, v]) => { S.relations[k] = (S.relations[k] || 0) + v; if (window.RepublikaPeople) RepublikaPeople.adjust(k, v, ch.label); });
    log.status = "decided"; log.choice = cid;
    const rec = { event: id, type: ev.type, title: ev.title, date: label({}) , turn: S.turn, choice: cid, label: ch.label, written: ch.text, outcome: ch.outcome, effects: fx(e) };
    D.history.unshift(rec);
    const en = D.journal.find((j) => j.ev === id); if (en) en.decided = rec;
    document.dispatchEvent(new CustomEvent("republika:decision", { detail: rec }));
    if (window.Republika) Republika.refresh();
    return rec;
  }
  /** Choices open to this character (a choice may carry req: [tags]). */
  const choices = (ev) => (ev.choices || []).filter((c) => !c.req || c.req.some(has));
  const pending = () => Object.values(D.eventLog).filter((l) => l.status === "open").length;
  // An accepted letter invitation (option.action.id) becomes a flag that events can test.
  document.addEventListener("republika:letter", (e) => { const a = e.detail.action; if (a && a.id && !S.flags.includes(a.id)) S.flags.push(a.id); });
  window.RepublikaEvents = { EVENTS, get, check, decide, choices, pending, ok };
  check();
})();
