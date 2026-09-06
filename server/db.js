import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'giftcards.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for better concurrency
db.exec(`PRAGMA journal_mode = WAL;`);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS gift_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    country TEXT DEFAULT 'United States',
    face_value REAL NOT NULL,
    price REAL NOT NULL,
    card_number TEXT NOT NULL,
    pin TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'available',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    total_amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    card_id INTEGER NOT NULL,
    brand TEXT NOT NULL,
    title TEXT NOT NULL,
    country TEXT DEFAULT 'United States',
    face_value REAL NOT NULL,
    price REAL NOT NULL,
    card_number TEXT NOT NULL,
    pin TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT 'Vault Client',
    balance REAL DEFAULT 0.0,
    deposit_address_usdt_trc20 TEXT,
    deposit_address_usdt_erc20 TEXT,
    deposit_address_btc TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS wallet_transactions (
    id TEXT PRIMARY KEY,
    wallet_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    balance_after REAL NOT NULL,
    description TEXT,
    tx_hash TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(wallet_id) REFERENCES wallets(id)
  );
`);


// Safe migrations if tables already existed without country or bsc address
try {
  db.exec(`ALTER TABLE gift_cards ADD COLUMN country TEXT DEFAULT 'United States';`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE order_items ADD COLUMN country TEXT DEFAULT 'United States';`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE wallets ADD COLUMN deposit_address_usdt_bsc TEXT;`);
} catch (e) {}
try {
  db.exec(`
    UPDATE wallets SET 
      deposit_address_usdt_trc20 = 'TKsEPMVKQsPPo1mnoya6q11iVwTYNbus2n',
      deposit_address_usdt_bsc = '0xc68D11aEEB71306f53BC84858243E55fa72a66FC',
      deposit_address_usdt_erc20 = '0xc68D11aEEB71306f53BC84858243E55fa72a66FC',
      deposit_address_btc = 'bc1q2elvxghr55td9gag8sl64mwpddjzshqjcmxn56';
  `);
} catch (e) {}

// Completely unbranded luxury cards organized by Country
const initialSeedCards = [
  {
    country: 'United States',
    brand: 'United States',
    title: '$100 Digital Gift Card',
    category: 'United States',
    face_value: 100.00,
    price: 89.00,
    card_number: '7482-9901-4412-8830',
    pin: '9912',
    expiry_date: '10/29',
    image_url: 'usa',
    status: 'available'
  },
  {
    country: 'United States',
    brand: 'United States',
    title: '$200 Digital Gift Card',
    category: 'United States',
    face_value: 200.00,
    price: 175.00,
    card_number: '7482-1108-9923-4519',
    pin: '8391',
    expiry_date: '12/29',
    image_url: 'usa',
    status: 'available'
  },
  {
    country: 'United States',
    brand: 'United States',
    title: '$50 Digital Gift Card',
    category: 'United States',
    face_value: 50.00,
    price: 44.00,
    card_number: '4912-8834-0012-7721',
    pin: '7492',
    expiry_date: '12/28',
    image_url: 'usa',
    status: 'available'
  },
  {
    country: 'United Kingdom',
    brand: 'United Kingdom',
    title: '£100 Digital Gift Card',
    category: 'United Kingdom',
    face_value: 100.00,
    price: 88.00,
    card_number: '4912-7731-5582-9104',
    pin: '3829',
    expiry_date: '11/28',
    image_url: 'uk',
    status: 'available'
  },
  {
    country: 'United Kingdom',
    brand: 'United Kingdom',
    title: '£50 Digital Gift Card',
    category: 'United Kingdom',
    face_value: 50.00,
    price: 45.00,
    card_number: '5519-8823-1104-9928',
    pin: '4018',
    expiry_date: '08/28',
    image_url: 'uk',
    status: 'available'
  },
  {
    country: 'Canada',
    brand: 'Canada',
    title: '$100 Digital Gift Card',
    category: 'Canada',
    face_value: 100.00,
    price: 88.00,
    card_number: '5519-4481-9920-7734',
    pin: '6712',
    expiry_date: '06/28',
    image_url: 'canada',
    status: 'available'
  },
  {
    country: 'Canada',
    brand: 'Canada',
    title: '$50 Digital Gift Card',
    category: 'Canada',
    face_value: 50.00,
    price: 44.00,
    card_number: '3382-7719-2048-5591',
    pin: '2910',
    expiry_date: '09/27',
    image_url: 'canada',
    status: 'available'
  },
  {
    country: 'Australia',
    brand: 'Australia',
    title: '$100 Digital Gift Card',
    category: 'Australia',
    face_value: 100.00,
    price: 87.00,
    card_number: '3382-9901-4432-8812',
    pin: '8301',
    expiry_date: '05/28',
    image_url: 'australia',
    status: 'available'
  },
  {
    country: 'Australia',
    brand: 'Australia',
    title: '$50 Digital Gift Card',
    category: 'Australia',
    face_value: 50.00,
    price: 45.00,
    card_number: '8812-4402-9912-7710',
    pin: '5821',
    expiry_date: '11/29',
    image_url: 'australia',
    status: 'available'
  },
  {
    country: 'Germany',
    brand: 'Germany',
    title: '€100 Digital Gift Card',
    category: 'Germany',
    face_value: 100.00,
    price: 89.00,
    card_number: '8812-0034-7781-9923',
    pin: '4192',
    expiry_date: '12/30',
    image_url: 'germany',
    status: 'available'
  },
  {
    country: 'France',
    brand: 'France',
    title: '€50 Digital Gift Card',
    category: 'France',
    face_value: 50.00,
    price: 44.50,
    card_number: '6612-9983-2210-4491',
    pin: '1948',
    expiry_date: 'Never',
    image_url: 'france',
    status: 'available'
  },
  {
    country: 'United Arab Emirates',
    brand: 'United Arab Emirates',
    title: 'AED 200 Digital Gift Card',
    category: 'United Arab Emirates',
    face_value: 200.00,
    price: 180.00,
    card_number: '7710-3391-4402-1102',
    pin: '5930',
    expiry_date: 'Never',
    image_url: 'uae',
    status: 'available'
  },
  {
    country: 'Global',
    brand: 'Global',
    title: '$100 Universal Global Card',
    category: 'Global',
    face_value: 100.00,
    price: 85.00,
    card_number: '1102-8834-5519-9932',
    pin: '8201',
    expiry_date: 'Never',
    image_url: 'global',
    status: 'available'
  },
  {
    country: 'Global',
    brand: 'Global',
    title: '$50 Universal Global Card',
    category: 'Global',
    face_value: 50.00,
    price: 44.00,
    card_number: '9932-5501-8821-4491',
    pin: '9021',
    expiry_date: 'Never',
    image_url: 'global',
    status: 'available'
  },
  {
    country: 'Global',
    brand: 'Global',
    title: '$25 Universal Global Card',
    category: 'Global',
    face_value: 25.00,
    price: 22.00,
    card_number: '4491-0021-7734-8842',
    pin: '6629',
    expiry_date: '12/28',
    image_url: 'global',
    status: 'available'
  }
];

export function seedInitialData(force = false) {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM gift_cards').get();
  if (countRow.count === 0 || force) {
    if (force) {
      db.exec('DELETE FROM order_items; DELETE FROM orders; DELETE FROM gift_cards;');
    }
    const insertStmt = db.prepare(`
      INSERT INTO gift_cards (brand, title, category, country, face_value, price, card_number, pin, expiry_date, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const card of initialSeedCards) {
      insertStmt.run(
        card.brand,
        card.title,
        card.category,
        card.country || 'United States',
        card.face_value,
        card.price,
        card.card_number,
        card.pin,
        card.expiry_date,
        card.image_url,
        card.status
      );
    }
    console.log(`[Database] Seeded ${initialSeedCards.length} country-based gift cards.`);
  }
}

