import { check, sleep } from 'k6';
import http from 'k6/http';
import { BASE_URL, PAYMENTS_OPTIONS } from '../config.js';

export const options = PAYMENTS_OPTIONS;

export function paymentsTest() {
  const listRes = http.get(`${BASE_URL}/payments`);
  check(listRes, { 'GET list payments': (r) => r.status === 200 });

  if (listRes.status === 200) {
    try {
      const body = JSON.parse(listRes.body);
      const payments = body.data || [];
      if (payments.length > 0) {
        const salesOrderId = payments[0].salesOrderId;
        check(http.get(`${BASE_URL}/payments/by-sales-order/${salesOrderId}`), {
          'GET payment by sales order': (r) => r.status === 200,
        });
      }
    } catch (e) {}
  }

  sleep(1);
}

export default paymentsTest;
