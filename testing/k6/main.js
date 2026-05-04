import { MASTER_DATA_OPTIONS, SALES_OPTIONS, INVENTORY_OPTIONS, PAYMENTS_OPTIONS } from './config.js';
import { masterDataTest } from './scenarios/master-data.js';
import { salesTest } from './scenarios/sales.js';
import { inventoryTest } from './scenarios/inventory.js';
import { paymentsTest } from './scenarios/payments.js';

// ============================================================
// Cara pakai:
//   k6 run testing/k6/main.js
//
// Atau jalankan masing-masing skenario terpisah:
//   k6 run testing/k6/scenarios/master-data.js
//   k6 run testing/k6/scenarios/sales.js
//   k6 run testing/k6/scenarios/inventory.js
//   k6 run testing/k6/scenarios/payments.js
//
// SESUAIKAN konfigurasi concurrency di config.js
// ============================================================

export const options = {
  scenarios: {
    master_data: {
      executor: 'ramping-vus',
      exec: 'masterDataTest',
      startTime: '0s',
      stages: MASTER_DATA_OPTIONS.stages,
      thresholds: MASTER_DATA_OPTIONS.thresholds,
    },
    sales: {
      executor: 'ramping-vus',
      exec: 'salesTest',
      startTime: '10s',
      stages: SALES_OPTIONS.stages,
      thresholds: SALES_OPTIONS.thresholds,
    },
    inventory: {
      executor: 'ramping-vus',
      exec: 'inventoryTest',
      startTime: '20s',
      stages: INVENTORY_OPTIONS.stages,
      thresholds: INVENTORY_OPTIONS.thresholds,
    },
    payments: {
      executor: 'ramping-vus',
      exec: 'paymentsTest',
      startTime: '30s',
      stages: PAYMENTS_OPTIONS.stages,
      thresholds: PAYMENTS_OPTIONS.thresholds,
    },
  },
};

export { masterDataTest, salesTest, inventoryTest, paymentsTest };
