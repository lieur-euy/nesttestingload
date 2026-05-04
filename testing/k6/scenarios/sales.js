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

  const outlet = getRandomItem(data.outlets);
  const paymentMethod = getRandomItem(data.paymentMethods);
  const customer = data.customers.length > 0 ? getRandomItem(data.customers) : null;

  // Pilih 1-3 item random dari finished goods (pastikan item unik)
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
      selectedItems.push({ productId: product.id, qty: Math.floor(Math.random() * 3) + 1 });
    }
  }

  if (selectedItems.length === 0) {
    check(null, { 'bisa pilih item': (v) => false });
    return;
  }

  // --- POST create sales order ---
  const salesPayload = {
    outletId: outlet.id,
    methodId: paymentMethod.id,
    items: selectedItems,
  };
  if (customer) {
    salesPayload.customerId = customer.id;
  }

  const createRes = http.post(`${BASE_URL}/sales`, JSON.stringify(salesPayload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'create sales order' },
  });

  check(createRes, {
    'POST create sales order sukses': (r) => r.status === 201,
  });

  // Simpan ID sales order yang baru dibuat untuk query berikutnya
  let salesId = null;
  try {
    const body = JSON.parse(createRes.body);
    salesId = body.id;
  } catch (e) {
    // ignore parse error
  }

  // --- GET list sales orders ---
  const listRes = http.get(`${BASE_URL}/sales`, { tags: { name: 'list sales orders' } });
  check(listRes, {
    'GET list sales orders sukses': (r) => r.status === 200,
  });

  // --- GET sales order by ID ---
  if (salesId) {
    const getRes = http.get(`${BASE_URL}/sales/${salesId}`, { tags: { name: 'get sales order by id' } });
    check(getRes, {
      'GET sales order by id sukses': (r) => r.status === 200,
    });
  }

  sleep(1);
}

export default salesTest;
