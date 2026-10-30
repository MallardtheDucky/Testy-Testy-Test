/* Receives the character from the opening (../index.html) and fades the campaign in from black. */
(function () {
  var raw = null, ch = null, A = document.getElementById("arrive");
  try { raw = localStorage.getItem("republika.character"); ch = raw && JSON.parse(raw); } catch (e) {}
  if (!ch || Date.now() - ch.t > 6 * 3600e3) { A.remove(); return; }
  var S = Republika.state;
  S.character.name = ch.n; if (ch.r) S.character.occupation = ch.r;
  var p = document.querySelector(".portrait");
  if (p && ch.img) p.innerHTML = '<img src="../' + ch.img + '" alt="' + ch.n.replace(/"/g, "") + '">';
  Republika.refresh();
  if (window.parent !== window) { A.remove(); return; } // the opening already shows the card and fades us in
  A.hidden = false;
  setTimeout(function () { A.classList.add("out"); }, 1500);
  setTimeout(function () { A.remove(); }, 3300);
})();
