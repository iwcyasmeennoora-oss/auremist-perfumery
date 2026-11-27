import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Gift, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { formatPrice } from '../data/fragrances';
import {
  calculateCartTotals,
  getVariantStockCount,
} from '../lib/cartPricing';
import { LUXURY_EASE } from '../lib/motion';
import { AppliedCoupon, BottleSize, CartItem } from '../types/perfume';
import { LuxuryImage } from './LuxuryImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  giftWrap: boolean;
  appliedCoupon: AppliedCoupon | null;
  onToggleGiftWrap: () => void;
  onClose: () => void;
  onExploreShop: () => void;
  onViewCart: () => void;
  onUpdateQuantity: (productId: string, size: BottleSize, delta: number) => void;
  onRemoveItem: (productId: string, size: BottleSize) => void;
}

export function CartDrawer({
  isOpen,
  items,
  giftWrap,
  appliedCoupon,
  onToggleGiftWrap,
  onClose,
  onExploreShop,
  onViewCart,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const { itemSubtotal, discountAmount, grandTotal } = calculateCartTotals(
    items,
    appliedCoupon,
  );
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Bag"
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
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-[#C69A50]/25 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif text-2xl font-medium text-[#430F25]">
                  Your Shopping Bag
                </h2>
                <span className="text-xs text-[#5C434E] tabular-nums">
                  ({totalCount})
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close shopping bag"
                className="p-2 text-[#5C434E] hover:text-[#430F25] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Delivery Charges Notice */}
            <div className="px-6 py-3.5 bg-[#F8EBDD] border-b border-[#C69A50]/25">
              <p className="text-xs text-[#430F25] font-medium">
                Delivery charges are calculated at checkout by delivery zone.
              </p>
            </div>

            {/* Itemized Cart List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-12 h-12 rounded-full border border-[#C69A50]/45 bg-[#F8EBDD] flex items-center justify-center mb-4">
                    <ShoppingBag className="w-5 h-5 text-[#430F25]" strokeWidth={1.4} />
                  </div>
                  <p className="font-serif text-2xl text-[#430F25] mb-2">
                    Your bag is currently empty
                  </p>
                  <p className="text-xs text-[#5C434E] max-w-[26ch] leading-relaxed mb-6">
                    Explore our signature Eau de Parfum collection to find the notes
                    that feel like you.
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
                    {items.map((item) => {
                      const maxStock = getVariantStockCount(
                        item.product,
                        item.size,
                      );
                      const atMaxStock = item.quantity >= maxStock;

                      return (
                        <motion.li
                          key={`${item.product.id}-${item.size}`}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 24 }}
                          transition={{ duration: 0.25, ease: LUXURY_EASE }}
                          className="py-4 flex gap-4"
                        >
                          <div className="w-20 h-24 shrink-0 rounded-lg bg-[#F8EBDD] overflow-hidden border border-[#C69A50]/30">
                            <LuxuryImage
                              src={item.product.image}
                              alt={item.product.name}
                              fallbackTitle={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-serif text-lg font-medium text-[#26151D] leading-tight">
                                  {item.product.name}
                                </h3>
                                <p className="text-xs text-[#5C434E] mt-0.5 tabular-nums">
                                  {item.product.concentration} · {item.size} ·{' '}
                                  {item.sku}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  onRemoveItem(item.product.id, item.size)
                                }
                                aria-label={`Remove ${item.product.name}`}
                                className="p-1 text-[#5C434E] hover:text-[#430F25] transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div className="inline-flex items-center rounded-lg border border-[#C69A50]/35 bg-[#F8EBDD]">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateQuantity(
                                      item.product.id,
                                      item.size,
                                      -1,
                                    )
                                  }
                                  aria-label="Decrease quantity"
                                  className="p-1.5 text-[#430F25] hover:bg-[#FFF5E9] rounded-l-lg transition-colors cursor-pointer"
                                >
                                  <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                                </button>
                                <span className="px-3 text-xs font-medium tabular-nums">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  disabled={atMaxStock}
                                  onClick={() =>
                                    onUpdateQuantity(
                                      item.product.id,
                                      item.size,
                                      1,
                                    )
                                  }
                                  aria-label="Increase quantity"
                                  className="p-1.5 text-[#430F25] hover:bg-[#FFF5E9] rounded-r-lg transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                                </button>
                              </div>

                              <span className="text-sm font-semibold text-[#26151D] tabular-nums">
                                {formatPrice(item.unitPrice * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Drawer Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-[#F8EBDD] border-t border-[#C69A50]/25 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={onToggleGiftWrap}
                    className="mt-0.5 accent-[#430F25] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-[#430F25] leading-relaxed">
                    <span className="font-medium inline-flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-[#C69A50]" strokeWidth={1.6} />
                      Complimentary Gold Coffret Presentation
                    </span>
                    <span className="block text-[#5C434E] mt-0.5">
                      Includes embossed gift box, burgundy satin ribbon &amp; 2 ml
                      matching discovery vial.
                    </span>
                  </span>
                </label>

                <div className="pt-3 border-t border-[#C69A50]/25 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#5C434E]">
                    <span>Item Subtotal</span>
                    <span className="tabular-nums font-medium text-[#26151D]">
                      {formatPrice(itemSubtotal)}
                    </span>
                  </div>
                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex items-center justify-between text-[#430F25]">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span className="tabular-nums font-medium">
                        − {formatPrice(discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1.5">
                    <span className="text-sm text-[#5C434E]">
                      Subtotal (excl. shipping)
                    </span>
                    <span className="font-serif text-2xl font-semibold text-[#430F25] tabular-nums">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewCart();
                  }}
                  className="w-full py-3 px-5 rounded-lg bg-[#430F25] text-[#FFF5E9] border border-[#C69A50] text-xs font-medium tracking-wide hover:bg-[#2B0817] transition-colors cursor-pointer min-h-[44px]"
                >
                  View Shopping Cart &amp; Coupons
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
