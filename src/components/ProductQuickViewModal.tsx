import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, Heart, X } from 'lucide-react';
import { formatPrice } from '../data/fragrances';
import { LUXURY_EASE } from '../lib/motion';
import { BottleSize, CartItem, PerfumeProduct } from '../types/perfume';
import { LuxuryImage } from './LuxuryImage';

interface ProductQuickViewModalProps {
  product: PerfumeProduct | null;
  cartItems: CartItem[];
  isWishlisted: boolean;
  onClose: () => void;
  onAddToCart: (product: PerfumeProduct, size: BottleSize) => void;
  onToggleWishlist: (product: PerfumeProduct) => void;
  onViewFullDetails?: (product: PerfumeProduct) => void;
}

function getInitialQuickViewSize(product: PerfumeProduct): BottleSize {
  const preferred = product.variants.find((v) => v.size === product.defaultSize);
  if (preferred && preferred.stockCount > 0) return preferred.size;
  const firstAvailable = product.variants.find((v) => v.stockCount > 0);
  return (firstAvailable ?? product.variants[0]).size;
}

export function ProductQuickViewModal({
  product,
  cartItems,
  isWishlisted,
  onClose,
  onAddToCart,
  onToggleWishlist,
  onViewFullDetails,
}: ProductQuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<BottleSize>('100ml');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize(getInitialQuickViewSize(product));
    }
    setAdded(false);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  const activeVariant = product
    ? (product.variants.find((v) => v.size === selectedSize) ??
      product.variants[product.variants.length - 1])
    : null;

  const inCartQty =
    product && activeVariant
      ? (cartItems.find(
          (item) =>
            item.product.id === product.id && item.size === activeVariant.size,
        )?.quantity ?? 0)
      : 0;
  const isVariantAvailable = Boolean(
    product && product.inStock && activeVariant && activeVariant.stockCount > 0,
  );
  const remainingStock =
    isVariantAvailable && activeVariant
      ? Math.max(0, activeVariant.stockCount - inCartQty)
      : 0;
  const canAdd = isVariantAvailable && remainingStock > 0;

  const handleAdd = () => {
    if (!product || !activeVariant || !canAdd) return;
    onAddToCart(product, activeVariant.size);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <AnimatePresence>
      {product && activeVariant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} fragrance details`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
            className="fixed inset-0 bg-[#26151D]/55 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: LUXURY_EASE }}
            className="relative z-10 w-full max-w-3xl rounded-xl bg-[#FFF5E9] text-[#26151D] border border-[#C69A50]/45 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close fragrance details"
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-[#FFF5E9]/90 text-[#430F25] hover:bg-[#F8EBDD] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Bottle Visual */}
            <div className="md:col-span-5 bg-[#F8EBDD] aspect-[3/4] md:aspect-auto">
              <LuxuryImage
                src={product.image}
                alt={product.name}
                fallbackTitle={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Fragrance Notes & Variant Selection */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-[#C69A50] font-semibold mb-2">
                  <span>{product.label}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#5C434E]">{product.category}</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#430F25]">
                  {product.name}
                </h2>
                <p className="font-serif italic text-lg text-[#5C434E] mt-1 mb-4">
                  {product.subtitle}
                </p>

                <p className="text-sm text-[#26151D]/85 leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Olfactive Pyramid */}
                <div className="space-y-2.5 py-4 border-t border-b border-[#C69A50]/25 mb-6 text-xs">
                  <div className="flex gap-3">
                    <span className="w-16 shrink-0 uppercase tracking-wider text-[#C69A50] font-semibold">
                      Top
                    </span>
                    <span className="text-[#26151D]">{product.pyramid.top}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-16 shrink-0 uppercase tracking-wider text-[#C69A50] font-semibold">
                      Heart
                    </span>
                    <span className="text-[#26151D]">{product.pyramid.heart}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-16 shrink-0 uppercase tracking-wider text-[#C69A50] font-semibold">
                      Base
                    </span>
                    <span className="text-[#26151D]">{product.pyramid.base}</span>
                  </div>
                </div>

                {/* Bottle Volume Selector */}
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-wider text-[#5C434E] block mb-2">
                    Flacon Size
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => {
                      const active = variant.size === selectedSize;
                      const variantStocked =
                        product.inStock && variant.stockCount > 0;
                      return (
                        <button
                          key={variant.size}
                          type="button"
                          onClick={() => setSelectedSize(variant.size)}
                          className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#430F25] text-[#FFF5E9] border-[#C69A50]/60'
                              : variantStocked
                                ? 'bg-[#F8EBDD] text-[#26151D] border-[#C69A50]/30 hover:border-[#430F25]'
                                : 'bg-[#F8EBDD]/50 text-[#5C434E] border-[#C69A50]/20'
                          }`}
                        >
                          {variant.size} · {formatPrice(variant.price)}
                          {!variantStocked ? ' (Out)' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Purchase Action Row */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-[#5C434E] block">
                      {product.concentration} · {activeVariant.size}
                    </span>
                    <span className="font-serif text-2xl font-semibold text-[#430F25] tabular-nums">
                      {formatPrice(activeVariant.price)}
                    </span>
                  </div>

                  <motion.button
                    type="button"
                    disabled={!canAdd}
                    whileTap={canAdd ? { scale: 0.97 } : undefined}
                    onClick={handleAdd}
                    className={`px-6 py-3.5 rounded-lg text-xs font-medium tracking-wide transition-colors inline-flex items-center gap-2 min-h-[44px] border ${
                      !canAdd
                        ? 'bg-[#F8EBDD] text-[#5C434E] border-[#C69A50]/30 cursor-not-allowed'
                        : added
                          ? 'bg-[#C69A50] text-[#26151D] border-[#C69A50] cursor-pointer'
                          : 'bg-[#430F25] text-[#FFF5E9] border-[#C69A50]/45 hover:bg-[#2B0817] cursor-pointer'
                    }`}
                  >
                    {added && <Check className="w-4 h-4" strokeWidth={2} />}
                    <span>
                      {!isVariantAvailable
                        ? 'Out of Stock'
                        : remainingStock === 0
                          ? 'Max Stock in Bag'
                          : added
                            ? 'Added to Bag'
                            : 'Add to Shopping Bag'}
                    </span>
                  </motion.button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  {onViewFullDetails && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewFullDetails(product);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#430F25] hover:text-[#C69A50] underline underline-offset-4 transition-colors cursor-pointer"
                    >
                      <span>View Full Product Page</span>
                      <ArrowRight
                        className="w-3.5 h-3.5"
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onToggleWishlist(product)}
                    aria-pressed={isWishlisted}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#430F25] hover:text-[#C69A50] transition-colors cursor-pointer"
                  >
                    <Heart
                      className="w-3.5 h-3.5"
                      strokeWidth={1.7}
                      fill={isWishlisted ? 'currentColor' : 'none'}
                    />
                    <span>
                      {isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
