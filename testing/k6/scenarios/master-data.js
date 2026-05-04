import { check, sleep } from 'k6';
import http from 'k6/http';
import { BASE_URL, MASTER_DATA_OPTIONS } from '../config.js';
import { getRandomItem, fetchLookups } from '../helpers.js';

export const options = MASTER_DATA_OPTIONS;

const BASE = `${BASE_URL}/master-data`;

export function masterDataTest() {
  const data = fetchLookups(BASE_URL);
  if (data.products.length === 0) {
    check(null, { 'seed data tersedia': (v) => false });
    return;
  }

  // --- GET list semua master data ---
  const listEndpoints = [
    { url: `${BASE}/customers`, name: 'list customers' },
    { url: `${BASE}/outlets`, name: 'list outlets' },
    { url: `${BASE}/products`, name: 'list products' },
    { url: `${BASE}/product-categories`, name: 'list categories' },
    { url: `${BASE}/uoms`, name: 'list uoms' },
    { url: `${BASE}/suppliers`, name: 'list suppliers' },
    { url: `${BASE}/payment-methods`, name: 'list payment methods' },
  ];

  for (const ep of listEndpoints) {
    const res = http.get(ep.url);
    check(res, { [`GET ${ep.name}`]: (r) => r.status === 200 });
  }

  // --- GET by ID ---
  if (data.customers.length > 0) {
    const c = getRandomItem(data.customers);
    check(http.get(`${BASE}/customers/${c.id}`), { 'GET customer by id': (r) => r.status === 200 });
  }
  if (data.outlets.length > 0) {
    const o = getRandomItem(data.outlets);
    check(http.get(`${BASE}/outlets/${o.id}`), { 'GET outlet by id': (r) => r.status === 200 });
  }
  if (data.products.length > 0) {
    const p = getRandomItem(data.products);
    check(http.get(`${BASE}/products/${p.id}`), { 'GET product by id': (r) => r.status === 200 });
  }
  if (data.suppliers.length > 0) {
    const s = getRandomItem(data.suppliers);
    check(http.get(`${BASE}/suppliers/${s.id}`), { 'GET supplier by id': (r) => r.status === 200 });
  }
  if (data.paymentMethods.length > 0) {
    const pm = getRandomItem(data.paymentMethods);
    check(http.get(`${BASE}/payment-methods/${pm.id}`), { 'GET payment method by id': (r) => r.status === 200 });
  }

  // --- POST create ---
  const uid = () => `${__VU}-${__ITER}-${Date.now()}`;

  const createCustomerRes = http.post(`${BASE}/customers`, JSON.stringify({
    code: `K6-CUST-${uid()}`,
    name: `K6 Customer ${uid()}`,
    phone: '0812-00000000',
  }), { headers: { 'Content-Type': 'application/json' } });
  check(createCustomerRes, { 'POST create customer': (r) => r.status === 201 });

  if (data.categories.length > 0 && data.uoms.length > 0 && data.suppliers.length > 0) {
    const createProductRes = http.post(`${BASE}/products`, JSON.stringify({
      name: `K6 Product ${uid()}`,
      sku: `K6-SKU-${uid()}`,
      price: Math.floor(Math.random() * 50000) + 5000,
      categoryId: getRandomItem(data.categories).id,
      uomId: getRandomItem(data.uoms).id,
      supplierId: getRandomItem(data.suppliers).id,
    }), { headers: { 'Content-Type': 'application/json' } });
    check(createProductRes, { 'POST create product': (r) => r.status === 201 });
  }

  const createOutletRes = http.post(`${BASE}/outlets`, JSON.stringify({
    code: `K6-OUT-${uid()}`,
    name: `K6 Outlet ${uid()}`,
    address: 'K6 Test Address',
    phone: '021-99999999',
  }), { headers: { 'Content-Type': 'application/json' } });
  check(createOutletRes, { 'POST create outlet': (r) => r.status === 201 });

  const createSupplierRes = http.post(`${BASE}/suppliers`, JSON.stringify({
    code: `K6-SUP-${uid()}`,
    name: `K6 Supplier ${uid()}`,
    contact: 'K6 Contact',
    phone: '021-88888888',
  }), { headers: { 'Content-Type': 'application/json' } });
  check(createSupplierRes, { 'POST create supplier': (r) => r.status === 201 });

  const createCategoryRes = http.post(`${BASE}/product-categories`, JSON.stringify({
    name: `K6 Category ${uid()}`,
  }), { headers: { 'Content-Type': 'application/json' } });
  check(createCategoryRes, { 'POST create category': (r) => r.status === 201 });

  const createUomRes = http.post(`${BASE}/uoms`, JSON.stringify({
    name: `K6 UOM ${uid()}`,
    symbol: 'k6',
  }), { headers: { 'Content-Type': 'application/json' } });
  check(createUomRes, { 'POST create uom': (r) => r.status === 201 });

  const createPaymentMethodRes = http.post(`${BASE}/payment-methods`, JSON.stringify({
    code: `K6-PM-${uid()}`,
    name: `K6 Payment ${uid()}`,
  }), { headers: { 'Content-Type': 'application/json' } });
  check(createPaymentMethodRes, { 'POST create payment method': (r) => r.status === 201 });

  // --- PATCH update ---
  if (data.outlets.length > 0) {
    const outlet = getRandomItem(data.outlets);
    check(http.patch(`${BASE}/outlets/${outlet.id}`, JSON.stringify({ name: `K6 Updated ${uid()}` }), {
      headers: { 'Content-Type': 'application/json' },
    }), { 'PATCH update outlet': (r) => r.status === 200 });
  }
  if (data.products.length > 0) {
    const product = getRandomItem(data.products);
    check(http.patch(`${BASE}/products/${product.id}`, JSON.stringify({ name: `K6 Updated ${uid()}` }), {
      headers: { 'Content-Type': 'application/json' },
    }), { 'PATCH update product': (r) => r.status === 200 });
  }

  sleep(1);
}

export default masterDataTest;
