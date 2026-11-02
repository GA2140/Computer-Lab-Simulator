// scores.js - halaman papan skor: rekor per level dan riwayat
"use strict";
(function() {
  var L = window.LabFix, D = L.Data, S = L.Storage, U = L.UI, $ = U.$;
  if (!U.requireAuth()) {
    return;
  }
  function render() {
    var prof = S.getProfile(), prog = S.getProgress(), hist = S.getHistory().slice(0, D.HISTORY_SHOWN);
    $("profile-name").textContent = prof ? prof.name : "Belum ada profil";
    $("total-stars").textContent = S.totalStars() + "/" + D.LEVELS.length * 3;
    var rb = $("records");
    rb.textContent = "";
    D.LEVELS.forEach(function(l) {
      var e = prog.levels[l.id], r = U.add(rb, "tr");
      U.add(r, "td", "L" + l.id + " " + l.name);
      var tr = U.add(r, "td", e.completed ? String(e.bestScore) : "-"), m = U.add(tr, "div", null, "meter");
      m.title = "Ambang ★★ " + l.star2 + ", ★★★ " + l.star3;
      U.add(m, "i").style.width = Math.min(100, e.bestScore / l.star3 * 100) + "%";
      U.add(m, "b").style.left = l.star2 / l.star3 * 100 + "%";
      U.add(r, "td").appendChild(U.stars(e.stars, 3));
    });
    var hb = $("history");
    hb.textContent = "";
    $("empty").hidden = hist.length > 0;
    $("history-wrap").hidden = hist.length === 0;
    hist.forEach(function(h) {
      var lv = D.LEVELS[h.level - 1], r = U.add(hb, "tr");
      U.add(r, "td", new Date(h.at).toLocaleString("id-ID"));
      U.add(r, "td", lv ? "L" + lv.id + " " + lv.name : "Level " + h.level);
      U.add(U.add(r, "td"), "span", h.won ? "Menang" : "Waktu habis", "badge " + (h.won ? "badge-ok" : "badge-bad"));
      U.add(r, "td", String(h.score));
      U.add(r, "td").appendChild(U.stars(h.stars, 3));
    });
    $("btn-reset").disabled = !S.available;
  }
  $("btn-reset").addEventListener("click", function() {
    U.openModal("modal-reset");
  });
  $("reset-no").addEventListener("click", function() {
    U.closeModal("modal-reset");
  });
  $("reset-yes").addEventListener("click", function() {
    S.reset();
    U.closeModal("modal-reset");
    render();
    U.toast("Semua data LabFix dihapus.", "ok");
  });
  document.addEventListener("keydown", function(ev) {
    if (ev.key === "Escape" && !$("modal-reset").hidden) {
      U.closeModal("modal-reset");
    }
  });
  $("btn-logout").hidden = !S.available;
  $("btn-logout").addEventListener("click", function() {
    S.logout();
    location.href = "login.html";
  });
  U.showBanners();
  render();
})();
