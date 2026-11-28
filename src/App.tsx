import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { Check, Heart, ShoppingBag, X } from 'lucide-react';
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
import { WishlistDrawer } from './components/WishlistDrawer';
import { ALL_PERFUMES } from './data/fragrances';
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
import { appendStoredOrderFromCheckout } from './lib/shipping';
import { fetchLiveCatalogAndZones } from './lib/supabaseCatalog';
import { loadWishlistIds, saveWishlistIds } from './lib/wishlist';
import { LUXURY_EASE } from './lib/motion';
import { AdminSection } from './types/admin';
import {
  AppliedCoupon,
  AppPage,
  BottleSize,
  CartItem,
  CheckoutOrderPreview,
  FragranceCategory,
  PerfumeProduct,
} from './types/perfume';

const ADMIN_SECTIONS: AdminSection[] = [
  'login',
  'dashboard',
  'orders',
  'payment-verification',
  'products',
  'inventory',
  'categories',
  'coupons',
  'shipments',
  'notifications',
  'reports',
  'settings',
];

function resolveAdminSection(path: string): AdminSection {
  if (path === '/admin' || path === '/admin/') {
    return 'dashboard';
  }
  const sub = path.slice('/admin/'.length).split('/')[0] as AdminSection;
  if (ADMIN_SECTIONS.includes(sub)) {
    return sub;
  }
  return 'dashboard';
}

function resolveRouteFromLocation(): {
  page: AppPage;
  product: PerfumeProduct;
  adminSection: AdminSection;
} {
  const queryProduct = new URLSearchParams(window.location.search).get(
    'product',
  );
  if (queryProduct) {
    const matched = ALL_PERFUMES.find(
      (p) => p.slug === queryProduct || p.id === queryProduct,
    );
    if (matched) {
      return { page: 'product', product: matched, adminSection: 'dashboard' };
    }
  }

  const hashPath = window.location.hash.startsWith('#/')
    ? window.location.hash.slice(1).replace(/\/+$/, '')
    : '';
  const path =
    hashPath || window.location.pathname.replace(/\/+$/, '') || '/';

  if (path === '/shop') {
    return { page: 'shop', product: ALL_PERFUMES[0], adminSection: 'dashboard' };
  }
  if (path === '/cart') {
    return { page: 'cart', product: ALL_PERFUMES[0], adminSection: 'dashboard' };
  }
  if (path === '/checkout') {
    return { page: 'checkout', product: ALL_PERFUMES[0], adminSection: 'dashboard' };
  }
  if (path === '/order-confirmation') {
    return {
      page: 'order-confirmation',
      product: ALL_PERFUMES[0],
      adminSection: 'dashboard',
    };
  }
  if (path === '/admin' || path.startsWith('/admin/')) {
    return {
      page: 'admin',
      product: ALL_PERFUMES[0],
      adminSection: resolveAdminSection(path),
    };
  }
  if (path.startsWith('/perfume/')) {
    const slug = decodeURIComponent(path.slice('/perfume/'.length));
    const matched = ALL_PERFUMES.find(
      (p) => p.slug === slug || p.id === slug,
    );
    if (matched) {
      return { page: 'product', product: matched, adminSection: 'dashboard' };
    }
    return { page: 'shop', product: ALL_PERFUMES[0], adminSection: 'dashboard' };
  }
  return { page: 'home', product: ALL_PERFUMES[0], adminSection: 'dashboard' };
}

