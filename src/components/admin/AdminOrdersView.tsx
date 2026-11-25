import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
  RotateCcw,
  Search,
  ShoppingBag,
  Users,
} from 'lucide-react';
import {
  formatAdminDate,
  formatPaymentMethodShort,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
} from '../../data/adminDemoData';
import { formatPrice } from '../../data/fragrances';
import {
  AdminOrderRecord,
  AdminOrderStatus,
  AdminPaymentStatus,
} from '../../types/admin';

interface AdminOrdersViewProps {
  orders: AdminOrderRecord[];
  externalSearchQuery?: string;
  onSelectOrder: (order: AdminOrderRecord) => void;
  onUpdateOrderStatus: (orderId: string, orderStatus: AdminOrderStatus) => void;
}

const PAGE_SIZE = 6;

const ORDER_STATUS_OPTIONS: Array<{ value: 'all' | AdminOrderStatus; label: string }> = [
  { value: 'all', label: 'All Order Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'order_received', label: 'Order Received' },
  { value: 'pending_verification', label: 'Pending Verification' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed / Ready' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const DEMO_WORKFLOW_STATUSES: AdminOrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'order_received',
  'pending_verification',
  'packed',
  'out_for_delivery',
];

const PAYMENT_STATUS_OPTIONS: Array<{
  value: 'all' | AdminPaymentStatus;
  label: string;
}> = [
  { value: 'all', label: 'All Payment Statuses' },
  { value: 'pay_on_delivery', label: 'Pay on Delivery' },
  { value: 'awaiting_verification', label: 'Awaiting Verification' },
  { value: 'reupload_requested', label: 'Re-upload Requested' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
];

export function AdminOrdersView({
  orders,
  externalSearchQuery,
  onSelectOrder,
  onUpdateOrderStatus,
}: AdminOrdersViewProps) {
  const [viewMode, setViewMode] = useState<'orders' | 'customers'>('orders');
  const [customerSearch, setCustomerSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery ?? '');
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    'all' | AdminOrderStatus
  >('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    'all' | AdminPaymentStatus
  >('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (externalSearchQuery !== undefined && externalSearchQuery.trim()) {
      setViewMode('orders');
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    orderStatusFilter !== 'all' ||
    paymentStatusFilter !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '';

  const customerDirectory = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        fullName: string;
        mobile: string;
        email: string;
        city: string;
        province: string;
        addressSummary: string;
        orderCount: number;
        totalSpent: number;
        lastOrderDate: string;
      }
    >();

    for (const order of orders) {
      const key =
        order.customer.email.trim().toLowerCase() ||
        order.customer.mobile.replace(/[\s()-]/g, '');
      const existing = map.get(key);
      const spend = order.orderStatus === 'cancelled' ? 0 : order.grandTotal;
      if (!existing) {
        map.set(key, {
          key,
          fullName: order.customer.fullName,
          mobile: order.customer.mobile,
          email: order.customer.email,
          city: order.customer.city,
          province: order.customer.province,
          addressSummary: `${order.customer.area}, ${order.customer.city}`,
          orderCount: 1,
          totalSpent: spend,
          lastOrderDate: order.createdAt,
        });
      } else {
        existing.orderCount += 1;
        existing.totalSpent += spend;
        if (order.createdAt > existing.lastOrderDate) {
          existing.lastOrderDate = order.createdAt;
          existing.city = order.customer.city;
          existing.province = order.customer.province;
          existing.addressSummary = `${order.customer.area}, ${order.customer.city}`;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customerDirectory;
    return customerDirectory.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.mobile.replace(/[\s()-]/g, '').includes(q.replace(/[\s()-]/g, '')) ||
        c.city.toLowerCase().includes(q),
    );
  }, [customerDirectory, customerSearch]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const normalizedPhoneQuery = q.replace(/[\s()-]/g, '');

    return orders.filter((order) => {
      if (q) {
        const matchesOrderNo = order.orderNumber.toLowerCase().includes(q);
        const matchesName = order.customer.fullName.toLowerCase().includes(q);
        const matchesEmail = order.customer.email.toLowerCase().includes(q);
        const normalizedMobile = order.customer.mobile.replace(/[\s()-]/g, '');
        const matchesMobile =
          normalizedPhoneQuery.length > 0 &&
          normalizedMobile.includes(normalizedPhoneQuery);

        if (!matchesOrderNo && !matchesName && !matchesEmail && !matchesMobile) {
          return false;
        }
      }

      if (
        orderStatusFilter !== 'all' &&
        order.orderStatus !== orderStatusFilter
      ) {
        return false;
      }

      if (
        paymentStatusFilter !== 'all' &&
        order.paymentStatus !== paymentStatusFilter
      ) {
        return false;
      }

      if (dateFrom) {
        const orderDateKey = order.createdAt.slice(0, 10);
        if (orderDateKey < dateFrom) return false;
      }

      if (dateTo) {
        const orderDateKey = order.createdAt.slice(0, 10);
        if (orderDateKey > dateTo) return false;
      }

      return true;
    });
  }, [
    orders,
    searchQuery,
    orderStatusFilter,
    paymentStatusFilter,
    dateFrom,
    dateTo,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, orderStatusFilter, paymentStatusFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setOrderStatusFilter('all');
    setPaymentStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const showingStart =
    filteredOrders.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(
    filteredOrders.length,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Orders and customer records views"
          className="inline-flex items-center p-1 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/50 self-start"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'orders'}
            onClick={() => setViewMode('orders')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'orders'
                ? 'bg-[#351522] text-[#FFF5E9]'
                : 'text-[#5C434E] hover:text-[#351522]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.7} />
            <span>Orders List ({orders.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'customers'}
            onClick={() => setViewMode('customers')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'customers'
                ? 'bg-[#351522] text-[#FFF5E9]'
                : 'text-[#5C434E] hover:text-[#351522]'
            }`}
          >
            <Users className="w-3.5 h-3.5" strokeWidth={1.7} />
            <span>Customers Directory ({customerDirectory.length})</span>
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/50 flex items-start gap-3">
        <Info
          className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
          strokeWidth={1.8}
        />
        <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
          <strong className="font-semibold text-[#351522]">
            {viewMode === 'orders'
              ? 'Order Management (Demo Dataset):'
              : 'Customer Directory (Derived from Demo Orders):'}
          </strong>{' '}
          {viewMode === 'orders'
            ? 'Search by order number, customer name, email, or mobile number, filter by status or date range, and open any order to inspect full line items, SKUs, totals, and delivery details.'
            : 'Inspect unique customer contact profiles, cities, order counts, and PKR spend summarized from the current demo orders. Persistent CRM profiles and account history require backend database integration.'}
        </p>
      </div>

      {viewMode === 'customers' ? (
        <div className="space-y-5">
          <div className="rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/45 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search
                className="w-4 h-4 text-[#5C434E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.6}
              />
              <input
                type="search"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customer name, email, phone, or city..."
                aria-label="Search customer directory"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs sm:text-sm text-[#26151D] placeholder:text-[#5C434E]/65 focus:outline-none focus:border-[#351522]"
              />
            </div>
            <span className="text-xs text-[#5C434E] tabular-nums">
              Showing {filteredCustomers.length} of {customerDirectory.length}{' '}
              demo {customerDirectory.length === 1 ? 'customer' : 'customers'}
            </span>
          </div>

          <section className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 overflow-hidden">
            {filteredCustomers.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-2">
                <p className="font-serif text-2xl font-medium text-[#351522]">
                  No matching customers found
                </p>
                <p className="text-xs text-[#5C434E]">
                  Try clearing your search query to view all demo customer
                  profiles.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#D6AD72]/30 bg-[#F8F0E7] text-[11px] uppercase tracking-[0.12em] text-[#5C434E]">
                      <th className="py-3.5 px-4 font-semibold">Customer</th>
                      <th className="py-3.5 px-4 font-semibold">Contact</th>
                      <th className="py-3.5 px-4 font-semibold">Location</th>
                      <th className="py-3.5 px-4 font-semibold text-right">
                        Orders
                      </th>
                      <th className="py-3.5 px-4 font-semibold text-right">
                        Total Spend
                      </th>
                      <th className="py-3.5 px-4 font-semibold">Last Order</th>
                      <th className="py-3.5 px-4 font-semibold text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D6AD72]/20">
                    {filteredCustomers.map((cust) => (
                      <tr
                        key={cust.key}
                        className="hover:bg-[#F8F0E7]/65 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-medium text-[#351522] whitespace-nowrap">
                          {cust.fullName}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="block text-xs text-[#26151D] tabular-nums">
                            {cust.mobile}
                          </span>
                          <span className="block text-[11px] text-[#5C434E]">
                            {cust.email}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="block text-xs text-[#26151D]">
                            {cust.addressSummary}
                          </span>
                          <span className="block text-[11px] text-[#5C434E]">
                            {cust.province}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-[#351522] tabular-nums whitespace-nowrap">
                          {cust.orderCount}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-[#351522] tabular-nums whitespace-nowrap">
                          {formatPrice(cust.totalSpent)}
                        </td>
                        <td className="py-3.5 px-4 text-[#5C434E] tabular-nums whitespace-nowrap">
                          {formatAdminDate(cust.lastOrderDate)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery(cust.email || cust.fullName);
                              setOrderStatusFilter('all');
                              setPaymentStatusFilter('all');
                              setDateFrom('');
                              setDateTo('');
                              setViewMode('orders');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F8F0E7] border border-[#D6AD72]/55 text-xs font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" strokeWidth={1.6} />
                            <span>View Orders</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : (
        <>
          {/* Search & Filter Toolbar */}
          <section
            aria-label="Search and filter orders"
            className="rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/45 p-5 space-y-4"
          >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
          {/* Search Input */}
          <div className="sm:col-span-2 lg:col-span-4">
            <label
              htmlFor="admin-order-search"
              className="block text-xs font-medium text-[#351522] mb-1.5"
            >
              Search Orders
            </label>
            <div className="relative">
              <Search
                className="w-4 h-4 text-[#5C434E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.6}
              />
              <input
                id="admin-order-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Order #, customer name, or mobile..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs sm:text-sm text-[#26151D] placeholder:text-[#5C434E]/65 focus:outline-none focus:border-[#351522]"
              />
            </div>
          </div>

          {/* Order Status Filter */}
          <div className="lg:col-span-2">
            <label
              htmlFor="admin-filter-order-status"
              className="block text-xs font-medium text-[#351522] mb-1.5"
            >
              Order Status
            </label>
            <select
              id="admin-filter-order-status"
              value={orderStatusFilter}
              onChange={(e) =>
                setOrderStatusFilter(
                  e.target.value as 'all' | AdminOrderStatus,
                )
              }
              className="w-full px-3 py-2.5 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs sm:text-sm text-[#26151D] focus:outline-none focus:border-[#351522]"
            >
              {ORDER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="lg:col-span-2">
            <label
              htmlFor="admin-filter-payment-status"
              className="block text-xs font-medium text-[#351522] mb-1.5"
            >
              Payment Status
            </label>
            <select
              id="admin-filter-payment-status"
              value={paymentStatusFilter}
              onChange={(e) =>
                setPaymentStatusFilter(
                  e.target.value as 'all' | AdminPaymentStatus,
                )
              }
              className="w-full px-3 py-2.5 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs sm:text-sm text-[#26151D] focus:outline-none focus:border-[#351522]"
            >
              {PAYMENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range From / To */}
          <div className="lg:col-span-2">
            <label
              htmlFor="admin-filter-date-from"
              className="block text-xs font-medium text-[#351522] mb-1.5"
            >
              From Date
            </label>
            <input
              id="admin-filter-date-from"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs sm:text-sm text-[#26151D] tabular-nums focus:outline-none focus:border-[#351522]"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="admin-filter-date-to"
              className="block text-xs font-medium text-[#351522] mb-1.5"
            >
              To Date
            </label>
            <input
              id="admin-filter-date-to"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs sm:text-sm text-[#26151D] tabular-nums focus:outline-none focus:border-[#351522]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#D6AD72]/25 text-xs">
          <span className="text-[#5C434E] tabular-nums">
            Showing {showingStart}–{showingEnd} of {filteredOrders.length}{' '}
            matching {filteredOrders.length === 1 ? 'order' : 'orders'}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 font-medium text-[#351522] hover:text-[#8C6526] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.7} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </section>

      {/* Orders Table */}
      <section className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 overflow-hidden">
        {paginatedOrders.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <p className="font-serif text-2xl font-medium text-[#351522]">
              No matching orders found
            </p>
            <p className="text-xs sm:text-sm text-[#5C434E] max-w-md mx-auto">
              Adjust your search keywords, status filters, or date range to view
              matching demonstration orders.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-xs font-medium cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#D6AD72]/30 bg-[#F8F0E7] text-[11px] uppercase tracking-[0.12em] text-[#5C434E]">
                  <th className="py-3.5 px-4 font-semibold">Order ID</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Order Date</th>
                  <th className="py-3.5 px-4 font-semibold">Products</th>
                  <th className="py-3.5 px-4 font-semibold">Payment</th>
                  <th className="py-3.5 px-4 font-semibold">Payment Status</th>
                  <th className="py-3.5 px-4 font-semibold">Order Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">
                    Total
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6AD72]/20">
                {paginatedOrders.map((order) => {
                  const firstItem = order.items[0];
                  const totalUnits = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  );

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#F8F0E7]/65 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#351522] tabular-nums whitespace-nowrap">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="block font-medium text-[#26151D]">
                          {order.customer.fullName}
                        </span>
                        <span className="block text-[11px] text-[#5C434E] tabular-nums">
                          {order.customer.mobile}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#5C434E] tabular-nums whitespace-nowrap">
                        {formatAdminDate(order.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 min-w-[175px]">
                        {firstItem ? (
                          <div>
                            <span className="block font-medium text-[#26151D] truncate max-w-[200px]">
                              {firstItem.quantity}× {firstItem.productName} (
                              {firstItem.size})
                            </span>
                            <span className="block text-[11px] text-[#5C434E] tabular-nums">
                              {order.items.length > 1
                                ? `+${order.items.length - 1} more item · ${totalUnits} units`
                                : `${totalUnits} ${totalUnits === 1 ? 'bottle' : 'bottles'}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#5C434E]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#26151D] whitespace-nowrap">
                        {formatPaymentMethodShort(order.paymentMethod)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-[11px] font-medium ${PAYMENT_STATUS_META[order.paymentStatus].toneClass}`}
                        >
                          {PAYMENT_STATUS_META[order.paymentStatus].label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          aria-label={`Update status for order ${order.orderNumber}`}
                          value={order.orderStatus}
                          onChange={(e) =>
                            onUpdateOrderStatus(
                              order.id,
                              e.target.value as AdminOrderStatus,
                            )
                          }
                          className={`px-2 py-1 rounded border text-[11px] font-medium cursor-pointer focus:outline-none focus:border-[#351522] ${ORDER_STATUS_META[order.orderStatus].toneClass}`}
                        >
                          {DEMO_WORKFLOW_STATUSES.map((st) => (
                            <option
                              key={st}
                              value={st}
                              className="bg-[#FFF5E9] text-[#26151D]"
                            >
                              {ORDER_STATUS_META[st].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-[#351522] tabular-nums whitespace-nowrap">
                        {formatPrice(order.grandTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F8F0E7] border border-[#D6AD72]/55 text-xs font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" strokeWidth={1.6} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="px-5 py-4 bg-[#F8F0E7] border-t border-[#D6AD72]/30 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="text-[#5C434E] tabular-nums">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#FFF5E9] border border-[#D6AD72]/55 text-[#351522] disabled:opacity-45 hover:border-[#351522] cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.7} />
                <span>Previous</span>
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[32px] h-8 px-2 rounded-md border tabular-nums font-medium cursor-pointer transition-colors ${
                      pageNum === currentPage
                        ? 'bg-[#351522] text-[#FFF5E9] border-[#D6AD72]'
                        : 'bg-[#FFF5E9] text-[#351522] border-[#D6AD72]/50 hover:border-[#351522]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#FFF5E9] border border-[#D6AD72]/55 text-[#351522] disabled:opacity-45 hover:border-[#351522] cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.7} />
              </button>
            </div>
          </div>
        )}
      </section>
        </>
      )}
    </div>
  );
}
