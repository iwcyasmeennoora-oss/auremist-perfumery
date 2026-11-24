import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { Check, ShoppingBag, X } from 'lucide-react';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AnnouncementBar } from './components/AnnouncementBar';
import { AtelierStoryAndFaq } from './components/AtelierStoryAndFaq';
import { CartDrawer } from './components/CartDrawer';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { FeaturedCollection } from './components/FeaturedCollection';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { InfoModal, InfoModalType } from './components/InfoModal';
import { LuxuryGiftBanner } from './components/LuxuryGiftBanner';
import { Navbar } from './components/Navbar';
import { NewsletterSection } from './components/NewsletterSection';
import { OrderConfirmationPage } from './components/OrderConfirmationPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { SearchModal } from './components/SearchModal';
import { ServiceHighlights } from './components/ServiceHighlights';
import { ShopPage } from './components/ShopPage';
import { ALL_PERFUMES, FEATURED_PERFUMES } from './data/fragrances';
import {
  getVariantStockCount,
  loadGuestCart,
  saveGuestCart,
  validateDemoCoupon,
} from './lib/cartPricing';
import {
  loadSessionConfirmedOrder,
  saveSessionConfirmedOrder,
} from './lib/orderConfirmation';
import { LUXURY_EASE } from './lib/motion';
import {
  AppliedCoupon,
  AppPage,
  BottleSize,
  CartItem,
  CheckoutOrderPreview,
  FragranceCategory,
  PerfumeProduct,
} from './types/perfume';

function resolveRouteFromLocation(): {
  page: AppPage;
  product: PerfumeProduct;
} {
  const queryProduct = new URLSearchParams(window.location.search).get(
    'product',
  );
  if (queryProduct) {
    const matched = ALL_PERFUMES.find(
      (p) => p.slug === queryProduct || p.id === queryProduct,
    );
    if (matched) {
      return { page: 'product', product: matched };
    }
  }

  const hashPath = window.location.hash.startsWith('#/')
    ? window.location.hash.slice(1).replace(/\/+$/, '')
    : '';
  const path =
    hashPath || window.location.pathname.replace(/\/+$/, '') || '/';

  if (path === '/shop') {
    return { page: 'shop', product: ALL_PERFUMES[0] };
  }
  if (path === '/cart') {
    return { page: 'cart', product: ALL_PERFUMES[0] };
  }
  if (path === '/checkout') {
    return { page: 'checkout', product: ALL_PERFUMES[0] };
  }
  if (path === '/order-confirmation') {
    return { page: 'order-confirmation', product: ALL_PERFUMES[0] };
  }
  if (path === '/admin' || path.startsWith('/admin/')) {
    return { page: 'admin', product: ALL_PERFUMES[0] };
  }
  if (path.startsWith('/perfume/')) {
    const slug = decodeURIComponent(path.slice('/perfume/'.length));
    const matched = ALL_PERFUMES.find(
      (p) => p.slug === slug || p.id === slug,
    );
    if (matched) {
      return { page: 'product', product: matched };
    }
    return { page: 'shop', product: ALL_PERFUMES[0] };
  }
  return { page: 'home', product: ALL_PERFUMES[0] };
}

