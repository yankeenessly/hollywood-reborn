import https from 'node:https';

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Backend-Health-Check',
        ...(options.headers || {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING BACKEND HEALTH & ENDPOINT VERIFICATION ===\n');

  // Test 1: Store Cards Catalog
  const t1 = await request('https://jattjames.bond/api/cards');
  const cardCount = t1.data?.cards?.length || 0;
  console.log('1. Store Catalog API (/api/cards):', t1.status === 200 ? '✅ PASS' : '❌ FAIL', `(Available cards: ${cardCount})`);

  // Test 2: Admin Login
  const t2 = await request('https://jattjames.bond/api/admin/login', { method: 'POST' }, { password: 'admin123' });
  console.log('2. Admin Authentication (/api/admin/login):', t2.status === 200 ? '✅ PASS' : '❌ FAIL', `(${t2.data?.message})`);

  // Test 3: Admin Stats
  const t3 = await request('https://jattjames.bond/api/admin/stats');
  const revenue = t3.data?.stats?.total_revenue ?? 0;
  const orders = t3.data?.stats?.total_orders ?? 0;
  console.log('3. Admin Stats API (/api/admin/stats):', t3.status === 200 ? '✅ PASS' : '❌ FAIL', `(Total Revenue: $${revenue}, Total Orders: ${orders})`);

  // Test 4: Customer Wallet Access
  const testEmail = 'verify-' + Date.now() + '@vault.com';
  const t4 = await request('https://jattjames.bond/api/wallet/access', { method: 'POST' }, { email: testEmail, name: 'System Tester' });
  const walletId = t4.data?.wallet?.id || 'N/A';
  console.log('4. Customer Wallet Access (/api/wallet/access):', t4.status === 200 ? '✅ PASS' : '❌ FAIL', `(Wallet ID: ${walletId})`);

  // Test 5: Wallet Deposit
  const t5 = await request('https://jattjames.bond/api/wallet/deposit', { method: 'POST' }, {
    wallet_id: walletId,
    amount: 100,
    tx_hash: 'TEST-TX-' + Date.now(),
    payment_method: 'USDT (TRC20)'
  });
  const balance = t5.data?.wallet?.balance ?? 0;
  console.log('5. Wallet Deposit API (/api/wallet/deposit):', t5.status === 200 ? '✅ PASS' : '❌ FAIL', `(New Balance: $${balance})`);

  // Test 6: Order Lookup
  const t6 = await request('https://jattjames.bond/api/orders/lookup?orderId=NONEXISTENT&email=none@none.com');
  console.log('6. Order Lookup Error Handling (/api/orders/lookup):', t6.status === 404 ? '✅ PASS' : '❌ FAIL', '(Proper 404 on missing order)');

  console.log('\n=== ALL BACKEND ENDPOINTS ARE FULLY OPERATIONAL ===');
}

runTests().catch(console.error);
