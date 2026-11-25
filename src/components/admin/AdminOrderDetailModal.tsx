import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Info,
  Lock,
  MapPin,
  Package,
  Receipt,
  User,
  X,
} from 'lucide-react';
import {
  formatAdminDateTime,
  formatPaymentMethodShort,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
} from '../../data/adminDemoData';
import { formatPrice } from '../../data/fragrances';
import { LUXURY_EASE } from '../../lib/motion';
import {
  AdminOrderRecord,
  AdminOrderStatus,
  AdminPaymentStatus,
} from '../../types/admin';

interface AdminOrderDetailModalProps {
  order: AdminOrderRecord | null;
  onClose: () => void;
  onUpdateDemoOrder?: (
    orderId: string,
    patch: Partial<Pick<AdminOrderRecord, 'orderStatus' | 'paymentStatus'>>,
  ) => void;
}

const ALL_ORDER_STATUSES: AdminOrderStatus[] = [
  'pending',
  'confirmed',
  'order_received',
  'pending_verification',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const ALL_PAYMENT_STATUSES: AdminPaymentStatus[] = [
  'pay_on_delivery',
  'awaiting_verification',
  'reupload_requested',
  'verified',
  'rejected',
];

export function AdminOrderDetailModal({
  order,
  onClose,
  onUpdateDemoOrder,
}: AdminOrderDetailModalProps) {
  useEffect(() => {
    if (!order) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [order, onClose]);

  return (
    <AnimatePresence>
      {order && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`Order details for ${order.orderNumber}`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: LUXURY_EASE }}
            onClick={onClose}
            className="fixed inset-0 bg-[#26151D]/50 backdrop-blur-[1px]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: LUXURY_EASE }}
            className="relative z-10 w-full max-w-2xl bg-[#FFF5E9] border-l border-[#D6AD72]/45 shadow-2xl flex flex-col h-full"
          >
            {/* Header */}
            <div className="px-6 py-5 bg-[#F8F0E7] border-b border-[#D6AD72]/35 flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1 min-w-0">
                <span className="block text-[11px] uppercase tracking-[0.18em] text-[#8C6526] font-semibold">
                  Demo Order Record · {formatAdminDateTime(order.createdAt)}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#351522] tabular-nums truncate">
                  {order.orderNumber}
                </h2>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded border text-[11px] font-medium ${ORDER_STATUS_META[order.orderStatus].toneClass}`}
                  >
                    {ORDER_STATUS_META[order.orderStatus].label}
                  </span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded border text-[11px] font-medium ${PAYMENT_STATUS_META[order.paymentStatus].toneClass}`}
                  >
                    {PAYMENT_STATUS_META[order.paymentStatus].label}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close order details"
                className="p-2 rounded-lg text-[#5C434E] hover:text-[#351522] hover:bg-[#FFF5E9] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0"
              >
                <X className="w-5 h-5" strokeWidth={1.6} />
              </button>
            </div>

            {/* Scrollable Detail Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Customer Section */}
              <section className="rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/40 p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2.5 border-b border-[#D6AD72]/25">
                  <User
                    className="w-4 h-4 text-[#8C6526] shrink-0"
                    strokeWidth={1.7}
                  />
                  <h3 className="text-xs uppercase tracking-[0.16em] font-semibold text-[#351522]">
                    Customer
                  </h3>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <dt className="text-[11px] text-[#5C434E]">Name</dt>
                    <dd className="font-semibold text-[#351522]">
                      {order.customer.fullName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-[#5C434E]">
                      Mobile Number
                    </dt>
                    <dd className="text-[#26151D] tabular-nums">
                      {order.customer.mobile}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] text-[#5C434E]">Email</dt>
                    <dd className="text-[#26151D] break-words">
                      {order.customer.email}
                    </dd>
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t border-[#D6AD72]/20">
                    <dt className="flex items-center gap-1.5 text-[11px] text-[#5C434E] mb-1">
                      <MapPin className="w-3 h-3 text-[#8C6526]" />
                      <span>Full Delivery Address</span>
                    </dt>
                    <dd className="text-[#26151D] leading-relaxed">
                      {order.customer.streetAddress}, {order.customer.area},{' '}
                      {order.customer.city}, {order.customer.province},{' '}
                      {order.customer.country}{' '}
                      <span className="tabular-nums">
                        ({order.customer.postalCode})
                      </span>
                      {order.customer.deliveryInstructions && (
                        <span className="block text-xs text-[#5C434E] mt-1">
                          Note: {order.customer.deliveryInstructions}
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Order Items Section */}
              <section className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/40 overflow-hidden">
                <div className="px-5 py-3.5 bg-[#F8F0E7] border-b border-[#D6AD72]/30 flex items-center gap-2">
                  <Package
                    className="w-4 h-4 text-[#8C6526] shrink-0"
                    strokeWidth={1.7}
                  />
                  <h3 className="text-xs uppercase tracking-[0.16em] font-semibold text-[#351522]">
                    Order Items ({order.items.length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#D6AD72]/25 text-[11px] uppercase tracking-[0.12em] text-[#5C434E]">
                        <th className="py-2.5 px-4 font-semibold">Product</th>
                        <th className="py-2.5 px-3 font-semibold">Variant</th>
                        <th className="py-2.5 px-3 font-semibold">SKU</th>
                        <th className="py-2.5 px-3 font-semibold text-right">
                          Qty
                        </th>
                        <th className="py-2.5 px-3 font-semibold text-right">
                          Unit Price
                        </th>
                        <th className="py-2.5 px-4 font-semibold text-right">
                          Line Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D6AD72]/20">
                      {order.items.map((item) => (
                        <tr key={`${item.productId}-${item.sku}`}>
                          <td className="py-3 px-4 font-medium text-[#351522]">
                            {item.productName}
                          </td>
                          <td className="py-3 px-3 text-[#5C434E] whitespace-nowrap">
                            {item.size}
                          </td>
                          <td className="py-3 px-3 text-xs font-mono text-[#5C434E] whitespace-nowrap">
                            {item.sku}
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums whitespace-nowrap">
                            {formatPrice(item.unitPrice)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-[#26151D] tabular-nums whitespace-nowrap">
                            {formatPrice(item.lineTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Order Totals & Payment Section */}
              <section className="rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/40 p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-[#D6AD72]/25">
                  <Receipt
                    className="w-4 h-4 text-[#8C6526] shrink-0"
                    strokeWidth={1.7}
                  />
                  <h3 className="text-xs uppercase tracking-[0.16em] font-semibold text-[#351522]">
                    Order Totals &amp; Payment
                  </h3>
                </div>

                <dl className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#5C434E]">Item Subtotal</dt>
                    <dd className="font-medium text-[#26151D] tabular-nums">
                      {formatPrice(order.itemSubtotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#5C434E]">Coupon Code</dt>
                    <dd className="font-medium text-[#351522] tabular-nums">
                      {order.couponCode ?? 'None'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#5C434E]">Discount</dt>
                    <dd className="font-medium text-[#351522] tabular-nums">
                      {order.discountAmount > 0
                        ? `− ${formatPrice(order.discountAmount)}`
                        : formatPrice(0)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#5C434E]">Delivery Zone</dt>
                    <dd className="font-medium text-[#26151D] text-right">
                      {order.deliveryZone}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#5C434E]">Delivery Fee</dt>
                    <dd className="font-medium text-[#26151D] tabular-nums">
                      {formatPrice(order.deliveryFee)}
                    </dd>
                  </div>
                  <div className="pt-2.5 border-t border-[#D6AD72]/35 flex justify-between items-baseline gap-4">
                    <dt className="font-semibold text-[#26151D]">Grand Total</dt>
                    <dd className="font-serif text-2xl font-semibold text-[#351522] tabular-nums">
                      {formatPrice(order.grandTotal)}
                    </dd>
                  </div>
                </dl>

                <div className="pt-3 border-t border-[#D6AD72]/25 space-y-1.5 text-xs">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#5C434E]">Payment Method</span>
                    <span className="font-medium text-[#351522]">
                      {formatPaymentMethodShort(order.paymentMethod)}
                    </span>
                  </div>
                  {order.transactionRefId && (
                    <div className="flex justify-between gap-4">
                      <span className="text-[#5C434E]">Transaction Ref ID</span>
                      <span className="font-mono text-[#26151D]">
                        {order.transactionRefId}
                      </span>
                    </div>
                  )}
                  {order.hasPrivateProof && (
                    <p className="flex items-center gap-1.5 text-[11px] text-[#5C434E] pt-1">
                      <Lock className="w-3 h-3 text-[#8C6526] shrink-0" />
                      <span>
                        Payment screenshot stored privately; signed admin download
                        activates once backend storage is connected.
                      </span>
                    </p>
                  )}
                  {order.internalPaymentNote && (
                    <p className="text-[11px] text-[#351522] pt-1">
                      <strong>Internal Note:</strong> {order.internalPaymentNote}
                    </p>
                  )}
                </div>
              </section>

              {/* Interactive Demo Status Update Controls */}
              {onUpdateDemoOrder && (
                <section className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 space-y-4">
                  <div className="flex items-start gap-2 text-xs text-[#5C434E]">
                    <Info
                      className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
                      strokeWidth={1.7}
                    />
                    <p>
                      <strong className="text-[#351522]">
                        Frontend Demo Controls:
                      </strong>{' '}
                      Changes below update this preview workspace in memory only
                      and are not saved to a database yet.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="admin-detail-order-status"
                        className="block text-xs font-medium text-[#351522] mb-1.5"
                      >
                        Order Status
                      </label>
                      <select
                        id="admin-detail-order-status"
                        value={order.orderStatus}
                        onChange={(e) =>
                          onUpdateDemoOrder(order.id, {
                            orderStatus: e.target.value as AdminOrderStatus,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs text-[#26151D] focus:outline-none focus:border-[#351522]"
                      >
                        {ALL_ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {ORDER_STATUS_META[st].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="admin-detail-payment-status"
                        className="block text-xs font-medium text-[#351522] mb-1.5"
                      >
                        Payment Status
                      </label>
                      <select
                        id="admin-detail-payment-status"
                        value={order.paymentStatus}
                        onChange={(e) =>
                          onUpdateDemoOrder(order.id, {
                            paymentStatus: e.target.value as AdminPaymentStatus,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs text-[#26151D] focus:outline-none focus:border-[#351522]"
                      >
                        {ALL_PAYMENT_STATUSES.map((pst) => (
                          <option key={pst} value={pst}>
                            {PAYMENT_STATUS_META[pst].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
