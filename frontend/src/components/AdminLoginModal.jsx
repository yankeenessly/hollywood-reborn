import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { adminLogin } from '../api';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the admin password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await adminLogin(password);
      if (res.success) {
        onLoginSuccess();
        onClose();
      } else {
        setError(res.message || 'Invalid password.');
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setPassword('admin123');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#040507]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-[#0a0c12] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Silver & Black */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#06070a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-white/[0.12] flex items-center justify-center text-white">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display tracking-wide">Admin Access</h3>
              <p className="text-[11px] text-slate-400">Hollywood Reborn Management</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Admin Password</span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] text-slate-300 hover:text-white font-normal cursor-pointer underline underline-offset-2"
              >
                Auto-fill: admin123
              </button>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#06070a] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-white/50"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Default password configured in backend is <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">admin123</code>.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs btn-silver transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Authorize Admin Gateway'}
          </button>
        </form>
      </div>
    </div>
  );
}
