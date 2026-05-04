// ============================================================
// CARA PAKAI K6 TESTING
// ============================================================
// 1. Install k6: https://grafana.com/docs/k6/get-started/installation
//    Atau lewat winget:  winget install k6
//
// 2. Jalankan API server:
//    npm run start:dev
//
// 3. Pastikan API sudah dised (seed data sudah ada):
//    npx prisma db seed
//
// 4. Jalankan k6:
//    # Semua skenario barengan:
//    k6 run testing/k6/main.js
//
//    # Atau per skenario:
//    k6 run testing/k6/scenarios/master-data.js
//    k6 run testing/k6/scenarios/sales.js
//    k6 run testing/k6/scenarios/inventory.js
//    k6 run testing/k6/scenarios/payments.js
//
// 5. Sesuaikan concurrency di file ini (stages -> target)
//    Contoh: target: 10 -> maksimal 10 VUs
// ============================================================

export const BASE_URL = 'http://10.10.10.100:3000';

// ============================================================
// SESUAIKAN KONFIGURASI CONCURRENCY DI BAWAH INI
// ============================================================
// stages: atur pola beban (ramp-up -> steady -> ramp-down)
//   duration: lama tahapan (contoh: '30s', '1m')
//   target: jumlah VU maksimal di tahapan tersebut
//
// thresholds: batas toleransi
//   http_req_duration: durasi response (p(95) < 5000ms)
//   http_req_failed: persentase error (< 5%)
// ============================================================
export const MASTER_DATA_OPTIONS = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '30s', target: 5 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.05'],
  },
};

export const SALES_OPTIONS = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '30s', target: 5 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.05'],
  },
};

export const INVENTORY_OPTIONS = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '30s', target: 10 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.01'],
  },
};

export const PAYMENTS_OPTIONS = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '30s', target: 5 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.01'],
  },
};
