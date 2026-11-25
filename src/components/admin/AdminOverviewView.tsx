import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Clock,
  Eye,
  Info,
  PackageCheck,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import {
  buildOrderStatusDistribution,
  buildSalesChartSeries,
  computeAdminOverviewMetrics,
  formatAdminDate,
  formatAdminDateTime,
  formatPaymentMethodShort,
  getLowStockVariantsFromProducts,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
} from '../../data/adminDemoData';
import { formatPrice } from '../../data/fragrances';
import {
  AdminActivityEntry,
  AdminOrderRecord,
  AdminProductRecord,
  AdminSection,
  SalesRangeKey,
} from '../../types/admin';

interface AdminOverviewViewProps {
  orders: AdminOrderRecord[];
  products: AdminProductRecord[];
  lowStockThreshold: number;
  activity: AdminActivityEntry[];
  onNavigateSection: (section: Exclude<AdminSection, 'login'>) => void;
  onSelectOrder: (order: AdminOrderRecord) => void;
}

export function AdminOverviewView({
  orders,
  products,
  lowStockThreshold,
  activity,
  onNavigateSection,
  onSelectOrder,
}: AdminOverviewViewProps) {
  const [salesRange, setSalesRange] = useState<SalesRangeKey>('30d');

  const metrics = useMemo(
    () => computeAdminOverviewMetrics(orders, products, lowStockThreshold),
    [orders, products, lowStockThreshold],
  );
  const salesBuckets = useMemo(
    () => buildSalesChartSeries(orders, salesRange),
    [orders, salesRange],
  );
  const statusBreakdown = useMemo(
    () => buildOrderStatusDistribution(orders),
    [orders],
  );

  const maxBucketRevenue = Math.max(
    1,
    ...salesBuckets.map((bucket) => bucket.revenue),
  );
  const rangeTotalRevenue = salesBuckets.reduce(
    (sum, bucket) => sum + bucket.revenue,
    0,
  );
  const rangeOrderCount = salesBuckets.reduce(
    (sum, bucket) => sum + bucket.orderCount,
    0,
  );

  const pendingPaymentOrders = useMemo(
    () => orders.filter((o) => o.paymentStatus === 'awaiting_verification'),
    [orders],
  );

  const lowStockItems = useMemo(
    () => getLowStockVariantsFromProducts(products, lowStockThreshold),
    [products, lowStockThreshold],
  );

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const kpiCards = [
    {
      id: 'total-orders',
      label: 'Total Orders',
      value: String(metrics.totalOrders),
      subtext: 'Demo boutique orders',
      icon: ShoppingBag,
      action: () => onNavigateSection('orders'),
    },
    {
      id: 'total-revenue',
      label: 'Total Sales Revenue',
      value: formatPrice(metrics.totalSalesRevenue),
      subtext: 'Demo active order revenue',
      icon: TrendingUp,
      action: () => onNavigateSection('reports'),
    },
    {
      id: 'avg-order-value',
      label: 'Average Order Value',
      value: formatPrice(metrics.averageOrderValue),
      subtext: 'Across active demo orders',
      icon: PackageCheck,
      action: () => onNavigateSection('reports'),
    },
    {
      id: 'pending-payment',
      label: 'Pending Payment Verification',
      value: String(metrics.awaitingVerificationCount),
      subtext: 'Manual wallet transfers',
      icon: Clock,
      action: () => onNavigateSection('payment-verification'),
    },
    {
      id: 'processing-orders',
      label: 'Processing Orders',
      value: String(metrics.processingCount),
      subtext: 'Processing & packed',
      icon: Activity,
      action: () => onNavigateSection('shipments'),
    },
    {
      id: 'low-stock',
      label: 'Low Stock Products',
      value: String(metrics.lowStockCount),
      subtext: `Variants ≤ ${lowStockThreshold} units`,
      icon: AlertTriangle,
      action: () => onNavigateSection('inventory'),
    },
  ];

  return (
    <div className="space-y-7">
      {/* Transparent Demonstration Data Notice */}
      <div className="p-4 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/55 flex items-start gap-3">
        <Info
          className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
          strokeWidth={1.8}
        />
        <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
          <strong className="font-semibold text-[#351522]">
            Demonstration Data Notice:
          </strong>{' '}
          All figures, charts, alerts, and order records on this dashboard are
          sample demonstration data for frontend preview and do not represent
          actual live business performance until backend APIs are connected.
        </p>
      </div>

      {/* Six Summary Cards */}
      <section aria-label="Dashboard summary metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {kpiCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={card.action}
              className="text-left rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 hover:border-[#351522]/65 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-medium text-[#5C434E]">
                  {card.label}
                </span>
                <span className="w-8 h-8 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/45 flex items-center justify-center shrink-0 group-hover:border-[#351522]/50">
                  <card.icon
                    className="w-4 h-4 text-[#351522]"
                    strokeWidth={1.6}
                  />
                </span>
              </div>
              <p className="font-serif text-3xl font-semibold text-[#351522] tabular-nums leading-tight">
                {card.value}
              </p>
              <p className="text-[11px] text-[#5C434E] mt-1.5">
                {card.subtext}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Sales Overview & Order Statistics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-5 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D6AD72]/25">
            <div>
              <span className="block text-[11px] uppercase tracking-[0.16em] text-[#8C6526] font-semibold mb-0.5">
                Demo Revenue Series
              </span>
              <h2 className="font-serif text-2xl font-medium text-[#351522]">
                Sales Overview
              </h2>
            </div>

            <div
              role="group"
              aria-label="Sales overview date range"
              className="inline-flex items-center p-1 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/45 self-start sm:self-auto"
            >
              {(
                [
                  { id: '7d', label: '7 Days' },
                  { id: '14d', label: '14 Days' },
                  { id: '30d', label: '30 Days' },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSalesRange(option.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    salesRange === option.id
                      ? 'bg-[#351522] text-[#FFF5E9]'
                      : 'text-[#5C434E] hover:text-[#351522]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-4 text-xs">
            <div>
              <span className="text-[#5C434E]">Period Sales (Demo): </span>
              <strong className="text-base font-semibold text-[#351522] tabular-nums">
                {formatPrice(rangeTotalRevenue)}
              </strong>
            </div>
            <span className="text-[#5C434E] tabular-nums">
              {rangeOrderCount} active{' '}
              {rangeOrderCount === 1 ? 'order' : 'orders'} in selected window
            </span>
          </div>

          <div
            role="img"
            aria-label={`Sales overview bar chart for ${salesRange}`}
            className="pt-2"
          >
            <div className="h-52 flex items-end justify-between gap-2 sm:gap-3 border-b border-[#D6AD72]/40 pb-2">
              {salesBuckets.map((bucket) => {
                const heightPercent =
                  bucket.revenue > 0
                    ? Math.max(
                        10,
                        Math.round((bucket.revenue / maxBucketRevenue) * 100),
                      )
                    : 4;
                return (
                  <div
                    key={bucket.key}
                    className="flex-1 h-full flex flex-col justify-end items-center gap-1.5 min-w-0 group"
                  >
                    <span className="text-[10px] text-[#351522] font-medium tabular-nums opacity-80 group-hover:opacity-100 truncate max-w-full">
                      {bucket.revenue > 0
                        ? `Rs.${Math.round((bucket.revenue / 1000) * 10) / 10}k`
                        : '0'}
                    </span>
                    <div
                      title={`${bucket.label}: ${formatPrice(bucket.revenue)} (${bucket.orderCount} orders)`}
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[44px] rounded-t-md border transition-colors ${
                        bucket.revenue > 0
                          ? 'bg-[#351522] border-[#D6AD72]/70 group-hover:bg-[#4A1E30]'
                          : 'bg-[#F8F0E7] border-[#D6AD72]/40'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2 sm:gap-3 pt-2">
              {salesBuckets.map((bucket) => (
                <div
                  key={`${bucket.key}-label`}
                  className="flex-1 text-center text-[11px] text-[#5C434E] tabular-nums truncate"
                >
                  {bucket.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Order Statistics Chart */}
        <section className="lg:col-span-5 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-5 min-w-0">
          <div className="pb-4 border-b border-[#D6AD72]/25">
            <span className="block text-[11px] uppercase tracking-[0.16em] text-[#8C6526] font-semibold mb-0.5">
              Status Distribution (Demo)
            </span>
            <h2 className="font-serif text-2xl font-medium text-[#351522]">
              Order Statistics
            </h2>
          </div>

          <div className="space-y-3.5">
            {statusBreakdown.map((item) => (
              <div key={item.status} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-[#26151D]">
                    {item.label}
                  </span>
                  <span className="text-[#5C434E] tabular-nums">
                    {item.count} ({item.percent}%)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#F8F0E7] border border-[#D6AD72]/35 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(item.percent, 4)}%` }}
                    className={`h-full rounded-full ${
                      item.status === 'cancelled'
                        ? 'bg-[#7A1D38]'
                        : item.status === 'delivered'
                          ? 'bg-[#1F4E37]'
                          : item.status === 'pending_verification'
                            ? 'bg-[#C69A50]'
                            : 'bg-[#351522]'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Pending Payment Alerts & Low-Stock Product Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-4 min-w-0">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#D6AD72]/25">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#8C6526]" strokeWidth={1.7} />
              <h2 className="font-serif text-2xl font-medium text-[#351522]">
                Pending Payment Alerts
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('payment-verification')}
              className="text-xs font-medium text-[#351522] hover:text-[#8C6526] cursor-pointer"
            >
              Review Queue →
            </button>
          </div>

          {pendingPaymentOrders.length === 0 ? (
            <p className="text-xs text-[#5C434E] py-3">
              All manual wallet transfers have been reviewed.
            </p>
          ) : (
            <ul className="divide-y divide-[#D6AD72]/25">
              {pendingPaymentOrders.map((order) => (
                <li
                  key={order.id}
                  className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-semibold text-[#351522] tabular-nums">
                      {order.orderNumber} · {order.customer.fullName}
                    </p>
                    <p className="text-xs text-[#5C434E] tabular-nums">
                      {formatPaymentMethodShort(order.paymentMethod)} ·{' '}
                      {formatPrice(order.grandTotal)} ·{' '}
                      {PAYMENT_STATUS_META[order.paymentStatus].label}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectOrder(order)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.6} />
                    <span>Inspect</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-6 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-4 min-w-0">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#D6AD72]/25">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className="w-4 h-4 text-[#8C6526]"
                strokeWidth={1.7}
              />
              <h2 className="font-serif text-2xl font-medium text-[#351522]">
                Low-Stock Product Alerts
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('inventory')}
              className="text-xs font-medium text-[#351522] hover:text-[#8C6526] cursor-pointer"
            >
              Adjust Stock →
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <p className="text-xs text-[#5C434E] py-3">
              No perfume variants are currently below the {lowStockThreshold}
              -unit threshold.
            </p>
          ) : (
            <ul className="divide-y divide-[#D6AD72]/25">
              {lowStockItems.slice(0, 5).map((item) => (
                <li
                  key={item.sku}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#351522] truncate">
                      {item.productName} ({item.size})
                    </p>
                    <p className="text-[11px] font-mono text-[#5C434E]">
                      {item.sku}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded border text-[11px] font-medium tabular-nums shrink-0 ${
                      item.stockCount === 0
                        ? 'text-[#7A1D38] border-[#7A1D38]/35 bg-[#FDF3F5]'
                        : 'text-[#8C6526] border-[#D6AD72] bg-[#F8F0E7]'
                    }`}
                  >
                    {item.stockCount === 0
                      ? 'Out of Stock'
                      : `${item.stockCount} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Recent Orders & Latest Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-8 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 overflow-hidden min-w-0">
          <div className="px-5 sm:px-6 py-4 bg-[#F8F0E7] border-b border-[#D6AD72]/30 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="block text-[11px] uppercase tracking-[0.16em] text-[#8C6526] font-semibold">
                Latest Sample Orders
              </span>
              <h2 className="font-serif text-2xl font-medium text-[#351522]">
                Recent Orders
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigateSection('orders')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#351522] hover:text-[#8C6526] transition-colors cursor-pointer"
            >
              <span>All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.7} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#D6AD72]/30 text-[11px] uppercase tracking-[0.12em] text-[#5C434E]">
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Total</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6AD72]/20">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#F8F0E7]/65 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-[#351522] tabular-nums whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-[#26151D] whitespace-nowrap">
                      {order.customer.fullName}
                    </td>
                    <td className="py-3 px-4 text-[#5C434E] tabular-nums whitespace-nowrap">
                      {formatAdminDate(order.createdAt)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded border text-[11px] font-medium ${ORDER_STATUS_META[order.orderStatus].toneClass}`}
                      >
                        {ORDER_STATUS_META[order.orderStatus].label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-[#351522] tabular-nums whitespace-nowrap">
                      {formatPrice(order.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectOrder(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#F8F0E7] border border-[#D6AD72]/55 text-xs font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" strokeWidth={1.6} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="xl:col-span-4 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-4 min-w-0">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D6AD72]/25">
            <Activity className="w-4 h-4 text-[#8C6526]" strokeWidth={1.7} />
            <h2 className="font-serif text-2xl font-medium text-[#351522]">
              Latest Activity
            </h2>
          </div>

          <ul className="divide-y divide-[#D6AD72]/20">
            {activity.slice(0, 6).map((entry) => (
              <li
                key={entry.id}
                className="py-3 first:pt-0 last:pb-0 space-y-1"
              >
                <p className="text-xs font-medium text-[#351522]">
                  {entry.title}
                </p>
                <p className="text-xs text-[#5C434E] leading-relaxed">
                  {entry.detail}
                </p>
                <span className="block text-[10px] text-[#8C6526] tabular-nums">
                  {formatAdminDateTime(entry.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
