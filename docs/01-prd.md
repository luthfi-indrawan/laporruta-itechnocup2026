# Product Requirements Document (PRD) — LaporRuta

## 1. Product Overview

### 1.1 Product Name

**LaporRuta**

### 1.2 Product Description

LaporRuta adalah platform pelaporan permasalahan publik berbasis lokasi yang memungkinkan masyarakat melaporkan permasalahan infrastruktur atau fasilitas publik, melengkapi laporan dengan informasi lokasi dan bukti gambar, serta memantau perkembangan laporan secara transparan.

Laporan yang dikirimkan masyarakat akan melalui proses moderasi sebelum ditampilkan kepada publik. Administrator dapat memverifikasi laporan, memperbarui status penanganan, memberikan catatan internal, serta memprioritaskan laporan berdasarkan tingkat urgensi dan dukungan komunitas.

LaporRuta menggunakan sistem administrasi bertingkat yang terdiri dari:

- **Masyarakat / Public User**
- **Admin Wilayah**
- **Admin Pusat**

Admin Wilayah bertanggung jawab terhadap laporan pada wilayah yang ditugaskan kepadanya, sedangkan Admin Pusat memiliki akses dan kontrol terhadap keseluruhan wilayah serta sistem administrasi.

### 1.3 Product Scope

LaporRuta mencakup tiga area utama:

#### Citizen Reporting

Masyarakat dapat:

- Membuat laporan permasalahan publik.
- Menentukan wilayah dan lokasi laporan.
- Mengunggah bukti gambar.
- Melihat laporan publik.
- Memberikan upvote.
- Memberikan komentar.
- Melihat perkembangan laporan yang dibuat.

#### Regional Administration

Admin Wilayah dapat:

- Melihat laporan pada wilayah yang ditugaskan.
- Memoderasi laporan.
- Mengubah status laporan.
- Menambahkan catatan internal.
- Melihat aktivitas laporan.
- Memantau laporan berdasarkan prioritas.

#### Central Administration

Admin Pusat dapat:

- Memantau seluruh laporan.
- Mengelola administrator.
- Mengelola penugasan wilayah.
- Menangani laporan pada zona tanpa Admin Wilayah.
- Mengubah atau mengesampingkan status laporan.
- Mengubah metadata laporan.
- Melihat statistik sistem.
- Mengekspor data laporan.

---

## 2. Background

Permasalahan fasilitas publik seperti jalan rusak, lampu penerangan mati, drainase tersumbat, trotoar rusak, dan fasilitas umum lainnya membutuhkan mekanisme pelaporan yang mudah, terstruktur, dan dapat dipantau.

Dalam mekanisme pelaporan konvensional, masyarakat sering kali menghadapi beberapa kendala:

- Tidak mengetahui kanal pelaporan yang tepat.
- Sulit memberikan informasi lokasi yang presisi.
- Tidak mengetahui apakah laporan telah diterima atau ditindaklanjuti.
- Tidak memiliki visibilitas terhadap perkembangan penanganan laporan.

Di sisi lain, pihak yang bertanggung jawab terhadap fasilitas publik dapat menerima laporan dari berbagai kanal seperti media sosial, pesan instan, telepon, maupun laporan manual. Kondisi tersebut dapat menyebabkan data laporan terfragmentasi dan menyulitkan proses prioritisasi.

LaporRuta dirancang sebagai platform terpadu yang menghubungkan masyarakat dengan administrator melalui mekanisme pelaporan berbasis lokasi, moderasi, status tracking, dukungan komunitas, dan pengelolaan administratif berbasis wilayah.

### 2.1 Product Alignment

LaporRuta mendukung tujuan pembangunan berkelanjutan, khususnya:

- **SDG 9 — Industry, Innovation and Infrastructure**, melalui pemanfaatan teknologi digital untuk membantu pemantauan dan pengelolaan permasalahan infrastruktur.
- **SDG 11 — Sustainable Cities and Communities**, melalui partisipasi masyarakat dalam pelaporan dan pemantauan permasalahan lingkungan serta fasilitas publik.

---

## 3. Problem Statement

### 3.1 Masalah bagi Masyarakat

Masyarakat membutuhkan cara yang lebih mudah untuk menyampaikan permasalahan publik dengan informasi yang cukup lengkap, khususnya lokasi dan bukti visual.

Permasalahan utama:

1. Pelaporan masih dapat dilakukan melalui kanal yang terfragmentasi.
2. Informasi lokasi sering kali tidak presisi.
3. Masyarakat tidak selalu mengetahui status tindak lanjut laporan.
4. Masyarakat tidak memiliki mekanisme terstruktur untuk menunjukkan bahwa suatu permasalahan juga dirasakan oleh warga lain.

