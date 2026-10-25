/* =====================================================================
   DATA WEBSITE — SATU-SATUNYA FILE YANG PERLU DIEDIT
   =====================================================================
   Petunjuk singkat:
   1. Ubah isi CONFIG (judul, kelas, tim penyusun, dll.) di bawah ini.
   2. Tambahkan video di bagian "video: [ ... ]" pada prodi yang sesuai.
   3. Simpan file, lalu buka/refresh index.html.

   ATURAN PENULISAN (supaya tidak error):
   - Setiap teks diapit tanda kutip dua: "seperti ini"
   - Antar-entri dipisah dengan koma ( , )
   - Jangan hapus tanda kurung { } [ ] yang sudah ada
   ===================================================================== */


/* ---------------------------------------------------------------------
   1. CONFIG — informasi umum website
   --------------------------------------------------------------------- */
const CONFIG = {
  judulSitus: "Galeri Video Pembelajaran",
  subjudul: "FKIP Universitas Riau",
  kelas: "XI",                 // semua video untuk kelas ini (tampil di beranda & halaman prodi)
  tahun: "2026",
  universitas: "Universitas Riau",
  fakultas: "Fakultas Keguruan dan Ilmu Pendidikan",

  // Logo kampus (opsional). Taruh file gambar di folder assets, lalu tulis
  // path-nya, contoh: "./assets/logo-unri.png". Biarkan "" untuk memakai teks "UNRI".
  logo: "",

  // Alamat Google Apps Script untuk fitur Upload video lewat website.
  // Cara mendapatkannya ada di README.md bagian "Mengaktifkan fitur Upload".
  // Contoh: "https://script.google.com/macros/s/AKfycb.../exec"
  // Biarkan "" kalau fitur upload belum dipakai.
  uploadUrl: "https://script.google.com/macros/s/AKfycbyVQHjplL9u5CsDZK_4y-3InGRydUnGnLF74KkMa58M6M3BCo2Wdex3dZD8kxpZUYjB/exec",

  // Nama tim penyusun (opsional, tampil di footer).
  // Kosongkan menjadi  timPenyusun: []  kalau tidak ingin ditampilkan.
  timPenyusun: [
    "[Nama 1]",
    "[Nama 2]",
    "[Nama 3]"
  ]
};


/* ---------------------------------------------------------------------
   2. DAFTAR PRODI DAN VIDEO
   ---------------------------------------------------------------------
   Setiap video cukup berisi 3 hal: judul, link, dan topik. Contoh:

     video: [
       { judul: "Laju Reaksi", link: "https://youtu.be/AbCdEfGhIjK", topik: "Faktor yang memengaruhi laju reaksi" },
       { judul: "Kesetimbangan Kimia", link: "https://www.youtube.com/watch?v=AbCdEfGhIjK", topik: "Pergeseran kesetimbangan" }
     ]

   Link YouTube boleh ditempel apa adanya. Semua format ini didukung:
     https://www.youtube.com/watch?v=XXXXXXXXXXX
     https://youtu.be/XXXXXXXXXXX?si=...
     https://www.youtube.com/shorts/XXXXXXXXXXX
     https://www.youtube.com/embed/XXXXXXXXXXX
     (termasuk yang ada tambahan &t=30s atau ?si=...)

   Entri dengan link "GANTI_DENGAN_LINK_YOUTUBE" (atau link tidak valid)
   OTOMATIS DISEMBUNYIKAN. Jadi aman dibiarkan sampai link asli siap.
   Kalau semua video sebuah prodi belum valid, halaman prodi akan
   menampilkan tulisan "Video segera hadir".

   Kolom "warna": dua kode warna untuk kartu prodi.
   --------------------------------------------------------------------- */
