import React, { useState } from 'react';
import { 
  Wifi, 
  Eye, 
  Lock, 
  X, 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Check
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

export default function CardItem({ card, onAddToCart, onBuyNow, isInCart }) {
  const theme = getBrandTheme(card.brand || card.category);
  const [showBuyPrompt, setShowBuyPrompt] = useState(false);

  const faceValue = Number(card.face_value) || 0;
  const price = Number(card.price) || 0;
  const savings = faceValue > price ? (faceValue - price).toFixed(2) : 0;
  const discountPercent = faceValue > 0 && faceValue > price 
    ? Math.round(((faceValue - price) / faceValue) * 100) 
    : 0;

  const handleEyeClick = (e) => {
    e.stopPropagation();
    setShowBuyPrompt(true);
  };

  return (
    <div className="card-perspective group relative flex flex-col rounded-2xl bg-[#090b10] border border-white/[0.1] hover:border-white/40 p-3.5 sm:p-4 transition-all duration-200 hover:shadow-2xl">
      
      {/* ======================================================== */}
      {/* PHYSICAL 3D LUXURY METAL CARD MOCKUP                     */}
      {/* Blank Name • Real Monospace Digits • EXP & CVV with Eye  */}
      {/* ======================================================== */}
      <div className={`card-3d-body relative rounded-xl overflow-hidden p-4 sm:p-5 bg-gradient-to-br ${theme.gradient} border ${theme.border} shadow-xl flex flex-col justify-between select-none transition-all card-metal-sheen min-h-[195px]`}>
        
        {/* Subtle Metallic Glare */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08] pointer-events-none" />

        {/* Card Header: 3D EMV Microchip, Contactless Wave, and Vault Hologram */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {/* 3D EMV Microchip */}
            <div className="w-10 h-7 rounded chip-emv-3d p-1 flex flex-col justify-between shadow-sm shrink-0">
              <div className="border-b border-black/40 w-full h-[1px]" />
              <div className="flex justify-between h-[1px]">
                <div className="w-1/3 border-b border-black/40" />
                <div className="w-1/3 border-b border-black/40" />
              </div>
              <div className="border-b border-black/40 w-full h-[1px]" />
            </div>

            {/* Contactless Wave Icon */}
            <Wifi className="w-4 h-4 text-white/70 rotate-90 shrink-0" />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-neutral-900/90 text-white font-bold text-[9px] border border-white/20">
                -{discountPercent}%
              </span>
            )}
            {/* 3D Holographic Security Seal */}
            <div className="holo-seal px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="text-[7px] font-mono font-black tracking-[0.2em] text-white uppercase">
                {card.brand || 'VAULT'}
              </span>
              <span className="text-white text-[7px]">✦</span>
            </div>
          </div>
        </div>

        {/* MIDDLE OF CARD: 16-Digit Monospace Number with Eye Button */}
        <div className="relative z-10 my-2.5 py-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold font-mono">
              CARD NUMBER
            </span>
            <button
              type="button"
              onClick={handleEyeClick}
              className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-white hover:text-black bg-white/10 hover:bg-white px-2 py-0.5 rounded-full border border-white/30 transition-all shadow-sm cursor-pointer"
              title="Click to reveal credentials"
            >
              <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Reveal</span>
            </button>
          </div>

          {/* Embossed Monospace Masked Digits */}
          <div className="font-mono text-sm sm:text-base font-black tracking-[0.2em] text-white card-emboss-text">
            •••• •••• •••• ••••
          </div>
        </div>

        {/* CARD FOOTER: EXP & CVV WITH EYE OPTION (NO NAME) */}
        <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/[0.1] text-white">
          <div>
            <span className="text-[7.5px] uppercase tracking-[0.18em] text-slate-400 block font-bold font-mono">
              EXP
            </span>
            <span className="font-mono text-[11px] sm:text-xs font-bold text-slate-200 tracking-wider">
              {card.expiry_date || '12/28'}
            </span>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-[7.5px] uppercase tracking-[0.18em] text-slate-400 block font-bold font-mono">
              SECURITY CVV
            </span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-[11px] sm:text-xs font-bold text-slate-200 tracking-wider">
                •••
              </span>
              <button
                type="button"
                onClick={handleEyeClick}
                className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
                title="Purchase required to see CVV"
              >
                <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* EYE OVERLAY: "PURCHASE REQUIRED TO SEE" PROMPT           */}
        {/* ======================================================== */}
        {showBuyPrompt && (
          <div className="absolute inset-0 z-30 bg-[#06070a]/95 backdrop-blur-md p-3.5 sm:p-4 flex flex-col justify-between rounded-xl animate-in fade-in duration-150 border border-white/30 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                <Lock className="w-3 h-3 text-slate-300" />
                <span>Protected Credentials</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBuyPrompt(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-1 text-center">
              <p className="text-xs text-slate-200 font-semibold mb-0.5">
                Purchase required to unmask
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                Full 16-digit number, EXP, and CVV are unmasked on screen upon settlement.
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowBuyPrompt(false);
                onBuyNow(card);
              }}
              className="w-full py-2 px-3 rounded-lg font-bold text-xs btn-silver flex items-center justify-center gap-1.5 shadow cursor-pointer"
            >
              <span>Unlock for ${price.toFixed(2)}</span>
              <ArrowRight className="w-3 h-3 text-black" />
            </button>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* CARD META, PRICING & ACTIONS                             */}
      {/* ======================================================== */}
      <div className="mt-3 flex flex-col space-y-2.5">
        
        {/* Top Meta: Country / Jurisdiction Flag & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm shrink-0">{getCountryFlag(card.country || card.brand)}</span>
            <span className="text-xs font-bold text-slate-200 truncate">
              {card.brand || card.country || 'Global Territory'}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold font-mono shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>IN STOCK</span>
          </div>
        </div>

        {/* Pricing Ingot Plate */}
        <div className="flex items-baseline justify-between pt-1 border-t border-white/[0.08]">
          <div>
            <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-mono">
              SETTLEMENT PRICE
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-white">
                ${price.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 line-through">
                ${faceValue.toFixed(2)}
              </span>
            </div>
          </div>

          {savings > 0 && (
            <div className="text-right">
              <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-mono">
                INSTANT SAVINGS
              </span>
              <span className="text-xs font-bold text-emerald-400">
                +${savings}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons: Add to Cart & Buy Now */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => onAddToCart(card)}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              isInCart
                ? 'bg-neutral-800 text-white border-white/40 shadow-inner'
                : 'bg-[#0f121a] hover:bg-[#161a26] text-slate-300 hover:text-white border-white/15'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>In Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onBuyNow(card)}
            className="py-2 px-2.5 rounded-xl font-extrabold text-xs btn-silver flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-black shrink-0" />
            <span>Buy Now</span>
          </button>
        </div>

      </div>

    </div>
  );
}
