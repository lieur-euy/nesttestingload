import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, SALES_STRESS_OPTIONS } from '../config.js';

export const options = {
  scenarios: {
    sales_stress: {
      ...SALES_STRESS_OPTIONS,
      exec: 'salesStress',
    },
  },
};

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function setup() {
  const base = BASE_URL;

  function fetchList(url) {
    const items = [];
    let cursor = null;
    for (let i = 0; i < 10; i++) {
      const q = cursor ? `?cursor=${cursor}&take=100` : '?take=100';
      const res = http.get(`${url}${q}`);
      if (res.status !== 200) break;
      try {
        const body = JSON.parse(res.body);
        const list = body.data || [];
        items.push(...list);
        if (!body.nextCursor) break;
        cursor = body.nextCursor;
      } catch { break; }
    }
    return items;
  }

  const products = fetchList(`${base}/master-data/products`);
  const ingredients = products.filter((p) => p.sku && p.sku.startsWith('ING-'));
  const finishGoods = products.filter((p) => p.sku && p.sku.startsWith('FG-'));
  const outlets = fetchList(`${base}/master-data/outlets`);
  const customers = fetchList(`${base}/master-data/customers`);
  const paymentMethods = fetchList(`${base}/master-data/payment-methods`);

  const warehouseByOutlet = {};
  const validOutlets = [];
  for (const o of outlets) {
    const r = http.get(`${base}/inventory/warehouse/by-outlet/${o.id}`);
    if (r.status === 200) {
      try {
        const wh = JSON.parse(r.body);
        warehouseByOutlet[o.id] = wh.id;
        validOutlets.push(o);
      } catch {}
    }
  }

  return { base, finishGoods, ingredients, outlets: validOutlets, customers, paymentMethods, warehouseByOutlet };
}

export function salesStress(apiData) {
  if (apiData.outlets.length === 0 || apiData.finishGoods.length === 0 || apiData.paymentMethods.length === 0) {
    check(null, { 'seed data ready': () => false });
    return;
  }

  const outlet = getRandom(apiData.outlets);
  const whId = apiData.warehouseByOutlet[outlet.id];
  const paymentMethod = getRandom(apiData.paymentMethods);
  const customer = apiData.customers.length > 0 ? getRandom(apiData.customers) : null;

  // Top-up stock SEKALI di awal VU biar gak habis
  if (__ITER === 0) {
    for (const ing of apiData.ingredients) {
      http.post(`${apiData.base}/inventory/stock`, JSON.stringify({
        warehouseId: whId,
        productId: ing.id,
        qty: 50000,
      }), { headers: { 'Content-Type': 'application/json' } });
    }
  }

  // Pilih 1-2 finished goods, qty=1
  const n = Math.min(Math.floor(Math.random() * 2) + 1, apiData.finishGoods.length);
  const picked = [];
  const used = new Set();
  for (let i = 0; i < n; i++) {
    let p;
    let tries = 0;
    do {
      p = getRandom(apiData.finishGoods);
      tries++;
    } while (used.has(p.id) && tries < 20);
    if (p && !used.has(p.id)) {
      used.add(p.id);
      picked.push({ productId: p.id, qty: 1 });
    }
  }

  if (picked.length === 0) return;

  const payload = { outletId: outlet.id, methodId: paymentMethod.id, items: picked };
  if (customer) payload.customerId = customer.id;

  const res = http.post(`${apiData.base}/sales`, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'sales 201': (r) => r.status === 201,
    'sales gagal': (r) => r.status !== 201,
  });

  sleep(0.1);
}

export default function (data) {
  salesStress(data);
}
