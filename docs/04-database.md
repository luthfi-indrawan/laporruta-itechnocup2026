# Database Design

## 1. Overview

LaporRuta menggunakan **PostgreSQL** sebagai relational database.

Database menyimpan data utama aplikasi yang meliputi:

- User dan role.
- Refresh token.
- Struktur wilayah.
- Kategori laporan.
- Laporan.
- Gambar laporan.
- Upvote.
- Komentar.
- Catatan internal administrator.
- Activity log.
- Invitation administrator.
- Dispute.

Supabase digunakan sebagai provider PostgreSQL dan object storage.

---

# 2. Entity Relationship Diagram

Relasi logical antar entity utama LaporRuta:

```mermaid
erDiagram

    WILAYAH {
        uuid id PK
        uuid parent_id FK
        varchar name
        varchar type
        varchar code
        numeric latitude
        numeric longitude
        timestamptz created_at
    }

    CATEGORIES {
        uuid id PK
        varchar name
        varchar color
        int4 urgency_weight
        varchar icon
        text description
        timestamptz created_at
    }

    USERS {
        uuid id PK
        varchar email
        varchar password_hash
        varchar full_name
        varchar role
        uuid assigned_wilayah_id FK
        bool is_active
        timestamptz last_seen_at
        timestamptz created_at
        timestamptz updated_at
    }

    REFRESH_TOKENS {
        uuid id PK
        uuid user_id FK
        varchar token_hash
        timestamptz expires_at
        timestamptz created_at
    }

    REPORTS {
        uuid id PK
        uuid user_id FK
        varchar title
        text description
        uuid category_id FK
        uuid wilayah_id FK
        varchar address_text
        numeric lat
        numeric lng
        varchar status
        text rejection_reason
        timestamptz created_at
        timestamptz updated_at
    }

    REPORT_IMAGES {
        uuid id PK
        uuid report_id FK
        text image_url
        text file_path
        bool is_after
        timestamptz created_at
    }

    UPVOTES {
        uuid id PK
        uuid report_id FK
        uuid user_id FK
        timestamptz created_at
    }

    REPORT_ADMIN_NOTES {
        uuid id PK
        uuid report_id FK
        uuid admin_id FK
        text note
        timestamptz created_at
        timestamptz updated_at
    }

    ACTIVITY_LOGS {
        uuid id PK
        uuid report_id FK
        uuid actor_id FK
        varchar action_type
        text old_value
        text new_value
        jsonb metadata
        bool is_override
        timestamptz created_at
    }

    INVITATIONS {
        uuid id PK
        varchar email
        varchar role
        uuid assigned_wilayah_id FK
        varchar token
        timestamptz expires_at
        bool is_used
        uuid created_by FK
        timestamptz created_at
    }

    COMMENTS {
        uuid id PK
        uuid report_id FK
        uuid user_id FK
        text text
        timestamptz created_at
    }

    DISPUTES {
        uuid id PK
        uuid report_id FK
        uuid user_id FK
        varchar reason
        varchar status
        timestamptz created_at
    }

    WILAYAH ||--o{ WILAYAH : parent
    WILAYAH ||--o{ USERS : assigned_to
    WILAYAH ||--o{ REPORTS : contains

    CATEGORIES ||--o{ REPORTS : categorizes

    USERS ||--o{ REFRESH_TOKENS : owns
    USERS ||--o{ REPORTS : creates
    USERS ||--o{ UPVOTES : gives
    USERS ||--o{ COMMENTS : writes
    USERS ||--o{ REPORT_ADMIN_NOTES : creates
    USERS ||--o{ ACTIVITY_LOGS : performs
    USERS ||--o{ INVITATIONS : creates
    USERS ||--o{ DISPUTES : submits

    REPORTS ||--o{ REPORT_IMAGES : has
    REPORTS ||--o{ UPVOTES : receives
    REPORTS ||--o{ REPORT_ADMIN_NOTES : contains
    REPORTS ||--o{ ACTIVITY_LOGS : tracks
    REPORTS ||--o{ COMMENTS : contains
    REPORTS ||--o{ DISPUTES : has
```

> ERD di atas menggambarkan hubungan logical berdasarkan penggunaan foreign-key identifiers pada schema. Detail constraint foreign key fisik mengikuti implementasi database aktual.

---

# 3. Table `wilayah`

Tabel `wilayah` menyimpan struktur wilayah administratif.

### Columns

