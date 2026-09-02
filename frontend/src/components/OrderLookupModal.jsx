import React, { useState } from 'react';
import { X, Search, Receipt, AlertCircle, ShieldCheck } from 'lucide-react';
import { lookupOrder } from '../api';

export default function OrderLookupModal({ isOpen, onClose, onOrderFound }) {
  if (!isOpen) return null;

  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) {
      setError('Please provide both Order Reference ID and Delivery Email.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await lookupOrder(orderId.trim(), email.trim());
      if (data.success && data.order) {
        onOrderFound(data.order);
        onClose();
      } else {
        setError(data.message || 'No matching order record found.');
      }
    } catch (err) {
      setError(err.message || 'Could not find order. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#040507]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#0a0c12] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Silver & Black */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#06070a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-white/[0.12] flex items-center justify-center text-white">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide font-display">Credential Retrieval</h3>
              <p className="text-[11px] text-slate-400">Lookup and unlock previously settled cards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLookup} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Order Reference ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ORD-9A7F-4821"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#06070a] border border-white/[0.1] rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-white/50 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Delivery Email Address
            </label>
            <input
              type="email"
              required
              placeholder="Email address used during checkout"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#06070a] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-xs btn-silver flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Retrieving Ledger Records...</span>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-black" />
                <span>Retrieve Cards & Credentials</span>
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Full credentials can be viewed and copied once verified</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
