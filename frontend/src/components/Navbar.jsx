import React from 'react';
import { 
  ShoppingBag, 
  Search, 
  ShieldCheck, 
  Receipt, 
  SlidersHorizontal,
  Store,
  Lock,
  Globe,
  Wallet
} from 'lucide-react';

export default function Navbar({ 
  activeView, 
  setActiveView, 
  cartCount, 
  setIsCartOpen, 
  setIsOrderLookupOpen, 
  searchQuery, 
  setSearchQuery,
  isAdminLoggedIn,
  setIsAdminLoginOpen,
  wallet,
  setIsWalletOpen
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#06070a]/95 border-b border-white/[0.1] shadow-xl">
      
      {/* Top Institutional Status Bar */}
      <div className="border-b border-white/[0.06] bg-[#090b10] px-3 sm:px-4 py-1 text-[10px] sm:text-[11px] text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-300 tracking-wider text-[9px] sm:text-[10px] uppercase font-mono">
              Cold Vault: Online
            </span>
            <span className="hidden sm:inline text-neutral-600">•</span>
            <span className="hidden md:inline text-slate-400 text-[11px]">
              Instant USDT & BTC Settlement • Bulk Wallet Ready
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] sm:text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" /> 
              <span>Zero KYC</span>
            </span>
            <span className="hidden sm:inline text-neutral-600">•</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-400">
              <Lock className="w-3 h-3 text-slate-300 shrink-0" /> 
              <span>Cold Storage</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Geometric Brand Emblem & Title */}
        <div 
          onClick={() => setActiveView('store')}
          className="flex items-center gap-2 sm:gap-3.5 cursor-pointer select-none group shrink-0"
        >
          {/* Silver Crest Emblem */}
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#242834] via-[#151720] to-[#08090d] border border-white/30 p-1.5 shadow flex items-center justify-center group-hover:border-white/70 transition-all duration-200">
            <svg 
              viewBox="0 0 24 24" 
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white transition-transform duration-200 group-hover:scale-105" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.75" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polygon points="12 2 20 6.5 20 17.5 12 22 4 17.5 4 6.5 12 2" />
              <path d="M12 6v12" strokeWidth="1.25" strokeDasharray="1 2" />
              <path d="M8 10h8" />
              <path d="M8 14h8" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold tracking-wider text-white font-display">
                HOLLYWOOD
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold tracking-widest uppercase px-1 py-0.2 rounded bg-white/10 border border-white/20 text-slate-200 font-mono">
                REBORN
              </span>
            </div>
            <p className="text-[8px] sm:text-[9px] tracking-widest text-slate-400 uppercase font-medium">
              Digital Card Vault
            </p>
          </div>
        </div>

        {/* Global Desktop Search Bar */}
        {activeView === 'store' && (
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search cards by country or price..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-[#0c0e14] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40 font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Vault Customer Wallet Pill */}
          {setIsWalletOpen && (
            <button
              onClick={() => setIsWalletOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold bg-[#11141e] hover:bg-[#181c2b] text-slate-200 hover:text-white rounded-xl border border-white/20 transition-all cursor-pointer shadow-sm group"
              title="Open customer deposit wallet for instant bulk buying"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Wallet:</span>
              <span className="font-mono font-bold text-white text-[11px] sm:text-xs">
                ${Number(wallet?.balance || 0).toFixed(2)}
              </span>
            </button>
          )}

          {/* Order Tracking */}
          <button
            onClick={() => setIsOrderLookupOpen(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl border border-white/[0.1] transition-colors cursor-pointer"
            title="Retrieve purchased card credentials"
          >
            <Receipt className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="hidden md:inline">Track</span>
          </button>

          {/* View Switcher: Store vs Admin */}
          {activeView === 'store' ? (
            <button
              onClick={() => {
                if (isAdminLoggedIn) {
                  setActiveView('admin');
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl border border-white/[0.1] transition-colors cursor-pointer"
              title="Admin Vault Management"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="hidden lg:inline">Admin</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveView('store')}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold bg-white/10 text-white hover:bg-white/20 rounded-xl border border-white/25 transition-colors cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Store</span>
            </button>
          )}

          {/* Cart Button */}
          {activeView === 'store' && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 btn-silver rounded-xl transition-all text-xs cursor-pointer group shrink-0 shadow-md"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:mr-1.5 text-[#060709] shrink-0" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 ? (
                <span className="ml-1 sm:ml-1.5 bg-[#060709] text-slate-100 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              ) : (
                <span className="ml-1 sm:ml-1.5 text-slate-700 text-[10px] font-bold">
                  0
                </span>
              )}
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
