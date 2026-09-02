import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import CardGrid from './components/CardGrid';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import OrderLookupModal from './components/OrderLookupModal';
import WalletModal from './components/WalletModal';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import { fetchStoreCards, fetchWallet, accessWallet } from './api';
import { ShieldCheck, Sparkles, Zap, Heart, CheckCircle2, Wallet } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('store'); // 'store' | 'admin'
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [cardsError, setCardsError] = useState('');

  // Search and Category
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Customer Vault Wallet state
  const [wallet, setWallet] = useState(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  // Cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Load available cards from server
  const loadCards = async () => {
    try {
      setLoadingCards(true);
      setCardsError('');
      const data = await fetchStoreCards();
      if (data.success) {
        setCards(data.cards);
      }
    } catch (err) {
      setCardsError(err.message || 'Unable to connect to card server');
    } finally {
      setLoadingCards(false);
    }
  };

  // Restore or initialize customer wallet session
  const initWallet = async () => {
    try {
      const savedWalletId = localStorage.getItem('hollywood_wallet_id');
      const savedEmail = localStorage.getItem('hollywood_wallet_email');

      if (savedWalletId) {
        const data = await fetchWallet(savedWalletId);
        if (data.success && data.wallet) {
          setWallet(data.wallet);
          return;
        }
      }
      
      // If no saved wallet, create/access a demo VIP wallet for immediate smooth user testing
      const defaultEmail = savedEmail || 'vip-client@hollywood.reborn';
      const accessData = await accessWallet(defaultEmail, 'VIP Vault Client');
      if (accessData.success && accessData.wallet) {
        setWallet(accessData.wallet);
        localStorage.setItem('hollywood_wallet_id', accessData.wallet.id);
        localStorage.setItem('hollywood_wallet_email', accessData.wallet.email);
      }
    } catch (e) {
      console.warn('Wallet initialization error:', e);
    }
  };

  useEffect(() => {
    loadCards();
    initWallet();
  }, []);

  // Cart operations
  const handleAddToCart = (card) => {
    if (cart.some(item => item.id === card.id)) {
      setCart(cart.filter(item => item.id !== card.id));
      showToast(`Removed "${card.brand}" from cart`);
    } else {
      setCart([...cart, card]);
      showToast(`Added "${card.brand}" to bulk cart!`);
    }
  };

  const handleBuyNow = (card) => {
    if (!cart.some(item => item.id === card.id)) {
      setCart([...cart, card]);
    }
    setIsCheckoutOpen(true);
  };

  const handleRemoveFromCart = (cardId) => {
    setCart(cart.filter(item => item.id !== cardId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = (order) => {
    // Clear purchased items from cart
    const purchasedIds = new Set(order.items.map(item => item.card_id));
    setCart(prev => prev.filter(c => !purchasedIds.has(c.id)));
    // Show order success modal
    setCompletedOrder(order);
    // Reload cards to reflect sold status
    loadCards();
    // Refresh wallet balance if wallet was used
    if (wallet) {
      fetchWallet(wallet.id).then(res => {
        if (res.success && res.wallet) setWallet(res.wallet);
      }).catch(() => {});
    }
  };

  const handleOrderFound = (order) => {
    setCompletedOrder(order);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setActiveView('admin');
    showToast('Admin access unlocked!');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setActiveView('store');
    showToast('Logged out of Admin Panel');
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 flex flex-col selection:bg-slate-700 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0d1017] border border-white/20 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-slate-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        cartCount={cart.length}
        setIsCartOpen={setIsCartOpen}
        setIsOrderLookupOpen={setIsOrderLookupOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdminLoggedIn={isAdminLoggedIn}
        setIsAdminLoginOpen={setIsAdminLoginOpen}
        wallet={wallet}
        setIsWalletOpen={setIsWalletOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'store' ? (
          <>
            {/* Hero & Value Props */}
            <HeroBanner
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onOpenLookup={() => setIsOrderLookupOpen(true)}
            />

            {/* Catalog Grid */}
            <CardGrid
              cards={cards}
              loading={loadingCards}
              error={cardsError}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              cart={cart}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </>
        ) : (
          /* Admin View */
          <AdminDashboard onLogout={handleAdminLogout} />
        )}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
        wallet={wallet}
        onOpenWallet={() => setIsWalletOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onSuccess={handleCheckoutSuccess}
        wallet={wallet}
        setWallet={setWallet}
        onOpenWallet={() => setIsWalletOpen(true)}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        wallet={wallet}
        setWallet={setWallet}
        onDepositSuccess={(updatedWallet) => {
          showToast(`Wallet credited! Balance: $${Number(updatedWallet.balance).toFixed(2)} USD`);
        }}
      />

      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />

      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
        onOrderFound={handleOrderFound}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Global Luxury Footer */}
      <footer className="border-t border-white/[0.08] bg-[#040508] py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200 tracking-wider font-display">
              HOLLYWOOD REBORN
            </span>
            <span className="text-slate-600">•</span>
            <span>Unbranded Digital Card Vault</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsWalletOpen(true)}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vault Wallet (${Number(wallet?.balance || 0).toFixed(2)})</span>
            </button>

            <button
              onClick={() => setIsOrderLookupOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Order Lookup
            </button>

            <button
              onClick={() => {
                if (isAdminLoggedIn) {
                  setActiveView('admin');
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