### 3.2 Masalah bagi Administrator

Administrator membutuhkan sistem yang dapat membantu mengelola laporan berdasarkan wilayah dan tingkat kepentingannya.

Permasalahan utama:

1. Laporan dapat berasal dari berbagai sumber.
2. Sulit menentukan laporan mana yang harus diprioritaskan.
3. Laporan perlu diverifikasi sebelum ditampilkan sebagai informasi publik.
4. Dibutuhkan pembagian tanggung jawab berdasarkan wilayah.
5. Administrator membutuhkan histori tindakan untuk menjaga transparansi dan akuntabilitas.

### 3.3 Masalah bagi Komunitas

Masyarakat membutuhkan mekanisme partisipasi yang memungkinkan mereka memberikan sinyal bahwa suatu permasalahan memiliki dampak atau urgensi yang tinggi.

LaporRuta menyediakan mekanisme **upvote** sehingga dukungan komunitas dapat menjadi salah satu komponen dalam penentuan prioritas laporan.

---

## 4. Objectives

### 4.1 Product Objectives

| ID    | Tujuan                        | Deskripsi                                                                                                                                 |
| ----- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| PG-01 | Pelaporan berbasis lokasi     | Menyediakan mekanisme pelaporan dengan informasi wilayah dan koordinat geografis.                                                         |
| PG-02 | Transparansi                  | Memungkinkan masyarakat memantau status dan aktivitas laporan.                                                                            |
| PG-03 | Prioritisasi                  | Membantu administrator menentukan prioritas laporan berdasarkan kombinasi dukungan komunitas, urgensi kategori, lokasi, dan usia laporan. |
| PG-04 | Moderasi                      | Memastikan laporan baru diverifikasi sebelum ditampilkan kepada publik.                                                                   |
| PG-05 | Administrasi berbasis wilayah | Membatasi akses Admin Wilayah berdasarkan wilayah tanggung jawabnya.                                                                      |
| PG-06 | Monitoring terpusat           | Memberikan Admin Pusat visibilitas terhadap seluruh laporan dan administrator.                                                            |
| PG-07 | Respons real-time             | Memberikan pembaruan laporan dan dashboard tanpa mengharuskan pengguna melakukan refresh secara manual.                                   |

### 4.2 Success Criteria

Target keberhasilan produk meliputi:

- Mayoritas laporan dapat menyertakan informasi lokasi yang valid.
- Administrator dapat mengetahui dan memproses laporan berdasarkan wilayah.
- Laporan dapat diprioritaskan menggunakan mekanisme skor yang konsisten.
- Laporan publik hanya berasal dari laporan yang telah melalui proses verifikasi.
- Masyarakat dapat mengetahui perkembangan laporan yang mereka buat.

---

## 5. Target Users

### 5.1 Masyarakat / Public User

**Tujuan:**

- Melaporkan permasalahan publik.
- Memberikan lokasi dan bukti permasalahan.
- Memantau laporan yang dibuat.
- Mengetahui permasalahan di sekitar.
- Mendukung laporan yang dianggap penting.

**Kebutuhan:**

- Antarmuka sederhana.
- Peta interaktif.
- Form pelaporan yang jelas.
- Status laporan yang mudah dipahami.
- Feedback terhadap perkembangan laporan.

**Preferensi perangkat:**

Mobile-first, dengan dukungan desktop.

---

### 5.2 Admin Wilayah

Admin Wilayah bertanggung jawab terhadap laporan yang berada pada wilayah administratif yang ditugaskan kepadanya.

**Tujuan:**

- Melihat laporan pada wilayahnya.
- Memverifikasi laporan.
- Menolak laporan yang tidak valid.
- Memperbarui status penanganan.
- Menambahkan catatan internal.
- Menentukan laporan yang perlu diprioritaskan.

**Batasan akses:**

Admin Wilayah hanya dapat melihat dan mengelola laporan yang berada pada wilayah yang ditugaskan kepadanya.

---

### 5.3 Admin Pusat

Admin Pusat memiliki cakupan akses terhadap keseluruhan sistem.

**Tujuan:**

- Memantau laporan di seluruh wilayah.
- Mengelola Admin Wilayah dan Admin Pusat.
- Mengatur penugasan wilayah.
- Menangani zona tanpa administrator.
- Melakukan override terhadap tindakan Admin Wilayah.
- Melihat statistik.
- Mengekspor data.

**Batasan akses:**

Admin Pusat memiliki akses penuh terhadap fungsi administrasi sistem.

---

## 6. User Stories

### 6.1 Autentikasi

**US-AUTH-01**

