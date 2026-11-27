import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  ChevronRight,
  Copy,
  Gift,
  Image as ImageIcon,
  Info,
  Lock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Trash2,
  Truck,
  Upload,
} from 'lucide-react';
import { formatPrice } from '../data/fragrances';
import {
  buildOrderPreviewSnapshot,
  calculateCheckoutTotals,
  CheckoutFormErrors,
  formatFileSize,
  getConfiguredDeliveryZones,
  PAKISTAN_PROVINCES,
  validateCheckoutSubmission,
  validatePaymentProofFile,
  WALLET_RECIPIENT_NUMBER,
} from '../lib/checkout';
import { fadeUpVariants, LUXURY_EASE } from '../lib/motion';
import {
  isZoneCompatibleWithAddress,
  resolveDeliveryForAddress,
} from '../lib/shipping';
import {
  AppliedCoupon,
  CartItem,
  CheckoutAddressInfo,
  CheckoutCustomerInfo,
  CheckoutOrderPreview,
  DeliveryZoneOption,
  PaymentMainOption,
  PaymentMethodType,
  PaymentProofState,
} from '../types/perfume';
import { LuxuryImage } from './LuxuryImage';

interface CheckoutPageProps {
  items: CartItem[];
  giftWrap: boolean;
  appliedCoupon: AppliedCoupon | null;
  confirmedOrder: CheckoutOrderPreview | null;
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  onNavigateCart: () => void;
  onOrderConfirmed: (order: CheckoutOrderPreview) => void;
}

const INITIAL_CUSTOMER: CheckoutCustomerInfo = {
  fullName: '',
  mobile: '',
  email: '',
};

const INITIAL_ADDRESS: CheckoutAddressInfo = {
  country: 'Pakistan',
  province: '',
  city: '',
  area: '',
  streetAddress: '',
  postalCode: '',
  deliveryInstructions: '',
};

