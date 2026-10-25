/* =====================================================================
   GOOGLE APPS SCRIPT — "SERVER" GRATIS UNTUK FITUR UPLOAD VIDEO
   =====================================================================
   File ini TIDAK dipakai langsung oleh website. Salin seluruh isinya ke
   Google Apps Script (Spreadsheet > Ekstensi > Apps Script), lalu ikuti
   panduan di README.md bagian "Mengaktifkan fitur Upload".

   Fungsi:
   - Menyimpan video yang diupload lewat website ke spreadsheet
   - Mengirim daftar video ke website
   - Mengecek password (password TIDAK pernah terlihat di kode website)
   ===================================================================== */

// ▼▼▼ GANTI PASSWORD DI SINI (di editor Apps Script, BUKAN di GitHub) ▼▼▼
// Huruf besar/kecil dan spasi diabaikan saat dicek.
const PASSWORD = "GANTI_PASSWORD_DI_SINI";
// ▲▲▲

const NAMA_SHEET = "Video";
const KOLOM = ["id", "waktu", "prodi", "judul", "link", "topik"];


/* ---------- Ambil (atau buat) lembar "Video" ---------- */
function ambilSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(NAMA_SHEET);
  if (!sh) {
    sh = ss.insertSheet(NAMA_SHEET);
    sh.appendRow(KOLOM);
    sh.setFrozenRows(1);
  }
  return sh;
}

/* ---------- Bantu ---------- */
function rapikan_(teks) {
  return String(teks || "").toLowerCase().replace(/\s+/g, "");
}

// Cegah teks dianggap rumus oleh spreadsheet (misal diawali "=")
function amankan_(teks, maks) {
  let t = String(teks || "").trim().slice(0, maks || 200);
  if (/^[=+\-@]/.test(t)) t = "'" + t;
  return t;
}

function balas_(objek) {
  return ContentService.createTextOutput(JSON.stringify(objek))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------- GET: daftar semua video (dipanggil website) ---------- */
function doGet(e) {
  const baris = ambilSheet_().getDataRange().getValues();
  baris.shift(); // buang judul kolom
  const video = baris
    .filter(function (r) { return r[0] && r[4]; })
    .map(function (r) {
      return {
        id: String(r[0]),
        waktu: r[1] instanceof Date ? r[1].toISOString() : String(r[1]),
        prodi: String(r[2]),
        judul: String(r[3]).replace(/^'/, ""),
        link: String(r[4]),
        topik: String(r[5]).replace(/^'/, "")
      };
    });

  const json = JSON.stringify({ ok: true, video: video });
  const callback = e && e.parameter && e.parameter.callback;
  // Format JSONP supaya bisa dibaca website walau dibuka langsung dari file
  if (callback && /^[A-Za-z_$][\w$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- POST: cek password, tambah, atau hapus video ---------- */
function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return balas_({ ok: false, pesan: "Data yang dikirim tidak terbaca." });
  }

  if (PASSWORD === "GANTI_PASSWORD_DI_SINI") {
    return balas_({ ok: false, pesan: "Password belum diatur di Apps Script. Lihat README." });
  }
  if (rapikan_(data.password) !== rapikan_(PASSWORD)) {
    Utilities.sleep(800); // perlambat percobaan menebak password
    return balas_({ ok: false, pesan: "Password salah." });
  }

  if (data.aksi === "cek") return balas_({ ok: true });

  const kunci = LockService.getScriptLock();
  kunci.waitLock(10000);
  try {
    const sh = ambilSheet_();

    if (data.aksi === "tambah") {
      const link = String(data.link || "").trim();
      if (!/(youtube\.com|youtu\.be)\//i.test(link)) return balas_({ ok: false, pesan: "Link harus dari YouTube." });
      if (!String(data.judul || "").trim()) return balas_({ ok: false, pesan: "Judul wajib diisi." });
      if (!String(data.prodi || "").trim()) return balas_({ ok: false, pesan: "Mata pelajaran wajib dipilih." });

      const id = Utilities.getUuid();
      sh.appendRow([
        id,
        new Date(),
        amankan_(data.prodi, 60),
        amankan_(data.judul, 150),
        amankan_(link, 300),
        amankan_(data.topik, 150)
      ]);
      return balas_({ ok: true, id: id });
    }

    if (data.aksi === "hapus") {
      const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues();
      for (let i = ids.length - 1; i >= 1; i--) {
        if (String(ids[i][0]) === String(data.id)) {
          sh.deleteRow(i + 1);
          return balas_({ ok: true });
        }
      }
      return balas_({ ok: false, pesan: "Video tidak ditemukan." });
    }

    return balas_({ ok: false, pesan: "Aksi tidak dikenal." });
  } finally {
    kunci.releaseLock();
  }
}
