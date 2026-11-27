import { ALL_PERFUMES, formatPrice } from '../data/fragrances';
import {
  AppliedCoupon,
  BottleSize,
  CartItem,
  PerfumeProduct,
} from '../types/perfume';

const GUEST_CART_STORAGE_KEY = 'auremist_guest_cart_v1';

/**
 * Sample coupon definitions used solely to test UI state before backend integration.
 * Not active store promotions. Replace `validateDemoCoupon` with an authenticated
 * backend API request (`POST /api/coupons/validate`) when checkout is connected.
 */
export const DEMO_COUPONS: Record<string, AppliedCoupon> = {
  WELCOME10: {
    code: 'WELCOME10',
    label: '10% Preview Test (Unverified)',
    type: 'percentage',
    value: 10,
  },
  AUREMIST200: {
    code: 'AUREMIST200',
    label: 'Rs. 200 Preview Test (Unverified)',
    type: 'fixed',
    value: 200,
  },
};

export interface CouponValidationRequest {
  code: string;
  itemSubtotal: number;
}

export interface CouponValidationResult {
  ok: boolean;
  verified: boolean;
  coupon?: AppliedCoupon;
  message: string;
}

/**
 * Future backend integration seam:
 * Replace this synchronous preview check with `async function validateCouponOnServer(req: CouponValidationRequest): Promise<CouponValidationResult>`.
 */
export function validateDemoCoupon(
  rawCode: string,
  currentCoupon: AppliedCoupon | null,
): CouponValidationResult {
  const normalized = rawCode.trim().toUpperCase();

  if (!normalized) {
    return {
      ok: false,
      verified: false,
      message: 'Please enter a coupon code before applying.',
    };
  }

  if (!/^[A-Z0-9_-]{3,24}$/.test(normalized)) {
    return {
      ok: false,
      verified: false,
      message:
        'Coupon codes may only contain letters, numbers, hyphens, or underscores.',
    };
  }

  if (currentCoupon && currentCoupon.code === normalized) {
    return {
      ok: false,
      verified: false,
      message: `Code ${normalized} is already applied to your shopping bag.`,
    };
  }

  if (currentCoupon && currentCoupon.code !== normalized) {
    return {
      ok: false,
      verified: false,
      message: `Only one coupon may be applied at a time. Remove ${currentCoupon.code} first.`,
    };
  }

  const matched = DEMO_COUPONS[normalized];
  if (!matched) {
    return {
      ok: false,
      verified: false,
      message: `Code "${normalized}" could not be verified. Live promotional codes require backend validation once checkout launches.`,
    };
  }

  return {
    ok: true,
    verified: false,
    coupon: matched,
    message:
      matched.type === 'percentage'
        ? `Preview test code ${matched.code} applied (${matched.value}% preview deduction; not an active promotion until backend-verified).`
        : `Preview test code ${matched.code} applied (${formatPrice(matched.value)} preview deduction; not an active promotion until backend-verified).`,
  };
}

export function getVariantStockCount(
  product: PerfumeProduct,
  size: BottleSize,
): number {
  if (!product.inStock) return 0;
  const variant = product.variants.find((v) => v.size === size);
  return variant ? variant.stockCount : 0;
}

export interface CartTotals {
  itemSubtotal: number;
  discountAmount: number;
  grandTotal: number;
}

export function calculateCartTotals(
  items: CartItem[],
  appliedCoupon: AppliedCoupon | null,
): CartTotals {
  const itemSubtotal = items.reduce((sum, item) => {
    const unit =
      Number.isFinite(item.unitPrice) && item.unitPrice >= 0
        ? item.unitPrice
        : 0;
    const qty =
      Number.isFinite(item.quantity) && item.quantity > 0
        ? Math.floor(item.quantity)
        : 0;
    return sum + unit * qty;
  }, 0);

  if (itemSubtotal <= 0 || !appliedCoupon) {
    return {
      itemSubtotal,
      discountAmount: 0,
      grandTotal: itemSubtotal,
    };
  }

  const couponVal =
    Number.isFinite(appliedCoupon.value) && appliedCoupon.value > 0
      ? appliedCoupon.value
      : 0;

  const rawDiscount =
    appliedCoupon.type === 'percentage'
      ? Math.round((itemSubtotal * couponVal) / 100)
      : Math.round(couponVal);

  const discountAmount = Math.min(itemSubtotal, Math.max(0, rawDiscount));
  const grandTotal = Math.max(0, itemSubtotal - discountAmount);

  return {
    itemSubtotal,
    discountAmount,
    grandTotal,
  };
}

interface StoredCartEntry {
  productId: string;
  size: BottleSize;
  quantity: number;
}

interface StoredGuestCart {
  items: StoredCartEntry[];
  giftWrap: boolean;
  couponCode: string | null;
}

export interface HydratedGuestCart {
  items: CartItem[];
  giftWrap: boolean;
  appliedCoupon: AppliedCoupon | null;
}

export function loadGuestCart(): HydratedGuestCart {
  const fallback: HydratedGuestCart = {
    items: [],
    giftWrap: true,
    appliedCoupon: null,
  };

  try {
    const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<StoredGuestCart>;
    const hydratedItems: CartItem[] = [];

    if (Array.isArray(parsed.items)) {
      for (const entry of parsed.items) {
        const product = ALL_PERFUMES.find((p) => p.id === entry.productId);
        if (!product || !product.inStock) continue;

        const variant = product.variants.find((v) => v.size === entry.size);
        if (!variant || variant.stockCount <= 0) continue;

        const safeQty = Math.min(
          variant.stockCount,
          Math.max(1, Math.floor(Number(entry.quantity) || 1)),
        );

        hydratedItems.push({
          product,
          size: variant.size,
          unitPrice: variant.price,
          sku: variant.sku,
          quantity: safeQty,
        });
      }
    }

    const couponCode =
      typeof parsed.couponCode === 'string'
        ? parsed.couponCode.toUpperCase()
        : null;
    const appliedCoupon =
      hydratedItems.length > 0 && couponCode && DEMO_COUPONS[couponCode]
        ? DEMO_COUPONS[couponCode]
        : null;

    return {
      items: hydratedItems,
      giftWrap: typeof parsed.giftWrap === 'boolean' ? parsed.giftWrap : true,
      appliedCoupon,
    };
  } catch {
    return fallback;
  }
}

export function saveGuestCart(
  items: CartItem[],
  giftWrap: boolean,
  appliedCoupon: AppliedCoupon | null,
): void {
  try {
    const payload: StoredGuestCart = {
      items: items.map((item) => ({
        productId: item.product.id,
        size: item.size,
        quantity: item.quantity,
      })),
      giftWrap,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
    };
    window.localStorage.setItem(
      GUEST_CART_STORAGE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // Ignore storage quota or private browsing errors gracefully
  }
}
