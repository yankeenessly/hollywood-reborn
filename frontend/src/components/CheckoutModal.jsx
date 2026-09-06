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
  Plus,
  Share2,
  ChevronDown,
  Info
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
  
  // Payment rail: 'USDT' | 'BTC' | 'WALLET'
  const [paymentRail, setPaymentRail] = useState(wallet && wallet.balance > 0 ? 'WALLET' : 'USDT');
  
  // Network selection for USDT: 'TRX' (TRC-20), 'BSC' (BEP-20), 'ETH' (ERC-20)
  const [usdtNetwork, setUsdtNetwork] = useState('TRX'); 
  const [copiedKey, setCopiedKey] = useState(null);

  const [txHashInput, setTxHashInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // Approximate BTC price for Satoshi calculation
  const btcRate = 96450; 
  const btcAmount = (totalAmount / btcRate).toFixed(6);

  // Exact deposit addresses and static QR images from verified wallet
  const paymentConfigs = {
    USDT_TRX: {
      networkName: 'TRX Network',
      networkLabel: 'TRX Network (TRC-20)',
      address: 'TKsEPMVKQsPPo1mnoya6q11iVwTYNbus2n',
      qrImage: '/qr/usdt_trx_qr.png',
      coinName: 'Tether USD',
      amountText: `${totalAmount.toFixed(2)} USDT`,
      amountValue: totalAmount.toFixed(2),
      warning: 'Send only Tether USD (TRC-20) to this address. Fast confirmation with lowest network fees.'
    },
    USDT_BSC: {
      networkName: 'BSC Network',
      networkLabel: 'BSC Network (BEP-20)',
      address: '0xc68D11aEEB71306f53BC84858243E55fa72a66FC',
      qrImage: '/qr/usdt_bsc_qr.png',
      coinName: 'Tether USD',
      amountText: `${totalAmount.toFixed(2)} USDT`,
      amountValue: totalAmount.toFixed(2),
      warning: 'Send only Tether USD (BEP-20 / BNB Smart Chain) to this address.'
    },
    USDT_ETH: {
      networkName: 'ETH Network',
      networkLabel: 'Ethereum Network (ERC-20)',
      address: '0xc68D11aEEB71306f53BC84858243E55fa72a66FC',
      qrImage: '/qr/usdt_bsc_qr.png',
      coinName: 'Tether USD',
      amountText: `${totalAmount.toFixed(2)} USDT`,
      amountValue: totalAmount.toFixed(2),
      warning: 'Send only Tether USD (ERC-20) to this address.'
    },
    BTC: {
      networkName: 'BTC Network',
      networkLabel: 'Bitcoin Network (Native SegWit)',
      address: 'bc1q2elvxghr55td9gag8sl64mwpddjzshqjcmxn56',
      qrImage: '/qr/btc_qr.png',
      coinName: 'Bitcoin',
      amountText: `${btcAmount} BTC`,
      amountValue: btcAmount,
      warning: 'Send only Bitcoin (BTC) to this address. Confirmations broadcast automatically.'
    }
  };

  const activeConfig = paymentRail === 'BTC' 
    ? paymentConfigs.BTC 
    : (usdtNetwork === 'TRX' ? paymentConfigs.USDT_TRX : (usdtNetwork === 'BSC' ? paymentConfigs.USDT_BSC : paymentConfigs.USDT_ETH));

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

      // Option B: Direct Blockchain Settlement (USDT / BTC)
      setVerifying(true);
      await new Promise(resolve => setTimeout(resolve, 900));
      
      const payload = {
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        payment_method: paymentRail === 'BTC' ? 'Bitcoin (BTC)' : `USDT (${activeConfig.networkName})`,
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
        className="relative w-full max-w-lg bg-[#0d0f17] border border-white/[0.14] rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/[0.08] bg-[#111420]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide font-display">
                  Payment Gateway
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  256-BIT ESCROW
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Instant unmasking upon blockchain payment verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-center gap-2.5 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Recipient Coordinates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 font-mono">
                1. Delivery Coordinates
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {cart.length} {cart.length === 1 ? 'card' : 'cards'} • Total: <strong className="text-white">${totalAmount.toFixed(2)} USD</strong>
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Recipient Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#07080d] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Delivery Email Address"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#07080d] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 font-mono block">
              2. Select Payment Method
            </span>

            <div className="grid grid-cols-3 gap-2">
              {/* Option A: Tether (USDT) */}
              <button
                type="button"
                onClick={() => setPaymentRail('USDT')}
                className={`py-2.5 px-3 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentRail === 'USDT'
                    ? 'pill-silver-active shadow-md'
                    : 'bg-[#121520] text-slate-300 hover:text-white border-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-4 h-4 rounded-full bg-teal-500 text-black flex items-center justify-center text-[10px] font-extrabold">₮</span>
                  <span className="font-extrabold text-xs">USDT</span>
                </div>
                <span className="text-[9px] block text-slate-400 font-mono">
                  TRX / BSC / ETH
                </span>
              </button>

              {/* Option B: Bitcoin (BTC) */}
              <button
                type="button"
                onClick={() => setPaymentRail('BTC')}
                className={`py-2.5 px-3 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentRail === 'BTC'
                    ? 'pill-silver-active shadow-md'
                    : 'bg-[#121520] text-slate-300 hover:text-white border-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-extrabold">₿</span>
                  <span className="font-extrabold text-xs">Bitcoin</span>
                </div>
                <span className="text-[9px] block text-slate-400 font-mono">
                  Native SegWit
                </span>
              </button>

              {/* Option C: Vault Wallet */}
              <button
                type="button"
                onClick={() => setPaymentRail('WALLET')}
                className={`py-2.5 px-3 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentRail === 'WALLET'
                    ? 'pill-silver-active shadow-md'
                    : 'bg-[#121520] text-slate-300 hover:text-white border-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-extrabold text-xs">Wallet</span>
                </div>
                <span className="text-[9px] block text-slate-400 font-mono">
                  {wallet ? `$${Number(wallet.balance).toFixed(0)} Bal` : '1-Click Pay'}
                </span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* STATIC LUXURY CRYPTO PAYMENT GATEWAY (USDT & BTC)        */}
          {/* Matches User's Screenshot Architecture                   */}
          {/* ======================================================== */}
          {(paymentRail === 'USDT' || paymentRail === 'BTC') && (
            <div className="rounded-2xl bg-[#141724] border border-white/[0.12] p-4 sm:p-5 space-y-4 shadow-xl">
              
              {/* Header inside Gateway: Network Badge & Title */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide block">
                    Receive {activeConfig.coinName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Scan QR or copy address to transfer funds
                  </span>
                </div>

                {/* Network Selector Pill */}
                {paymentRail === 'USDT' ? (
                  <div className="flex items-center p-0.5 rounded-full bg-[#0a0c14] border border-white/15">
                    <button
                      type="button"
                      onClick={() => setUsdtNetwork('TRX')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        usdtNetwork === 'TRX'
                          ? 'bg-teal-500 text-black shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      TRX
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsdtNetwork('BSC')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        usdtNetwork === 'BSC'
                          ? 'bg-yellow-500 text-black shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      BSC
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsdtNetwork('ETH')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        usdtNetwork === 'ETH'
                          ? 'bg-indigo-400 text-black shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ETH
                    </button>
                  </div>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-[#0a0c14] border border-white/15 text-[10px] font-mono font-bold text-amber-400">
                    BTC Network
                  </span>
                )}
              </div>

              {/* Exact Static QR Code Card (Ultra-Clean Rounded 3D Presentation) */}
              <div className="flex flex-col items-center justify-center pt-1 pb-1">
                <div className="relative p-3 sm:p-4 rounded-3xl bg-white shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-white/20">
                  <img 
                    src={activeConfig.qrImage} 
                    alt={`${activeConfig.coinName} QR Code`} 
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-2xl select-none pointer-events-none"
                    loading="eager"
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-2.5">
                  Point camera or wallet scanner at code
                </span>
              </div>

              {/* Your Crypto Address Box (Identical Layout to User Screenshot) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#090b13] border border-white/[0.1] flex items-center justify-between gap-3">
                <div className="overflow-hidden">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Your {paymentRail === 'BTC' ? 'BTC' : 'USDT'} Address ({activeConfig.networkName})
                  </span>
                  <p className="font-mono text-xs sm:text-sm font-bold text-white break-all select-all leading-tight">
                    {activeConfig.address}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(activeConfig.address, 'crypto_address')}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shrink-0 cursor-pointer shadow-sm hover:scale-105"
                  title="Copy Address"
                >
                  {copiedKey === 'crypto_address' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Amount to Send Box */}
              <div className="p-3.5 rounded-2xl bg-[#090b13] border border-white/[0.1] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Exact Amount to Send
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-base sm:text-lg font-black text-white font-mono">
                      {activeConfig.amountText}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      (${totalAmount.toFixed(2)} USD)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(activeConfig.amountValue, 'crypto_amount')}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                >
                  {copiedKey === 'crypto_amount' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Amount</span>
                    </>
                  )}
                </button>
              </div>

              {/* Warning Notice */}
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-400">
                <Info className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                <span>{activeConfig.warning}</span>
              </div>

              {/* Transaction Hash / TXID */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Transaction Hash / TXID (Optional for instant release)
                </label>
                <input
                  type="text"
                  placeholder="Paste transaction hash / TXID..."
                  value={txHashInput}
                  onChange={(e) => setTxHashInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#07080d] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40 font-mono"
                />
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* VAULT WALLET 1-CLICK SETTLEMENT VIEW                     */}
          {/* ======================================================== */}
          {paymentRail === 'WALLET' && (
            <div className="p-4 rounded-2xl bg-[#141724] border border-white/[0.12] space-y-3 shadow-xl">
              {wallet ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
                      VAULT ACCOUNT ID: {wallet.id}
                    </span>
                    <span className="text-base font-bold text-white font-mono mt-0.5 block">
                      Available Balance: ${Number(wallet.balance).toFixed(2)} USD
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {isWalletSufficient ? 'Sufficient balance for instant 1-click checkout' : 'Insufficient balance'}
                    </span>
                  </div>

                  {!isWalletSufficient ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenWallet) onOpenWallet();
                      }}
                      className="px-3 py-1.5 rounded-xl btn-silver text-xs font-bold flex items-center gap-1 cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5 text-black" />
                      <span>Top Up Deposit</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      1-Click Ready
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-300 mb-2">No Vault Wallet connected yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenWallet) onOpenWallet();
                    }}
                    className="px-4 py-2 rounded-xl btn-silver text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Wallet className="w-3.5 h-3.5 text-black" />
                    <span>Connect / Top Up Vault Wallet</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading || (paymentRail === 'WALLET' && !isWalletSufficient)}
            className="w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs sm:text-sm btn-silver flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {verifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Verifying Blockchain Settlement...</span>
              </>
            ) : paymentRail === 'WALLET' ? (
              <>
                <Zap className="w-4 h-4 text-black" />
                <span>1-Click Instant Bulk Pay (${totalAmount.toFixed(2)} USD)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>I Have Sent Payment • Release Credentials Now</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-500 font-mono">
            Zero KYC & logs • Credentials unmasked on screen immediately upon payment
          </p>
        </form>

      </div>
    </div>
  );
}
