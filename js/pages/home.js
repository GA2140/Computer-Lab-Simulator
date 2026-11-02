// home.js - halaman menu: kartu level dan hero interaktif
"use strict";
(function() {
  var L = window.LabFix, D = L.Data, S = L.Storage, U = L.UI, $ = U.$;
  if (!U.requireAuth()) {
    return;
  }
  var MSG = {
    locked: "Level itu masih terkunci. Menangkan level sebelumnya dulu.",
    invalid: "Level tidak valid. Pilih level dari menu."
  };
  function fmtCfg(l) {
    return "Grid " + l.cols + "×" + l.rows + ", " + l.cols * l.rows + " PC, " + l.broken + " rusak, " + l.priority + " prioritas, " + U.fmt(l.time);
  }
  function render() {
    var prof = S.getProfile(), prog = S.getProgress(), box = $("levels");
    $("greeting").textContent = "Halo, " + prof.name + "!";
    $("total-stars").textContent = S.totalStars() + "/" + D.LEVELS.length * 3;
    box.textContent = "";
    D.LEVELS.forEach(function(l) {
      var e = prog.levels[l.id], locked = l.id > prog.unlockedLevel;
      var card = U.add(box, "article", null, "card level-card" + (locked ? " is-locked" : ""));
      U.add(card, "h3", "L" + l.id + " " + l.name);
      U.add(card, "p", fmtCfg(l), "muted");
      var pv = U.add(card, "div", null, "mini");
      pv.style.setProperty("--cols", l.cols);
      pv.setAttribute("aria-hidden", "true");
      for (var i = 0; i < l.cols * l.rows; i++) {
        U.add(pv, "i", null, i < l.broken ? "x" : "");
      }
      card.appendChild(U.stars(e.stars, 3));
      U.add(card, "p", "Rekor: " + (e.completed ? e.bestScore : "belum ada"));
      U.add(card, "p", locked ? "🔒 Terkunci" : e.completed ? "Selesai" : "Terbuka", "badge " + (locked ? "badge-locked" : "badge-ok"));
      var b = U.add(card, "button", locked ? "Menangkan level " + (l.id - 1) : "Mulai", "btn btn-primary");
      b.type = "button";
      b.disabled = locked;
      b.addEventListener("click", function() {
        location.href = "game.html?level=" + l.id;
      });
    });
  }
  var ha = $("hero-art"), A = L.Art;
  ha.innerHTML =
    '<div class="hw wave" id="hero-tech"><div class="flip">' + A.person(A.TECH) + '</div></div>' +
    '<button type="button" class="hero-pc pc-broken" id="hero-pc" aria-label="Coba perbaiki PC contoh">' + A.pc + '</button>';
  $("hero-pc").addEventListener("click", function() {
    var pc = $("hero-pc"), t = $("hero-tech");
    if (!pc.classList.contains("pc-broken")) {
      return;
    }
    pc.className = "hero-pc pc-repairing";
    t.className = "hw work";
    setTimeout(function() {
      pc.className = "hero-pc pc-fixed";
      t.className = "hw cheer";
    }, 850);
    setTimeout(function() {
      pc.className = "hero-pc pc-broken";
      t.className = "hw wave";
    }, 3200);
  });
  $("btn-logout").hidden = !S.available;
  $("btn-logout").addEventListener("click", function() {
    S.logout();
    location.href = "login.html";
  });
  var msg = new URLSearchParams(location.search).get("msg");
  U.showBanners();
  render();
  if (msg && MSG[msg]) {
    U.toast(MSG[msg], "warn");
  }
})();
