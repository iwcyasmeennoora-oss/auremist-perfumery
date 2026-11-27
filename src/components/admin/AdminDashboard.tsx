import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BarChart3,
  Bell,
  Boxes,
  ChevronRight,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Truck,
  X,
} from 'lucide-react';
import {
  DEMO_ADMIN_ACTIVITY,
  DEMO_ADMIN_ORDERS,
  INITIAL_ADMIN_CATEGORIES,
  INITIAL_ADMIN_COUPONS,
  INITIAL_ADMIN_NOTIFICATIONS,
  INITIAL_ADMIN_PRODUCTS,
  INITIAL_STORE_SETTINGS,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
} from '../../data/adminDemoData';
import { LUXURY_EASE } from '../../lib/motion';
import {
  loadStoreSettingsFromStorage,
  loadStoredCheckoutOrders,
  saveStoreSettingsToStorage,
} from '../../lib/shipping';
import {
  AdminActivityEntry,
  AdminCategoryRecord,
  AdminCouponRecord,
  AdminNotificationEntry,
  AdminOrderRecord,
  AdminOrderStatus,
  AdminProductRecord,
  AdminSection,
  AdminSession,
  AdminStoreSettings,
} from '../../types/admin';
import { FloralEmblem } from '../FloralEmblem';
import { AdminCategoriesView } from './AdminCategoriesView';
import { AdminCouponsView } from './AdminCouponsView';
import { AdminInventoryView } from './AdminInventoryView';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminNotificationsView } from './AdminNotificationsView';
import { AdminOrderDetailModal } from './AdminOrderDetailModal';
import { AdminOrdersView } from './AdminOrdersView';
import { AdminOverviewView } from './AdminOverviewView';
import { AdminPaymentVerificationView } from './AdminPaymentVerificationView';
import { AdminProductsView } from './AdminProductsView';
import { AdminReportsView } from './AdminReportsView';
import { AdminSettingsView } from './AdminSettingsView';
import { AdminShipmentsView } from './AdminShipmentsView';

const DEMO_SESSION_STORAGE_KEY = 'auremist_admin_demo_session_v1';

