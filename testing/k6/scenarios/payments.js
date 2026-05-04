import { check, sleep } from 'k6';
import http from 'k6/http';
import { BASE_URL, PAYMENTS_OPTIONS } from '../config.js';

export const options = PAYMENTS_OPTIONS;

export function paymentsTest() {
  // --- GET list payments ---
  const listRes = http.get(`${BASE_URL}/payments`, { tags: { name: 'list payments' } });
  check(listRes, {
    'GET list payments sukses': (r) => r.status === 200,
  });

  let firstPaymentId = null;
  try {
    const body = JSON.parse(listRes.body);
    const payments = body.data || [];
    if (payments.length > 0) {
      firstPaymentId = payments[0].salesOrderId;
    }
  } catch (e) {
    // ignore
  }

  // --- GET payment by sales order ---
  if (firstPaymentId) {
    const bySoRes = http.get(`${BASE_URL}/payments/by-sales-order/${firstPaymentId}`, {
      tags: { name: 'get payment by sales order' },
    });
    check(bySoRes, {
      'GET payment by sales order sukses': (r) => r.status === 200,
    });
  }

  sleep(1);
}

export default paymentsTest;
