import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import { formatPrice } from '../data/fragrances';
import {
  fadeUpVariants,
  LUXURY_EASE,
  staggerContainerVariants,
  staggerItemVariants,
} from '../lib/motion';
import {
  BottleSize,
  BottleVariant,
  CartItem,
  PerfumeProduct,
} from '../types/perfume';
import { LuxuryImage } from './LuxuryImage';

interface ProductDetailPageProps {
  product: PerfumeProduct;
  allProducts: PerfumeProduct[];
  cartItems: CartItem[];
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  onViewDetails: (product: PerfumeProduct) => void;
  onOpenCart: () => void;
  onAddToCart: (
    product: PerfumeProduct,
    size?: BottleSize,
    quantity?: number,
  ) => void;
}

function getInitialAvailableSize(product: PerfumeProduct): BottleSize {
  const preferred = product.variants.find((v) => v.size === product.defaultSize);
  if (preferred && preferred.stockCount > 0) {
    return preferred.size;
  }
  const firstInStock = product.variants.find((v) => v.stockCount > 0);
  return (firstInStock ?? product.variants[0]).size;
}

export function ProductDetailPage({
  product,
  allProducts,
  cartItems,
  onNavigateHome,
  onNavigateShop,
  onViewDetails,
  onOpenCart,
  onAddToCart,
}: ProductDetailPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<BottleSize>(() =>
    getInitialAvailableSize(product),
  );
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState<{
    size: BottleSize;
    quantity: number;
  } | null>(null);

  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedSize(getInitialAvailableSize(product));
    setQuantity(1);
    setAddedFeedback(null);
  }, [product]);

  const gallery =
    product.gallery.length > 0
      ? product.gallery
      : [
          {
            src: product.image,
            alt: `${product.name} by AUREMIST`,
            caption: 'Signature Flacon',
          },
        ];

  const activeImage = gallery[selectedImageIndex] ?? gallery[0];

  const activeVariant: BottleVariant =
    product.variants.find((v) => v.size === selectedSize) ??
    product.variants[0];

  const inCartQuantity =
    cartItems.find(
      (item) =>
        item.product.id === product.id && item.size === activeVariant.size,
    )?.quantity ?? 0;

  const isVariantAvailable = product.inStock && activeVariant.stockCount > 0;
  const remainingStock = isVariantAvailable
    ? Math.max(0, activeVariant.stockCount - inCartQuantity)
    : 0;
  const canAddToCart = isVariantAvailable && remainingStock > 0;
  const maxSelectableQuantity = Math.max(1, remainingStock);

  useEffect(() => {
    setQuantity((prev) => Math.max(1, Math.min(prev, maxSelectableQuantity)));
  }, [maxSelectableQuantity]);

  const relatedProducts = useMemo(() => {
    const sameFamilyOrAudience = allProducts.filter(
      (p) =>
        p.id !== product.id &&
        (p.fragranceFamily === product.fragranceFamily ||
          p.audienceCategory === product.audienceCategory),
    );
    const fallback = allProducts.filter(
      (p) =>
        p.id !== product.id &&
        !sameFamilyOrAudience.some((existing) => existing.id === p.id),
    );
    return [...sameFamilyOrAudience, ...fallback].slice(0, 3);
  }, [allProducts, product]);

  const handleSelectSize = (variant: BottleVariant) => {
    setSelectedSize(variant.size);
    setAddedFeedback(null);
    const existingQty =
      cartItems.find(
        (item) => item.product.id === product.id && item.size === variant.size,
      )?.quantity ?? 0;
    const avail = Math.max(0, variant.stockCount - existingQty);
    setQuantity(avail > 0 ? Math.max(1, Math.min(quantity, avail)) : 1);
  };

  const handleAdd = () => {
    if (!canAddToCart) return;
    const boundedQty = Math.min(quantity, remainingStock);
    if (boundedQty <= 0) return;
    onAddToCart(product, activeVariant.size, boundedQty);
    setAddedFeedback({ size: activeVariant.size, quantity: boundedQty });
    setQuantity(1);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((idx) => (idx - 1 + gallery.length) % gallery.length);
  };

  const handleNextImage = () => {
    setSelectedImageIndex((idx) => (idx + 1) % gallery.length);
  };

  const hasSale =
    typeof activeVariant.originalPrice === 'number' &&
    activeVariant.originalPrice > activeVariant.price;
  const savingsAmount = hasSale
    ? (activeVariant.originalPrice ?? 0) - activeVariant.price
    : 0;

  const fragranceProfileItems = useMemo(() => {
    const entries: Array<{
      label: string;
      value: string;
      tabular?: boolean;
      wide?: boolean;
    }> = [
      { label: 'Fragrance Family', value: product.fragranceFamily },
      { label: 'Concentration', value: product.concentration },
    ];

    if (product.fragranceProfile.intendedAudience) {
      entries.push({
        label: 'Intended Audience',
        value: product.fragranceProfile.intendedAudience,
      });
    }
    if (product.fragranceProfile.longevity) {
      entries.push({
        label: 'Demo Longevity',
        value: product.fragranceProfile.longevity,
        tabular: true,
      });
    }
    if (product.fragranceProfile.projection) {
      entries.push({
        label: 'Demo Projection / Sillage',
        value: product.fragranceProfile.projection,
      });
    }
    if (product.fragranceProfile.season) {
      entries.push({
        label: 'Suitable Season',
        value: product.fragranceProfile.season,
      });
    }
    if (product.fragranceProfile.occasion) {
      entries.push({
        label: 'Suitable Occasion',
        value: product.fragranceProfile.occasion,
        wide: true,
      });
    }

    return entries;
  }, [product]);

  return (
    <div className="bg-[#FFF5E9] text-[#26151D]">
      {/* Breadcrumb & Back Strip */}
      <div className="border-b border-[#D6AD72]/30 bg-[#F8F0E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs tracking-[0.14em] uppercase text-[#5C434E]"
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
            <button
              type="button"
              onClick={onNavigateShop}
              className="hover:text-[#351522] transition-colors cursor-pointer"
            >
              Shop
            </button>
            <ChevronRight
              className="w-3.5 h-3.5 text-[#D6AD72]"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <span className="text-[#351522] font-semibold">{product.name}</span>
          </nav>

          <button
            type="button"
            onClick={onNavigateShop}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#351522] hover:text-[#D6AD72] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Product Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Responsive Product Image Gallery */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div className="max-w-xl mx-auto space-y-4">
              {/* Primary Image Frame */}
              <div
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') handlePrevImage();
                  if (e.key === 'ArrowRight') handleNextImage();
                }}
                aria-label={`${product.name} image gallery`}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F8F0E7] border border-[#D6AD72]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#351522]"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${product.id}-${activeImage.src}`}
                    initial={{ opacity: 0.35, scale: 1.015 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.35 }}
                    transition={{ duration: 0.32, ease: LUXURY_EASE }}
                    className="w-full h-full"
                  >
                    <LuxuryImage
                      src={activeImage.src}
                      alt={activeImage.alt}
                      fallbackTitle={product.name}
                      loading="eager"
                      className="w-full h-full object-cover object-center"
                    />
                  </motion.div>
                </AnimatePresence>

                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      aria-label="Previous product photograph"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FFF5E9]/90 border border-[#D6AD72]/55 text-[#351522] flex items-center justify-center opacity-85 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 hover:bg-[#351522] hover:text-[#FFF5E9] transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" strokeWidth={1.7} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      aria-label="Next product photograph"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FFF5E9]/90 border border-[#D6AD72]/55 text-[#351522] flex items-center justify-center opacity-85 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 hover:bg-[#351522] hover:text-[#FFF5E9] transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" strokeWidth={1.7} />
                    </button>
                  </>
                )}
              </div>

              {/* Image Caption & Index */}
              <div className="flex items-center justify-between text-xs text-[#5C434E] px-0.5">
                <span>{activeImage.caption}</span>
                <span className="tabular-nums">
                  {selectedImageIndex + 1} / {gallery.length}
                </span>
              </div>

              {/* Clickable Thumbnails */}
              <div
                className="grid grid-cols-4 gap-3"
                role="group"
                aria-label="Product gallery thumbnails"
              >
                {gallery.map((img, idx) => {
                  const isSelected = idx === selectedImageIndex;
                  return (
                    <button
                      key={`${product.id}-thumb-${idx}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      aria-label={`View ${img.caption}`}
                      aria-current={isSelected ? 'true' : undefined}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden bg-[#F8F0E7] border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#351522] ${
                        isSelected
                          ? 'border-[#351522] ring-2 ring-[#D6AD72]/75'
                          : 'border-[#D6AD72]/35 opacity-75 hover:opacity-100 hover:border-[#351522]/60'
                      }`}
                    >
                      <LuxuryImage
                        src={img.src}
                        alt={img.alt}
                        fallbackTitle={img.caption}
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Product Info, Variant Selector, Shopping Controls & Fragrance Notes */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 max-w-xl"
          >
            {/* Unboxed Metadata Kicker & Stock Availability */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] tracking-[0.18em] uppercase mb-3">
              <div className="flex flex-wrap items-center gap-2 text-[#8C6526] font-semibold">
                <span>{product.fragranceFamily}</span>
                <span aria-hidden="true">·</span>
                <span>{product.audienceCategory}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#351522]">{product.concentration}</span>
              </div>

              <span
                className={`font-semibold tracking-[0.14em] tabular-nums ${
                  canAddToCart ? 'text-[#351522]' : 'text-[#5C434E]'
                }`}
              >
                {!isVariantAvailable
                  ? 'Out of Stock'
                  : remainingStock === 0
                    ? `In Bag · ${activeVariant.stockCount} Max`
                    : activeVariant.stockCount <= 4
                      ? `Low Stock · ${activeVariant.stockCount} left`
                      : `In Stock · ${activeVariant.stockCount} available`}
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#351522] leading-tight mb-2">
              {product.name}
            </h1>

            <p className="font-serif italic text-xl text-[#5C434E] mb-5">
              {product.subtitle}
            </p>

            {/* PKR Price (Original + Sale when applicable) & SKU */}
            <div className="flex flex-wrap items-baseline justify-between gap-4 pb-5 mb-6 border-b border-[#D6AD72]/30">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-serif text-3xl sm:text-[34px] font-semibold text-[#26151D] tabular-nums">
                  {formatPrice(activeVariant.price)}
                </span>
                {hasSale && activeVariant.originalPrice && (
                  <>
                    <span className="text-base text-[#5C434E] line-through tabular-nums">
                      {formatPrice(activeVariant.originalPrice)}
                    </span>
                    <span className="text-xs font-semibold text-[#351522] tabular-nums">
                      Save {formatPrice(savingsAmount)}
                    </span>
                  </>
                )}
              </div>

              <div className="text-xs text-[#5C434E] tabular-nums">
                <span>SKU: {activeVariant.sku}</span>
                <span className="mx-2 text-[#D6AD72]" aria-hidden="true">
                  ·
                </span>
                <span>{product.concentrationPercent}</span>
              </div>
            </div>

            {/* Short + Full Description */}
            <div className="mb-7 space-y-2.5">
              <p className="text-sm sm:text-[15px] font-medium text-[#351522] leading-relaxed">
                {product.description}
              </p>
              {product.fullDescription && (
                <p className="text-xs sm:text-sm text-[#26151D]/80 leading-relaxed">
                  {product.fullDescription}
                </p>
              )}
            </div>

            {/* Size Selection (30ml / 50ml / 100ml where available) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#5C434E] font-semibold">
                  Select Bottle Size
                </span>
                <span className="text-xs text-[#5C434E] tabular-nums">
                  {activeVariant.size} · {activeVariant.sku}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {product.variants.map((variant) => {
                  const isSelected = variant.size === activeVariant.size;
                  const available = product.inStock && variant.stockCount > 0;
                  return (
                    <button
                      key={variant.sku}
                      type="button"
                      onClick={() => handleSelectSize(variant)}
                      aria-pressed={isSelected}
                      className={`px-3.5 py-3 rounded-lg text-left border transition-colors cursor-pointer min-h-[54px] ${
                        isSelected
                          ? 'bg-[#351522] text-[#FFF5E9] border-[#D6AD72]'
                          : available
                            ? 'bg-[#F8F0E7] text-[#26151D] border-[#D6AD72]/40 hover:border-[#351522]'
                            : 'bg-[#F8F0E7]/60 text-[#5C434E] border-[#D6AD72]/25 hover:border-[#5C434E]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                        <span>{variant.size}</span>
                        <span className="tabular-nums">
                          {formatPrice(variant.price)}
                        </span>
                      </div>
                      <span
                        className={`block text-[11px] mt-0.5 tabular-nums ${
                          isSelected ? 'text-[#FFF5E9]/80' : 'text-[#5C434E]'
                        }`}
                      >
                        {available
                          ? `${variant.stockCount} in stock`
                          : 'Unavailable'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {!isVariantAvailable ? (
                <p className="mt-2.5 text-xs text-[#351522] font-medium">
                  {product.inStock
                    ? `${activeVariant.size} is currently out of stock. Please select an available bottle size above to add to bag.`
                    : 'This fragrance is currently out of stock across all bottle sizes.'}
                </p>
              ) : remainingStock === 0 ? (
                <p className="mt-2.5 text-xs text-[#351522] font-medium tabular-nums">
                  All {activeVariant.stockCount} available bottles of{' '}
                  {activeVariant.size} are already in your shopping bag.
                </p>
              ) : inCartQuantity > 0 ? (
                <p className="mt-2.5 text-xs text-[#5C434E] tabular-nums">
                  {inCartQuantity} in shopping bag · {remainingStock} remaining
                  available to add.
                </p>
              ) : null}
            </div>

            {/* Quantity & Add to Cart Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-5">
              <div className="inline-flex items-center justify-between sm:justify-start rounded-lg border border-[#D6AD72]/50 bg-[#F8F0E7] h-[48px] px-1">
                <button
                  type="button"
                  disabled={!canAddToCart || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-2.5 text-[#351522] hover:bg-[#FFF5E9] rounded-md transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" strokeWidth={1.6} />
                </button>
                <span className="px-4 text-sm font-medium tabular-nums min-w-[44px] text-center">
                  {canAddToCart ? quantity : 0}
                </span>
                <button
                  type="button"
                  disabled={!canAddToCart || quantity >= maxSelectableQuantity}
                  onClick={() =>
                    setQuantity((q) => Math.min(maxSelectableQuantity, q + 1))
                  }
                  aria-label="Increase quantity"
                  className="p-2.5 text-[#351522] hover:bg-[#FFF5E9] rounded-md transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.6} />
                </button>
              </div>

              <motion.button
                type="button"
                disabled={!canAddToCart}
                whileTap={canAddToCart ? { scale: 0.98 } : undefined}
                onClick={handleAdd}
                className={`flex-1 inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-lg text-sm font-medium tracking-wide transition-colors min-h-[48px] border ${
                  !canAddToCart
                    ? 'bg-[#F8F0E7] text-[#5C434E] border-[#D6AD72]/35 cursor-not-allowed'
                    : addedFeedback
                      ? 'bg-[#D6AD72] text-[#26151D] border-[#D6AD72] cursor-pointer'
                      : 'bg-[#351522] text-[#FFF5E9] border-[#D6AD72] hover:bg-[#240D16] cursor-pointer'
                }`}
              >
                {!isVariantAvailable ? (
                  <span>Unavailable in {activeVariant.size}</span>
                ) : remainingStock === 0 ? (
                  <span>Max Stock in Shopping Bag</span>
                ) : addedFeedback ? (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2} />
                    <span>
                      Added {addedFeedback.quantity} × {addedFeedback.size} to
                      Bag
                    </span>
                  </>
                ) : (
                  <>
                    <ShoppingBag
                      className="w-4 h-4 text-[#D6AD72]"
                      strokeWidth={1.6}
                    />
                    <span>
                      Add to Cart ·{' '}
                      {formatPrice(activeVariant.price * quantity)}
                    </span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Inline Confirmation + Continue Shopping & View Cart Actions */}
            <div className="mb-8 space-y-3">
              {addedFeedback && (
                <div
                  role="status"
                  className="p-3.5 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/55 text-xs text-[#26151D] flex items-center gap-2.5"
                >
                  <Check
                    className="w-4 h-4 text-[#351522] shrink-0"
                    strokeWidth={2}
                  />
                  <span>
                    <strong className="font-semibold text-[#351522]">
                      {addedFeedback.quantity} × {product.name} (
                      {addedFeedback.size})
                    </strong>{' '}
                    has been added to your shopping bag.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onNavigateShop}
                  className="py-2.5 px-4 rounded-lg border border-[#D6AD72]/50 bg-[#FFF5E9] text-xs font-medium text-[#351522] hover:border-[#351522] hover:bg-[#F8F0E7] transition-colors cursor-pointer min-h-[42px]"
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  onClick={onOpenCart}
                  className="py-2.5 px-4 rounded-lg border border-[#D6AD72]/50 bg-[#F8F0E7] text-xs font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors cursor-pointer min-h-[42px]"
                >
                  View Cart
                </button>
              </div>
            </div>

            {/* Separate Fragrance Notes: Top, Heart, Base */}
            {(product.pyramid.top ||
              product.pyramid.heart ||
              product.pyramid.base) && (
              <div className="pt-6 border-t border-[#D6AD72]/30 mb-7">
                <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#351522] font-semibold mb-4">
                  Olfactive Composition
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {product.pyramid.top && (
                    <div className="p-4 rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/30">
                      <span className="block text-[11px] uppercase tracking-[0.16em] text-[#8C6526] font-semibold mb-1.5">
                        Top Notes
                      </span>
                      <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
                        {product.pyramid.top}
                      </p>
                    </div>
                  )}
                  {product.pyramid.heart && (
                    <div className="p-4 rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/30">
                      <span className="block text-[11px] uppercase tracking-[0.16em] text-[#8C6526] font-semibold mb-1.5">
                        Heart Notes
                      </span>
                      <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
                        {product.pyramid.heart}
                      </p>
                    </div>
                  )}
                  {product.pyramid.base && (
                    <div className="p-4 rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/30">
                      <span className="block text-[11px] uppercase tracking-[0.16em] text-[#8C6526] font-semibold mb-1.5">
                        Base Notes
                      </span>
                      <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
                        {product.pyramid.base}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fragrance Profile (Clearly Labelled Demo Information) */}
            {fragranceProfileItems.length > 0 && (
              <div className="pt-6 border-t border-[#D6AD72]/30">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                  <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#351522] font-semibold">
                    Fragrance Information
                  </h2>
                  <span className="text-[11px] text-[#5C434E]">
                    Demo Data (Sample Catalogue Profile)
                  </span>
                </div>

                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-xs sm:text-sm">
                  {fragranceProfileItems.map((entry) => (
                    <div
                      key={entry.label}
                      className={
                        entry.wide ? 'col-span-2 sm:col-span-3' : undefined
                      }
                    >
                      <dt className="text-[11px] uppercase tracking-[0.14em] text-[#5C434E] mb-0.5">
                        {entry.label}
                      </dt>
                      <dd
                        className={`font-medium text-[#26151D] ${
                          entry.tabular ? 'tabular-nums' : ''
                        }`}
                      >
                        {entry.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Related / Complementary Fragrances */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-[#D6AD72]/30 bg-[#F8F0E7] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-[11px] tracking-[0.22em] uppercase text-[#8C6526] font-semibold mb-2">
                  You May Also Appreciate
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#351522]">
                  Complementary Creations
                </h2>
              </div>
              <button
                type="button"
                onClick={onNavigateShop}
                className="text-xs font-medium uppercase tracking-[0.16em] text-[#351522] hover:text-[#D6AD72] underline underline-offset-4 transition-colors cursor-pointer self-start sm:self-auto"
              >
                View Full Catalogue
              </button>
            </div>

            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-7"
            >
              {relatedProducts.map((item) => (
                <motion.article
                  key={item.id}
                  variants={staggerItemVariants}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3, ease: LUXURY_EASE }}
                  className="group flex flex-col justify-between rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/35 hover:border-[#D6AD72]/85 overflow-hidden transition-shadow hover:shadow-[0_18px_38px_-18px_rgba(53,21,34,0.22)]"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => onViewDetails(item)}
                      className="block w-full aspect-[3/4] overflow-hidden bg-[#F8F0E7] cursor-pointer"
                    >
                      <LuxuryImage
                        src={item.image}
                        alt={item.name}
                        fallbackTitle={item.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </button>
                    <div className="p-5 pb-4">
                      <span className="text-[11px] tracking-[0.16em] uppercase text-[#8C6526] font-semibold block mb-1">
                        {item.fragranceFamily} · {item.audienceCategory}
                      </span>
                      <button
                        type="button"
                        onClick={() => onViewDetails(item)}
                        className="text-left block w-full cursor-pointer"
                      >
                        <h3 className="font-serif text-2xl font-medium text-[#26151D] group-hover:text-[#351522] transition-colors">
                          {item.name}
                        </h3>
                      </button>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-3 border-t border-[#D6AD72]/25 flex items-center justify-between gap-3">
                    <span className="text-base font-semibold text-[#26151D] tabular-nums">
                      {formatPrice(item.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onViewDetails(item)}
                      className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[#F8F0E7] text-[#351522] border border-[#D6AD72]/45 hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}

