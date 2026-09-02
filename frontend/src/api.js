const API_BASE = '/api';

export async function fetchStoreCards() {
  const res = await fetch(`${API_BASE}/cards`);
  if (!res.ok) throw new Error('Failed to load gift cards');
  return res.json();
}

export async function checkout(payload) {
  const res = await fetch(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Checkout failed');
  return data;
}

export async function lookupOrder(orderId, email) {
  const res = await fetch(`${API_BASE}/orders/lookup?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Order not found');
  return data;
}

export async function adminLogin(password) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Authentication failed');
  return data;
}

export async function fetchAdminCards() {
  const res = await fetch(`${API_BASE}/admin/cards`);
  if (!res.ok) throw new Error('Failed to fetch admin inventory');
  return res.json();
}

export async function addAdminCard(cardData) {
  const res = await fetch(`${API_BASE}/admin/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add card');
  return data;
}

export async function updateAdminCard(id, updates) {
  const res = await fetch(`${API_BASE}/admin/cards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update card');
  return data;
}

export async function deleteAdminCard(id) {
  const res = await fetch(`${API_BASE}/admin/cards/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete card');
  return data;
}

export async function fetchAdminOrders() {
  const res = await fetch(`${API_BASE}/admin/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function seedAdminCards() {
  const res = await fetch(`${API_BASE}/admin/seed`, {
    method: 'POST'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reset inventory');
  return data;
}

// ----------------------------------------------------
// Customer Vault Wallet API Client
// ----------------------------------------------------

export async function accessWallet(email, name) {
  const res = await fetch(`${API_BASE}/wallet/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to access wallet');
  return data;
}

export async function fetchWallet(walletId) {
  const res = await fetch(`${API_BASE}/wallet/${encodeURIComponent(walletId)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch wallet');
  return data;
}

export async function depositWallet(payload) {
  const res = await fetch(`${API_BASE}/wallet/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Deposit failed');
  return data;
}

export async function checkoutWithWallet(payload) {
  const res = await fetch(`${API_BASE}/wallet/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Wallet checkout failed');
  return data;
}

export async function fetchAdminWallets() {
  const res = await fetch(`${API_BASE}/admin/wallets`);
  if (!res.ok) throw new Error('Failed to fetch wallets');
  return res.json();
}

export async function adjustAdminWallet(payload) {
  const res = await fetch(`${API_BASE}/admin/wallet/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to adjust wallet');
  return data;
}

