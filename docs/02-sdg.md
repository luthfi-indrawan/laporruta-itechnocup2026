# Sustainable Development Goals (SDG) Alignment

## 1. Overview

**LaporRuta** merupakan platform pelaporan permasalahan fasilitas dan infrastruktur publik berbasis lokasi yang memungkinkan masyarakat melaporkan kondisi di lingkungan sekitar, memberikan dukungan terhadap laporan melalui upvote, serta memantau perkembangan penyelesaian laporan.

Platform ini dirancang untuk membantu membangun proses pelaporan yang lebih **terstruktur, transparan, berbasis lokasi, dan dapat dipantau** oleh masyarakat maupun pihak administrator.

Dalam konteks Sustainable Development Goals (SDGs), LaporRuta memiliki keterkaitan utama dengan:

1. **SDG 11 — Sustainable Cities and Communities**
2. **SDG 9 — Industry, Innovation and Infrastructure**
3. **SDG 16 — Peace, Justice and Strong Institutions** sebagai alignment pendukung.

---

# 2. SDG 11 — Sustainable Cities and Communities

> **Make cities and human settlements inclusive, safe, resilient and sustainable.**

SDG 11 berfokus pada pembangunan kota dan permukiman yang inklusif, aman, tangguh, dan berkelanjutan.

LaporRuta mendukung tujuan tersebut dengan menyediakan sarana digital bagi masyarakat untuk melaporkan permasalahan yang terjadi pada lingkungan dan fasilitas publik secara lebih terstruktur.

### Kontribusi LaporRuta

#### 2.1 Partisipasi Masyarakat

LaporRuta memberikan ruang bagi masyarakat untuk berpartisipasi secara langsung dalam menyampaikan permasalahan yang ditemukan di lingkungan mereka.

Masyarakat dapat:

- Membuat laporan permasalahan publik.
- Menentukan lokasi permasalahan melalui data wilayah dan koordinat.
- Mengunggah gambar sebagai bukti kondisi.
- Memberikan upvote terhadap laporan yang dianggap penting.
- Memberikan komentar pada laporan.
- Memantau perkembangan laporan yang telah dibuat.

Dengan demikian, masyarakat tidak hanya menjadi pengguna layanan, tetapi juga menjadi sumber informasi mengenai kondisi lingkungan secara langsung.

#### 2.2 Pelaporan Berbasis Lokasi

Permasalahan publik memiliki keterkaitan yang kuat dengan lokasi.

LaporRuta menggunakan informasi wilayah dan koordinat untuk membantu mengidentifikasi lokasi permasalahan. Data tersebut kemudian dapat digunakan untuk:

- Menampilkan laporan pada peta interaktif.
- Mengelompokkan laporan berdasarkan wilayah.
- Mengarahkan laporan kepada administrator wilayah yang sesuai.
- Membantu administrator memahami persebaran permasalahan.

Pendekatan berbasis lokasi membuat informasi permasalahan publik menjadi lebih kontekstual dan mudah dipahami.

#### 2.3 Transparansi Status Permasalahan

LaporRuta menyediakan siklus status laporan sehingga masyarakat dapat mengetahui perkembangan penanganan laporan.

Siklus utama laporan adalah:

