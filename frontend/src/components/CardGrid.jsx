import React, { useState, useMemo } from 'react';
import CardItem from './CardItem';
import { ArrowUpDown, Globe, SlidersHorizontal, ShieldAlert, Search, Filter } from 'lucide-react';

export default function CardGrid({ 
  cards, 
  loading, 
  error, 
  selectedCategory, 
  searchQuery, 
  setSearchQuery,
  cart, 
  onAddToCart, 
  onBuyNow 
}) {
  const [sortBy, setSortBy] = useState('featured');
  const [countryFilter, setCountryFilter] = useState('All');

  // Extract unique countries for sub-filtering
  const uniqueCountries = useMemo(() => {
    const countries = new Set(cards.map(c => c.country || c.category || 'United States'));
    return ['All', ...Array.from(countries)];
  }, [cards]);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    return cards
      .filter((card) => {
        const cardCountry = card.country || card.category || 'United States';
        
        // Category / Country filter from Hero pills
        if (selectedCategory !== 'All' && cardCountry !== selectedCategory && card.category !== selectedCategory) {
          return false;
        }
        // Sub-filter by country dropdown
        if (countryFilter !== 'All' && cardCountry !== countryFilter) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCountry = cardCountry.toLowerCase().includes(q);
          const matchTitle = card.title?.toLowerCase().includes(q);
          const matchPrice = card.price.toString().includes(q) || card.face_value.toString().includes(q);
          if (!matchCountry && !matchTitle && !matchPrice) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          return a.price - b.price;
        }
        if (sortBy === 'price-high') {
          return b.price - a.price;
        }
        if (sortBy === 'discount') {
          const discA = ((a.face_value - a.price) / a.face_value) || 0;
          const discB = ((b.face_value - b.price) / b.face_value) || 0;
          return discB - discA;
        }
        return 0; // Default order
      });
  }, [cards, selectedCategory, countryFilter, searchQuery, sortBy]);

  const cartCardIds = useMemo(() => new Set(cart.map(item => item.id)), [cart]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-medium text-xs tracking-wider uppercase font-mono">
          Decrypting Cold Storage Catalog...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto my-12 p-6 rounded-2xl bg-red-950/20 border border-red-800/30 text-center">
        <ShieldAlert className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400 font-bold text-sm mb-1">Catalog Connection Interrupted</p>
        <p className="text-xs text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Mobile Search Bar */}
      {setSearchQuery && (
        <div className="block md:hidden mb-5">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search cards by country or price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-[#0c0e14] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40 font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sub-header Controls: Title, Count, Country selector, Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08] mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide font-display">
            {selectedCategory === 'All' ? 'Cold Vault Cards' : `${selectedCategory} Cards`}
          </h2>
          <span className="px-2 py-0.5 rounded bg-[#0e1118] text-slate-300 border border-white/[0.1] text-[10px] sm:text-[11px] font-mono">
            {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'}
          </span>
        </div>

        {/* Filters and Sorting */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 sm:pt-0">
          
          {/* Sub-category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-[#0c0e14] border border-white/[0.1] rounded-xl px-2.5 py-1.5 shrink-0">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {uniqueCountries.map(c => (
                <option key={c} value={c} className="bg-[#0f1219] text-white">
                  {c === 'All' ? 'All Territories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-[#0c0e14] border border-white/[0.1] rounded-xl px-2.5 py-1.5 shrink-0">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-[#0f1219] text-white">Featured</option>
              <option value="discount" className="bg-[#0f1219] text-white">Highest Discount</option>
              <option value="price-low" className="bg-[#0f1219] text-white">Price: Low to High</option>
              <option value="price-high" className="bg-[#0f1219] text-white">Price: High to Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredCards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              isInCart={cartCardIds.has(card.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl bg-[#0c0e14] border border-dashed border-white/[0.1] max-w-md mx-auto">
          <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center mx-auto text-slate-400 mb-2.5 border border-white/[0.08]">
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white mb-1 font-display">No Available Cards in This Filter</h3>
          <p className="text-[11px] text-slate-400 mb-3">Select "All Territories" to view full stock.</p>
          <button
            onClick={() => {
              setCountryFilter('All');
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-white/10 border border-white/25 rounded-xl hover:bg-white/20 cursor-pointer transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
