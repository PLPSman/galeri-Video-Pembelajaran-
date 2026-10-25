/* =====================================================================
   ANIMASI LATAR HERO — "ALIRAN ILMU"
   - Pita cahaya: puluhan garis halus yang mengalir seperti kain sutra
     dengan gradien warna-warni, plus "komet" cahaya yang meluncur di atasnya
   - Simbol ilmu (π, ∑, H₂O, E=mc², Aa, ...) melayang pelan ke atas
   - Kursor / jari menekuk pita; klik atau ketuk memunculkan riak gelombang
   Dibuat dengan <canvas> tanpa library. File ini tidak perlu diedit.
   ===================================================================== */
(function () {
  "use strict";

  var canvas = document.getElementById("particles");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var hero = canvas.parentElement;

  // Simbol yang melayang (boleh ditambah/diganti)
  var SIMBOL = ["π", "∑", "√x", "H₂O", "E=mc²", "Aa", "ABC", "x²", "∞", "△", "%", "∫", "α", "β", "Fe", "DNA", "♪", "a+b", "Rp", "?"];

  var mediaGerak = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var lebar = 0, tinggi = 0, langkahX = 12;
  var garis = [], simbol = [], riak = [], gradien = null, gelap = false;
  var kursor = { x: -9999, y: -9999, tx: -9999, ty: -9999, aktif: false, px: 0, py: 0 };
  var berjalan = false, idFrame = 0, terlihat = true, t = 0;

  function kurangiGerak() { return !!(mediaGerak && mediaGerak.matches); }

  // ---------- Tema & warna ----------
  function bacaTema() {
    gelap = document.documentElement.getAttribute("data-theme") === "dark";
    buatGradien();
  }
  function buatGradien() {
    if (!lebar) return;
    gradien = ctx.createLinearGradient(0, 0, lebar, 0);
    // Sisi kiri (tempat teks) dibuat lebih samar supaya tulisan tetap mudah dibaca
    var warna = gelap
      ? ["rgba(143,179,255,0.2)", "rgba(143,179,255,0.8)", "#2dd4bf", "#fcd34d"]
      : ["rgba(19,63,143,0.2)", "rgba(19,63,143,0.8)", "#0d9488", "#e0a100"];
    warna.forEach(function (w, i) { gradien.addColorStop(i / (warna.length - 1), w); });
  }

  // ---------- Ukuran & isi ----------
  function ukurUlang() {
    var rect = hero.getBoundingClientRect();
    if (!rect.width || !rect.height) return false; // hero sedang disembunyikan
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    lebar = rect.width;
    tinggi = rect.height;
    canvas.width = Math.round(lebar * dpr);
    canvas.height = Math.round(tinggi * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buatIsi();
    buatGradien();
    return true;
  }

  function buatIsi() {
    var hp = lebar < 640;
    langkahX = hp ? 14 : 12;

    // Pita: garis tengah paling terang, makin ke tepi makin tipis
    var n = hp ? 16 : 26;
    garis = [];
    for (var i = 0; i < n; i++) {
      var posisi = i / (n - 1) - 0.5;           // -0.5 ... 0.5
      garis.push({
        posisi: posisi,
        fase: i * 0.32,
        alpha: 0.1 + 0.42 * (1 - Math.abs(posisi) * 2),
        tebal: Math.abs(posisi) < 0.08 ? 1.6 : 1
      });
    }

    // Simbol melayang dengan kedalaman (z) berbeda-beda
    var jumlahSimbol = hp ? 10 : 18;
    simbol = [];
    for (var k = 0; k < jumlahSimbol; k++) simbol.push(buatSimbol(true));
  }

  function buatSimbol(acakY) {
    var z = 0.35 + Math.random() * 0.65;
    return {
      x: Math.random() * lebar,
      y: acakY ? Math.random() * tinggi : tinggi + 40,
      z: z,
      teks: SIMBOL[Math.floor(Math.random() * SIMBOL.length)],
      ukuran: (lebar < 640 ? 16 : 20) + z * (lebar < 640 ? 14 : 22),
      naik: 0.12 + z * 0.3,
      ayun: Math.random() * Math.PI * 2,
      putar: (Math.random() - 0.5) * 0.5
    };
  }

  // ---------- Posisi Y sebuah titik pada pita ----------
  function yPita(g, x) {
    // Jalur pita dibuat menghindari teks:
    // - komputer: melengkung dari bawah-kiri naik ke kanan (lewat belakang orbit)
    // - HP: hampir mendatar di bagian bawah (lewat belakang orbit)
    var dasar = lebar < 640
      ? tinggi * (0.76 - 0.1 * (x / lebar))
      : tinggi * (0.93 - 0.5 * Math.pow(Math.max(0, x / lebar), 1.6));
    var mekar = tinggi * 0.2 * g.posisi * (0.55 + 0.45 * Math.sin(x * 0.0035 + t * 0.5));
    var y = dasar + mekar +
      tinggi * 0.06 * Math.sin(x * 0.0055 + t * 0.8 + g.fase * 0.25) +
      tinggi * 0.022 * Math.sin(x * 0.012 - t * 0.65 + g.fase);

    // Tekukan karena kursor/jari
    if (kursor.aktif) {
      var dx = x - kursor.x, dy = y - kursor.y, d2 = dx * dx + dy * dy, R = 170;
      if (d2 < R * R) {
        var k = 1 - Math.sqrt(d2) / R;
        y += (dy >= 0 ? 1 : -1) * k * k * 46;
      }
    }
    // Riak gelombang dari ketukan
    for (var i = 0; i < riak.length; i++) {
      var r = riak[i];
      var ex = x - r.x, ey = y - r.y;
      var selisih = Math.sqrt(ex * ex + ey * ey) - r.r;
      if (selisih > -70 && selisih < 70) {
        y += Math.sin((selisih / 70) * Math.PI) * r.kuat * (1 - Math.abs(selisih) / 70);
      }
    }
    return y;
  }

  // ---------- Gerak ----------
  function gerakkan() {
    t += 0.012;
    // kursor dihaluskan supaya tekukan terasa lembut
    if (kursor.aktif) {
      kursor.x += (kursor.tx - kursor.x) * 0.18;
      kursor.y += (kursor.ty - kursor.y) * 0.18;
    }
    var i;
    for (i = riak.length - 1; i >= 0; i--) {
      riak[i].r += 7;
      riak[i].kuat *= 0.965;
      if (riak[i].kuat < 0.6) riak.splice(i, 1);
    }
    for (i = 0; i < simbol.length; i++) {
      var s = simbol[i];
      s.y -= s.naik;
      s.ayun += 0.01;
      if (s.y < -50) simbol[i] = buatSimbol(false);
    }
  }

  // ---------- Gambar ----------
  function gambar() {
    ctx.clearRect(0, 0, lebar, tinggi);
    var i, x;

    // 1) Simbol ilmu (di belakang pita), bergeser sedikit mengikuti kursor (paralaks)
    for (i = 0; i < simbol.length; i++) {
      var s = simbol[i];
      var alpha = (gelap ? 0.05 : 0.05) + s.z * (gelap ? 0.12 : 0.1);
      ctx.save();
      ctx.translate(s.x + Math.sin(s.ayun) * 14 - kursor.px * 24 * s.z, s.y - kursor.py * 16 * s.z);
      ctx.rotate(s.putar + Math.sin(s.ayun * 0.7) * 0.08);
      ctx.font = "700 " + s.ukuran.toFixed(0) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillStyle = gelap ? "rgba(191, 210, 255," + alpha.toFixed(3) + ")" : "rgba(19, 63, 143," + alpha.toFixed(3) + ")";
      ctx.textAlign = "center";
      ctx.fillText(s.teks, 0, 0);
      ctx.restore();
    }

    // 2) Pita cahaya
    if (gelap) ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = gradien;
    for (i = 0; i < garis.length; i++) {
      var g = garis[i];
      ctx.globalAlpha = g.alpha;
      ctx.lineWidth = g.tebal;
      ctx.beginPath();
      for (x = -langkahX; x <= lebar + langkahX; x += langkahX) {
        var y = yPita(g, x);
        if (x === -langkahX) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 3) Komet cahaya yang meluncur di sepanjang pita
    var komet = [garis[Math.floor(garis.length * 0.5)], garis[Math.floor(garis.length * 0.3)], garis[Math.floor(garis.length * 0.72)]];
    for (i = 0; i < komet.length; i++) {
      if (!komet[i]) continue;
      var maju = ((t * (0.09 + i * 0.03) + i * 0.37) % 1.2) - 0.1; // 0..1 melintasi layar
      var kx = maju * lebar, ky = yPita(komet[i], kx);
      var cahaya = ctx.createRadialGradient(kx, ky, 0, kx, ky, 26);
      cahaya.addColorStop(0, "rgba(255,255,255,0.95)");
      cahaya.addColorStop(0.25, gelap ? "rgba(252,211,77,0.55)" : "rgba(246,181,0,0.45)");
      cahaya.addColorStop(1, "rgba(246,181,0,0)");
      ctx.fillStyle = cahaya;
      ctx.beginPath();
      ctx.arc(kx, ky, 26, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function loop() {
    gerakkan();
    gambar();
    idFrame = requestAnimationFrame(loop);
  }

  function mulai() {
    if (berjalan) return;
    var rect = hero.getBoundingClientRect();
    if (Math.abs(rect.width - lebar) > 1 || Math.abs(rect.height - tinggi) > 1) {
      if (!ukurUlang()) return;
    }
    if (kurangiGerak()) { gambar(); return; } // mode statis: gambar sekali saja
    berjalan = true;
    idFrame = requestAnimationFrame(loop);
  }

  function berhenti() {
    berjalan = false;
    cancelAnimationFrame(idFrame);
  }

  function perbarui() {
    if (terlihat && !document.hidden) mulai(); else berhenti();
  }

  // ---------- Interaksi kursor & sentuhan ----------
  function posisi(e) {
    var rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  hero.addEventListener("pointermove", function (e) {
    var p = posisi(e);
    if (!kursor.aktif) { kursor.x = p.x; kursor.y = p.y; }
    kursor.tx = p.x; kursor.ty = p.y; kursor.aktif = true;
    // untuk paralaks simbol (-0.5 ... 0.5)
    kursor.px = p.x / lebar - 0.5;
    kursor.py = p.y / tinggi - 0.5;
  }, { passive: true });
  hero.addEventListener("pointerdown", function (e) {
    if (!berjalan) return;
    if (e.target.closest && e.target.closest("a, button")) return; // jangan ganggu klik tombol
    var p = posisi(e);
    riak.push({ x: p.x, y: p.y, r: 0, kuat: lebar < 640 ? 22 : 30 });
    if (riak.length > 4) riak.shift();
  }, { passive: true });
  function lepas(e) {
    if (e.type === "pointerleave" || e.pointerType !== "mouse") kursor.aktif = false;
  }
  hero.addEventListener("pointerleave", lepas);
  hero.addEventListener("pointerup", lepas);
  hero.addEventListener("pointercancel", lepas);

  // ---------- Ubah ukuran jendela ----------
  var timerResize, lebarTerakhir = window.innerWidth;
  window.addEventListener("resize", function () {
    // Di HP, address bar yang muncul/hilang mengubah tinggi layar; abaikan jika lebar sama
    if (window.innerWidth === lebarTerakhir && lebar < 640) return;
    lebarTerakhir = window.innerWidth;
    clearTimeout(timerResize);
    timerResize = setTimeout(function () {
      if (ukurUlang() && kurangiGerak()) gambar();
    }, 200);
  });

  // ---------- Hemat baterai: berhenti bila hero tidak terlihat ----------
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entri) {
      terlihat = entri[0].isIntersecting;
      perbarui();
    }).observe(hero);
  }
  document.addEventListener("visibilitychange", perbarui);

  // ---------- Ikuti pergantian tema ----------
  new MutationObserver(function () {
    bacaTema();
    if (!berjalan) gambar();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  // ---------- Ikuti pengaturan "kurangi gerakan" ----------
  if (mediaGerak) {
    var gantiGerak = function () { berhenti(); perbarui(); };
    if (mediaGerak.addEventListener) mediaGerak.addEventListener("change", gantiGerak);
    else if (mediaGerak.addListener) mediaGerak.addListener(gantiGerak);
  }

  // Gambar ulang setelah font selesai dimuat (supaya simbol memakai font yang benar)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (!berjalan && lebar) gambar(); });
  }

  // ---------- Mulai ----------
  ukurUlang();
  bacaTema();
  perbarui();
})();