// Storefront: get available cards without sensitive numbers
export function getAvailableCardsStore() {
  const stmt = db.prepare(`
    SELECT id, brand, title, category, country, face_value, price, image_url, status, expiry_date, created_at
    FROM gift_cards
    WHERE status = 'available'
    ORDER BY id DESC
  `);
  return stmt.all();
}

// Admin: get all cards including card_number, pin, expiry_date, country, status
export function getAllCardsAdmin() {
  const stmt = db.prepare(`
    SELECT id, brand, title, category, country, face_value, price, card_number, pin, expiry_date, image_url, status, created_at
    FROM gift_cards
    ORDER BY id DESC
  `);
  return stmt.all();
}

// Get single card
export function getCardById(id) {
  const stmt = db.prepare(`SELECT * FROM gift_cards WHERE id = ?`);
  return stmt.get(Number(id));
}

// Admin: add a card
export function addCard({ brand, title, category, country, face_value, price, card_number, pin, expiry_date, image_url }) {
  const finalCountry = country ? country.trim() : (brand ? brand.trim() : 'United States');
  const finalBrand = brand ? brand.trim() : finalCountry;
  
  const stmt = db.prepare(`
    INSERT INTO gift_cards (brand, title, category, country, face_value, price, card_number, pin, expiry_date, image_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
  `);
  const result = stmt.run(
    finalBrand,
    title ? title.trim() : `$${face_value} Digital Card (${finalCountry})`,
    category ? category.trim() : finalCountry,
    finalCountry,
    Number(face_value),
    Number(price),
    card_number.trim(),
    pin.trim(),
    expiry_date ? expiry_date.trim() : 'Never',
    image_url || finalCountry.toLowerCase().replace(/[^a-z0-9]/g, '')
  );
  return getCardById(result.lastInsertRowid);
}

