import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, ShoppingBag, Trash2, X } from 'lucide-react';
import { formatPrice } from '../data/fragrances';
import { LUXURY_EASE } from '../lib/motion';
import { BottleSize, PerfumeProduct } from '../types/perfume';
import { LuxuryImage } from './LuxuryImage';

interface WishlistDrawerProps {
  isOpen: boolean;
  products: PerfumeProduct[];
  onClose: () => void;
  onExploreShop: () => void;
  onViewProduct: (product: PerfumeProduct) => void;
  onAddToCart: (product: PerfumeProduct, size?: BottleSize) => void;
  onRemoveItem: (productId: string) => void;
  onClearWishlist: () => void;
}

export function WishlistDrawer({
  isOpen,
  products,
  onClose,
  onExploreShop,
  onViewProduct,
  onAddToCart,
  onRemoveItem,
  onClearWishlist,
}: WishlistDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Saved Wishlist"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
            className="fixed inset-0 bg-[#26151D]/55 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: LUXURY_EASE }}
            className="relative z-10 w-full max-w-md bg-[#FFF5E9] text-[#26151D] h-full flex flex-col border-l border-[#C69A50]/35 shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#C69A50]/25 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif text-2xl font-medium text-[#430F25]">
                  Your Wishlist
                </h2>
                <span className="text-xs text-[#5C434E] tabular-nums">
                  ({products.length})
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close wishlist"
                className="p-2 text-[#5C434E] hover:text-[#430F25] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Browser-Local Persistence Notice */}
            <div className="px-6 py-3.5 bg-[#F8EBDD] border-b border-[#C69A50]/25 flex items-center justify-between gap-3">
              <p className="text-xs text-[#430F25] font-medium leading-snug">
                Saved locally in this browser. Account sync requires backend login.
              </p>
              {products.length > 0 && (
                <button
                  type="button"
                  onClick={onClearWishlist}
                  className="text-[11px] font-medium text-[#5C434E] hover:text-[#430F25] underline underline-offset-4 shrink-0 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Wishlist Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {products.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-12 h-12 rounded-full border border-[#C69A50]/45 bg-[#F8EBDD] flex items-center justify-center mb-4">
                    <Heart className="w-5 h-5 text-[#430F25]" strokeWidth={1.4} />
                  </div>
                  <p className="font-serif text-2xl text-[#430F25] mb-2">
                    Your wishlist is empty
                  </p>
                  <p className="text-xs text-[#5C434E] max-w-[28ch] leading-relaxed mb-6">
                    Save your favourite AUREMIST creations with the heart icon to
                    revisit notes and bottle sizes anytime.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onExploreShop();
                    }}
                    className="px-6 py-3 rounded-lg bg-[#430F25] text-[#FFF5E9] border border-[#C69A50]/45 text-xs font-medium tracking-wide hover:bg-[#2B0817] transition-colors cursor-pointer"
                  >
                    Explore Collection
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-[#C69A50]/20">
                  <AnimatePresence initial={false}>
                    {products.map((product) => (
                      <motion.li
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={{ duration: 0.25, ease: LUXURY_EASE }}
                        className="py-4 flex gap-4"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onViewProduct(product);
                          }}
                          className="w-20 h-24 shrink-0 rounded-lg bg-[#F8EBDD] overflow-hidden border border-[#C69A50]/30 cursor-pointer"
                          aria-label={`View ${product.name}`}
                        >
                          <LuxuryImage
                            src={product.image}
                            alt={product.name}
                            fallbackTitle={product.name}
                            className="w-full h-full object-cover"
                          />
                        </button>

                        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onViewProduct(product);
                                }}
                                className="text-left block max-w-full cursor-pointer hover:underline"
                              >
                                <h3 className="font-serif text-lg font-medium text-[#26151D] leading-tight truncate">
                                  {product.name}
                                </h3>
                              </button>
                              <p className="text-xs text-[#5C434E] mt-0.5 truncate">
                                {product.fragranceFamily} · {product.concentration}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemoveItem(product.id)}
                              aria-label={`Remove ${product.name} from wishlist`}
                              className="p-1 text-[#5C434E] hover:text-[#430F25] transition-colors cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div>
                              <span className="text-sm font-semibold text-[#26151D] tabular-nums block">
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-[11px] text-[#5C434E]">
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={!product.inStock}
                                onClick={() => onAddToCart(product)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                  product.inStock
                                    ? 'bg-[#430F25] text-[#FFF5E9] border-[#C69A50]/50 hover:bg-[#2B0817] cursor-pointer'
                                    : 'bg-[#F8EBDD] text-[#5C434E] border-[#C69A50]/25 cursor-not-allowed'
                                }`}
                              >
                                <ShoppingBag
                                  className="w-3.5 h-3.5 text-[#C69A50]"
                                  strokeWidth={1.6}
                                />
                                <span>
                                  {product.inStock ? 'Add to Bag' : 'Sold Out'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {products.length > 0 && (
              <div className="p-6 bg-[#F8EBDD] border-t border-[#C69A50]/25">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onExploreShop();
                  }}
                  className="w-full py-3 px-5 rounded-lg bg-[#430F25] text-[#FFF5E9] border border-[#C69A50] text-xs font-medium tracking-wide hover:bg-[#2B0817] transition-colors cursor-pointer min-h-[44px]"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