> Sebagai masyarakat, saya ingin membuat akun menggunakan email dan password sehingga saya dapat membuat laporan dan berinteraksi dengan laporan publik.

**US-AUTH-02**

> Sebagai pengguna terdaftar, saya ingin login dan logout sehingga akses terhadap akun saya dapat dikelola dengan aman.

**US-AUTH-03**

> Sebagai pengguna, saya ingin sesi autentikasi dapat diperbarui sehingga saya tidak perlu login ulang secara terus-menerus ketika access token kedaluwarsa.

**US-AUTH-04**

> Sebagai administrator, saya ingin diarahkan ke dashboard sesuai role sehingga saya hanya dapat mengakses fungsi yang sesuai dengan kewenangan saya.

---

### 6.2 Eksplorasi Peta

**US-MAP-01**

> Sebagai pengguna, saya ingin melihat laporan publik pada peta interaktif sehingga saya dapat mengetahui permasalahan yang terjadi di suatu area.

**US-MAP-02**

> Sebagai pengguna, saya ingin melihat laporan dalam bentuk marker dan cluster sehingga peta tetap mudah digunakan ketika terdapat banyak laporan.

**US-MAP-03**

> Sebagai pengguna, saya ingin mencari dan memfilter laporan berdasarkan informasi tertentu sehingga saya dapat menemukan laporan yang relevan.

---

### 6.3 Pelaporan

**US-RPT-01**

> Sebagai masyarakat yang telah login, saya ingin membuat laporan dengan judul, deskripsi, kategori, wilayah, lokasi, dan gambar sehingga permasalahan dapat dilaporkan dengan informasi yang cukup.

**US-RPT-02**

> Sebagai masyarakat, saya ingin menentukan lokasi laporan menggunakan wilayah administratif dan pin pada peta sehingga lokasi permasalahan dapat direpresentasikan dengan lebih akurat.

**US-RPT-03**

> Sebagai masyarakat, saya ingin melihat seluruh laporan yang pernah saya buat sehingga saya dapat memantau statusnya.

**US-RPT-04**

> Sebagai masyarakat, saya ingin melihat detail laporan saya sehingga saya dapat mengetahui informasi, aktivitas, komentar, dan perkembangan laporan.

---

### 6.4 Partisipasi Komunitas

**US-COM-01**

> Sebagai pengguna, saya ingin memberikan upvote pada laporan sehingga saya dapat menunjukkan bahwa permasalahan tersebut penting bagi komunitas.

**US-COM-02**

> Sebagai pengguna, saya ingin memberikan komentar pada laporan sehingga saya dapat memberikan informasi atau konteks tambahan.

---

### 6.5 Administrasi Wilayah

**US-ADM-W-01**

> Sebagai Admin Wilayah, saya ingin melihat laporan yang ditugaskan kepada wilayah saya sehingga saya dapat memproses laporan yang menjadi tanggung jawab saya.

**US-ADM-W-02**

> Sebagai Admin Wilayah, saya ingin memverifikasi atau menolak laporan sehingga hanya laporan yang valid yang ditampilkan kepada publik.

**US-ADM-W-03**

> Sebagai Admin Wilayah, saya ingin memperbarui status laporan sehingga masyarakat dapat mengetahui perkembangan penanganannya.

**US-ADM-W-04**

> Sebagai Admin Wilayah, saya ingin menambahkan catatan internal sehingga koordinasi penanganan laporan dapat dilakukan tanpa mengekspos informasi internal kepada masyarakat.

**US-ADM-W-05**

> Sebagai Admin Wilayah, saya ingin mengunggah gambar setelah perbaikan sehingga hasil penanganan dapat didokumentasikan.

---

### 6.6 Administrasi Pusat

**US-ADM-C-01**

> Sebagai Admin Pusat, saya ingin melihat seluruh laporan sehingga saya dapat memonitor kondisi di semua wilayah.

**US-ADM-C-02**

> Sebagai Admin Pusat, saya ingin menugaskan ulang laporan ke wilayah lain sehingga laporan dapat ditangani oleh administrator yang tepat.

**US-ADM-C-03**

> Sebagai Admin Pusat, saya ingin melakukan override terhadap status laporan sehingga kesalahan atau kasus khusus dapat ditangani.

**US-ADM-C-04**

> Sebagai Admin Pusat, saya ingin mengubah metadata laporan sehingga informasi laporan dapat diperbaiki jika diperlukan.

**US-ADM-C-05**

> Sebagai Admin Pusat, saya ingin melihat statistik sehingga saya dapat memperoleh gambaran kondisi laporan secara keseluruhan.

**US-ADM-C-06**