const DAFTAR_PRODI = [
  {
    id: "ekonomi",
    nama: "Pendidikan Ekonomi",
    singkatan: "P. Ekonomi",
    deskripsi: "Konsep ekonomi, kewirausahaan, dan literasi keuangan untuk kehidupan sehari-hari.",
    ikon: "📈",
    warna: ["#f59e0b", "#ea580c"],
    video: [
      { judul: "Contoh Judul Video", link: "GANTI_DENGAN_LINK_YOUTUBE", topik: "Topik materi" }
    ]
  },
  {
    id: "bahasa-indonesia",
    nama: "Pendidikan Bahasa Indonesia",
    singkatan: "PBSI",
    deskripsi: "Keterampilan berbahasa, menulis kreatif, dan apresiasi sastra Indonesia.",
    ikon: "📝",
    warna: ["#e11d48", "#be123c"],
    video: [
      { judul: "Contoh Judul Video", link: "GANTI_DENGAN_LINK_YOUTUBE", topik: "Topik materi" }
    ]
  },
  {
    id: "bahasa-inggris",
    nama: "Pendidikan Bahasa Inggris",
    singkatan: "PBI",
    deskripsi: "Speaking, listening, reading, dan writing dengan pendekatan komunikatif.",
    ikon: "💬",
    warna: ["#2563eb", "#1d4ed8"],
    video: [
      { judul: "Contoh Judul Video", link: "GANTI_DENGAN_LINK_YOUTUBE", topik: "Topik materi" }
    ]
  },
  {
    id: "kimia",
    nama: "Pendidikan Kimia",
    singkatan: "P. Kimia",
    deskripsi: "Struktur materi, reaksi kimia, dan praktikum yang aman serta menyenangkan.",
    ikon: "⚗️",
    warna: ["#0d9488", "#0f766e"],
    video: [
      { judul: "Contoh Judul Video", link: "GANTI_DENGAN_LINK_YOUTUBE", topik: "Topik materi" }
    ]
  },
  {
    id: "fisika",
    nama: "Pendidikan Fisika",
    singkatan: "P. Fisika",
    deskripsi: "Gerak, energi, gelombang, dan listrik lewat eksperimen dan simulasi.",
    ikon: "⚛️",
    warna: ["#7c3aed", "#6d28d9"],
    video: [
      { judul: "Contoh Judul Video", link: "GANTI_DENGAN_LINK_YOUTUBE", topik: "Topik materi" }
    ]
  },
  {
    id: "matematika",
    nama: "Pendidikan Matematika",
    singkatan: "P. Matematika",
    deskripsi: "Bilangan, aljabar, geometri, dan statistika dengan langkah yang runtut.",
    ikon: "📐",
    warna: ["#0284c7", "#0369a1"],
    video: [
      { judul: "Contoh Judul Video", link: "GANTI_DENGAN_LINK_YOUTUBE", topik: "Topik materi" }
    ]
  },
  {
    id: "sejarah",
    nama: "Pendidikan Sejarah",
    singkatan: "P. Sejarah",
    deskripsi: "Peristiwa, tokoh, dan jejak peradaban Indonesia maupun dunia.",
    ikon: "🏛️",
    warna: ["#b45309", "#92400e"],
    video: [
      { judul: "Contoh Judul Video", link: "GANTI_DENGAN_LINK_YOUTUBE", topik: "Topik materi" }
    ]
  },
  {
    id: "penjas",
    nama: "Pendidikan Jasmani (Penjas)",
    singkatan: "Penjas",
    deskripsi: "Teknik dasar olahraga, kebugaran jasmani, dan pola hidup sehat.",
    ikon: "⚽",
    warna: ["#16a34a", "#15803d"],
    video: [
      { judul: "Contoh Judul Video", link: "GANTI_DENGAN_LINK_YOUTUBE", topik: "Topik materi" }
    ]
  },
  {
    id: "ppkn",
    nama: "Pendidikan Pancasila dan Kewarganegaraan",
    singkatan: "PPKn",
    deskripsi: "Nilai Pancasila, hak dan kewajiban warga negara, serta wawasan kebangsaan.",
    ikon: "⚖️",
    warna: ["#dc2626", "#b91c1c"],
    video: [
      { judul: "Contoh Judul Video", link: "GANTI_DENGAN_LINK_YOUTUBE", topik: "Topik materi" }
    ]
  },
  {
    id: "biologi",
    nama: "Pendidikan Biologi",
    singkatan: "P. Biologi",
    deskripsi: "Sel, ekosistem, genetika, dan keanekaragaman makhluk hidup.",
    ikon: "🧬",
    warna: ["#65a30d", "#4d7c0f"],
    video: [
      { judul: "Contoh Judul Video", link: "GANTI_DENGAN_LINK_YOUTUBE", topik: "Topik materi" }
    ]
  },
  {
    id: "bk",
    nama: "Bimbingan dan Konseling",
    singkatan: "BK",
    deskripsi: "Pengembangan diri, karier, dan keterampilan sosial peserta didik.",
    ikon: "🤝",
    warna: ["#db2777", "#be185d"],
    video: [
      { judul: "Contoh Judul Video", link: "GANTI_DENGAN_LINK_YOUTUBE", topik: "Topik materi" }
    ]
  }
];
