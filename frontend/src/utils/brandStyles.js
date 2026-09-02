// Pure Silver and Black Luxury Card Finishes
export function getBrandTheme(brandOrTier = '') {
  const normalized = (brandOrTier || '').toLowerCase().trim();

  // 1. Polished Liquid Chrome / Silver
  if (normalized.includes('silver') || normalized.includes('chrome') || normalized.includes('gold')) {
    return {
      gradient: 'from-[#1a1d24] via-[#12141a] to-[#08090c]',
      border: 'border-white/25 hover:border-white/60',
      glow: 'shadow-white/10',
      accent: 'text-slate-100',
      chip: 'from-[#ffffff] via-[#cbd5e1] to-[#64748b] border-white/90',
      tag: 'Chrome Edition',
      metalType: 'Polished Chrome',
      watermark: 'HOLLYWOOD REBORN • SILVER'
    };
  }

  // 2. Frosted Platinum (Pure high-grade platinum on black)
  if (normalized.includes('platinum')) {
    return {
      gradient: 'from-[#1e222b] via-[#141720] to-[#090b0e]',
      border: 'border-slate-300/30 hover:border-slate-200/70',
      glow: 'shadow-slate-300/10',
      accent: 'text-slate-200',
      chip: 'from-[#ffffff] via-[#e2e8f0] to-[#94a3b8] border-white/90',
      tag: 'Platinum Edition',
      metalType: 'Frosted Platinum',
      watermark: 'HOLLYWOOD REBORN • PLATINUM'
    };
  }

  // 3. Aerospace Titanium (Dark smoked gunmetal with bright silver bevels)
  if (normalized.includes('titanium') || normalized.includes('diamond')) {
    return {
      gradient: 'from-[#181a20] via-[#101216] to-[#060709]',
      border: 'border-zinc-400/30 hover:border-zinc-200/60',
      glow: 'shadow-zinc-300/10',
      accent: 'text-zinc-200',
      chip: 'from-[#f8fafc] via-[#cbd5e1] to-[#475569] border-zinc-200/80',
      tag: 'Titanium Edition',
      metalType: 'Machined Titanium',
      watermark: 'HOLLYWOOD REBORN • TITANIUM'
    };
  }

  // 4. Matte Obsidian Black (Deep matte black with silver engraved accents)
  if (normalized.includes('black') || normalized.includes('vip') || normalized.includes('obsidian') || normalized.includes('stealth')) {
    return {
      gradient: 'from-[#0d0f14] via-[#090a0e] to-[#040507]',
      border: 'border-white/20 hover:border-white/50',
      glow: 'shadow-white/5',
      accent: 'text-white',
      chip: 'from-[#ffffff] via-[#cbd5e1] to-[#64748b] border-white/90',
      tag: 'Obsidian Black',
      metalType: 'Matte Obsidian',
      watermark: 'HOLLYWOOD REBORN • VIP'
    };
  }

  // 5. Default Executive Silver & Black Vault
  return {
    gradient: 'from-[#151820] via-[#0f1117] to-[#06070a]',
    border: 'border-white/20 hover:border-white/50',
    glow: 'shadow-white/10',
    accent: 'text-slate-100',
    chip: 'from-[#ffffff] via-[#cbd5e1] to-[#64748b] border-white/90',
    tag: 'Silver Edition',
    metalType: 'Brushed Silver',
    watermark: 'HOLLYWOOD REBORN • VAULT'
  };
}