| Name         | Type          | Constraints      |
| ------------ | ------------- | ---------------- |
| `id`         | `uuid`        | Primary          |
| `parent_id`  | `uuid`        | Nullable         |
| `name`       | `varchar`     |                  |
| `type`       | `varchar`     |                  |
| `code`       | `varchar`     | Nullable, Unique |
| `latitude`   | `numeric`     | Nullable         |
| `longitude`  | `numeric`     | Nullable         |
| `created_at` | `timestamptz` |                  |

### Fungsi

Digunakan untuk:

- Hierarki wilayah.
- Menentukan lokasi administratif laporan.
- Menentukan wilayah tugas Admin Wilayah.
- Automatic assignment.
- Reassignment laporan.

### Hierarki

```mermaid
flowchart TB
    PROV["Provinsi"]
    KOTA["Kota / Kabupaten"]
    KEC["Kecamatan"]
    KEL["Kelurahan"]

    PROV --> KOTA
    KOTA --> KEC
    KEC --> KEL
```

`parent_id` digunakan untuk menghubungkan sebuah wilayah dengan parent wilayahnya.

---

# 4. Table `categories`

Tabel `categories` menyimpan master kategori laporan.

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `name`           | `varchar`     | Unique      |
| `color`          | `varchar`     |             |
| `urgency_weight` | `int4`        |             |
| `icon`           | `varchar`     | Nullable    |
| `description`    | `text`        | Nullable    |
| `created_at`     | `timestamptz` |             |

### Fungsi

Kategori digunakan untuk:

- Klasifikasi laporan.
- Warna marker.
- Icon laporan.
- Deskripsi kategori.
- Menentukan urgency weight.

`urgency_weight` menjadi salah satu input Priority Score.

---

# 5. Table `users`

Tabel `users` menyimpan akun masyarakat dan administrator.

### Columns

| Name                  | Type          | Constraints |
| --------------------- | ------------- | ----------- |
| `id`                  | `uuid`        | Primary     |
| `email`               | `varchar`     | Unique      |
| `password_hash`       | `varchar`     |             |
| `full_name`           | `varchar`     |             |
| `role`                | `varchar`     |             |
| `assigned_wilayah_id` | `uuid`        | Nullable    |
| `is_active`           | `bool`        |             |
| `last_seen_at`        | `timestamptz` | Nullable    |
| `created_at`          | `timestamptz` |             |
| `updated_at`          | `timestamptz` |             |

### Role

Role utama:

```text
user
admin_wilayah
admin_pusat
```

### `assigned_wilayah_id`

Digunakan untuk menentukan wilayah tugas Admin Wilayah.

Untuk Admin Pusat, nilai ini dapat bernilai `NULL`.

### `is_active`

Menentukan apakah akun administrator aktif.

---

# 6. Table `refresh_tokens`

Tabel `refresh_tokens` menyimpan session refresh token.

### Columns

| Name         | Type          | Constraints |
| ------------ | ------------- | ----------- |
| `id`         | `uuid`        | Primary     |
| `user_id`    | `uuid`        |             |
| `token_hash` | `varchar`     | Unique      |
| `expires_at` | `timestamptz` |             |
| `created_at` | `timestamptz` |             |

### Authentication Flow

```mermaid
flowchart LR
    TOKEN["Refresh Token"]
    HASH["Hash"]
    DB["token_hash"]

    TOKEN --> HASH
    HASH --> DB
```

Database menyimpan `token_hash`, bukan nilai token yang digunakan oleh client.

---

# 7. Table `reports`

`reports` merupakan entity utama aplikasi.

### Columns

| Name               | Type          | Constraints |
| ------------------ | ------------- | ----------- |
| `id`               | `uuid`        | Primary     |
| `user_id`          | `uuid`        |             |
| `title`            | `varchar`     |             |
| `description`      | `text`        |             |
| `category_id`      | `uuid`        |             |
| `wilayah_id`       | `uuid`        |             |
| `address_text`     | `varchar`     |             |
| `lat`              | `numeric`     | Nullable    |
| `lng`              | `numeric`     | Nullable    |
| `status`           | `varchar`     |             |
| `rejection_reason` | `text`        | Nullable    |
| `created_at`       | `timestamptz` |             |
| `updated_at`       | `timestamptz` |             |

### Relationship

```mermaid
flowchart LR
    USER["users"]
    CATEGORY["categories"]
    REGION["wilayah"]
    REPORT["reports"]

    USER --> REPORT
    CATEGORY --> REPORT
    REGION --> REPORT
```

