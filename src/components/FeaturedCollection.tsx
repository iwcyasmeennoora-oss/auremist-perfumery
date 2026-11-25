import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Heart, Plus } from 'lucide-react';
import { formatPrice, FRAGRANCE_CATEGORIES } from '../data/fragrances';
import {
  fadeUpVariants,
  LUXURY_EASE,
  staggerContainerVariants,
  staggerItemVariants,
  VIEWPORT_ONCE,
} from '../lib/motion';
import { BottleSize, FragranceCategory, PerfumeProduct } from '../types/perfume';
import { LuxuryImage } from './LuxuryImage';

interface FeaturedCollectionProps {
  products: PerfumeProduct[];
  selectedCategory: FragranceCategory;
  wishlistIds: string[];
  onSelectCategory: (category: FragranceCategory) => void;
  onAddToCart: (product: PerfumeProduct, size?: BottleSize) => void;
  onSelectProduct: (product: PerfumeProduct) => void;
  onToggleWishlist: (product: PerfumeProduct) => void;
}

export function FeaturedCollection({
  products,
  selectedCategory,
  wishlistIds,
  onSelectCategory,
  onAddToCart,
  onSelectProduct,
  onToggleWishlist,
}: FeaturedCollectionProps) {
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const visibleProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((item) => item.category === selectedCategory);

  const handleQuickAdd = (product: PerfumeProduct) => {
    if (!product.inStock) return;
    onAddToCart(product, product.defaultSize);
    setRecentlyAddedId(product.id);
    window.setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === product.id ? null : curr));
    }, 1500);
  };

  return (
    <section
      id="shop"
      className="bg-[#FFF5E9] py-20 sm:py-24 border-b border-[#C69A50]/25"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Centered Header & Minimal Category Filter */}
        <motion.div
          id="categories"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-14 scroll-mt-24"
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-medium text-[#430F25] tracking-tight mb-3">
            The Signature Collection
          </h2>
          <p className="text-sm sm:text-[15px] text-[#26151D]/75 mb-8">
            Discover fragrances worth remembering.
          </p>

          <div
            role="tablist"
            aria-label="Filter fragrances by olfactive family"
            className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-xl bg-[#FFF5E9] border border-[#C69A50]/30"
          >
            {FRAGRANCE_CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => onSelectCategory(category)}
                  className={`relative px-3.5 py-2 rounded-lg text-xs font-medium tracking-wide transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#430F25] ${
                    isActive
                      ? 'text-[#FFF5E9]'
                      : 'text-[#26151D]/75 hover:text-[#430F25]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeCategoryTab"
                      transition={{ duration: 0.3, ease: LUXURY_EASE }}
                      className="absolute inset-0 rounded-lg bg-[#430F25]"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{category}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Four-Column Desktop Product Grid */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7"
        >
          <AnimatePresence mode="popLayout">
            {visibleProducts.map((product) => {
              const isAdded = recentlyAddedId === product.id;
              const isWishlisted = wishlistIds.includes(product.id);
              return (
                <motion.article
                  key={product.id}
                  layout
                  variants={staggerItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3, ease: LUXURY_EASE }}
                  className="group flex flex-col justify-between rounded-xl bg-[#FFF5E9] border border-[#C69A50]/30 transition-shadow duration-300 hover:border-[#C69A50]/80 hover:shadow-[0_18px_38px_-18px_rgba(67,15,37,0.22)] overflow-hidden"
                >
                  <div>
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#FFF5E9]">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="block w-full h-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#430F25]"
                        aria-label={`View fragrance details for ${product.name}`}
                      >
                        <LuxuryImage
                          src={product.image}
                          alt={`${product.name} by AUREMIST Eau de Parfum bottle`}
                          fallbackTitle={product.name}
                          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleWishlist(product)}
                        aria-pressed={isWishlisted}
                        aria-label={
                          isWishlisted
                            ? `Remove ${product.name} from wishlist`
                            : `Save ${product.name} to wishlist`
                        }
                        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer shadow-sm ${
                          isWishlisted
                            ? 'bg-[#430F25] text-[#C69A50] border-[#C69A50]'
                            : 'bg-[#FFF5E9]/90 text-[#430F25] border-[#C69A50]/45 hover:bg-[#FFF5E9] hover:border-[#430F25]'
                        }`}
                      >
                        <Heart
                          className="w-4 h-4"
                          strokeWidth={1.7}
                          fill={isWishlisted ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>

                    <div className="p-5 pb-4">
                      <span className="text-[11px] tracking-[0.16em] uppercase text-[#C69A50] font-semibold block mb-1">
                        {product.category}
                      </span>

                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="text-left block w-full cursor-pointer focus-visible:outline-none focus-visible:underline"
                      >
                        <h3 className="font-serif text-2xl font-medium text-[#26151D] group-hover:text-[#430F25] transition-colors">
                          {product.name}
                        </h3>
                      </button>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3.5 border-t border-[#C69A50]/20 flex items-center justify-between gap-3">
                    <span className="text-base font-semibold text-[#26151D] tabular-nums">
                      {formatPrice(product.price)}
                    </span>

                    <motion.button
                      type="button"
                      disabled={!product.inStock}
                      whileTap={product.inStock ? { scale: 0.96 } : undefined}
                      onClick={() => handleQuickAdd(product)}
                      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium tracking-wide transition-colors duration-200 whitespace-nowrap shrink-0 min-h-[38px] border ${
                        !product.inStock
                          ? 'bg-[#F8EBDD]/60 text-[#5C434E]/75 border-[#C69A50]/25 cursor-not-allowed'
                          : isAdded
                            ? 'bg-[#C69A50] text-[#26151D] border-[#C69A50] cursor-pointer'
                            : 'bg-[#430F25] text-[#FFF5E9] border-[#C69A50]/45 hover:bg-[#2B0817] cursor-pointer'
                      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C69A50]`}
                    >
                      {!product.inStock ? (
                        <span>Out of Stock</span>
                      ) : isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus
                            className="w-3.5 h-3.5 text-[#C69A50]"
                            strokeWidth={1.75}
                          />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {visibleProducts.length === 0 && (
          <div className="py-14 text-center rounded-xl border border-[#C69A50]/25">
            <p className="font-serif text-2xl text-[#430F25] mb-2">
              No fragrances match this family yet.
            </p>
            <button
              type="button"
              onClick={() => onSelectCategory('All')}
              className="mt-2 text-xs font-medium uppercase tracking-widest text-[#430F25] underline underline-offset-4 hover:text-[#C69A50] cursor-pointer"
            >
              View Entire Collection
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
