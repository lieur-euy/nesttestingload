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

  // Filter outlet yang punya warehouse
  const validOutlets = data.outlets.filter((o) => {
    const r = http.get(`${BASE_URL}/inventory/warehouse/by-outlet/${o.id}`);
    return r.status === 200;
  });
  if (validOutlets.length === 0) {
    check(null, { 'outlet dengan warehouse tersedia': (v) => false });
    return;
  }

  const outlet = getRandomItem(validOutlets);
  const whRes = http.get(`${BASE_URL}/inventory/warehouse/by-outlet/${outlet.id}`);
  let warehouseId = null;
  try { warehouseId = JSON.parse(whRes.body).id; } catch (e) {}

  const ingredient = getRandomItem(data.ingredients);

  check(http.get(`${BASE_URL}/inventory/stock?warehouseId=${warehouseId}&productId=${ingredient.id}`), {
    'GET stock': (r) => r.status === 200,
  });

  check(http.get(`${BASE_URL}/inventory/transactions?warehouseId=${warehouseId}&productId=${ingredient.id}`), {
    'GET transaction history': (r) => r.status === 200,
  });

  sleep(1);
}

export default inventoryTest;