### Status

Status laporan:

```text
pending_verification
verified
in_progress
resolved
rejected
```

### Location

`lat` dan `lng` dapat bernilai `NULL`.

Jika tersedia, koordinat digunakan untuk:

- Menampilkan lokasi pada map.
- Menentukan posisi marker.
- Mendukung location-based processing.
- Memberikan bonus koordinat pada Priority Score.

---

# 8. Table `report_images`

Tabel `report_images` menyimpan metadata gambar laporan.

### Columns

| Name         | Type          | Constraints |
| ------------ | ------------- | ----------- |
| `id`         | `uuid`        | Primary     |
| `report_id`  | `uuid`        |             |
| `image_url`  | `text`        |             |
| `file_path`  | `text`        |             |
| `is_after`   | `bool`        |             |
| `created_at` | `timestamptz` |             |

### Storage Architecture

```mermaid
flowchart TB
    REPORT["reports"]
    IMAGE_META["report_images"]
    STORAGE["Supabase Storage"]

    REPORT --> IMAGE_META
    IMAGE_META -->|"image_url / file_path"| STORAGE
```

Database menyimpan metadata, sedangkan file aktual berada pada Supabase Storage.

### `is_after`

```text
false
→ foto kondisi awal

true
→ foto setelah perbaikan
```

---

# 9. Table `upvotes`

Tabel `upvotes` menyimpan dukungan user terhadap laporan.

### Columns

| Name         | Type          | Constraints |
| ------------ | ------------- | ----------- |
| `id`         | `uuid`        | Primary     |
| `report_id`  | `uuid`        |             |
| `user_id`    | `uuid`        |             |
| `created_at` | `timestamptz` |             |

### Relationship

```mermaid
flowchart LR
    USER["User"]
    UPVOTE["Upvote"]
    REPORT["Report"]

    USER --> UPVOTE
    REPORT --> UPVOTE
```

Jumlah upvote digunakan sebagai salah satu faktor Priority Score.

---

# 10. Table `report_admin_notes`

Tabel `report_admin_notes` menyimpan catatan internal administrator.

### Columns

| Name         | Type          | Constraints |
| ------------ | ------------- | ----------- |
| `id`         | `uuid`        | Primary     |
| `report_id`  | `uuid`        |             |
| `admin_id`   | `uuid`        |             |
| `note`       | `text`        |             |
| `created_at` | `timestamptz` |             |
| `updated_at` | `timestamptz` |             |

Catatan ini digunakan untuk kebutuhan internal administrator dan bukan bagian dari informasi publik laporan.

---

# 11. Table `activity_logs`

Tabel `activity_logs` menyediakan audit trail untuk aktivitas laporan.

### Columns

| Name          | Type          | Constraints |
| ------------- | ------------- | ----------- |
| `id`          | `uuid`        | Primary     |
| `report_id`   | `uuid`        |             |
| `actor_id`    | `uuid`        | Nullable    |
| `action_type` | `varchar`     |             |
| `old_value`   | `text`        | Nullable    |
| `new_value`   | `text`        | Nullable    |
| `metadata`    | `jsonb`       | Nullable    |
| `is_override` | `bool`        |             |
| `created_at`  | `timestamptz` |             |

### Audit Flow

```mermaid
flowchart LR
    ACTOR["Actor"]
    ACTION["Report Action"]
    LOG["activity_logs"]
    REPORT["reports"]

    ACTOR --> ACTION
    ACTION --> LOG
    REPORT --> LOG
```

Data yang dapat dicatat meliputi:

- Pembuatan laporan.
- Verifikasi.
- Penolakan.
- Perubahan status.
- Upvote.
- Reassignment.
- Override.
- Aktivitas administratif lainnya.

`old_value` dan `new_value` digunakan untuk merekam perubahan nilai.

`metadata` menyimpan informasi tambahan dalam format JSON.

`is_override` menandai tindakan override.

---

# 12. Table `invitations`

Tabel `invitations` menyimpan invitation untuk administrator baru.

### Columns

| Name                  | Type          | Constraints |
| --------------------- | ------------- | ----------- |
| `id`                  | `uuid`        | Primary     |
| `email`               | `varchar`     |             |
| `role`                | `varchar`     |             |
| `assigned_wilayah_id` | `uuid`        | Nullable    |
| `token`               | `varchar`     | Unique      |
| `expires_at`          | `timestamptz` |             |
| `is_used`             | `bool`        |             |
| `created_by`          | `uuid`        |             |
| `created_at`          | `timestamptz` |             |

