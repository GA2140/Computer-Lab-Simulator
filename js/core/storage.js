// storage.js - akun dan progres di localStorage (level terbuka dihitung dari level yang dimenangkan)
"use strict";
(function() {
  var LabFix = window.LabFix = window.LabFix || {};
  var D = LabFix.Data;
  var K = { users: "labfix.users.v1", session: "labfix.session.v1", progress: "labfix.progress.v1", history: "labfix.history.v1" };
  var notices = [];
  var ok = (function() {
    try {
      localStorage.setItem("labfix.t", "1");
      localStorage.removeItem("labfix.t");
      return true;
    } catch (e) {
      return false;
    }
  })();
  function defProgress(open) {
    var p = { unlockedLevel: open ? D.LEVELS.length : 1, levels: {} };
    D.LEVELS.forEach(function(l) {
      p.levels[l.id] = { stars: 0, bestScore: 0, completed: false };
    });
    return p;
  }
  function write(key, v) {
    if (!ok) {
      return false;
    }
    try {
      localStorage.setItem(key, JSON.stringify(v));
      return true;
    } catch (e) {
      return false;
    }
  }
  function read(key, valid, def) {
    if (!ok) {
      return def();
    }
    var raw = null;
    try {
      raw = localStorage.getItem(key);
    } catch (e) {
      return def();
    }
    if (raw === null) {
      return def();
    }
    try {
      var v = JSON.parse(raw);
      if (valid(v)) {
        return v;
      }
    } catch (e) {
    }
    notices.push("Data tersimpan rusak dan sudah diatur ulang ke nilai awal.");
    write(key, def());
    return def();
  }
  function hash(str) {
    var h1 = 3735928559, h2 = 1103547991;
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
    h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }
  function users() {
    return read(K.users, function(u) {
      return u && typeof u === "object" && !Array.isArray(u);
    }, function() {
      return {};
    });
  }
  function uid() {
    var s = read(K.session, function(x) {
      return x && typeof x.uid === "string";
    }, function() {
      return null;
    });
    return s && users()[s.uid] ? s.uid : null;
  }
  function validProgress(p) {
    if (!p || typeof p !== "object" || typeof p.unlockedLevel !== "number" || !p.levels) {
      return false;
    }
    return D.LEVELS.every(function(l) {
      var e = p.levels[l.id];
      return e && typeof e.stars === "number" && typeof e.bestScore === "number" && typeof e.completed === "boolean";
    });
  }
  LabFix.Storage = {
    available: ok,
    takeNotices: function() {
      var n = notices;
      notices = [];
      return n;
    },
    register: function(name, pass) {
      var n = String(name || "").trim(), id = n.toLowerCase();
      if (!ok) {
        return { ok: false, error: "Penyimpanan browser tidak tersedia." };
      }
      if (n.length < D.NAME_MIN || n.length > D.NAME_MAX || !/^[A-Za-z0-9_]+$/.test(n)) {
        return { ok: false, error: "Nama pengguna " + D.NAME_MIN + "–" + D.NAME_MAX + " karakter: huruf, angka, atau _." };
      }
      if (String(pass).length < D.PASS_MIN) {
        return { ok: false, error: "Kata sandi minimal " + D.PASS_MIN + " karakter." };
      }
      var u = users();
      if (u[id]) {
        return { ok: false, error: "Nama pengguna sudah dipakai." };
      }
      var salt = Math.random().toString(36).slice(2);
      u[id] = { name: n, salt, hash: hash(salt + pass), createdAt: Date.now() };
      if (!write(K.users, u) || !write(K.session, { uid: id })) {
        return { ok: false, error: "Akun tidak dapat disimpan di browser ini." };
      }
      return { ok: true };
    },
    login: function(name, pass) {
      var id = String(name || "").trim().toLowerCase(), u = users()[id];
      if (!ok) {
        return { ok: false, error: "Penyimpanan browser tidak tersedia." };
      }
      if (!u || u.hash !== hash(u.salt + pass)) {
        return { ok: false, error: "Nama pengguna atau kata sandi salah." };
      }
      write(K.session, { uid: id });
      return { ok: true };
    },
    logout: function() {
      if (ok) {
        try {
          localStorage.removeItem(K.session);
        } catch (e) {
        }
      }
    },
    getProfile: function() {
      if (!ok) {
        return { name: "Tamu" };
      }
      var id = uid();
      return id ? { name: users()[id].name } : null;
    },
    getProgress: function() {
      if (!ok) {
        return defProgress(true);
      }
      var id = uid();
      if (!id) {
        return defProgress(false);
      }
      var p = read(K.progress + "." + id, validProgress, function() {
        return defProgress(false);
      });
      var u = 1;
      while (u < D.LEVELS.length && p.levels[u].completed) {
        u++;
      }
      p.unlockedLevel = u;
      return p;
    },
    getHistory: function() {
      var id = uid();
      return id ? read(K.history + "." + id, Array.isArray, function() {
        return [];
      }) : [];
    },
    totalStars: function() {
      var p = this.getProgress();
      return D.LEVELS.reduce(function(s, l) {
        return s + p.levels[l.id].stars;
      }, 0);
    },
    recordResult: function(levelId, r) {
      var id = uid();
      if (!ok || !id) {
        return { saved: false, newRecord: false };
      }
      var p = this.getProgress(), e = p.levels[levelId], rec = false;
      if (r.won) {
        e.completed = true;
        e.stars = Math.max(e.stars, r.stars);
        if (r.score > e.bestScore) {
          e.bestScore = r.score;
          rec = true;
        }
        p.unlockedLevel = Math.max(p.unlockedLevel, Math.min(D.LEVELS.length, levelId + 1));
      }
      var h = this.getHistory();
      h.unshift({ level: levelId, won: r.won, score: r.score, stars: r.stars, at: Date.now() });
      write(K.progress + "." + id, p);
      write(K.history + "." + id, h.slice(0, D.HISTORY_MAX));
      return { saved: true, newRecord: rec };
    },
    reset: function() {
      var id = uid();
      if (!ok || !id) {
        return;
      }
      try {
        localStorage.removeItem(K.progress + "." + id);
        localStorage.removeItem(K.history + "." + id);
      } catch (e) {
      }
    }
  };
})();
