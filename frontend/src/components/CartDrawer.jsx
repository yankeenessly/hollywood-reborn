import React from 'react';
import { X, Trash2, ShieldCheck, ArrowRight, ShoppingBag, Lock, Wallet, Zap, Plus } from 'lucide-react';
import { getBrandTheme } from '../utils/brandStyles';

function getCountryFlag(country = '') {
  const c = (country || '').toLowerCase();
  if (c.includes('united states') || c.includes('usa')) return '🇺🇸';
  if (c.includes('united kingdom') || c.includes('uk')) return '🇬🇧';
  if (c.includes('canada')) return '🇨🇦';
  if (c.includes('australia')) return '🇦🇺';
  if (c.includes('germany')) return '🇩🇪';
  if (c.includes('france')) return '🇫🇷';
  if (c.includes('emirates') || c.includes('uae')) return '🇦🇪';
  return '🌐';
}

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cart, 
  onRemoveFromCart, 
  onClearCart, 
  onProceedToCheckout,
  wallet,
  onOpenWallet
}) {
  if (!isOpen) return null;

  const totalOriginal = cart.reduce((sum, item) => sum + (Number(item.face_value) || 0), 0);
  const totalPay = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const totalSavings = totalOriginal > totalPay ? (totalOriginal - totalPay).toFixed(2) : 0;
  const isWalletSufficient = wallet && wallet.balance >= totalPay;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-[#040507]/85 backdrop-blur-md transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0a0c12] border-l border-white/[0.1] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#06070a]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/[0.12] flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide font-display">Bulk Cart Queue</h2>
                <p className="text-[10px] text-slate-400 font-mono">
                  {cart.length} {cart.length === 1 ? 'card queued' : 'cards queued'} for instant unmasking
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Wallet Balance Bar inside Drawer */}
          <div className="px-4 sm:px-5 py-2.5 bg-[#0c0e16] border-b border-white/[0.08] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-semibold text-[11px]">Vault Wallet:</span>
              <span className="font-mono font-bold text-white text-xs">
                ${Number(wallet?.balance || 0).toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenWallet) onOpenWallet();
              }}
              className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{wallet ? 'Top Up' : 'Connect Wallet'}</span>
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/[0.08] flex items-center justify-center mx-auto text-slate-500 mb-3">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-200">Your bulk cart is empty</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Select digital cards from the catalog to queue for instant 1-click bulk checkout.
                </p>
              </div>
            ) : (
              cart.map((item) => {
                const theme = getBrandTheme(item.brand || item.category);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#06070a] border border-white/[0.08] hover:border-white/[0.18] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.gradient} border border-white/20 flex items-center justify-center font-bold text-sm shadow-md shrink-0`}>
                        <span className="text-base">{getCountryFlag(item.country || item.brand)}</span>
                      </div>

                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate max-w-[170px]">
                          {item.country || item.brand} Card
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                          ${Number(item.face_value).toFixed(0)} Value • {item.expiry_date || '12/28'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-white">
                            ${Number(item.price).toFixed(2)}
                          </span>
                          {Number(item.face_value) > Number(item.price) && (
                            <span className="text-[10px] text-slate-500 line-through">
                              ${Number(item.face_value).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveFromCart(item.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#06070a] space-y-3.5">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Face Value Total:</span>
                  <span className="text-slate-200 font-mono">${totalOriginal.toFixed(2)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-slate-300 font-semibold">
                    <span>Total Discount:</span>
                    <span className="font-mono text-emerald-400">-${totalSavings}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/[0.08]">
                  <span>Total Settlement:</span>
                  <span className="text-white text-base font-mono font-bold">${totalPay.toFixed(2)}</span>
                </div>
              </div>

              {/* 1-Click Pay or Proceed */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3 px-4 rounded-xl font-extrabold text-xs btn-silver flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {isWalletSufficient ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-black" />
                    <span>1-Click Bulk Pay with Wallet (${totalPay.toFixed(2)})</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Bulk Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </>
                )}
              </button>

              <button
                onClick={onClearCart}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
