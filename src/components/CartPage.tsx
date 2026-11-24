import { FormEvent, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Gift,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { formatPrice } from '../data/fragrances';
import {
  calculateCartTotals,
  getVariantStockCount,
} from '../lib/cartPricing';
import { fadeUpVariants, LUXURY_EASE } from '../lib/motion';
import {
  AppliedCoupon,
  BottleSize,
  CartItem,
  PerfumeProduct,
} from '../types/perfume';
import { LuxuryImage } from './LuxuryImage';

interface CartPageProps {
  items: CartItem[];
  giftWrap: boolean;
  appliedCoupon: AppliedCoupon | null;
  onToggleGiftWrap: () => void;
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  onViewProduct: (product: PerfumeProduct) => void;
  onUpdateQuantity: (
    productId: string,
    size: BottleSize,
    delta: number,
  ) => void;
  onRemoveItem: (productId: string, size: BottleSize) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onApplyCoupon: (code: string) => { ok: boolean; message: string };
  onRemoveCoupon: () => void;
}

export function CartPage({
  items,
  giftWrap,
  appliedCoupon,
  onToggleGiftWrap,
  onNavigateHome,
  onNavigateShop,
  onViewProduct,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onApplyCoupon,
  onRemoveCoupon,
}: CartPageProps) {
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const { itemSubtotal, discountAmount, grandTotal } = calculateCartTotals(
    items,
    appliedCoupon,
  );

  const handleCouponSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = onApplyCoupon(couponInput);
    setCouponFeedback({
      type: result.ok ? 'success' : 'error',
      message: result.message,
    });
    if (result.ok) {
      setCouponInput('');
    }
  };

  const handleRemoveCouponClick = () => {
    onRemoveCoupon();
    setCouponFeedback({
      type: 'success',
      message: 'Coupon code removed from order summary.',
    });
  };

  return (
    <div className="bg-[#FFF5E9] text-[#26151D] overflow-x-hidden">
      {/* Page Header & Breadcrumb */}
      <section className="bg-[#F8F0E7] border-b border-[#D6AD72]/35 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div>
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-2 text-xs tracking-[0.14em] uppercase text-[#5C434E] mb-3"
              >
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="hover:text-[#351522] transition-colors cursor-pointer"
                >
                  Home
                </button>
                <ChevronRight
                  className="w-3.5 h-3.5 text-[#D6AD72]"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <span className="text-[#351522] font-semibold">
                  Shopping Cart
                </span>
              </nav>

              <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#351522] leading-tight">
                Your Shopping Bag
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-[#5C434E] tabular-nums">
              {totalCount === 0
                ? '0 items in bag'
                : `${totalCount} ${totalCount === 1 ? 'bottle' : 'bottles'} selected`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Cart Workspace */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        {items.length === 0 ? (
          /* Empty Cart State */
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl mx-auto py-16 px-6 text-center rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/40"
          >
            <div className="w-16 h-16 mx-auto rounded-full border border-[#D6AD72]/60 bg-[#FFF5E9] flex items-center justify-center mb-6">
              <ShoppingBag
                className="w-7 h-7 text-[#351522]"
                strokeWidth={1.4}
              />
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#351522] mb-3">
              Your shopping bag is empty
            </h2>

            <p className="text-sm text-[#5C434E] leading-relaxed max-w-md mx-auto mb-8">
              Discover small-batch Eau de Parfum and Extrait creations crafted to
              linger from morning light through evening stillness.
            </p>

            <button
              type="button"
              onClick={onNavigateShop}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-sm font-medium tracking-wide hover:bg-[#240D16] transition-colors cursor-pointer min-h-[46px]"
            >
              <span>Shop Now</span>
              <ArrowRight
                className="w-4 h-4 text-[#D6AD72]"
                strokeWidth={1.6}
              />
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-7 space-y-5 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D6AD72]/35">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#351522]">
                  Selected Fragrances ({items.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClearCart();
                    setCouponFeedback(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C434E] hover:text-[#351522] underline underline-offset-4 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                  <span>Clear Cart</span>
                </button>
              </div>

              <ul className="divide-y divide-[#D6AD72]/30 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/35">
                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const maxStock = getVariantStockCount(
                      item.product,
                      item.size,
                    );
                    const atMaxStock = item.quantity >= maxStock;
                    const itemLineSubtotal = item.unitPrice * item.quantity;

                    return (
                      <motion.li
                        key={`${item.product.id}-${item.size}`}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.24, ease: LUXURY_EASE }}
                        className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-5"
                      >
                        {/* Product Photograph */}
                        <button
                          type="button"
                          onClick={() => onViewProduct(item.product)}
                          className="w-24 sm:w-28 aspect-[3/4] shrink-0 rounded-lg overflow-hidden bg-[#F8F0E7] border border-[#D6AD72]/35 cursor-pointer self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#351522]"
                          aria-label={`View ${item.product.name}`}
                        >
                          <LuxuryImage
                            src={item.product.image}
                            alt={item.product.name}
                            fallbackTitle={item.product.name}
                            className="w-full h-full object-cover object-center hover:scale-[1.03] transition-transform duration-300"
                          />
                        </button>

                        {/* Item Details & Controls */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between gap-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span className="block text-[11px] uppercase tracking-[0.16em] text-[#8C6526] font-semibold mb-1">
                                {item.product.fragranceFamily} ·{' '}
                                {item.product.concentration}
                              </span>
                              <button
                                type="button"
                                onClick={() => onViewProduct(item.product)}
                                className="text-left block max-w-full cursor-pointer focus-visible:outline-none focus-visible:underline"
                              >
                                <h2 className="font-serif text-2xl font-medium text-[#26151D] hover:text-[#351522] transition-colors truncate">
                                  {item.product.name}
                                </h2>
                              </button>
                              <p className="text-xs text-[#5C434E] mt-1 tabular-nums">
                                Size:{' '}
                                <strong className="font-medium text-[#26151D]">
                                  {item.size}
                                </strong>
                                <span
                                  className="mx-1.5 text-[#D6AD72]"
                                  aria-hidden="true"
                                >
                                  ·
                                </span>
                                SKU: {item.sku}
                              </p>
                              <p className="text-xs text-[#5C434E] mt-1 tabular-nums">
                                Unit Price: {formatPrice(item.unitPrice)}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                onRemoveItem(item.product.id, item.size)
                              }
                              aria-label={`Remove ${item.product.name} (${item.size})`}
                              className="inline-flex items-center gap-1 text-xs text-[#5C434E] hover:text-[#351522] transition-colors cursor-pointer shrink-0 py-1.5 px-2.5 rounded-md hover:bg-[#F8F0E7]"
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>

                          {/* Quantity Stepper + Stock Status + Item Subtotal */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D6AD72]/25">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="inline-flex items-center rounded-lg border border-[#D6AD72]/45 bg-[#F8F0E7]">
                                <button
                                  type="button"
                                  disabled={item.quantity <= 1}
                                  onClick={() =>
                                    onUpdateQuantity(
                                      item.product.id,
                                      item.size,
                                      -1,
                                    )
                                  }
                                  aria-label={`Decrease quantity of ${item.product.name}`}
                                  className="p-2 text-[#351522] hover:bg-[#FFF5E9] rounded-l-lg transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed min-w-[38px] min-h-[38px] flex items-center justify-center"
                                >
                                  <Minus className="w-3.5 h-3.5" strokeWidth={1.6} />
                                </button>
                                <span
                                  aria-label="Quantity"
                                  className="px-3.5 text-sm font-medium tabular-nums min-w-[36px] text-center"
                                >
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
                                  aria-label={`Increase quantity of ${item.product.name}`}
                                  className="p-2 text-[#351522] hover:bg-[#FFF5E9] rounded-r-lg transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed min-w-[38px] min-h-[38px] flex items-center justify-center"
                                >
                                  <Plus className="w-3.5 h-3.5" strokeWidth={1.6} />
                                </button>
                              </div>

                              <span className="text-[11px] text-[#5C434E] tabular-nums">
                                {atMaxStock
                                  ? `Max stock reached (${maxStock})`
                                  : `${maxStock} in stock`}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="block text-[11px] uppercase tracking-[0.14em] text-[#5C434E]">
                                Item Subtotal
                              </span>
                              <span className="font-serif text-xl font-semibold text-[#351522] tabular-nums">
                                {formatPrice(itemLineSubtotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>

              {/* Bottom Continue Shopping */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={onNavigateShop}
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#351522] hover:text-[#8C6526] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
                  <span>Continue Shopping</span>
                </button>
              </div>
            </div>

            {/* Right Column: Coupon Input & Order Summary */}
            <aside
              aria-label="Order summary"
              className="lg:col-span-5 lg:sticky lg:top-24 rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/40 p-6 sm:p-7 space-y-6 min-w-0"
            >
              <h2 className="font-serif text-3xl font-medium text-[#351522] pb-4 border-b border-[#D6AD72]/30">
                Order Summary
              </h2>

              {/* Coupon Section (Prepared for Backend Verification) */}
              <div className="space-y-3 pb-5 border-b border-[#D6AD72]/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="cart-discount-code"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#351522]"
                  >
                    <Tag className="w-3.5 h-3.5 text-[#8C6526]" strokeWidth={1.6} />
                    <span>Coupon Code</span>
                  </label>
                  <span className="text-[11px] text-[#5C434E]">
                    Server Verification Pending
                  </span>
                </div>

                <form
                  onSubmit={handleCouponSubmit}
                  className="flex flex-col sm:flex-row gap-2.5"
                >
                  <input
                    id="cart-discount-code"
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/55 text-sm text-[#26151D] placeholder:text-[#5C434E]/70 focus:outline-none focus:border-[#351522]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-xs font-medium tracking-wide hover:bg-[#240D16] transition-colors cursor-pointer whitespace-nowrap min-h-[42px]"
                  >
                    Apply
                  </button>
                </form>

                <p className="text-[11px] text-[#5C434E] leading-relaxed">
                  No live promotions are active on this preview. Any entered code
                  will be verified against backend promotion rules once checkout is
                  connected.
                </p>

                {/* Applied Coupon State */}
                {appliedCoupon && (
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs">
                    <span className="text-[#351522] font-medium">
                      <strong>{appliedCoupon.code}</strong> ·{' '}
                      {appliedCoupon.label}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCouponClick}
                      aria-label={`Remove coupon ${appliedCoupon.code}`}
                      className="inline-flex items-center gap-1 text-[#5C434E] hover:text-[#351522] cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={1.6} />
                      <span>Remove</span>
                    </button>
                  </div>
                )}

                {/* Validation Feedback Message */}
                {couponFeedback && (
                  <div
                    role={couponFeedback.type === 'error' ? 'alert' : 'status'}
                    className={`flex items-start gap-2 text-xs leading-relaxed ${
                      couponFeedback.type === 'error'
                        ? 'text-[#7A1D38]'
                        : 'text-[#351522]'
                    }`}
                  >
                    {couponFeedback.type === 'error' ? (
                      <AlertCircle
                        className="w-3.5 h-3.5 shrink-0 mt-0.5"
                        strokeWidth={1.8}
                      />
                    ) : (
                      <Check
                        className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#8C6526]"
                        strokeWidth={2}
                      />
                    )}
                    <span>{couponFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Complimentary Gift Presentation Option */}
              <label className="flex items-start gap-3 cursor-pointer select-none pb-5 border-b border-[#D6AD72]/30">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={onToggleGiftWrap}
                  className="mt-0.5 accent-[#351522] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-[#351522] leading-relaxed">
                  <span className="font-medium inline-flex items-center gap-1.5">
                    <Gift
                      className="w-3.5 h-3.5 text-[#8C6526]"
                      strokeWidth={1.6}
                    />
                    Complimentary Gold Coffret Presentation
                  </span>
                  <span className="block text-[#5C434E] mt-0.5">
                    Includes embossed box, burgundy ribbon &amp; matching 2ml
                    discovery vial.
                  </span>
                </span>
              </label>

              {/* Itemized PKR Summary Rows */}
              <dl className="space-y-3.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#5C434E]">Item Subtotal</dt>
                  <dd className="font-medium text-[#26151D] tabular-nums">
                    {formatPrice(itemSubtotal)}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#5C434E]">
                    Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ''}
                  </dt>
                  <dd className="font-medium text-[#351522] tabular-nums">
                    {discountAmount > 0
                      ? `− ${formatPrice(discountAmount)}`
                      : formatPrice(0)}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[#5C434E]">Delivery Fee</dt>
                  <dd className="text-right text-xs text-[#351522] max-w-[200px] leading-snug">
                    Pending delivery zone selection &amp; shipping rules
                  </dd>
                </div>

                <div className="pt-4 border-t border-[#D6AD72]/35 flex items-baseline justify-between gap-4">
                  <div>
                    <dt className="text-sm font-semibold text-[#26151D]">
                      Grand Total
                    </dt>
                    <span className="block text-[11px] text-[#5C434E]">
                      Excludes pending delivery calculation
                    </span>
                  </div>
                  <dd className="font-serif text-3xl font-semibold text-[#351522] tabular-nums">
                    {formatPrice(grandTotal)}
                  </dd>
                </div>
              </dl>

              {/* Primary & Secondary Actions */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={onProceedToCheckout}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-sm font-medium tracking-wide hover:bg-[#240D16] transition-colors cursor-pointer min-h-[48px]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight
                    className="w-4 h-4 text-[#D6AD72]"
                    strokeWidth={1.7}
                  />
                </button>

                <button
                  type="button"
                  onClick={onNavigateShop}
                  className="w-full py-2.5 px-4 rounded-lg border border-[#D6AD72]/50 bg-[#FFF5E9] text-xs font-medium text-[#351522] hover:border-[#351522] transition-colors cursor-pointer min-h-[42px]"
                >
                  Continue Shopping
                </button>
              </div>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
