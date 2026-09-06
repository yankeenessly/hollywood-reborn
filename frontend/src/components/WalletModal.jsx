import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Copy, 
  Check, 
  RefreshCw, 
  Lock, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  User,
  Plus,
  Info
} from 'lucide-react';
import { depositWallet, accessWallet } from '../api';

export default function WalletModal({ 
  isOpen, 
  onClose, 
  wallet, 
  setWallet, 
  onDepositSuccess 
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(wallet ? 'deposit' : 'access'); // 'deposit' | 'access' | 'history'
  
  // Access form
  const [accessInput, setAccessInput] = useState('');
  const [accessName, setAccessName] = useState('');
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState('');

  // Deposit form
  const [depositAmount, setDepositAmount] = useState(250);
  const [customAmount, setCustomAmount] = useState('');
  const [depositAsset, setDepositAsset] = useState('USDT'); // 'USDT' | 'BTC'
  const [usdtNetwork, setUsdtNetwork] = useState('TRX'); // 'TRX' (TRC-20) | 'BSC' (BEP-20) | 'ETH' (ERC-20)
  const [txHashInput, setTxHashInput] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState('');
  const [depositError, setDepositError] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // Quick deposit presets
  const presetAmounts = [100, 250, 500, 1000, 2500, 5000];

  const effectiveAmount = customAmount ? parseFloat(customAmount) : depositAmount;

  // Exact deposit configurations matching user's uploaded images
  const depositConfigs = {
    USDT_TRX: {
      networkName: 'TRX Network',
      networkLabel: 'TRX Network (TRC-20)',
      address: wallet?.deposit_address_usdt_trc20 || 'TKsEPMVKQsPPo1mnoya6q11iVwTYNbus2n',
      qrImage: '/qr/usdt_trx_qr.png',
      coinName: 'Tether USD',
      warning: 'Send only Tether USD (TRC-20) to this address. Fastest confirmation with lowest fees.'
    },
    USDT_BSC: {
      networkName: 'BSC Network',
      networkLabel: 'BSC Network (BEP-20)',
      address: wallet?.deposit_address_usdt_bsc || '0xc68D11aEEB71306f53BC84858243E55fa72a66FC',
      qrImage: '/qr/usdt_bsc_qr.png',
      coinName: 'Tether USD',
      warning: 'Send only Tether USD (BEP-20 / BNB Smart Chain) to this address.'
    },
    USDT_ETH: {
      networkName: 'ETH Network',
      networkLabel: 'Ethereum Network (ERC-20)',
      address: wallet?.deposit_address_usdt_erc20 || '0xc68D11aEEB71306f53BC84858243E55fa72a66FC',
      qrImage: '/qr/usdt_bsc_qr.png',
      coinName: 'Tether USD',
      warning: 'Send only Tether USD (ERC-20) to this address.'
    },
    BTC: {
      networkName: 'BTC Network',
      networkLabel: 'Bitcoin Network (Native SegWit)',
      address: wallet?.deposit_address_btc || 'bc1q2elvxghr55td9gag8sl64mwpddjzshqjcmxn56',
      qrImage: '/qr/btc_qr.png',
      coinName: 'Bitcoin',
      warning: 'Send only Bitcoin (BTC) to this address. Credits broadcast automatically.'
    }
  };

  const activeConfig = depositAsset === 'BTC'
    ? depositConfigs.BTC
    : (usdtNetwork === 'TRX' ? depositConfigs.USDT_TRX : (usdtNetwork === 'BSC' ? depositConfigs.USDT_BSC : depositConfigs.USDT_ETH));

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handle Wallet Access or Creation
  const handleAccessSubmit = async (e) => {
    e.preventDefault();
    if (!accessInput.trim()) return;
    try {
      setAccessLoading(true);
      setAccessError('');
      const data = await accessWallet(accessInput.trim(), accessName.trim() || 'Vault Client');
      if (data.success && data.wallet) {
        setWallet(data.wallet);
        localStorage.setItem('hollywood_wallet_id', data.wallet.id);
        localStorage.setItem('hollywood_wallet_email', data.wallet.email);
        setActiveTab('deposit');
      }
    } catch (err) {
      setAccessError(err.message || 'Unable to access wallet.');
    } finally {
      setAccessLoading(false);
    }
  };

  // Handle Deposit Submission
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!wallet) {
      setActiveTab('access');
      return;
    }
    if (!effectiveAmount || effectiveAmount <= 0) {
      setDepositError('Please enter a valid deposit amount.');
      return;
    }

    try {
      setDepositLoading(true);
      setDepositError('');
      setDepositSuccessMsg('');

      const paymentMethod = depositAsset === 'BTC' ? 'Bitcoin (BTC)' : `USDT (${activeConfig.networkName})`;
      const data = await depositWallet({
        wallet_id: wallet.id,
        amount: effectiveAmount,
        tx_hash: txHashInput.trim() || `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        payment_method: paymentMethod
      });

      if (data.success && data.wallet) {
        setWallet(data.wallet);
        setDepositSuccessMsg(`Successfully credited $${effectiveAmount.toFixed(2)} to your Vault Wallet!`);
        setTxHashInput('');
        setCustomAmount('');
        if (onDepositSuccess) onDepositSuccess(data.wallet);
      }
    } catch (err) {
      setDepositError(err.message || 'Deposit confirmation failed.');
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-[#0d0f17] border border-white/[0.14] rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/[0.08] bg-[#111420]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide font-display">
                  Vault Customer Wallet
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  1-CLICK BULK PAY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Deposit funds to instantly purchase unlimited digital cards in bulk
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-white/[0.08] bg-[#090b12] px-4 pt-2">
          {wallet && (
            <button
              onClick={() => setActiveTab('deposit')}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'deposit'
                  ? 'border-white text-white bg-white/[0.04]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deposit Funds</span>
            </button>
          )}

          {wallet && (
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-white text-white bg-white/[0.04]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Ledger History ({wallet?.transactions?.length || 0})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('access')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'access'
                ? 'border-white text-white bg-white/[0.04]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{wallet ? 'Account / Switch' : 'Connect / Create'}</span>
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* ======================================================== */}
          {/* 3D METALLIC WALLET CARD (IF CONNECTED)                   */}
          {/* ======================================================== */}
          {wallet && (
            <div className="relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#1c202a] via-[#10121a] to-[#06070a] border border-white/25 shadow-xl overflow-hidden card-metal-sheen">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <span className="text-[8px] uppercase tracking-[0.25em] text-slate-400 font-bold font-mono block">
                    VAULT ACCOUNT ID
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-sm sm:text-base font-black text-white tracking-wider">
                      {wallet.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(wallet.id, 'wallet_id')}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                      title="Copy Wallet ID"
                    >
                      {copiedKey === 'wallet_id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {wallet.email}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[8px] uppercase tracking-[0.2em] text-slate-400 font-bold font-mono block">
                    AVAILABLE BALANCE
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">
                    ${Number(wallet.balance || 0).toFixed(2)} <span className="text-xs font-bold text-slate-400">USD</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Instant Bulk Ready
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: DEPOSIT FUNDS (STATIC LUXURY PRESENTATION)        */}
          {/* ======================================================== */}
          {activeTab === 'deposit' && wallet && (
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              
              {depositSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-700/50 flex items-center gap-2.5 text-emerald-300 text-xs">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{depositSuccessMsg}</span>
                </div>
              )}

              {depositError && (
                <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-center gap-2.5 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{depositError}</span>
                </div>
              )}

              {/* 1. Deposit Amount Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  1. Select Deposit Amount (USD / USDT)
                </label>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-2">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setDepositAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        depositAmount === amt && !customAmount
                          ? 'pill-silver-active shadow-md'
                          : 'bg-[#121520] text-slate-300 hover:text-white border border-white/[0.08]'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">$</span>
                  <input
                    type="number"
                    min="10"
                    step="any"
                    placeholder="Or enter custom amount in USD (e.g. 750)..."
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      if (e.target.value) setDepositAmount(0);
                    }}
                    className="w-full pl-8 pr-3 py-2.5 bg-[#07080d] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40 font-mono font-bold"
                  />
                </div>
              </div>

              {/* 2. Select Crypto Settlement Asset */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  2. Select Blockchain Deposit Rail
                </label>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositAsset('USDT')}
                    className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      depositAsset === 'USDT'
                        ? 'pill-silver-active shadow-md'
                        : 'bg-[#121520] text-slate-300 hover:text-white border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-teal-500 text-black flex items-center justify-center text-[10px] font-extrabold">₮</span>
                      <span>Tether (USDT)</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-75">TRX / BSC / ETH</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositAsset('BTC')}
                    className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      depositAsset === 'BTC'
                        ? 'pill-silver-active shadow-md'
                        : 'bg-[#121520] text-slate-300 hover:text-white border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-extrabold">₿</span>
                      <span>Bitcoin (BTC)</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-75">Native SegWit</span>
                  </button>
                </div>
              </div>

              {/* ======================================================== */}
              {/* STATIC LUXURY CRYPTO DEPOSIT GATEWAY CARD                */}
              {/* ======================================================== */}
              <div className="rounded-2xl bg-[#141724] border border-white/[0.12] p-4 sm:p-5 space-y-4 shadow-xl">
                
                {/* Header inside Gateway: Network Badge & Title */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide block">
                      Receive {activeConfig.coinName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Deposit funds to unmask unlimited cards in bulk
                    </span>
                  </div>

                  {/* Network Selector Pill */}
                  {depositAsset === 'USDT' ? (
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

                {/* Static Clean QR Code Display */}
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
                    Scan with Trust Wallet, Binance, OKX, or Exodus
                  </span>
                </div>

                {/* Address Container */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#090b13] border border-white/[0.1] flex items-center justify-between gap-3">
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Your {depositAsset === 'BTC' ? 'BTC' : 'USDT'} Address ({activeConfig.networkName})
                    </span>
                    <p className="font-mono text-xs sm:text-sm font-bold text-white break-all select-all leading-tight">
                      {activeConfig.address}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(activeConfig.address, 'dep_crypto_addr')}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shrink-0 cursor-pointer shadow-sm hover:scale-105"
                    title="Copy Address"
                  >
                    {copiedKey === 'dep_crypto_addr' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Amount to Deposit Box */}
                <div className="p-3.5 rounded-2xl bg-[#090b13] border border-white/[0.1] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Target Deposit Credit
                    </span>
                    <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5 block">
                      ${effectiveAmount.toFixed(2)} USD / USDT
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(effectiveAmount.toFixed(2), 'dep_amount')}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  >
                    {copiedKey === 'dep_amount' ? (
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

                {/* Network Warning */}
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-400">
                  <Info className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                  <span>{activeConfig.warning}</span>
                </div>

                {/* TXID / Hash input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Blockchain Transaction Hash / ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Paste TXID / Hash (or click confirm to credit instantly)..."
                    value={txHashInput}
                    onChange={(e) => setTxHashInput(e.target.value)}
                    className="w-full px-3 py-2 bg-[#07080d] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>

              </div>

              <button
                type="submit"
                disabled={depositLoading}
                className="w-full py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm btn-silver flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
              >
                {depositLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Verifying Ledger Settlement...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-black" />
                    <span>Confirm & Credit ${effectiveAmount.toFixed(2)} to Wallet</span>
                  </>
                )}
              </button>

            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 2: LEDGER HISTORY                                    */}
          {/* ======================================================== */}
          {activeTab === 'history' && wallet && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>Recent Ledger Transactions</span>
                <span className="font-mono text-[10px]">Auto-Synced</span>
              </div>

              {wallet.transactions && wallet.transactions.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {wallet.transactions.map((tx) => (
                    <div 
                      key={tx.id}
                      className="p-3 rounded-xl bg-[#0c0e16] border border-white/[0.08] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.type === 'deposit' || tx.amount > 0 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-slate-800 text-slate-300 border border-white/10'
                        }`}>
                          {tx.type === 'deposit' || tx.amount > 0 ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-200">
                            {tx.description || (tx.type === 'deposit' ? 'Wallet Deposit' : 'Bulk Card Purchase')}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(tx.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono font-bold block ${
                          tx.amount > 0 ? 'text-emerald-400' : 'text-slate-200'
                        }`}>
                          {tx.amount > 0 ? `+$${Number(tx.amount).toFixed(2)}` : `-$${Math.abs(Number(tx.amount)).toFixed(2)}`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Bal: ${Number(tx.balance_after).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-[#07090e] rounded-xl border border-dashed border-white/10">
                  <p className="text-xs text-slate-400">No transactions recorded yet.</p>
                  <p className="text-[10px] text-slate-500 mt-1">Make your first deposit to start purchasing in bulk.</p>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: ACCOUNT ACCESS / SWITCH                           */}
          {/* ======================================================== */}
          {activeTab === 'access' && (
            <form onSubmit={handleAccessSubmit} className="space-y-4">
              
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/15">
                <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Instant Zero-KYC Vault ID</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter your email address or existing Vault ID (e.g. <strong className="text-slate-200">VAULT-XXXX-XXXX</strong>). If it doesn't exist, an account will be created immediately with zero KYC.
                </p>
              </div>

              {accessError && (
                <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-center gap-2.5 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{accessError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address or Existing Vault ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. client@vault.com or VAULT-9284-4819"
                  value={accessInput}
                  onChange={(e) => setAccessInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#07080d] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Label / Display Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bulk Trader Alpha"
                  value={accessName}
                  onChange={(e) => setAccessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#07080d] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40"
                />
              </div>

              <button
                type="submit"
                disabled={accessLoading}
                className="w-full py-3.5 rounded-2xl font-extrabold text-xs btn-silver flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
              >
                {accessLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Accessing Vault Ledger...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-black" />
                    <span>Connect / Open Vault Wallet</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

        {/* Footer info */}
        <div className="px-5 sm:px-6 py-3 border-t border-white/[0.08] bg-[#090b12] flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-300" />
            <span>256-Bit Ledger Encrypted</span>
          </div>
          <span className="text-emerald-400 font-semibold">
            Zero Deposit Fees • Instant Credit
          </span>
        </div>

      </div>
    </div>
  );
}