```text
Pending Verification
        │
        ├──────────> Rejected
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

Status tersebut membantu mengurangi ketidakjelasan mengenai apakah suatu laporan telah diterima, diverifikasi, sedang ditangani, atau telah diselesaikan.

#### 2.4 Prioritas Permasalahan

Tidak semua permasalahan memiliki tingkat urgensi yang sama.

LaporRuta menggunakan **Priority Score** untuk membantu administrator menentukan laporan yang perlu mendapatkan perhatian lebih besar berdasarkan beberapa faktor, seperti:

- Jumlah dukungan masyarakat melalui upvote.
- Tingkat urgensi kategori.
- Ketersediaan koordinat lokasi.
- Usia laporan.

Dengan pendekatan tersebut, proses penanganan dapat didukung oleh data dan bukan hanya berdasarkan urutan laporan masuk.

### Dampak yang Diharapkan

Melalui fitur-fitur tersebut, LaporRuta diharapkan dapat:

- Meningkatkan partisipasi masyarakat dalam pelaporan permasalahan publik.
- Meningkatkan visibilitas kondisi fasilitas dan infrastruktur publik.
- Membantu administrator memahami permasalahan berdasarkan wilayah.
- Mendorong proses penanganan yang lebih terstruktur.
- Meningkatkan transparansi antara masyarakat dan pihak yang menangani laporan.

---

# 3. SDG 9 — Industry, Innovation and Infrastructure

> **Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation.**

SDG 9 memiliki keterkaitan dengan LaporRuta terutama melalui pemanfaatan teknologi digital untuk mendukung pengelolaan informasi mengenai infrastruktur dan fasilitas publik.

### Kontribusi LaporRuta

#### 3.1 Digitalisasi Proses Pelaporan

LaporRuta mengubah proses pelaporan permasalahan publik menjadi proses digital yang terstruktur.

Informasi laporan dapat mencakup:

- Judul permasalahan.
- Deskripsi.
- Kategori.
- Wilayah.
- Koordinat lokasi.
- Gambar pendukung.
- Status penanganan.
- Aktivitas dan riwayat perubahan.

Data tersebut memungkinkan informasi permasalahan tersimpan secara terstruktur dan dapat dikelola oleh administrator.

#### 3.2 Pemanfaatan Teknologi Geospasial

LaporRuta menggunakan peta interaktif sebagai salah satu komponen utama aplikasi.

Teknologi berbasis lokasi digunakan untuk:

- Menampilkan persebaran laporan.
- Menentukan lokasi permasalahan.
- Mengelompokkan marker.
- Memudahkan eksplorasi laporan berdasarkan wilayah.
- Mendukung proses penugasan laporan kepada administrator wilayah.

Pemanfaatan data lokasi membantu menghubungkan informasi digital dengan kondisi fisik di lapangan.

#### 3.3 Sistem Administrasi Berbasis Data

Administrator memiliki dashboard yang digunakan untuk mengelola laporan berdasarkan wilayah dan kebutuhan operasional.

Sistem menyediakan fitur seperti:

- Dashboard Admin Wilayah.
- Dashboard Admin Pusat.
- Pencarian dan filter.
- Statistik.
- Activity log.
- Ekspor data CSV.
- Penugasan otomatis dan fallback.
- Reassign wilayah.
- Algoritma prioritas.

Fitur tersebut mendukung pengambilan keputusan berdasarkan data yang tersedia dalam sistem.

#### 3.4 Real-Time Information

LaporRuta memanfaatkan pembaruan data secara real-time untuk beberapa bagian sistem.

Pembaruan tersebut digunakan pada:

- Peta publik.
- Dashboard administrator.

Dengan adanya pembaruan real-time, perubahan informasi dapat ditampilkan kepada pengguna tanpa harus selalu melakukan pemuatan ulang secara manual.

### Dampak yang Diharapkan

Kontribusi LaporRuta terhadap SDG 9 diharapkan dapat:

- Mendorong digitalisasi proses pelaporan infrastruktur publik.
- Memanfaatkan teknologi geospasial dalam pengelolaan laporan.
- Meningkatkan efisiensi pengelolaan informasi.
- Mendukung pengambilan keputusan berbasis data.
- Menjadi fondasi untuk pengembangan sistem pengelolaan infrastruktur publik yang lebih terintegrasi.

---

# 4. SDG 16 — Peace, Justice and Strong Institutions

> **Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels.**

SDG 16 merupakan alignment pendukung LaporRuta, khususnya pada aspek **transparansi, akuntabilitas, dan pengelolaan administrasi**.

### Kontribusi LaporRuta

#### 4.1 Transparansi Proses

Masyarakat dapat melihat status laporan dan perkembangan penanganannya.

Hal ini memberikan informasi yang lebih jelas mengenai posisi suatu laporan dalam proses administrasi.

#### 4.2 Akuntabilitas Administratif

LaporRuta memiliki **Activity Log** untuk mencatat berbagai aktivitas penting yang terjadi dalam sistem, seperti:

- Pembuatan laporan.
- Perubahan status.
- Verifikasi atau penolakan laporan.
- Perubahan penugasan.
- Aktivitas administratif lainnya.

Riwayat aktivitas membantu menyediakan jejak perubahan yang dapat digunakan untuk kebutuhan monitoring dan audit internal.

#### 4.3 Role-Based Access Control

Sistem menerapkan pembagian hak akses berdasarkan peran:

```text
User
  │
  └── Membuat dan memantau laporan

