# LabFix

Gim simulasi lab komputer berbasis HTML, CSS, dan JavaScript murni (tanpa build). Kamu jadi petugas lab: baca gejala, pilih tindakan yang tepat, selesaikan minigame perbaikan, dan siapkan semua PC sebelum waktu habis.

## Menjalankan
Buka `index.html`, atau jalankan `python -m http.server` lalu buka http://localhost:8000. Daftar/masuk dulu; akun dan progres tersimpan di localStorage browser.

Deploy ke Vercel: unggah folder ini sebagai proyek statis (Framework Preset: Other, tanpa build command, output di root).

## Fitur
- 6 level; level terbuka berurutan setelah level sebelumnya dimenangkan.
- 6 jenis kerusakan, masing-masing dengan minigame singkat.
- Teknisi yang berjalan ke PC, siswa yang duduk di PC dan lari keluar saat PC rusak mendadak.
- Mode terang/gelap otomatis, papan skor, dan penyimpanan lokal.

## Struktur folder
```
labfix/
├── index.html, game.html, scores.html, how-to-play.html, login.html, register.html
├── css/
│   ├── base.css         token warna, tipografi, topbar
│   ├── components.css   tombol, kartu, modal, toast, tabel
│   ├── pages.css        menu, hero, auth
│   ├── game.css         HUD, grid PC, panel inspeksi, minigame
│   └── art.css          karakter, PC SVG, dekorasi lantai
├── js/
│   ├── core/            data.js (level & aturan), storage.js (akun/progres), ui.js, art.js (aset SVG inline)
│   ├── game/            engine.js (logika gim), minigames.js
│   └── pages/           home.js, scores.js, auth.js, rules.js, play.js (kontroler halaman gim)
├── assets/
│   ├── brand/           logo.svg, favicon.svg
│   ├── characters/      technician.svg, student.svg
│   └── props/           pc-desk.svg, plant.svg
└── tools/build_preview.py   membuat dist/preview.html (satu file untuk pratinjau)
```
Urutan script di tiap halaman: `core/data` → `core/storage` → `core/ui` → (`core/art`, `game/*`) → `pages/*`.

## Pratinjau satu file
`python tools/build_preview.py` menghasilkan `dist/preview.html` berisi semua halaman, lengkap dengan akun demo.
