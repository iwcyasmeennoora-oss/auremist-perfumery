import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import { formatPrice } from '../data/fragrances';
import { LUXURY_EASE } from '../lib/motion';
import { PerfumeProduct } from '../types/perfume';
import { LuxuryImage } from './LuxuryImage';

interface SearchModalProps {
  isOpen: boolean;
  products: PerfumeProduct[];
  onClose: () => void;
  onSelectProduct: (product: PerfumeProduct) => void;
}

export function SearchModal({
  isOpen,
  products,
  onClose,
  onSelectProduct,
}: SearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const q = query.trim().toLowerCase();
  const matches = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.fragranceFamily.toLowerCase().includes(q) ||
          p.audienceCategory.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.concentration.toLowerCase().includes(q) ||
          p.notes.some((note) => note.toLowerCase().includes(q)),
      )
    : products;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Search Auremist fragrances"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: LUXURY_EASE }}
            className="fixed inset-0 bg-[#26151D]/55 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
            className="relative z-10 w-full max-w-2xl rounded-xl bg-[#FFF5E9] border border-[#C69A50]/45 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#C69A50]/25 bg-[#F8EBDD]/60">
              <Search className="w-4 h-4 text-[#C69A50] shrink-0" strokeWidth={1.6} />
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by fragrance name or note (e.g. Oud, Neroli, Fig, Saffron)..."
                className="w-full bg-transparent text-sm text-[#26151D] placeholder:text-[#5C434E]/70 focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="p-1.5 text-[#5C434E] hover:text-[#430F25] cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#C69A50]/20">
              {matches.length === 0 ? (
                <div className="py-10 px-6 text-center text-sm text-[#5C434E]">
                  No fragrances found matching &ldquo;{query}&rdquo;. Try searching
                  for <span className="text-[#430F25]">Oud</span>,{' '}
                  <span className="text-[#430F25]">Rose</span>, or{' '}
                  <span className="text-[#430F25]">Saffron</span>.
                </div>
              ) : (
                matches.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectProduct(product);
                    }}
                    className="w-full px-5 py-3.5 flex items-center gap-4 text-left hover:bg-[#F8EBDD] transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-14 shrink-0 rounded-md bg-[#F8EBDD] overflow-hidden border border-[#C69A50]/25">
                      <LuxuryImage
                        src={product.image}
                        alt={product.name}
                        fallbackTitle={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-serif text-lg font-medium text-[#430F25]">
                          {product.name}
                        </span>
                        <span className="text-xs font-semibold text-[#26151D] tabular-nums">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C434E] truncate">
                        {product.notes.join(' · ')}
                        {!product.inStock ? ' · Out of Stock' : ''}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
