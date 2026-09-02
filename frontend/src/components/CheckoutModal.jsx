import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  Mail, 
  User, 
  AlertCircle,
  Copy, 
  Check, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw,
  Wallet,
  Zap,
  Plus
} from 'lucide-react';
import { checkout, checkoutWithWallet } from '../api';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cart, 
  onSuccess,
  wallet,
  setWallet,
  onOpenWallet
}) {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState(wallet?.name || '');
  const [customerEmail, setCustomerEmail] = useState(wallet?.email || '');
  
  // Payment rail: 'WALLET' | 'USDT' | 'BTC'
  const [paymentRail, setPaymentRail] = useState(wallet && wallet.balance > 0 ? 'WALLET' : 'USDT');
  const [usdtNetwork, setUsdtNetwork] = useState('TRC20'); // 'TRC20' or 'ERC20'
  const [copiedKey, setCopiedKey] = useState(null);

  const [txHashInput, setTxHashInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // Approximate BTC price
  const btcRate = 96450; 
  const btcAmount = (totalAmount / btcRate).toFixed(6);

  const depositAddresses = {
    USDT_TRC20: 'TLRjXjP7UaD24Qn88b9FwR399y7pM4HkYv',
    USDT_ERC20: '0x71C83647620633C1480D418a038fF41dFEE273c5',
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  };

  const currentAddress = paymentRail === 'BTC' 
    ? depositAddresses.BTC 
    : (usdtNetwork === 'TRC20' ? depositAddresses.USDT_TRC20 : depositAddresses.USDT_ERC20);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Please specify recipient name and delivery email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Option A: Pay with Vault Wallet Balance (1-Click Instant Bulk)
      if (paymentRail === 'WALLET') {
        if (!wallet) {
          setError('Vault Wallet not connected. Please connect your wallet first.');
          return;
        }
        if (wallet.balance < totalAmount) {
          setError(`Insufficient balance ($${wallet.balance.toFixed(2)}). Need $${(totalAmount - wallet.balance).toFixed(2)} more.`);
          return;
        }

        const data = await checkoutWithWallet({
          wallet_id: wallet.id,
          items: cart,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim()
        });

        if (data.success && data.order) {
          if (setWallet && data.wallet) {
            setWallet(data.wallet);
          }
          onSuccess(data.order);
        }
        return;
      }

      // Option B: Direct USDT / BTC Blockchain Settlement
      setVerifying(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const payload = {
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        payment_method: paymentRail === 'BTC' ? 'Bitcoin (BTC)' : `USDT (${usdtNetwork})`,
        items: cart
      };

      const data = await checkout(payload);
      if (data.success && data.order) {
        onSuccess(data.order);
      }
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const isWalletSufficient = wallet && wallet.balance >= totalAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-[#090b10] border border-white/20 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.1] bg-[#0c0f16]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/25 flex items-center justify-center text-white shadow-sm">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 tracking-wide font-display">
                  Settlement & Unmasking Gateway
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  INSTANT RELEASE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Bulk digital card checkout • Instant credential unmasking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center gap-2.5 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Recipient Details */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              1. Delivery Coordinates
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Client Alpha"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#06070a] border border-white/[0.1] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Delivery Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex@vault-client.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#06070a] border border-white/[0.1] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Select Payment Settlement Rail */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                2. Select Settlement Method
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                Total: <strong className="text-white font-bold">${totalAmount.toFixed(2)} USD</strong> ({cart.length} cards)
              </span>
            </div>

            {/* 3 Payment Options: Wallet (Instant), Direct USDT, Direct BTC */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              
              {/* Option A: Vault Wallet */}
              <button
                type="button"
                onClick={() => setPaymentRail('WALLET')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  paymentRail === 'WALLET'
                    ? 'pill-silver-active shadow-md'
                    : 'bg-[#0f121a] text-slate-300 hover:text-white border-white/[0.1]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Wallet className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span className="font-extrabold text-xs">Vault Wallet</span>
                </div>
                <span className="text-[10px] block font-mono">
                  {wallet ? `Bal: $${Number(wallet.balance).toFixed(2)}` : 'Connect & Pay'}
                </span>
                {isWalletSufficient && (
                  <span className="text-[8px] font-mono text-emerald-400 font-bold block mt-0.5">
                    ● 1-Click Instant
                  </span>
                )}
              </button>

              {/* Option B: Direct USDT */}
              <button
                type="button"
                onClick={() => setPaymentRail('USDT')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentRail === 'USDT'
                    ? 'pill-silver-active shadow-md'
                    : 'bg-[#0f121a] text-slate-300 hover:text-white border-white/[0.1]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[9px] font-bold">₮</span>
                  <span className="font-extrabold text-xs">Direct USDT</span>
                </div>
                <span className="text-[10px] block font-mono">
                  TRC20 / ERC20
                </span>
              </button>

              {/* Option C: Direct BTC */}
              <button
                type="button"
                onClick={() => setPaymentRail('BTC')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentRail === 'BTC'
                    ? 'pill-silver-active shadow-md'
                    : 'bg-[#0f121a] text-slate-300 hover:text-white border-white/[0.1]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[9px] font-bold">₿</span>
                  <span className="font-extrabold text-xs">Direct BTC</span>
                </div>
                <span className="text-[10px] block font-mono">
                  Bitcoin Mainnet
                </span>
              </button>

            </div>

            {/* DETAIL VIEW: Pay with Wallet Balance */}
            {paymentRail === 'WALLET' && (
              <div className="p-3.5 rounded-xl bg-[#06070a] border border-white/[0.12] space-y-2.5">
                {wallet ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
                        ACCOUNT ID: {wallet.id}
                      </span>
                      <span className="text-sm font-bold text-white font-mono">
                        Available Balance: ${Number(wallet.balance).toFixed(2)} USD
                      </span>
                    </div>

                    {!isWalletSufficient ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onOpenWallet) onOpenWallet();
                        }}
                        className="px-3 py-1.5 rounded-lg btn-silver text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Top Up Deposit</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Ready to Unmask
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-slate-300 mb-2">No Vault Wallet connected yet.</p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenWallet) onOpenWallet();
                      }}
                      className="px-4 py-2 rounded-xl btn-silver text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Connect / Deposit into Vault Wallet</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* DETAIL VIEW: Direct USDT */}
            {paymentRail === 'USDT' && (
              <div className="p-3.5 rounded-xl bg-[#06070a] border border-white/[0.12] space-y-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUsdtNetwork('TRC20')}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      usdtNetwork === 'TRC20'
                        ? 'bg-neutral-800 text-white border-white/40'
                        : 'bg-[#0f121a] text-slate-400 border-white/[0.08]'
                    }`}
                  >
                    TRC-20 (Tron • Fast & Low Fee)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsdtNetwork('ERC20')}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      usdtNetwork === 'ERC20'
                        ? 'bg-neutral-800 text-white border-white/40'
                        : 'bg-[#0f121a] text-slate-400 border-white/[0.08]'
                    }`}
                  >
                    ERC-20 (Ethereum)
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <span className="text-slate-400">Total USDT:</span>
                  <span className="font-bold text-white">${totalAmount.toFixed(2)} USDT</span>
                </div>

                <div className="flex items-center gap-2 bg-[#0c0f16] p-2 rounded-lg border border-white/[0.08]">
                  <span className="font-mono text-xs text-slate-200 truncate flex-1 select-all">
                    {currentAddress}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentAddress, 'pay_addr')}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedKey === 'pay_addr' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'pay_addr' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL VIEW: Direct BTC */}
            {paymentRail === 'BTC' && (
              <div className="p-3.5 rounded-xl bg-[#06070a] border border-white/[0.12] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">BTC Amount:</span>
                  <span className="font-bold text-white">{btcAmount} BTC (${totalAmount.toFixed(2)} USD)</span>
                </div>

                <div className="flex items-center gap-2 bg-[#0c0f16] p-2 rounded-lg border border-white/[0.08]">
                  <span className="font-mono text-xs text-slate-200 truncate flex-1 select-all">
                    {currentAddress}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentAddress, 'pay_addr')}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedKey === 'pay_addr' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'pay_addr' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* 3. Order Summary Plate */}
          <div className="p-3 rounded-xl bg-[#07090e] border border-white/[0.08] flex items-center justify-between text-xs">
            <span className="text-slate-400">Bulk Cards Unmasking ({cart.length}):</span>
            <span className="text-sm font-extrabold text-white font-mono">
              ${totalAmount.toFixed(2)} USD
            </span>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading || (paymentRail === 'WALLET' && !isWalletSufficient)}
            className="w-full py-3 px-4 rounded-xl font-extrabold text-xs btn-silver flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {verifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Verifying Ledger Settlement...</span>
              </>
            ) : paymentRail === 'WALLET' ? (
              <>
                <Zap className="w-4 h-4 text-black" />
                <span>1-Click Instant Bulk Pay (${totalAmount.toFixed(2)})</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>Confirm & Release {cart.length} Digital Cards</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-500 font-mono">
            Zero logs retained • Credentials displayed on screen immediately upon settlement
          </p>
        </form>

      </div>
    </div>
  );
}
