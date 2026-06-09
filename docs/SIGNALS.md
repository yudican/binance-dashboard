# Signals — Dokumentasi Lengkap

Modul **Signals** adalah halaman utama (`/`) FUTURESDESK: kumpulan ide trade (sinyal)
Binance USDT-M Futures dengan halaman detail analisis per sinyal, plus endpoint untuk
input/kelola sinyal yang disimpan lokal.

- **Homepage** `/` — daftar sinyal (filter + grid kartu) + ringkasan.
- **Detail** `/signals/[id]` — analisis lengkap satu sinyal.
- **Dashboard** `/dashboard` — dashboard Binance (pindahan dari root).
- **API** `/api/signals` — input/list/hapus sinyal.

---

## Daftar Isi

1. [Arsitektur & File](#arsitektur--file)
2. [Model Data](#model-data)
3. [Storage Lokal](#storage-lokal)
4. [REST API](#rest-api)
5. [Payload Input (POST)](#payload-input-post)
6. [Aturan Bisnis](#aturan-bisnis)
7. [Contoh Penggunaan](#contoh-penggunaan)
8. [UI / Komponen](#ui--komponen)
9. [Roadmap / Catatan](#roadmap--catatan)

---

## Arsitektur & File

```
app/
  page.tsx                     ← homepage signals (server component, baca store)
  signals/[id]/page.tsx        ← halaman detail sinyal (server, force-dynamic)
  dashboard/page.tsx           ← dashboard Binance (dipindah dari root)
  api/
    signals/route.ts           ← endpoint GET / POST / DELETE

components/
  signals/
    SignalsBoard.tsx           ← client: filter tabs + grid kartu
    SignalCard.tsx             ← kartu sinyal (link ke detail)

lib/
  signals.ts                   ← tipe Signal, helper (summarize, riskReward, timeAgo)
  signalStore.ts               ← storage JSON + validasi + upsert/list/delete

/tmp/signals.json              ← penyimpanan lokal (dibuat otomatis saat POST pertama)

docs/
  SIGNALS.md                   ← dokumen ini
```

**Alur data:**

```
POST /api/signals ──► upsertSignal() ──► /tmp/signals.json
                                              │
GET  /api/signals ◄── listSignals() ◄─────────┘ (prune 24 jam, sort terbaru)
                                              │
Homepage / Detail (server) ◄── listSignals() / getSignalById()
```

---

## Model Data

### `Signal` (bentuk yang dipakai UI)

Didefinisikan di `lib/signals.ts`.

| Field         | Tipe                                | Keterangan                                              |
| ------------- | ----------------------------------- | ------------------------------------------------------- |
| `id`          | `string`                            | Dibuat server: `pair-side` (mis. `btcusdt-long`).       |
| `pair`        | `string`                            | Simbol, uppercase (mis. `BTCUSDT`).                     |
| `side`        | `'LONG' \| 'SHORT' \| 'WATCH'`      | Arah posisi. `WATCH` = belum long/short (warna kuning). |
| `status`      | `'active' \| 'pending' \| 'closed'` | Status sinyal.                                          |
| `leverage`    | `number`                            | Leverage (mis. `10`).                                   |
| `confidence`  | `number`                            | Keyakinan model 0–100.                                  |
| `entry`       | `number`                            | Harga entry.                                            |
| `targets`     | `number[]`                          | Daftar target (TP1, TP2, ...).                          |
| `stopLoss`    | `number`                            | Harga stop loss.                                        |
| `createdAgo`  | `string`                            | Label relatif (mis. `2h ago`), dihitung server saat read. |
| `thesis`      | `string`                            | Paragraf alasan trade.                                  |
| `reasons`     | `string[]`                          | Bullet alasan setup trigger.                            |
| `invalidation`| `string`                            | Kondisi yang membatalkan ide.                           |
| `timeframe`   | `string`                            | Timeframe / catatan struktur (mis. `4H · reclaim`).     |

### `StoredSignal` (bentuk di disk)

`Signal` **tanpa** `createdAgo`, **plus**:

| Field        | Tipe     | Keterangan                          |
| ------------ | -------- | ----------------------------------- |
| `createdAt`  | `number` | Epoch ms saat pertama dibuat.       |
| `updatedAt`  | `number` | Epoch ms saat terakhir di-update.   |

`createdAgo` di-derive dari `updatedAt` (fallback `createdAt`) saat serialisasi.

---

## Storage Lokal

- **Lokasi:** `/tmp/signals.json` (dibuat otomatis saat POST pertama).
- **Format:** array `StoredSignal` JSON, indent 2 spasi.
- **Tanpa dependency** — pakai `fs` bawaan Node. Endpoint berjalan di `runtime = 'nodejs'`.
- **Tanpa seed.** Jika file belum ada, store kosong; UI menampilkan empty state sampai ada POST sinyal.

> Catatan: storage berbasis file cocok untuk single-user / self-host (Node runtime).
> Di lingkungan serverless yang ephemeral (mis. Vercel Lambda), file tidak persist —
> ganti ke SQLite/DB bila perlu durabilitas lintas instance.

---

## REST API

Base path: **`/api/signals`** · runtime: Node · `Content-Type: application/json`.

### `GET /api/signals`

List semua sinyal aktif (belum kedaluwarsa), **diurutkan terbaru dulu**.

**Response `200`:**

```json
{
  "signals": [
    { "id": "btcusdt-long", "pair": "BTCUSDT", "side": "LONG", "createdAgo": "just now", "...": "..." }
  ]
}
```

### `POST /api/signals`

**Upsert** satu sinyal. Jika sudah ada sinyal dengan `pair + side` yang sama → **di-replace**.

- **Body:** lihat [Payload Input](#payload-input-post).
- **Response `201`:** `{ "signal": { ...Signal } }`
- **Response `400`:** `{ "error": "<pesan validasi>" }` (body bukan JSON / field wajib hilang / tipe salah)
- **Response `500`:** `{ "error": "<pesan>" }` (gagal tulis file)

### `DELETE /api/signals?id=<id>`

Hapus satu sinyal berdasarkan `id`.

- **Response `200`:** `{ "ok": true }`
- **Response `400`:** `{ "error": "Missing id query param" }`
- **Response `404`:** `{ "error": "Signal not found" }`

---

## Payload Input (POST)

Kirim object berikut ke `POST /api/signals`. Server mengelola `id`, `createdAt`,
`updatedAt`, dan `createdAgo` — **jangan** dikirim (kalau dikirim, diabaikan).

### Field wajib

| Field         | Tipe                                | Aturan                                  |
| ------------- | ----------------------------------- | --------------------------------------- |
| `pair`        | `string`                            | Non-kosong. Disimpan uppercase.         |
| `side`        | `'LONG' \| 'SHORT' \| 'WATCH'`      | Case-insensitive (`long` → `LONG`).     |
| `status`      | `'active' \| 'pending' \| 'closed'` | Case-insensitive.                       |
| `leverage`    | `number`                            | Angka berhingga.                        |
| `confidence`  | `number`                            | Angka (0–100).                          |
| `entry`       | `number`                            | Angka berhingga.                        |
| `targets`     | `number[]`                          | Array non-kosong berisi angka.          |
| `stopLoss`    | `number`                            | Angka berhingga.                        |
| `thesis`      | `string`                            | Non-kosong.                             |
| `reasons`     | `string[]`                          | Array string.                           |
| `invalidation`| `string`                            | Non-kosong.                             |
| `timeframe`   | `string`                            | Non-kosong.                             |

> Semua field di atas wajib. Tidak ada field opsional.

### Contoh payload lengkap

```json
{
  "pair": "BTCUSDT",
  "side": "LONG",
  "status": "active",
  "leverage": 10,
  "confidence": 82,
  "entry": 62840,
  "targets": [63950, 65200, 67000],
  "stopLoss": 61200,
  "thesis": "Price swept the $62.4k liquidity pocket and reclaimed the range low on the 4H. Funding flipped negative while spot bid stepped in.",
  "reasons": [
    "Liquidity sweep + reclaim of $62.8k range low (HL printed)",
    "Funding negatif (shorts bayar) — supportive untuk long",
    "Volume divergence: sell volume turun di tiap leg bawah"
  ],
  "invalidation": "4H close di bawah $61.2k membatalkan reclaim → exit.",
  "timeframe": "4H · reclaim of range low"
}
```

### Contoh payload lain

```json
{
  "pair": "ETHUSDT",
  "side": "short",
  "status": "pending",
  "leverage": 8,
  "confidence": 70,
  "entry": 3420,
  "targets": [3360, 3280],
  "stopLoss": 3510,
  "thesis": "Lower-high rejection di 1D.",
  "reasons": ["LH 1D", "Rejection dari supply"],
  "invalidation": "1D close di atas 3510.",
  "timeframe": "1D"
}
```

---

## Aturan Bisnis

1. **Auto-expire 24 jam.** Setiap operasi read/write membuang sinyal dengan
   `createdAt` lebih tua dari 24 jam (`TTL_MS = 24 * 60 * 60 * 1000`). Sinyal lama
   dianggap tidak valid lagi dan hilang otomatis.
2. **Upsert (replace) by `pair + side`.** `id` di-derive dari `pair-side`
   (`deriveId`). POST dengan kombinasi sama akan menimpa entri lama:
   `createdAt` **dipertahankan**, `updatedAt` diperbarui ke sekarang.
3. **Sort terbaru dulu.** `GET` mengembalikan list diurutkan `updatedAt` (fallback
   `createdAt`) menurun.
4. **Validasi ketat.** Field wajib & tipe diperiksa; gagal → `400` dengan pesan jelas.
5. **`id` = route detail.** `btcusdt-long` dapat dibuka di `/signals/btcusdt-long`.
   Setelah dihapus/kedaluwarsa, route detail mengembalikan `404`.

---

## Contoh Penggunaan

Asumsi dev server di `http://localhost:3000`.

### Input sinyal (curl)

```bash
curl -X POST http://localhost:3000/api/signals \
  -H 'Content-Type: application/json' \
  -d '{
    "pair":"BTCUSDT","side":"long","status":"active",
    "leverage":10,"confidence":82,"entry":62840,
    "targets":[63950,65200,67000],"stopLoss":61200,
    "thesis":"Reclaim range low","reasons":["sweep+reclaim","funding negatif"],
    "invalidation":"4H close < 61.2k","timeframe":"4H"
  }'
```

### List sinyal

```bash
curl http://localhost:3000/api/signals
```

### Hapus sinyal

```bash
curl -X DELETE "http://localhost:3000/api/signals?id=btcusdt-long"
```

### Input dari Node / script

```js
await fetch('http://localhost:3000/api/signals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pair: 'SOLUSDT', side: 'LONG', status: 'pending',
    leverage: 12, confidence: 68, entry: 142.5,
    targets: [148, 154.5, 162], stopLoss: 136.8,
    thesis: 'Coiled spring breakout pending.',
    reasons: ['Range menyempit + OI naik', 'HL recovery'],
    invalidation: 'No breakout 6 jam → cancel.',
    timeframe: '1H · coiled spring',
  }),
})
```

---

## UI / Komponen

### Homepage `/` (`app/page.tsx`)

- **Server component** (`export const dynamic = 'force-dynamic'`) → baca `listSignals()`.
- Render: hero/nav (link ke `/dashboard`), strip ringkasan (Total / Active / Long /
  Short dari `summarize()`), lalu `<SignalsBoard>`.

### `SignalsBoard` (`components/signals/SignalsBoard.tsx`)

- **Client component**: filter tabs (All / Active / Long / Short / Watch / Closed) + grid kartu.
- Grid responsif: `1 → 2 (sm) → 3 (xl) → 4 (2xl)` kolom.

### `SignalCard` (`components/signals/SignalCard.tsx`)

- Kartu sinyal, dibungkus `<Link href="/signals/{id}">`.
- Tampil: pair, badge side (LONG hijau / SHORT merah / WATCH kuning), status, leverage,
  bar confidence, grid Entry/Stop, chip target, hover "View analysis →".

### Detail `/signals/[id]` (`app/signals/[id]/page.tsx`)

- **Server component** (`force-dynamic`) → `getSignalById(params.id)`, `notFound()` bila null.
- Seksi: header (pair/side/status), quick stats (Confidence, Leverage,
  **Risk:Reward** dari `riskReward()`), **Trade Thesis**, **Trade Levels**
  (Entry/Stop + daftar TP), **Why This Setup** (reasons), **Invalidation**,
  **Market Bias** (dari konstanta `MARKET_BIAS`).

### Helper (`lib/signals.ts`)

| Fungsi              | Guna                                                        |
| ------------------- | ----------------------------------------------------------- |
| `summarize(list)`   | Hitung total, active, long, short untuk strip ringkasan. |
| `riskReward(s)`     | Reward-to-risk pakai target pertama: `|TP1−entry| / |entry−SL|`. |
| `timeAgo(ts)`       | Epoch ms → label relatif (`just now`, `12m ago`, `3h ago`, `2d ago`). |

---

## Roadmap / Catatan

- **Sumber data = POST.** Store kosong sampai ada `POST /api/signals`; tidak ada dummy/seed.
- **`MARKET_BIAS` masih konstanta global.** Bila ingin per-sinyal, tambah field di payload
  dan model data.
- **Durabilitas.** Untuk multi-instance/serverless, migrasi storage ke SQLite atau DB
  eksternal; antarmuka `lib/signalStore.ts` (list/get/upsert/delete) tetap sama.
```