// Admin: update card details (including country, direct price changes, pin, gc number, exp)
export function updateCard(id, updates) {
  const current = getCardById(id);
  if (!current) return null;

  const brand = updates.brand !== undefined ? updates.brand : current.brand;
  const title = updates.title !== undefined ? updates.title : current.title;
  const category = updates.category !== undefined ? updates.category : current.category;
  const country = updates.country !== undefined ? updates.country : (current.country || 'United States');
  const face_value = updates.face_value !== undefined ? Number(updates.face_value) : current.face_value;
  const price = updates.price !== undefined ? Number(updates.price) : current.price;
  const card_number = updates.card_number !== undefined ? updates.card_number : current.card_number;
  const pin = updates.pin !== undefined ? updates.pin : current.pin;
  const expiry_date = updates.expiry_date !== undefined ? updates.expiry_date : current.expiry_date;
  const status = updates.status !== undefined ? updates.status : current.status;
  const image_url = updates.image_url !== undefined ? updates.image_url : current.image_url;

  const stmt = db.prepare(`
    UPDATE gift_cards
    SET brand = ?, title = ?, category = ?, country = ?, face_value = ?, price = ?,
        card_number = ?, pin = ?, expiry_date = ?, status = ?, image_url = ?
    WHERE id = ?
  `);

  stmt.run(
    brand,
    title,
    category,
    country,
    face_value,
    price,
    card_number,
    pin,
    expiry_date,
    status,
    image_url,
    Number(id)
  );

  return getCardById(id);
}

// Admin: delete card
export function deleteCard(id) {
  const stmt = db.prepare(`DELETE FROM gift_cards WHERE id = ?`);
  const result = stmt.run(Number(id));
  return result.changes > 0;
}

// Process checkout atomically
export function processCheckout({ customer_name, customer_email, payment_method, card_ids }) {
  if (!card_ids || card_ids.length === 0) {
    throw new Error('No card IDs provided');
  }

  const orderId = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);

  const purchasedCards = [];
  let totalAmount = 0;

  for (const cid of card_ids) {
    const card = db.prepare(`SELECT * FROM gift_cards WHERE id = ?`).get(Number(cid));
    if (!card) {
      throw new Error(`Card #${cid} not found`);
    }
    if (card.status !== 'available') {
      throw new Error(`Card "${card.title}" is no longer available.`);
    }
    purchasedCards.push(card);
    totalAmount += card.price;
  }

  db.exec('BEGIN TRANSACTION;');
  try {
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, customer_name, customer_email, total_amount, payment_method, status)
      VALUES (?, ?, ?, ?, ?, 'completed')
    `);
    insertOrder.run(orderId, customer_name.trim(), customer_email.trim(), totalAmount, payment_method || 'Card');

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, card_id, brand, title, country, face_value, price, card_number, pin, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateCardStatus = db.prepare(`UPDATE gift_cards SET status = 'sold' WHERE id = ?`);

    for (const card of purchasedCards) {
      insertItem.run(
        orderId,
        card.id,
        card.brand,
        card.title,
        card.country || 'United States',
        card.face_value,
        card.price,
        card.card_number,
        card.pin,
        card.expiry_date
      );
      updateCardStatus.run(card.id);
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  return getOrderById(orderId);
}

// Fetch order by ID
export function getOrderById(orderId) {
  const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId);
  if (!order) return null;

  const items = db.prepare(`
    SELECT id, card_id, brand, title, country, face_value, price, card_number, pin, expiry_date
    FROM order_items
    WHERE order_id = ?
  `).all(orderId);

  return { ...order, items };
}

// Fetch order for customer verification
export function getOrderForCustomer(orderId, customerEmail) {
  const order = db.prepare(`
    SELECT * FROM orders 
    WHERE UPPER(id) = UPPER(?) AND LOWER(customer_email) = LOWER(?)
  `).get(orderId.trim(), customerEmail.trim());

  if (!order) return null;

  const items = db.prepare(`
    SELECT id, card_id, brand, title, country, face_value, price, card_number, pin, expiry_date
    FROM order_items
    WHERE order_id = ?
  `).all(order.id);

  return { ...order, items };
}

// Admin: get all orders
export function getAllOrdersAdmin() {
  const orders = db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`).all();
  return orders.map(order => {
    const items = db.prepare(`
      SELECT id, card_id, brand, title, country, face_value, price, card_number, pin, expiry_date
      FROM order_items
      WHERE order_id = ?
    `).all(order.id);
    return { ...order, items };
  });
}