export default function App() {
  const initialRoute = resolveRouteFromLocation();
  const initialCart = useRef(loadGuestCart()).current;

  const [currentPage, setCurrentPage] = useState<AppPage>(initialRoute.page);
  const [selectedProduct, setSelectedProduct] = useState<PerfumeProduct>(
    initialRoute.product,
  );
  const [selectedCategory, setSelectedCategory] =
    useState<FragranceCategory>('All');
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCart.items);
  const [giftWrap, setGiftWrap] = useState<boolean>(initialCart.giftWrap);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    initialCart.appliedCoupon,
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] =
    useState<PerfumeProduct | null>(null);
  const [infoModal, setInfoModal] = useState<InfoModalType>(null);
  const [confirmedOrder, setConfirmedOrder] =
    useState<CheckoutOrderPreview | null>(() => loadSessionConfirmedOrder());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    saveGuestCart(cartItems, giftWrap, appliedCoupon);
  }, [cartItems, giftWrap, appliedCoupon]);

  useEffect(() => {
    const syncFromLocation = () => {
      const next = resolveRouteFromLocation();
      setCurrentPage(next.page);
      setSelectedProduct(next.product);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);
    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const showConfirmation = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3400);
  };

  const handleAddToCart = (
    product: PerfumeProduct,
    size: BottleSize = product.defaultSize,
    quantity = 1,
  ) => {
    if (!product.inStock) return;

    const variant =
      product.variants.find((v) => v.size === size && v.stockCount > 0) ??
      product.variants.find((v) => v.stockCount > 0);

    if (!variant) return;

    const existingItem = cartItems.find(
      (item) => item.product.id === product.id && item.size === variant.size,
    );
    const currentQty = existingItem ? existingItem.quantity : 0;
    const remainingStock = Math.max(0, variant.stockCount - currentQty);

    if (remainingStock <= 0) {
      showConfirmation(
        `Maximum available stock (${variant.stockCount}) already in bag for ${product.name} (${variant.size}).`,
      );
      return;
    }

    const requestedQuantity = Number.isFinite(quantity)
      ? Math.max(1, Math.floor(quantity))
      : 1;
    const addedQuantity = Math.min(requestedQuantity, remainingStock);

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.size === variant.size,
      );
      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? {
                ...item,
                quantity: Math.min(
                  variant.stockCount,
                  item.quantity + addedQuantity,
                ),
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          product,
          size: variant.size,
          unitPrice: variant.price,
          sku: variant.sku,
          quantity: addedQuantity,
        },
      ];
    });

    const qtyLabel = addedQuantity > 1 ? `${addedQuantity} × ` : '';
    showConfirmation(
      `${qtyLabel}${product.name} (${variant.size}) added to your shopping bag.`,
    );
  };

  const handleUpdateQuantity = (
    productId: string,
    size: BottleSize,
    delta: number,
  ) => {
    if (!Number.isFinite(delta) || delta === 0) return;
    const safeDelta = Math.trunc(delta);

    setCartItems((prev) => {
      const next = prev
        .map((item) => {
          if (item.product.id !== productId || item.size !== size) {
            return item;
          }
          const maxStock = getVariantStockCount(item.product, item.size);
          const boundedQty = Math.min(maxStock, item.quantity + safeDelta);
          return { ...item, quantity: boundedQty };
        })
        .filter((item) => item.quantity > 0);

      if (next.length === 0) {
        setAppliedCoupon(null);
      }
      return next;
    });
  };

  const handleRemoveItem = (productId: string, size: BottleSize) => {
    setCartItems((prev) => {
      const next = prev.filter(
        (item) => !(item.product.id === productId && item.size === size),
      );
      if (next.length === 0) {
        setAppliedCoupon(null);
      }
      return next;
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const handleApplyCoupon = (rawCode: string) => {
    const result = validateDemoCoupon(rawCode, appliedCoupon);
    if (result.ok && result.coupon) {
      setAppliedCoupon(result.coupon);
    }
    return { ok: result.ok, message: result.message };
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const pushRoutePath = (nextPath: string) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
  };

  const handleNavigate = (page: AppPage, sectionId?: string) => {
    setCurrentPage(page);

    if (page === 'shop') {
      pushRoutePath('/shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'cart') {
      pushRoutePath('/cart');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'checkout') {
      pushRoutePath('/checkout');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'order-confirmation') {
      pushRoutePath('/order-confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'admin') {
      pushRoutePath('/admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'home') {
      pushRoutePath('/');
      if (sectionId) {
        window.setTimeout(() => {
          if (sectionId === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            const targetEl = document.getElementById(sectionId);
            targetEl?.scrollIntoView({ behavior: 'smooth' });
          }
        }, 40);
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProductDetail = (product: PerfumeProduct) => {
    setSelectedProduct(product);
    setCurrentPage('product');
    pushRoutePath(`/perfume/${product.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderConfirmed = (order: CheckoutOrderPreview) => {
    saveSessionConfirmedOrder(order);
    setConfirmedOrder(order);
    setCartItems([]);
    setAppliedCoupon(null);
    setCurrentPage('order-confirmation');
    pushRoutePath('/order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPage === 'admin') {
    return (
      <MotionConfig reducedMotion="user">
        <AdminDashboard
          onReturnToStorefront={() => handleNavigate('home', 'home')}
        />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-[#FFF5E9] text-[#26151D]">
        <div className="print:hidden">
          <AnnouncementBar onOpenTrackOrder={() => setInfoModal('track-order')} />

          <Navbar
            currentPage={currentPage}
            cartCount={totalCartCount}
            onNavigate={handleNavigate}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenAccount={() => setInfoModal('account')}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenFaq={() => setInfoModal('faq')}
          />
        </div>

        <main className="flex-1">
          {currentPage === 'home' && (
            <>
              <HeroSection onShopCollection={() => handleNavigate('shop')} />

              <ServiceHighlights />

              <FeaturedCollection
                products={FEATURED_PERFUMES}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onAddToCart={handleAddToCart}
                onSelectProduct={handleOpenProductDetail}
              />

              <LuxuryGiftBanner
                onShopCollection={() => handleNavigate('shop')}
              />

              <AtelierStoryAndFaq
                onDiscoverStory={() => setInfoModal('story')}
              />

              <NewsletterSection />
            </>
          )}

          {currentPage === 'shop' && (
            <ShopPage
              products={ALL_PERFUMES}
              onNavigateHome={() => handleNavigate('home', 'home')}
              onViewDetails={handleOpenProductDetail}
              onAddToCart={handleAddToCart}
            />
          )}

          {currentPage === 'product' && (
            <ProductDetailPage
              product={selectedProduct}
              allProducts={ALL_PERFUMES}
              cartItems={cartItems}
              onNavigateHome={() => handleNavigate('home', 'home')}
              onNavigateShop={() => handleNavigate('shop')}
              onViewDetails={handleOpenProductDetail}
              onOpenCart={() => handleNavigate('cart')}
              onAddToCart={handleAddToCart}
            />
          )}

          {currentPage === 'cart' && (
            <CartPage
              items={cartItems}
              giftWrap={giftWrap}
              appliedCoupon={appliedCoupon}
              onToggleGiftWrap={() => setGiftWrap((prev) => !prev)}
              onNavigateHome={() => handleNavigate('home', 'home')}
              onNavigateShop={() => handleNavigate('shop')}
              onViewProduct={handleOpenProductDetail}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onProceedToCheckout={() => handleNavigate('checkout')}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
            />
          )}

          {currentPage === 'checkout' && (
            <CheckoutPage
              items={cartItems}
              giftWrap={giftWrap}
              appliedCoupon={appliedCoupon}
              confirmedOrder={null}
              onNavigateHome={() => handleNavigate('home', 'home')}
              onNavigateShop={() => handleNavigate('shop')}
              onNavigateCart={() => handleNavigate('cart')}
              onOrderConfirmed={handleOrderConfirmed}
            />
          )}

          {currentPage === 'order-confirmation' && (
            <OrderConfirmationPage
              order={confirmedOrder}
              hasCartItems={cartItems.length > 0}
              onNavigateHome={() => handleNavigate('home', 'home')}
              onNavigateShop={() => handleNavigate('shop')}
              onNavigateCheckout={() => handleNavigate('checkout')}
            />
          )}
        </main>

        <div className="print:hidden">
          <Footer
            onNavigate={handleNavigate}
            onOpenTrackOrder={() => setInfoModal('track-order')}
            onOpenFaq={() => setInfoModal('faq')}
          />
        </div>

        {/* Cart Confirmation Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.25, ease: LUXURY_EASE }}
              className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl bg-[#430F25] text-[#FFF5E9] border border-[#C69A50]/65 shadow-2xl px-4 py-3.5 flex items-center gap-3"
            >
              <span className="w-6 h-6 rounded-full bg-[#C69A50] text-[#26151D] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" strokeWidth={2.2} />
              </span>
              <p className="text-xs leading-snug flex-1">{toastMessage}</p>
              <button
                type="button"
                onClick={() => {
                  setToastMessage(null);
                  handleNavigate('cart');
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C69A50] hover:text-[#FFF5E9] whitespace-nowrap cursor-pointer underline underline-offset-4"
              >
                <ShoppingBag className="w-3 h-3" strokeWidth={1.7} />
                <span>View Cart</span>
              </button>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                aria-label="Dismiss notification"
                className="p-1 text-[#FFF5E9]/70 hover:text-[#FFF5E9] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.7} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive UI-Only Drawers & Modals */}
        <CartDrawer
          isOpen={isCartOpen}
          items={cartItems}
          giftWrap={giftWrap}
          appliedCoupon={appliedCoupon}
          onToggleGiftWrap={() => setGiftWrap((prev) => !prev)}
          onClose={() => setIsCartOpen(false)}
          onExploreShop={() => handleNavigate('shop')}
          onViewCart={() => handleNavigate('cart')}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />

        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
          onViewFullDetails={handleOpenProductDetail}
        />

        <SearchModal
          isOpen={isSearchOpen}
          products={ALL_PERFUMES}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={handleOpenProductDetail}
        />

        <InfoModal
          type={infoModal}
          onClose={() => setInfoModal(null)}
          onExploreShop={() => handleNavigate('shop')}
        />
      </div>
    </MotionConfig>
  );
}