> Sebagai Admin Pusat, saya ingin mengelola akun administrator sehingga pembagian kewenangan sistem dapat dikelola secara terpusat.

**US-ADM-C-07**

> Sebagai Admin Pusat, saya ingin mengundang administrator baru sehingga administrator dapat bergabung ke sistem melalui mekanisme invitation.

---

## 7. Features

Fitur dikelompokkan menggunakan metode **MoSCoW** berdasarkan kebutuhan produk pada iterasi submission saat ini.

---

### 7.1 Must Have

Fitur berikut merupakan bagian dari implementasi utama LaporRuta.

| ID   | Fitur                               | Deskripsi                                                                                                                                  |
| ---- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| M-01 | Autentikasi User                    | Login, register, logout, dan refresh session menggunakan mekanisme autentikasi backend.                                                    |
| M-02 | RBAC / Protected Route              | Pembatasan akses berdasarkan role User, Admin Wilayah, dan Admin Pusat.                                                                    |
| M-03 | Eksplorasi Peta Interaktif          | Peta publik untuk menampilkan laporan terverifikasi.                                                                                       |
| M-04 | Marker Clustering                   | Pengelompokan marker pada area dengan jumlah laporan tinggi.                                                                               |
| M-05 | Pemilihan Lokasi Bertingkat         | Pemilihan lokasi berdasarkan hierarki wilayah administratif.                                                                               |
| M-06 | Penanda Pin Mini Peta               | Pengguna dapat menentukan koordinat lokasi melalui pin pada mini map.                                                                      |
| M-07 | Membuat Laporan                     | Pengguna terautentikasi dapat membuat laporan baru.                                                                                        |
| M-08 | Formulir Pelaporan Geo Tag          | Laporan mendukung informasi wilayah dan koordinat geografis.                                                                               |
| M-09 | Unggah Gambar                       | Pengguna dapat melampirkan gambar sebagai bukti laporan.                                                                                   |
| M-10 | Antrian Moderasi                    | Laporan baru masuk ke status pending verification sebelum ditampilkan publik.                                                              |
| M-11 | Sistem Upvote                       | Pengguna dapat memberikan satu upvote per laporan dan melakukan toggle upvote.                                                             |
| M-12 | Siklus Status                       | Laporan memiliki siklus status dari pending verification, verified, in progress, hingga resolved, serta rejected sebagai status penolakan. |
| M-13 | Dashboard Admin Wilayah             | Dashboard khusus untuk laporan pada wilayah yang ditugaskan.                                                                               |
| M-14 | Dashboard Admin Pusat               | Dashboard untuk memantau keseluruhan laporan dan administrasi sistem.                                                                      |
| M-15 | Log Aktivitas                       | Setiap tindakan penting pada laporan dicatat dalam activity log.                                                                           |
| M-16 | Indikator Belum Dibaca              | Sistem memberikan indikator ketika laporan pengguna mengalami pembaruan.                                                                   |
| M-17 | Algoritma Prioritas                 | Sistem menghitung skor prioritas untuk membantu administrator menentukan laporan yang perlu ditangani terlebih dahulu.                     |
| M-18 | Desain Responsif                    | Antarmuka mendukung perangkat mobile dan desktop.                                                                                          |
| M-19 | Sistem Komentar                     | Pengguna dapat memberikan komentar pada laporan publik.                                                                                    |
| M-20 | Catatan Internal Admin              | Administrator dapat menyimpan catatan internal pada laporan.                                                                               |
| M-21 | Pencarian & Filter                  | Laporan dapat dicari dan difilter berdasarkan informasi yang tersedia.                                                                     |
| M-22 | Ekspor CSV                          | Admin Pusat dapat mengekspor data laporan ke format CSV.                                                                                   |
| M-23 | Penugasan Otomatis & Fallback       | Laporan diarahkan berdasarkan wilayah dan menggunakan fallback ke Admin Pusat jika tidak tersedia Admin Wilayah.                           |
| M-24 | Pembaruan Peta Real-Time            | Perubahan laporan pada peta publik dapat diterima tanpa refresh manual.                                                                    |
| M-25 | Pembaruan Dashboard Admin Real-Time | Dashboard administrator menerima perubahan laporan secara real-time.                                                                       |
| M-26 | Get My Reports                      | Pengguna dapat mengambil daftar laporan yang dibuatnya.                                                                                    |
| M-27 | Get My Report Detail                | Pengguna dapat melihat detail laporan miliknya.                                                                                            |
| M-28 | Public Report Detail                | Pengguna dapat melihat detail laporan yang telah tersedia secara publik.                                                                   |
| M-29 | Upload After Images                 | Administrator dapat mengunggah gambar setelah perbaikan sebagai dokumentasi hasil penanganan.                                              |
| M-30 | Override Status                     | Admin Pusat dapat melakukan override terhadap status laporan.                                                                              |
| M-31 | Reassign Zone                       | Admin Pusat dapat memindahkan penugasan laporan ke wilayah lain.                                                                           |
| M-32 | Edit Report Metadata                | Admin Pusat dapat memperbarui metadata laporan seperti judul, deskripsi, atau kategori.                                                    |
| M-33 | Get Statistics                      | Admin dapat melihat statistik terkait laporan untuk membantu monitoring sistem.                                                            |
| M-34 | Toggle Admin Status                 | Admin Pusat dapat mengaktifkan atau menonaktifkan status administrator.                                                                    |
| M-35 | Invitation Admin                    | Admin Pusat dapat mengundang administrator baru.                                                                                           |
| M-36 | Accept Invitation                   | Administrator yang menerima undangan dapat melakukan proses penerimaan invitation untuk bergabung ke sistem.                               |

