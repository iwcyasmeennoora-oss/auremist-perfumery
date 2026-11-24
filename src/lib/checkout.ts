import {
  AppliedCoupon,
  CartItem,
  CheckoutAddressInfo,
  CheckoutCustomerInfo,
  CheckoutOrderPreview,
  DeliveryZoneOption,
  PaymentMethodType,
  PaymentProofState,
} from '../types/perfume';
import { calculateCartTotals } from './cartPricing';

/**
 * Recipient mobile wallet number for manual Easypaisa & JazzCash transfers.
 */
export const WALLET_RECIPIENT_NUMBER = '+92 321 577 2078';

/**
 * Maximum allowed payment proof screenshot size (5 MB).
 */
export const MAX_PAYMENT_PROOF_BYTES = 5 * 1024 * 1024;

/**
 * Configured store delivery zones.
 * Remains empty until backend shipping rules and delivery zones are configured.
 * Do not invent placeholder delivery zones or shipping fees.
 */
export const CONFIGURED_DELIVERY_ZONES: DeliveryZoneOption[] = [];

export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Islamabad Capital Territory',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan',
] as const;

export interface CheckoutTotals {
  eligibleItemSubtotal: number;
  validDiscount: number;
  deliveryFee: number | null;
  grandTotal: number;
}

/**
 * Grand Total = Eligible Item Subtotal - Valid Discount + Delivery Fee.
 * Browser totals serve only as live UI estimates; the backend order endpoint
 * must recalculate prices, variants, coupons, and shipping fees authoritatively.
 */
