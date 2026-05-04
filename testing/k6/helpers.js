import http from 'k6/http';
import { check } from 'k6';

export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function extractData(body) {
  try {
    const parsed = typeof body === 'string' ? JSON.parse(body) : body;
    return parsed.data || parsed;
  } catch {
    return null;
  }
}

export function fetchList(url) {
  const allItems = [];
  let cursor = null;
  for (let i = 0; i < 10; i++) {
    const query = cursor ? `?cursor=${cursor}&take=100` : '?take=100';
    const res = http.get(`${url}${query}`, { tags: { name: `${url} list` } });
    if (res.status !== 200) break;
    try {
      const body = JSON.parse(res.body);
      const items = body.data || [];
      allItems.push(...items);
      if (!body.nextCursor) break;
      cursor = body.nextCursor;
    } catch {
      break;
    }
  }
  return allItems;
}

export function fetchLookups(baseUrl) {
  const products = fetchList(`${baseUrl}/master-data/products`);
  const ingredients = products.filter((p) => p.sku && p.sku.startsWith('ING-'));
  const finishGoods = products.filter((p) => p.sku && p.sku.startsWith('FG-'));

  const outlets = fetchList(`${baseUrl}/master-data/outlets`);
  const customers = fetchList(`${baseUrl}/master-data/customers`);
  const paymentMethods = fetchList(`${baseUrl}/master-data/payment-methods`);
  const categories = fetchList(`${baseUrl}/master-data/product-categories`);
  const uoms = fetchList(`${baseUrl}/master-data/uoms`);
  const suppliers = fetchList(`${baseUrl}/master-data/suppliers`);

  return {
    products,
    ingredients,
    finishGoods,
    outlets,
    customers,
    paymentMethods,
    categories,
    uoms,
    suppliers,
  };
}
