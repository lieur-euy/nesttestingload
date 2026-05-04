import { check, sleep } from 'k6';
import http from 'k6/http';
import { BASE_URL, SALES_OPTIONS } from '../config.js';
import { getRandomItem, fetchLookups } from '../helpers.js';

export const options = SALES_OPTIONS;

export function salesTest() {
  const data = fetchLookups(BASE_URL);

  if (data.outlets.length === 0 || data.finishGoods.length === 0 || data.paymentMethods.length === 0) {
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
  const paymentMethod = getRandomItem(data.paymentMethods);
  const customer = data.customers.length > 0 ? getRandomItem(data.customers) : null;

  // Pilih 1-3 item random dari finished goods (pastikan unik)
  const numItems = Math.min(Math.floor(Math.random() * 3) + 1, data.finishGoods.length);
  const selectedItems = [];
  const usedIds = new Set();
  for (let i = 0; i < numItems; i++) {
    let product;
    let attempts = 0;
    do {
      product = getRandomItem(data.finishGoods);
      attempts++;
    } while (usedIds.has(product.id) && attempts < 20);
    if (product && !usedIds.has(product.id)) {
      usedIds.add(product.id);
      selectedItems.push({ productId: product.id, qty: 1 });
    }
  }

  if (selectedItems.length === 0) {
    check(null, { 'ada item tersedia': (v) => false });
    return;
  }

  // --- POST create sales order ---
  const salesPayload = { outletId: outlet.id, methodId: paymentMethod.id, items: selectedItems };
  if (customer) salesPayload.customerId = customer.id;

  const createRes = http.post(`${BASE_URL}/sales`, JSON.stringify(salesPayload), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(createRes, { 'POST create sales order': (r) => r.status === 201 });

  // --- GET list & by ID ---
  if (createRes.status === 201) {
    let salesId = null;
    try { salesId = JSON.parse(createRes.body).id; } catch (e) {}

    check(http.get(`${BASE_URL}/sales`), { 'GET list sales orders': (r) => r.status === 200 });

    if (salesId) {
      check(http.get(`${BASE_URL}/sales/${salesId}`), { 'GET sales order by id': (r) => r.status === 200 });
    }
  }

  sleep(1);
}

export default salesTest;
