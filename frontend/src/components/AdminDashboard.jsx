import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  DollarSign, 
  Package, 
  CheckCircle, 
  ShoppingBag, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Save, 
  RotateCcw, 
  Search, 
  Sliders, 
  ShieldAlert, 
  Layers, 
  Sparkles,
  Calendar,
  Lock,
  CreditCard,
  Tag,
  AlertCircle
} from 'lucide-react';
import { 
  fetchAdminCards, 
  addAdminCard, 
  updateAdminCard, 
  deleteAdminCard, 
  fetchAdminOrders, 
  fetchAdminStats, 
  seedAdminCards,
  fetchAdminWallets,
  adjustAdminWallet
} from '../api';
import { getBrandTheme } from '../utils/brandStyles';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'add', 'orders', 'wallets'
  const [cards, setCards] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Wallet adjustment modal state
  const [adjustingWallet, setAdjustingWallet] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('Admin Deposit');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Search & Filters in Inventory Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'available', 'sold'

  // Inline Price Editing State: { [cardId]: editedPriceValue }
  const [editingPrices, setEditingPrices] = useState({});
  const [savingPriceId, setSavingPriceId] = useState(null);

  // Full Edit Modal State
  const [editingCard, setEditingCard] = useState(null);

  // Masking toggles for codes in inventory
  const [revealedNumbers, setRevealedNumbers] = useState({});
  const [revealedPins, setRevealedPins] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  // Add Card Form State
  const [newCard, setNewCard] = useState({
    brand: 'Black Edition',
    title: '$100 Digital Gift Card',
    category: 'VIP Black Tier',
    face_value: '100.00',
    price: '89.00',
    card_number: '',
    pin: '',
    expiry_date: '12/28',
    image_url: 'black'
  });
  const [isAddingCard, setIsAddingCard] = useState(false);

  // Countries / Regions
  const popularCountries = [
    { name: 'United States', flag: '🇺🇸' },
    { name: 'United Kingdom', flag: '🇬🇧' },
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'Germany', flag: '🇩🇪' },
    { name: 'France', flag: '🇫🇷' },
    { name: 'United Arab Emirates', flag: '🇦🇪' },
    { name: 'Global', flag: '🌍' }
  ];

  // Load all dashboard data
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [cardsRes, ordersRes, statsRes, walletsRes] = await Promise.all([
        fetchAdminCards(),
        fetchAdminOrders(),
        fetchAdminStats(),
        fetchAdminWallets()
      ]);

      if (cardsRes.success) setCards(cardsRes.cards);
      if (ordersRes.success) setOrders(ordersRes.orders);
      if (statsRes.success) setStats(statsRes.stats);
      if (walletsRes.success) setWallets(walletsRes.wallets);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Inline Price change handler
  const handlePriceInputChange = (cardId, value) => {
    setEditingPrices(prev => ({
      ...prev,
      [cardId]: value
    }));
  };

  // Save updated price directly
  const handleSavePrice = async (card) => {
    const newPriceVal = editingPrices[card.id];
    if (newPriceVal === undefined || newPriceVal === '') return;

    const numPrice = parseFloat(newPriceVal);
    if (isNaN(numPrice) || numPrice < 0) {
      showToast('Please enter a valid price amount.');
      return;
    }

    try {
      setSavingPriceId(card.id);
      const res = await updateAdminCard(card.id, { price: numPrice });
      if (res.success) {
        setCards(prev => prev.map(c => c.id === card.id ? res.card : c));
        // clear temporary edit state
        setEditingPrices(prev => {
          const copy = { ...prev };
          delete copy[card.id];
          return copy;
        });
        showToast(`Price for "${card.brand}" updated to $${numPrice.toFixed(2)}`);
        // Refresh stats
        const s = await fetchAdminStats();
        if (s.success) setStats(s.stats);
      }
    } catch (err) {
      alert('Error updating price: ' + err.message);
    } finally {
      setSavingPriceId(null);
    }
  };

  // Add Card Submission
  const handleAddCardSubmit = async (e) => {
    e.preventDefault();
    if (!newCard.brand || !newCard.card_number.trim() || !newCard.pin.trim()) {
      alert('Brand, Card Number, and Security PIN are required.');
      return;
    }

    try {
      setIsAddingCard(true);
      const res = await addAdminCard(newCard);
      if (res.success) {
        showToast(`Successfully added "${newCard.brand}" gift card to vault!`);
        // reset card number and pin for safety
        setNewCard(prev => ({
          ...prev,
          card_number: '',
          pin: '',
          title: `$${newCard.face_value} ${newCard.brand} Gift Card`
        }));
        await loadData();
        setActiveTab('inventory');
      }
    } catch (err) {
      alert('Failed to add card: ' + err.message);
    } finally {
      setIsAddingCard(false);
    }
  };

  // Delete Card
  const handleDeleteCard = async (id, brand) => {
    if (!window.confirm(`Are you sure you want to delete this ${brand} gift card?`)) return;
    try {
      const res = await deleteAdminCard(id);
      if (res.success) {
        setCards(prev => prev.filter(c => c.id !== id));
        showToast('Card deleted from inventory.');
        const s = await fetchAdminStats();
        if (s.success) setStats(s.stats);
      }
    } catch (err) {
      alert('Error deleting card: ' + err.message);
    }
  };

  // Save Full Card Edit Modal
  const handleSaveModalEdit = async (e) => {
    e.preventDefault();
    if (!editingCard) return;

    try {
      const res = await updateAdminCard(editingCard.id, {
        brand: editingCard.brand,
        title: editingCard.title,
        category: editingCard.category,
        face_value: parseFloat(editingCard.face_value),
        price: parseFloat(editingCard.price),
        card_number: editingCard.card_number,
        pin: editingCard.pin,
        expiry_date: editingCard.expiry_date,
        status: editingCard.status
      });

      if (res.success) {
        setCards(prev => prev.map(c => c.id === editingCard.id ? res.card : c));
        setEditingCard(null);
        showToast('Card details successfully saved.');
        const s = await fetchAdminStats();
        if (s.success) setStats(s.stats);
      }
    } catch (err) {
      alert('Error updating card: ' + err.message);
    }
  };

  // Reset demo cards
  const handleResetData = async () => {
    if (!window.confirm('Reset and reload default demo gift cards? This will restore initial stock.')) return;
    try {
      setLoading(true);
      await seedAdminCards();
      await loadData();
      showToast('Demo gift cards restored!');
    } catch (err) {
      alert('Reset failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter cards in inventory
  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBrand = c.brand.toLowerCase().includes(q);
        const matchNumber = c.card_number?.toLowerCase().includes(q);
        const matchTitle = c.title?.toLowerCase().includes(q);
        if (!matchBrand && !matchNumber && !matchTitle) return false;
      }
      return true;
    });
  }, [cards, statusFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Admin Top Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/[0.15] text-slate-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Hollywood Reborn Management Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Admin Inventory & Pricing Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Add card codes, security PINs, set expiration dates, and adjust selling prices in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors"
            title="Reset to initial sample stock"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white" />
            <span>Reset Demo Stock</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3.5 py-2 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">
              ${Number(stats.total_revenue).toFixed(2)}
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">
              Live customer sales
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Cards In Stock</span>
              <Package className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-extrabold text-white">
              {stats.available_cards}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Ready for instant purchase
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Sold Gift Cards</span>
              <CheckCircle className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-extrabold text-blue-400">
              {stats.sold_cards}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Delivered to customers
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Orders Placed</span>
              <ShoppingBag className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-extrabold text-purple-400">
              {stats.total_orders}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Completed transactions
            </p>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'pill-silver-active shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Inventory & Price Editor ({cards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'add'
              ? 'pill-silver-active shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Gift Card</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'pill-silver-active shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders Log ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wallets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'wallets'
              ? 'pill-silver-active shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Customer Wallets ({wallets.length})</span>
        </button>
      </div>


      {/* ============================================================== */}
      {/* TAB 1: INVENTORY & CHANGE PRICE                                */}
      {/* ============================================================== */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search brand, card title, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
                {['all', 'available', 'sold'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                      statusFilter === status
                        ? 'pill-silver-active'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-bold">Country & Card</th>
                    <th className="px-4 py-3 font-bold">Card Number</th>
                    <th className="px-4 py-3 font-bold">Exp Date</th>
                    <th className="px-4 py-3 font-bold">Security PIN</th>
                    <th className="px-4 py-3 font-bold">Face Value</th>
                    <th className="px-4 py-3 font-bold bg-white/[0.04] text-slate-200 border-x border-white/[0.1]">
                      Selling Price (Change Here)
                    </th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredCards.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No cards found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCards.map((card) => {
                      const isNumberRevealed = !!revealedNumbers[card.id];
                      const isPinRevealed = !!revealedPins[card.id];
                      const theme = getBrandTheme(card.brand);

                      // Current inline price input value or existing price
                      const currentInputValue = editingPrices[card.id] !== undefined
                        ? editingPrices[card.id]
                        : card.price;
                      const hasPriceChanged = editingPrices[card.id] !== undefined && Number(editingPrices[card.id]) !== Number(card.price);

                      return (
                        <tr key={card.id} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Brand & Card */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0`}>
                                {theme.symbol}
                              </div>
                              <div>
                                <span className="font-bold text-white block truncate max-w-[140px]">
                                  {card.brand}
                                </span>
                                <span className="text-[11px] text-slate-400 truncate max-w-[140px] block">
                                  {card.title}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Card Number with toggle reveal and copy */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-slate-200 tracking-wider">
                                {isNumberRevealed ? card.card_number : '•••• •••• ' + (card.card_number.slice(-4) || '••••')}
                              </span>
                              <button
                                type="button"
                                onClick={() => setRevealedNumbers(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                                className="text-slate-500 hover:text-white p-1"
                                title={isNumberRevealed ? 'Mask' : 'Reveal Card Number'}
                              >
                                {isNumberRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopy(card.card_number, `card-${card.id}`)}
                                className="text-slate-500 hover:text-white p-1"
                                title="Copy Card Number"
                              >
                                {copiedKey === `card-${card.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Expiration Date */}
                          <td className="px-4 py-3.5">
                            <span className="text-xs text-slate-300 font-medium">
                              {card.expiry_date || 'Never'}
                            </span>
                          </td>

                          {/* Security PIN with toggle reveal and copy */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-200">
                                {isPinRevealed ? card.pin : '••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setRevealedPins(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                                className="text-slate-500 hover:text-white p-1"
                                title={isPinRevealed ? 'Mask' : 'Reveal PIN'}
                              >
                                {isPinRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopy(card.pin, `pin-${card.id}`)}
                                className="text-slate-500 hover:text-white p-1"
                                title="Copy PIN"
                              >
                                {copiedKey === `pin-${card.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Face Value */}
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-semibold text-slate-400">
                              ${Number(card.face_value).toFixed(2)}
                            </span>
                          </td>

                          {/* Selling Price - INLINE DIRECT EDITING */}
                          <td className="px-4 py-3.5 bg-white/[0.04] border-x border-white/[0.1]">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={currentInputValue}
                                onChange={(e) => handlePriceInputChange(card.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSavePrice(card);
                                }}
                                className="w-24 px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20"
                                title="Type new price and click Save Price"
                              />
                              {hasPriceChanged && (
                                <button
                                  type="button"
                                  onClick={() => handleSavePrice(card)}
                                  disabled={savingPriceId === card.id}
                                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg btn-silver font-bold text-[11px] cursor-pointer"
                                  title="Save price change"
                                >
                                  {savingPriceId === card.id ? (
                                    <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <>
                                      <Save className="w-3 h-3" />
                                      <span>Save</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            {card.status === 'available' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                Sold
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right space-x-1">
                            <button
                              onClick={() => setEditingCard({ ...card })}
                              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Full Edit (Card Number, PIN, Expiration, Brand, etc.)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCard(card.id, card.brand)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete Card"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ADD GIFT CARD (Card Number, Exp, PIN, Price)           */}
      {/* ============================================================== */}
      {activeTab === 'add' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Form (2 cols) */}
          <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <h3 className="text-lg font-bold text-white">Add New Gift Card to Vault</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter card number, expiration date, security PIN, face value, and set your selling price.
              </p>
            </div>

            {/* Quick Country Selector Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Country / Region (Quick Select)
              </label>
              <div className="flex flex-wrap gap-2">
                {popularCountries.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setNewCard(prev => ({
                        ...prev,
                        brand: c.name,
                        country: c.name,
                        category: c.name,
                        title: `$${prev.face_value || '100'} Digital Card (${c.name})`,
                        image_url: c.name.toLowerCase().replace(/\s+/g, '')
                      }));
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      newCard.brand === c.name
                        ? 'pill-silver-active'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddCardSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Country / Region *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. United States, United Kingdom, Canada"
                    value={newCard.brand}
                    onChange={(e) => setNewCard(prev => ({ ...prev, brand: e.target.value, country: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Card Title / Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $100 Amazon eGift Card"
                    value={newCard.title}
                    onChange={(e) => setNewCard(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              {/* CARD NUMBER, EXPIRATION DATE, SECURITY PIN */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Lock className="w-4 h-4 text-white" />
                  <span>Card Security Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Card Number */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Card Number *</span>
                      <button
                        type="button"
                        onClick={() => {
                          const mock = Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);
                          setNewCard(prev => ({ ...prev, card_number: mock }));
                        }}
                        className="text-[10px] text-white hover:text-slate-200 font-normal cursor-pointer"
                      >
                        Auto-generate code
                      </button>
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 7482-9901-4412-8830"
                        value={newCard.card_number}
                        onChange={(e) => setNewCard(prev => ({ ...prev, card_number: e.target.value }))}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>

                  {/* Expiration Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Expiration Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="MM/YY or Never"
                        value={newCard.expiry_date}
                        onChange={(e) => setNewCard(prev => ({ ...prev, expiry_date: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>

                  {/* Security PIN */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Security PIN *</span>
                      <button
                        type="button"
                        onClick={() => {
                          const mockPin = Math.floor(1000 + Math.random() * 9000).toString();
                          setNewCard(prev => ({ ...prev, pin: mockPin }));
                        }}
                        className="text-[10px] text-white hover:text-slate-200 font-normal"
                      >
                        Auto-PIN
                      </button>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 7492"
                        value={newCard.pin}
                        onChange={(e) => setNewCard(prev => ({ ...prev, pin: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newCard.category}
                      onChange={(e) => setNewCard(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="VIP Black Tier">VIP Black Tier</option>
                      <option value="Gold Tier">Gold Tier</option>
                      <option value="Platinum Tier">Platinum Tier</option>
                      <option value="Titanium Tier">Titanium Tier</option>
                      <option value="Diamond Tier">Diamond Tier</option>
                      <option value="Universal Tier">Universal Tier</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* FACE VALUE & SELLING PRICE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Face Value ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="100.00"
                    value={newCard.face_value}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewCard(prev => ({
                        ...prev,
                        face_value: val,
                        title: `$${val || '0'} ${prev.brand} Gift Card`
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center justify-between">
                    <span>Selling Price ($) *</span>
                    {Number(newCard.face_value) > Number(newCard.price) && (
                      <span className="text-[11px] text-emerald-400 font-bold">
                        Save ${(Number(newCard.face_value) - Number(newCard.price)).toFixed(2)} (-{Math.round(((newCard.face_value - newCard.price) / newCard.face_value) * 100)}%)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="89.00"
                    value={newCard.price}
                    onChange={(e) => setNewCard(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/40/50 rounded-xl text-xs font-extrabold text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAddingCard}
                className="w-full py-3 px-4 rounded-xl font-extrabold text-sm btn-silver flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAddingCard ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Gift Card to Vault</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Live Preview (1 col) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Live Card Mockup Preview</span>
            </h4>

            {/* Render realistic card mockup preview */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              {(() => {
                const previewTheme = getBrandTheme(newCard.brand);
                return (
                  <div className={`relative h-48 rounded-2xl overflow-hidden p-5 bg-gradient-to-br ${previewTheme.gradient} border ${previewTheme.border} shadow-2xl flex flex-col justify-between select-none`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/5 opacity-40 pointer-events-none" />
                    
                    {/* Header: Chip & Brand */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-7 rounded-md bg-gradient-to-br ${previewTheme.chip} border p-1 flex flex-col justify-between shadow-md`}>
                          <div className="border-b border-black/30 w-full h-[1px]" />
                          <div className="border-b border-black/30 w-full h-[1px]" />
                          <div className="border-b border-black/30 w-full h-[1px]" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                          HOLLYWOOD REBORN
                        </span>
                      </div>
                      <div className="text-right flex items-center gap-1.5 opacity-60">
                        <span className="text-[9px] font-black tracking-[0.25em] uppercase text-white/80">
                          VAULT
                        </span>
                        <span className="text-white text-xs">✦</span>
                      </div>
                    </div>

                    {/* Middle: NAME IS KEPT BLANK! Only Card Number */}
                    <div className="relative z-10 my-auto py-2">
                      <span className="text-[9px] uppercase tracking-widest text-white/60 font-semibold block mb-1">
                        CARD NUMBER
                      </span>
                      <span className="font-mono text-base font-black tracking-[0.18em] text-white drop-shadow-md">
                        {newCard.card_number || '•••• •••• •••• ••••'}
                      </span>
                    </div>

                    {/* Footer: EXP & CVV / PIN (NO NAME) */}
                    <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/10 text-white">
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-white/60 block font-bold">
                          EXP
                        </span>
                        <span className="font-mono text-xs font-black text-white tracking-wider">
                          {newCard.expiry_date || '12/28'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[8px] uppercase tracking-wider text-white/60 block font-bold">
                          CVV / PIN
                        </span>
                        <span className="font-mono text-xs font-black text-white tracking-wider">
                          {newCard.pin || '•••'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Card Number:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {newCard.card_number || '(Enter code)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Security PIN:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {newCard.pin || '(Enter PIN)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Selling Price:</span>
                  <span className="font-bold text-emerald-400">
                    ${Number(newCard.price || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CUSTOMER ORDERS LOG                                     */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-bold">Order ID</th>
                  <th className="px-4 py-3 font-bold">Customer</th>
                  <th className="px-4 py-3 font-bold">Payment Method</th>
                  <th className="px-4 py-3 font-bold">Delivered Cards & Codes</th>
                  <th className="px-4 py-3 font-bold">Total Paid</th>
                  <th className="px-4 py-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No customer orders have been placed yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Order ID */}
                      <td className="px-4 py-3.5 font-mono font-bold text-white">
                        {ord.id}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-white block">{ord.customer_name}</span>
                        <span className="text-[11px] text-slate-400 block">{ord.customer_email}</span>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium">
                          {ord.payment_method}
                        </span>
                      </td>

                      {/* Delivered Cards */}
                      <td className="px-4 py-3.5 space-y-1">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] space-y-0.5">
                            <div className="flex justify-between font-bold text-slate-200">
                              <span>{item.brand} ({item.title})</span>
                              <span className="text-white">${Number(item.price).toFixed(2)}</span>
                            </div>
                            <div className="font-mono text-slate-400 flex items-center gap-3">
                              <span>Code: <strong className="text-white">{item.card_number}</strong></span>
                              <span>PIN: <strong className="text-slate-200">{item.pin}</strong></span>
                            </div>
                          </div>
                        ))}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3.5 font-extrabold text-emerald-400 text-sm">
                        ${Number(ord.total_amount).toFixed(2)}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {ord.created_at}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CUSTOMER WALLETS & BULK DEPOSITS                        */}
      {/* ============================================================== */}
      {activeTab === 'wallets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-display">Customer Vault Wallets</h3>
              <p className="text-xs text-slate-400">Manage client balances, verify crypto deposits, and credit accounts for bulk purchases.</p>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Ledgers</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Vault Account ID</th>
                  <th className="px-4 py-3.5">Client & Email</th>
                  <th className="px-4 py-3.5">Available Balance</th>
                  <th className="px-4 py-3.5">Deposit Addresses</th>
                  <th className="px-4 py-3.5">Created</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {wallets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-slate-500 text-xs">
                      No customer wallets registered yet.
                    </td>
                  </tr>
                ) : (
                  wallets.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-white">
                        {w.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-200 block">{w.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{w.email}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-extrabold text-sm text-emerald-400">
                          ${Number(w.balance || 0).toFixed(2)} USD
                        </span>
                      </td>
                      <td className="px-4 py-3.5 space-y-1">
                        <div className="text-[10px] font-mono text-slate-400">
                          <span>USDT TRC20: </span>
                          <span className="text-slate-300">{w.deposit_address_usdt_trc20?.slice(0, 10)}...</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          <span>BTC: </span>
                          <span className="text-slate-300">{w.deposit_address_btc?.slice(0, 10)}...</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {w.created_at}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setAdjustingWallet(w);
                            setAdjustAmount('100.00');
                            setAdjustReason('Manual Admin Credit');
                          }}
                          className="px-3 py-1.5 rounded-xl btn-silver text-xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>Adjust Balance</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* ============================================================== */}
      {/* FULL EDIT CARD MODAL                                           */}
      {/* ============================================================== */}
      {editingCard && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-white" />
                <h3 className="text-base font-bold text-white">Edit Gift Card #{editingCard.id}</h3>
              </div>
              <button
                onClick={() => setEditingCard(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveModalEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={editingCard.brand}
                    onChange={(e) => setEditingCard(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingCard.category}
                    onChange={(e) => setEditingCard(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editingCard.title}
                  onChange={(e) => setEditingCard(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              {/* Codes */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    value={editingCard.card_number}
                    onChange={(e) => setEditingCard(prev => ({ ...prev, card_number: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">Security PIN</label>
                    <input
                      type="text"
                      required
                      value={editingCard.pin}
                      onChange={(e) => setEditingCard(prev => ({ ...prev, pin: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Expiration Date</label>
                    <input
                      type="text"
                      value={editingCard.expiry_date}
                      onChange={(e) => setEditingCard(prev => ({ ...prev, expiry_date: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Face Value ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingCard.face_value}
                    onChange={(e) => setEditingCard(prev => ({ ...prev, face_value: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingCard.price}
                    onChange={(e) => setEditingCard(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/40/50 rounded-xl text-xs font-bold text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={editingCard.status}
                    onChange={(e) => setEditingCard(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold btn-silver cursor-pointer"
                >
                  Save Changes
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADJUST WALLET BALANCE MODAL                                    */}
      {/* ============================================================== */}
      {adjustingWallet && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Adjust Wallet Balance</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{adjustingWallet.id} • {adjustingWallet.email}</p>
                </div>
              </div>
              <button
                onClick={() => setAdjustingWallet(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setIsAdjusting(true);
                  const res = await adjustAdminWallet({
                    wallet_id: adjustingWallet.id,
                    amount: parseFloat(adjustAmount),
                    reason: adjustReason.trim() || 'Admin Adjustment'
                  });
                  if (res.success) {
                    showToast(`Successfully adjusted wallet ${adjustingWallet.id}!`);
                    setAdjustingWallet(null);
                    await loadData();
                  }
                } catch (err) {
                  alert('Adjustment failed: ' + err.message);
                } finally {
                  setIsAdjusting(false);
                }
              }}
              className="p-5 space-y-4"
            >
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">Current Balance:</span>
                <span className="font-mono text-base font-extrabold text-emerald-400">
                  ${Number(adjustingWallet.balance || 0).toFixed(2)} USD
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Adjustment Amount ($USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 500.00 (or -50 to deduct)"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-slate-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Enter positive number to credit (deposit), or negative to deduct.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason / Reference Note
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Crypto deposit confirmed TXID..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingWallet(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold btn-silver cursor-pointer"
                >
                  {isAdjusting ? 'Processing...' : 'Apply Balance Change'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

