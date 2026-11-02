// data.js - data tetap: aturan skor, jenis kerusakan, dan konfigurasi level
'use strict';
(function () {
  var LabFix = window.LabFix = window.LabFix || {};

  LabFix.Data = {
    // Batas input akun
    NAME_MIN: 3, NAME_MAX: 16, PASS_MIN: 4,

    // Waktu (ms / detik) dan batas riwayat
    ANIM_MS: 800, TICK_MS: 100, LOW_TIME_SEC: 10,
    HISTORY_MAX: 20, HISTORY_SHOWN: 10,

    // Aturan skor
    SCORE: {
      correct: 100, priority: 50,
      comboEvery: 3, comboBonus: 50,
      wrong: 25, wrongTime: 5,
      win: 200, perSecond: 5
    },

    // Enam jenis kerusakan: gejala yang tampil dan tindakan yang benar
    FAULTS: [
      { id: 'F1', name: 'Daya', symptoms: ['Lampu indikator mati', 'Kipas & layar tidak menyala'],
        action: 'Periksa kabel daya' },
      { id: 'F2', name: 'Jaringan', symptoms: ['Ikon jaringan silang', 'Halaman ujian gagal dimuat'],
        action: 'Periksa kabel jaringan' },
      { id: 'F3', name: 'OS', symptoms: ['Layar biru (BSOD)', 'PC restart berulang'],
        action: 'Jalankan pemulihan sistem' },
      { id: 'F4', name: 'Virus', symptoms: ['PC sangat lambat', 'Pop-up iklan aneh'],
        action: 'Jalankan pemindaian antivirus' },
      { id: 'F5', name: 'Periferal', symptoms: ['Kursor tidak bergerak', 'Ketik tidak muncul'],
        action: 'Pasang ulang periferal' },
      { id: 'F6', name: 'Monitor', symptoms: ['Monitor gelap', 'Pesan No Signal'],
        action: 'Periksa kabel monitor' }
    ],

    // Level: grid, jumlah PC rusak/prioritas, waktu (detik), jumlah kerusakan berulang, ambang bintang
    LEVELS: [
      {
        id: 1, name: 'Shift Pertama', cols: 2, rows: 3,
        broken: 3, priority: 0, time: 90, repeat: 0,
        faults: ['F1', 'F2', 'F6'],
        star2: 550, star3: 700
      },
      {
        id: 2, name: 'Jam Praktik', cols: 3, rows: 3,
        broken: 5, priority: 2, time: 85, repeat: 0,
        faults: ['F1', 'F2', 'F3', 'F5', 'F6'],
        star2: 750, star3: 950
      },
      {
        id: 3, name: 'Ujian Praktik', cols: 3, rows: 4,
        broken: 7, priority: 2, time: 90, repeat: 1,
        faults: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'],
        star2: 950, star3: 1150
      },
      {
        id: 4, name: 'Lab Multimedia', cols: 4, rows: 3,
        broken: 8, priority: 3, time: 90, repeat: 2,
        faults: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'],
        star2: 1100, star3: 1350
      },
      {
        id: 5, name: 'Server Kampus', cols: 4, rows: 4,
        broken: 10, priority: 3, time: 100, repeat: 4,
        faults: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'],
        star2: 1500, star3: 1650
      },
      {
        id: 6, name: 'Ujian Nasional', cols: 4, rows: 5,
        broken: 12, priority: 4, time: 120, repeat: 6,
        faults: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'],
        star2: 1850, star3: 2000
      }
    ]
  };
})();