export function CheckoutPage({
  items,
  giftWrap,
  appliedCoupon,
  confirmedOrder,
  onNavigateHome,
  onNavigateShop,
  onNavigateCart,
  onOrderConfirmed,
}: CheckoutPageProps) {
  const configuredZones: DeliveryZoneOption[] = useMemo(
    () => getConfiguredDeliveryZones(),
    [],
  );

  const [customer, setCustomer] =
    useState<CheckoutCustomerInfo>(INITIAL_CUSTOMER);
  const [address, setAddress] = useState<CheckoutAddressInfo>(INITIAL_ADDRESS);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [mainPaymentOption, setMainPaymentOption] =
    useState<PaymentMainOption>('cod');
  const [walletChoice, setWalletChoice] = useState<'easypaisa' | 'jazzcash'>(
    'easypaisa',
  );
  const [paymentProof, setPaymentProof] = useState<PaymentProofState | null>(
    null,
  );
  const [proofError, setProofError] = useState<string | null>(null);
  const [transactionRefId, setTransactionRefId] = useState('');
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const proofUrlRef = useRef<string | null>(null);

  useEffect(() => {
    proofUrlRef.current = paymentProof?.previewObjectUrl ?? null;
  }, [paymentProof]);

  useEffect(() => {
    return () => {
      if (proofUrlRef.current) {
        URL.revokeObjectURL(proofUrlRef.current);
      }
    };
  }, []);

  const locationResolution = useMemo(
    () => resolveDeliveryForAddress(address, configuredZones),
    [address, configuredZones],
  );

  const syncZoneForAddress = (nextAddress: CheckoutAddressInfo) => {
    const resolution = resolveDeliveryForAddress(nextAddress, configuredZones);
    if (resolution.status !== 'matched') {
      setSelectedZoneId('');
      return;
    }
    setSelectedZoneId(resolution.recommendedZone?.id ?? '');
    clearFieldError('deliveryZone');
  };

  useEffect(() => {
    if (locationResolution.status !== 'matched') {
      if (selectedZoneId !== '') {
        setSelectedZoneId('');
      }
      return;
    }
    const stillCompatible =
      selectedZoneId &&
      locationResolution.eligibleZones.some((z) => z.id === selectedZoneId);
    if (!stillCompatible) {
      setSelectedZoneId(locationResolution.recommendedZone?.id ?? '');
    }
  }, [locationResolution, selectedZoneId]);

  const activePaymentMethod: PaymentMethodType =
    mainPaymentOption === 'cod' ? 'cod' : walletChoice;

  const selectedZone = useMemo(() => {
    const found = configuredZones.find((z) => z.id === selectedZoneId) ?? null;
    if (!found) return null;
    return isZoneCompatibleWithAddress(address, found).compatible ? found : null;
  }, [configuredZones, selectedZoneId, address]);

  const totals = useMemo(
    () => calculateCheckoutTotals(items, appliedCoupon, selectedZone),
    [items, appliedCoupon, selectedZone],
  );

  const totalBottleCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const clearFieldError = (field: keyof CheckoutFormErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleCopyRecipient = async () => {
    try {
      await navigator.clipboard.writeText(WALLET_RECIPIENT_NUMBER);
      setCopiedNumber(true);
      window.setTimeout(() => setCopiedNumber(false), 2200);
    } catch {
      setCopiedNumber(false);
    }
  };

  const handleProofFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validatePaymentProofFile(file);
    if (!validation.ok) {
      setProofError(validation.error);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (paymentProof?.previewObjectUrl) {
      URL.revokeObjectURL(paymentProof.previewObjectUrl);
    }

    const previewObjectUrl = URL.createObjectURL(file);
    setPaymentProof({
      file,
      fileName: file.name,
      fileSize: file.size,
      mimeType: validation.mimeType,
      previewObjectUrl,
    });
    setProofError(null);
    clearFieldError('paymentProof');
  };

  const handleRemoveProof = () => {
    if (paymentProof?.previewObjectUrl) {
      URL.revokeObjectURL(paymentProof.previewObjectUrl);
    }
    setPaymentProof(null);
    setProofError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSwitchPaymentMain = (option: PaymentMainOption) => {
    setMainPaymentOption(option);
    clearFieldError('paymentMethod');
    clearFieldError('paymentProof');
    if (option === 'cod') {
      setProofError(null);
    }
  };

  const handleConfirmOrder = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateCheckoutSubmission({
      items,
      customer,
      address,
      configuredZones,
      selectedZoneId,
      paymentMethod: activePaymentMethod,
      paymentProof,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.paymentProof) {
        setProofError(validationErrors.paymentProof);
      }
      window.scrollTo({ top: 140, behavior: 'smooth' });
      return;
    }

    const confirmedZone =
      configuredZones.find((z) => z.id === selectedZoneId) ?? null;
    if (
      !confirmedZone ||
      !isZoneCompatibleWithAddress(address, confirmedZone).compatible
    ) {
      setErrors({
        deliveryZone:
          'Please enter a valid delivery location and select an eligible delivery zone.',
      });
      window.scrollTo({ top: 140, behavior: 'smooth' });
      return;
    }

    const confirmedTotals = calculateCheckoutTotals(
      items,
      appliedCoupon,
      confirmedZone,
    );
    if (
      !confirmedTotals.hasCalculatedShipping ||
      confirmedTotals.deliveryFee === null
    ) {
      setErrors({
        deliveryZone:
          'Delivery charges could not be calculated. Please select a valid delivery zone.',
      });
      window.scrollTo({ top: 140, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const orderSnapshot = buildOrderPreviewSnapshot({
      items,
      giftWrap,
      coupon: appliedCoupon,
      customer,
      address,
      selectedZone: confirmedZone,
      totals: confirmedTotals,
      paymentMethod: activePaymentMethod,
      paymentProof,
      transactionRefId,
    });

    if (paymentProof?.previewObjectUrl) {
      URL.revokeObjectURL(paymentProof.previewObjectUrl);
    }

    window.setTimeout(() => {
      onOrderConfirmed(orderSnapshot);
      setIsSubmitting(false);
    }, 180);
  };

  // Order Confirmation Screen (Frontend Demonstration Preview)
  if (confirmedOrder) {
    const isCodOrder = confirmedOrder.paymentMethod === 'cod';
    const paymentMethodDisplay =
      confirmedOrder.paymentMethod === 'cod'
        ? 'Cash on Delivery (COD)'
        : confirmedOrder.paymentMethod === 'easypaisa'
          ? 'Easypaisa (Manual Wallet Transfer)'
          : 'JazzCash (Manual Wallet Transfer)';

    return (
      <div className="bg-[#FFF5E9] text-[#26151D] overflow-x-hidden">
        <section className="bg-[#F8F0E7] border-b border-[#D6AD72]/35 py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-8">
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-full bg-[#351522] text-[#D6AD72] border border-[#D6AD72] flex items-center justify-center">
                  <Check className="w-5 h-5" strokeWidth={2} />
                </span>
                <div>
                  <span className="block text-[11px] uppercase tracking-[0.2em] text-[#8C6526] font-semibold">
                    Order Preview · {confirmedOrder.orderNumber}
                  </span>
                  <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#351522]">
                    Thank You, {confirmedOrder.customer.fullName}
                  </h1>
                </div>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/55 flex items-start gap-3">
                <Info
                  className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
                  strokeWidth={1.8}
                />
                <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
                  <strong className="font-semibold text-[#351522]">
                    Frontend Checkout Demonstration:
                  </strong>{' '}
                  Backend order APIs and database persistence are not connected
                  yet. This confirmation preview is not permanently saved, and
                  submitted transfers are not marked as verified or paid.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-8">
          {/* Status Summary Card */}
          <div className="rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/45 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-[#D6AD72]/30">
              <div>
                <span className="block text-[11px] uppercase tracking-[0.16em] text-[#8C6526] font-semibold mb-1">
                  Order Reference
                </span>
                <p className="font-serif text-2xl font-semibold text-[#351522] tabular-nums">
                  {confirmedOrder.orderNumber}
                </p>
              </div>
              <div className="sm:text-right">
                <span className="block text-[11px] uppercase tracking-[0.16em] text-[#5C434E] mb-1">
                  Order Status
                </span>
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-[#351522]">
                  {confirmedOrder.statusLabel}
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base font-medium text-[#351522] mb-2">
              {confirmedOrder.statusMessage}
            </p>
            <p className="text-xs text-[#5C434E] leading-relaxed">
              {isCodOrder
                ? `Exact amount due upon delivery: ${formatPrice(confirmedOrder.grandTotal)}${confirmedOrder.deliveryFee === null ? ' (delivery charges pending store shipping configuration).' : '.'}`
                : `Recipient number ${WALLET_RECIPIENT_NUMBER}. Our team verifies manual wallet transfers against uploaded proof before dispatch once backend order processing is connected.`}
            </p>
          </div>

          {/* Customer, Delivery & Payment Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/35 p-6 space-y-3">
              <h2 className="font-serif text-2xl font-medium text-[#351522] pb-2 border-b border-[#D6AD72]/25">
                Customer &amp; Delivery Address
              </h2>
              <div className="text-xs sm:text-sm space-y-1.5 text-[#26151D]">
                <p className="font-semibold text-[#351522]">
                  {confirmedOrder.customer.fullName}
                </p>
                <p className="tabular-nums text-[#5C434E]">
                  {confirmedOrder.customer.mobile}
                </p>
                <p className="text-[#5C434E]">{confirmedOrder.customer.email}</p>
                <div className="pt-2 text-[#26151D] leading-relaxed">
                  <p>{confirmedOrder.address.streetAddress}</p>
                  <p>
                    {confirmedOrder.address.area}, {confirmedOrder.address.city}
                  </p>
                  <p>
                    {confirmedOrder.address.province},{' '}
                    {confirmedOrder.address.country} ·{' '}
                    <span className="tabular-nums">
                      {confirmedOrder.address.postalCode}
                    </span>
                  </p>
                  {confirmedOrder.address.deliveryInstructions && (
                    <p className="text-xs text-[#5C434E] pt-1.5">
                      Note: {confirmedOrder.address.deliveryInstructions}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/35 p-6 space-y-3">
              <h2 className="font-serif text-2xl font-medium text-[#351522] pb-2 border-b border-[#D6AD72]/25">
                Payment Details
              </h2>
              <dl className="text-xs sm:text-sm space-y-2.5">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#5C434E]">Payment Method</dt>
                  <dd className="font-medium text-[#351522] text-right">
                    {paymentMethodDisplay}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#5C434E]">Payment Status</dt>
                  <dd className="font-medium text-[#351522] text-right">
                    {isCodOrder ? 'Unpaid / Pay on Delivery' : 'Awaiting Verification'}
                  </dd>
                </div>
                {!isCodOrder && (
                  <>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#5C434E]">Wallet Number</dt>
                      <dd className="font-medium text-[#26151D] tabular-nums text-right">
                        {WALLET_RECIPIENT_NUMBER}
                      </dd>
                    </div>
                    {confirmedOrder.transactionRefId && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-[#5C434E]">Transaction Ref ID</dt>
                        <dd className="font-medium text-[#26151D] tabular-nums text-right">
                          {confirmedOrder.transactionRefId}
                        </dd>
                      </div>
                    )}
                    {confirmedOrder.proofFileName && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-[#5C434E]">Payment Proof</dt>
                        <dd className="font-medium text-[#26151D] text-right truncate max-w-[200px]">
                          Attached locally ({confirmedOrder.proofFileName})
                        </dd>
                      </div>
                    )}
                  </>
                )}
              </dl>
            </div>
          </div>

          {/* Ordered Products & PKR Totals */}
          <div className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/35 overflow-hidden">
            <div className="px-6 py-4 bg-[#F8F0E7] border-b border-[#D6AD72]/30">
              <h2 className="font-serif text-2xl font-medium text-[#351522]">
                Items in This Order ({confirmedOrder.items.length})
              </h2>
            </div>

            <ul className="divide-y divide-[#D6AD72]/25 px-6">
              {confirmedOrder.items.map((item) => (
                <li
                  key={`${item.product.id}-${item.size}`}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-16 shrink-0 rounded-md overflow-hidden bg-[#F8F0E7] border border-[#D6AD72]/30">
                      <LuxuryImage
                        src={item.product.image}
                        alt={item.product.name}
                        fallbackTitle={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif text-lg font-medium text-[#351522] truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-[#5C434E] tabular-nums">
                        {item.size} · Qty {item.quantity} ×{' '}
                        {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-sm text-[#26151D] tabular-nums shrink-0">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="px-6 py-5 bg-[#F8F0E7] border-t border-[#D6AD72]/30 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#5C434E]">Subtotal</span>
                <span className="tabular-nums font-medium">
                  {formatPrice(confirmedOrder.itemSubtotal)}
                </span>
              </div>
              {(confirmedOrder.discountAmount > 0 ||
                Boolean(confirmedOrder.coupon)) && (
                <div className="flex justify-between">
                  <span className="text-[#5C434E]">
                    Discount
                    {confirmedOrder.coupon
                      ? ` (${confirmedOrder.coupon.code})`
                      : ''}
                  </span>
                  <span className="tabular-nums font-medium text-[#351522]">
                    {confirmedOrder.discountAmount > 0
                      ? `− ${formatPrice(confirmedOrder.discountAmount)}`
                      : formatPrice(0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[#5C434E]">
                    Delivery / Shipping Charges
                  </span>
                  {confirmedOrder.deliveryZoneName && (
                    <span className="block text-[11px] text-[#5C434E]">
                      {confirmedOrder.deliveryZoneName}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#351522] tabular-nums">
                  {confirmedOrder.deliveryFee !== null
                    ? formatPrice(confirmedOrder.deliveryFee)
                    : 'Pending valid delivery location'}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-[#D6AD72]/35">
                <span className="font-semibold text-[#26151D]">
                  Final Grand Total
                </span>
                <span className="font-serif text-3xl font-semibold text-[#351522] tabular-nums">
                  {formatPrice(confirmedOrder.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={onNavigateShop}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-sm font-medium tracking-wide hover:bg-[#240D16] transition-colors cursor-pointer min-h-[46px]"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4 text-[#D6AD72]" strokeWidth={1.6} />
            </button>
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg border border-[#D6AD72]/55 bg-[#F8F0E7] text-sm font-medium text-[#351522] hover:border-[#351522] transition-colors cursor-pointer min-h-[46px]"
            >
              Return to Home
            </button>
          </div>
        </section>
      </div>
    );
  }

  const hasErrorSummary = Object.keys(errors).length > 0;

  return (
    <div className="bg-[#FFF5E9] text-[#26151D] overflow-x-hidden">
      {/* Header & Breadcrumb */}
      <section className="bg-[#F8F0E7] border-b border-[#D6AD72]/35 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div>
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
                <button
                  type="button"
                  onClick={onNavigateCart}
                  className="hover:text-[#351522] transition-colors cursor-pointer"
                >
                  Shopping Cart
                </button>
                <ChevronRight
                  className="w-3.5 h-3.5 text-[#D6AD72]"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <span className="text-[#351522] font-semibold">Checkout</span>
              </nav>

              <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#351522] leading-tight">
                Checkout
              </h1>
            </div>

            <button
              type="button"
              onClick={onNavigateCart}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#351522] hover:text-[#8C6526] transition-colors cursor-pointer self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
              <span>Return to Shopping Cart</span>
            </button>
          </motion.div>

          {/* Transparent Frontend Demonstration Notice */}
          <div className="mt-6 p-3.5 sm:p-4 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/50 flex items-start gap-3">
            <Info
              className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
              strokeWidth={1.7}
            />
            <p className="text-xs text-[#26151D] leading-relaxed">
              <strong className="font-semibold text-[#351522]">
                Frontend Checkout Preview:
              </strong>{' '}
              Backend order APIs and database storage are not connected yet. Orders
              confirmed here demonstrate validation and payment confirmation states
              without permanently saving records or verifying wallet transfers.
            </p>
          </div>
        </div>
      </section>

      {/* Main Checkout Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        {items.length === 0 ? (
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl mx-auto py-16 px-6 text-center rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/40"
          >
            <div className="w-16 h-16 mx-auto rounded-full border border-[#D6AD72]/60 bg-[#FFF5E9] flex items-center justify-center mb-6">
              <ShoppingBag className="w-7 h-7 text-[#351522]" strokeWidth={1.4} />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#351522] mb-3">
              Your shopping bag is empty
            </h2>
            <p className="text-sm text-[#5C434E] leading-relaxed max-w-md mx-auto mb-8">
              Please add a fragrance to your shopping bag before proceeding to
              checkout.
            </p>
            <button
              type="button"
              onClick={onNavigateShop}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-sm font-medium tracking-wide hover:bg-[#240D16] transition-colors cursor-pointer min-h-[46px]"
            >
              <span>Shop Fragrances</span>
              <ArrowRight className="w-4 h-4 text-[#D6AD72]" strokeWidth={1.6} />
            </button>
          </motion.div>
        ) : (
          <form
            onSubmit={handleConfirmOrder}
            noValidate
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
          >
            {/* Left Column: Customer Details, Delivery Address, Shipping Zone & Payment Method */}
            <div className="lg:col-span-7 space-y-8 min-w-0">
              {hasErrorSummary && (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-[#FFF5E9] border border-[#7A1D38]/45 flex items-start gap-3 text-xs text-[#7A1D38]"
                >
                  <AlertCircle
                    className="w-4 h-4 shrink-0 mt-0.5"
                    strokeWidth={1.8}
                  />
                  <div>
                    <p className="font-semibold mb-0.5">
                      Please review the highlighted checkout fields below.
                    </p>
                    <p>
                      Required customer details, full delivery address, and payment
                      selection must be completed before confirming your order.
                    </p>
                  </div>
                </div>
              )}

              {/* 1. Customer Information */}
              <div className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/40 p-6 sm:p-7 space-y-5">
                <div className="pb-3 border-b border-[#D6AD72]/25">
                  <span className="block text-[11px] uppercase tracking-[0.18em] text-[#8C6526] font-semibold mb-1">
                    Step 01
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#351522]">
                    Customer Details
                  </h2>
                  <p className="text-xs text-[#5C434E] mt-1">
                    Guest checkout is available — no account creation required.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="checkout-full-name"
                      className="block text-xs font-medium text-[#351522] mb-1.5"
                    >
                      Full Name <span className="text-[#7A1D38]">*</span>
                    </label>
                    <input
                      id="checkout-full-name"
                      type="text"
                      autoComplete="name"
                      value={customer.fullName}
                      onChange={(e) => {
                        setCustomer((c) => ({ ...c, fullName: e.target.value }));
                        clearFieldError('fullName');
                      }}
                      placeholder="Enter your full name"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-[#F8F0E7]/55 border text-sm text-[#26151D] placeholder:text-[#5C434E]/65 focus:outline-none focus:bg-[#FFF5E9] ${
                        errors.fullName
                          ? 'border-[#7A1D38] focus:border-[#7A1D38]'
                          : 'border-[#D6AD72]/55 focus:border-[#351522]'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="mt-1.5 text-xs text-[#7A1D38]">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-mobile"
                      className="block text-xs font-medium text-[#351522] mb-1.5"
                    >
                      Mobile Number <span className="text-[#7A1D38]">*</span>
                    </label>
                    <input
                      id="checkout-mobile"
                      type="tel"
                      autoComplete="tel"
                      value={customer.mobile}
                      onChange={(e) => {
                        setCustomer((c) => ({ ...c, mobile: e.target.value }));
                        clearFieldError('mobile');
                      }}
                      placeholder="e.g. 0300 1234567"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-[#F8F0E7]/55 border text-sm text-[#26151D] placeholder:text-[#5C434E]/65 focus:outline-none focus:bg-[#FFF5E9] ${
                        errors.mobile
                          ? 'border-[#7A1D38] focus:border-[#7A1D38]'
                          : 'border-[#D6AD72]/55 focus:border-[#351522]'
                      }`}
                    />
                    {errors.mobile && (
                      <p className="mt-1.5 text-xs text-[#7A1D38]">
                        {errors.mobile}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-email"
                      className="block text-xs font-medium text-[#351522] mb-1.5"
                    >
                      Email Address <span className="text-[#7A1D38]">*</span>
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      autoComplete="email"
                      value={customer.email}
                      onChange={(e) => {
                        setCustomer((c) => ({ ...c, email: e.target.value }));
                        clearFieldError('email');
                      }}
                      placeholder="you@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-[#F8F0E7]/55 border text-sm text-[#26151D] placeholder:text-[#5C434E]/65 focus:outline-none focus:bg-[#FFF5E9] ${
                        errors.email
                          ? 'border-[#7A1D38] focus:border-[#7A1D38]'
                          : 'border-[#D6AD72]/55 focus:border-[#351522]'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-[#7A1D38]">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Delivery Address */}
              <div className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/40 p-6 sm:p-7 space-y-5">
                <div className="pb-3 border-b border-[#D6AD72]/25">
                  <span className="block text-[11px] uppercase tracking-[0.18em] text-[#8C6526] font-semibold mb-1">
                    Step 02
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#351522]">
                    Delivery Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="checkout-country"
                      className="block text-xs font-medium text-[#351522] mb-1.5"
                    >
                      Country <span className="text-[#7A1D38]">*</span>
                    </label>
                    <input
                      id="checkout-country"
                      type="text"
                      autoComplete="country-name"
                      value={address.country}
                      onChange={(e) => {
                        const nextAddress = { ...address, country: e.target.value };
                        setAddress(nextAddress);
                        clearFieldError('country');
                        syncZoneForAddress(nextAddress);
                      }}
                      placeholder="Pakistan"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-[#F8F0E7]/55 border text-sm text-[#26151D] focus:outline-none focus:bg-[#FFF5E9] ${
                        errors.country
                          ? 'border-[#7A1D38]'
                          : 'border-[#D6AD72]/55 focus:border-[#351522]'
                      }`}
                    />
                    {errors.country && (
                      <p className="mt-1.5 text-xs text-[#7A1D38]">
                        {errors.country}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-province"
                      className="block text-xs font-medium text-[#351522] mb-1.5"
                    >
                      Province / State <span className="text-[#7A1D38]">*</span>
                    </label>
                    <select
                      id="checkout-province"
                      value={address.province}
                      onChange={(e) => {
                        const nextAddress = { ...address, province: e.target.value };
                        setAddress(nextAddress);
                        clearFieldError('province');
                        syncZoneForAddress(nextAddress);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-[#F8F0E7]/55 border text-sm text-[#26151D] focus:outline-none focus:bg-[#FFF5E9] ${
                        errors.province
                          ? 'border-[#7A1D38]'
                          : 'border-[#D6AD72]/55 focus:border-[#351522]'
                      }`}
                    >
                      <option value="">Select province / state</option>
                      {PAKISTAN_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="mt-1.5 text-xs text-[#7A1D38]">
                        {errors.province}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-city"
                      className="block text-xs font-medium text-[#351522] mb-1.5"
                    >
                      City <span className="text-[#7A1D38]">*</span>
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      autoComplete="address-level2"
                      value={address.city}
                      onChange={(e) => {
                        const nextAddress = { ...address, city: e.target.value };
                        setAddress(nextAddress);
                        clearFieldError('city');
                        syncZoneForAddress(nextAddress);
                      }}
                      placeholder="e.g. Lahore, Karachi, Islamabad"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-[#F8F0E7]/55 border text-sm text-[#26151D] placeholder:text-[#5C434E]/65 focus:outline-none focus:bg-[#FFF5E9] ${
                        errors.city
                          ? 'border-[#7A1D38]'
                          : 'border-[#D6AD72]/55 focus:border-[#351522]'
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1.5 text-xs text-[#7A1D38]">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-area"
                      className="block text-xs font-medium text-[#351522] mb-1.5"
                    >
                      Area / Locality <span className="text-[#7A1D38]">*</span>
                    </label>
                    <input
                      id="checkout-area"
                      type="text"
                      value={address.area}
                      onChange={(e) => {
                        setAddress((a) => ({ ...a, area: e.target.value }));
                        clearFieldError('area');
                      }}
                      placeholder="e.g. DHA Phase 5, Gulberg III, F-7"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-[#F8F0E7]/55 border text-sm text-[#26151D] placeholder:text-[#5C434E]/65 focus:outline-none focus:bg-[#FFF5E9] ${
                        errors.area
                          ? 'border-[#7A1D38]'
                          : 'border-[#D6AD72]/55 focus:border-[#351522]'
                      }`}
                    />
                    {errors.area && (
                      <p className="mt-1.5 text-xs text-[#7A1D38]">
                        {errors.area}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="checkout-street"
                      className="block text-xs font-medium text-[#351522] mb-1.5"
                    >
                      Complete Street Address{' '}
                      <span className="text-[#7A1D38]">*</span>
                    </label>
                    <input
                      id="checkout-street"
                      type="text"
                      autoComplete="street-address"
                      value={address.streetAddress}
                      onChange={(e) => {
                        setAddress((a) => ({
                          ...a,
                          streetAddress: e.target.value,
                        }));
                        clearFieldError('streetAddress');
                      }}
                      placeholder="House / apartment number, street name, block & nearby landmark"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-[#F8F0E7]/55 border text-sm text-[#26151D] placeholder:text-[#5C434E]/65 focus:outline-none focus:bg-[#FFF5E9] ${
                        errors.streetAddress
                          ? 'border-[#7A1D38]'
                          : 'border-[#D6AD72]/55 focus:border-[#351522]'
                      }`}
                    />
                    {errors.streetAddress && (
                      <p className="mt-1.5 text-xs text-[#7A1D38]">
                        {errors.streetAddress}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-postal"
                      className="block text-xs font-medium text-[#351522] mb-1.5"
                    >
                      Postal Code <span className="text-[#7A1D38]">*</span>
                    </label>
                    <input
                      id="checkout-postal"
                      type="text"
                      autoComplete="postal-code"
                      value={address.postalCode}
                      onChange={(e) => {
                        setAddress((a) => ({ ...a, postalCode: e.target.value }));
                        clearFieldError('postalCode');
                      }}
                      placeholder="e.g. 54660"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-[#F8F0E7]/55 border text-sm text-[#26151D] placeholder:text-[#5C434E]/65 tabular-nums focus:outline-none focus:bg-[#FFF5E9] ${
                        errors.postalCode
                          ? 'border-[#7A1D38]'
                          : 'border-[#D6AD72]/55 focus:border-[#351522]'
                      }`}
                    />
                    {errors.postalCode && (
                      <p className="mt-1.5 text-xs text-[#7A1D38]">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="checkout-instructions"
                      className="block text-xs font-medium text-[#351522] mb-1.5"
                    >
                      Delivery Instructions{' '}
                      <span className="text-[#5C434E] font-normal">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      id="checkout-instructions"
                      rows={2}
                      value={address.deliveryInstructions}
                      onChange={(e) =>
                        setAddress((a) => ({
                          ...a,
                          deliveryInstructions: e.target.value,
                        }))
                      }
                      placeholder="Gate bell, preferred delivery hours, or gift handover notes"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F0E7]/55 border border-[#D6AD72]/55 text-sm text-[#26151D] placeholder:text-[#5C434E]/65 focus:outline-none focus:bg-[#FFF5E9] focus:border-[#351522]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Delivery Zone & Shipping */}
              <div className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/40 p-6 sm:p-7 space-y-4">
                <div className="pb-3 border-b border-[#D6AD72]/25">
                  <span className="block text-[11px] uppercase tracking-[0.18em] text-[#8C6526] font-semibold mb-1">
                    Step 03
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#351522]">
                    Delivery Zone &amp; Shipping
                  </h2>
                </div>

                {locationResolution.status === 'matched' ? (
                  <div className="space-y-3.5">
                    <label
                      htmlFor="checkout-delivery-zone"
                      className="block text-xs font-medium text-[#351522]"
                    >
                      Matched Delivery Zone for {address.city.trim()},{' '}
                      {address.province} <span className="text-[#7A1D38]">*</span>
                    </label>
                    <select
                      id="checkout-delivery-zone"
                      value={selectedZoneId}
                      onChange={(e) => {
                        setSelectedZoneId(e.target.value);
                        clearFieldError('deliveryZone');
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-[#F8F0E7]/55 border text-sm text-[#26151D] focus:outline-none focus:border-[#351522] ${
                        errors.deliveryZone
                          ? 'border-[#7A1D38]'
                          : 'border-[#D6AD72]/55'
                      }`}
                    >
                      <option value="">Choose an eligible delivery zone</option>
                      {locationResolution.eligibleZones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} ({zone.region}) — {formatPrice(zone.fee)}
                        </option>
                      ))}
                    </select>

                    {selectedZone && (
                      <div className="p-3.5 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/45 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-[#351522]">
                          <Truck
                            className="w-4 h-4 text-[#8C6526] shrink-0"
                            strokeWidth={1.6}
                          />
                          <div>
                            <p className="font-semibold">{selectedZone.name}</p>
                            <p className="text-[#5C434E]">
                              {selectedZone.region}
                              {selectedZone.estimatedWindow
                                ? ` · Est. ${selectedZone.estimatedWindow}`
                                : ''}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-sm text-[#351522] tabular-nums">
                          {formatPrice(selectedZone.fee)}
                        </span>
                      </div>
                    )}

                    {errors.deliveryZone && (
                      <p role="alert" className="text-xs text-[#7A1D38]">
                        {errors.deliveryZone}
                      </p>
                    )}
                  </div>
                ) : locationResolution.status === 'missing_location' ? (
                  <div className="space-y-3.5">
                    <div className="p-4 rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/50 flex items-start gap-3">
                      <MapPin
                        className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
                        strokeWidth={1.7}
                      />
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold text-[#351522]">
                          Select your province and enter your delivery city
                        </p>
                        <p className="text-[#5C434E] leading-relaxed">
                          Shipping charges are calculated by your delivery
                          location and courier zone (never assumed free).
                        </p>
                      </div>
                    </div>

                    {configuredZones.length > 0 && (
                      <div className="rounded-lg border border-[#D6AD72]/35 bg-[#FFF5E9] p-3.5 space-y-2">
                        <span className="block text-[11px] uppercase tracking-[0.14em] text-[#8C6526] font-semibold">
                          Regional Courier Rates
                        </span>
                        <ul className="divide-y divide-[#D6AD72]/20 text-xs">
                          {configuredZones.map((zone) => (
                            <li
                              key={zone.id}
                              className="py-1.5 flex items-center justify-between gap-2"
                            >
                              <span className="text-[#26151D]">
                                <strong className="font-medium text-[#351522]">
                                  {zone.name}
                                </strong>{' '}
                                <span className="text-[#5C434E]">
                                  ({zone.region})
                                </span>
                              </span>
                              <span className="font-medium text-[#351522] tabular-nums shrink-0">
                                {formatPrice(zone.fee)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {errors.deliveryZone && (
                      <p role="alert" className="text-xs text-[#7A1D38]">
                        {errors.deliveryZone}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#FDF3F5] border border-[#7A1D38]/35 space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-[#7A1D38]">
                      Unsupported or Unavailable Delivery Location
                    </p>
                    <p className="text-xs text-[#26151D] leading-relaxed">
                      {locationResolution.message}
                    </p>
                    {errors.deliveryZone && (
                      <p role="alert" className="text-xs text-[#7A1D38] pt-1">
                        {errors.deliveryZone}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 4. Payment Methods (Exactly TWO Main Options) */}
              <div className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/40 p-6 sm:p-7 space-y-5">
                <div className="pb-3 border-b border-[#D6AD72]/25">
                  <span className="block text-[11px] uppercase tracking-[0.18em] text-[#8C6526] font-semibold mb-1">
                    Step 04
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#351522]">
                    Payment Method
                  </h2>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Payment options"
                  className="space-y-4"
                >
                  {/* OPTION 1: Cash on Delivery (COD) */}
                  <div
                    className={`rounded-xl border transition-colors ${
                      mainPaymentOption === 'cod'
                        ? 'bg-[#F8F0E7] border-[#351522] ring-1 ring-[#D6AD72]'
                        : 'bg-[#FFF5E9] border-[#D6AD72]/40 hover:border-[#351522]/60'
                    }`}
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={mainPaymentOption === 'cod'}
                      onClick={() => handleSwitchPaymentMain('cod')}
                      className="w-full p-4 sm:p-5 flex items-start justify-between gap-4 text-left cursor-pointer"
                    >
                      <div className="flex items-start gap-3.5">
                        <span
                          className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            mainPaymentOption === 'cod'
                              ? 'border-[#351522] bg-[#351522]'
                              : 'border-[#D6AD72] bg-[#FFF5E9]'
                          }`}
                        >
                          {mainPaymentOption === 'cod' && (
                            <span className="w-2 h-2 rounded-full bg-[#D6AD72]" />
                          )}
                        </span>
                        <div>
                          <span className="inline-flex items-center gap-2 font-serif text-xl font-medium text-[#351522]">
                            <Banknote
                              className="w-4 h-4 text-[#8C6526]"
                              strokeWidth={1.7}
                            />
                            Cash on Delivery (COD)
                          </span>
                          <p className="text-xs text-[#5C434E] mt-1 leading-relaxed">
                            Pay in cash directly to the courier when your AUREMIST
                            parcel arrives. No advance screenshot required.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#351522] tabular-nums shrink-0 pt-1">
                        {totals.hasCalculatedShipping
                          ? formatPrice(totals.grandTotal)
                          : 'Pending shipping'}
                      </span>
                    </button>

                    {mainPaymentOption === 'cod' && (
                      <div className="px-5 pb-4 pt-2.5 border-t border-[#D6AD72]/25 text-xs text-[#351522] space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span>Exact Amount Payable at Delivery:</span>
                          <strong className="font-semibold text-sm tabular-nums">
                            {totals.hasCalculatedShipping
                              ? formatPrice(totals.grandTotal)
                              : 'Pending valid delivery location'}
                          </strong>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[#5C434E]">
                          <span>Payment Status:</span>
                          <strong className="font-medium text-[#351522]">
                            Unpaid / Pay on Delivery
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OPTION 2: Other Payment Methods (Easypaisa & JazzCash) */}
                  <div
                    className={`rounded-xl border transition-colors ${
                      mainPaymentOption === 'wallet'
                        ? 'bg-[#F8F0E7] border-[#351522] ring-1 ring-[#D6AD72]'
                        : 'bg-[#FFF5E9] border-[#D6AD72]/40 hover:border-[#351522]/60'
                    }`}
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={mainPaymentOption === 'wallet'}
                      onClick={() => handleSwitchPaymentMain('wallet')}
                      className="w-full p-4 sm:p-5 flex items-start justify-between gap-4 text-left cursor-pointer"
                    >
                      <div className="flex items-start gap-3.5">
                        <span
                          className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            mainPaymentOption === 'wallet'
                              ? 'border-[#351522] bg-[#351522]'
                              : 'border-[#D6AD72] bg-[#FFF5E9]'
                          }`}
                        >
                          {mainPaymentOption === 'wallet' && (
                            <span className="w-2 h-2 rounded-full bg-[#D6AD72]" />
                          )}
                        </span>
                        <div>
                          <span className="inline-flex items-center gap-2 font-serif text-xl font-medium text-[#351522]">
                            <Smartphone
                              className="w-4 h-4 text-[#8C6526]"
                              strokeWidth={1.7}
                            />
                            Manual Wallet Transfer
                          </span>
                          <p className="text-xs text-[#5C434E] mt-1 leading-relaxed">
                            Select Easypaisa or JazzCash, transfer the exact
                            order amount before placing your order, and upload
                            your confirmation screenshot.
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Wallet Choices + Payment Proof Upload (ONLY for Option 2) */}
                    {mainPaymentOption === 'wallet' && (
                      <div className="px-4 sm:px-5 pb-5 pt-4 border-t border-[#D6AD72]/30 space-y-5">
                        {/* Select Easypaisa or JazzCash */}
                        <div>
                          <span className="block text-[11px] uppercase tracking-[0.16em] text-[#351522] font-semibold mb-2.5">
                            Select Wallet Service
                          </span>
                          <div className="grid grid-cols-2 gap-3">
                            {(
                              [
                                {
                                  id: 'easypaisa',
                                  title: 'Easypaisa',
                                  caption: 'Mobile Wallet Transfer',
                                },
                                {
                                  id: 'jazzcash',
                                  title: 'JazzCash',
                                  caption: 'Mobile Wallet Transfer',
                                },
                              ] as const
                            ).map((wallet) => {
                              const active = walletChoice === wallet.id;
                              return (
                                <button
                                  key={wallet.id}
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() => {
                                    setWalletChoice(wallet.id);
                                    clearFieldError('paymentMethod');
                                  }}
                                  className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
                                    active
                                      ? 'bg-[#351522] text-[#FFF5E9] border-[#D6AD72]'
                                      : 'bg-[#FFF5E9] text-[#26151D] border-[#D6AD72]/45 hover:border-[#351522]'
                                  }`}
                                >
                                  <span className="block text-sm font-semibold">
                                    {wallet.title}
                                  </span>
                                  <span
                                    className={`block text-[11px] mt-0.5 ${
                                      active
                                        ? 'text-[#FFF5E9]/80'
                                        : 'text-[#5C434E]'
                                    }`}
                                  >
                                    {wallet.caption}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Recipient Instructions Box */}
                        <div className="p-4 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/55 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <span className="block text-[11px] uppercase tracking-[0.16em] text-[#8C6526] font-semibold">
                                {walletChoice === 'easypaisa'
                                  ? 'Easypaisa'
                                  : 'JazzCash'}{' '}
                                Recipient Number
                              </span>
                              <p className="font-serif text-2xl font-semibold text-[#351522] tabular-nums mt-0.5">
                                {WALLET_RECIPIENT_NUMBER}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={handleCopyRecipient}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors cursor-pointer"
                            >
                              {copiedNumber ? (
                                <>
                                  <Check className="w-3.5 h-3.5" strokeWidth={2} />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy
                                    className="w-3.5 h-3.5"
                                    strokeWidth={1.6}
                                  />
                                  <span>Copy Number</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t border-[#D6AD72]/25 text-xs">
                            <span className="text-[#5C434E]">
                              Exact Payment Amount Required:
                            </span>
                            <strong className="font-semibold text-sm text-[#351522] tabular-nums">
                              {totals.hasCalculatedShipping
                                ? formatPrice(totals.grandTotal)
                                : 'Pending valid delivery location'}
                            </strong>
                          </div>

                          <p className="text-xs text-[#5C434E] leading-relaxed">
                            {totals.hasCalculatedShipping ? (
                              <>
                                Please transfer exactly{' '}
                                <strong className="text-[#351522] tabular-nums">
                                  {formatPrice(totals.grandTotal)}
                                </strong>{' '}
                                to{' '}
                                <strong className="text-[#351522] tabular-nums">
                                  {WALLET_RECIPIENT_NUMBER}
                                </strong>{' '}
                                using{' '}
                                {walletChoice === 'easypaisa'
                                  ? 'Easypaisa'
                                  : 'JazzCash'}{' '}
                                <strong>before placing your order</strong>. Orders
                                paid by wallet transfer remain in &ldquo;Payment
                                Awaiting Verification&rdquo; until reviewed.
                              </>
                            ) : (
                              <>
                                Complete your delivery province and city above to
                                calculate your exact shipping charge and final
                                transfer amount before sending funds to{' '}
                                <strong className="text-[#351522] tabular-nums">
                                  {WALLET_RECIPIENT_NUMBER}
                                </strong>
                                .
                              </>
                            )}
                          </p>
                        </div>

                        {/* Required Payment Proof Screenshot Upload */}
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label
                              htmlFor="payment-proof-upload"
                              className="text-xs font-semibold text-[#351522]"
                            >
                              Payment Proof Screenshot{' '}
                              <span className="text-[#7A1D38]">*</span>
                            </label>
                            <span className="text-[11px] text-[#5C434E]">
                              JPG, JPEG or PNG · Max 5 MB
                            </span>
                          </div>

                          <input
                            ref={fileInputRef}
                            id="payment-proof-upload"
                            type="file"
                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                            onChange={handleProofFileChange}
                            className="sr-only"
                          />

                          {!paymentProof ? (
                            <label
                              htmlFor="payment-proof-upload"
                              className={`flex flex-col items-center justify-center text-center p-6 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                                proofError || errors.paymentProof
                                  ? 'border-[#7A1D38] bg-[#FFF5E9]'
                                  : 'border-[#D6AD72]/70 bg-[#FFF5E9] hover:border-[#351522]'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-full bg-[#F8F0E7] border border-[#D6AD72]/50 flex items-center justify-center mb-2.5">
                                <Upload
                                  className="w-4 h-4 text-[#351522]"
                                  strokeWidth={1.6}
                                />
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-[#351522]">
                                Upload Payment Confirmation Screenshot
                              </span>
                              <span className="text-[11px] text-[#5C434E] mt-1">
                                Click to choose JPG, JPEG, or PNG (maximum 5 MB)
                              </span>
                            </label>
                          ) : (
                            <div className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/60 p-4 space-y-3">
                              <div className="flex items-start gap-4">
                                <div className="w-20 h-24 shrink-0 rounded-lg overflow-hidden bg-[#F8F0E7] border border-[#D6AD72]/40">
                                  <img
                                    src={paymentProof.previewObjectUrl}
                                    alt="Private payment confirmation preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#351522] mb-0.5">
                                    <ImageIcon
                                      className="w-3.5 h-3.5 text-[#8C6526] shrink-0"
                                      strokeWidth={1.7}
                                    />
                                    <span className="truncate">
                                      {paymentProof.fileName}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#5C434E] tabular-nums">
                                    {formatFileSize(paymentProof.fileSize)} ·{' '}
                                    {paymentProof.mimeType === 'image/png'
                                      ? 'PNG Image'
                                      : 'JPEG Image'}
                                  </p>
                                  <p className="inline-flex items-center gap-1 text-[11px] text-[#351522] mt-1.5">
                                    <Lock
                                      className="w-3 h-3 text-[#8C6526]"
                                      strokeWidth={1.7}
                                    />
                                    <span>
                                      Private local file preview (not exposed
                                      publicly)
                                    </span>
                                  </p>

                                  <div className="flex flex-wrap items-center gap-3 mt-3">
                                    <label
                                      htmlFor="payment-proof-upload"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F8F0E7] border border-[#D6AD72]/55 text-xs font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors cursor-pointer"
                                    >
                                      <RefreshCw
                                        className="w-3 h-3"
                                        strokeWidth={1.7}
                                      />
                                      <span>Replace Screenshot</span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={handleRemoveProof}
                                      className="inline-flex items-center gap-1 text-xs text-[#5C434E] hover:text-[#7A1D38] cursor-pointer"
                                    >
                                      <Trash2
                                        className="w-3.5 h-3.5"
                                        strokeWidth={1.6}
                                      />
                                      <span>Remove</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {(proofError || errors.paymentProof) && (
                            <p
                              role="alert"
                              className="text-xs text-[#7A1D38] flex items-start gap-1.5"
                            >
                              <AlertCircle
                                className="w-3.5 h-3.5 shrink-0 mt-0.5"
                                strokeWidth={1.8}
                              />
                              <span>{proofError ?? errors.paymentProof}</span>
                            </p>
                          )}

                          {/* Optional Transaction Reference ID */}
                          <div>
                            <label
                              htmlFor="checkout-trx-ref"
                              className="block text-xs font-medium text-[#351522] mb-1.5"
                            >
                              Transaction Reference ID{' '}
                              <span className="text-[#5C434E] font-normal">
                                (Optional)
                              </span>
                            </label>
                            <input
                              id="checkout-trx-ref"
                              type="text"
                              maxLength={64}
                              value={transactionRefId}
                              onChange={(e) => setTransactionRefId(e.target.value)}
                              placeholder="Enter TID / Transaction Reference ID"
                              className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/55 text-sm text-[#26151D] placeholder:text-[#5C434E]/65 tabular-nums focus:outline-none focus:border-[#351522]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <aside
              aria-label="Checkout order summary"
              className="lg:col-span-5 lg:sticky lg:top-24 rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/45 p-6 sm:p-7 space-y-6 min-w-0"
            >
              <div className="flex items-baseline justify-between gap-2 pb-4 border-b border-[#D6AD72]/30">
                <h2 className="font-serif text-3xl font-medium text-[#351522]">
                  Order Summary
                </h2>
                <span className="text-xs text-[#5C434E] tabular-nums">
                  {totalBottleCount}{' '}
                  {totalBottleCount === 1 ? 'bottle' : 'bottles'}
                </span>
              </div>

              {/* Cart Items Preview */}
              <ul className="divide-y divide-[#D6AD72]/25 max-h-[340px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <li
                    key={`${item.product.id}-${item.size}`}
                    className="py-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-16 shrink-0 rounded-md overflow-hidden bg-[#FFF5E9] border border-[#D6AD72]/35">
                        <LuxuryImage
                          src={item.product.image}
                          alt={item.product.name}
                          fallbackTitle={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif text-lg font-medium text-[#26151D] leading-snug truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-[#5C434E] tabular-nums">
                          {item.size} · Qty {item.quantity}
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-medium text-[#351522] tabular-nums shrink-0">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {giftWrap && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/40 text-xs text-[#351522]">
                  <Gift
                    className="w-3.5 h-3.5 text-[#8C6526] shrink-0"
                    strokeWidth={1.6}
                  />
                  <span>Complimentary Gold Coffret Presentation included</span>
                </div>
              )}

              {/* Totals Formula Breakdown */}
              <dl className="space-y-3 pt-4 border-t border-[#D6AD72]/30 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#5C434E]">Subtotal</dt>
                  <dd className="font-medium text-[#26151D] tabular-nums">
                    {formatPrice(totals.eligibleItemSubtotal)}
                  </dd>
                </div>

                {(totals.validDiscount > 0 || Boolean(appliedCoupon)) && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#5C434E]">
                      Discount
                      {appliedCoupon ? ` (${appliedCoupon.code})` : ''}
                    </dt>
                    <dd className="font-medium text-[#351522] tabular-nums">
                      {totals.validDiscount > 0
                        ? `− ${formatPrice(totals.validDiscount)}`
                        : formatPrice(0)}
                    </dd>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <dt className="text-[#5C434E]">
                      Delivery / Shipping Charges
                    </dt>
                    {selectedZone && (
                      <span className="block text-[11px] text-[#5C434E]/85 mt-0.5">
                        {selectedZone.name}
                      </span>
                    )}
                  </div>
                  <dd
                    className={`text-right tabular-nums max-w-[200px] ${
                      totals.hasCalculatedShipping && totals.deliveryFee !== null
                        ? 'font-medium text-[#26151D]'
                        : 'text-xs text-[#8C6526] font-medium'
                    }`}
                  >
                    {totals.hasCalculatedShipping && totals.deliveryFee !== null
                      ? formatPrice(totals.deliveryFee)
                      : 'Pending valid delivery location'}
                  </dd>
                </div>

                <div className="pt-4 border-t border-[#D6AD72]/40 flex items-baseline justify-between gap-4">
                  <div>
                    <dt className="text-sm font-semibold text-[#26151D]">
                      Final Grand Total
                    </dt>
                    <span className="block text-[11px] text-[#5C434E]">
                      {totals.hasCalculatedShipping
                        ? 'Includes courier shipping charge'
                        : 'Enter delivery city & province'}
                    </span>
                  </div>
                  <dd
                    className={
                      totals.hasCalculatedShipping
                        ? 'font-serif text-3xl font-semibold text-[#351522] tabular-nums'
                        : 'text-sm font-semibold text-[#8C6526] text-right'
                    }
                  >
                    {totals.hasCalculatedShipping
                      ? formatPrice(totals.grandTotal)
                      : 'Pending shipping'}
                  </dd>
                </div>
              </dl>

              {/* Confirm Order CTA */}
              <div className="space-y-3 pt-1">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileTap={!isSubmitting ? { scale: 0.985 } : undefined}
                  transition={{ duration: 0.2, ease: LUXURY_EASE }}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-sm font-medium tracking-wide hover:bg-[#240D16] disabled:opacity-55 transition-colors cursor-pointer disabled:cursor-not-allowed min-h-[50px]"
                >
                  <ShieldCheck
                    className="w-4 h-4 text-[#D6AD72]"
                    strokeWidth={1.7}
                  />
                  <span>
                    {isSubmitting
                      ? 'Preparing Confirmation...'
                      : totals.hasCalculatedShipping
                        ? `Confirm Order · ${formatPrice(totals.grandTotal)}`
                        : 'Confirm Order'}
                  </span>
                </motion.button>

                {!totals.hasCalculatedShipping && (
                  <p className="text-xs text-[#8C6526] text-center leading-relaxed">
                    Select a supported province and enter your delivery city to
                    calculate courier shipping charges before placing your order.
                  </p>
                )}

                <p className="text-[11px] text-[#5C434E] text-center leading-relaxed">
                  Final Grand Total = Subtotal − Discount + Delivery Charges.
                  Product prices, stock, coupons, and shipping rules are
                  recalculated on the server when backend APIs are connected.
                </p>
              </div>
            </aside>
          </form>
        )}
      </section>
    </div>
  );
}
