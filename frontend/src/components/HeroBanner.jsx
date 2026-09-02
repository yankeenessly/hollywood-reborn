import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Lock, 
  Globe, 
  CheckCircle2, 
  ArrowRight, 
  Wifi, 
  Sparkles,
  Search,
  Key,
  Rotate3d
} from 'lucide-react';

export default function HeroBanner({ onSelectCategory, selectedCategory, onOpenLookup }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const countryFilters = [
    { label: 'All Regions', value: 'All', icon: '🌐' },
    { label: 'United States', value: 'United States', icon: '🇺🇸' },
    { label: 'United Kingdom', value: 'United Kingdom', icon: '🇬🇧' },
    { label: 'Canada', value: 'Canada', icon: '🇨🇦' },
    { label: 'Australia', value: 'Australia', icon: '🇦🇺' },
    { label: 'Germany', value: 'Germany', icon: '🇩🇪' },
    { label: 'France', value: 'France', icon: '🇫🇷' },
    { label: 'Global Pass', value: 'Global', icon: '🌍' }
  ];

  return (
    <section className="relative overflow-hidden pt-8 sm:pt-12 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#050608]">
      
      {/* Lightweight Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-white/[0.04] to-transparent blur-2xl pointer-events-none -z-10 gpu-accel" />

      <div className="max-w-7xl mx-auto">
        
        {/* ======================================================== */}
        {/* MAIN HERO: SPLIT 3D SHOWCASE & COPY                      */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT COLUMN: Sculpted 3D Typography & Value Proposition */}
          <div className="lg:col-span-7 text-left space-y-5">
            
            {/* Executive Luxury Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#0d1017] border border-white/20 shadow-md">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-wider sm:tracking-[0.18em] text-slate-200 truncate">
                COLD STORAGE VAULT • USDT & BTC SETTLEMENT
              </span>
            </div>

            {/* Sculpted 3D Liquid Chrome Title */}
            <div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-wide sm:tracking-[0.05em] leading-tight font-display text-white break-words">
                HOLLYWOOD <br className="hidden sm:inline" />
                <span className="text-3d-luxury">REBORN</span>
              </h1>
              <div className="h-0.5 w-20 bg-gradient-to-r from-white via-slate-300 to-transparent mt-2.5 rounded-full opacity-70" />
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
              The premier institution for verified, unbranded cold-stored digital cards. 
              Full <strong className="text-white font-semibold">16-Digit Card Number</strong>, <strong className="text-white font-semibold">EXP</strong>, and <strong className="text-white font-semibold">CVV Credentials</strong> are released immediately via automated <strong className="text-white font-semibold">USDT</strong> and <strong className="text-white font-semibold">Bitcoin</strong> settlement.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <a
                href="#inventory"
                className="px-5 sm:px-6 py-3 rounded-xl font-extrabold text-xs btn-silver inline-flex items-center justify-center gap-2 shadow-md cursor-pointer text-center"
              >
                <span>Browse Cold Storage Cards</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </a>

              {onOpenLookup && (
                <button
                  type="button"
                  onClick={onOpenLookup}
                  className="px-4 sm:px-5 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#0e111a] hover:bg-[#141824] border border-white/15 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Lookup Previous Order</span>
                </button>
              )}
            </div>

            {/* Live Trust Guarantee */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-[10px] sm:text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span>Zero KYC</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-600 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant Unmasking</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-600 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span>Cold-Stored</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 3D ANIMATED FLOATING MULTI-CARD DECK */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center mt-6 lg:mt-0 relative min-h-[290px] sm:min-h-[320px]">
            
            {/* Background 3D Layer 1: Titanium Card (Left Parallax) */}
            <div className="absolute -top-3 -left-2 sm:-left-6 w-[280px] sm:w-[330px] h-[160px] sm:h-[185px] rounded-2xl bg-gradient-to-br from-[#242834] via-[#14161f] to-[#08090d] border border-white/15 shadow-2xl p-4 anim-card-back-left pointer-events-none hidden sm:block">
              <div className="flex justify-between items-center opacity-40">
                <div className="w-8 h-5 rounded chip-emv-3d" />
                <span className="text-[7px] font-mono tracking-widest text-slate-400">TITANIUM EDITION</span>
              </div>
              <div className="mt-8 text-xs font-mono tracking-[0.2em] text-slate-500">
                •••• •••• •••• 7731
              </div>
            </div>

            {/* Background 3D Layer 2: Platinum Card (Right Parallax) */}
            <div className="absolute -bottom-2 -right-2 sm:-right-6 w-[270px] sm:w-[320px] h-[155px] sm:h-[180px] rounded-2xl bg-gradient-to-br from-[#2a2f3d] via-[#161822] to-[#090b10] border border-white/15 shadow-2xl p-4 anim-card-back-right pointer-events-none hidden sm:block">
              <div className="flex justify-between items-center opacity-30">
                <span className="text-[7px] font-mono tracking-widest text-slate-400">PLATINUM TIER</span>
                <Wifi className="w-3 h-3 text-slate-400 rotate-90" />
              </div>
              <div className="mt-8 text-xs font-mono tracking-[0.2em] text-slate-500">
                •••• •••• •••• 5590
              </div>
            </div>

            {/* Foreground Master 3D Animated Card with Interactive Flip */}
            <div 
              className="card-flip-container w-full max-w-[360px] sm:max-w-[400px] cursor-pointer group"
              onClick={() => setIsFlipped(!isFlipped)}
              title="Click to flip card in 3D"
            >
              <div className={`anim-card-main card-flip-inner relative rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ${isFlipped ? 'card-flipped' : ''}`}>
                
                {/* ======================================================== */}
                {/* CARD FRONT                                               */}
                {/* ======================================================== */}
                <div className="card-face-front relative rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-[#1a1d24] via-[#0d0f14] to-[#040507] border border-white/30 overflow-hidden card-metal-sheen min-h-[220px] sm:min-h-[240px] flex flex-col justify-between">
                  
                  {/* Dynamic Shimmer Light Sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent anim-light-glimmer pointer-events-none w-1/2 h-full" />

                  {/* Card Top: 3D EMV Microchip, Wave, and Holographic Seal */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {/* 3D EMV Microchip with Pulse */}
                      <div className="w-10 sm:w-11 h-7 sm:h-8 rounded-md chip-emv-3d anim-chip-pulse p-1 flex flex-col justify-between shadow">
                        <div className="border-b border-black/40 w-full h-[1px]" />
                        <div className="flex justify-between h-[1px]">
                          <div className="w-1/3 border-b border-black/40" />
                          <div className="w-1/3 border-b border-black/40" />
                        </div>
                        <div className="border-b border-black/40 w-full h-[1px]" />
                      </div>

                      {/* Contactless Wave */}
                      <Wifi className="w-4 h-4 text-white/70 rotate-90" />
                    </div>

                    {/* Holographic Security Seal */}
                    <div className="holo-seal px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-white" />
                      <span className="text-[7.5px] font-mono font-black tracking-[0.2em] text-white uppercase">
                        COLD VAULT
                      </span>
                    </div>
                  </div>

                  {/* Card Middle: Embossed 16-Digit Monospace Number */}
                  <div className="relative z-10 my-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold font-mono">
                        UNMASKED CARD ID
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        ACTIVE BALANCE
                      </span>
                    </div>
                    
                    {/* Embossed Number */}
                    <div className="text-base sm:text-lg font-mono font-black tracking-[0.2em] text-white card-emboss-text">
                      4024 •••• •••• 9842
                    </div>
                  </div>

                  {/* Card Footer: EXP, CVV, and Balance */}
                  <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/[0.12] text-white">
                    <div>
                      <span className="text-[7.5px] uppercase tracking-[0.18em] text-slate-400 block font-bold font-mono">
                        EXP
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-200">
                        12/28
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="text-[7.5px] uppercase tracking-[0.18em] text-slate-400 block font-bold font-mono">
                        SECURITY CVV
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-200">
                        •••
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[7.5px] uppercase tracking-[0.18em] text-slate-400 block font-bold font-mono">
                        CARD VALUE
                      </span>
                      <span className="font-mono text-xs font-black text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
                        $500.00 USD
                      </span>
                    </div>
                  </div>

                </div>

                {/* ======================================================== */}
                {/* CARD BACK (REVEALED ON 3D FLIP)                          */}
                {/* ======================================================== */}
                <div className="card-face-back absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0e1017] via-[#08090d] to-[#040507] border border-white/30 overflow-hidden min-h-[220px] sm:min-h-[240px] flex flex-col justify-between py-4 shadow-2xl">
                  
                  {/* Magnetic Stripe */}
                  <div className="w-full h-9 sm:h-10 bg-gradient-to-r from-[#1a1c22] via-[#050608] to-[#1a1c22] border-y border-black" />

                  {/* Signature Panel & CVV Box */}
                  <div className="px-5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-7 bg-white/10 rounded border border-white/20 flex items-center px-3">
                        <span className="text-[9px] font-mono italic text-slate-400">AUTHORIZED VAULT SIGNATURE</span>
                      </div>
                      <div className="w-12 h-7 bg-white/20 rounded border border-white/40 flex items-center justify-center font-mono font-black text-xs text-white">
                        842
                      </div>
                    </div>
                  </div>

                  {/* Laser-Etched Security Seal on Back */}
                  <div className="px-5 flex items-center justify-between text-[8px] font-mono text-slate-400">
                    <span>HOLLYWOOD REBORN PROTOCOL</span>
                    <span className="text-emerald-400 font-bold">● 256-BIT ENCRYPTED</span>
                  </div>

                </div>

              </div>
            </div>

            {/* 3D Interactive Flip Hint Button */}
            <button
              type="button"
              onClick={() => setIsFlipped(!isFlipped)}
              className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/15 border border-white/15 text-[10px] font-mono text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <Rotate3d className="w-3 h-3 text-slate-300" />
              <span>{isFlipped ? 'Click to View Front' : 'Click to Flip in 3D'}</span>
            </button>

          </div>

        </div>

        {/* ======================================================== */}
        {/* 4 BESPOKE 3D INGOT FEATURE CARDS                         */}
        {/* ======================================================== */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left">
          
          <div className="ingot-glass p-3.5 sm:p-4 rounded-xl transition-all group">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <h2 className="text-xs font-bold text-white tracking-wide">
                Verified Balances
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal pl-9.5">
              Every digital card balance is pre-validated on cold storage ledgers.
            </p>
          </div>

          <div className="ingot-glass p-3.5 sm:p-4 rounded-xl transition-all group">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-xs font-bold text-white tracking-wide">
                Instant Unmasking
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal pl-9.5">
              Card number, EXP, and CVV are generated and displayed in seconds.
            </p>
          </div>

          <div className="ingot-glass p-3.5 sm:p-4 rounded-xl transition-all group">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Lock className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <h2 className="text-xs font-bold text-white tracking-wide">
                Zero KYC & Logs
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal pl-9.5">
              Private checkout via USDT & Bitcoin. Zero customer identity logs.
            </p>
          </div>

          <div className="ingot-glass p-3.5 sm:p-4 rounded-xl transition-all group">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Globe className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <h2 className="text-xs font-bold text-white tracking-wide">
                8 Jurisdictions
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal pl-9.5">
              Multi-region compatibility across USA, UK, EU, UAE, CA, and AU.
            </p>
          </div>

        </div>

        {/* ======================================================== */}
        {/* SWIPEABLE / RESPONSIVE JURISDICTION FILTER               */}
        {/* ======================================================== */}
        <div id="inventory" className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/[0.08]">
          <div className="flex items-center justify-between max-w-5xl mx-auto mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider sm:tracking-[0.2em] text-slate-200 font-bold font-mono">
                FILTER BY JURISDICTION
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
              Select a territory to filter cold storage inventory
            </span>
          </div>

          {/* Swipeable on mobile, wrapped on desktop */}
          <div className="flex items-center overflow-x-auto sm:flex-wrap sm:justify-center gap-1.5 sm:gap-2 max-w-5xl mx-auto p-1.5 rounded-2xl bg-[#0a0c12] border border-white/[0.1] no-scrollbar">
            {countryFilters.map((country) => {
              const isSelected = selectedCategory === country.value;
              return (
                <button
                  key={country.value}
                  onClick={() => onSelectCategory(country.value)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-150 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'pill-silver-active shadow-md'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{country.icon}</span>
                  <span>{country.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