// Admin: get dashboard statistics
export function getStats() {
  const totalRevenueRow = db.prepare(`SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders`).get();
  const totalOrdersRow = db.prepare(`SELECT COUNT(*) as total_orders FROM orders`).get();
  const availableCardsRow = db.prepare(`SELECT COUNT(*) as available_count FROM gift_cards WHERE status = 'available'`).get();
  const soldCardsRow = db.prepare(`SELECT COUNT(*) as sold_count FROM gift_cards WHERE status = 'sold'`).get();

  const countryBreakdown = db.prepare(`
    SELECT country, COUNT(*) as count, SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available
    FROM gift_cards
    GROUP BY country
    ORDER BY count DESC
  `).all();

  return {
    total_revenue: totalRevenueRow.total_revenue,
    total_orders: totalOrdersRow.total_orders,
    available_cards: availableCardsRow.available_count,
    sold_cards: soldCardsRow.sold_count,
    country_breakdown: countryBreakdown
  };
}

// ----------------------------------------------------
// Customer Vault Wallet Functions (Bulk Deposit & Pay)
// ----------------------------------------------------

// Generate a clean Vault Account ID
function generateVaultId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `VAULT-${rand}-${randNum}`;
}

// Get or Create Customer Wallet by Email or ID
export function getOrCreateWallet(emailOrId, name = 'Vault Client') {
  const query = (emailOrId || '').trim();
  if (!query) throw new Error('Customer Email or Vault ID is required.');

  // Try finding by exact ID or email
  let wallet = db.prepare(`SELECT * FROM wallets WHERE id = ? OR LOWER(email) = LOWER(?)`).get(query, query);

  if (!wallet) {
    const isEmail = query.includes('@');
    const newEmail = isEmail ? query.toLowerCase() : `${query.toLowerCase()}@vault.client`;
    const newId = isEmail ? generateVaultId() : query.toUpperCase();

    // Dedicated institutional deposit addresses from user specifications
    const usdtTrc20 = 'TKsEPMVKQsPPo1mnoya6q11iVwTYNbus2n';
    const usdtBsc = '0xc68D11aEEB71306f53BC84858243E55fa72a66FC';
    const usdtErc20 = '0xc68D11aEEB71306f53BC84858243E55fa72a66FC';
    const btc = 'bc1q2elvxghr55td9gag8sl64mwpddjzshqjcmxn56';

    db.prepare(`
      INSERT INTO wallets (id, email, name, balance, deposit_address_usdt_trc20, deposit_address_usdt_bsc, deposit_address_usdt_erc20, deposit_address_btc)
      VALUES (?, ?, ?, 0.0, ?, ?, ?, ?)
    `).run(newId, newEmail, name, usdtTrc20, usdtBsc, usdtErc20, btc);

    wallet = db.prepare(`SELECT * FROM wallets WHERE id = ?`).get(newId);

  }

  // Get recent transactions for this wallet
  const transactions = db.prepare(`
    SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(wallet.id);

  return { ...wallet, transactions };
}

// Get Wallet by ID
export function getWalletById(walletId) {
  const wallet = db.prepare(`SELECT * FROM wallets WHERE id = ?`).get(walletId);
  if (!wallet) return null;

  const transactions = db.prepare(`
    SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(wallet.id);

  return { ...wallet, transactions };
}

// Deposit Funds to Customer Wallet
export function depositToWallet(walletId, amount, txHash = '', paymentMethod = 'USDT (TRC20)') {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Deposit amount must be greater than $0.');
  }

  const wallet = db.prepare(`SELECT * FROM wallets WHERE id = ?`).get(walletId);
  if (!wallet) {
    throw new Error('Wallet not found.');
  }

  const newBalance = Number((wallet.balance + numAmount).toFixed(2));
  const txId = `TX-DEP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  // Update wallet balance and record transaction
  db.prepare(`UPDATE wallets SET balance = ?, updated_at = datetime('now') WHERE id = ?`).run(newBalance, walletId);

  db.prepare(`
    INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, tx_hash)
    VALUES (?, ?, 'deposit', ?, ?, ?, ?)
  `).run(
    txId,
    walletId,
    numAmount,
    newBalance,
    `Deposit via ${paymentMethod}`,
    txHash || `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  );

  return getWalletById(walletId);
}

