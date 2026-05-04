import { check, sleep } from 'k6';
import http from 'k6/http';
import { BASE_URL, INVENTORY_OPTIONS } from '../config.js';
import { getRandomItem, fetchLookups } from '../helpers.js';

export const options = INVENTORY_OPTIONS;

export function inventoryTest() {
  const data = fetchLookups(BASE_URL);

  if (data.outlets.length === 0 || data.ingredients.length === 0) {
    check(null, { 'seed data tersedia': (v) => false });
    return;
  }

  // Ambil warehouse untuk outlet random
  const outlet = getRandomItem(data.outlets);
  const whRes = http.get(`${BASE_URL}/inventory/warehouse/by-outlet/${outlet.id}`, {
    tags: { name: 'get warehouse by outlet' },
  });

  let warehouseId = null;
  check(whRes, {
    'GET warehouse by outlet sukses': (r) => r.status === 200,
  });
  try {
    const wh = JSON.parse(whRes.body);
    warehouseId = wh.id;
  } catch (e) {
    // fallback
  }

  if (!warehouseId) {
    sleep(1);
    return;
  }

  const ingredient = getRandomItem(data.ingredients);

  // --- GET stock ---
  const stockRes = http.get(
    `${BASE_URL}/inventory/stock?warehouseId=${warehouseId}&productId=${ingredient.id}`,
    { tags: { name: 'get stock' } },
  );
  check(stockRes, {
    'GET stock sukses': (r) => r.status === 200,
  });

  // --- GET transaction history ---
  const txnRes = http.get(
    `${BASE_URL}/inventory/transactions?warehouseId=${warehouseId}&productId=${ingredient.id}`,
    { tags: { name: 'get transaction history' } },
  );
  check(txnRes, {
    'GET transaction history sukses': (r) => r.status === 200,
  });

  sleep(1);
}

export default inventoryTest;
