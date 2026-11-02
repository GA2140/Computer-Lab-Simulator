// play.js - kontroler halaman gim: render, input, teknisi, siswa, hasil
"use strict";
(function() {
  var L = window.LabFix, D = L.Data, G = L.Game, S = L.Storage, U = L.UI, $ = U.$;
  var qs = new URLSearchParams(location.search), raw = qs.get("level"), id = parseInt(raw, 10);
  function bounce(code) {
    location.replace("index.html?msg=" + code);
  }
  if (!(id >= 1 && id <= D.LEVELS.length && String(id) === raw)) {
    bounce("invalid");
    return;
  }
  if (!U.requireAuth()) {
    return;
  }
  if (S.getProgress().unlockedLevel < id) {
    bounce("locked");
    return;
  }
  var g = G.create(id), lv = g.level, selected = null, last = performance.now(), timer = null, saved = null, mg = false, target = null;
  var LABEL = { healthy: "Sehat", broken: "Bermasalah", repairing: "Diperbaiki…", fixed: "Siap" };
  var BADGE = { healthy: "badge-ok", broken: "badge-bad", repairing: "badge-warn", fixed: "badge-ok" };
  var cards = [], powerBtns = {}, actionBtns = [], actor, stage, working = false, prev = null, waiters = [], sitters = [], alarm = [];
  // Warna acak untuk siswa: kulit, baju, rambut.
  var SK = ["#F1C27D", "#C68642", "#8D5524", "#E0AC69"];
  var SH = ["#F1F5F9", "#FA5252", "#FAB005", "#94D82D", "#4C6EF5", "#F783AC"];
  var HR = ["#3B2A20", "#12262E", "#8A4B08"];
  function faultOf(id2) {
    return D.FAULTS.filter(function(x) {
      return x.id === id2;
    })[0];
  }
  function pcName(i) {
    return "PC " + (i < 9 ? "0" : "") + (i + 1);
  }
  function build() {
    var grid = $("grid"), A = L.Art;
    stage = $("stage");
    stage.insertAdjacentHTML(
      "beforeend",
      '<div class="floor-deco" aria-hidden="true">' +
        '<span class="plant">' + A.plant + '</span>' +
        '<div class="npc" id="npc"><span class="bubble">Waktu hampir habis!</span></div>' +
      '</div>' +
      '<div class="actor idle" id="actor" data-face="r" aria-hidden="true">' +
        '<div class="flip">' + A.person(A.TECH) + '</div>' +
      '</div>'
    );
    actor = $("actor");
    grid.style.setProperty("--cols", lv.cols);
    g.pcs.forEach(function(pc) {
      var b = U.add(grid, "button", null, "pc");
      b.type = "button";
      b.insertAdjacentHTML(
        "beforeend",
        '<span class="pc-wrap">' + L.Art.pc +
          '<span class="sitter idle" style="--d:-' + (pc.id % 5) * 0.45 + 's">' + L.Art.person(kid(pc.id)) + '</span>' +
        '</span>'
      );
      sitters[pc.id] = b.querySelector(".sitter");
      U.add(b, "strong", pcName(pc.id));
      var badge = U.add(b, "span", null, "badge");
      var star = U.add(b, "span", "★ Prioritas", "pc-star");
      var hint = U.add(b, "span", null, "pc-hint");
      b.addEventListener("click", function() {
        clickPc(pc.id);
      });
      cards.push({ el: b, badge, star, hint });
    });
    D.FAULTS.forEach(function(f, i) {
      var b = U.add($("actions"), "button", i + 1 + ". " + f.action, "btn btn-action");
      b.type = "button";
      b.addEventListener("click", function() {
        attempt(f.id);
      });
      actionBtns.push(b);
    });
    D.POWERS.forEach(function(pw) {
      var b = U.add($("powers-list"), "button", null, "power");
      b.type = "button";
      b.dataset.power = pw.id;
      b.title = pw.desc;
      b.insertAdjacentHTML(
        "beforeend",
        '<span class="power-icon" aria-hidden="true">' + pw.icon + '</span>' +
        '<span class="power-text">' +
          '<span class="power-name">' + pw.name + '<kbd>' + pw.key + '</kbd></span>' +
          '<span class="power-desc">' + pw.desc + '</span>' +
        '</span>' +
        '<b class="power-count"></b>'
      );
      b.addEventListener("click", function() {
        activate(pw.id);
      });
      powerBtns[pw.id] = b;
    });
    $("brief-title").textContent = "L" + lv.id + " " + lv.name;
    var ul = $("brief-info");
    [
      lv.cols * lv.rows + " PC dalam grid " + lv.cols + "×" + lv.rows + ", " + lv.broken + " di antaranya bermasalah.",
      lv.priority > 0 ? lv.priority + " PC prioritas ★ memberi skor tambahan." : "Tidak ada PC prioritas di level ini.",
      "Waktu shift " + U.fmt(lv.time) + ". Timer baru berjalan setelah kamu menekan Mulai Shift.",
      "Tindakan salah mengurangi skor dan waktu.",
      "Power khusus (Pemindai " + lv.powers.scan + "×, Bekukan Waktu " + lv.powers.freeze + "×, Perbaikan Kilat " + lv.powers.fix + "×) membantu menyelesaikan shift. Setiap bonus combo memberi +1 Pemindai.",
      "Siswa duduk di PC yang sehat. PC sehat bisa tiba-tiba rusak (maks. " + g.extra + " kali); siswanya lari keluar dan menunggu di lantai bawah."
    ].forEach(function(t) {
      U.add(ul, "li", t);
    });
    U.renderRules($("help-body"));
  }
  function render() {
    $("hud-level").textContent = "L" + lv.id + " " + lv.name;
    var sec = Math.ceil(g.remaining / 1e3);
    $("hud-time").textContent = U.fmt(sec);
    var frozen = g.freeze > 0, low = g.state === "running" && sec <= D.LOW_TIME_SEC && !frozen;
    $("hud-time-chip").classList.toggle("is-low", low);
    $("hud-time-chip").classList.toggle("is-frozen", frozen);
    $("hud-time-label").textContent = frozen ? "Beku ❄ " + Math.ceil(g.freeze / 1e3) + " dtk" : "Waktu";
    $("hud-score").textContent = String(g.score);
    $("hud-combo").textContent = String(g.streak);
    var bar = $("hud-bar");
    bar.style.width = g.remaining / (lv.time * 10) + "%";
    bar.classList.toggle("is-low", low);
    bar.classList.toggle("is-frozen", frozen);
    $("hud-combo").parentNode.classList.toggle("is-hot", g.streak >= 2);
    var panic = low;
    $("npc").classList.toggle("panic", panic);
    stage.classList.toggle("panic", panic);
    stage.classList.toggle("frozen", frozen);
    stage.classList.toggle("targeting", target !== null);
    stage.dataset.target = target || "";
    renderPowers();
    $("hud-ready").textContent = G.ready(g) + "/" + g.pcs.length;
    g.pcs.forEach(function(pc, i) {
      var c = cards[i], p = g.pending;
      c.el.className = "pc pc-" + pc.status +
        (p && p.pc === i && !p.correct ? " pc-wrong" : "") +
        (selected === i ? " is-selected" : "") +
        (target && pc.status === "broken" ? " pc-target" : "") +
        (alarm[i] ? " pc-alarm" : "");
      c.badge.className = "badge " + BADGE[pc.status];
      c.badge.textContent = LABEL[pc.status];
      c.star.hidden = !(pc.priority && (pc.status === "broken" || pc.status === "repairing"));
      c.hint.hidden = !(g.hints[i] && pc.status === "broken");
      c.hint.textContent = g.hints[i] ? "🔍 " + faultOf(g.hints[i]).name : "";
      c.el.setAttribute("aria-label", pcName(i) + ", " + LABEL[pc.status] + (pc.priority ? ", prioritas" : "") + (g.hints[i] ? ", terpindai: " + faultOf(g.hints[i]).name : ""));
    });
    $("btn-pause").disabled = g.state !== "running";
    syncKids();
  }
  function renderPowers() {
    var ok = playing();
    D.POWERS.forEach(function(pw) {
      var b = powerBtns[pw.id], n = g.powers[pw.id];
      b.querySelector(".power-count").textContent = String(n);
      b.disabled = !ok || n <= 0 || (pw.id === "freeze" && g.freeze > 0);
      b.classList.toggle("is-active", target === pw.id);
      b.setAttribute("aria-pressed", String(target === pw.id));
      b.setAttribute("aria-label", pw.name + ", sisa " + n + ", tombol " + pw.key);
    });
    $("powers-hint").textContent = target === "scan" ? "Pilih PC bermasalah untuk dipindai. Esc untuk batal." :
      target === "fix" ? "Pilih PC bermasalah untuk diperbaiki kilat. Esc untuk batal." : "";
  }
  function setTarget(t) {
    target = t;
    if (t && selected !== null) {
      closePanel();
      return;
    }
    render();
  }
  function activate(pid) {
    if (!playing()) {
      return;
    }
    var name = D.POWERS.filter(function(x) {
      return x.id === pid;
    })[0].name;
    if (g.powers[pid] <= 0) {
      U.toast(name + " sudah habis.", "warn");
      return;
    }
    if (pid === "freeze") {
      if (G.freeze(g)) {
        U.toast("Waktu dibekukan " + D.POWER.freezeMs / 1e3 + " detik! ❄", "ok");
        render();
      } else {
        U.toast("Waktu sedang dibekukan.", "info");
      }
      return;
    }
    if (target === pid) {
      setTarget(null);
      return;
    }
    if (!g.pcs.some(function(p) {
      return p.status === "broken";
    })) {
      U.toast("Tidak ada PC bermasalah saat ini.", "info");
      return;
    }
    setTarget(pid);
  }
  function usePowerOn(i) {
    var pc = g.pcs[i];
    if (pc.status !== "broken") {
      U.toast(pcName(i) + " tidak bermasalah. Pilih PC yang bermasalah.", "warn");
      return;
    }
    if (target === "scan") {
      if (!G.scan(g, i)) {
        U.toast(pcName(i) + " sudah dipindai.", "info");
        return;
      }
      target = null;
      U.toast("Hasil pindai " + pcName(i) + ": kerusakan " + faultOf(g.hints[i]).name + ".", "ok");
      openPanel(i);
      return;
    }
    var r = G.quickFix(g, i);
    target = null;
    if (!r) {
      render();
      return;
    }
    pop(cards[i].el, r);
    place(i);
    working = true;
    if (!actor.classList.contains("walk")) {
      setMood("work");
    }
    U.toast("Perbaikan Kilat! " + pcName(i) + " langsung siap. +" + r.points + " skor.", "ok");
    render();
    setTimeout(function() {
      working = false;
      setMood("cheer");
      setTimeout(function() {
        setMood("idle");
      }, 1100);
      last = performance.now();
      finishRepair();
    }, D.ANIM_MS + 400);
  }
  function finishRepair() {
    G.finish(g);
    render();
    checkEnd();
  }
  function playing() {
    return g.state === "running" && !g.busy && !U.anyModalOpen();
  }
  function openPanel(i) {
    selected = i;
    place(i);
    var f = faultOf(g.pcs[i].fault);
    $("panel-title").textContent = "Inspeksi " + pcName(i) + (g.pcs[i].priority ? " ★" : "");
    var ul = $("panel-symptoms");
    ul.textContent = "";
    f.symptoms.forEach(function(s) {
      U.add(ul, "li", s);
    });
    var scanned = g.hints[i] === f.id;
    if (scanned) {
      U.add(ul, "li", "Hasil pindai: " + f.name + ". Tindakan: " + f.action, "is-scan");
    }
    actionBtns.forEach(function(b, k) {
      b.classList.toggle("is-hinted", scanned && D.FAULTS[k].id === f.id);
    });
    $("panel-hint").hidden = true;
    $("panel-body").hidden = false;
    $("panel").classList.add("open");
    (scanned ? actionBtns[D.FAULTS.indexOf(f)] : $("actions").firstChild).focus();
    render();
  }
  function closePanel() {
    selected = null;
    $("panel-hint").hidden = false;
    $("panel-body").hidden = true;
    $("panel").classList.remove("open");
    render();
  }
  function clickPc(i) {
    if (!playing()) {
      return;
    }
    if (target) {
      usePowerOn(i);
      return;
    }
    var st = g.pcs[i].status;
    if (st === "broken") {
      openPanel(i);
    } else {
      U.toast(pcName(i) + (st === "healthy" ? " dalam kondisi sehat." : " sudah siap."), "info");
    }
  }
  function pop(el, r) {
    var s = U.add(el, "span", r.correct ? "+" + r.points : "−" + D.SCORE.wrong, "pop " + (r.correct ? "ok" : "bad"));
    setTimeout(function() {
      s.remove();
    }, 1100);
    if (!r.correct && navigator.vibrate) {
      navigator.vibrate(120);
    }
  }
  function countUp(el, to) {
    var t0 = performance.now();
    (function f(n) {
      var k = Math.min(1, (n - t0) / 900);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) {
        requestAnimationFrame(f);
      }
    })(t0);
  }
  function attempt(faultId) {
    if (selected === null) {
      return;
    }
    var r = G.choose(g, selected, faultId);
    if (!r) {
      return;
    }
    pop(cards[selected].el, r);
    if (r.correct) {
      working = true;
      if (!actor.classList.contains("walk")) {
        setMood("work");
      }
    } else {
      setMood("oops");
      setTimeout(function() {
        setMood("idle");
      }, 1e3);
    }
    closePanel();
    U.toast(
      r.correct ? "Benar! +" + r.points + " skor." + (r.bonus ? " Bonus combo: +1 Pemindai!" : "") : "Salah! −" + D.SCORE.wrong + " skor, −" + D.SCORE.wrongTime + " detik.",
      r.correct ? "ok" : "bad"
    );
    render();
    if (!r.correct) {
      setTimeout(finishRepair, D.ANIM_MS);
      return;
    }
    mg = true;
    L.Mini.play(faultId, lv.id, $("mg-box"), function() {
      U.closeModal("modal-mg");
      mg = false;
      working = false;
      setMood("cheer");
      setTimeout(function() {
        setMood("idle");
      }, 1100);
      last = performance.now();
      setTimeout(finishRepair, D.ANIM_MS);
    });
    U.openModal("modal-mg");
  }
  function checkEnd() {
    if (g.state !== "won" && g.state !== "lost") {
      return;
    }
    clearInterval(timer);
    setMood(g.state === "won" ? "cheer" : "oops");
    if (!g.resultSaved) {
      g.resultSaved = true;
      saved = S.recordResult(id, G.result(g));
      showResult();
    }
  }
  function showResult() {
    var r = G.result(g), st = $("res-stats");
    $("res-title").textContent = r.won ? "Shift berhasil!" : "Waktu habis";
    countUp($("res-score"), r.score);
    var sb = $("res-stars");
    sb.textContent = "";
    sb.appendChild(U.stars(r.stars, 3));
    st.textContent = "";
    [
      ["Benar", r.correct],
      ["Salah", r.wrong],
      ["Rangkaian terbaik", r.maxStreak],
      ["Power terpakai", r.powersUsed],
      ["Sisa waktu", U.fmt(r.left)],
      ["PC siap", G.ready(g) + "/" + g.pcs.length]
    ].forEach(function(x) {
      U.add(st, "li", x[0] + ": " + x[1]);
    });
    $("res-record").hidden = !(saved && saved.newRecord);
    $("res-next").hidden = !(r.won && id < D.LEVELS.length);
    U.openModal("modal-result");
  }
  function pauseWith(modal) {
    target = null;
    if (g.state === "running") {
      G.pause(g);
    }
    U.openModal(modal);
    render();
  }
  function afterOverlay() {
    if (g.state === "paused" && !U.anyModalOpen()) {
      U.openModal("modal-pause");
    }
  }
  $("btn-start").addEventListener("click", function() {
    G.start(g);
    $("briefing").hidden = true;
    $("grid").classList.remove("is-locked");
    place(selected, true);
    last = performance.now();
    render();
  });
  $("btn-pause").addEventListener("click", function() {
    pauseWith("modal-pause");
  });
  $("btn-resume").addEventListener("click", function() {
    U.closeModal("modal-pause");
    G.resume(g);
    last = performance.now();
    render();
  });
  $("btn-help").addEventListener("click", function() {
    pauseWith("modal-help");
  });
  $("help-close").addEventListener("click", function() {
    U.closeModal("modal-help");
    afterOverlay();
  });
  $("btn-exit").addEventListener("click", function() {
    pauseWith("modal-exit");
  });
  $("exit-no").addEventListener("click", function() {
    U.closeModal("modal-exit");
    afterOverlay();
  });
  $("exit-yes").addEventListener("click", function() {
    location.href = "index.html";
  });
  $("panel-close").addEventListener("click", closePanel);
  $("res-retry").addEventListener("click", function() {
    location.href = "game.html?level=" + id;
  });
  $("res-next").addEventListener("click", function() {
    location.href = "game.html?level=" + (id + 1);
  });
  $("res-menu").addEventListener("click", function() {
    location.href = "index.html";
  });
  document.addEventListener("visibilitychange", function() {
    if (document.hidden && g.state === "running") {
      pauseWith("modal-pause");
    }
  });
  document.addEventListener("keydown", function(ev) {
    if (ev.key === "Escape") {
      if (!$("modal-help").hidden) {
        $("help-close").click();
      } else if (!$("modal-exit").hidden) {
        $("exit-no").click();
      } else if (!U.anyModalOpen()) {
        if (target) {
          setTarget(null);
        } else if (selected !== null) {
          closePanel();
        } else if (g.state === "running") {
          pauseWith("modal-pause");
        }
      }
      return;
    }
    var pw = D.POWERS.filter(function(x) {
      return x.key.toLowerCase() === ev.key.toLowerCase();
    })[0];
    if (pw && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      activate(pw.id);
      return;
    }
    var n = parseInt(ev.key, 10);
    if (n >= 1 && n <= D.FAULTS.length && selected !== null && playing()) {
      attempt(D.FAULTS[n - 1].id);
    }
  });
  function kid(i) {
    return { skin: SK[i % 4], shirt: SH[i % 6], pants: "#1C3D7A", tool: "", hat: L.Art.STUDENT.hat.replace("#3B2A20", HR[i % 3]) };
  }
  function stagePos(el) {
    var a = el.getBoundingClientRect(), b = stage.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top };
  }
  function slot(k) {
    var cols = Math.max(1, Math.floor((stage.clientWidth - 150) / 44));
    return { x: 80 + k % cols * 44, y: stage.clientHeight - 92 - Math.floor(k / cols) * 16 };
  }
  function moveTo(el, p) {
    el.style.transform = "translate(" + p.x + "px," + p.y + "px)";
  }
  function layout() {
    waiters.forEach(function(w, k) {
      w.x = slot(k).x;
      moveTo(w.el, slot(k));
    });
  }
  function showSitter(id2) {
    var s = sitters[id2];
    s.classList.remove("gone");
    s.classList.add("back");
    setTimeout(function() {
      s.classList.remove("back");
    }, 600);
  }
  function mkKid(id2) {
    var d = document.createElement("div");
    d.className = "kid idle";
    d.dataset.face = "r";
    d.innerHTML = '<div class="flip">' + L.Art.person(kid(id2)) + "</div>";
    stage.appendChild(d);
    d.addEventListener("transitionend", function() {
      if (d.dataset.mode === "back") {
        if (d.parentNode) {
          d.remove();
          showSitter(id2);
        }
      } else if (d.classList.contains("walk")) {
        d.className = "kid idle";
      }
    });
    return d;
  }
  function sendOut(id2, instant) {
    var s = sitters[id2], el = mkKid(id2), from = stagePos(s), k = waiters.length, to = slot(k);
    s.classList.add("gone");
    waiters.push({ id: id2, el, x: to.x });
    el.style.transition = "none";
    moveTo(el, instant ? to : { x: from.x - 7, y: from.y - 3 });
    void el.offsetWidth;
    el.style.transition = "";
    if (!instant) {
      el.dataset.face = to.x < from.x ? "l" : "r";
      el.className = "kid walk";
      moveTo(el, to);
    }
  }
  function bringBack(id2) {
    var k = waiters.map(function(w2) {
      return w2.id;
    }).indexOf(id2);
    if (k < 0) {
      showSitter(id2);
      return;
    }
    var w = waiters.splice(k, 1)[0], to = stagePos(sitters[id2]);
    w.el.dataset.mode = "back";
    w.el.dataset.face = to.x < w.x ? "l" : "r";
    w.el.className = "kid walk";
    moveTo(w.el, { x: to.x - 7, y: to.y - 3 });
    layout();
  }
  function syncKids() {
    g.pcs.forEach(function(pc, i) {
      var was = prev ? prev[i] : null;
      if (!prev) {
        if (pc.status === "broken") {
          sendOut(i, true);
        }
        return;
      }
      if (pc.status === was) {
        return;
      }
      if (pc.status === "broken" && was === "healthy") {
        sendOut(i);
        alarm[i] = true;
        setTimeout(function() {
          alarm[i] = false;
        }, 1300);
        U.toast(pcName(i) + " tiba-tiba rusak! Siswanya lari keluar.", "warn");
      }
      if (pc.status === "fixed") {
        bringBack(i);
      }
    });
    prev = g.pcs.map(function(p) {
      return p.status;
    });
  }
  function setMood(m) {
    actor.className = "actor " + m;
  }
  function place(i, instant) {
    var x, y, el;
    if (i === null) {
      x = stage.clientWidth / 2 - 24;
      y = stage.clientHeight - 90;
    } else {
      el = cards[i].el;
      x = el.offsetLeft + el.offsetWidth - 34;
      y = el.offsetTop + el.offsetHeight - 74;
    }
    var moved = actor._x === void 0 || Math.abs(x - actor._x) + Math.abs(y - actor._y) > 2;
    if (actor._x !== void 0 && x !== actor._x) {
      actor.dataset.face = x < actor._x ? "l" : "r";
    }
    actor._x = x;
    actor._y = y;
    if (instant) {
      actor.style.transition = "none";
    }
    actor.style.transform = "translate(" + x + "px," + y + "px)";
    if (instant) {
      void actor.offsetWidth;
      actor.style.transition = "";
    } else if (moved) {
      setMood("walk");
    }
  }
  build();
  actor.addEventListener("transitionend", function() {
    if (actor.classList.contains("walk")) {
      actor.dataset.face = "l";
      setMood(working ? "work" : "idle");
    }
  });
  place(null, true);
  window.addEventListener("resize", function() {
    place(selected, true);
    layout();
  });
  render();
  timer = setInterval(function() {
    var now = performance.now();
    if (!mg) {
      G.tick(g, now - last);
    }
    last = now;
    render();
    checkEnd();
  }, D.TICK_MS);
})();
