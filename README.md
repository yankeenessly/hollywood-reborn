# 💎 Hollywood Reborn - Luxury Unbranded Digital Card Vault

A full-stack, institutional-grade web application and digital card platform built with **React, Tailwind CSS, Express, and SQLite**, featuring a 3D luxury design system, multi-rail crypto payments (USDT & BTC), customer deposit vault wallets with 1-click bulk purchasing, and a comprehensive real-time admin management portal.

---

## 🌟 Key Features

- **3D Luxury Interface**: Multi-layer 3D floating digital card presentation with realistic 3D EMV microchip, holographic security stamp, dynamic light gleams, and interactive 3D card flip.
- **Unbranded Digital Cards**: Complete isolation with no customer name on the card face. Displays only the 16-digit card number, expiration date, and CVV with secure eye reveal.
- **Multi-Rail Crypto Settlement**: Direct settlement via **Tether (USDT TRC-20 & ERC-20)** and **Bitcoin (BTC Mainnet)**.
- **Customer Vault Wallets**:
  - Zero-KYC unique Vault Account IDs (e.g., `VAULT-8X92-4910`).
  - Pre-deposit funds for **⚡ 1-Click Instant Bulk Purchasing** across all jurisdictions without waiting for blockchain confirmations.
  - Auto-syncing ledger history with running balance verification.
- **Full-Featured Admin Management Portal**:
  - Live inventory tracking & real-time inline price editor.
  - Add, edit, or delete digital cards with unmasked credential management.
  - Orders log with unmasked customer delivery details.
  - Customer wallets ledger with manual balance crediting / debiting.
- **Production & 24/7 PM2 VPS Setup**: Automated Nginx reverse proxy and Cloudflare Argo Tunnel support.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, Native SQLite (`node:sqlite` WAL mode)
- **Process Management**: PM2
- **Networking**: Cloudflare Argo Tunnel & Nginx Reverse Proxy

---

## 📦 Project Structure

```
.
├── frontend/             # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/   # UI components (HeroBanner, Navbar, CardGrid, CardItem,
│   │   │                 # WalletModal, CheckoutModal, CartDrawer, AdminDashboard, etc.)
│   │   ├── utils/        # Theme & styling utilities
│   │   ├── api.js        # Frontend API client
│   │   ├── App.jsx       # Root application component
│   │   └── index.css     # 3D luxury styles & animation keyframes
│   ├── package.json
│   └── vite.config.js
├── server/               # Express + SQLite backend
│   ├── db.js             # SQLite schema, atomic transactions & wallet operations
│   ├── server.js         # API route handlers & static file serving
│   └── package.json
├── tools/                # Deployment configuration & tunnel scripts
├── deploy-vps.sh         # One-click Ubuntu VPS setup script
├── package.json          # Root orchestration script
└── README.md
```

---

## 🛠️ Getting Started Locally

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm

### 1. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Build Frontend & Start Server
```bash
# Build frontend bundle
npm run build

# Start backend server
npm start
```
The server will start on `http://localhost:5000`.

---

## 🛡️ Admin Access

- **Admin Portal**: Click **Admin Portal** in the navigation bar or footer.
- **Default Password**: `admin123` (configurable via `ADMIN_PASSWORD` environment variable).

---

## 📄 License

MIT License