Admin Wilayah
  │
  └── Mengelola laporan pada wilayah yang ditugaskan

Admin Pusat
  │
  └── Monitoring dan administrasi tingkat pusat
```

Pembagian tersebut membatasi akses administratif berdasarkan tanggung jawab pengguna.

#### 4.4 Pengelolaan Wilayah

Sistem penugasan berbasis wilayah membantu memastikan laporan dapat diarahkan kepada administrator yang memiliki tanggung jawab terhadap wilayah tersebut.

Jika administrator wilayah yang sesuai tidak tersedia, sistem menyediakan mekanisme **fallback** sehingga laporan tetap dapat ditangani pada tingkat pusat.

### Dampak yang Diharapkan

Alignment dengan SDG 16 diharapkan dapat:

- Meningkatkan transparansi proses pelaporan.
- Mendukung akuntabilitas administrator.
- Menyediakan riwayat aktivitas yang dapat ditelusuri.
- Mendorong pengelolaan laporan berdasarkan pembagian tanggung jawab yang jelas.

---

# 5. SDG Impact Mapping

| SDG        | Fokus                            | Implementasi pada LaporRuta                                                  | Dampak yang Diharapkan                                                       |
| ---------- | -------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **SDG 11** | Kota dan komunitas berkelanjutan | Pelaporan masalah publik, peta interaktif, upvote, komentar, status tracking | Meningkatkan partisipasi masyarakat dan visibilitas permasalahan lingkungan  |
| **SDG 9**  | Infrastruktur dan inovasi        | Geotag, peta, dashboard, priority algorithm, real-time update                | Mendukung digitalisasi dan pengelolaan informasi infrastruktur berbasis data |
| **SDG 16** | Institusi efektif dan akuntabel  | RBAC, activity log, status tracking, penugasan wilayah                       | Meningkatkan transparansi dan akuntabilitas proses administrasi              |

---

# 6. Overall Impact

Secara keseluruhan, LaporRuta menempatkan **SDG 11 sebagai fokus utama**, dengan dukungan dari SDG 9 dan SDG 16.

Hubungan tersebut dapat digambarkan sebagai berikut:

```text
                    LAPORRUTA
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       SDG 11        SDG 9        SDG 16
          │            │            │
          ▼            ▼            ▼
    Community       Digital       Transparent
    Participation   Innovation    Administration
          │            │            │
          └────────────┼────────────┘
                       ▼
             Better Public Issue
                 Management
                       │
                       ▼
          More Sustainable Communities
```

LaporRuta tidak secara langsung menyelesaikan seluruh permasalahan infrastruktur publik, tetapi berperan sebagai **lapisan digital untuk menghubungkan masyarakat, informasi lokasi, dan proses administrasi**.

Dengan menggabungkan pelaporan berbasis lokasi, partisipasi masyarakat, prioritas berbasis data, serta transparansi status dan aktivitas, LaporRuta diharapkan dapat menjadi fondasi untuk proses pengelolaan permasalahan publik yang lebih terstruktur, responsif, dan akuntabel.

---

# 7. Future SDG Impact

Pengembangan fitur di masa depan dapat memperluas dampak LaporRuta, antara lain:

- **Deteksi laporan duplikat** untuk mengurangi redundansi laporan.
- **Pembukaan ulang/dispute** untuk memberikan mekanisme ketika permasalahan dianggap belum terselesaikan.
- **Kompresi gambar client-side** untuk mengurangi penggunaan bandwidth dan storage.
- **PWA dan offline support** untuk meningkatkan aksesibilitas pada kondisi koneksi internet terbatas.
- **Dukungan multi-bahasa** untuk meningkatkan inklusivitas.
- **Automatic face blurring** untuk meningkatkan perlindungan privasi pada gambar laporan.
- **Gamifikasi dan badge** untuk meningkatkan partisipasi masyarakat.

Pengembangan tersebut dapat memperkuat aspek inklusivitas, efisiensi, aksesibilitas, privasi, dan partisipasi masyarakat dalam ekosistem LaporRuta.

---

_End of Document_
