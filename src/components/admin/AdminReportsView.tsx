import { useMemo, useState } from 'react';
import { BarChart3, Calendar, Download, Info, RotateCcw } from 'lucide-react';
import {
  buildOrderStatusDistribution,
  formatPaymentMethodShort,
  ORDER_STATUS_META,
} from '../../data/adminDemoData';
import { formatPrice } from '../../data/fragrances';
import { AdminOrderRecord, AdminProductRecord } from '../../types/admin';

interface AdminReportsViewProps {
  orders: AdminOrderRecord[];
  products: AdminProductRecord[];
}

function escapeCsvCell(raw: string | number): string {
  const str = String(raw);
  const formulaSafe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${formulaSafe.replace(/"/g, '""')}"`;
}

function triggerCsvDownload(
  filename: string,
  rows: Array<Array<string | number>>,
) {
  const csvContent = rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
    .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function AdminReportsView({ orders, products }: AdminReportsViewProps) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const dateFilteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDay = order.createdAt.slice(0, 10);
      if (fromDate && orderDay < fromDate) return false;
      if (toDate && orderDay > toDate) return false;
      return true;
    });
  }, [orders, fromDate, toDate]);

  const activeOrders = useMemo(
    () => dateFilteredOrders.filter((o) => o.orderStatus !== 'cancelled'),
    [dateFilteredOrders],
  );

  const revenueSummary = useMemo(() => {
    const grossRevenue = activeOrders.reduce((s, o) => s + o.grandTotal, 0);
    const totalDiscounts = activeOrders.reduce(
      (s, o) => s + o.discountAmount,
      0,
    );
    const avgOrder =
      activeOrders.length > 0
        ? Math.round(grossRevenue / activeOrders.length)
        : 0;
    return {
      totalOrders: dateFilteredOrders.length,
      activeOrdersCount: activeOrders.length,
      grossRevenue,
      totalDiscounts,
      avgOrder,
    };
  }, [dateFilteredOrders, activeOrders]);

  const statusBreakdown = useMemo(
    () => buildOrderStatusDistribution(dateFilteredOrders),
    [dateFilteredOrders],
  );

  const paymentBreakdown = useMemo(() => {
    const methods = ['cod', 'easypaisa', 'jazzcash'] as const;
    const totalRev = Math.max(
      1,
      activeOrders.reduce((s, o) => s + o.grandTotal, 0),
    );
    return methods.map((method) => {
      const matching = activeOrders.filter((o) => o.paymentMethod === method);
      const revenue = matching.reduce((s, o) => s + o.grandTotal, 0);
      return {
        method,
        label: formatPaymentMethodShort(method),
        ordersCount: matching.length,
        revenue,
        sharePercent:
          activeOrders.length > 0 ? Math.round((revenue / totalRev) * 100) : 0,
      };
    });
  }, [activeOrders]);

  const topProducts = useMemo(() => {
    const map = new Map<
      string,
      { name: string; unitsSold: number; revenue: number }
    >();
    for (const order of activeOrders) {
      for (const item of order.items) {
        const existing = map.get(item.productId) ?? {
          name: item.productName,
          unitsSold: 0,
          revenue: 0,
        };
        existing.unitsSold += item.quantity;
        existing.revenue += item.lineTotal;
        map.set(item.productId, existing);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [activeOrders]);

  const zoneBreakdown = useMemo(() => {
    const map = new Map<
      string,
      { zone: string; count: number; total: number }
    >();
    for (const order of activeOrders) {
      const entry = map.get(order.deliveryZone) ?? {
        zone: order.deliveryZone,
        count: 0,
        total: 0,
      };
      entry.count += 1;
      entry.total += order.grandTotal;
      map.set(order.deliveryZone, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [activeOrders]);

  const handleExportOrdersCsv = () => {
    const rows: Array<Array<string | number>> = [
      [
        'Order Number',
        'Date',
        'Customer',
        'City',
        'Payment Method',
        'Payment Status',
        'Order Status',
        'Subtotal (PKR)',
        'Discount (PKR)',
        'Delivery Fee (PKR)',
        'Grand Total (PKR)',
      ],
      ...dateFilteredOrders.map((o) => [
        o.orderNumber,
        o.createdAt.slice(0, 10),
        o.customer.fullName,
        o.customer.city,
        formatPaymentMethodShort(o.paymentMethod),
        o.paymentStatus,
        o.orderStatus,
        o.itemSubtotal,
        o.discountAmount,
        o.deliveryFee,
        o.grandTotal,
      ]),
    ];
    triggerCsvDownload('auremist-demo-orders-report.csv', rows);
  };

  const handleExportInventoryCsv = () => {
    const rows: Array<Array<string | number>> = [
      ['SKU', 'Perfume', 'Size', 'Category', 'Price (PKR)', 'Stock Count'],
      ...products.flatMap((p) =>
        p.variants.map((v) => [
          v.sku,
          p.name,
          v.size,
          p.category,
          v.price,
          v.stockCount,
        ]),
      ),
    ];
    triggerCsvDownload('auremist-demo-inventory-report.csv', rows);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/55 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info
            className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
            strokeWidth={1.8}
          />
          <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
            <strong className="font-semibold text-[#351522]">
              Demonstration Reports &amp; Exports:
            </strong>{' '}
            Calculated dynamically from the current sample demo orders and
            catalog records, not live production accounting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportOrdersCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-xs font-medium hover:bg-[#240D16] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#D6AD72]" />
            <span>Export Orders CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportInventoryCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F8F0E7] text-[#351522] border border-[#D6AD72]/60 text-xs font-medium hover:border-[#351522] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#8C6526]" />
            <span>Export Stock CSV</span>
          </button>
        </div>
      </div>

      {/* Date Range Filters */}
      <section className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3.5">
          <div>
            <label
              htmlFor="report-from-date"
              className="flex items-center gap-1.5 text-xs font-medium text-[#351522] mb-1"
            >
              <Calendar className="w-3.5 h-3.5 text-[#8C6526]" />
              <span>From Date</span>
            </label>
            <input
              id="report-from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs text-[#26151D] tabular-nums focus:outline-none focus:border-[#351522]"
            />
          </div>

          <div>
            <label
              htmlFor="report-to-date"
              className="flex items-center gap-1.5 text-xs font-medium text-[#351522] mb-1"
            >
              <Calendar className="w-3.5 h-3.5 text-[#8C6526]" />
              <span>To Date</span>
            </label>
            <input
              id="report-to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs text-[#26151D] tabular-nums focus:outline-none focus:border-[#351522]"
            />
          </div>

          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D6AD72]/60 bg-[#F8F0E7] text-xs font-medium text-[#351522] hover:border-[#351522] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Dates</span>
            </button>
          )}
        </div>

        <p className="text-xs text-[#5C434E] tabular-nums">
          Showing {dateFilteredOrders.length} of {orders.length} demo orders
        </p>
      </section>

      {/* Revenue Summary & Total Orders Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 space-y-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#5C434E]">
            Revenue Summary (Demo)
          </p>
          <p className="font-serif text-3xl font-semibold text-[#351522] tabular-nums">
            {formatPrice(revenueSummary.grossRevenue)}
          </p>
          <p className="text-xs text-[#5C434E]">
            Excludes cancelled orders
          </p>
        </article>

        <article className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 space-y-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#5C434E]">
            Total Orders (Filtered)
          </p>
          <p className="font-serif text-3xl font-semibold text-[#351522] tabular-nums">
            {revenueSummary.totalOrders}
          </p>
          <p className="text-xs text-[#5C434E]">
            {revenueSummary.activeOrdersCount} active / fulfilled
          </p>
        </article>

        <article className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 space-y-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#5C434E]">
            Average Order Value
          </p>
          <p className="font-serif text-3xl font-semibold text-[#351522] tabular-nums">
            {formatPrice(revenueSummary.avgOrder)}
          </p>
          <p className="text-xs text-[#5C434E]">Per active order</p>
        </article>

        <article className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 space-y-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#5C434E]">
            Coupon Discounts Applied
          </p>
          <p className="font-serif text-3xl font-semibold text-[#351522] tabular-nums">
            {formatPrice(revenueSummary.totalDiscounts)}
          </p>
          <p className="text-xs text-[#5C434E]">Across selected range</p>
        </article>
      </div>

      {/* Payment Mix & Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D6AD72]/25">
            <BarChart3 className="w-4 h-4 text-[#8C6526]" strokeWidth={1.7} />
            <h2 className="font-serif text-2xl font-medium text-[#351522]">
              Payment Method Breakdown (Demo)
            </h2>
          </div>

          <div className="space-y-4">
            {paymentBreakdown.map((item) => (
              <div key={item.method} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-[#351522]">
                    {item.label} ({item.ordersCount}{' '}
                    {item.ordersCount === 1 ? 'order' : 'orders'})
                  </span>
                  <span className="font-semibold text-[#26151D] tabular-nums">
                    {formatPrice(item.revenue)} ({item.sharePercent}%)
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-[#F8F0E7] border border-[#D6AD72]/40 overflow-hidden">
                  <div
                    style={{
                      width: `${item.ordersCount > 0 ? Math.max(item.sharePercent, 4) : 0}%`,
                    }}
                    className="h-full bg-[#351522] rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-6 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-[#D6AD72]/25">
            <h2 className="font-serif text-2xl font-medium text-[#351522]">
              Order Status Breakdown (Demo)
            </h2>
          </div>

          {statusBreakdown.length === 0 ? (
            <p className="text-xs text-[#5C434E] py-4">
              No orders match the selected date window.
            </p>
          ) : (
            <div className="space-y-3">
              {statusBreakdown.map((entry) => (
                <div key={entry.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span
                      className={`px-2 py-0.5 rounded border text-[11px] font-medium ${ORDER_STATUS_META[entry.status].toneClass}`}
                    >
                      {entry.label}
                    </span>
                    <span className="font-semibold text-[#351522] tabular-nums">
                      {entry.count} ({entry.percent}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F8F0E7] border border-[#D6AD72]/40 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(entry.percent, 5)}%` }}
                      className="h-full bg-[#D6AD72] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Best-Selling Products & Delivery Zone Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 overflow-hidden">
          <div className="px-5 py-4 bg-[#F8F0E7] border-b border-[#D6AD72]/30">
            <h2 className="font-serif text-2xl font-medium text-[#351522]">
              Best-Selling Products (Demo)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#D6AD72]/30 text-[11px] uppercase tracking-[0.12em] text-[#5C434E]">
                  <th className="py-3 px-4 font-semibold">Fragrance</th>
                  <th className="py-3 px-4 font-semibold text-right">
                    Bottles Sold
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">
                    Gross Line Revenue (PKR)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6AD72]/20">
                {topProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-xs text-[#5C434E]"
                    >
                      No product sales in the selected date window.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((row) => (
                    <tr key={row.name} className="hover:bg-[#F8F0E7]/60">
                      <td className="py-3 px-4 font-medium text-[#351522]">
                        {row.name}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        {row.unitsSold}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#351522] tabular-nums">
                        {formatPrice(row.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lg:col-span-5 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-[#D6AD72]/25">
            <h2 className="font-serif text-2xl font-medium text-[#351522]">
              Orders by Delivery Zone (Demo)
            </h2>
          </div>

          {zoneBreakdown.length === 0 ? (
            <p className="text-xs text-[#5C434E] py-4">
              No active deliveries match the selected date window.
            </p>
          ) : (
            <div className="divide-y divide-[#D6AD72]/20">
              {zoneBreakdown.map((entry) => (
                <div
                  key={entry.zone}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs sm:text-sm"
                >
                  <div>
                    <p className="font-medium text-[#351522]">{entry.zone}</p>
                    <p className="text-[11px] text-[#5C434E] tabular-nums">
                      {entry.count} active{' '}
                      {entry.count === 1 ? 'shipment' : 'shipments'}
                    </p>
                  </div>
                  <span className="font-semibold text-[#26151D] tabular-nums">
                    {formatPrice(entry.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
