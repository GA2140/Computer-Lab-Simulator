// engine.js - logika gim murni (tanpa DOM): status PC, skor, timer, kerusakan acak
"use strict";
(function() {
  var LabFix = window.LabFix = window.LabFix || {};
  var D = LabFix.Data, S = D.SCORE;
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }
  function range(n) {
    var r = [];
    for (var i = 0; i < n; i++) {
      r.push(i);
    }
    return r;
  }
  function create(levelId) {
    var lv = D.LEVELS[levelId - 1], total = lv.cols * lv.rows, pcs = [], i;
    for (i = 0; i < total; i++) {
      pcs.push({ id: i, status: "healthy", fault: null, priority: false });
    }
    var faults = lv.faults.slice();
    for (i = 0; i < lv.repeat; i++) {
      faults.push(lv.faults[Math.floor(Math.random() * lv.faults.length)]);
    }
    shuffle(faults);
    var prio = shuffle(range(lv.broken)).slice(0, lv.priority);
    shuffle(range(total)).slice(0, lv.broken).forEach(function(p, k) {
      pcs[p].status = "broken";
      pcs[p].fault = faults[k];
      pcs[p].priority = prio.indexOf(k) > -1;
    });
    return {
      level: lv,
      pcs,
      state: "briefing",
      remaining: lv.time * 1e3,
      score: 0,
      streak: 0,
      maxStreak: 0,
      extra: Math.min(3, Math.ceil(lv.id / 2)),
      cool: 6e3,
      acc: 0,
      correct: 0,
      wrong: 0,
      busy: false,
      pending: null,
      resultSaved: false,
      stars: 0
    };
  }
  function ready(g) {
    return g.pcs.filter(function(p) {
      return p.status === "healthy" || p.status === "fixed";
    }).length;
  }
  function maybeBreak(g) {
    if (g.extra <= 0 || g.cool > 0 || g.busy || g.remaining < 8e3 || Math.random() > 0.12) {
      return;
    }
    var h = g.pcs.filter(function(p) {
      return p.status === "healthy";
    });
    if (!h.length) {
      return;
    }
    var pc = h[Math.floor(Math.random() * h.length)];
    pc.status = "broken";
    pc.priority = false;
    pc.fault = g.level.faults[Math.floor(Math.random() * g.level.faults.length)];
    g.extra--;
    g.cool = 7e3;
  }
  function end(g, won) {
    g.state = won ? "won" : "lost";
    if (won) {
      g.score += S.win + S.perSecond * Math.floor(g.remaining / 1e3);
      g.stars = g.score >= g.level.star3 ? 3 : g.score >= g.level.star2 ? 2 : 1;
    }
  }
  LabFix.Game = {
    create,
    ready,
    start: function(g) {
      if (g.state === "briefing") {
        g.state = "running";
      }
    },
    pause: function(g) {
      if (g.state === "running") {
        g.state = "paused";
      }
    },
    resume: function(g) {
      if (g.state === "paused") {
        g.state = "running";
      }
    },
    tick: function(g, ms) {
      if (g.state !== "running") {
        return;
      }
      g.remaining = Math.max(0, g.remaining - ms);
      g.acc += ms;
      if (g.acc >= 1e3) {
        g.acc -= 1e3;
        g.cool -= 1e3;
        maybeBreak(g);
      }
      if (g.remaining === 0 && !g.busy) {
        end(g, false);
      }
    },
    choose: function(g, pcId, faultId) {
      var pc = g.pcs[pcId];
      if (g.state !== "running" || g.busy || g.remaining <= 0 || !pc || pc.status !== "broken") {
        return null;
      }
      var ok = faultId === pc.fault, pts = 0;
      g.busy = true;
      g.pending = { pc: pcId, correct: ok };
      if (ok) {
        pc.status = "repairing";
        g.correct++;
        g.streak++;
        g.maxStreak = Math.max(g.maxStreak, g.streak);
        pts = S.correct + (pc.priority ? S.priority : 0) + (g.streak % S.comboEvery === 0 ? S.comboBonus : 0);
        g.score += pts;
      } else {
        g.wrong++;
        g.streak = 0;
        g.score = Math.max(0, g.score - S.wrong);
        g.remaining = Math.max(0, g.remaining - S.wrongTime * 1e3);
      }
      return { correct: ok, points: pts };
    },
    finish: function(g) {
      if (!g.pending) {
        return;
      }
      if (g.pending.correct) {
        g.pcs[g.pending.pc].status = "fixed";
      }
      g.busy = false;
      g.pending = null;
      if (g.state !== "running" && g.state !== "paused") {
        return;
      }
      if (ready(g) === g.pcs.length) {
        end(g, true);
      } else if (g.remaining <= 0) {
        end(g, false);
      }
    },
    result: function(g) {
      return {
        won: g.state === "won",
        score: g.score,
        stars: g.stars,
        left: Math.floor(g.remaining / 1e3),
        correct: g.correct,
        wrong: g.wrong,
        maxStreak: g.maxStreak
      };
    }
  };
})();