### Invitation Flow

```mermaid
flowchart LR
    ADMIN["Admin Pusat"]
    INV["Invitation"]
    TOKEN["Unique Token"]
    ACCEPT["Accept Invitation"]
    USER["User Account"]

    ADMIN --> INV
    INV --> TOKEN
    TOKEN --> ACCEPT
    ACCEPT --> USER
```

Untuk Admin Wilayah, invitation dapat menyertakan `assigned_wilayah_id`.

---

# 13. Table `comments`

Tabel `comments` menyimpan komentar pada laporan.

### Columns

| Name         | Type          | Constraints |
| ------------ | ------------- | ----------- |
| `id`         | `uuid`        | Primary     |
| `report_id`  | `uuid`        |             |
| `user_id`    | `uuid`        |             |
| `text`       | `text`        |             |
| `created_at` | `timestamptz` |             |

### Relationship

```mermaid
flowchart LR
    USER["User"]
    COMMENT["Comment"]
    REPORT["Report"]

    USER --> COMMENT
    COMMENT --> REPORT
```

Komentar digunakan sebagai mekanisme interaksi masyarakat terhadap laporan.

---

# 14. Table `disputes`

Tabel `disputes` menyimpan data dispute terhadap laporan.

### Columns

| Name         | Type          | Constraints |
| ------------ | ------------- | ----------- |
| `id`         | `uuid`        | Primary     |
| `report_id`  | `uuid`        |             |
| `user_id`    | `uuid`        |             |
| `reason`     | `varchar`     |             |
| `status`     | `varchar`     |             |
| `created_at` | `timestamptz` |             |

### Relationship

```mermaid
flowchart LR
    USER["User"]
    DISPUTE["Dispute"]
    REPORT["Report"]

    USER --> DISPUTE
    DISPUTE --> REPORT
```

Entity `disputes` disiapkan untuk kebutuhan mekanisme dispute atau tinjauan ulang laporan.

---

# 15. Core Relationship Map

Entity yang paling penting dalam sistem berpusat pada `reports`.

```mermaid
flowchart TB
    USER["users"]
    REGION["wilayah"]
    CATEGORY["categories"]

    REPORT["reports"]

    IMAGES["report_images"]
    UPVOTES["upvotes"]
    COMMENTS["comments"]
    NOTES["report_admin_notes"]
    LOGS["activity_logs"]
    DISPUTES["disputes"]

    USER --> REPORT
    REGION --> REPORT
    CATEGORY --> REPORT

    REPORT --> IMAGES
    REPORT --> UPVOTES
    REPORT --> COMMENTS
    REPORT --> NOTES
    REPORT --> LOGS
    REPORT --> DISPUTES
```

Dengan demikian:

```text
users
   │
   └──────────────┐
                  ▼
categories ───► reports ◄─── wilayah
                  │
       ┌──────────┼──────────┬──────────┬──────────┐
       ▼          ▼          ▼          ▼          ▼
 report_images  upvotes   comments   admin_notes  activity_logs

                  │
                  ▼
               disputes
```

---

# 16. Authentication Data Relationship

```mermaid
flowchart LR
    USER["users"]
    TOKEN["refresh_tokens"]

    USER --> TOKEN
```

Satu user dapat memiliki refresh token yang digunakan untuk mempertahankan authenticated session.

---

# 17. Administration Data Relationship

```mermaid
flowchart TB
    ADMIN["users<br/>Admin"]
    REGION["wilayah"]

    REPORT["reports"]
    NOTES["report_admin_notes"]
    LOGS["activity_logs"]
    INV["invitations"]

    REGION --> ADMIN
    ADMIN --> REPORT
    ADMIN --> NOTES
    ADMIN --> LOGS
    ADMIN --> INV
```

`assigned_wilayah_id` pada user menghubungkan Admin Wilayah dengan zona tugasnya.

---

# 18. Report Data Lifecycle

Data laporan berkembang melalui beberapa entity:

```mermaid
flowchart LR
    CREATE["Create Report"]
    REPORT["reports"]
    IMAGE["report_images"]
    LOG["activity_logs"]
    ADMIN["Administration"]
    STATUS["Status Changes"]
    AFTER["After Images"]

    CREATE --> REPORT
    CREATE --> IMAGE
    CREATE --> LOG

    REPORT --> ADMIN
    ADMIN --> STATUS
    STATUS --> LOG
    STATUS --> AFTER
    AFTER --> IMAGE
```

