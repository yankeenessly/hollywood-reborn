import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  X, 
  CreditCard,
  Printer
} from 'lucide-react';
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

export default function OrderSuccessModal({ order, onClose }) {
  if (!order) return null;

  // Toggle reveal states per card item
  const [revealedCards, setRevealedCards] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const toggleReveal = (index) => {
    setRevealedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#040507]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#0a0c12] border border-white/[0.15] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Silver & Black */}
        <div className="p-6 border-b border-white/[0.08] flex items-start justify-between bg-[#06070a]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/[0.08] border border-white/25 flex items-center justify-center text-white shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                <span>Settlement Complete • Credentials Released</span>
              </div>
              <h2 className="text-lg font-bold text-white font-display">Order Confirmation</h2>
              <p className="text-xs text-slate-400">
                Card credentials assigned to <span className="text-white font-semibold">{order.customer_email}</span>
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

        {/* Order Reference Badge - Silver & Black */}
        <div className="px-6 py-3 bg-[#08090d] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Order ID:</span>
            <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/25">
              {order.id}
            </span>
            <button
              onClick={() => handleCopy(order.id, 'order-id')}
              className="text-slate-400 hover:text-white cursor-pointer"
              title="Copy Order ID"
            >
              {copiedKey === 'order-id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs">
            <span>Recipient: <strong className="text-slate-200">{order.customer_name}</strong></span>
            <span>Asset: <strong className="text-slate-200 font-mono px-1.5 py-0.5 rounded bg-white/10 border border-white/15">{order.payment_method || 'USDT'}</strong></span>
            <span>Settlement: <strong className="text-white font-mono font-bold">${Number(order.total_amount).toFixed(2)} USD</strong></span>
          </div>
        </div>

        {/* Unlocked Cards List */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Allocated Cards ({order.items?.length || 0})
            </h3>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full credentials active & ready for redemption</span>
            </p>
          </div>

          {order.items?.map((item, index) => {
            const isRevealed = !!revealedCards[item.id || index];
            const theme = getBrandTheme(item.brand);

            return (
              <div 
                key={item.id || index}
                className="rounded-xl bg-[#06070a] border border-white/[0.1] p-4 space-y-3 shadow-md relative overflow-hidden"
              >
                {/* Card Banner */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{getCountryFlag(item.country || item.brand)}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.country || item.brand} Digital Card</h4>
                      <p className="text-[11px] text-slate-400">{item.title}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Face Value</span>
                    <span className="text-xs font-bold text-white font-mono">
                      ${Number(item.face_value).toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Credentials Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  
                  {/* Card Number */}
                  <div className="p-3 rounded-lg bg-[#0c0e15] border border-white/[0.08] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                        <CreditCard className="w-3.5 h-3.5 text-white" />
                        Card Number
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleReveal(item.id || index)}
                        className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="font-mono text-sm font-bold text-white tracking-widest truncate">
                        {isRevealed ? item.card_number : '•••• •••• •••• ' + (item.card_number.slice(-4) || '••••')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.card_number, `card-${index}`)}
                        className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
                        title="Copy Card Number"
                      >
                        {copiedKey === `card-${index}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Security PIN & Expiry */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* CVV / PIN */}
                    <div className="p-3 rounded-lg bg-[#0c0e15] border border-white/[0.08] flex flex-col justify-between">
                      <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-300">Security CVV</span>
                        <button
                          type="button"
                          onClick={() => toggleReveal(item.id || index)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                          title="Toggle reveal"
                        >
                          {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-sm font-bold text-white tracking-widest">
                          {isRevealed ? item.pin : '•••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.pin, `pin-${index}`)}
                          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Copy Security PIN"
                        >
                          {copiedKey === `pin-${index}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expiry */}
                    <div className="p-3 rounded-lg bg-[#0c0e15] border border-white/[0.08] flex flex-col justify-between">
                      <span className="text-xs text-slate-400 font-semibold mb-1">Exp Date</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-sm font-bold text-white tracking-widest">
                          {item.expiry_date || '12/28'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.expiry_date || '12/28', `exp-${index}`)}
                          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Copy Expiration Date"
                        >
                          {copiedKey === `exp-${index}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions - Silver & Black */}
        <div className="p-6 border-t border-white/[0.08] bg-[#06070a] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 text-center sm:text-left">
            <span>Keep this Order ID stored for future lookup and receipts.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-neutral-900 border border-white/[0.12] transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Certificate</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl font-bold text-xs btn-silver cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