---

### 7.2 Should Have

Untuk iterasi submission saat ini, fitur yang sebelumnya direncanakan sebagai `Should-Have` tetapi belum menjadi bagian dari implementasi utama diprioritaskan untuk pengembangan berikutnya.

| ID   | Fitur                       | Deskripsi                                                                                                                                                     |
| ---- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S-01 | Deteksi Laporan Duplikat    | Sistem mendeteksi kemungkinan laporan yang sama berdasarkan lokasi, kategori, dan waktu kemudian menyarankan pengguna untuk mendukung laporan yang sudah ada. |
| S-02 | Pembukaan Ulang / Dispute   | Pengguna dapat meminta peninjauan kembali terhadap laporan yang telah berstatus resolved tetapi dianggap belum selesai.                                       |
| S-03 | Kompresi Gambar Client-Side | Gambar dikompresi pada perangkat pengguna sebelum dikirim ke backend untuk mengurangi ukuran upload dan penggunaan bandwidth.                                 |

---

### 7.3 Could Have

Fitur berikut merupakan peningkatan produk yang dapat dikembangkan setelah kebutuhan utama terpenuhi.

| ID   | Fitur                 | Deskripsi                                                                                                    |
| ---- | --------------------- | ------------------------------------------------------------------------------------------------------------ |
| C-01 | Gamifikasi / Lencana  | Memberikan badge kepada pengguna berdasarkan aktivitas dan kontribusinya.                                    |
| C-02 | Papan Peringkat       | Menampilkan peringkat pengguna berdasarkan aktivitas pelaporan atau kontribusi komunitas.                    |
| C-03 | PWA / Service Worker  | Mendukung kemampuan aplikasi web seperti offline reporting dan sinkronisasi ketika koneksi kembali tersedia. |
| C-04 | Blur Wajah Otomatis   | Mendeteksi dan mengaburkan wajah atau informasi sensitif tertentu pada gambar untuk meningkatkan privasi.    |
| C-05 | Dukungan Multi-Bahasa | Menyediakan antarmuka dalam Bahasa Indonesia dan Bahasa Inggris atau bahasa lainnya.                         |

---

### 7.4 Won't Have

Fitur berikut secara eksplisit tidak menjadi bagian dari scope iterasi saat ini.

| ID   | Fitur                                  | Alasan                                                                                                                                       |
| ---- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| W-01 | Notifikasi Push / Email / SMS          | Model notifikasi saat ini menggunakan indikator pembaruan berbasis pull sehingga infrastruktur notifikasi eksternal tidak menjadi prioritas. |
| W-02 | Validasi Gambar AI / Auto-Kategorisasi | Kategorisasi manual dan proses moderasi administrator dianggap cukup untuk kebutuhan iterasi saat ini.                                       |
| W-03 | Aplikasi Mobile Native                 | LaporRuta dikembangkan sebagai aplikasi web responsif.                                                                                       |
| W-04 | Blockchain / Smart Contract            | Audit trail dan activity log dianggap cukup untuk kebutuhan transparansi sistem.                                                             |
| W-05 | Integrasi API Pemerintah Eksternal     | Integrasi langsung dengan sistem pelaporan pemerintah eksternal berada di luar scope iterasi ini.                                            |
| W-06 | Integrasi Penyedia Peta Berbayar       | Sistem menggunakan peta berbasis OpenStreetMap dan Leaflet sehingga integrasi dengan layanan peta berbayar tidak menjadi kebutuhan utama.    |
| W-07 | Social Sharing / Viral Mechanics       | Fokus platform adalah interaksi internal antara masyarakat dan administrator, bukan distribusi laporan ke media sosial eksternal.            |