---

# 19. Priority Score Data Sources

Priority Score menggunakan data dari `reports`, `categories`, dan `upvotes`.

```mermaid
flowchart TB
    REPORT["reports"]
    CATEGORY["categories"]
    UPVOTES["upvotes"]

    REPORT --> AGE["Report Age"]
    REPORT --> COORD["Has Coordinate"]
    CATEGORY --> URGENCY["Urgency Weight"]
    UPVOTES --> COUNT["Upvote Count"]

    AGE --> SCORE["Priority Score"]
    COORD --> SCORE
    URGENCY --> SCORE
    COUNT --> SCORE
```

Formula:

```text
Priority Score =
    (Jumlah Upvote × 3)
  + (Bobot Urgensi Kategori × 5)
  + (Memiliki Koordinat ? 2 : 0)
  − (Usia Laporan dalam Hari × 0.5)
```

Implementasi SQL menghitung score secara on-the-fly menggunakan jumlah upvote, `categories.urgency_weight`, keberadaan koordinat, dan usia laporan. Score memiliki floor `0`.

---

# 20. Data Integrity

Constraint utama yang didefinisikan pada schema meliputi:

### Primary Key

Setiap tabel menggunakan UUID sebagai primary key.

### Unique

Field yang memiliki unique constraint:

```text
users.email
categories.name
wilayah.code
refresh_tokens.token_hash
invitations.token
```

### Nullable

Field nullable digunakan untuk data yang memang tidak selalu tersedia, seperti:

```text
wilayah.parent_id
wilayah.code
wilayah.latitude
wilayah.longitude

users.assigned_wilayah_id
users.last_seen_at

reports.lat
reports.lng
reports.rejection_reason

activity_logs.actor_id
activity_logs.old_value
activity_logs.new_value
activity_logs.metadata

invitations.assigned_wilayah_id
```

---

# 21. Database vs Object Storage

PostgreSQL dan Supabase Storage memiliki tanggung jawab berbeda.

```mermaid
flowchart TB
    APP["LaporRuta Backend"]

    DB[("PostgreSQL")]
    STORAGE[("Supabase Storage")]

    APP --> DB
    APP --> STORAGE

    DB --> DATA["Structured / Relational Data"]
    STORAGE --> FILES["Image Files"]
```

### PostgreSQL

Menyimpan:

- User.
- Reports.
- Categories.
- Wilayah.
- Upvotes.
- Comments.
- Activity logs.
- Admin notes.
- Invitations.
- Refresh tokens.
- Disputes.
- Image metadata.

### Supabase Storage

Menyimpan:

- Gambar laporan.
- Gambar setelah perbaikan.

---

# 22. Database Responsibilities

Database LaporRuta bertanggung jawab terhadap beberapa domain:

| Domain         | Tables                              |
| -------------- | ----------------------------------- |
| Identity       | `users`, `refresh_tokens`           |
| Master Data    | `wilayah`, `categories`             |
| Reporting      | `reports`, `report_images`          |
| Community      | `upvotes`, `comments`               |
| Administration | `report_admin_notes`, `invitations` |
| Audit          | `activity_logs`                     |
| Review         | `disputes`                          |

---

# 23. Summary

Struktur database LaporRuta berpusat pada entity `reports`, yang menghubungkan user, wilayah, kategori, media, interaksi masyarakat, aktivitas administratif, dan dispute.

```mermaid
flowchart TB
    USER["Users"]
    REGION["Wilayah"]
    CATEGORY["Categories"]

    REPORT["Reports"]

    USER --> REPORT
    REGION --> REPORT
    CATEGORY --> REPORT

    REPORT --> IMAGES["Report Images"]
    REPORT --> UPVOTES["Upvotes"]
    REPORT --> COMMENTS["Comments"]
    REPORT --> NOTES["Admin Notes"]
    REPORT --> LOGS["Activity Logs"]
    REPORT --> DISPUTES["Disputes"]

    USER --> TOKENS["Refresh Tokens"]
    USER --> INV["Invitations"]
```

Desain tersebut memungkinkan LaporRuta menyimpan data aplikasi secara terstruktur sekaligus mendukung kebutuhan utama sistem: authentication, location-based reporting, community interaction, regional administration, audit trail, priority scoring, dan media storage.

---

_End of Document_
