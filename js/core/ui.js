// ui.js - helper UI bersama: toast, modal, bintang, aturan bermain
"use strict";
(function() {
  var LabFix = window.LabFix = window.LabFix || {};
  var D = LabFix.Data;
  var focusStack = [];
  function $(id) {
    return document.getElementById(id);
  }
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }
  function add(p, tag, text, cls) {
    var e = document.createElement(tag);
    if (text !== void 0 && text !== null) {
      e.textContent = text;
    }
    if (cls) {
      e.className = cls;
    }
    p.appendChild(e);
    return e;
  }
  var UI = LabFix.UI = {
    $,
    add,
    fmt: function(sec) {
      sec = Math.max(0, Math.floor(sec));
      return pad(Math.floor(sec / 60)) + ":" + pad(sec % 60);
    },
    toast: function(msg, kind) {
      var box = $("toast");
      if (!box) {
        return;
      }
      var t = add(box, "div", msg, "toast" + (kind ? " toast-" + kind : ""));
      setTimeout(function() {
        if (t.parentNode) {
          t.parentNode.removeChild(t);
        }
      }, 3500);
    },
    stars: function(n, max) {
      var s = document.createElement("span");
      s.className = "stars";
      s.setAttribute("aria-label", n + " dari " + max + " bintang");
      for (var i = 0; i < max; i++) {
        add(s, "span", i < n ? "★" : "☆", i < n ? "star on" : "star");
      }
      return s;
    },
    openModal: function(id) {
      var m = $(id);
      focusStack.push(document.activeElement);
      m.hidden = false;
      var f = m.querySelector("input,button");
      if (f) {
        f.focus();
      }
    },
    closeModal: function(id) {
      $(id).hidden = true;
      var prev = focusStack.pop();
      if (prev && prev.focus && document.body.contains(prev)) {
        prev.focus();
      }
    },
    requireAuth: function() {
      if (LabFix.Storage.getProfile()) {
        return true;
      }
      location.replace("login.html?msg=login");
      return false;
    },
    anyModalOpen: function() {
      return !!document.querySelector(".modal:not([hidden])");
    },
    showBanners: function() {
      var b = $("banner");
      if (b && !LabFix.Storage.available) {
        b.hidden = false;
        b.textContent = "Mode tamu: penyimpanan browser tidak tersedia. Semua level terbuka, tetapi progres tidak disimpan.";
      }
      LabFix.Storage.takeNotices().forEach(function(n) {
        UI.toast(n, "warn");
      });
    },
    renderRules: function(box) {
      var S = D.SCORE;
      box.textContent = "";
      add(box, "h3", "Tujuan");
      add(box, "p", "Kamu petugas lab. Perbaiki semua PC bermasalah sebelum waktu habis.");
      add(box, "h3", "Kontrol");
      add(
        box, "p",
        "Klik PC bermasalah, baca dua gejala, lalu pilih satu dari enam tindakan. " +
        "Bisa juga dengan tombol 1–6 dan Tab/Enter. Esc menutup panel."
      );
      add(box, "h3", "Tabel kerusakan");
      var wrap = add(box, "div", null, "table-wrap"), tb = add(wrap, "table", null, "table");
      var hr = add(add(tb, "thead"), "tr");
      ["Kode", "Jenis", "Gejala", "Tindakan", "Tombol"].forEach(function(h) {
        add(hr, "th", h);
      });
      var body = add(tb, "tbody");
      D.FAULTS.forEach(function(f, i) {
        var r = add(body, "tr");
        [f.id, f.name, f.symptoms.join("; "), f.action, String(i + 1)].forEach(function(c) {
          add(r, "td", c);
        });
      });
      add(box, "h3", "Power khusus");
      add(box, "p", "Jatah power berbeda tiap level dan terlihat di bilah Power saat shift berjalan. Klik tombolnya atau tekan pintasan.");
      var pl = add(box, "ul");
      D.POWERS.forEach(function(pw) {
        add(pl, "li", pw.icon + " " + pw.name + " (" + pw.key + "): " + pw.desc);
      });
      add(box, "p", "Setiap bonus combo memberi +1 Pemindai. Power yang butuh target bisa dibatalkan dengan Esc.");
      add(box, "h3", "Aturan skor");
      var ul = add(box, "ul");
      [
        "Benar: +" + S.correct + ". PC prioritas ★: tambahan +" + S.priority + ".",
        "Setiap " + S.comboEvery + " benar berturut-turut: bonus combo +" + S.comboBonus + ".",
        "Salah: −" + S.wrong + " skor, −" + S.wrongTime + " detik, combo reset. Skor minimum 0.",
        "Menang: +" + S.win + " ditambah " + S.perSecond + " × sisa detik."
      ].forEach(function(t) {
        add(ul, "li", t);
      });
      add(box, "h3", "Ambang bintang");
      var us = add(box, "ul");
      D.LEVELS.forEach(function(l) {
        add(us, "li", "L" + l.id + " " + l.name + ": ★ menang, ★★ skor ≥ " + l.star2 + ", ★★★ skor ≥ " + l.star3 + ".");
      });
      add(box, "h3", "Tips");
      add(box, "p", "Dahulukan PC prioritas ★, jaga rangkaian benar untuk combo, dan jangan menebak: salah mengurangi waktu.");
    }
  };
})();
