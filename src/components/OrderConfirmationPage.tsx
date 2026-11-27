import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Banknote,
  Check,
  ChevronRight,
  Clock,
  FileText,
  Gift,
  Info,
  Lock,
  MapPin,
  Printer,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
} from 'lucide-react';
import { formatPrice } from '../data/fragrances';
import { WALLET_RECIPIENT_NUMBER } from '../lib/checkout';
import { fadeUpVariants, LUXURY_EASE } from '../lib/motion';
import {
  buildOrderTrackingTimeline,
  formatOrderDateTime,
  getPaymentMethodDisplayName,
} from '../lib/orderConfirmation';
import { CheckoutOrderPreview } from '../types/perfume';
import { LuxuryImage } from './LuxuryImage';

interface OrderConfirmationPageProps {
  order: CheckoutOrderPreview | null;
  hasCartItems: boolean;
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  onNavigateCheckout: () => void;
}

export function OrderConfirmationPage({
  order,
  hasCartItems,
  onNavigateHome,
  onNavigateShop,
  onNavigateCheckout,
}: OrderConfirmationPageProps) {
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(true);

  const handleViewOrderDetails = () => {
    setShowDetailedBreakdown(true);
    const section = document.getElementById('order-details-summary');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrintSummary = () => {
    setShowDetailedBreakdown(true);
    window.setTimeout(() => {
      window.print();
    }, 60);
  };

  if (!order) {
    return (
      <div className="bg-[#FFF5E9] text-[#26151D] overflow-x-hidden">
        <section className="bg-[#F8F0E7] border-b border-[#D6AD72]/35 py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-xs tracking-[0.14em] uppercase text-[#5C434E] mb-3"
            >
              <button
                type="button"
                onClick={onNavigateHome}
                className="hover:text-[#351522] transition-colors cursor-pointer"
              >
                Home
              </button>
              <ChevronRight
                className="w-3.5 h-3.5 text-[#D6AD72]"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <span className="text-[#351522] font-semibold">
                Order Confirmation
              </span>
            </nav>

            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#351522] leading-tight">
              Order Confirmation
            </h1>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-8 py-14 sm:py-20">
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/45 p-8 sm:p-12 text-center space-y-5"
          >
            <div className="w-16 h-16 mx-auto rounded-full border border-[#D6AD72]/65 bg-[#FFF5E9] flex items-center justify-center">
              <ShoppingBag
                className="w-7 h-7 text-[#351522]"
                strokeWidth={1.5}
              />
            </div>

            <div className="space-y-2">
              <span className="block text-[11px] uppercase tracking-[0.18em] text-[#8C6526] font-semibold">
                Session Protected
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#351522]">
                No Confirmed Order Found in This Session
              </h2>
            </div>

            <p className="text-sm text-[#5C434E] leading-relaxed max-w-lg mx-auto">
              Order confirmation details appear here only after an order has been
              successfully placed through Checkout. To protect customer privacy,
              other customers&apos; order details are never shown.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              {hasCartItems && (
                <button
                  type="button"
                  onClick={onNavigateCheckout}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-sm font-medium tracking-wide hover:bg-[#240D16] transition-colors cursor-pointer min-h-[46px]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight
                    className="w-4 h-4 text-[#D6AD72]"
                    strokeWidth={1.6}
                  />
                </button>
              )}

              <button
                type="button"
                onClick={onNavigateShop}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-medium tracking-wide transition-colors cursor-pointer min-h-[46px] ${
                  hasCartItems
                    ? 'border border-[#D6AD72]/60 bg-[#FFF5E9] text-[#351522] hover:border-[#351522]'
                    : 'bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] hover:bg-[#240D16]'
                }`}
              >
                <span>Continue Shopping</span>
                <ArrowRight
                  className="w-4 h-4 text-[#D6AD72]"
                  strokeWidth={1.6}
                />
              </button>
            </div>
          </motion.div>
        </section>
      </div>
    );
  }

  const isCodOrder = order.paymentMethod === 'cod';
  const paymentMethodDisplay = getPaymentMethodDisplayName(order.paymentMethod);
  const formattedDateTime = formatOrderDateTime(order.createdAt);
  const trackingSteps = buildOrderTrackingTimeline(order);
  const totalBottles = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const hasBackendStages =
    !order.isDemoPreview &&
    Array.isArray(order.backendTrackingStages) &&
    order.backendTrackingStages.length > 0;

  return (
    <div className="bg-[#FFF5E9] text-[#26151D] overflow-x-hidden print:bg-white">
      {/* 1 & 2. Success Header */}
      <section className="bg-[#F8F0E7] border-b border-[#D6AD72]/35 py-10 sm:py-14 print:bg-white print:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs tracking-[0.14em] uppercase text-[#5C434E] mb-6 print:hidden"
          >
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-[#351522] transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight
              className="w-3.5 h-3.5 text-[#D6AD72]"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={onNavigateShop}
              className="hover:text-[#351522] transition-colors cursor-pointer"
            >
              Shop
            </button>
            <ChevronRight
              className="w-3.5 h-3.5 text-[#D6AD72]"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <span className="text-[#351522] font-semibold">
              Order Confirmation
            </span>
          </nav>

          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 rounded-full bg-[#351522] text-[#D6AD72] border border-[#D6AD72] flex items-center justify-center shrink-0">
                <Check className="w-7 h-7" strokeWidth={2} />
              </div>

              <div className="space-y-1.5 min-w-0">
                <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#351522] leading-tight">
                  Thank You for Your Order!
                </h1>
                <p className="text-sm sm:text-base text-[#5C434E]">
                  Your order has been received successfully.
                </p>
              </div>
            </div>

            {/* Order Number & Timestamp Metadata (Zero-Pill Unboxed Format) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-[#26151D] pt-1">
              <span>
                <span className="text-[#5C434E]">
                  {order.isDemoPreview
                    ? 'Demo Order Reference:'
                    : 'Order Number:'}
                </span>{' '}
                <strong className="font-semibold text-[#351522] tabular-nums">
                  {order.orderNumber}
                </strong>
              </span>
              <span className="text-[#D6AD72]" aria-hidden="true">
                ·
              </span>
              <span>
                <span className="text-[#5C434E]">Order Date &amp; Time:</span>{' '}
                <strong className="font-medium text-[#26151D] tabular-nums">
                  {formattedDateTime}
                </strong>
              </span>
              <span className="text-[#D6AD72]" aria-hidden="true">
                ·
              </span>
              <span className="text-[#5C434E] tabular-nums">
                {totalBottles} {totalBottles === 1 ? 'bottle' : 'bottles'}
              </span>
            </div>

            {order.isDemoPreview && (
              <div className="p-4 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/55 flex items-start gap-3">
                <Info
                  className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
                  strokeWidth={1.8}
                />
                <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
                  <strong className="font-semibold text-[#351522]">
                    Demonstration Order Preview:
                  </strong>{' '}
                  Backend order APIs and database storage are not connected yet.
                  This order reference and summary are preserved locally for your
                  current browser session only and do not represent a saved
                  production transaction.
                </p>
              </div>
            )}

            {/* 8. Customer Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2 print:hidden">
              <motion.button
                type="button"
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.2, ease: LUXURY_EASE }}
                onClick={onNavigateShop}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-sm font-medium tracking-wide hover:bg-[#240D16] transition-colors cursor-pointer min-h-[44px]"
              >
                <span>Continue Shopping</span>
                <ArrowRight
                  className="w-4 h-4 text-[#D6AD72]"
                  strokeWidth={1.6}
                />
              </motion.button>

              <button
                type="button"
                onClick={handleViewOrderDetails}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#FFF5E9] text-[#351522] border border-[#D6AD72]/60 text-sm font-medium hover:border-[#351522] transition-colors cursor-pointer min-h-[44px]"
              >
                <FileText className="w-4 h-4 text-[#8C6526]" strokeWidth={1.6} />
                <span>View Order Details</span>
              </button>

              <button
                type="button"
                onClick={handlePrintSummary}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#FFF5E9] text-[#351522] border border-[#D6AD72]/60 text-sm font-medium hover:border-[#351522] transition-colors cursor-pointer min-h-[44px]"
              >
                <Printer className="w-4 h-4 text-[#8C6526]" strokeWidth={1.6} />
                <span>Print Order Summary</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Confirmation Body */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-8 print:py-6">
        {/* 3. Order Status Banner */}
        <div className="rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/45 p-6 sm:p-7 print:bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            <div className="md:col-span-8 space-y-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.16em] font-semibold">
                <span className="text-[#8C6526]">Order Received</span>
                <span className="text-[#D6AD72]" aria-hidden="true">
                  ·
                </span>
                <span className="text-[#351522]">
                  {isCodOrder
                    ? 'Payment: Pay on Delivery'
                    : 'Payment Pending Verification'}
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#351522]">
                {isCodOrder
                  ? 'Your order has been received. Payment is due on delivery.'
                  : 'Your order has been received. Your payment proof is awaiting verification.'}
              </h2>

              <p className="text-xs sm:text-sm text-[#5C434E] leading-relaxed">
                {isCodOrder
                  ? `Please keep ${formatPrice(order.grandTotal)} ready in cash for courier collection upon delivery.${order.deliveryFee === null ? ' Delivery charges apply once configured by the store.' : ''}`
                  : `Manual ${order.paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} transfers are never marked verified automatically and remain pending until independently verified by the store owner.`}
              </p>
            </div>

            <div className="md:col-span-4 md:text-right pt-3 md:pt-0 border-t md:border-t-0 border-[#D6AD72]/30">
              <span className="block text-[11px] uppercase tracking-[0.16em] text-[#5C434E] mb-1">
                {isCodOrder ? 'Payable on Delivery' : 'Order Total'}
              </span>
              <p className="font-serif text-3xl font-semibold text-[#351522] tabular-nums">
                {formatPrice(order.grandTotal)}
              </p>
              <span className="block text-xs text-[#5C434E] mt-1">
                {isCodOrder
                  ? 'Unpaid / Pay on Delivery'
                  : 'Awaiting Admin Verification'}
              </span>
            </div>
          </div>
        </div>

        {/* 7. Order Tracking Timeline */}
        <div className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/40 p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-[#D6AD72]/25">
            <div>
              <span className="block text-[11px] uppercase tracking-[0.18em] text-[#8C6526] font-semibold mb-1">
                Fulfillment Progress
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#351522]">
                Order Tracking Timeline
              </h2>
            </div>

            <p className="text-xs text-[#5C434E]">
              {hasBackendStages
                ? 'Showing verified fulfillment milestones from the store backend.'
                : 'No backend fulfillment stages confirmed yet; future stages remain uncompleted.'}
            </p>
          </div>

          <ol className="space-y-4">
            {trackingSteps.map((step) => {
              const isCompleted = step.state === 'completed';
              const isAwaiting = step.state === 'awaiting';

              return (
                <li
                  key={step.key}
                  className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-b-0 border-[#D6AD72]/20"
                >
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold tabular-nums shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-[#351522] text-[#D6AD72] border-[#D6AD72]'
                        : isAwaiting
                          ? 'bg-[#F8F0E7] text-[#351522] border-[#351522]'
                          : 'bg-[#FFF5E9] text-[#5C434E] border-[#D6AD72]/50'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" strokeWidth={2.2} />
                    ) : isAwaiting ? (
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.8} />
                    ) : (
                      step.stepNumber
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isCompleted || isAwaiting
                            ? 'text-[#351522]'
                            : 'text-[#5C434E]'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-[#5C434E] mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <span
                      className={`text-[11px] uppercase tracking-[0.14em] font-medium shrink-0 ${
                        isCompleted
                          ? 'text-[#351522]'
                          : isAwaiting
                            ? 'text-[#8C6526]'
                            : 'text-[#5C434E]/80'
                      }`}
                    >
                      {isCompleted
                        ? 'Confirmed'
                        : isAwaiting
                          ? 'Awaiting Admin Verification'
                          : 'Pending'}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Two-Column Summary Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 4. Order Details (Left Column) */}
          <div
            id="order-details-summary"
            className="lg:col-span-7 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/40 overflow-hidden scroll-mt-24 min-w-0"
          >
            <div className="px-6 py-5 bg-[#F8F0E7] border-b border-[#D6AD72]/30 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="block text-[11px] uppercase tracking-[0.18em] text-[#8C6526] font-semibold mb-0.5">
                  Itemized Receipt
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#351522]">
                  Order Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailedBreakdown((prev) => !prev)}
                className="text-xs font-medium text-[#351522] underline underline-offset-4 hover:text-[#8C6526] transition-colors cursor-pointer print:hidden"
              >
                {showDetailedBreakdown ? 'Compact View' : 'Show Full Details'}
              </button>
            </div>

            {showDetailedBreakdown && (
              <ul className="divide-y divide-[#D6AD72]/25 px-6">
                {order.items.map((item) => {
                  const lineSubtotal = item.unitPrice * item.quantity;
                  return (
                    <li
                      key={`${item.product.id}-${item.size}`}
                      className="py-4 flex items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-4 min-w-0">
                        <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-[#F8F0E7] border border-[#D6AD72]/35">
                          <LuxuryImage
                            src={item.product.image}
                            alt={item.product.name}
                            fallbackTitle={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <p className="font-serif text-xl font-medium text-[#351522] leading-snug">
                            {item.product.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-[#5C434E] tabular-nums">
                            <span>Size: {item.size}</span>
                            <span aria-hidden="true">·</span>
                            <span>Qty: {item.quantity}</span>
                            <span aria-hidden="true">·</span>
                            <span>Unit: {formatPrice(item.unitPrice)}</span>
                          </div>
                          {item.sku && (
                            <p className="text-[11px] text-[#5C434E] tabular-nums">
                              SKU: {item.sku}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block text-[11px] text-[#5C434E]">
                          Subtotal
                        </span>
                        <span className="font-medium text-sm sm:text-base text-[#26151D] tabular-nums">
                          {formatPrice(lineSubtotal)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {order.giftWrap && (
              <div className="mx-6 mb-4 mt-2 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/40 text-xs text-[#351522]">
                <Gift
                  className="w-4 h-4 text-[#8C6526] shrink-0"
                  strokeWidth={1.6}
                />
                <span>Complimentary Gold Coffret Presentation included</span>
              </div>
            )}

            {/* PKR Totals Summary */}
            <dl className="px-6 py-5 bg-[#F8F0E7] border-t border-[#D6AD72]/30 space-y-2.5 text-sm print:bg-white">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#5C434E]">Subtotal</dt>
                <dd className="font-medium text-[#26151D] tabular-nums">
                  {formatPrice(
                    Number.isFinite(order.itemSubtotal) ? order.itemSubtotal : 0,
                  )}
                </dd>
              </div>

              {(order.discountAmount > 0 || Boolean(order.coupon)) && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#5C434E]">
                    Discount
                    {order.coupon ? ` (${order.coupon.code})` : ''}
                  </dt>
                  <dd className="font-medium text-[#351522] tabular-nums">
                    {order.discountAmount > 0
                      ? `− ${formatPrice(order.discountAmount)}`
                      : formatPrice(0)}
                  </dd>
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <dt className="text-[#5C434E]">Delivery / Shipping Charges</dt>
                  {order.deliveryZoneName && (
                    <span className="block text-[11px] text-[#5C434E]/85 mt-0.5">
                      {order.deliveryZoneName}
                    </span>
                  )}
                </div>
                <dd className="text-xs sm:text-sm font-medium text-[#351522] tabular-nums text-right">
                  {order.deliveryFee !== null &&
                  Number.isFinite(order.deliveryFee)
                    ? formatPrice(order.deliveryFee)
                    : 'Pending valid delivery location'}
                </dd>
              </div>

              <div className="pt-3.5 border-t border-[#D6AD72]/40 flex items-baseline justify-between gap-4">
                <dt className="text-sm font-semibold text-[#26151D]">
                  Final Grand Total (PKR)
                </dt>
                <dd className="font-serif text-3xl font-semibold text-[#351522] tabular-nums">
                  {formatPrice(
                    Number.isFinite(order.grandTotal) ? order.grandTotal : 0,
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* 5 & 6. Customer, Delivery & Payment Information (Right Column) */}
          <div className="lg:col-span-5 space-y-6 min-w-0">
            {/* 5. Customer & Delivery Details */}
            <div className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/40 p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#D6AD72]/25">
                <MapPin
                  className="w-4 h-4 text-[#8C6526] shrink-0"
                  strokeWidth={1.7}
                />
                <h2 className="font-serif text-2xl font-medium text-[#351522]">
                  Customer &amp; Delivery Details
                </h2>
              </div>

              <dl className="space-y-3 text-xs sm:text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[#5C434E] mb-0.5">
                    Full Name
                  </dt>
                  <dd className="font-semibold text-[#351522]">
                    {order.customer.fullName}
                  </dd>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.14em] text-[#5C434E] mb-0.5">
                      Mobile Number
                    </dt>
                    <dd className="text-[#26151D] tabular-nums">
                      {order.customer.mobile}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] uppercase tracking-[0.14em] text-[#5C434E] mb-0.5">
                      Email Address
                    </dt>
                    <dd className="text-[#26151D] break-words">
                      {order.customer.email}
                    </dd>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#D6AD72]/20">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[#5C434E] mb-1">
                    Complete Delivery Address
                  </dt>
                  <dd className="text-[#26151D] leading-relaxed space-y-0.5">
                    <p>{order.address.streetAddress}</p>
                    <p>
                      {order.address.area}, {order.address.city}
                    </p>
                    <p>
                      {order.address.province}, {order.address.country} ·{' '}
                      <span className="tabular-nums">
                        {order.address.postalCode}
                      </span>
                    </p>
                    {order.address.deliveryInstructions && (
                      <p className="text-xs text-[#5C434E] pt-1">
                        Delivery Note: {order.address.deliveryInstructions}
                      </p>
                    )}
                  </dd>
                </div>

                <div className="pt-2 border-t border-[#D6AD72]/20">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[#5C434E] mb-0.5">
                    Selected Delivery Zone
                  </dt>
                  <dd className="text-[#351522] font-medium">
                    {order.deliveryZoneName ?? 'Pending configured delivery zone'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* 6. Payment Information */}
            <div className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/40 p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#D6AD72]/25">
                {isCodOrder ? (
                  <Banknote
                    className="w-4 h-4 text-[#8C6526] shrink-0"
                    strokeWidth={1.7}
                  />
                ) : (
                  <Smartphone
                    className="w-4 h-4 text-[#8C6526] shrink-0"
                    strokeWidth={1.7}
                  />
                )}
                <h2 className="font-serif text-2xl font-medium text-[#351522]">
                  Payment Information
                </h2>
              </div>

              <dl className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[#5C434E]">Payment Method</dt>
                  <dd className="font-medium text-[#351522] text-right">
                    {paymentMethodDisplay}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[#5C434E]">Payment Amount</dt>
                  <dd className="font-semibold text-[#351522] tabular-nums text-right">
                    {formatPrice(order.grandTotal)}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[#5C434E]">Payment Status</dt>
                  <dd className="font-medium text-[#351522] text-right">
                    {isCodOrder
                      ? 'Unpaid / Pay on Delivery'
                      : 'Awaiting Admin Verification'}
                  </dd>
                </div>

                {isCodOrder ? (
                  <div className="pt-2.5 border-t border-[#D6AD72]/20 flex items-start justify-between gap-4">
                    <dt className="text-[#351522] font-medium">
                      Payable Upon Delivery
                    </dt>
                    <dd className="font-semibold text-[#351522] tabular-nums text-right">
                      {formatPrice(order.grandTotal)}
                    </dd>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-[#5C434E]">Wallet Number</dt>
                      <dd className="text-[#26151D] tabular-nums text-right">
                        {WALLET_RECIPIENT_NUMBER}
                      </dd>
                    </div>

                    {order.transactionRefId && (
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-[#5C434E]">Transaction Ref ID</dt>
                        <dd className="font-medium text-[#26151D] tabular-nums text-right break-all">
                          {order.transactionRefId}
                        </dd>
                      </div>
                    )}

                    <div className="pt-3 border-t border-[#D6AD72]/20 space-y-2">
                      <div className="flex items-start gap-2 text-xs text-[#5C434E]">
                        <Lock
                          className="w-3.5 h-3.5 text-[#8C6526] shrink-0 mt-0.5"
                          strokeWidth={1.7}
                        />
                        <span>
                          Your submitted payment screenshot is kept private and
                          is never displayed publicly. An administrator verifies
                          the transfer independently before confirmation.
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </dl>

              <div className="pt-2 flex items-center gap-2 text-[11px] text-[#5C434E]">
                <ShieldCheck
                  className="w-3.5 h-3.5 text-[#8C6526] shrink-0"
                  strokeWidth={1.7}
                />
                <span>
                  Questions about this order? Contact{' '}
                  <a
                    href="mailto:concierge@auremist.com"
                    className="text-[#351522] underline underline-offset-2"
                  >
                    concierge@auremist.com
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
