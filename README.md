# Galeri Video Pembelajaran Kelas XI — FKIP Universitas Riau

Website statis berisi kumpulan video pembelajaran YouTube untuk kelas XI dari 11 program studi FKIP Universitas Riau, dikelompokkan per program studi.

- Gratis di **GitHub Pages**: tanpa server, tanpa proses build.
- Bisa juga dibuka langsung dengan **klik dua kali `index.html`** di komputer.
- Ada **2 cara menambah video**:
  - **Lewat website** (paling mudah): menu **Upload**, masukkan password, tempel link → langsung tampil. Perlu diaktifkan sekali, lihat [Mengaktifkan fitur Upload](#mengaktifkan-fitur-upload-sekali-saja).
  - **Lewat kode**: edit file `js/data.js`.

---

## Daftar isi

1. [Struktur folder](#struktur-folder)
2. [Mengaktifkan fitur Upload (sekali saja)](#mengaktifkan-fitur-upload-sekali-saja)
3. [Cara menambah atau mengganti video lewat kode](#1-cara-menambah-atau-mengganti-video)
4. [Cara mengganti judul, kelas, dan info footer](#2-cara-mengganti-judul-kelas-dan-info-footer)
5. [Upload ke GitHub lewat browser](#3-upload-ke-github-lewat-browser-tanpa-git)
6. [Alamat website & berapa lama sampai online](#4-alamat-website--berapa-lama-sampai-online)
7. [Solusi masalah umum](#5-solusi-masalah-umum)

---

## Struktur folder

```
📁 (folder utama / root)
├── index.html          ← halaman utama (wajib ada di root)
├── README.md           ← panduan ini
├── 📁 css
│   └── style.css       ← tampilan & warna
├── 📁 js
│   ├── data.js         ← ✏️ DATA VIDEO & INFO WEBSITE (yang perlu diedit)
│   ├── particles.js    ← animasi latar beranda (pita cahaya & simbol ilmu)
│   └── main.js         ← logika website
├── 📁 assets
│   └── favicon.svg     ← ikon di tab browser
└── 📁 apps-script
    └── Code.gs         ← kode untuk Google Apps Script (fitur Upload)
```

> **Penting:** nama folder dan file harus persis seperti di atas, termasuk huruf kecil/besar. `js/data.js` ≠ `JS/Data.js`.

---

## Mengaktifkan fitur Upload (sekali saja)

Website di GitHub Pages tidak punya tempat menyimpan data, jadi video yang diupload lewat website disimpan di **Google Spreadsheet** milik kalian (gratis). Pengaturan ini cukup dilakukan **satu kali** oleh satu orang. Waktu yang dibutuhkan sekitar 10 menit.

### Langkah A — Buat spreadsheet & tempel kode

1. Login ke akun Google (sebaiknya akun bersama kelompok), lalu buka **https://sheets.new** untuk membuat spreadsheet baru.
2. Beri nama spreadsheet, misalnya **Data Video Pembelajaran**.
3. Klik menu **Ekstensi → Apps Script**. Tab baru akan terbuka.
4. Hapus semua isi kode yang ada, lalu **salin seluruh isi file `apps-script/Code.gs`** dan tempel di sana.
5. Cari baris ini di dekat bagian atas:
   ```js
   const PASSWORD = "GANTI_PASSWORD_DI_SINI";
   ```
   Ganti tulisan `GANTI_PASSWORD_DI_SINI` dengan password pilihan kalian. Huruf besar/kecil dan spasi diabaikan saat password dicek.

   > 🔐 **Tulis password HANYA di editor Apps Script.** Jangan tulis di file mana pun yang diupload ke GitHub, karena repository GitHub bersifat publik dan bisa dibaca siapa saja.
6. Klik ikon **💾 Simpan** (atau Ctrl + S).

### Langkah B — Terbitkan sebagai aplikasi web

1. Di kanan atas, klik **Terapkan (Deploy) → Deployment baru (New deployment)**.
2. Klik ikon ⚙️ di sebelah "Pilih jenis", lalu pilih **Aplikasi web (Web app)**.
3. Isi:
   - **Jalankan sebagai (Execute as):** `Saya (Me)`
   - **Yang memiliki akses (Who has access):** `Siapa saja (Anyone)`
4. Klik **Terapkan (Deploy)**.
5. Google akan meminta izin. Klik **Izinkan akses** → pilih akun → jika muncul *"Google hasn't verified this app"*, klik **Advanced / Lanjutan** → **Go to … (unsafe)** → **Allow**. Ini aman karena kodenya milik kalian sendiri.
6. Salin **URL aplikasi web** yang muncul (berakhiran `/exec`).

### Langkah C — Sambungkan ke website

1. Buka `js/data.js`, cari `uploadUrl`, lalu tempel URL tadi:
   ```js
   uploadUrl: "https://script.google.com/macros/s/AKfycb..../exec",
   ```
2. Simpan, lalu upload ulang `js/data.js` ke GitHub.

### Cara memakai

1. Buka website → klik menu **Upload**.
2. Masukkan password → **Masuk**.
3. Tempel **link YouTube** (thumbnail akan muncul otomatis jika link benar), isi **judul** dan **topik**, pilih **mata pelajaran** → **Upload video**.
4. Video langsung tampil di website untuk semua pengunjung. Pengunjung lain cukup memuat ulang halaman.
5. Video yang salah bisa dihapus dengan tombol 🗑 di daftar **Sudah diupload**, atau langsung dengan menghapus barisnya di spreadsheet.

**Catatan penting:**
- **Mengganti password:** ubah `PASSWORD` di Apps Script → Simpan → **Terapkan → Kelola deployment → ✏️ Edit → Versi: Versi baru → Terapkan**. URL tetap sama, jadi `data.js` tidak perlu diubah.
- **Setiap kali kode Apps Script diubah**, wajib membuat versi baru seperti di atas. Kalau tidak, perubahannya tidak berlaku.
- Video dari `js/data.js` tetap tampil seperti biasa. Kedua cara bisa dipakai bersamaan.
- Password diperiksa oleh Google, bukan oleh website, jadi tidak bisa diintip dari kode website.

---

## 1. Cara menambah atau mengganti video

1. Buka file **`js/data.js`** dengan Notepad, VS Code, atau langsung di GitHub (klik file → ikon pensil ✏️).
2. Cari prodi yang diinginkan, misalnya `id: "kimia"`.
3. Di bagian `video: [ ... ]`, ganti entri contoh atau tambahkan entri baru.

**Sebelum** (masih contoh, otomatis disembunyikan):

```js
video: [
  { judul: "Contoh Judul Video", link: "GANTI_DENGAN_LINK_YOUTUBE", topik: "Topik materi" }
]
```

**Sesudah** (dua video asli):

```js
video: [
  { judul: "Laju Reaksi", link: "https://youtu.be/abcdefghijk?si=xyz", topik: "Faktor yang memengaruhi laju reaksi" },
  { judul: "Kesetimbangan Kimia", link: "https://www.youtube.com/watch?v=abcdefghijk&t=30s", topik: "Pergeseran kesetimbangan" }
]
```

(`abcdefghijk` di atas hanya contoh — tempel link YouTube asli Anda.)

Setiap video cukup berisi **judul**, **link**, dan **topik**. Kelas tidak perlu ditulis per video, karena semua video otomatis dianggap untuk kelas yang diatur di `CONFIG` (bawaan: kelas XI).

**Aturan penting:**

| Aturan | Contoh benar |
|---|---|
| Teks diapit tanda kutip dua | `judul: "Laju Reaksi"` |
| Antar-entri dipisah **koma** | `{ ... },` ← koma di akhir, kecuali entri terakhir boleh tanpa koma |
| Jangan hapus kurung `{ }` dan `[ ]` | — |
| Jika judul memuat tanda kutip, pakai `\"` | `judul: "Puisi \"Aku\" Chairil"` |

**Format link yang didukung** (tempel apa adanya dari tombol *Bagikan* / address bar):

- `https://www.youtube.com/watch?v=XXXXXXXXXXX`
- `https://youtu.be/XXXXXXXXXXX?si=...`
- `https://www.youtube.com/shorts/XXXXXXXXXXX`
- `https://www.youtube.com/embed/XXXXXXXXXXX`
- termasuk yang memiliki tambahan `&t=30s`, `?si=...`, dan sejenisnya.

**Hal yang terjadi otomatis:**

- Thumbnail diambil sendiri dari YouTube.
- Jumlah video pada kartu prodi dan statistik dihitung otomatis.
- Entri yang link-nya masih `GANTI_DENGAN_LINK_YOUTUBE` atau tidak valid **tidak ditampilkan**.
- Prodi tanpa video valid menampilkan tulisan **"Video segera hadir"**.

**Menghapus video:** hapus satu baris `{ ... },` miliknya.

**Video di YouTube sebaiknya berstatus _Public_ atau _Unlisted_** (bukan _Private_), dan opsi *Allow embedding* aktif (di YouTube Studio → Video → Detail → Tampilkan selengkapnya → Izinkan penyematan).

---

## 2. Cara mengganti judul, kelas, dan info footer

Semua ada di **bagian paling atas `js/data.js`**, dalam `CONFIG`:

```js
const CONFIG = {
  judulSitus: "Galeri Video Pembelajaran",
  subjudul: "FKIP Universitas Riau",
  kelas: "XI",
  tahun: "2026",
  universitas: "Universitas Riau",
  fakultas: "Fakultas Keguruan dan Ilmu Pendidikan",
  logo: "",
  timPenyusun: [
    "Nama 1",
    "Nama 2"
  ]
};
```

- **Kelas:** berlaku untuk semua video dan tampil di beranda serta halaman prodi.
- **Logo kampus:** simpan gambar (misalnya `logo-unri.png`) di folder `assets`, lalu isi `logo: "./assets/logo-unri.png"`. Jika dibiarkan `""`, akan tampil teks **UNRI**.
- **Tim penyusun:** kosongkan menjadi `timPenyusun: []` jika tidak ingin ditampilkan di footer.

**Judul di tab browser & tampilan saat link dibagikan (WhatsApp, dsb.)** diatur di bagian atas `index.html`, pada baris `<title>`, `meta name="description"`, `og:title`, dan `og:description`.

**Mengubah ikon/warna/deskripsi prodi:** di `js/data.js`, ubah `ikon` (emoji), `deskripsi`, atau `warna` (dua kode warna, misalnya `["#14b8a6", "#0891b2"]`). Jangan mengubah `id` karena dipakai di alamat link (misalnya `#/prodi/kimia`).

---

## 3. Upload ke GitHub lewat browser (tanpa Git)

1. Buat akun di **https://github.com** (jika belum) dan login.
2. Klik tombol **+** di kanan atas → **New repository**.
3. Isi **Repository name**, misalnya `video-kelas-11`. Pilih **Public**. Klik **Create repository**.
4. Di halaman repository baru, klik tautan **uploading an existing file** (atau **Add file → Upload files**).
5. Buka folder website di komputer, **pilih semua isinya** (`index.html`, `README.md`, folder `css`, `js`, `assets`), lalu **seret (drag & drop)** ke halaman GitHub.
   - Yang diupload adalah **isi** folder, bukan folder pembungkusnya. Setelah upload, `index.html` harus terlihat langsung di halaman utama repository.
   - Jika folder tidak bisa diseret, gunakan Chrome/Edge versi terbaru.
6. Gulir ke bawah, klik **Commit changes**.
7. Buka tab **Settings** (di repository) → menu kiri **Pages**.
8. Pada **Build and deployment**:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` dan folder `/ (root)`
   - Klik **Save**.
9. Tunggu beberapa menit, lalu muat ulang halaman **Settings → Pages**. Alamat website akan muncul di bagian atas: *"Your site is live at ..."*.

**Memperbarui video nanti:** buka `js/data.js` di GitHub → ikon pensil ✏️ → edit → **Commit changes**. Website akan diperbarui otomatis.

---

## 4. Alamat website & berapa lama sampai online

Alamat website akan berbentuk:

```
https://USERNAME.github.io/NAMA-REPOSITORY/
```

Contoh: akun `namaakunmu` dengan repository `video-kelas-11` →
`https://namaakunmu.github.io/video-kelas-11/`

- Publikasi pertama biasanya **1–5 menit**, kadang sampai **10 menit**.
- Setiap pembaruan berikutnya biasanya online dalam **1–3 menit**.
- Proses bisa dipantau di tab **Actions** repository (tanda ✅ hijau = selesai).

Link ke halaman prodi juga bisa dibagikan langsung, misalnya:
`https://namaakunmu.github.io/video-kelas-11/#/prodi/kimia`

---

## 5. Solusi masalah umum

### ❌ Video tidak bisa diputar di dalam website

- **Pemilik video melarang penyematan (embed)** atau video berstatus *Private* → aktifkan *Allow embedding* di YouTube Studio dan ubah ke *Public/Unlisted*. Sementara itu, pengunjung tetap bisa memakai tombol **"Tonton di YouTube"**.
- **Muncul "Error 153" / "Video player configuration error" saat dibuka dari file di komputer** → ini wajar. YouTube kini meminta pemutar dibuka dari sebuah website. Setelah online di GitHub Pages, video akan berjalan normal.
- **Video dibatasi usia atau berisi musik berhak cipta** → hanya bisa ditonton di YouTube; gunakan tombol "Tonton di YouTube".
- **Video tidak muncul sama sekali** → periksa link di `js/data.js`. Link harus lengkap seperti `https://youtu.be/...`, bukan link playlist atau link channel.

### 🔄 Tampilan tidak berubah setelah update

- Tunggu **1–3 menit** setelah *Commit changes* (cek tab **Actions**).
- Muat ulang paksa: **Ctrl + F5** atau **Ctrl + Shift + R** (Windows), **Cmd + Shift + R** (Mac). Di HP, coba buka di tab penyamaran (*incognito*).
- Pastikan yang diedit adalah file di branch `main`.

### ⬜ Halaman kosong / tampilan berantakan tanpa warna

- **Salah struktur folder:** `index.html` harus berada **langsung** di halaman utama repository, bukan di dalam folder lain (misalnya `video-kelas-11/index.html`). Jika terlanjur, upload ulang **isinya** saja.
- **Nama file/folder salah huruf besar-kecil:** GitHub Pages membedakannya. Harus `css/style.css`, `js/data.js`, `js/main.js`, `js/particles.js`.
- **Salah ketik di `js/data.js`** (koma atau tanda kutip hilang) → website menampilkan pesan *"Data belum terbaca"*. Tekan **F12 → Console** untuk melihat baris yang bermasalah, lalu bandingkan dengan contoh di atas.
- **GitHub Pages belum aktif:** cek lagi **Settings → Pages** (Source: *Deploy from a branch*, Branch: *main*, */ (root)*).

### 📤 Masalah di halaman Upload

- **Muncul "Fitur upload belum diaktifkan"** → `uploadUrl` di `js/data.js` masih kosong, atau `data.js` yang baru belum diupload ke GitHub.
- **"Password belum diatur di Apps Script"** → ganti `GANTI_PASSWORD_DI_SINI` di Apps Script, lalu buat **versi baru** deployment (lihat Catatan penting di bagian Mengaktifkan fitur Upload).
- **"Tidak bisa terhubung ke server"** → periksa internet. Pastikan juga saat deploy dipilih **Yang memiliki akses: Siapa saja (Anyone)**, dan URL yang ditempel berakhiran `/exec` (bukan `/dev`).
- **Video sudah diupload tapi belum muncul di HP lain** → muat ulang halaman. Daftar video diambil dari spreadsheet setiap kali website dibuka.

### 🌙 Mode gelap/terang tidak tersimpan

Pilihan tema disimpan di browser pengunjung. Jika browser dalam mode penyamaran atau memblokir penyimpanan, tema akan kembali mengikuti pengaturan perangkat. Ini normal.

---

## Catatan teknis singkat

- Murni HTML, CSS, dan JavaScript (vanilla), tanpa npm/build.
- Data disimpan sebagai variabel JavaScript (bukan file JSON) supaya website tetap jalan saat dibuka langsung dari file.
- Routing memakai tanda `#` (contoh `#/prodi/kimia`) sehingga tidak pernah muncul error 404 di GitHub Pages dan tombol *Back* berfungsi.
- Video diputar lewat `youtube-nocookie.com`, dan pemutar baru dibuat saat video diklik supaya halaman tetap ringan.
- Mendukung mode gelap/terang, tampilan HP 360px hingga desktop lebar, navigasi keyboard, dan pengaturan *reduce motion* di perangkat.
