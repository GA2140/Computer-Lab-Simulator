// auth.js - halaman masuk dan daftar
"use strict";
(function() {
  var L = window.LabFix, S = L.Storage, U = L.UI, $ = U.$;
  if (S.getProfile()) {
    location.replace("index.html");
    return;
  }
  var form = $("auth-form"), reg = form.getAttribute("data-mode") === "register";
  var msg = new URLSearchParams(location.search).get("msg");
  U.showBanners();
  if (msg === "login") {
    U.toast("Masuk dulu untuk bermain.", "warn");
  }
  form.addEventListener("submit", function(ev) {
    ev.preventDefault();
    var user = $("f-user").value, pass = $("f-pass").value, err = $("auth-error");
    if (reg && pass !== $("f-pass2").value) {
      err.textContent = "Kata sandi dan pengulangannya tidak sama.";
      return;
    }
    var r = reg ? S.register(user, pass) : S.login(user, pass);
    if (!r.ok) {
      err.textContent = r.error;
      return;
    }
    location.href = "index.html";
  });
})();