export function calculateCheckoutTotals(
  items: CartItem[],
  appliedCoupon: AppliedCoupon | null,
  selectedZone: DeliveryZoneOption | null,
): CheckoutTotals {
  const { itemSubtotal, discountAmount } = calculateCartTotals(
    items,
    appliedCoupon,
  );
  const deliveryFee = selectedZone ? selectedZone.fee : null;
  const grandTotal = Math.max(
    0,
    itemSubtotal - discountAmount + (deliveryFee ?? 0),
  );

  return {
    eligibleItemSubtotal: itemSubtotal,
    validDiscount: discountAmount,
    deliveryFee,
    grandTotal,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / (1024 * 1024)).toFixed(2)} MB`;
}

export function validatePaymentProofFile(
  file: File,
): { ok: true; mimeType: 'image/jpeg' | 'image/png' } | { ok: false; error: string } {
  if (!file || file.size <= 0) {
    return {
      ok: false,
      error: 'The selected file is empty. Please choose a valid JPG, JPEG, or PNG screenshot.',
    };
  }

  const lowerName = file.name.toLowerCase();
  const hasAllowedExtension =
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.png');
  const hasAllowedMime =
    file.type === 'image/jpeg' || file.type === 'image/png';

  if (!hasAllowedExtension || !hasAllowedMime) {
    return {
      ok: false,
      error:
        'Invalid file format. Only JPG, JPEG, and PNG payment screenshots are accepted.',
    };
  }

  if (file.size > MAX_PAYMENT_PROOF_BYTES) {
    return {
      ok: false,
      error: `File size (${formatFileSize(file.size)}) exceeds the 5 MB maximum limit. Please upload a smaller screenshot.`,
    };
  }

  return {
    ok: true,
    mimeType: file.type as 'image/jpeg' | 'image/png',
  };
}

export interface CheckoutFormErrors {
  fullName?: string;
  mobile?: string;
  email?: string;
  country?: string;
  province?: string;
  city?: string;
  area?: string;
  streetAddress?: string;
  postalCode?: string;
  deliveryZone?: string;
  paymentMethod?: string;
  paymentProof?: string;
  cart?: string;
}

export function validateCheckoutSubmission(params: {
  items: CartItem[];
  customer: CheckoutCustomerInfo;
  address: CheckoutAddressInfo;
  configuredZones: DeliveryZoneOption[];
  selectedZoneId: string;
  paymentMethod: PaymentMethodType | null;
  paymentProof: PaymentProofState | null;
}): CheckoutFormErrors {
  const {
    items,
    customer,
    address,
    configuredZones,
    selectedZoneId,
    paymentMethod,
    paymentProof,
  } = params;

  const errors: CheckoutFormErrors = {};

  if (items.length === 0) {
    errors.cart = 'Your shopping bag is empty. Add a fragrance before placing an order.';
  }

  const trimmedName = customer.fullName.trim();
  if (!trimmedName) {
    errors.fullName = 'Please enter your full name.';
  } else if (trimmedName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  const normalizedPhone = customer.mobile.replace(/[\s()-]/g, '');
  if (!customer.mobile.trim()) {
    errors.mobile = 'Please enter your mobile number for courier coordination.';
  } else if (!/^\+?\d{10,15}$/.test(normalizedPhone)) {
    errors.mobile =
      'Please enter a valid mobile number (e.g. 0300 1234567 or +92 300 1234567).';
  }

  const trimmedEmail = customer.email.trim();
  if (!trimmedEmail) {
    errors.email = 'Please enter your email address for order updates.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!address.country.trim()) {
    errors.country = 'Please enter or select your country.';
  }

  if (!address.province.trim()) {
    errors.province = 'Please select your province or state.';
  }

  if (!address.city.trim()) {
    errors.city = 'Please enter your delivery city.';
  }

  if (!address.area.trim()) {
    errors.area = 'Please enter your area, sector, or locality.';
  }

  if (!address.streetAddress.trim()) {
    errors.streetAddress = 'Please enter your complete street address and house number.';
  } else if (address.streetAddress.trim().length < 5) {
    errors.streetAddress = 'Please include house/flat and street details.';
  }

  const trimmedPostal = address.postalCode.trim();
  if (!trimmedPostal) {
    errors.postalCode = 'Please enter your postal code.';
  } else if (!/^[A-Za-z0-9 -]{3,12}$/.test(trimmedPostal)) {
    errors.postalCode = 'Please enter a valid postal code.';
  }

  if (configuredZones.length === 0) {
    errors.deliveryZone =
      'Delivery zones are not configured yet. Order placement is unavailable until a valid delivery option is configured.';
  } else if (!selectedZoneId) {
    errors.deliveryZone = 'Please select a delivery zone to calculate shipping.';
  }

  if (!paymentMethod) {
    errors.paymentMethod = 'Please choose a payment method.';
  } else if (
    (paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') &&
    !paymentProof
  ) {
    errors.paymentProof =
      'Please upload your payment screenshot (JPG, JPEG, or PNG, max 5 MB) before confirming.';
  }

  return errors;
}

export function generateDemoOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');

  let suffix = '';
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const buf = new Uint16Array(2);
    window.crypto.getRandomValues(buf);
    suffix = String(((buf[0] << 16) | buf[1]) % 9000 + 1000);
  } else {
    suffix = String(Math.floor(1000 + Math.random() * 9000));
  }

  return `AUR-${y}${m}${d}-${suffix}`;
}

export function buildOrderPreviewSnapshot(params: {
  items: CartItem[];
  giftWrap: boolean;
  coupon: AppliedCoupon | null;
  customer: CheckoutCustomerInfo;
  address: CheckoutAddressInfo;
  selectedZone: DeliveryZoneOption | null;
  totals: CheckoutTotals;
  paymentMethod: PaymentMethodType;
  paymentProof: PaymentProofState | null;
  transactionRefId: string;
}): CheckoutOrderPreview {
  const {
    items,
    giftWrap,
    coupon,
    customer,
    address,
    selectedZone,
    totals,
    paymentMethod,
    paymentProof,
    transactionRefId,
  } = params;

  const isCod = paymentMethod === 'cod';
  const cleanedRef = transactionRefId.trim();

  return {
    orderNumber: generateDemoOrderNumber(),
    createdAt: new Date().toISOString(),
    customer: {
      fullName: customer.fullName.trim(),
      mobile: customer.mobile.trim(),
      email: customer.email.trim(),
    },
    address: {
      country: address.country.trim(),
      city: address.city.trim(),
      province: address.province.trim(),
      area: address.area.trim(),
      streetAddress: address.streetAddress.trim(),
      postalCode: address.postalCode.trim(),
      deliveryInstructions: address.deliveryInstructions.trim(),
    },
    deliveryZoneName: selectedZone ? selectedZone.name : null,
    items: items.map((item) => ({ ...item })),
    giftWrap,
    coupon,
    itemSubtotal: totals.eligibleItemSubtotal,
    discountAmount: totals.validDiscount,
    deliveryFee: totals.deliveryFee,
    grandTotal: totals.grandTotal,
    paymentMethod,
    paymentStatus: isCod ? 'due_on_delivery' : 'awaiting_verification',
    statusLabel: isCod
      ? 'Unpaid / Pay on Delivery'
      : 'Payment Awaiting Verification',
    statusMessage: isCod
      ? 'Your order has been received. Payment is due on delivery.'
      : 'Your order has been received. Payment is awaiting verification.',
    transactionRefId: !isCod && cleanedRef ? cleanedRef : undefined,
    proofFileName: !isCod && paymentProof ? paymentProof.fileName : undefined,
    proofFileSize: !isCod && paymentProof ? paymentProof.fileSize : undefined,
    isDemoPreview: true,
  };
}

export interface PreparedCheckoutOrderPayload {
  customer: CheckoutCustomerInfo;
  address: CheckoutAddressInfo;
  deliveryZoneId: string;
  items: Array<{
    productId: string;
    slug: string;
    size: string;
    sku: string;
    quantity: number;
  }>;
  giftWrap: boolean;
  couponCode: string | null;
  paymentMethod: PaymentMethodType;
  transactionRefId?: string;
  /**
   * Uploaded through a private authenticated FormData multipart endpoint.
   * Never expose uploaded proof files via public image URLs.
   */
  hasPrivatePaymentProof: boolean;
  /** Advisory browser estimate only; backend must recompute authoritatively. */
  advisoryClientTotalPkr: number;
}

export function prepareCheckoutBackendPayload(params: {
  items: CartItem[];
  giftWrap: boolean;
  coupon: AppliedCoupon | null;
  customer: CheckoutCustomerInfo;
  address: CheckoutAddressInfo;
  deliveryZoneId: string;
  advisoryGrandTotal: number;
  paymentMethod: PaymentMethodType;
  hasPaymentProof: boolean;
  transactionRefId: string;
}): PreparedCheckoutOrderPayload {
  const cleanedRef = params.transactionRefId.trim();
  return {
    customer: {
      fullName: params.customer.fullName.trim(),
      mobile: params.customer.mobile.trim(),
      email: params.customer.email.trim(),
    },
    address: {
      country: params.address.country.trim(),
      city: params.address.city.trim(),
      province: params.address.province.trim(),
      area: params.address.area.trim(),
      streetAddress: params.address.streetAddress.trim(),
      postalCode: params.address.postalCode.trim(),
      deliveryInstructions: params.address.deliveryInstructions.trim(),
    },
    deliveryZoneId: params.deliveryZoneId,
    items: params.items.map((item) => ({
      productId: item.product.id,
      slug: item.product.slug,
      size: item.size,
      sku: item.sku,
      quantity: item.quantity,
    })),
    giftWrap: params.giftWrap,
    couponCode: params.coupon ? params.coupon.code : null,
    paymentMethod: params.paymentMethod,
    transactionRefId:
      params.paymentMethod !== 'cod' && cleanedRef ? cleanedRef : undefined,
    hasPrivatePaymentProof:
      params.paymentMethod !== 'cod' && params.hasPaymentProof,
    advisoryClientTotalPkr: params.advisoryGrandTotal,
  };
}