---

## 8. Business Rules

### 8.1 Authentication

1. Fitur pelaporan membutuhkan pengguna yang telah terautentikasi.
2. Pengguna publik tetap dapat melihat laporan publik tanpa harus membuat akun.
3. Access terhadap fungsi administrasi membutuhkan role administrator yang sesuai.
4. Role menentukan akses terhadap halaman dan endpoint sistem.

### 8.2 Role & Authorization

LaporRuta memiliki tiga role utama:

```text
User
├── Public reporting
├── Upvote
├── Comment
└── View own reports

Admin Wilayah
├── Manage reports in assigned wilayah
├── Verify / Reject
├── Update status
├── Add internal notes
└── Upload after images

Admin Pusat
├── Full report access
├── Manage administrators
├── Reassign zone
├── Override status
├── Edit metadata
├── Statistics
└── Export data
```

Admin Wilayah **tidak dapat mengelola laporan di luar wilayah yang ditugaskan**.

Admin Pusat memiliki akses lintas wilayah.

---

### 8.3 Report Creation

1. Hanya pengguna yang telah login dapat membuat laporan.
2. Laporan harus memiliki judul, deskripsi, kategori, dan informasi wilayah.
3. Lokasi dapat dilengkapi dengan koordinat geografis.
4. Gambar digunakan sebagai bukti pendukung laporan.
5. Laporan baru memiliki status `Pending Verification`.
6. Laporan pending tidak ditampilkan pada peta publik.

---

### 8.4 Moderation

1. Laporan baru harus melalui proses verifikasi.
2. Admin Wilayah dapat memverifikasi laporan pada wilayahnya.
3. Admin Wilayah dapat menolak laporan pada wilayahnya.
4. Penolakan membutuhkan alasan.
5. Admin Pusat dapat melakukan moderasi lintas wilayah.
6. Laporan yang ditolak tidak ditampilkan pada peta publik.

---

### 8.5 Report Status

Status utama laporan:

```text
Pending Verification
        │
        ├──────────────► Rejected
        │
        ▼
     Verified
        │
        ▼
   In Progress
        │
        ▼
     Resolved
```

Aturan transisi:

- `Pending Verification → Verified`
- `Pending Verification → Rejected`
- `Verified → In Progress`
- `In Progress → Resolved`

Admin Pusat dapat melakukan **override** terhadap status, termasuk mengubah status ke tahap sebelumnya apabila diperlukan.

---

### 8.6 Upvote

1. Hanya pengguna yang terautentikasi yang dapat memberikan upvote.
2. Satu pengguna hanya dapat memiliki satu upvote pada satu laporan.
3. Upvote dapat di-toggle.
4. Upvote hanya berlaku untuk laporan yang tersedia secara publik.
5. Upvote menjadi salah satu komponen dalam perhitungan priority score.
6. Aktivitas upvote dicatat dalam activity log.

---

### 8.7 Comment

1. Pengguna terautentikasi dapat memberikan komentar pada laporan publik.
2. Komentar digunakan untuk memberikan konteks tambahan atau informasi mengenai kondisi laporan.
3. Komentar merupakan bagian dari interaksi komunitas dan bukan pengganti proses moderasi administrator.

---

### 8.8 Automatic Assignment & Fallback

Ketika laporan dibuat:

1. Sistem menentukan wilayah laporan.
2. Sistem memeriksa Admin Wilayah aktif yang bertanggung jawab terhadap wilayah tersebut.
3. Jika tersedia, laporan diarahkan kepada Admin Wilayah tersebut.
4. Jika tidak tersedia, laporan masuk ke antrian Admin Pusat.
5. Admin Pusat dapat menugaskan ulang laporan jika diperlukan.

---

### 8.9 Admin Status

Admin Pusat dapat mengaktifkan atau menonaktifkan akun administrator.

Administrator yang tidak aktif tidak dapat menggunakan fungsi administrasi sampai status akunnya diaktifkan kembali.

---

### 8.10 Admin Invitation

1. Admin Pusat dapat membuat invitation untuk administrator baru.
2. Invitation memiliki token dan masa berlaku.
3. Administrator yang menerima invitation dapat melakukan proses accept invitation.
4. Role dan wilayah administrator ditentukan berdasarkan konfigurasi invitation.
5. Invitation yang tidak lagi valid tidak dapat digunakan.

---

### 8.11 Activity Log

Aktivitas penting pada laporan dicatat sebagai audit trail, termasuk:

- Pembuatan laporan.
- Upvote.
- Komentar atau aktivitas relevan.
- Verifikasi.
- Penolakan.
- Perubahan status.
- Override.
- Reassignment wilayah.
- Perubahan metadata.

