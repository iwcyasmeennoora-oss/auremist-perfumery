import {
  AppliedCoupon,
  CartItem,
  CheckoutAddressInfo,
  CheckoutCustomerInfo,
  CheckoutOrderPreview,
  DeliveryZoneOption,
  PaymentMethodType,
  PaymentProofState,
  PreparedCheckoutOrderPayload,
} from '../types/perfume';
import { calculateCartTotals } from './cartPricing';
import {
  getActiveDeliveryZones,
  isCountrySupportedForDelivery,
  isProvinceSupportedForDelivery,
  isZoneCompatibleWithAddress,
  PAKISTAN_PROVINCES,
} from './shipping';

export type { PreparedCheckoutOrderPayload };
export { PAKISTAN_PROVINCES };

/**
 * Recipient mobile wallet number for manual Easypaisa & JazzCash transfers.
 */
export const WALLET_RECIPIENT_NUMBER = '+92 321 577 2078';

/**
 * Maximum allowed payment proof screenshot size (5 MB).
 */
export const MAX_PAYMENT_PROOF_BYTES = 5 * 1024 * 1024;

export function getConfiguredDeliveryZones(): DeliveryZoneOption[] {
  return getActiveDeliveryZones();
}

export interface CheckoutTotals {
  eligibleItemSubtotal: number;
  validDiscount: number;
  subtotalAfterDiscount: number;
  deliveryFee: number | null;
  grandTotal: number;
  hasCalculatedShipping: boolean;
}

