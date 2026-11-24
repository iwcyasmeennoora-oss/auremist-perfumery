import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Boxes,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
  Store,
  X,
} from 'lucide-react';
import {
  DEMO_ADMIN_ACTIVITY,
  DEMO_ADMIN_ORDERS,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
} from '../../data/adminDemoData';
import { LUXURY_EASE } from '../../lib/motion';
import {
  AdminActivityEntry,
  AdminOrderRecord,
  AdminSection,
  AdminSession,
} from '../../types/admin';
import { FloralEmblem } from '../FloralEmblem';
import { AdminInventoryView } from './AdminInventoryView';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminOrderDetailModal } from './AdminOrderDetailModal';
import { AdminOrdersView } from './AdminOrdersView';
import { AdminOverviewView } from './AdminOverviewView';

interface AdminDashboardProps {
  onReturnToStorefront: () => void;
}

const SIDEBAR_ITEMS: Array<{
  id: AdminSection;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'inventory', label: 'Catalog & Stock', icon: Boxes },
];

export function AdminDashboard({ onReturnToStorefront }: AdminDashboardProps) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<AdminOrderRecord[]>(DEMO_ADMIN_ORDERS);
  const [activity, setActivity] =
    useState<AdminActivityEntry[]>(DEMO_ADMIN_ACTIVITY);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const handleUpdateDemoOrder = (
    orderId: string,
    patch: Partial<Pick<AdminOrderRecord, 'orderStatus' | 'paymentStatus'>>,
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, ...patch } : order,
      ),
    );

    const target = orders.find((o) => o.id === orderId);
    if (target) {
      const updates: string[] = [];
      if (patch.orderStatus) {
        updates.push(`Order Status → ${ORDER_STATUS_META[patch.orderStatus].label}`);
      }
      if (patch.paymentStatus) {
        updates.push(
          `Payment Status → ${PAYMENT_STATUS_META[patch.paymentStatus].label}`,
        );
      }
      if (updates.length > 0) {
        setActivity((prev) => [
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            title: `Demo preview updated (${target.orderNumber})`,
            detail: `${updates.join(' · ')} (in-memory frontend preview only).`,
            orderNumber: target.orderNumber,
            kind: patch.paymentStatus ? 'payment' : 'fulfillment',
          },
          ...prev.slice(0, 7),
        ]);
      }
    }
  };

  const handleSignOut = () => {
    setSelectedOrderId(null);
    setMobileSidebarOpen(false);
    setSession(null);
  };

  if (!session) {
    return (
      <AdminLoginPage
        onSignIn={(nextSession) => setSession(nextSession)}
        onReturnToStorefront={onReturnToStorefront}
      />
    );
  }

  const sectionTitle =
    activeSection === 'overview'
      ? 'Dashboard Overview'
      : activeSection === 'orders'
        ? 'Order Management'
        : 'Catalog & Stock';

  const renderSidebarNav = (onSelectDone?: () => void) => (
    <div className="flex flex-col h-full bg-[#351522] text-[#FFF5E9]">
      {/* Brand Lockup */}
      <div className="px-6 py-6 border-b border-[#D6AD72]/25 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <FloralEmblem className="w-6 h-6 text-[#D6AD72] shrink-0" />
          <div className="min-w-0">
            <span className="block font-serif text-xl font-semibold tracking-[0.16em] text-[#FFF5E9] truncate">
              AUREMIST
            </span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#D6AD72]">
              Admin Portal
            </span>
          </div>
        </div>

        {onSelectDone && (
          <button
            type="button"
            onClick={onSelectDone}
            aria-label="Close navigation menu"
            className="lg:hidden p-1.5 text-[#FFF5E9]/80 hover:text-[#D6AD72] cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.6} />
          </button>
        )}
      </div>

      {/* Primary Navigation */}
      <nav
        aria-label="Admin sidebar navigation"
        className="flex-1 px-4 py-6 space-y-1.5"
      >
        {SIDEBAR_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveSection(item.id);
                onSelectDone?.();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left min-h-[44px] ${
                active
                  ? 'bg-[#FFF5E9]/12 text-[#D6AD72] border border-[#D6AD72]/45'
                  : 'text-[#FFF5E9]/85 hover:bg-[#FFF5E9]/8 hover:text-[#FFF5E9] border border-transparent'
              }`}
            >
              <item.icon
                className={`w-4 h-4 shrink-0 ${
                  active ? 'text-[#D6AD72]' : 'text-[#FFF5E9]/75'
                }`}
                strokeWidth={1.7}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 py-5 border-t border-[#D6AD72]/25 space-y-2">
        <button
          type="button"
          onClick={onReturnToStorefront}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-[#FFF5E9]/85 hover:bg-[#FFF5E9]/10 hover:text-[#D6AD72] transition-colors cursor-pointer min-h-[40px]"
        >
          <Store className="w-4 h-4 shrink-0 text-[#D6AD72]" strokeWidth={1.6} />
          <span>Public Storefront</span>
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-[#FFF5E9]/85 hover:bg-[#FFF5E9]/10 hover:text-[#D6AD72] transition-colors cursor-pointer min-h-[40px]"
        >
          <LogOut
            className="w-4 h-4 shrink-0 text-[#D6AD72]"
            strokeWidth={1.6}
          />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF5E9] text-[#26151D] flex overflow-x-hidden">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-[#D6AD72]/35 sticky top-0 h-screen">
        {renderSidebarNav()}
      </aside>

      {/* Mobile Sidebar Drawer */}
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
              {renderSidebarNav(() => setMobileSidebarOpen(false))}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Right Main Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Clean Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-[#F8F0E7]/95 backdrop-blur-md border-b border-[#D6AD72]/35">
          <div className="px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open admin menu"
                className="lg:hidden p-2 -ml-2 rounded-lg text-[#351522] hover:bg-[#FFF5E9] cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0"
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
                <span className="font-serif text-lg sm:text-xl font-semibold text-[#351522] truncate">
                  {sectionTitle}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="hidden md:block text-right">
                <p className="text-xs font-medium text-[#351522] truncate max-w-[200px]">
                  {session.email}
                </p>
                <p className="text-[11px] text-[#8C6526]">Frontend Demo UI</p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.6} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Active Dashboard Viewport */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1400px] w-full mx-auto">
          {activeSection === 'overview' && (
            <AdminOverviewView
              orders={orders}
              activity={activity}
              onNavigateSection={setActiveSection}
              onSelectOrder={(order) => setSelectedOrderId(order.id)}
            />
          )}

          {activeSection === 'orders' && (
            <AdminOrdersView
              orders={orders}
              onSelectOrder={(order) => setSelectedOrderId(order.id)}
            />
          )}

          {activeSection === 'inventory' && <AdminInventoryView />}
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