Log menyimpan informasi aktor dan waktu aktivitas.

---

## 9. Priority Algorithm

LaporRuta menggunakan algoritma prioritas untuk membantu administrator menentukan laporan yang perlu mendapat perhatian lebih tinggi.

### 9.1 Formula

```text
Priority Score =
    (Jumlah Upvote × 3)
  + (Bobot Urgensi Kategori × 5)
  + (Memiliki Koordinat ? 2 : 0)
  − (Usia Laporan dalam Hari × 0.5)
```

### 9.2 Komponen Formula

#### Jumlah Upvote × 3

Jumlah upvote merepresentasikan dukungan komunitas terhadap suatu laporan.

Semakin banyak pengguna yang memberikan upvote, semakin tinggi nilai prioritas laporan.

#### Bobot Urgensi Kategori × 5

Setiap kategori memiliki bobot urgensi yang dapat dikonfigurasi pada data master.

Contoh:

| Kategori                              | Bobot |
| ------------------------------------- | ----: |
| Jalan Berlubang / Tiang Listrik Roboh |     5 |
| Lampu Penerangan Mati                 |     4 |
| Drainase Tersumbat                    |     3 |
| Trotoar Rusak                         |     2 |
| Fasilitas Publik Rusak                |     1 |

Bobot kategori memberikan pengaruh yang lebih besar terhadap laporan yang secara karakteristik dianggap lebih mendesak.

#### Memiliki Koordinat

```text
Jika laporan memiliki koordinat → +2
Jika tidak memiliki koordinat → +0
```

Bonus ini memberikan insentif terhadap laporan dengan lokasi geografis yang lebih presisi.

#### Usia Laporan

Usia laporan mengurangi skor secara bertahap:

```text
Report Age × 0.5
```

Semakin lama sebuah laporan berada dalam sistem, semakin besar pengurangan skor berdasarkan usia laporan.

### 9.3 Minimum Score

Skor prioritas memiliki batas minimum **0**.

### 9.4 Tujuan Algoritma

Algoritma ini digunakan sebagai **decision-support mechanism**, bukan sebagai pengganti keputusan administrator.

Skor membantu administrator melihat laporan berdasarkan kombinasi:

- Dukungan komunitas.
- Tingkat urgensi kategori.
- Kelengkapan informasi lokasi.
- Usia laporan.

---

## 10. Non-Functional Requirements

### 10.1 Performance

- Antarmuka harus tetap responsif pada perangkat mobile dan desktop.
- Peta menggunakan marker clustering untuk mengurangi beban visual ketika terdapat banyak laporan.
- Data server-side menggunakan mekanisme caching dan fetching yang sesuai kebutuhan aplikasi.
- Operasi real-time digunakan untuk perubahan yang membutuhkan pembaruan cepat.

### 10.2 Security

Sistem harus:

- Menggunakan autentikasi untuk fungsi yang membutuhkan akun.
- Menerapkan Role-Based Access Control.
- Memvalidasi input dari client.
- Menggunakan password hashing.
- Menggunakan token-based authentication.
- Membatasi akses administrator berdasarkan role dan wilayah.
- Memvalidasi file upload berdasarkan tipe dan ukuran.
- Tidak mengekspos credential server-side kepada client.
- Menggunakan parameterized query untuk mencegah SQL injection.
- Mencatat aktivitas administratif melalui audit trail.

### 10.3 Availability

Sistem dirancang sebagai aplikasi web yang dapat diakses melalui browser.

Komponen utama aplikasi dipisahkan menjadi:

- Frontend.
- Backend API.
- Database.
- File storage.
- Real-time communication.

Ketersediaan masing-masing komponen bergantung pada infrastructure deployment yang digunakan.

### 10.4 Scalability

Arsitektur aplikasi memisahkan frontend dan backend sehingga keduanya dapat dikembangkan dan di-deploy secara independen.

Sistem juga menggunakan pembagian kewenangan berbasis wilayah sehingga dapat dikembangkan untuk menangani lebih banyak wilayah administratif.

Potensi pengembangan skalabilitas meliputi:

- Horizontal scaling backend.
- Database indexing dan query optimization.
- Caching.
- Object storage untuk file.
- Queue/background processing.
- Dedicated real-time infrastructure.

### 10.5 Responsiveness

UI harus dapat digunakan pada:

- Smartphone.
- Tablet.
- Desktop.

Fitur utama masyarakat diprioritaskan menggunakan pendekatan **mobile-first**.

---

## 11. Future Development

Pengembangan berikutnya difokuskan pada peningkatan kualitas data, engagement pengguna, privasi, dan aksesibilitas platform.

