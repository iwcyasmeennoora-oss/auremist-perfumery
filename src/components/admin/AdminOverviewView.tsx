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
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
} from '../../data/adminDemoData';
import { formatPrice } from '../../data/fragrances';
import {
  AdminActivityEntry,
  AdminOrderRecord,
  AdminSection,
  SalesRangeKey,
} from '../../types/admin';

interface AdminOverviewViewProps {
  orders: AdminOrderRecord[];
  activity: AdminActivityEntry[];
  onNavigateSection: (section: AdminSection) => void;
  onSelectOrder: (order: AdminOrderRecord) => void;
}

export function AdminOverviewView({
  orders,
  activity,
  onNavigateSection,
  onSelectOrder,
}: AdminOverviewViewProps) {
  const [salesRange, setSalesRange] = useState<SalesRangeKey>('30d');

  const metrics = useMemo(() => computeAdminOverviewMetrics(orders), [orders]);
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

  const alertOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.paymentStatus === 'awaiting_verification' ||
          o.orderStatus === 'order_received',
      ),
    [orders],
  );

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const kpiCards = [
    {
      id: 'total-orders',
      label: 'Total Orders',
      value: String(metrics.totalOrders),
      subtext: 'Sample boutique orders',
      icon: ShoppingBag,
      action: () => onNavigateSection('orders'),
    },
    {
      id: 'total-revenue',
      label: 'Total Sales Revenue',
      value: formatPrice(metrics.totalSalesRevenue),
      subtext: 'Excludes cancelled orders',
      icon: TrendingUp,
      action: () => onNavigateSection('orders'),
    },
    {
      id: 'avg-order-value',
      label: 'Average Order Value',
      value: formatPrice(metrics.averageOrderValue),
      subtext: 'Across active demo orders',
      icon: PackageCheck,
      action: () => onNavigateSection('orders'),
    },
    {
      id: 'awaiting-verification',
      label: 'Awaiting Payment Verification',
      value: String(metrics.awaitingVerificationCount),
      subtext: 'Manual wallet transfers',
      icon: Clock,
      action: () => onNavigateSection('orders'),
    },
    {
      id: 'processing-orders',
      label: 'Processing Orders',
      value: String(metrics.processingCount),
      subtext: 'Processing & packed',
      icon: Activity,
      action: () => onNavigateSection('orders'),
    },
    {
      id: 'low-stock',
      label: 'Low Stock Products',
      value: String(metrics.lowStockCount),
      subtext: 'Variants at or below 5 units',
      icon: AlertTriangle,
      action: () => onNavigateSection('inventory'),
    },
  ];

  return (
    <div className="space-y-7">
      {/* Transparent Demonstration Data Notice */}
      <div className="p-4 rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/50 flex items-start gap-3">
        <Info
          className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
          strokeWidth={1.8}
        />
        <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
          <strong className="font-semibold text-[#351522]">
            Demonstration Data Mode:
          </strong>{' '}
          Metrics, charts, and order records shown below are clearly labeled
          sample data until live database records and backend APIs are
          connected.
        </p>
      </div>

      {/* 1. Six Summary Metric Cards */}
      <section aria-label="Store performance summary">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {kpiCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={card.action}
              className="text-left rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/45 p-5 hover:border-[#351522]/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-medium text-[#5C434E]">
                  {card.label}
                </span>
                <span className="w-8 h-8 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/45 flex items-center justify-center shrink-0 group-hover:border-[#351522]/50">
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

      {/* 2. Charts Row: Sales Overview + Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Overview Chart with Date-Range Filter */}
        <section className="lg:col-span-7 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-5 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D6AD72]/25">
            <div>
              <span className="block text-[11px] uppercase tracking-[0.16em] text-[#8C6526] font-semibold mb-0.5">
                Demo Revenue Trend
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
              ).map((option) => {
                const active = salesRange === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSalesRange(option.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#351522] text-[#FFF5E9]'
                        : 'text-[#5C434E] hover:text-[#351522]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
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

          {/* Responsive Bar Chart */}
          <div
            role="img"
            aria-label={`Sales overview bar chart for last ${salesRange}`}
            className="pt-2"
          >
            <div className="h-52 flex items-end justify-between gap-2 sm:gap-3 border-b border-[#D6AD72]/40 pb-2">
              {salesBuckets.map((bucket) => {
                const heightPercent =
                  bucket.revenue > 0
                    ? Math.max(10, Math.round((bucket.revenue / maxBucketRevenue) * 100))
                    : 4;
                return (
                  <div
                    key={bucket.key}
                    className="flex-1 h-full flex flex-col justify-end items-center gap-1.5 min-w-0 group"
                  >
                    <span className="text-[10px] text-[#351522] font-medium tabular-nums opacity-80 group-hover:opacity-100 truncate max-w-full">
                      {bucket.revenue > 0
                        ? `Rs.${Math.round(bucket.revenue / 1000 * 10) / 10}k`
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

        {/* Orders by Status Chart */}
        <section className="lg:col-span-5 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-5 min-w-0">
          <div className="pb-4 border-b border-[#D6AD72]/25">
            <span className="block text-[11px] uppercase tracking-[0.16em] text-[#8C6526] font-semibold mb-0.5">
              Pipeline Breakdown
            </span>
            <h2 className="font-serif text-2xl font-medium text-[#351522]">
              Orders by Status
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

      {/* 3. New Order Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* New Order Alerts */}
        <section className="lg:col-span-6 rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-4 min-w-0">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#D6AD72]/25">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#8C6526]" strokeWidth={1.7} />
              <h2 className="font-serif text-2xl font-medium text-[#351522]">
                New Order Alerts
              </h2>
            </div>
            <span className="text-xs font-medium text-[#351522] tabular-nums">
              {alertOrders.length} requiring attention
            </span>
          </div>

          {alertOrders.length === 0 ? (
            <p className="text-xs text-[#5C434E] py-4">
              No pending new order or verification alerts right now.
            </p>
          ) : (
            <ul className="divide-y divide-[#D6AD72]/25">
              {alertOrders.map((order) => (
                <li
                  key={order.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-[#351522] tabular-nums">
                        {order.orderNumber}
                      </span>
                      <span className="text-[#D6AD72]" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-[#26151D] font-medium">
                        {order.customer.fullName}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C434E] tabular-nums">
                      {formatPaymentMethodShort(order.paymentMethod)} ·{' '}
                      {PAYMENT_STATUS_META[order.paymentStatus].label} ·{' '}
                      {formatPrice(order.grandTotal)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectOrder(order)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.6} />
                    <span>Review Order</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent Activity */}
        <section className="lg:col-span-6 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-4 min-w-0">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D6AD72]/25">
            <Activity className="w-4 h-4 text-[#8C6526]" strokeWidth={1.7} />
            <h2 className="font-serif text-2xl font-medium text-[#351522]">
              Recent Activity
            </h2>
          </div>

          <ul className="divide-y divide-[#D6AD72]/20">
            {activity.map((entry) => (
              <li key={entry.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-xs sm:text-sm font-medium text-[#351522]">
                    {entry.title}
                  </p>
                  <span className="text-[11px] text-[#5C434E] tabular-nums shrink-0">
                    {formatAdminDateTime(entry.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-[#5C434E] leading-relaxed">
                  {entry.detail}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 4. Recent Orders Table */}
      <section className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 overflow-hidden">
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
            <span>Open Full Orders Table</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.7} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#D6AD72]/30 text-[11px] uppercase tracking-[0.12em] text-[#5C434E] bg-[#FFF5E9]">
                <th className="py-3 px-4 font-semibold">Order #</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Payment</th>
                <th className="py-3 px-4 font-semibold">Order Status</th>
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
                  <td className="py-3.5 px-4 font-medium text-[#351522] tabular-nums whitespace-nowrap">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5 px-4 text-[#26151D] whitespace-nowrap">
                    {order.customer.fullName}
                  </td>
                  <td className="py-3.5 px-4 text-[#5C434E] tabular-nums whitespace-nowrap">
                    {formatAdminDate(order.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-[#26151D]">
                      {formatPaymentMethodShort(order.paymentMethod)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded border text-[11px] font-medium ${ORDER_STATUS_META[order.orderStatus].toneClass}`}
                    >
                      {ORDER_STATUS_META[order.orderStatus].label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-[#351522] tabular-nums whitespace-nowrap">
                    {formatPrice(order.grandTotal)}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectOrder(order)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#F8F0E7] border border-[#D6AD72]/55 text-xs font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={1.6} />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
