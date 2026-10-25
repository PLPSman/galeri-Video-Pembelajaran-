/* =====================================================================
   LOGIKA UTAMA WEBSITE
   Mengatur: tampilan prodi & video, routing (#/prodi/...), pencarian,
   pemutar video (modal), tema gelap/terang, navbar, dan animasi.
   Data diambil dari js/data.js. File ini tidak perlu diedit.
   ===================================================================== */
(function () {
  "use strict";

  // ---------- 0. Pastikan data.js berhasil dimuat ----------
  if (typeof CONFIG === "undefined" || typeof DAFTAR_PRODI === "undefined") {
    var app = document.getElementById("app");
    if (app) {
      app.innerHTML =
        '<div class="container" style="padding:80px 0"><div class="empty"><span class="empty-icon">⚠️</span>' +
        "<h3>Data belum terbaca</h3><p>File <code>js/data.js</code> tidak ditemukan atau ada salah ketik " +
        "(misalnya koma atau tanda kutip yang hilang). Periksa kembali file tersebut.</p></div></div>";
    }
    console.error("Error: CONFIG atau DAFTAR_PRODI tidak ditemukan. Periksa file js/data.js.");
    return;
  }

  var $ = function (sel, akar) { return (akar || document).querySelector(sel); };
  var $$ = function (sel, akar) { return Array.prototype.slice.call((akar || document).querySelectorAll(sel)); };
  var mediaGerak = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function kurangiGerak() { return !!(mediaGerak && mediaGerak.matches); }

  // =================================================================
  // 1. FUNGSI BANTU
  // =================================================================

  // Amankan teks sebelum dimasukkan ke HTML
  function esc(teks) {
    return String(teks == null ? "" : teks).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Ambil ID video (11 karakter) dari berbagai format link YouTube.
  // Mengembalikan null jika link belum valid (misalnya masih "GANTI_DENGAN_LINK_YOUTUBE").
  function ambilIdYoutube(link) {
    if (typeof link !== "string") return null;
    link = link.trim();
    if (!link || /GANTI/i.test(link)) return null;
    var ID = "([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])";
    var pola = [
      new RegExp("youtu\\.be/" + ID, "i"),                                         // youtu.be/ID
      new RegExp("youtube(?:-nocookie)?\\.com/(?:embed|shorts|live|v)/" + ID, "i"), // /embed/ID, /shorts/ID
      new RegExp("youtube\\.com/.*[?&]v=" + ID, "i")                               // watch?v=ID
    ];
    for (var i = 0; i < pola.length; i++) {
      var cocok = link.match(pola[i]);
      if (cocok) return cocok[1];
    }
    if (/^[A-Za-z0-9_-]{11}$/.test(link)) return link; // hanya ID saja
    return null;
  }

  // Huruf kecil + hilangkan aksen, untuk pencarian yang lebih toleran
  function normal(teks) {
    teks = String(teks || "").toLowerCase();
    return teks.normalize ? teks.normalize("NFD").replace(/[̀-ͯ]/g, "") : teks;
  }

  function escRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  // Tandai (highlight) kata yang dicari dengan <mark>
  function sorot(teks, kataKunci) {
    teks = String(teks || "");
    if (!kataKunci.length) return esc(teks);
    var re = new RegExp("(" + kataKunci.map(escRegex).join("|") + ")", "gi");
    return teks.split(re).map(function (bagian, i) {
      return i % 2 ? "<mark>" + esc(bagian) + "</mark>" : esc(bagian);
    }).join("");
  }

  // Ganti warna jadi aman dipakai di atribut style
  function warnaAman(w, cadangan) { return /^#[0-9a-f]{3,8}$/i.test(w || "") ? w : cadangan; }

  // =================================================================
  // 2. SIAPKAN DATA (hanya video dengan link valid yang dipakai)
  //    Video berasal dari 2 sumber:
  //    a) js/data.js
  //    b) spreadsheet Google (video yang diupload lewat halaman Upload)
  // =================================================================
  var semuaVideo = [];
  var videoSheet = [];   // video dari spreadsheet (diisi setelah dimuat)
  var daftarProdi = DAFTAR_PRODI.map(function (p) {
    var warna = p.warna || [];
    return {
      id: String(p.id || "").trim(),
      nama: p.nama || "Program Studi",
      singkatan: p.singkatan || "",
      deskripsi: p.deskripsi || "",
      ikon: p.ikon || "🎓",
      c1: warnaAman(warna[0], "#2563eb"),
      c2: warnaAman(warna[1], "#7c3aed"),
      asli: p.video || [],  // video dari data.js
      videos: []            // gabungan yang ditampilkan
    };
  });

  function tambahItem(prodi, v, sumber) {
    var id = ambilIdYoutube(v && v.link);
    if (!id) return false;
    var item = {
      idx: semuaVideo.length,
      id: id,
      judul: v.judul || "Tanpa judul",
      topik: v.topik || "",
      prodi: prodi,
      sumber: sumber,          // "data" atau "upload"
      idSheet: v.id || "",     // dipakai untuk menghapus video upload
      waktu: v.waktu || ""
    };
    item.teksCari = normal([item.judul, item.topik, prodi.nama, prodi.singkatan].join(" "));
    semuaVideo.push(item);
    prodi.videos.push(item);
    return true;
  }

  // Susun ulang semua video dari kedua sumber
  function susunVideo() {
    var dilewati = 0;
    semuaVideo = [];
    daftarProdi.forEach(function (p) { p.videos = []; });
    daftarProdi.forEach(function (p) {
      p.asli.forEach(function (v) { if (!tambahItem(p, v, "data")) dilewati++; });
    });
    videoSheet.forEach(function (v) {
      var p = cariProdi(v.prodi);
      if (p) tambahItem(p, v, "upload");
    });
    return dilewati;
  }

  var jumlahDilewati = susunVideo();
  if (jumlahDilewati) {
    console.info("Info: " + jumlahDilewati + " entri video di js/data.js disembunyikan karena link YouTube belum diisi/valid.");
  }

  function cariProdi(id) {
    for (var i = 0; i < daftarProdi.length; i++) if (daftarProdi[i].id === id) return daftarProdi[i];
    return null;
  }

  function gayaWarna(prodi) { return "--c1:" + prodi.c1 + ";--c2:" + prodi.c2; }

  // =================================================================
  // 3. ISI TEKS DARI CONFIG (hero, navbar, footer)
  // =================================================================
  $$("[data-config]").forEach(function (el) {
    var kunci = el.getAttribute("data-config");
    if (CONFIG[kunci] != null && CONFIG[kunci] !== "") el.textContent = CONFIG[kunci];
  });

  var judulDasar = (CONFIG.judulSitus || "Galeri Video Pembelajaran") + " — " + (CONFIG.subjudul || "FKIP Universitas Riau");
  var labelKelas = CONFIG.kelas ? "Kelas " + CONFIG.kelas : "";
  document.title = judulDasar;

  // Logo kampus di footer (gambar jika diisi, teks "UNRI" jika kosong)
  var logo = $("#footer-logo");
  if (CONFIG.logo) {
    logo.classList.add("has-img");
    logo.innerHTML = '<img src="' + esc(CONFIG.logo) + '" alt="Logo ' + esc(CONFIG.universitas || "Universitas Riau") + '">';
  } else {
    logo.setAttribute("role", "img");
    logo.setAttribute("aria-label", "Logo " + (CONFIG.universitas || "Universitas Riau"));
  }

  // Daftar tim penyusun di footer
  var tim = Array.isArray(CONFIG.timPenyusun) ? CONFIG.timPenyusun.filter(Boolean) : [];
  if (tim.length) {
    $("#footer-tim").innerHTML = tim.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("");
  } else {
    $("#footer-tim-wrap").hidden = true;
  }

  // Tautan cepat ke semua prodi di footer
  $("#footer-prodi").innerHTML = daftarProdi.map(function (p) {
    return '<li><a href="#/prodi/' + encodeURIComponent(p.id) + '"><span aria-hidden="true">' + esc(p.ikon) + "</span>" +
      esc(p.nama.replace(/^Pendidikan\s+/i, "")) + "</a></li>";
  }).join("");

  // Pita teks berjalan: nama prodi ditulis 2 kali supaya bisa berputar tanpa putus
  var isiPita = daftarProdi.map(function (p) { return "<span>" + esc(p.nama.replace(/^Pendidikan\s+/i, "").replace(/\s*\(.*?\)/g, "")) + "</span>"; }).join("");
  $$("[data-ticker]").forEach(function (el) { el.innerHTML = isiPita + isiPita; });

  // =================================================================
  // 4. TAMPILAN: statistik, kartu prodi, kartu video
  // =================================================================
  var ikonPlay = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
  var ikonPanah = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  // Nama pendek prodi untuk efek mengetik ("Pendidikan Kimia" -> "Kimia")
  function namaPendek(p) {
    var n = p.nama.replace(/^Pendidikan\s+/i, "").replace(/\s*\(.*?\)\s*/g, " ").trim();
    return n.length > 18 && p.singkatan ? p.singkatan : n;
  }

  // Efek mengetik: nama prodi muncul huruf demi huruf, lalu terhapus, bergantian
  (function efekMengetik() {
    var teksEl = $("#typer"), emojiEl = $("#typer-emoji");
    if (!teksEl || !daftarProdi.length) return;
    var baris = teksEl.parentNode;
    if (kurangiGerak()) return; // biarkan teks statis "apa saja"

    var iProdi = 0, iHuruf = 0, menghapus = false;
    function pasangProdi(p) {
      baris.style.setProperty("--c1", p.c1);
      baris.style.setProperty("--c2", p.c2);
      emojiEl.textContent = p.ikon;
      emojiEl.classList.remove("pop");
      void emojiEl.offsetWidth; // mulai ulang animasi
      emojiEl.classList.add("pop");
    }
    function ketik() {
      var teks = namaPendek(daftarProdi[iProdi]);
      if (!menghapus) {
        iHuruf++;
        teksEl.textContent = teks.slice(0, iHuruf);
        if (iHuruf >= teks.length) { menghapus = true; setTimeout(ketik, 1700); return; }
        setTimeout(ketik, 65 + Math.random() * 60);
      } else {
        iHuruf--;
        teksEl.textContent = teks.slice(0, iHuruf);
        if (iHuruf <= 0) {
          menghapus = false;
          iProdi = (iProdi + 1) % daftarProdi.length;
          pasangProdi(daftarProdi[iProdi]);
          setTimeout(ketik, 280);
          return;
        }
        setTimeout(ketik, 32);
      }
    }
    // Tampilkan "apa saja" sebentar, hapus huruf demi huruf, lalu mulai mengetik nama prodi
    function hapusAwal() {
      var t = teksEl.textContent;
      if (t.length) { teksEl.textContent = t.slice(0, -1); setTimeout(hapusAwal, 40); return; }
      pasangProdi(daftarProdi[0]);
      setTimeout(ketik, 280);
    }
    setTimeout(hapusAwal, 2200);
  })();

  var segarkanOrbit = null; // diisi oleh orbit3D, dipanggil saat jumlah video berubah

  // -----------------------------------------------------------------
  // ORBIT 3D: ikon 11 prodi berputar mengelilingi tombol play.
  // Bisa diseret (mouse/jari) untuk memutar, lalu meluncur pelan.
  // Ikon yang paling depan namanya ditampilkan di bawah orbit.
  // -----------------------------------------------------------------
  (function orbit3D() {
    var wadah = $("#orbit"), lapisan = $("#orbit-items"), keterangan = $("#orbit-caption");
    if (!wadah || !daftarProdi.length) return;

    function labelIkon(p) {
      var n = p.videos.length;
      return p.nama + " (" + (n ? n + " video" : "video segera hadir") + ")";
    }
    lapisan.innerHTML = daftarProdi.map(function (p) {
      return '<a class="orbit-item" href="#/prodi/' + encodeURIComponent(p.id) + '" style="' + gayaWarna(p) +
        '" aria-label="' + esc(labelIkon(p)) + '" draggable="false">' +
        '<span aria-hidden="true">' + esc(p.ikon) + "</span></a>";
    }).join("");
    var ikon = $$(".orbit-item", lapisan);
    var jumlah = ikon.length;

    segarkanOrbit = function () {
      ikon.forEach(function (el, i) { el.setAttribute("aria-label", labelIkon(daftarProdi[i])); });
      if (idDepan >= 0) tandaiDepan(idDepan);
    };

    var KEMIRINGAN = -12 * Math.PI / 180;   // elips sedikit miring
    var KECEPATAN = 0.004;                  // kecepatan putar normal (radian per frame)
    var sudut = -Math.PI / 2, luncur = 0, rx = 180, ry = 70, pusatY = 0;
    var seret = null, lambat = false, fokus = false, idDepan = -1;
    var berjalan = false, idFrame = 0, terlihat = true;

    function ukur() {
      var r = wadah.getBoundingClientRect();
      if (!r.width) return;
      rx = r.width * 0.43;
      ry = rx * 0.36;
      pusatY = 0;
      wadah.style.setProperty("--rx", rx.toFixed(1) + "px");
      wadah.style.setProperty("--ry", ry.toFixed(1) + "px");
      wadah.style.setProperty("--tilt", "-12deg");
    }

    function tata() {
      var cos = Math.cos(KEMIRINGAN), sin = Math.sin(KEMIRINGAN);
      var terdepan = -1, nilaiDepan = -2;
      for (var i = 0; i < jumlah; i++) {
        var a = sudut + (i / jumlah) * Math.PI * 2;
        var ex = Math.cos(a) * rx, ey = Math.sin(a) * ry;
        var x = ex * cos - ey * sin, y = ex * sin + ey * cos + pusatY;
        var dalam = (Math.sin(a) + 1) / 2;          // 0 = paling belakang, 1 = paling depan
        var skala = 0.55 + dalam * 0.6;
        var el = ikon[i];
        el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) scale(" + skala.toFixed(3) + ")";
        el.style.opacity = (0.35 + dalam * 0.65).toFixed(3);
        el.style.zIndex = dalam > 0.5 ? 60 + Math.round(dalam * 40) : Math.round(dalam * 40); // inti = 50
        if (dalam > nilaiDepan) { nilaiDepan = dalam; terdepan = i; }
      }
      if (!fokus && terdepan !== idDepan) tandaiDepan(terdepan);
    }

    function tandaiDepan(i) {
      if (idDepan >= 0 && ikon[idDepan]) ikon[idDepan].classList.remove("depan");
      idDepan = i;
      ikon[i].classList.add("depan");
      var p = daftarProdi[i], n = p.videos.length;
      keterangan.innerHTML = esc(p.ikon) + " " + esc(p.nama) +
        "<small>" + (n ? n + " video pembelajaran" : "Video segera hadir") + "</small>";
      keterangan.classList.remove("ganti");
      void keterangan.offsetWidth;
      keterangan.classList.add("ganti");
    }

    function langkah() {
      if (!seret) {
        var target = lambat ? KECEPATAN * 0.25 : KECEPATAN;
        sudut += target + luncur;
        luncur *= 0.95;
      }
      tata();
      idFrame = requestAnimationFrame(langkah);
    }
    function mulai() {
      if (berjalan || kurangiGerak()) return;
      berjalan = true;
      idFrame = requestAnimationFrame(langkah);
    }
    function berhenti() { berjalan = false; cancelAnimationFrame(idFrame); }
    function perbarui() { if (terlihat && !document.hidden) mulai(); else berhenti(); }

    // --- Seret untuk memutar (mouse & jari). Gulir vertikal tetap bisa. ---
    var klikDiblokir = false;
    wadah.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      seret = { x0: e.clientX, sudut0: sudut, xLalu: e.clientX, tLalu: performance.now(), v: 0, geser: false };
    });
    window.addEventListener("pointermove", function (e) {
      if (!seret) return;
      var dx = e.clientX - seret.x0;
      if (Math.abs(dx) > 6) { seret.geser = true; wadah.classList.add("diseret"); }
      sudut = seret.sudut0 - dx * 0.009;
      var sekarang = performance.now(), dt = Math.max(sekarang - seret.tLalu, 1);
      seret.v = -((e.clientX - seret.xLalu) * 0.009) / dt * 16; // radian per frame
      seret.xLalu = e.clientX; seret.tLalu = sekarang;
      if (!berjalan) tata();
    }, { passive: true });
    function selesaiSeret() {
      if (!seret) return;
      if (seret.geser) { luncur = Math.max(-0.15, Math.min(0.15, seret.v)); klikDiblokir = true; }
      seret = null;
      wadah.classList.remove("diseret");
      setTimeout(function () { klikDiblokir = false; }, 0);
    }
    window.addEventListener("pointerup", selesaiSeret);
    window.addEventListener("pointercancel", function () { seret = null; wadah.classList.remove("diseret"); });
    // Setelah menyeret, jangan sampai ikon yang dilepas ikut "terklik"
    wadah.addEventListener("click", function (e) {
      if (klikDiblokir) { e.preventDefault(); e.stopPropagation(); klikDiblokir = false; }
    }, true);

    // Melambat saat kursor di atas orbit
    wadah.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") lambat = true; });
    wadah.addEventListener("pointerleave", function () { lambat = false; });

    // Navigasi keyboard: ikon yang difokus ditampilkan namanya
    wadah.addEventListener("focusin", function (e) {
      var i = ikon.indexOf(e.target);
      if (i >= 0) { fokus = true; lambat = true; tandaiDepan(i); }
    });
    wadah.addEventListener("focusout", function () { fokus = false; lambat = false; });

    window.addEventListener("resize", function () { ukur(); tata(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entri) { terlihat = entri[0].isIntersecting; perbarui(); }).observe(wadah);
    }
    document.addEventListener("visibilitychange", perbarui);

    ukur();
    tata();
    perbarui();
  })();

  // Angka statistik (dihitung otomatis)
  function aturStatistik() {
    var jumlahTopik = {};
    semuaVideo.forEach(function (v) { if (v.topik) jumlahTopik[normal(v.topik)] = 1; });
    var nilai = { "stat-prodi": daftarProdi.length, "stat-video": semuaVideo.length, "stat-topik": Object.keys(jumlahTopik).length };
    Object.keys(nilai).forEach(function (id) {
      var el = document.getElementById(id);
      var lama = el.getAttribute("data-count");
      el.setAttribute("data-count", nilai[id]);
      // kalau angkanya sudah pernah tampil dan berubah, jalankan ulang animasinya
      if (el.getAttribute("data-sudah") && String(nilai[id]) !== lama) jalankanAngka(el);
    });
  }
  aturStatistik();

  // Kartu prodi
  function hitunganProdi(p) {
    var n = p.videos.length;
    return n
      ? '<span class="prodi-count"><span class="bullet" aria-hidden="true"></span>' + n + " video " + ikonPanah + "</span>"
      : '<span class="prodi-count kosong">Video segera hadir</span>';
  }
  $("#prodi-grid").innerHTML = daftarProdi.map(function (p, i) {
    return '<a class="prodi-card reveal" data-prodi="' + esc(p.id) + '" href="#/prodi/' + encodeURIComponent(p.id) + '" style="' + gayaWarna(p) +
      ";--d:" + (i % 4) * 70 + 'ms">' +
      '<span class="prodi-glow" aria-hidden="true"></span>' +
      '<span class="prodi-top"><span class="prodi-icon" aria-hidden="true">' + esc(p.ikon) + "</span>" +
      '<span class="prodi-abbr">' + esc(p.singkatan) + "</span></span>" +
      '<h3 class="prodi-name">' + esc(p.nama) + "</h3>" +
      '<p class="prodi-desc">' + esc(p.deskripsi) + "</p>" + hitunganProdi(p) + "</a>";
  }).join("");

  // Perbarui semua angka & jumlah video setelah data berubah (misalnya ada upload baru)
  function perbaruiHitungan() {
    $$("#prodi-grid .prodi-card").forEach(function (kartu, i) {
      var lama = $(".prodi-count", kartu);
      if (lama) lama.outerHTML = hitunganProdi(daftarProdi[i]);
    });
    aturStatistik();
    isiFilterProdi();
    if (segarkanOrbit) segarkanOrbit();
  }

  // Satu kartu video. kataKunci dipakai untuk highlight hasil pencarian.
  function kartuVideo(v, urutan, kataKunci, tampilkanProdi) {
    kataKunci = kataKunci || [];
    var chips = v.topik ? '<span class="chip">' + sorot(v.topik, kataKunci) + "</span>" : "";
    return '<article class="video-card reveal" data-idx="' + v.idx + '" style="' + gayaWarna(v.prodi) +
      ";--d:" + (urutan % 3) * 70 + 'ms">' +
      '<button type="button" class="video-thumb" data-idx="' + v.idx + '" aria-label="Putar video: ' + esc(v.judul) + '">' +
      '<img src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="Thumbnail video ' + esc(v.judul) +
      '" loading="lazy" decoding="async" width="480" height="360">' +
      '<span class="play-icon" aria-hidden="true">' + ikonPlay + "</span></button>" +
      '<div class="video-body">' +
      (tampilkanProdi ? '<span class="video-prodi"><span class="bullet" aria-hidden="true"></span>' + sorot(v.prodi.nama, kataKunci) + "</span>" : "") +
      '<h3 class="video-title">' + sorot(v.judul, kataKunci) + "</h3>" +
      (chips ? '<div class="chips">' + chips + "</div>" : "") +
      "</div></article>";
  }

  function emptyState(judul, teks, ikon) {
    return '<div class="empty"><span class="empty-icon" aria-hidden="true">' + (ikon || "🎬") + "</span>" +
      "<h3>" + esc(judul) + "</h3><p>" + esc(teks) + "</p></div>";
  }

  // Thumbnail: efek shimmer saat dimuat, lalu muncul halus.
  // Jika gagal dimuat, tampilkan latar gradien warna prodi.
  function pasangCadanganThumbnail(akar) {
    $$(".video-thumb img", akar).forEach(function (img) {
      var wadah = img.parentNode;
      if (img.complete && img.naturalWidth) { wadah.classList.add("loaded"); return; }
      img.addEventListener("load", function () { wadah.classList.add("loaded"); }, { once: true });
      img.addEventListener("error", function () { wadah.classList.add("thumb-error"); }, { once: true });
    });
  }

  // =================================================================
  // 5. ANIMASI MUNCUL SAAT DI-SCROLL & ANGKA BERJALAN
  // =================================================================
  var pengamatReveal = ("IntersectionObserver" in window) ? new IntersectionObserver(function (entri) {
    entri.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        pengamatReveal.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }) : null;

  function amatiReveal(akar) {
    $$(".reveal:not(.is-visible)", akar).forEach(function (el) {
      if (pengamatReveal && !kurangiGerak()) pengamatReveal.observe(el);
      else el.classList.add("is-visible");
    });
  }

  function jalankanAngka(el) {
    el.setAttribute("data-sudah", "1");
    el.classList.remove("pop");
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (kurangiGerak() || target === 0) { el.textContent = target; return; }
    var durasi = 1400, awal = null;
    function langkah(t) {
      if (awal === null) awal = t;
      var k = Math.min((t - awal) / durasi, 1);
      var mulus = 1 - Math.pow(1 - k, 3); // melambat di akhir
      el.textContent = Math.round(target * mulus);
      if (k < 1) requestAnimationFrame(langkah);
      else el.classList.add("pop"); // angka "melompat" sekali saat selesai
    }
    requestAnimationFrame(langkah);
  }

  var angka = $$(".stat-num");
  if ("IntersectionObserver" in window) {
    var pengamatAngka = new IntersectionObserver(function (entri) {
      entri.forEach(function (e) {
        if (e.isIntersecting) { jalankanAngka(e.target); pengamatAngka.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    angka.forEach(function (el) { pengamatAngka.observe(el); });
  } else {
    angka.forEach(jalankanAngka);
  }

  // =================================================================
  // 6. EFEK TILT 3D PADA KARTU PRODI (hanya mouse, tidak di HP)
  // =================================================================
  var bisaHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var gridProdi = $("#prodi-grid");
  gridProdi.addEventListener("pointermove", function (e) {
    var kartu = e.target.closest(".prodi-card");
    if (!kartu) return;
    var r = kartu.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    kartu.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
    kartu.style.setProperty("--my", (y * 100).toFixed(1) + "%");
    if (bisaHover && !kurangiGerak()) {
      kartu.style.setProperty("--rx", ((0.5 - y) * 7).toFixed(2) + "deg");
      kartu.style.setProperty("--ry", ((x - 0.5) * 9).toFixed(2) + "deg");
    }
  });
  gridProdi.addEventListener("pointerout", function (e) {
    var kartu = e.target.closest(".prodi-card");
    if (kartu && !kartu.contains(e.relatedTarget)) {
      kartu.style.setProperty("--rx", "0deg");
      kartu.style.setProperty("--ry", "0deg");
    }
  });

  // =================================================================
  // 6b. EFEK RIAK (RIPPLE) SAAT TOMBOL / KARTU DITEKAN — terasa di HP
  // =================================================================
  document.addEventListener("pointerdown", function (e) {
    if (kurangiGerak()) return;
    var el = e.target.closest(".btn, .prodi-card, .video-thumb");
    if (!el) return;
    var r = el.getBoundingClientRect();
    var ukuran = Math.max(r.width, r.height) * 2.2;
    var riak = document.createElement("span");
    riak.className = "ripple";
    riak.style.width = riak.style.height = ukuran + "px";
    riak.style.left = (e.clientX - r.left - ukuran / 2) + "px";
    riak.style.top = (e.clientY - r.top - ukuran / 2) + "px";
    el.appendChild(riak);
    setTimeout(function () { riak.remove(); }, 700);
  }, { passive: true });

  // =================================================================
  // 7. ROUTING (#/ = beranda, #/prodi/kimia = halaman prodi)
  //    Memakai hash (#) sehingga tidak pernah 404 di GitHub Pages
  //    dan tombol Back browser tetap berfungsi.
  // =================================================================
  var viewHome = $("#view-home");
  var viewProdi = $("#view-prodi");
  var viewUpload = $("#view-upload");
  var prodiAktif = null;      // prodi yang sedang dibuka
  var guliranBeranda = 0;     // posisi scroll beranda sebelum pindah halaman
  var guliranTertunda = null; // section tujuan setelah kembali ke beranda

  function gulirKe(target) {
    var perilaku = kurangiGerak() ? "auto" : "smooth";
    if (target === "top") { window.scrollTo({ top: 0, behavior: perilaku }); return; }
    var el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: perilaku, block: "start" });
  }

  // Pindah posisi scroll langsung (tanpa animasi) saat berganti halaman
  function lompatKe(y) {
    try { window.scrollTo({ top: y, left: 0, behavior: "instant" }); }
    catch (err) { window.scrollTo(0, y); }
  }

  // Animasi halus saat sebuah tampilan muncul
  function animasiMasuk(view) {
    if (kurangiGerak()) return;
    view.classList.remove("view-masuk");
    void view.offsetWidth;
    view.classList.add("view-masuk");
  }

  // Garis bawah pada menu mengikuti bagian yang sedang dilihat
  var tautanMenu = $$(".nav a[data-scroll]");
  function tandaiMenu(target) {
    tautanMenu.forEach(function (a) { a.classList.toggle("aktif", a.getAttribute("data-scroll") === target); });
    $("#nav-upload").classList.toggle("aktif", target === "upload");
  }
  if ("IntersectionObserver" in window) {
    // footer (#tentang) ikut menandai menu terakhir "Cari Video"
    var petaBagian = { hero: "top", prodi: "prodi", cari: "cari", tentang: "cari" };
    var pengamatMenu = new IntersectionObserver(function (entri) {
      entri.forEach(function (e) {
        if (e.isIntersecting && !viewHome.hidden) tandaiMenu(petaBagian[e.target.id]);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(petaBagian).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) pengamatMenu.observe(el);
    });
  }

  // Tampilkan satu tampilan, sembunyikan yang lain
  function pilihTampilan(view) {
    if (!viewHome.hidden && view !== viewHome) guliranBeranda = window.scrollY;
    [viewHome, viewProdi, viewUpload].forEach(function (v) { v.hidden = v !== view; });
  }

  function tampilkanBeranda() {
    var dariHalamanLain = viewHome.hidden;
    prodiAktif = null;
    pilihTampilan(viewHome);
    if (dariHalamanLain) animasiMasuk(viewHome);
    document.title = judulDasar;
    if (guliranTertunda) {
      var t = guliranTertunda;
      guliranTertunda = null;
      // tunggu tata letak beranda siap dulu
      setTimeout(function () { gulirKe(t); }, 30);
    } else if (dariHalamanLain) {
      lompatKe(guliranBeranda);
    }
  }

  // diam = true: hanya perbarui isi (tanpa animasi, scroll, atau pindah fokus)
  function tampilkanHalamanProdi(p, diam) {
    prodiAktif = p;
    var n = p.videos.length;

    var banner = $("#prodi-banner");
    banner.setAttribute("style", gayaWarna(p));
    banner.innerHTML =
      '<span class="prodi-icon" aria-hidden="true">' + esc(p.ikon) + "</span>" +
      '<div class="prodi-banner-text"><h1 id="prodi-heading" tabindex="-1">' + esc(p.nama) + "</h1>" +
      "<p>" + esc(p.deskripsi) + "</p>" +
      '<div class="chips"><span class="chip">' + (n ? n + " video pembelajaran" : "Belum ada video") + "</span>" +
      (labelKelas ? '<span class="chip">' + esc(labelKelas) + "</span>" : "") + "</div></div>";

    var grid = $("#video-grid");
    grid.innerHTML = n
      ? p.videos.map(function (v, i) { return kartuVideo(v, i, [], false); }).join("")
      : emptyState("Video segera hadir", "Video pembelajaran untuk " + p.nama + " sedang disiapkan. Silakan kembali lagi nanti.");
    pasangCadanganThumbnail(grid);
    amatiReveal(grid);
    if (diam) return;

    pilihTampilan(viewProdi);
    animasiMasuk(viewProdi);
    tandaiMenu("prodi");
    document.title = p.nama + " — " + judulDasar;
    lompatKe(0);
    // pindahkan fokus ke judul supaya pembaca layar tahu halaman berganti
    var h = $("#prodi-heading");
    if (h) h.focus({ preventScroll: true });
  }

  function tampilkanUpload() {
    prodiAktif = null;
    pilihTampilan(viewUpload);
    animasiMasuk(viewUpload);
    tandaiMenu("upload");
    document.title = "Upload video — " + judulDasar;
    lompatKe(0);
    aturLayarUpload();
    muatVideoUpload(); // ambil daftar terbaru dari spreadsheet
    var h = $("#upload-heading");
    if (h) h.focus({ preventScroll: true });
  }

  function router() {
    var hash = decodeURIComponent(location.hash || "");
    if (/^#\/upload\/?$/.test(hash)) { tampilkanUpload(); return; }
    var cocok = hash.match(/^#\/prodi\/([^\/?#]+)/);
    if (cocok) {
      var p = cariProdi(cocok[1]);
      if (p) { tampilkanHalamanProdi(p); return; }
    }
    tampilkanBeranda();
  }

  window.addEventListener("hashchange", router);

  // Klik tautan menu (Beranda, Program Studi, Cari Video)
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-scroll]");
    if (!a) return;
    e.preventDefault();
    tutupMenu();
    var target = a.getAttribute("data-scroll");
    if (!viewHome.hidden) {
      gulirKe(target);
      if (location.hash && location.hash !== "#/" && viewHome.hidden === false) {
        history.replaceState(null, "", "#/");
      }
    } else {
      guliranTertunda = target;
      location.hash = "#/";
    }
  });

  // =================================================================
  // 8. PENCARIAN GLOBAL + FILTER PRODI
  // =================================================================
  var inputCari = $("#search-input");
  var filterCari = $("#search-filter");
  var infoCari = $("#search-info");
  var hasilCari = $("#search-results");

  // Isi pilihan filter prodi (jumlah video ikut diperbarui saat data berubah)
  function isiFilterProdi() {
    var terpilih = filterCari.value || "semua";
    filterCari.innerHTML = '<option value="semua">Semua prodi</option>' + daftarProdi.map(function (p) {
      return '<option value="' + esc(p.id) + '">' + esc(p.nama) + " (" + p.videos.length + ")</option>";
    }).join("");
    filterCari.value = terpilih;
  }
  isiFilterProdi();

  function jalankanPencarian() {
    var kata = normal(inputCari.value).split(/\s+/).filter(Boolean);
    var filter = filterCari.value;

    if (!semuaVideo.length) {
      infoCari.textContent = "";
      hasilCari.innerHTML = emptyState("Video segera hadir", "Belum ada video yang ditambahkan. Video akan muncul di sini setelah diunggah.");
      return;
    }
    if (!kata.length && filter === "semua") {
      infoCari.textContent = "Ketik kata kunci atau pilih prodi untuk mulai mencari dari " + semuaVideo.length + " video.";
      hasilCari.innerHTML = "";
      return;
    }

    var hasil = semuaVideo.filter(function (v) {
      if (filter !== "semua" && v.prodi.id !== filter) return false;
      for (var i = 0; i < kata.length; i++) if (v.teksCari.indexOf(kata[i]) === -1) return false;
      return true;
    });

    infoCari.textContent = hasil.length
      ? "Ditemukan " + hasil.length + " video."
      : "Tidak ada video yang cocok.";
    hasilCari.innerHTML = hasil.length
      ? hasil.map(function (v, i) { return kartuVideo(v, i, kata, true); }).join("")
      : emptyState("Tidak ditemukan", "Coba kata kunci lain, periksa ejaan, atau pilih \"Semua prodi\".", "🔍");
    pasangCadanganThumbnail(hasilCari);
    amatiReveal(hasilCari);
  }

  var timerCari;
  inputCari.addEventListener("input", function () {
    clearTimeout(timerCari);
    timerCari = setTimeout(jalankanPencarian, 120);
  });
  filterCari.addEventListener("change", jalankanPencarian);

  // =================================================================
  // 9. PEMUTAR VIDEO (MODAL)
  //    iframe baru dibuat saat video diklik, dan dihapus saat ditutup
  //    sehingga video langsung berhenti.
  // =================================================================
  var modal = $("#modal");
  var slotPemutar = $("#player-slot");
  var fokusSebelumnya = null;

  function bukaVideo(v) {
    fokusSebelumnya = document.activeElement;
    $("#modal-title").textContent = v.judul;
    $("#modal-prodi").textContent = v.prodi.nama;
    var meta = [];
    if (v.topik) meta.push(v.topik);
    if (labelKelas) meta.push(labelKelas);
    $("#modal-meta").textContent = meta.join(" · ");
    $("#modal-youtube").href = "https://www.youtube.com/watch?v=" + v.id;

    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + v.id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
    iframe.title = "Pemutar video: " + v.judul;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    slotPemutar.innerHTML = "";
    slotPemutar.appendChild(iframe);

    // Catatan khusus saat website dibuka langsung dari file (bukan dari internet)
    var catatan = $("#modal-note");
    if (location.protocol === "file:") {
      catatan.textContent = "Catatan: saat dibuka langsung dari file di komputer, YouTube kadang menolak memutar video. " +
        "Setelah website online di GitHub Pages, pemutar akan berjalan normal. Sementara itu, gunakan tombol \"Tonton di YouTube\".";
      catatan.hidden = false;
    } else {
      catatan.hidden = true;
    }

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $("[data-close].icon-btn", modal).focus();
  }

  function tutupVideo() {
    if (modal.hidden) return;
    slotPemutar.innerHTML = ""; // hapus iframe = video berhenti
    modal.hidden = true;
    document.body.style.overflow = "";
    if (fokusSebelumnya && fokusSebelumnya.focus) fokusSebelumnya.focus();
  }

  // Klik kartu video (di mana pun pada kartu) untuk memutar
  document.addEventListener("click", function (e) {
    var kartu = e.target.closest(".video-card");
    if (!kartu) return;
    var v = semuaVideo[parseInt(kartu.getAttribute("data-idx"), 10)];
    if (v) bukaVideo(v);
  });

  // Tutup: tombol X atau klik di luar kotak video
  modal.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) tutupVideo();
  });

  // Jaga fokus keyboard tetap di dalam modal (Tab / Shift+Tab)
  modal.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var bisaFokus = $$("button, a[href], iframe", $(".modal-dialog", modal));
    var pertama = bisaFokus[0], terakhir = bisaFokus[bisaFokus.length - 1];
    if (e.shiftKey && document.activeElement === pertama) { e.preventDefault(); terakhir.focus(); }
    else if (!e.shiftKey && document.activeElement === terakhir) { e.preventDefault(); pertama.focus(); }
  });

  // =================================================================
  // 9b. UPLOAD VIDEO LEWAT WEBSITE (data disimpan di Google Spreadsheet)
  //     - Daftar video dibaca dengan JSONP (tetap jalan walau dibuka dari file)
  //     - Password dicek di Google Apps Script, bukan di website
  // =================================================================
  var urlUpload = String(CONFIG.uploadUrl || "").trim();
  var KUNCI_SANDI = "plp-sandi";
  var sandiMemori = "";

  // Password disimpan sementara selama tab browser masih terbuka
  function ambilSandi() {
    try { return sessionStorage.getItem(KUNCI_SANDI) || ""; } catch (err) { return sandiMemori; }
  }
  function simpanSandi(sandi) {
    sandiMemori = sandi;
    try {
      if (sandi) sessionStorage.setItem(KUNCI_SANDI, sandi);
      else sessionStorage.removeItem(KUNCI_SANDI);
    } catch (err) { /* abaikan jika diblokir */ }
  }

  // Perbarui semua bagian website setelah daftar video berubah
  function segarkanSemua() {
    perbaruiHitungan();
    jalankanPencarian();
    if (prodiAktif && !viewProdi.hidden) tampilkanHalamanProdi(prodiAktif, true);
    if (!viewUpload.hidden) renderDaftarUpload();
  }

  // Ambil daftar video dari spreadsheet
  var nomorMuat = 0;
  function muatVideoUpload() {
    if (!urlUpload) return;
    var nama = "__terimaVideo" + Date.now() + "_" + (nomorMuat++);
    var skrip = document.createElement("script");
    var batas = setTimeout(function () { bersih(); console.warn("Info: daftar video upload terlalu lama dimuat."); }, 20000);
    function bersih() {
      clearTimeout(batas);
      window[nama] = function () {}; // abaikan jawaban yang datang terlambat
      if (skrip.parentNode) skrip.parentNode.removeChild(skrip);
    }
    window[nama] = function (hasil) {
      bersih();
      if (hasil && hasil.ok && Array.isArray(hasil.video)) {
        videoSheet = hasil.video;
        susunVideo();
        segarkanSemua();
      }
    };
    skrip.onerror = function () {
      bersih();
      console.warn("Info: daftar video upload belum bisa dimuat. Periksa uploadUrl di js/data.js dan koneksi internet.");
    };
    skrip.src = urlUpload + (urlUpload.indexOf("?") >= 0 ? "&" : "?") + "callback=" + nama + "&t=" + Date.now();
    document.body.appendChild(skrip);
  }

  // Kirim perintah (cek / tambah / hapus) ke Apps Script
  function kirimKeServer(data) {
    return fetch(urlUpload, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // tipe sederhana supaya diterima Google
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  var formMasuk = $("#form-masuk");
  var inputSandi = $("#input-password");
  var pesanMasuk = $("#pesan-masuk");
  var tombolMasuk = $("#tombol-masuk");
  var panelUpload = $("#panel-upload");
  var formUpload = $("#form-upload");
  var pesanUpload = $("#pesan-upload");
  var tombolUpload = $("#tombol-upload");
  var inputLink = $("#up-link");
  var pilihProdi = $("#up-prodi");
  var pratinjau = $("#up-preview");

  pilihProdi.innerHTML += daftarProdi.map(function (p) {
    return '<option value="' + esc(p.id) + '">' + esc(p.ikon) + " " + esc(p.nama) + "</option>";
  }).join("");

  // jenis: "ok" (hijau), "salah" (merah), atau "" (biasa)
  function tampilPesan(el, isiHTML, jenis) {
    el.innerHTML = isiHTML || "";
    el.className = "form-pesan" + (jenis ? " " + jenis : "");
  }

  function setSibuk(tombol, sibuk, teks) {
    if (sibuk) {
      tombol.setAttribute("data-asli", tombol.innerHTML);
      tombol.innerHTML = '<span class="pemutar" aria-hidden="true"></span>' + esc(teks);
      tombol.disabled = true;
    } else {
      tombol.innerHTML = tombol.getAttribute("data-asli") || tombol.innerHTML;
      tombol.disabled = false;
    }
  }

  // Tampilkan bagian yang sesuai: belum aktif / minta password / panel upload
  function aturLayarUpload() {
    var aktif = !!urlUpload;
    var sudahMasuk = aktif && !!ambilSandi();
    $("#upload-belum-aktif").hidden = aktif;
    formMasuk.hidden = !aktif || sudahMasuk;
    panelUpload.hidden = !sudahMasuk;
    if (sudahMasuk) renderDaftarUpload();
  }

  // Tombol lihat/sembunyikan password
  $("#tombol-lihat").addEventListener("click", function () {
    var lihat = inputSandi.type === "password";
    inputSandi.type = lihat ? "text" : "password";
    this.setAttribute("aria-pressed", String(lihat));
    this.setAttribute("aria-label", lihat ? "Sembunyikan password" : "Tampilkan password");
  });

  // Masuk dengan password
  formMasuk.addEventListener("submit", function (e) {
    e.preventDefault();
    var sandi = inputSandi.value;
    if (!sandi.trim()) { tampilPesan(pesanMasuk, "Password belum diisi.", "salah"); inputSandi.focus(); return; }
    tampilPesan(pesanMasuk, "");
    setSibuk(tombolMasuk, true, "Memeriksa…");
    kirimKeServer({ aksi: "cek", password: sandi })
      .then(function (hasil) {
        if (hasil.ok) {
          simpanSandi(sandi);
          inputSandi.value = "";
          aturLayarUpload();
          inputLink.focus();
        } else {
          tampilPesan(pesanMasuk, esc(hasil.pesan || "Password salah."), "salah");
          formMasuk.classList.remove("getar");
          void formMasuk.offsetWidth;
          formMasuk.classList.add("getar");
          inputSandi.select();
        }
      })
      .catch(function () {
        tampilPesan(pesanMasuk, "Tidak bisa terhubung ke server. Periksa koneksi internet lalu coba lagi.", "salah");
      })
      .then(function () { setSibuk(tombolMasuk, false); });
  });

  // Keluar
  $("#tombol-keluar").addEventListener("click", function () {
    simpanSandi("");
    tampilPesan(pesanUpload, "");
    aturLayarUpload();
    inputSandi.focus();
  });

  // Pratinjau otomatis saat link YouTube ditempel
  inputLink.addEventListener("input", function () {
    var id = ambilIdYoutube(inputLink.value);
    pratinjau.hidden = !id;
    if (id) {
      $("#up-preview-img").src = "https://i.ytimg.com/vi/" + id + "/mqdefault.jpg";
      var ada = cariVideo(id);
      $("#up-preview-id").textContent = ada ? "⚠️ Video ini sudah ada di " + ada.prodi.nama : "ID video: " + id;
      pratinjau.classList.toggle("ganda", !!ada);
    }
  });

  function cariVideo(idYoutube) {
    for (var i = 0; i < semuaVideo.length; i++) if (semuaVideo[i].id === idYoutube) return semuaVideo[i];
    return null;
  }

  // Kirim video baru
  formUpload.addEventListener("submit", function (e) {
    e.preventDefault();
    var link = inputLink.value.trim();
    var judul = $("#up-judul").value.trim();
    var topik = $("#up-topik").value.trim();
    var prodiId = pilihProdi.value;
    var id = ambilIdYoutube(link);

    var salah = !link ? ["Link YouTube belum diisi.", inputLink]
      : !id ? ["Link tidak dikenali. Salin link dari tombol \"Bagikan\" di YouTube.", inputLink]
      : !judul ? ["Judul video belum diisi.", $("#up-judul")]
      : !topik ? ["Topik belum diisi.", $("#up-topik")]
      : !prodiId ? ["Pilih mata pelajarannya dulu.", pilihProdi]
      : null;
    if (salah) { tampilPesan(pesanUpload, esc(salah[0]), "salah"); salah[1].focus(); return; }

    var ada = cariVideo(id);
    if (ada) {
      tampilPesan(pesanUpload, "Video ini sudah ada di " + esc(ada.prodi.nama) + " dengan judul \"" + esc(ada.judul) + "\".", "salah");
      return;
    }

    var data = { aksi: "tambah", password: ambilSandi(), link: link, judul: judul, topik: topik, prodi: prodiId };
    tampilPesan(pesanUpload, "");
    setSibuk(tombolUpload, true, "Mengupload…");
    kirimKeServer(data)
      .then(function (hasil) {
        if (hasil.ok) {
          // langsung tampilkan tanpa menunggu memuat ulang
          videoSheet.push({ id: hasil.id, waktu: new Date().toISOString(), prodi: prodiId, judul: judul, link: link, topik: topik });
          susunVideo();
          segarkanSemua();
          formUpload.reset();
          pratinjau.hidden = true;
          var p = cariProdi(prodiId);
          tampilPesan(pesanUpload,
            "Berhasil! \"" + esc(judul) + "\" sudah tampil di " +
            '<a href="#/prodi/' + encodeURIComponent(prodiId) + '">' + esc(p ? p.nama : "halaman prodi") + "</a>.", "ok");
          inputLink.focus();
        } else if (/password/i.test(hasil.pesan || "")) {
          simpanSandi("");
          aturLayarUpload();
          tampilPesan(pesanMasuk, "Password berubah atau salah. Silakan masuk lagi.", "salah");
        } else {
          tampilPesan(pesanUpload, esc(hasil.pesan || "Gagal mengupload video."), "salah");
        }
      })
      .catch(function () {
        tampilPesan(pesanUpload, "Gagal terhubung ke server. Periksa koneksi internet lalu coba lagi.", "salah");
      })
      .then(function () { setSibuk(tombolUpload, false); });
  });

  // Daftar video yang sudah diupload (terbaru di atas) + tombol hapus
  function renderDaftarUpload() {
    var daftar = semuaVideo.filter(function (v) { return v.sumber === "upload"; })
      .sort(function (a, b) { return String(b.waktu).localeCompare(String(a.waktu)); });
    $("#hitung-upload").textContent = daftar.length;
    $("#upload-list").innerHTML = daftar.length ? daftar.map(function (v) {
      return '<li class="upload-item" style="' + gayaWarna(v.prodi) + '">' +
        '<img src="https://i.ytimg.com/vi/' + v.id + '/mqdefault.jpg" alt="" width="96" height="54" loading="lazy">' +
        '<div class="upload-item-teks"><strong>' + esc(v.judul) + "</strong>" +
        "<small>" + esc(v.prodi.ikon) + " " + esc(v.prodi.nama) + (v.topik ? " · " + esc(v.topik) : "") + "</small></div>" +
        '<button type="button" class="tombol-hapus" data-hapus="' + esc(v.idSheet) + '" aria-label="Hapus video ' + esc(v.judul) + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button></li>';
    }).join("") : '<li class="upload-kosong">Belum ada video yang diupload lewat website.</li>';
  }

  // Hapus video upload
  $("#upload-list").addEventListener("click", function (e) {
    var tombol = e.target.closest("[data-hapus]");
    if (!tombol) return;
    var idSheet = tombol.getAttribute("data-hapus");
    var v = semuaVideo.filter(function (x) { return x.idSheet === idSheet; })[0];
    if (!v || !window.confirm("Hapus video \"" + v.judul + "\"?\nVideo akan hilang dari website.")) return;
    tombol.disabled = true;
    tombol.classList.add("sibuk");
    kirimKeServer({ aksi: "hapus", password: ambilSandi(), id: idSheet })
      .then(function (hasil) {
        if (hasil.ok) {
          videoSheet = videoSheet.filter(function (x) { return x.id !== idSheet; });
          susunVideo();
          segarkanSemua();
          tampilPesan(pesanUpload, "Video \"" + esc(v.judul) + "\" sudah dihapus.", "ok");
        } else {
          tampilPesan(pesanUpload, esc(hasil.pesan || "Gagal menghapus video."), "salah");
          tombol.disabled = false;
          tombol.classList.remove("sibuk");
        }
      })
      .catch(function () {
        tampilPesan(pesanUpload, "Gagal terhubung ke server. Coba lagi.", "salah");
        tombol.disabled = false;
        tombol.classList.remove("sibuk");
      });
  });

  // =================================================================
  // 10. TEMA GELAP / TERANG (tersimpan di localStorage)
  // =================================================================
  var tombolTema = $("#theme-toggle");
  var metaWarna = document.querySelector('meta[name="theme-color"]');

  function terapkanTema(tema, simpan) {
    document.documentElement.setAttribute("data-theme", tema);
    var gelap = tema === "dark";
    tombolTema.setAttribute("aria-label", gelap ? "Ganti ke mode terang" : "Ganti ke mode gelap");
    tombolTema.setAttribute("title", gelap ? "Mode terang" : "Mode gelap");
    if (metaWarna) metaWarna.setAttribute("content", gelap ? "#0b1220" : "#f8f7f3");
    if (simpan) {
      try { localStorage.setItem("plp-tema", tema); } catch (err) { /* abaikan jika diblokir */ }
    }
  }
  terapkanTema(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light", false);
  tombolTema.addEventListener("click", function () {
    var sekarang = document.documentElement.getAttribute("data-theme");
    terapkanTema(sekarang === "dark" ? "light" : "dark", true);
  });

  // =================================================================
  // 11. NAVBAR: menu hamburger & efek saat di-scroll
  // =================================================================
  var tombolMenu = $("#menu-toggle");
  var menu = $("#nav-menu");

  function tutupMenu() {
    menu.classList.remove("open");
    tombolMenu.setAttribute("aria-expanded", "false");
    tombolMenu.setAttribute("aria-label", "Buka menu");
  }
  tombolMenu.addEventListener("click", function () {
    var buka = !menu.classList.contains("open");
    menu.classList.toggle("open", buka);
    tombolMenu.setAttribute("aria-expanded", String(buka));
    tombolMenu.setAttribute("aria-label", buka ? "Tutup menu" : "Buka menu");
  });
  document.addEventListener("click", function (e) {
    if (menu.classList.contains("open") && !e.target.closest("#nav-menu, #menu-toggle")) tutupMenu();
  });
  // Menu HP tertutup setelah salah satu tautannya diketuk
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) tutupMenu(); });

  // Tombol Esc: tutup modal atau menu
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Esc") {
      if (!modal.hidden) tutupVideo();
      else if (menu.classList.contains("open")) { tutupMenu(); tombolMenu.focus(); }
    }
  });

  // =================================================================
  // 12. TOMBOL KEMBALI KE ATAS
  // =================================================================
  var navbar = $("#navbar");
  var tombolAtas = $("#to-top");
  var barProgres = $("#scroll-progress");
  var menungguFrame = false;
  function perbaruiScroll() {
    var y = window.scrollY;
    var maks = document.documentElement.scrollHeight - window.innerHeight;
    navbar.classList.toggle("scrolled", y > 10);
    tombolAtas.classList.toggle("show", y > 600);
    barProgres.style.transform = "scaleX(" + (maks > 0 ? Math.min(y / maks, 1) : 0).toFixed(4) + ")";
    menungguFrame = false;
  }
  window.addEventListener("scroll", function () {
    if (menungguFrame) return;
    menungguFrame = true;
    requestAnimationFrame(perbaruiScroll);
  }, { passive: true });
  window.addEventListener("hashchange", function () { setTimeout(perbaruiScroll, 50); });
  tombolAtas.addEventListener("click", function () {
    gulirKe("top");
    var brand = $(".brand");
    if (brand) brand.focus({ preventScroll: true });
  });

  // =================================================================
  // 13. MULAI
  // =================================================================
  jalankanPencarian();
  amatiReveal(document);
  router();
  if (viewUpload.hidden) muatVideoUpload(); // halaman upload sudah memuat sendiri
})();
