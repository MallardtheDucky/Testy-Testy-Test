/* REPUBLIKA campaign interface. Public API: window.Republika (see README). */
(function () {
  const D = window.REPUBLIKA_DATA, S = D.state;
  const $ = (id) => document.getElementById(id);
  const fmtDate = () => D.months[S.month] + " " + S.year;
  const nextDate = () => D.months[(S.month + 1) % 12] + " " + (S.year + (S.month === 11 ? 1 : 0));
  const peso = (n) => "₱" + n.toLocaleString("en-US");
  const stat = (k, v) => '<div class="stat"><span>' + k + "</span><b>" + v + "</b></div>";
  const note = (t) => '<p class="note">' + t + "</p>";
  function list(items, empty) {
    if (!items.length) return note(empty || "Nothing yet.");
    return note("Placeholder content — dedicated module to follow.") +
      items.map((i) => '<div class="item"><h3>' + i.title + "</h3><p>" + i.text + "</p></div>").join("");
  }

  // Replace a panel's render() with a real module when it exists.
  const PANELS = {
    letters:   { title: "Letters",           render: () => list(D.letters, "No letters have arrived.") },
    journal:   { title: "Journal",           render: () => list(D.journal) },
    newspaper: { title: "Newspaper",         render: () => list(D.newspaper) },
    politics:  { title: "Politics",          render: () => note("Factions, rivals and government will be handled here. Module not yet implemented.") },
    standing:  { title: "Career & Personal Standing", render: () => stat("Personal funds", peso(S.funds)) + stat("Reputation", S.reputation) } // replaced by js/standing.js
  };

  function renderHud() {
    $("date").textContent = fmtDate();
    $("turn").textContent = "Turn " + S.turn;
    $("advance-label").textContent = nextDate();
    $("funds").textContent = peso(S.funds);
    $("rep").textContent = S.reputation;
    $("cname").textContent = S.character.name;
    $("cyear").textContent = S.year;
    if (window.RepublikaScreens) { D.badges.letters = RepublikaScreens.unread("letters"); D.badges.journal = RepublikaScreens.unread("journal"); D.badges.newspaper = RepublikaScreens.unread("newspaper"); }
    if (window.RepublikaPeople) { D.badges.people = RepublikaPeople.fresh(); }
    if (window.RepublikaStanding) D.badges.standing = RepublikaStanding.fresh();
    if (window.RepublikaPolitics) D.badges.politics = RepublikaPolitics.fresh();
    for (const k in D.badges) {
      const b = $("b-" + k);
      b.textContent = D.badges[k]; b.classList.toggle("on", D.badges[k] > 0);
    }
    $("news-count").textContent = D.briefing.length;
    $("briefing-list").innerHTML = D.briefing.map((b) => "<li><em>" + b.when + "</em>" + b.text + "</li>").join("");
  }

  function openPanel(key) {
    if (window.RepublikaScreens && RepublikaScreens.has(key)) { closeModal(); RepublikaScreens.open(key); return; }
    const p = PANELS[key];
    $("modal-title").textContent = p.title;
    $("modal-body").innerHTML = p.render();
    $("modal").hidden = false;
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.panel === key));
    if (D.badges[key]) { D.badges[key] = 0; renderHud(); }
  }
  function closeModal() {
    $("modal").hidden = true;
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
  }

  let busy = false;
  const hideConfirm = () => { $("confirm").hidden = true; };
  function requestAdvance() {
    if (busy || !$("modal").hidden || !$("screen").hidden) return;
    const unread = RepublikaScreens.awaiting(), dec = RepublikaEvents.pending();
    if (unread + dec > 0 && $("confirm").hidden) {
      $("confirm-text").textContent = [unread ? unread + (unread === 1 ? " letter awaits a reply" : " letters await replies") : "", dec ? dec + (dec === 1 ? " decision is" : " decisions are") + " still open in your journal" : ""].filter(Boolean).join(", and ") + ". Let the month pass regardless?";
      $("confirm").hidden = false; return;
    }
    hideConfirm(); advance();
  }
  function advance() {
    busy = true;
    const from = fmtDate();
    $("advance").classList.add("pressing"); $("advance").disabled = true;
    const p = $("passage");
    $("passage-date").textContent = nextDate();
    p.hidden = false; p.style.animation = "none"; void p.offsetWidth; p.style.animation = "";
    // Swap the state while the screen is dark (about the middle of the fade).
    setTimeout(() => {
      S.month = (S.month + 1) % 12; if (S.month === 0) S.year++;
      S.turn++;
      RepublikaScreens.deliver(); RepublikaEvents.check();
      D.briefing.unshift({ when: fmtDate(), text: D.monthlyNews[S.turn % D.monthlyNews.length] });
      D.briefing = D.briefing.slice(0, 6);
      RepublikaNews.publish(); RepublikaPeople.sync(); RepublikaPolitics.sync(); RepublikaStanding.sync();
      renderHud();
      const pl = document.querySelector(".date-plaque"); pl.classList.remove("flip"); void pl.offsetWidth; pl.classList.add("flip");
    }, 650);
    setTimeout(() => {
      p.hidden = true; busy = false;
      $("advance").classList.remove("pressing"); $("advance").disabled = false;
      $("briefing").hidden = false;
      document.dispatchEvent(new CustomEvent("republika:turn", { detail: { turn: S.turn, from: from, to: fmtDate() } }));
    }, 1500);
  }

  document.querySelectorAll(".nav-btn").forEach((b) => b.addEventListener("click", () => openPanel(b.dataset.panel)));
  $("news-btn").addEventListener("click", () => { $("briefing").hidden = !$("briefing").hidden; });
  $("advance").addEventListener("click", requestAdvance);
  $("confirm-go").addEventListener("click", requestAdvance);
  $("confirm-stay").addEventListener("click", hideConfirm);
  $("character").addEventListener("click", () => openPanel("standing"));
  document.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.close === "modal") closeModal(); else $("briefing").hidden = true;
  }));
  $("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeModal(); hideConfirm(); }
    else if (e.code === "Space" && !e.repeat) { e.preventDefault(); requestAdvance(); }
  });

  // Space pressed while the embedded map has focus
  addEventListener("message", (e) => { if (e.data && e.data.republika === "advance") requestAdvance(); });

  window.Republika = {
    state: S,
    /** Hand the map slot to your map module: fn(containerElement). Clears the placeholder. */
    mountMap(fn) { const m = $("map-mount"); m.innerHTML = ""; fn(m); },
    refresh: renderHud, advance: requestAdvance, openPanel
  };
  renderHud();
})();