export default function App() {
  const initialRoute = resolveRouteFromLocation();
  const initialCart = useRef(loadGuestCart()).current;

  const [currentPage, setCurrentPage] = useState<AppPage>(initialRoute.page);
  const [adminSection, setAdminSection] = useState<AdminSection>(
    initialRoute.adminSection,
  );
  const [catalogProducts, setCatalogProducts] =
    useState<PerfumeProduct[]>(ALL_PERFUMES);
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
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    loadWishlistIds(),
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] =
    useState<PerfumeProduct | null>(null);
  const [infoModal, setInfoModal] = useState<InfoModalType>(null);
  const [confirmedOrder, setConfirmedOrder] =
    useState<CheckoutOrderPreview | null>(() => loadSessionConfirmedOrder());
  const [toastState, setToastState] = useState<{
    message: string;
    action?: 'cart' | 'wishlist';
  } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    fetchLiveCatalogAndZones().then(({ products }) => {
      if (!active) return;
      setCatalogProducts(products);
      setSelectedProduct((prev) => {
        const refreshed = products.find((p) => p.id === prev.id);
        return refreshed ?? prev;
      });
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    saveGuestCart(cartItems, giftWrap, appliedCoupon);
  }, [cartItems, giftWrap, appliedCoupon]);

  useEffect(() => {
    saveWishlistIds(wishlistIds);
  }, [wishlistIds]);

  useEffect(() => {
    const syncFromLocation = () => {
      const next = resolveRouteFromLocation();
      setCurrentPage(next.page);
      setAdminSection(next.adminSection);
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
  const featuredProducts = catalogProducts.slice(0, 4);
  const wishlistProducts = catalogProducts.filter((p) =>
    wishlistIds.includes(p.id),
  );

  const showConfirmation = (
    message: string,
    action?: 'cart' | 'wishlist',
  ) => {
    setToastState({ message, action });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastState(null);
    }, 3400);
  };

  const handleToggleWishlist = (product: PerfumeProduct) => {
    const exists = wishlistIds.includes(product.id);
    if (exists) {
      setWishlistIds((prev) => prev.filter((id) => id !== product.id));
      showConfirmation(
        `${product.name} removed from your wishlist.`,
        'wishlist',
      );
      return;
    }
    setWishlistIds((prev) => [product.id, ...prev]);
    showConfirmation(`${product.name} saved to your wishlist.`, 'wishlist');
  };

  const handleRemoveWishlistItem = (productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
  };

  const handleClearWishlist = () => {
    setWishlistIds([]);
  };

  const handleAddToCart = (
    product: PerfumeProduct,
    size?: BottleSize,
    quantity = 1,
  ) => {
    if (!product.inStock) {
      showConfirmation(`${product.name} is currently out of stock.`);
      return;
    }

    const explicitSizeRequested = size !== undefined;
    const variant = explicitSizeRequested
      ? product.variants.find((v) => v.size === size)
      : (product.variants.find(
          (v) => v.size === product.defaultSize && v.stockCount > 0,
        ) ?? product.variants.find((v) => v.stockCount > 0));

    if (!variant || variant.stockCount <= 0) {
      showConfirmation(
        `${product.name}${size ? ` (${size})` : ''} is currently out of stock.`,
      );
      return;
    }

    const existingItem = cartItems.find(
      (item) => item.product.id === product.id && item.size === variant.size,
    );
    const currentQty = existingItem ? existingItem.quantity : 0;
    const remainingStock = Math.max(0, variant.stockCount - currentQty);

    if (remainingStock <= 0) {
      showConfirmation(
        `Maximum available stock (${variant.stockCount}) already in bag for ${product.name} (${variant.size}).`,
        'cart',
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
      'cart',
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

  const pushRoutePath = (nextPath: string, replace = false) => {
    const currentFull = `${window.location.pathname}${window.location.hash}`;
    if (currentFull !== nextPath) {
      if (replace) {
        window.history.replaceState({}, '', nextPath);
      } else {
        window.history.pushState({}, '', nextPath);
      }
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
      pushRoutePath(`/admin/${adminSection}`);
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
        }, 90);
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
    appendStoredOrderFromCheckout(order);
    setConfirmedOrder(order);
    setCartItems([]);
    setAppliedCoupon(null);
    setCurrentPage('order-confirmation');
    pushRoutePath('/order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void fetchLiveCatalogAndZones().then(({ products }) => {
      setCatalogProducts(products);
    });
  };

  const handleNavigateAdminSection = (
    section: AdminSection,
    options?: { replace?: boolean },
  ) => {
    setCurrentPage('admin');
    setAdminSection(section);
    pushRoutePath(`/admin/${section}`, options?.replace ?? false);
    if (!options?.replace) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (currentPage === 'admin') {
    return (
      <MotionConfig reducedMotion="user">
        <AdminDashboard
          activeSection={adminSection}
          onNavigateSection={handleNavigateAdminSection}
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
            wishlistCount={wishlistIds.length}
            onNavigate={handleNavigate}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenWishlist={() => setIsWishlistOpen(true)}
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
                products={featuredProducts}
                selectedCategory={selectedCategory}
                wishlistIds={wishlistIds}
                onSelectCategory={setSelectedCategory}
                onAddToCart={handleAddToCart}
                onSelectProduct={handleOpenProductDetail}
                onToggleWishlist={handleToggleWishlist}
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
              products={catalogProducts}
              wishlistIds={wishlistIds}
              onNavigateHome={() => handleNavigate('home', 'home')}
              onViewDetails={handleOpenProductDetail}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          )}

          {currentPage === 'product' && (
            <ProductDetailPage
              product={selectedProduct}
              allProducts={catalogProducts}
              cartItems={cartItems}
              isWishlisted={wishlistIds.includes(selectedProduct.id)}
              onNavigateHome={() => handleNavigate('home', 'home')}
              onNavigateShop={() => handleNavigate('shop')}
              onViewDetails={handleOpenProductDetail}
              onOpenCart={() => handleNavigate('cart')}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
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
            onOpenPrivacy={() => setInfoModal('privacy')}
            onOpenTerms={() => setInfoModal('terms')}
          />
        </div>

        {/* Cart & Wishlist Confirmation Toast */}
        <AnimatePresence>
          {toastState && (
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
              <p className="text-xs leading-snug flex-1">{toastState.message}</p>
              {toastState.action === 'cart' && (
                <button
                  type="button"
                  onClick={() => {
                    setToastState(null);
                    handleNavigate('cart');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C69A50] hover:text-[#FFF5E9] whitespace-nowrap cursor-pointer underline underline-offset-4"
                >
                  <ShoppingBag className="w-3 h-3" strokeWidth={1.7} />
                  <span>View Cart</span>
                </button>
              )}
              {toastState.action === 'wishlist' && (
                <button
                  type="button"
                  onClick={() => {
                    setToastState(null);
                    setIsWishlistOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C69A50] hover:text-[#FFF5E9] whitespace-nowrap cursor-pointer underline underline-offset-4"
                >
                  <Heart className="w-3 h-3" strokeWidth={1.7} />
                  <span>View Wishlist</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setToastState(null)}
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

        <WishlistDrawer
          isOpen={isWishlistOpen}
          products={wishlistProducts}
          onClose={() => setIsWishlistOpen(false)}
          onExploreShop={() => handleNavigate('shop')}
          onViewProduct={handleOpenProductDetail}
          onAddToCart={(product) => handleAddToCart(product)}
          onRemoveItem={handleRemoveWishlistItem}
          onClearWishlist={handleClearWishlist}
        />

        <ProductQuickViewModal
          product={quickViewProduct}
          cartItems={cartItems}
          isWishlisted={
            quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false
          }
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          onViewFullDetails={handleOpenProductDetail}
        />

        <SearchModal
          isOpen={isSearchOpen}
          products={catalogProducts}
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
