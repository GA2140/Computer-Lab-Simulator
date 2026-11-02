// minigames.js - minigame perbaikan per jenis kerusakan (timing, urutan, tahan, ketuk)
"use strict";
(function() {
  var L = window.LabFix = window.LabFix || {}, U = L.UI, add = U.add, $ = U.$;
  var CFG = {
    F1: { k: "timing", t: "Colok kabel daya", h: "Tekan tombol saat penanda ada di zona hijau.", b: "Colok!" },
    F2: { k: "seq", t: "Sambung kabel jaringan", h: "Ketuk berurutan: Modem, Switch, Router, PC.", s: ["Modem", "Switch", "Router", "PC"] },
    F3: { k: "hold", t: "Pulihkan sistem", h: "Tahan tombol sampai 100%. Kalau dilepas, proses mengulang.", b: "Tahan untuk memulihkan" },
    F4: { k: "whack", t: "Hapus virus", h: "Ketuk 5 virus sebelum berpindah tempat." },
    F5: { k: "seq", t: "Pasang ulang periferal", h: "Ketuk berurutan: Cabut, Tunggu, Colok, Tes.", s: ["Cabut", "Tunggu", "Colok", "Tes"] },
    F6: { k: "timing", t: "Pasang kabel monitor", h: "Tekan tombol saat penanda ada di zona hijau.", b: "Pasang!" }
  };
  function shake(el) {
    el.classList.remove("bad");
    void el.offsetWidth;
    el.classList.add("bad");
  }
  var M = {
    timing: function(box, lv, win, c, reg) {
      var bar = add(box, "div", null, "mg-bar"), w = Math.max(10, 24 - lv * 2), left = 8 + Math.random() * (84 - w);
      var zone = add(bar, "i", null, "mg-zone"), mk = add(bar, "b", null, "mg-mark"), x = 0, dir = 1, raf, sp = 0.8 + lv * 0.18;
      zone.style.left = left + "%";
      zone.style.width = w + "%";
      (function step() {
        x += dir * sp;
        if (x >= 100 || x <= 0) {
          dir = -dir;
          x = Math.max(0, Math.min(100, x));
        }
        mk.style.left = x + "%";
        raf = requestAnimationFrame(step);
      })();
      reg(function() {
        cancelAnimationFrame(raf);
      });
      var b = add(box, "button", c.b, "btn btn-primary mg-go");
      b.type = "button";
      b.addEventListener("click", function() {
        if (x >= left && x <= left + w) {
          win();
        } else {
          shake(bar);
        }
      });
    },
    seq: function(box, lv, win, c) {
      var n = c.s, next = 0, wrap = add(box, "div", null, "mg-tiles"), idx = n.map(function(s, i) {
        return i;
      }).sort(function() {
        return Math.random() - 0.5;
      });
      idx.forEach(function(i) {
        var b = add(wrap, "button", n[i], "btn mg-tile");
        b.type = "button";
        b.addEventListener("click", function() {
          if (i === next) {
            b.disabled = true;
            b.classList.add("ok");
            next++;
            if (next === n.length) {
              win();
            }
            return;
          }
          next = 0;
          shake(wrap);
          wrap.querySelectorAll("button").forEach(function(x) {
            x.disabled = false;
            x.classList.remove("ok");
          });
        });
      });
    },
    hold: function(box, lv, win, c, reg) {
      var bar = add(box, "div", null, "mg-bar mg-fill"), fi = add(bar, "i"), b = add(box, "button", c.b, "btn btn-primary mg-go mg-hold"), p = 0, on = false, raf;
      b.type = "button";
      var dur = 1.3 + lv * 0.12;
      (function step() {
        p = on ? p + 100 / (60 * dur) : Math.max(0, p - 1.5);
        fi.style.width = Math.min(100, p) + "%";
        if (p >= 100) {
          win();
          return;
        }
        raf = requestAnimationFrame(step);
      })();
      reg(function() {
        cancelAnimationFrame(raf);
      });
      function set(v) {
        return function() {
          on = v;
        };
      }
      b.addEventListener("pointerdown", set(true));
      b.addEventListener("pointerup", set(false));
      b.addEventListener("pointerleave", set(false));
      b.addEventListener("pointercancel", set(false));
      b.addEventListener("keydown", function(e) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          on = true;
        }
      });
      b.addEventListener("keyup", set(false));
    },
    whack: function(box, lv, win, c, reg) {
      var left = 5, info = add(box, "p", "Sisa virus: 5", "mg-info"), area = add(box, "div", null, "mg-area"), v, t;
      function spawn() {
        if (v) {
          v.remove();
        }
        v = add(area, "button", "🦠", "mg-virus");
        v.type = "button";
        v.setAttribute("aria-label", "Virus");
        v.style.left = Math.random() * 82 + "%";
        v.style.top = Math.random() * 74 + "%";
        v.addEventListener("click", function() {
          left--;
          info.textContent = "Sisa virus: " + left;
          if (left <= 0) {
            win();
          } else {
            spawn();
            clearInterval(t);
            t = setInterval(spawn, Math.max(700, 1500 - lv * 100));
          }
        });
      }
      spawn();
      t = setInterval(spawn, Math.max(700, 1500 - lv * 100));
      reg(function() {
        clearInterval(t);
      });
    }
  };
  L.Mini = {
    play: function(fid, lv, box, done) {
      var c = CFG[fid], clean = [], over = false;
      $("mg-t").textContent = c.t;
      $("mg-hint").textContent = c.h;
      box.textContent = "";
      function win() {
        if (over) {
          return;
        }
        over = true;
        clean.forEach(function(f) {
          f();
        });
        box.textContent = "";
        add(box, "p", "Berhasil! ✓", "mg-ok");
        setTimeout(done, 650);
      }
      M[c.k](box, lv, win, c, function(f) {
        clean.push(f);
      });
    }
  };
})();
