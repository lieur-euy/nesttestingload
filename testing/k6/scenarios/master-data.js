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
    const res = http.get(ep.url, { tags: { name: ep.name } });
    check(res, {
      [`GET ${ep.name} sukses`]: (r) => r.status === 200,
    });
  }

  // --- GET by ID (gunakan data seed) ---
  if (data.customers.length > 0) {
    const c = getRandomItem(data.customers);
    const res = http.get(`${BASE}/customers/${c.id}`, { tags: { name: 'get customer by id' } });
    check(res, { 'GET customer by id sukses': (r) => r.status === 200 });
  }

  if (data.outlets.length > 0) {
    const o = getRandomItem(data.outlets);
    const res = http.get(`${BASE}/outlets/${o.id}`, { tags: { name: 'get outlet by id' } });
    check(res, { 'GET outlet by id sukses': (r) => r.status === 200 });
  }

  if (data.products.length > 0) {
    const p = getRandomItem(data.products);
    const res = http.get(`${BASE}/products/${p.id}`, { tags: { name: 'get product by id' } });
    check(res, { 'GET product by id sukses': (r) => r.status === 200 });
  }

  if (data.suppliers.length > 0) {
    const s = getRandomItem(data.suppliers);
    const res = http.get(`${BASE}/suppliers/${s.id}`, { tags: { name: 'get supplier by id' } });
    check(res, { 'GET supplier by id sukses': (r) => r.status === 200 });
  }

  if (data.paymentMethods.length > 0) {
    const pm = getRandomItem(data.paymentMethods);
    const res = http.get(`${BASE}/payment-methods/${pm.id}`, { tags: { name: 'get payment method by id' } });
    check(res, { 'GET payment method by id sukses': (r) => r.status === 200 });
  }

  // --- POST create ---
  const createCustomerPayload = JSON.stringify({
    code: `K6-CUST-${Date.now()}`,
    name: `K6 Customer ${Date.now()}`,
    phone: '0812-00000000',
  });
  const createCustomerRes = http.post(`${BASE}/customers`, createCustomerPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'create customer' },
  });
  check(createCustomerRes, { 'POST create customer sukses': (r) => r.status === 201 });

  if (data.categories.length > 0 && data.uoms.length > 0 && data.suppliers.length > 0) {
    const cat = getRandomItem(data.categories);
    const uom = getRandomItem(data.uoms);
    const sup = getRandomItem(data.suppliers);
    const createProductPayload = JSON.stringify({
      name: `K6 Product ${Date.now()}`,
      sku: `K6-${Date.now()}`,
      price: Math.floor(Math.random() * 50000) + 5000,
      categoryId: cat.id,
      uomId: uom.id,
      supplierId: sup.id,
    });
    const createProductRes = http.post(`${BASE}/products`, createProductPayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'create product' },
    });
    check(createProductRes, { 'POST create product sukses': (r) => r.status === 201 });
  }

  const createOutletPayload = JSON.stringify({
    code: `K6-OUT-${Date.now()}`,
    name: `K6 Outlet ${Date.now()}`,
    address: 'K6 Test Address',
    phone: '021-99999999',
  });
  const createOutletRes = http.post(`${BASE}/outlets`, createOutletPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'create outlet' },
  });
  check(createOutletRes, { 'POST create outlet sukses': (r) => r.status === 201 });

  const createSupplierPayload = JSON.stringify({
    code: `K6-SUP-${Date.now()}`,
    name: `K6 Supplier ${Date.now()}`,
    contact: 'K6 Contact',
    phone: '021-88888888',
  });
  const createSupplierRes = http.post(`${BASE}/suppliers`, createSupplierPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'create supplier' },
  });
  check(createSupplierRes, { 'POST create supplier sukses': (r) => r.status === 201 });

  const createCategoryPayload = JSON.stringify({ name: `K6 Category ${Date.now()}` });
  const createCategoryRes = http.post(`${BASE}/product-categories`, createCategoryPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'create category' },
  });
  check(createCategoryRes, { 'POST create category sukses': (r) => r.status === 201 });

  const createUomPayload = JSON.stringify({
    name: `K6 UOM ${Date.now()}`,
    symbol: `k6`,
  });
  const createUomRes = http.post(`${BASE}/uoms`, createUomPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'create uom' },
  });
  check(createUomRes, { 'POST create uom sukses': (r) => r.status === 201 });

  const createPaymentMethodPayload = JSON.stringify({
    code: `K6-PM-${Date.now()}`,
    name: `K6 Payment ${Date.now()}`,
  });
  const createPaymentMethodRes = http.post(`${BASE}/payment-methods`, createPaymentMethodPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'create payment method' },
  });
  check(createPaymentMethodRes, { 'POST create payment method sukses': (r) => r.status === 201 });

  // --- PATCH update outlet ---
  if (data.outlets.length > 0) {
    const outlet = getRandomItem(data.outlets);
    const updatePayload = JSON.stringify({ name: `K6 Updated ${Date.now()}` });
    const updateRes = http.patch(`${BASE}/outlets/${outlet.id}`, updatePayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'update outlet' },
    });
    check(updateRes, { 'PATCH update outlet sukses': (r) => r.status === 200 });
  }

  // --- PATCH update product ---
  if (data.products.length > 0) {
    const product = getRandomItem(data.products);
    const updatePayload = JSON.stringify({ name: `K6 Updated ${Date.now()}` });
    const updateRes = http.patch(`${BASE}/products/${product.id}`, updatePayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'update product' },
    });
    check(updateRes, { 'PATCH update product sukses': (r) => r.status === 200 });
  }

  sleep(1);
}

export default masterDataTest;