// Pay for Bulk Cards with Customer Wallet Balance (Instant 1-Click)
export function payWithWallet(walletId, items, customerName, customerEmail) {
  if (!items || !items.length) {
    throw new Error('No cards selected for purchase.');
  }

  const wallet = db.prepare(`SELECT * FROM wallets WHERE id = ?`).get(walletId);
  if (!wallet) {
    throw new Error('Vault Wallet not found.');
  }

  // Calculate total amount and verify card availability
  let totalAmount = 0;
  const cardObjects = [];

  for (const item of items) {
    const card = db.prepare(`SELECT * FROM gift_cards WHERE id = ?`).get(item.id);
    if (!card) {
      throw new Error(`Card ID ${item.id} no longer exists in vault.`);
    }
    if (card.status !== 'available') {
      throw new Error(`"${card.brand} - $${card.face_value}" has already been sold.`);
    }
    totalAmount += card.price;
    cardObjects.push(card);
  }

  totalAmount = Number(totalAmount.toFixed(2));

  // Check if wallet balance is sufficient
  if (wallet.balance < totalAmount) {
    const needed = (totalAmount - wallet.balance).toFixed(2);
    throw new Error(`Insufficient wallet balance. Total: $${totalAmount.toFixed(2)}, Balance: $${wallet.balance.toFixed(2)}. Deposit $${needed} more to complete bulk checkout.`);
  }

  const newBalance = Number((wallet.balance - totalAmount).toFixed(2));
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Deduct wallet balance
  db.prepare(`UPDATE wallets SET balance = ?, updated_at = datetime('now') WHERE id = ?`).run(newBalance, walletId);

  // 2. Record wallet transaction
  const txId = `TX-PUR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  db.prepare(`
    INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, tx_hash)
    VALUES (?, ?, 'purchase', ?, ?, ?, ?)
  `).run(
    txId,
    walletId,
    -totalAmount,
    newBalance,
    `Bulk purchase of ${cardObjects.length} card(s) - Order ${orderId}`,
    orderId
  );

  // 3. Create Order
  db.prepare(`
    INSERT INTO orders (id, customer_name, customer_email, total_amount, payment_method, status)
    VALUES (?, ?, ?, ?, 'Vault Wallet Balance', 'completed')
  `).run(orderId, customerName || wallet.name, customerEmail || wallet.email, totalAmount);

  // 4. Mark cards as sold & save order items
  for (const card of cardObjects) {
    db.prepare(`UPDATE gift_cards SET status = 'sold' WHERE id = ?`).run(card.id);

    db.prepare(`
      INSERT INTO order_items (order_id, card_id, brand, title, country, face_value, price, card_number, pin, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      card.id,
      card.brand,
      card.title,
      card.country || 'United States',
      card.face_value,
      card.price,
      card.card_number,
      card.pin,
      card.expiry_date
    );
  }

  const order = getOrderForCustomer(orderId, customerEmail || wallet.email);
  const updatedWallet = getWalletById(walletId);

  return {
    order,
    wallet: updatedWallet
  };
}

// Admin: Get all customer wallets
export function getAllWalletsAdmin() {
  const wallets = db.prepare(`SELECT * FROM wallets ORDER BY balance DESC, updated_at DESC`).all();
  return wallets.map(w => {
    const transactions = db.prepare(`
      SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT 10
    `).all(w.id);
    return { ...w, transactions };
  });
}

// Admin: Adjust wallet balance manually
export function adminAdjustWalletBalance(walletId, amount, reason = 'Admin Adjustment') {
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    throw new Error('Invalid adjustment amount.');
  }

  const wallet = db.prepare(`SELECT * FROM wallets WHERE id = ?`).get(walletId);
  if (!wallet) throw new Error('Wallet not found.');

  const newBalance = Math.max(0, Number((wallet.balance + numAmount).toFixed(2)));
  const txId = `TX-ADM-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  db.prepare(`UPDATE wallets SET balance = ?, updated_at = datetime('now') WHERE id = ?`).run(newBalance, walletId);

  db.prepare(`
    INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, tx_hash)
    VALUES (?, ?, 'admin_adjustment', ?, ?, ?, ?)
  `).run(
    txId,
    walletId,
    numAmount,
    newBalance,
    reason,
    `ADMIN-ADJ-${Date.now()}`
  );

  return getWalletById(walletId);
}

// Initialize seed data
seedInitialData();

export default db;

