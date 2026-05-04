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
//    # Stress test sales (1000 transaksi):
//    k6 run testing/k6/scenarios/sales-stress.js
//
//    # Atau per skenario:
//    k6 run testing/k6/scenarios/sales.js
//    k6 run testing/k6/scenarios/master-data.js
//
// 5. Sesuaikan concurrency di file ini (stages/target)
// ============================================================

export const BASE_URL = 'http://10.10.10.100:3000';

// ============================================================
// KONFIGURASI SALES STRESS TEST (1000 transaksi)
// ============================================================
// Atur VUS dan ITERATIONS sesuai target yang diinginkan
// Contoh:
//   vus: 50, iterations: 1000  -> 50 user concurrent, total 1000 request
//   stages: ramp up -> steady -> ramp down
// ============================================================
export const SALES_STRESS_OPTIONS = {
  executor: 'shared-iterations',
  vus: 50,
  iterations: 1000,
  maxDuration: '5m',
};
