/* art.js - ilustrasi SVG inline (orang, PC, tanaman) agar bisa dianimasikan lewat CSS */
'use strict';
(function () {
  var L = window.LabFix = window.LabFix || {};

  // Templat orang; {skin} {shirt} {pants} {tool} {hat} diisi per karakter.
  var PERSON =
    '<svg class="person" viewBox="0 0 60 100" aria-hidden="true">' +
    '<ellipse cx="30" cy="97" rx="18" ry="3.5" fill="#000" opacity=".18"/>' +
    '<g class="leg l">' +
    '<rect x="21" y="60" width="9" height="32" rx="4" fill="{pants}"/>' +
    '<rect x="19" y="87" width="13" height="8" rx="4" fill="#12262E"/>' +
    '</g>' +
    '<g class="leg r">' +
    '<rect x="30" y="60" width="9" height="32" rx="4" fill="{pants}"/>' +
    '<rect x="28" y="87" width="13" height="8" rx="4" fill="#12262E"/>' +
    '</g>' +
    '<g class="arm l">' +
    '<rect x="9" y="34" width="9" height="28" rx="4.5" fill="{shirt}"/>' +
    '<circle cx="13.5" cy="63" r="4.5" fill="{skin}"/>' +
    '</g>' +
    '<g class="torso">' +
    '<rect x="15" y="31" width="30" height="36" rx="10" fill="{shirt}"/>' +
    '<rect x="25" y="31" width="10" height="13" rx="3" fill="#fff" opacity=".9"/>' +
    '<rect x="26" y="47" width="8" height="9" rx="1.5" fill="#F59F00"/>' +
    '</g>' +
    '<g class="arm r">' +
    '<rect x="42" y="34" width="9" height="28" rx="4.5" fill="{shirt}"/>{tool}<circle cx="46.5" cy="63" r="4.5" fill="{skin}"/>' +
    '</g>' +
    '<g class="head">' +
    '<rect x="26" y="24" width="8" height="8" fill="{skin}"/>' +
    '<circle cx="30" cy="17" r="12.5" fill="{skin}"/>' +
    '<circle cx="25.5" cy="17" r="1.6" fill="#12262E"/>' +
    '<circle cx="34.5" cy="17" r="1.6" fill="#12262E"/>' +
    '<path d="M26 22q4 3.5 8 0" stroke="#12262E" stroke-width="1.6" fill="none" stroke-linecap="round"/>{hat}</g>' +
    '</svg>';

  // Ilustrasi PC lengkap dengan meja; tampilan layar diatur oleh class status di css/art.css.
  var PC =
    '<svg class="pc-art" viewBox="0 0 92 76" aria-hidden="true">' +
    '<rect class="desk" x="0" y="58" width="92" height="7" rx="3"/>' +
    '<rect class="dleg" x="6" y="65" width="5" height="11"/>' +
    '<rect class="dleg" x="81" y="65" width="5" height="11"/>' +
    '<rect class="tower" x="68" y="22" width="18" height="36" rx="3"/>' +
    '<circle class="led" cx="77" cy="30" r="2.2"/>' +
    '<rect x="71" y="38" width="12" height="2" fill="#8FA8B0"/>' +
    '<rect x="71" y="43" width="12" height="2" fill="#8FA8B0"/>' +
    '<rect class="bezel" x="6" y="4" width="56" height="38" rx="4"/>' +
    '<rect class="scr" x="10" y="8" width="48" height="30" rx="2"/>' +
    '<rect class="win" x="14" y="12" width="10" height="8" rx="1"/>' +
    '<rect class="win" x="14" y="24" width="10" height="8" rx="1"/>' +
    '<rect class="win" x="28" y="12" width="26" height="20" rx="1"/>' +
    '<rect class="bar" x="16" y="20" width="36" height="6" rx="3"/>' +
    '<text class="t-bad" x="34" y="31">!</text>' +
    '<text class="t-ok" x="34" y="31">✓</text>' +
    '<rect class="bezel" x="29" y="42" width="10" height="8"/>' +
    '<rect class="bezel" x="22" y="50" width="24" height="4" rx="2"/>' +
    '<rect class="kb" x="46" y="54.5" width="20" height="3.5" rx="1.5"/>' +
    '</svg>';

  var PLANT =
    '<svg class="plant-art" viewBox="0 0 40 60" aria-hidden="true">' +
    '<path d="M20 38C8 34 6 18 10 8c8 4 12 14 10 30z" fill="#2B8A3E"/>' +
    '<path d="M20 38c12-4 14-20 10-30-8 4-12 14-10 30z" fill="#37B24D"/>' +
    '<path d="M20 40C18 28 18 16 20 4c2 12 2 24 0 36z" fill="#2F9E44"/>' +
    '<path d="M9 40h22l-3 18H12z" fill="#C2410C"/>' +
    '<rect x="7" y="37" width="26" height="6" rx="2" fill="#EA580C"/>' +
    '</svg>';

  L.Art = {
    TECH: {
      skin: '#F1C27D',
      shirt: '#0B7285',
      pants: '#2B3F47',
      tool: '<rect x="44" y="64" width="5" height="17" rx="2" fill="#8FA8B0"/>' +
        '<circle cx="46.5" cy="82" r="4.5" fill="#8FA8B0"/>',
      hat: '<path d="M16.5 14a13.5 13.5 0 0 1 27 0z" fill="#F59F00"/>' +
        '<rect x="14" y="13" width="32" height="4" rx="2" fill="#F59F00"/>'
    },
    STUDENT: {
      skin: '#C68642',
      shirt: '#F1F5F9',
      pants: '#1C3D7A',
      tool: '',
      hat: '<path d="M17.5 15a12.5 12.5 0 0 1 25 0q-6-5-12.5-3-6.5-2-12.5 3z" fill="#3B2A20"/>'
    },
    person: function (c) {
      return PERSON.replace(/\{(\w+)\}/g, function (m, k) { return c[k] || ''; });
    },
    pc: PC,
    plant: PLANT
  };
})();