/**
 * Grand Total = Eligible Item Subtotal - Valid Discount + Delivery Fee.
 * Shipping is added strictly once here when a valid delivery zone is selected.
 * Returns `deliveryFee: null` when delivery location/zone is missing or unsupported
 * so free delivery is never silently assumed.
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
  const safeSubtotal =
    Number.isFinite(itemSubtotal) && itemSubtotal >= 0 ? itemSubtotal : 0;
  const safeDiscount =
    Number.isFinite(discountAmount) && discountAmount >= 0
      ? Math.min(safeSubtotal, discountAmount)
      : 0;
  const subtotalAfterDiscount = Math.max(0, safeSubtotal - safeDiscount);

  const hasValidFee =
    selectedZone !== null &&
    typeof selectedZone.fee === 'number' &&
    Number.isFinite(selectedZone.fee) &&
    selectedZone.fee >= 0;

  const deliveryFee = hasValidFee ? Math.round(selectedZone.fee) : null;
  const grandTotal =
    deliveryFee !== null
      ? Math.max(0, subtotalAfterDiscount + deliveryFee)
      : subtotalAfterDiscount;

  return {
    eligibleItemSubtotal: safeSubtotal,
    validDiscount: safeDiscount,
    subtotalAfterDiscount,
    deliveryFee,
    grandTotal,
    hasCalculatedShipping: deliveryFee !== null,
  };
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
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
      error:
        'The selected file is empty. Please choose a valid JPG, JPEG, or PNG screenshot.',
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
    errors.cart =
      'Your shopping bag is empty. Add a fragrance before placing an order.';
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
    errors.country = 'Please enter your delivery country.';
  } else if (!isCountrySupportedForDelivery(address.country)) {
    errors.country =
      'Delivery is currently supported within Pakistan only. Please enter a valid delivery location in Pakistan.';
  }

  if (!address.province.trim()) {
    errors.province = 'Please select your province or territory.';
  } else if (!isProvinceSupportedForDelivery(address.province)) {
    errors.province = 'Please select a valid supported province or territory.';
  }

  if (!address.city.trim()) {
    errors.city =
      'Please enter your delivery city to calculate shipping charges.';
  }

  if (!address.area.trim()) {
    errors.area = 'Please enter your area, sector, or locality.';
  }

  if (!address.streetAddress.trim()) {
    errors.streetAddress =
      'Please enter your complete street address and house number.';
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
      'No active delivery zones are configured. Please configure delivery zones in Store Settings before placing an order.';
  } else if (!selectedZoneId) {
    errors.deliveryZone =
      'Please select a valid delivery zone for your location to calculate shipping charges.';
  } else {
    const matchedZone = configuredZones.find((z) => z.id === selectedZoneId);
    if (!matchedZone) {
      errors.deliveryZone =
        'Selected delivery zone is invalid or unavailable. Please choose a valid delivery zone.';
    } else if (!Number.isFinite(matchedZone.fee) || matchedZone.fee < 0) {
      errors.deliveryZone =
        'Shipping fee could not be calculated for the selected zone. Please choose another zone.';
    } else {
      const compatibility = isZoneCompatibleWithAddress(address, matchedZone);
      if (!compatibility.compatible) {
        errors.deliveryZone =
          compatibility.reason ??
          'Please select a delivery zone compatible with your entered delivery location.';
      }
    }
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
    suffix = String((((buf[0] << 16) | buf[1]) % 9000) + 1000);
  } else {
    suffix = String(Math.floor(1000 + Math.random() * 9000));
  }

  return `AUR-${y}${m}${d}-${suffix}`;
}

export function prepareCheckoutBackendPayload(params: {
  items: CartItem[];
  giftWrap: boolean;
  coupon: AppliedCoupon | null;
  customer: CheckoutCustomerInfo;
  address: CheckoutAddressInfo;
  selectedZone: DeliveryZoneOption;
  totals: CheckoutTotals;
  paymentMethod: PaymentMethodType;
  hasPaymentProof: boolean;
  transactionRefId: string;
}): PreparedCheckoutOrderPayload {
  const cleanedRef = params.transactionRefId.trim();
  const deliveryFeePkr =
    params.totals.deliveryFee !== null &&
    Number.isFinite(params.totals.deliveryFee)
      ? params.totals.deliveryFee
      : params.selectedZone.fee;

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
    deliveryZoneId: params.selectedZone.id,
    deliveryZoneName: params.selectedZone.name,
    items: params.items.map((item) => ({
      productId: item.product.id,
      slug: item.product.slug,
      size: item.size,
      sku: item.sku,
      quantity: item.quantity,
    })),
    giftWrap: params.giftWrap,
    couponCode: params.coupon ? params.coupon.code : null,
    itemSubtotalPkr: params.totals.eligibleItemSubtotal,
    discountAmountPkr: params.totals.validDiscount,
    deliveryFeePkr,
    paymentMethod: params.paymentMethod,
    transactionRefId:
      params.paymentMethod !== 'cod' && cleanedRef ? cleanedRef : undefined,
    hasPrivatePaymentProof:
      params.paymentMethod !== 'cod' && params.hasPaymentProof,
    advisoryClientTotalPkr: params.totals.grandTotal,
  };
}

export function buildOrderPreviewSnapshot(params: {
  items: CartItem[];
  giftWrap: boolean;
  coupon: AppliedCoupon | null;
  customer: CheckoutCustomerInfo;
  address: CheckoutAddressInfo;
  selectedZone: DeliveryZoneOption;
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
  const resolvedFee =
    totals.deliveryFee !== null && Number.isFinite(totals.deliveryFee)
      ? totals.deliveryFee
      : selectedZone.fee;
  const resolvedGrandTotal = Math.max(
    0,
    totals.eligibleItemSubtotal - totals.validDiscount + resolvedFee,
  );

  const backendOrderPayload = prepareCheckoutBackendPayload({
    items,
    giftWrap,
    coupon,
    customer,
    address,
    selectedZone,
    totals: {
      ...totals,
      deliveryFee: resolvedFee,
      grandTotal: resolvedGrandTotal,
    },
    paymentMethod,
    hasPaymentProof: Boolean(paymentProof),
    transactionRefId,
  });

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
    deliveryZoneId: selectedZone.id,
    deliveryZoneName: selectedZone.name,
    items: items.map((item) => ({ ...item })),
    giftWrap,
    coupon,
    itemSubtotal: totals.eligibleItemSubtotal,
    discountAmount: totals.validDiscount,
    deliveryFee: resolvedFee,
    grandTotal: resolvedGrandTotal,
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
    hasSubmittedProof: !isCod && Boolean(paymentProof),
    backendOrderPayload,
    isDemoPreview: true,
  };
}