function loadDemoAdminSession(): AdminSession | null {
  try {
    const raw = window.sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    if (
      parsed &&
      parsed.isDemoUiSession === true &&
      typeof parsed.email === 'string' &&
      typeof parsed.displayName === 'string' &&
      typeof parsed.signedInAt === 'string'
    ) {
      return {
        email: parsed.email,
        displayName: parsed.displayName,
        signedInAt: parsed.signedInAt,
        isDemoUiSession: true,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function saveDemoAdminSession(next: AdminSession | null) {
  try {
    if (!next) {
      window.sessionStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(
      DEMO_SESSION_STORAGE_KEY,
      JSON.stringify({
        email: next.email,
        displayName: next.displayName,
        signedInAt: next.signedInAt,
        isDemoUiSession: true,
      }),
    );
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

interface AdminDashboardProps {
  activeSection: AdminSection;
  onNavigateSection: (
    section: AdminSection,
    options?: { replace?: boolean },
  ) => void;
  onReturnToStorefront: () => void;
}

const SIDEBAR_MENU: Array<{
  id: Exclude<AdminSection, 'login'>;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  {
    id: 'payment-verification',
    label: 'Payment Verification',
    icon: ShieldCheck,
  },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'coupons', label: 'Coupons', icon: Tag },
  { id: 'shipments', label: 'Shipment Management', icon: Truck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Store Settings', icon: Settings },
];

const SECTION_TITLES: Record<Exclude<AdminSection, 'login'>, string> = {
  dashboard: 'Dashboard Overview',
  orders: 'Order Management',
  'payment-verification': 'Payment Verification',
  products: 'Products',
  inventory: 'Inventory Management',
  categories: 'Categories',
  coupons: 'Coupons',
  shipments: 'Shipment Management',
  notifications: 'Notifications',
  reports: 'Reports & Analytics',
  settings: 'Store Settings',
};

export function AdminDashboard({
  activeSection,
  onNavigateSection,
  onReturnToStorefront,
}: AdminDashboardProps) {
  const [session, setSession] = useState<AdminSession | null>(() =>
    loadDemoAdminSession(),
  );
  const intendedSectionRef = useRef<Exclude<AdminSection, 'login'>>(
    activeSection !== 'login' ? activeSection : 'dashboard',
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [topSearch, setTopSearch] = useState('');
  const [ordersSearchExternal, setOrdersSearchExternal] = useState('');
  const [productsSearchExternal, setProductsSearchExternal] = useState('');

  const [orders, setOrders] = useState<AdminOrderRecord[]>(() => {
    const stored = loadStoredCheckoutOrders();
    const seen = new Set(stored.map((o) => o.orderNumber));
    return [...stored, ...DEMO_ADMIN_ORDERS.filter((o) => !seen.has(o.orderNumber))];
  });
  const [products, setProducts] =
    useState<AdminProductRecord[]>(INITIAL_ADMIN_PRODUCTS);
  const [categories, setCategories] = useState<AdminCategoryRecord[]>(
    INITIAL_ADMIN_CATEGORIES,
  );
  const [coupons, setCoupons] =
    useState<AdminCouponRecord[]>(INITIAL_ADMIN_COUPONS);
  const [notifications, setNotifications] = useState<AdminNotificationEntry[]>(
    INITIAL_ADMIN_NOTIFICATIONS,
  );
  const [settings, setSettings] = useState<AdminStoreSettings>(() =>
    loadStoreSettingsFromStorage(INITIAL_STORE_SETTINGS),
  );
  const [activity, setActivity] =
    useState<AdminActivityEntry[]>(DEMO_ADMIN_ACTIVITY);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!session && activeSection !== 'login') {
      intendedSectionRef.current = activeSection;
      onNavigateSection('login', { replace: true });
      return;
    }
    if (session && activeSection === 'login') {
      onNavigateSection('dashboard', { replace: true });
    }
  }, [session, activeSection, onNavigateSection]);

  useEffect(() => {
    if (activeSection !== 'orders' && ordersSearchExternal) {
      setOrdersSearchExternal('');
    }
    if (activeSection !== 'products' && productsSearchExternal) {
      setProductsSearchExternal('');
    }
  }, [activeSection, ordersSearchExternal, productsSearchExternal]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );

  const pendingVerificationCount = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.paymentStatus === 'awaiting_verification' ||
          o.paymentStatus === 'reupload_requested',
      ).length,
    [orders],
  );

  const pushActivity = (entry: Omit<AdminActivityEntry, 'id' | 'timestamp'>) => {
    setActivity((prev) => [
      {
        ...entry,
        id: `act-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handleUpdateDemoOrder = (
    orderId: string,
    patch: Partial<Pick<AdminOrderRecord, 'orderStatus' | 'paymentStatus'>>,
  ) => {
    const target = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, ...patch } : order,
      ),
    );
    if (target) {
      const updates: string[] = [];
      if (patch.orderStatus) {
        updates.push(
          `Order Status updated to ${ORDER_STATUS_META[patch.orderStatus].label}`,
        );
      }
      if (patch.paymentStatus) {
        updates.push(
          `Payment Status updated to ${PAYMENT_STATUS_META[patch.paymentStatus].label}`,
        );
      }
      if (updates.length > 0) {
        pushActivity({
          title: `Updated ${target.orderNumber}`,
          detail: `${updates.join(' · ')} (in-memory demo preview).`,
          orderNumber: target.orderNumber,
          kind: patch.paymentStatus ? 'payment' : 'fulfillment',
        });
      }
    }
  };

  const handleReviewPayment = ({
    orderId,
    decision,
    note,
  }: {
    orderId: string;
    decision: 'verified' | 'rejected' | 'reupload_requested';
    note?: string;
  }) => {
    const target = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const nextOrderStatus: AdminOrderStatus =
          decision === 'verified'
            ? 'processing'
            : decision === 'rejected'
              ? 'cancelled'
              : 'pending_verification';
        return {
          ...order,
          paymentStatus: decision,
          orderStatus: nextOrderStatus,
          paymentReviewNote: note ?? order.paymentReviewNote,
        };
      }),
    );

    if (target) {
      const title =
        decision === 'verified'
          ? `Payment verified for ${target.orderNumber}`
          : decision === 'rejected'
            ? `Payment rejected for ${target.orderNumber}`
            : `Re-upload requested for ${target.orderNumber}`;
      const detail =
        decision === 'verified'
          ? 'Order status advanced to Processing in demo workspace.'
          : decision === 'rejected'
            ? `Rejection note: ${note ?? 'No note recorded.'}`
            : `Re-upload request: ${note ?? 'Customer asked to resubmit clearer receipt.'}`;
      pushActivity({
        title,
        detail,
        orderNumber: target.orderNumber,
        kind: 'payment',
      });
    }
  };

  const handleSaveInternalNote = (orderId: string, internalNote: string) => {
    const target = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, internalPaymentNote: internalNote }
          : order,
      ),
    );
    if (target) {
      pushActivity({
        title: `Internal verification note saved for ${target.orderNumber}`,
        detail: internalNote || 'Cleared internal verification note.',
        orderNumber: target.orderNumber,
        kind: 'payment',
      });
    }
  };

  const handleSaveProduct = (product: AdminProductRecord, isNew: boolean) => {
    setProducts((prev) => {
      if (isNew) return [product, ...prev];
      return prev.map((item) => (item.id === product.id ? product : item));
    });
    pushActivity({
      title: isNew
        ? `Added catalog fragrance: ${product.name}`
        : `Updated catalog fragrance: ${product.name}`,
      detail: `${product.variants.length} bottle variants saved in demo workspace.`,
      kind: 'inventory',
    });
  };

  const handleDeleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (target) {
      pushActivity({
        title: `Deleted fragrance: ${target.name}`,
        detail: 'Removed from admin demo catalog.',
        kind: 'inventory',
      });
    }
  };

  const handleToggleProductStatus = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, status: p.status === 'active' ? 'draft' : 'active' }
          : p,
      ),
    );
    if (target) {
      const nextStatus = target.status === 'active' ? 'Draft' : 'Active';
      pushActivity({
        title: `${target.name} set to ${nextStatus}`,
        detail: 'Product visibility updated in demo catalog.',
        kind: 'inventory',
      });
    }
  };

  const handleAdjustStock = (
    productId: string,
    sku: string,
    nextStock: number,
  ) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== productId) return product;
        const updatedVariants = product.variants.map((v) =>
          v.sku === sku ? { ...v, stockCount: nextStock } : v,
        );
        return {
          ...product,
          inStock: updatedVariants.some((v) => v.stockCount > 0),
          variants: updatedVariants,
        };
      }),
    );
    pushActivity({
      title: `Stock adjusted for ${sku}`,
      detail: `Variant quantity set to ${nextStock} units in demo workspace.`,
      kind: 'inventory',
    });
  };

  const handleUpdateShipment = ({
    orderId,
    courierName,
    trackingCode,
    orderStatus,
    shipmentDate,
  }: {
    orderId: string;
    courierName: string;
    trackingCode: string;
    orderStatus: AdminOrderStatus;
    shipmentDate?: string;
  }) => {
    const target = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const resolvedDispatchedAt = shipmentDate
          ? `${shipmentDate}T10:00:00.000Z`
          : orderStatus === 'shipped' || orderStatus === 'out_for_delivery'
            ? order.dispatchedAt ?? new Date().toISOString()
            : order.dispatchedAt;

        return {
          ...order,
          courierName,
          trackingCode,
          orderStatus,
          dispatchedAt: resolvedDispatchedAt,
        };
      }),
    );
    if (target) {
      pushActivity({
        title: `Shipment updated for ${target.orderNumber}`,
        detail: `${courierName}${trackingCode ? ` · ${trackingCode}` : ''} set to ${ORDER_STATUS_META[orderStatus].label}`,
        orderNumber: target.orderNumber,
        kind: 'fulfillment',
      });
    }
  };

  const handleTopSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const raw = topSearch.trim();
    const q = raw.toLowerCase();
    if (!q) return;

    const matchedOrder = orders.find(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.mobile.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')),
    );

    if (matchedOrder) {
      setOrdersSearchExternal(raw);
      onNavigateSection('orders');
      setSelectedOrderId(matchedOrder.id);
      return;
    }

    const matchedProduct = products.find(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(q)),
    );
    if (matchedProduct) {
      setProductsSearchExternal(raw);
      onNavigateSection('products');
      return;
    }

    setOrdersSearchExternal(raw);
    onNavigateSection('orders');
  };

  const handleSignOut = () => {
    setSelectedOrderId(null);
    setMobileSidebarOpen(false);
    intendedSectionRef.current = 'dashboard';
    saveDemoAdminSession(null);
    setSession(null);
    onNavigateSection('login');
  };

  if (!session || activeSection === 'login') {
    return (
      <AdminLoginPage
        onSignIn={(nextSession) => {
          saveDemoAdminSession(nextSession);
          setSession(nextSession);
          const target =
            activeSection !== 'login'
              ? activeSection
              : intendedSectionRef.current || 'dashboard';
          onNavigateSection(target);
        }}
        onReturnToStorefront={onReturnToStorefront}
      />
    );
  }

  const currentSection = activeSection;
  const sectionTitle = SECTION_TITLES[currentSection];

  const renderSidebarContent = (isCompact: boolean, closeMobile?: () => void) => (
    <div className="flex flex-col h-full bg-[#351522] text-[#FFF5E9]">
      {/* Brand Header */}
      <div
        className={`h-16 px-4 border-b border-[#D6AD72]/25 flex items-center ${
          isCompact ? 'justify-center' : 'justify-between'
        } gap-2 shrink-0`}
      >
        <button
          type="button"
          onClick={() => {
            onNavigateSection('dashboard');
            closeMobile?.();
          }}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer text-left"
        >
          <FloralEmblem className="w-6 h-6 text-[#D6AD72] shrink-0" />
          {!isCompact && (
            <div className="min-w-0">
              <span className="block font-serif text-lg font-semibold tracking-[0.16em] text-[#FFF5E9] truncate">
                AUREMIST
              </span>
              <span className="block text-[9px] uppercase tracking-[0.2em] text-[#D6AD72]">
                Admin Console
              </span>
            </div>
          )}
        </button>

        {closeMobile ? (
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation menu"
            className="lg:hidden p-1.5 text-[#FFF5E9]/80 hover:text-[#D6AD72] cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.6} />
          </button>
        ) : (
          !isCompact && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              aria-label="Collapse sidebar"
              className="hidden lg:flex p-1.5 rounded text-[#FFF5E9]/70 hover:text-[#D6AD72] cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )
        )}
      </div>

      {/* 11 Admin Navigation Routes + Item 12 Back to Store */}
      <nav
        aria-label="Admin sidebar menu"
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
      >
        {SIDEBAR_MENU.map((item) => {
          const active = currentSection === item.id;
          const badgeCount =
            item.id === 'payment-verification'
              ? pendingVerificationCount
              : item.id === 'notifications'
                ? unreadNotificationsCount
                : 0;

          return (
            <button
              key={item.id}
              type="button"
              title={isCompact ? item.label : undefined}
              onClick={() => {
                onNavigateSection(item.id);
                closeMobile?.();
              }}
              className={`w-full flex items-center ${
                isCompact ? 'justify-center px-2' : 'justify-between px-3'
              } gap-2.5 py-2.5 rounded-lg text-xs sm:text-[13px] font-medium transition-colors cursor-pointer text-left min-h-[40px] ${
                active
                  ? 'bg-[#FFF5E9]/14 text-[#D6AD72] border border-[#D6AD72]/50'
                  : 'text-[#FFF5E9]/85 hover:bg-[#FFF5E9]/8 hover:text-[#FFF5E9] border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <item.icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-[#D6AD72]' : 'text-[#FFF5E9]/75'
                  }`}
                  strokeWidth={1.7}
                />
                {!isCompact && <span className="truncate">{item.label}</span>}
              </span>

              {!isCompact && badgeCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-[#D6AD72] text-[#351522] text-[10px] font-semibold tabular-nums shrink-0">
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}

        {/* 12. Back to Store */}
        <div className="pt-3 mt-3 border-t border-[#D6AD72]/25">
          <button
            type="button"
            title={isCompact ? 'Back to Store' : undefined}
            onClick={() => {
              closeMobile?.();
              onReturnToStorefront();
            }}
            className={`w-full flex items-center ${
              isCompact ? 'justify-center px-2' : 'px-3'
            } gap-2.5 py-2.5 rounded-lg text-xs sm:text-[13px] font-medium text-[#FFF5E9]/90 hover:bg-[#FFF5E9]/10 hover:text-[#D6AD72] transition-colors cursor-pointer text-left min-h-[40px]`}
          >
            <Store className="w-4 h-4 shrink-0 text-[#D6AD72]" strokeWidth={1.7} />
            {!isCompact && <span>Back to Store</span>}
          </button>
        </div>
      </nav>

      {/* Expand Sidebar Button (when compact) & Logout */}
      <div className="px-3 py-3 border-t border-[#D6AD72]/25 space-y-1.5 shrink-0">
        {isCompact && !closeMobile && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Expand sidebar"
            className="w-full flex items-center justify-center py-2 rounded-lg text-[#D6AD72] hover:bg-[#FFF5E9]/10 cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          title={isCompact ? 'Sign Out' : undefined}
          onClick={handleSignOut}
          className={`w-full flex items-center ${
            isCompact ? 'justify-center px-2' : 'px-3'
          } gap-2.5 py-2 rounded-lg text-xs font-medium text-[#FFF5E9]/85 hover:bg-[#FFF5E9]/10 hover:text-[#D6AD72] transition-colors cursor-pointer`}
        >
          <LogOut className="w-4 h-4 shrink-0 text-[#D6AD72]" strokeWidth={1.7} />
          {!isCompact && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F0E7] text-[#26151D] flex overflow-x-hidden">
      {/* Collapsible Desktop Left Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 border-r border-[#D6AD72]/35 sticky top-0 h-screen transition-[width] duration-200 ${
          sidebarCollapsed ? 'w-[76px]' : 'w-[260px]'
        }`}
      >
        {renderSidebarContent(sidebarCollapsed)}
      </aside>

      {/* Responsive Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: LUXURY_EASE }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-[#26151D]/55"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.24, ease: LUXURY_EASE }}
              className="relative z-10 w-72 max-w-[85vw] h-full border-r border-[#D6AD72]/40 shadow-2xl"
            >
              {renderSidebarContent(false, () => setMobileSidebarOpen(false))}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col bg-[#F8F0E7]">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-[#FFF5E9]/95 backdrop-blur-md border-b border-[#D6AD72]/40">
          <div className="px-4 sm:px-7 h-16 flex items-center justify-between gap-4">
            {/* Left: Mobile Trigger + Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open admin sidebar"
                className="lg:hidden p-2 -ml-2 rounded-lg text-[#351522] hover:bg-[#F8F0E7] cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0"
              >
                <Menu className="w-5 h-5" strokeWidth={1.6} />
              </button>

              <nav
                aria-label="Admin breadcrumb"
                className="flex items-center gap-2 text-xs sm:text-sm min-w-0"
              >
                <span className="text-[#5C434E] whitespace-nowrap hidden sm:inline">
                  AUREMIST Admin
                </span>
                <ChevronRight
                  className="w-3.5 h-3.5 text-[#D6AD72] shrink-0 hidden sm:inline"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <h1 className="font-serif text-xl sm:text-2xl font-semibold text-[#351522] truncate">
                  {sectionTitle}
                </h1>
              </nav>
            </div>

            {/* Center/Right: Search, Notifications, Profile & Sign Out */}
            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
              <form
                onSubmit={handleTopSearchSubmit}
                className="hidden md:flex items-center relative"
              >
                <Search
                  className="w-3.5 h-3.5 text-[#5C434E] absolute left-3 pointer-events-none"
                  strokeWidth={1.6}
                />
                <input
                  type="search"
                  value={topSearch}
                  onChange={(e) => setTopSearch(e.target.value)}
                  placeholder="Quick find order # or SKU..."
                  aria-label="Quick search admin workspace"
                  className="w-52 lg:w-64 pl-8 pr-3 py-1.5 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/55 text-xs text-[#26151D] placeholder:text-[#5C434E]/65 focus:outline-none focus:border-[#351522]"
                />
              </form>

              {/* Notification Icon */}
              <button
                type="button"
                onClick={() => onNavigateSection('notifications')}
                aria-label={`Notifications (${unreadNotificationsCount} unread)`}
                className="relative p-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/50 text-[#351522] hover:border-[#351522] transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
              >
                <Bell className="w-4 h-4" strokeWidth={1.7} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-[10px] font-semibold tabular-nums flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Admin Profile Area */}
              <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-[#D6AD72]/35">
                <div className="w-8 h-8 rounded-full bg-[#351522] text-[#D6AD72] border border-[#D6AD72] flex items-center justify-center text-xs font-serif font-semibold uppercase">
                  {session.displayName.slice(0, 2)}
                </div>
                <div className="text-left leading-tight">
                  <p className="text-xs font-medium text-[#351522] truncate max-w-[150px]">
                    {session.email}
                  </p>
                  <p className="text-[10px] text-[#8C6526]">
                    Frontend Demo Session
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.6} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Active Admin Route Page */}
        <main className="flex-1 px-4 sm:px-7 py-6 sm:py-8 max-w-[1440px] w-full mx-auto">
          {currentSection === 'dashboard' && (
            <AdminOverviewView
              orders={orders}
              products={products}
              lowStockThreshold={settings.lowStockThreshold}
              activity={activity}
              onNavigateSection={onNavigateSection}
              onSelectOrder={(order) => setSelectedOrderId(order.id)}
            />
          )}

          {currentSection === 'orders' && (
            <AdminOrdersView
              orders={orders}
              externalSearchQuery={ordersSearchExternal}
              onSelectOrder={(order) => setSelectedOrderId(order.id)}
              onUpdateOrderStatus={(orderId, orderStatus) =>
                handleUpdateDemoOrder(orderId, { orderStatus })
              }
            />
          )}

          {currentSection === 'payment-verification' && (
            <AdminPaymentVerificationView
              orders={orders}
              walletRecipientNumber={settings.walletRecipientNumber}
              onSelectOrder={(order) => setSelectedOrderId(order.id)}
              onReviewPayment={handleReviewPayment}
              onSaveInternalNote={handleSaveInternalNote}
            />
          )}

          {currentSection === 'products' && (
            <AdminProductsView
              products={products}
              categories={categories}
              externalSearchQuery={productsSearchExternal}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onToggleProductStatus={handleToggleProductStatus}
            />
          )}

          {currentSection === 'inventory' && (
            <AdminInventoryView
              products={products}
              lowStockThreshold={settings.lowStockThreshold}
              onAdjustStock={handleAdjustStock}
            />
          )}

          {currentSection === 'categories' && (
            <AdminCategoriesView
              categories={categories}
              products={products}
              onAddCategory={(cat) => {
                setCategories((prev) => [...prev, cat]);
                pushActivity({
                  title: `Added category: ${cat.name}`,
                  detail: 'Category created in demo workspace.',
                  kind: 'system',
                });
              }}
              onUpdateCategory={(updated) => {
                setCategories((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c)),
                );
                pushActivity({
                  title: `Updated category: ${updated.name}`,
                  detail: 'Category details updated in demo workspace.',
                  kind: 'system',
                });
              }}
              onDeleteCategory={(catId) => {
                const target = categories.find((c) => c.id === catId);
                setCategories((prev) => prev.filter((c) => c.id !== catId));
                if (target) {
                  pushActivity({
                    title: `Deleted category: ${target.name}`,
                    detail: 'Removed category from demo workspace.',
                    kind: 'system',
                  });
                }
              }}
              onToggleCategory={(catId) =>
                setCategories((prev) =>
                  prev.map((c) =>
                    c.id === catId ? { ...c, isActive: !c.isActive } : c,
                  ),
                )
              }
            />
          )}

          {currentSection === 'coupons' && (
            <AdminCouponsView
              coupons={coupons}
              onAddCoupon={(coupon) => {
                setCoupons((prev) => [coupon, ...prev]);
                pushActivity({
                  title: `Created coupon ${coupon.code}`,
                  detail: coupon.description,
                  kind: 'system',
                });
              }}
              onUpdateCoupon={(updated) => {
                setCoupons((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c)),
                );
                pushActivity({
                  title: `Updated coupon ${updated.code}`,
                  detail: updated.description,
                  kind: 'system',
                });
              }}
              onToggleCoupon={(couponId) =>
                setCoupons((prev) =>
                  prev.map((c) =>
                    c.id === couponId ? { ...c, isActive: !c.isActive } : c,
                  ),
                )
              }
              onDeleteCoupon={(couponId) =>
                setCoupons((prev) => prev.filter((c) => c.id !== couponId))
              }
            />
          )}

          {currentSection === 'shipments' && (
            <AdminShipmentsView
              orders={orders}
              onSelectOrder={(order) => setSelectedOrderId(order.id)}
              onUpdateShipment={handleUpdateShipment}
            />
          )}

          {currentSection === 'notifications' && (
            <AdminNotificationsView
              notifications={notifications}
              onMarkRead={(id) =>
                setNotifications((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
                )
              }
              onToggleUnread={(id) =>
                setNotifications((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)),
                )
              }
              onMarkAllRead={() =>
                setNotifications((prev) =>
                  prev.map((n) => ({ ...n, unread: false })),
                )
              }
              onOpenRelated={(section, orderId) => {
                onNavigateSection(section);
                if (orderId) {
                  setSelectedOrderId(orderId);
                }
              }}
            />
          )}

          {currentSection === 'reports' && (
            <AdminReportsView orders={orders} products={products} />
          )}

          {currentSection === 'settings' && (
            <AdminSettingsView
              settings={settings}
              onSaveSettings={(nextSettings) => {
                setSettings(nextSettings);
                saveStoreSettingsToStorage(nextSettings);
                pushActivity({
                  title: 'Updated store settings',
                  detail:
                    'Store profile, payment options, wallet instructions, or delivery tariffs updated in demo workspace.',
                  kind: 'system',
                });
              }}
            />
          )}
        </main>
      </div>

      {/* Complete Order Details Drawer */}
      <AdminOrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        onUpdateDemoOrder={handleUpdateDemoOrder}
      />
    </div>
  );
}