### 11.1 Deteksi Laporan Duplikat

Sistem dapat mendeteksi laporan yang memiliki kemungkinan merupakan permasalahan yang sama berdasarkan:

- Jarak lokasi.
- Kategori.
- Waktu laporan.

Pengguna kemudian dapat diarahkan untuk memberikan upvote pada laporan yang sudah tersedia daripada membuat laporan baru.

### 11.2 Pembukaan Ulang / Dispute

Masyarakat dapat mengajukan dispute apabila laporan yang telah berstatus `Resolved` dianggap belum benar-benar terselesaikan.

Dispute kemudian dapat ditinjau oleh administrator.

### 11.3 Kompresi Gambar Client-Side

Gambar dapat dikompresi pada sisi client sebelum dikirim ke server untuk:

- Mengurangi ukuran upload.
- Menghemat bandwidth.
- Mempercepat proses upload.
- Mengurangi penggunaan storage.

### 11.4 Gamifikasi & Lencana

Sistem dapat memberikan badge berdasarkan kontribusi pengguna, misalnya:

- Pelapor Pertama.
- Warga Aktif.
- Kontributor Komunitas.

### 11.5 Papan Peringkat

Leaderboard dapat digunakan untuk menampilkan pengguna dengan kontribusi komunitas tertinggi dalam periode tertentu.

### 11.6 PWA / Offline Support

LaporRuta dapat dikembangkan menjadi Progressive Web App dengan kemampuan:

- Offline access.
- Offline report creation.
- Queue laporan.
- Automatic synchronization ketika koneksi kembali.

### 11.7 Blur Wajah Otomatis

Sistem dapat menggunakan computer vision untuk mendeteksi dan mengaburkan wajah atau informasi sensitif pada gambar sebelum gambar dipublikasikan.

### 11.8 Multi-Language

Antarmuka dapat dikembangkan untuk mendukung beberapa bahasa, dengan Bahasa Indonesia sebagai bahasa utama dan Bahasa Inggris sebagai opsi tambahan.

### 11.9 Public Statistics

Dashboard statistik publik dapat dikembangkan untuk menampilkan informasi agregat seperti:

- Jumlah laporan.
- Tingkat penyelesaian.
- Kategori laporan terbanyak.
- Rata-rata waktu penyelesaian.
- Distribusi laporan berdasarkan wilayah.

---

## Appendix A — Feature Scope Summary

### Current Implementation

Fitur utama yang tersedia pada iterasi saat ini meliputi:

- Autentikasi User.
- RBAC / Protected Route.
- Peta interaktif.
- Marker clustering.
- Pemilihan lokasi bertingkat.
- Mini map pin.
- Geo-tag reporting.
- Image upload.
- Moderation queue.
- Upvote.
- Comment.
- Report status lifecycle.
- Admin Wilayah dashboard.
- Admin Pusat dashboard.
- Activity log.
- Unread indicator.
- Priority algorithm.
- Responsive design.
- Internal admin notes.
- Search & filter.
- CSV export.
- Automatic assignment & fallback.
- Real-time public map.
- Real-time admin dashboard.
- My Reports.
- My Report Detail.
- Public Report Detail.
- After images.
- Status override.
- Zone reassignment.
- Report metadata editing.
- Statistics.
- Admin status management.
- Admin invitation.
- Invitation acceptance.

### Future Development

Fitur yang direncanakan untuk pengembangan berikutnya:

- Duplicate report detection.
- Client-side image compression.
- Report reopening / dispute.
- Gamification.
- Leaderboard.
- PWA / Service Worker.
- Automatic face blurring.
- Multi-language support.
- Public statistics enhancement.

---

## Appendix B — Product Principles

Pengembangan LaporRuta berpedoman pada beberapa prinsip:

1. **Location First**
   Informasi lokasi menjadi bagian penting dari pelaporan permasalahan publik.

2. **Transparency**
   Masyarakat dapat melihat perkembangan laporan yang tersedia secara publik.

3. **Community Participation**
   Upvote dan komentar memungkinkan masyarakat berpartisipasi dalam ekosistem pelaporan.

4. **Administrative Accountability**
   Aktivitas administrator dicatat melalui activity log.

5. **Role-Based Responsibility**
   Administrator memiliki kewenangan sesuai role dan wilayah yang ditugaskan.

6. **Data-Driven Prioritization**
   Priority score membantu administrator menentukan laporan yang perlu mendapat perhatian lebih.

7. **Scalable Administration**
   Sistem administrasi dirancang untuk mendukung pengelolaan beberapa wilayah.

---

_End of Document_
