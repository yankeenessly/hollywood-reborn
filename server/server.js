import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import {
  getAvailableCardsStore,
  getAllCardsAdmin,
  getCardById,
  addCard,
  updateCard,
  deleteCard,
  processCheckout,
  getOrderForCustomer,
  getAllOrdersAdmin,
  getStats,
  seedInitialData,
  getOrCreateWallet,
  getWalletById,
  depositToWallet,
  payWithWallet,
  getAllWalletsAdmin,
  adminAdjustWalletBalance
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Admin password
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// ----------------------------------------------------
// Public Storefront Endpoints
// ----------------------------------------------------

// Get all available cards for customers (safe: no codes/PINs)
app.get('/api/cards', (req, res) => {
  try {
    const cards = getAvailableCardsStore();
    res.json({ success: true, cards });
  } catch (error) {
    console.error('Error fetching store cards:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Checkout and digital delivery
app.post('/api/checkout', (req, res) => {
  try {
    const { customer_name, customer_email, payment_method, card_ids } = req.body;

    if (!customer_name || !customer_email) {
      return res.status(400).json({ success: false, message: 'Name and email are required for delivery.' });
    }

    if (!card_ids || !Array.isArray(card_ids) || card_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one gift card.' });
    }

    const order = processCheckout({
      customer_name,
      customer_email,
      payment_method: payment_method || 'Credit/Debit Card',
      card_ids
    });

    res.json({
      success: true,
      message: 'Order completed successfully! Your gift card credentials are ready.',
      order
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Order lookup for customer retrieval
app.get('/api/orders/lookup', (req, res) => {
  try {
    const { orderId, email } = req.query;
    if (!orderId || !email) {
      return res.status(400).json({ success: false, message: 'Both Order ID and Email are required.' });
    }

    const order = getOrderForCustomer(orderId, email);
    if (!order) {
      return res.status(404).json({ success: false, message: 'No matching order found for this Order ID and Email.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Order lookup error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// Customer Vault Wallet Endpoints (Bulk Balance & Pay)
// ----------------------------------------------------

// Access or create customer wallet by email or ID
app.post('/api/wallet/access', (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email or Vault ID is required.' });
    }
    const wallet = getOrCreateWallet(email, name);
    res.json({ success: true, wallet });
  } catch (error) {
    console.error('Wallet access error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get wallet details & balance by ID
app.get('/api/wallet/:id', (req, res) => {
  try {
    const wallet = getWalletById(req.params.id);
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Vault Wallet not found.' });
    }
    res.json({ success: true, wallet });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Deposit funds to wallet via USDT/BTC
app.post('/api/wallet/deposit', (req, res) => {
  try {
    const { wallet_id, amount, tx_hash, payment_method } = req.body;
    if (!wallet_id || !amount) {
      return res.status(400).json({ success: false, message: 'Wallet ID and deposit amount are required.' });
    }
    const updatedWallet = depositToWallet(wallet_id, amount, tx_hash, payment_method);
    res.json({
      success: true,
      message: `Deposit of $${Number(amount).toFixed(2)} successfully credited to your vault wallet!`,
      wallet: updatedWallet
    });
  } catch (error) {
    console.error('Wallet deposit error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Instant 1-Click Bulk Purchase with Wallet Balance
app.post('/api/wallet/checkout', (req, res) => {
  try {
    const { wallet_id, items, customer_name, customer_email } = req.body;
    if (!wallet_id || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Wallet ID and items are required for checkout.' });
    }
    const result = payWithWallet(wallet_id, items, customer_name, customer_email);
    res.json({
      success: true,
      message: 'Bulk cards successfully purchased and unmasked with Vault Wallet Balance!',
      order: result.order,
      wallet: result.wallet
    });
  } catch (error) {
    console.error('Wallet checkout error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// Admin Endpoints
// ----------------------------------------------------

// Admin authentication
app.post('/api/admin/login', (req, res) => {

  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      token: 'admin-auth-valid-session',
      message: 'Admin access granted'
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid admin password. Default is admin123' });
});

// Admin: Get all inventory cards (with GC number, pin, exp, status)
app.get('/api/admin/cards', (req, res) => {
  try {
    const cards = getAllCardsAdmin();
    res.json({ success: true, cards });
  } catch (error) {
    console.error('Admin fetch cards error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Add new gift card (GC Number, Exp Date, Security PIN, Face Value, Price)
app.post('/api/admin/cards', (req, res) => {
  try {
    const {
      brand,
      title,
      category,
      country,
      face_value,
      price,
      card_number,
      pin,
      expiry_date,
      image_url
    } = req.body;

    const finalCountry = country || brand || 'United States';

    if (!card_number || !pin || face_value === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Card Number, Security PIN, Face Value, and Price are required.'
      });
    }

    const newCard = addCard({
      brand: finalCountry,
      title: title || `$${face_value} Digital Card (${finalCountry})`,
      category: category || finalCountry,
      country: finalCountry,
      face_value: parseFloat(face_value),
      price: parseFloat(price),
      card_number,
      pin,
      expiry_date: expiry_date || 'Never',
      image_url
    });

    res.json({
      success: true,
      message: 'Gift card successfully added to inventory!',
      card: newCard
    });
  } catch (error) {
    console.error('Admin add card error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update card (includes changing price directly, changing pin, exp, gc number, etc.)
app.put('/api/admin/cards/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = updateCard(id, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    res.json({
      success: true,
      message: 'Card updated successfully!',
      card: updated
    });
  } catch (error) {
    console.error('Admin update card error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete card
app.delete('/api/admin/cards/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = deleteCard(id);

    if (!success) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    res.json({ success: true, message: 'Card removed from inventory.' });
  } catch (error) {
    console.error('Admin delete card error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all customer orders
app.get('/api/admin/orders', (req, res) => {
  try {
    const orders = getAllOrdersAdmin();
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Admin fetch orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Dashboard stats
app.get('/api/admin/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Admin fetch stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all customer wallets
app.get('/api/admin/wallets', (req, res) => {
  try {
    const wallets = getAllWalletsAdmin();
    res.json({ success: true, wallets });
  } catch (error) {
    console.error('Admin fetch wallets error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Manual wallet balance adjustment
app.post('/api/admin/wallet/adjust', (req, res) => {
  try {
    const { wallet_id, amount, reason } = req.body;
    if (!wallet_id || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Wallet ID and adjustment amount are required.' });
    }
    const updatedWallet = adminAdjustWalletBalance(wallet_id, amount, reason);
    res.json({
      success: true,
      message: `Wallet ${wallet_id} balance adjusted by $${Number(amount).toFixed(2)}`,
      wallet: updatedWallet
    });
  } catch (error) {
    console.error('Admin wallet adjust error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});


// Admin: Seed or reset demo data
app.post('/api/admin/seed', (req, res) => {
  try {
    seedInitialData(true);
    res.json({ success: true, message: 'Database reset and re-seeded with demo gift cards.' });
  } catch (error) {
    console.error('Admin seed error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve frontend build if dist exists
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log(`📦 Serving static frontend from ${distPath}`);
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 GiftCard API Server listening on port ${PORT}`);
  console.log(`🛒 Storefront API: http://localhost:${PORT}/api/cards`);
  console.log(`🛡️ Admin API: http://localhost:${PORT}/api/admin/cards`);
  console.log(`=========================================`);
});
