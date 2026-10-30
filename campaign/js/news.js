/* REPUBLIKA newspaper system. STORIES are public developments; each paper FRAMES a story its own way
   (or ignores it). The engine publishes available stories each turn into D.newspaper[*].articles.
   Story: { id, topic, date?:{day,month,year}, when?, frames:{ <paperId>: {label, head, deck, body[]} } }
   topic: admin | reform | society | local | economy | world | controversy | history
   label (per paper, so the same event can be "Reported" in one paper and "Rumor" in another): fact | opinion | rumor
   paperId = a paper's cls without "n-": porvenir, mercantil, reformista, boletin, courier, hoja
   when: { from:[y,m], until:[y,m], known:[publicFlags], notKnown:[...], after:{event,choice?,delay?}, minRep }
   known/notKnown use S.public (what the public knows), NOT private journal flags; a decision makes something public
   with choice.effects.public: ["flag"] or RepublikaNews.reveal("flag"). D.newsLog[id] records publication. */
(function () {
  const D = window.REPUBLIKA_DATA, S = D.state, TODAY = 8;
  S.public = S.public || []; D.newsLog = D.newsLog || {};
  const TOPICS = { admin: "Colonial administration", reform: "Reformist politics", society: "Philippine society", local: "Local incident", economy: "Economy", world: "International", controversy: "Controversy", history: "Historical" };
  const LABELS = { fact: "Reported", opinion: "Opinion", rumor: "Rumor" };
  const STORIES = [
    { id: "dapitan-decree", topic: "history", date: { day: 15, month: 6, year: 1892 }, frames: {
      porvenir: { label: "fact", head: "Dr. Rizal to Reside at Dapitan", deck: "By superior decree, for reasons of public order", body: ["By decree of the Governor-General, Dr. D. José Rizal is to be conveyed to the district of Dapitan in Mindanao, there to reside under the supervision of the authorities.", "The measure is described as one of prudence and not of punishment."] },
      reformista: { label: "opinion", head: "Banishment Without Trial Is Not Government", deck: "On the removal of a citizen by decree", body: ["A man is carried to a distant coast, and no court has heard him. We ask which law it is that permits this, and we expect no answer."] },
      courier: { label: "fact", head: "Rizal Sent to Mindanao", deck: "Steamer left Manila under guard", body: ["The Philippine physician and author has been despatched to a remote station on the Mindanao coast. Friends were not permitted at the quay."] },
      hoja: { label: "rumor", head: "They Say the Ship Sailed by Night", deck: "", body: ["Nobody saw it go, and nobody will say who did. Remember the hour, and remember who gave the order."] } } },
    { id: "tondo-fire", topic: "local", date: { day: 12, month: 6, year: 1892 }, frames: {
      porvenir: { label: "fact", head: "Fire in Tondo: Eleven Houses Lost", deck: "No lives reported lost; cause under inquiry", body: ["A fire broke out near the Calle Velasquez shortly after midnight and consumed eleven houses of light material before it was brought under control by the neighbours and the firemen.", "The Alcalde has opened an inquiry. The cause is thought to be a careless lamp."] },
      boletin: { label: "opinion", head: "Charity for the Homeless of Tondo", deck: "The faithful are called to give", body: ["The parish asks that every household remember its neighbours who have lost all. Alms may be left with the sacristan."] },
      hoja: { label: "rumor", head: "A Lamp, They Tell Us", deck: "", body: ["The families say there was no lamp lit in that house. The families were not asked."] } } },
    { id: "steamer-delay", topic: "world", date: { day: 25, month: 6, year: 1892 }, frames: {
      mercantil: { label: "fact", head: "Mail Steamer Delayed at Hong Kong", deck: "Cargo for Iloilo and Cebu held over", body: ["The mail steamer is delayed three days by weather on the China coast. Consignees are advised that freight will be received at the Muelle on the new date.", "Hemp, Class I, per picul|$11.80"] },
      courier: { label: "fact", head: "Typhoon Signal Hoisted at the Peak", deck: "Shipping detained in the harbour", body: ["Several steamers bound for Manila and Saigon remain at anchor. The Observatory expects improvement by the end of the week."] } } },
    { id: "league-talk", topic: "reform", date: { day: 28, month: 6, year: 1892 }, frames: {
      courier: { label: "rumor", head: "A League of Filipinos Whispered in Manila", deck: "Our correspondent cannot confirm", body: ["It is said in the capital that a society of Filipino gentlemen, devoted to mutual aid and to reform, has lately been formed. The authorities have not commented, and we cannot vouch for it."] },
      boletin: { label: "opinion", head: "Beware the Society Without a Name", deck: "A pastoral reflection", body: ["The faithful should ask what is done behind closed doors, and by whom. Charity does not require secrecy."] },
      hoja: { label: "rumor", head: "Have You Heard of the League?", deck: "", body: ["Some say there is a brotherhood, some say there are only men who talk. Ask no one. Watch who asks you."] } } },
    { id: "vigil-names", topic: "controversy", when: { from: [1892, 7], known: ["vigil-seen"] }, frames: {
      porvenir: { label: "fact", head: "Gathering at the Church Passes Without Disorder", deck: "The Comandancia notes those present", body: ["The assembly of the faithful on the evening of the 6th dispersed quietly. It is understood that the authorities took note of certain persons who attended."] },
      boletin: { label: "opinion", head: "Prayer Is Not a Demonstration", deck: "A word to the parishes", body: ["The Church prays for all her children. She asks only that her churches not be made a theatre for political feeling."] },
      hoja: { label: "rumor", head: "They Are Writing Down Who Prayed", deck: "", body: ["A man with a notebook stood by the door. If you were there, you are on his list. If you were not, you are on another."] } } },
    { id: "hemp-prices", topic: "economy", date: { day: 2, month: 7, year: 1892 }, frames: {
      mercantil: { label: "fact", head: "Hemp Firm on Short Supply", deck: "Sugar easier; rice steady", body: ["Rice, per cavan|$2.30", "Sugar, per picul|$4.00", "Hemp, Class I, per picul|$12.20", "Exporters report buyers pressing for early shipment."] },
      porvenir: { label: "fact", head: "The Port Reports Brisk Trade", deck: "Customs receipts above the month before", body: ["The Customs House reports receipts above those of the previous month, an encouraging sign for the commerce of the islands."] } } }
  ];
  const LEGACY = { "Dr. Rizal Detained by Order of the Governor-General": ["admin", "fact"], "The Guardia Civil Reinforced in Cavite": ["admin", "fact"], "Arrival of Dr. Rizal in the Capital": ["history", "fact"], "Prices Current at the Port": ["economy", "fact"], "Merchants Uneasy at the Arrest": ["economy", "fact"], "A Prudent Man Is Not a Danger to the State": ["reform", "opinion"], "The Cortes and the Colony: A Silence of Years": ["reform", "opinion"], "Pastoral Reminder on Secret Societies": ["society", "fact"], "Feast of the Visitation: Order of Processions": ["society", "fact"], "Manila Notes: A Quiet Capital?": ["admin", "fact"], "Filipino Exiles in Hong Kong: Their Numbers Grow": ["world", "fact"], "To the Sons of the Country": ["controversy", "opinion"] };
  D.newspaper.forEach((p) => p.articles.forEach((a) => { const l = LEGACY[a.head]; if (l && !a.topic) { a.topic = l[0]; a.label = l[1]; } }));
  const now = () => S.year * 12 + S.month, known = (f) => S.public.includes(f), paper = (id) => D.newspaper.find((p) => p.cls === "n-" + id);
  const when = (st) => st.date ? st.date.year * 12 + st.date.month : now();
  function available(st) {
    const w = st.when || {}, d = st.date;
    if (D.newsLog[st.id]) return false;
    if (d && (now() < when(st) || (now() === when(st) && d.day > TODAY))) return false;
    if (w.from && now() < w.from[0] * 12 + w.from[1]) return false;
    if (w.until && now() > w.until[0] * 12 + w.until[1]) return false;
    if (w.known && !w.known.every(known)) return false;
    if (w.notKnown && w.notKnown.some(known)) return false;
    if (w.minRep != null && S.reputation < w.minRep) return false;
    if (w.after) { const h = D.history.find((x) => x.event === w.after.event && (!w.after.choice || x.choice === w.after.choice)); if (!h || S.turn < h.turn + (w.after.delay || 0)) return false; }
    return true;
  }
  /** Call each turn: publishes every story whose conditions are met, framed by each paper that covers it. */
  function publish() {
    let n = 0;
    STORIES.forEach((st) => {
      if (!available(st)) return;
      D.newsLog[st.id] = { turn: S.turn };
      const label = st.date ? st.date.day + " " + D.months[st.date.month] + " " + st.date.year : "8 " + D.months[S.month] + " " + S.year;
      Object.entries(st.frames).forEach(([id, f]) => {
        const p = paper(id); if (!p) return;
        p.articles.unshift({ story: st.id, date: id === "hoja" ? "No date" : label, topic: st.topic, label: f.label, unread: when(st) >= now(), head: f.head, deck: f.deck || "", body: f.body.slice() });
        if (p.articles.length > 10) p.articles.length = 10; n++;
      });
    });
    return n;
  }
  /** Make something publicly known so conditional stories can use it. */
  const reveal = (flag) => { if (!known(flag)) S.public.push(flag); };
  window.RepublikaNews = { STORIES, TOPICS, LABELS, publish, reveal, available };
  publish();
})();
