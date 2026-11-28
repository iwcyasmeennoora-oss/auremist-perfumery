import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey: string | null = null;

export interface ServerCatalogProductRow {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  full_description: string | null;
  category: string;
  audience_category: string;
  fragrance_family: string;
  concentration: string;
  concentration_percent: string;
  label: string;
  default_size: string;
  price_pkr: number;
  original_price_pkr: number | null;
  in_stock: boolean;
  is_active: boolean;
  featured_rank: number;
  newest_rank: number;
}

export interface ServerCatalogVariantRow {
  id: string;
  product_id: string;
  bottle_size: '30ml' | '50ml' | '100ml';
  sku: string;
  price_pkr: number;
  original_price_pkr: number | null;
  stock_count: number;
  is_active: boolean;
}

export interface ServerDeliveryZoneRow {
  id: string;
  name: string;
  region: string;
  fee_pkr: number;
  estimated_window: string | null;
  supported_provinces: string[] | null;
  priority_cities: string[] | null;
  is_nationwide_fallback: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface SupabaseConnectionTestResult {
  ok: boolean;
  configured: boolean;
  message: string;
  counts?: {
    products: number;
    productVariants: number;
    deliveryZones: number;
  };
}

export interface CreateOrderRequestBody {
  idempotencyKey?: string;
  customer?: {
    fullName?: string;
    mobile?: string;
    email?: string;
  };
  address?: {
    country?: string;
    province?: string;
    city?: string;
    area?: string;
    streetAddress?: string;
    postalCode?: string;
    deliveryInstructions?: string;
  };
  deliveryZoneId?: string;
  giftWrap?: boolean;
  couponCode?: string | null;
  items?: Array<{
    productId?: string;
    size?: string;
    quantity?: number;
  }>;
  paymentMethod?: string;
  transactionRefId?: string;
  paymentProof?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    base64Data?: string;
  } | null;
}

export type ServerOrderCreateResult =
  | {
      ok: true;
      statusCode: number;
      orderId: string;
      orderNumber: string;
      createdAt: string;
      itemSubtotal: number;
      discountAmount: number;
      deliveryFee: number;
      grandTotal: number;
      deliveryZoneId: string;
      deliveryZoneName: string;
      coupon: {
        code: string;
        label: string;
        type: 'percentage' | 'fixed';
        value: number;
      } | null;
      paymentProofPath: string | null;
      items: Array<{
        productId: string;
        productSlug: string;
        productName: string;
        size: '30ml' | '50ml' | '100ml';
        sku: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
      }>;
    }
  | {
      ok: false;
      statusCode: number;
      message: string;
      isMissingSchema?: boolean;
    };

const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Islamabad Capital Territory',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan',
] as const;

const SERVER_COUPON_DEFINITIONS: Record<
  string,
  {
    code: string;
    label: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderPkr: number;
    expiresAt: string;
  }
> = {
  WELCOME10: {
    code: 'WELCOME10',
    label: '10% Preview Test (Verified)',
    type: 'percentage',
    value: 10,
    minOrderPkr: 3000,
    expiresAt: '2026-12-31',
  },
  AUREMIST200: {
    code: 'AUREMIST200',
    label: 'Rs. 200 Preview Test (Verified)',
    type: 'fixed',
    value: 200,
    minOrderPkr: 2500,
    expiresAt: '2026-12-31',
  },
};

const MAX_PAYMENT_PROOF_BYTES = 5 * 1024 * 1024;
const idempotencyCache = new Map<
  string,
  { expiresAt: number; result: ServerOrderCreateResult }
>();

export function normalizeSupabaseUrl(rawUrl: string | undefined): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const stripped = trimmed.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  try {
    const parsed = new URL(stripped);
    const isLocalhost =
      parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    if (
      parsed.protocol !== 'https:' &&
      !(isLocalhost && parsed.protocol === 'http:')
    ) {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

function getServerSupabaseEnv(): {
  url: string | null;
  key: string | null;
  hasServiceRole: boolean;
} {
  const url = normalizeSupabaseUrl(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  );
  const rawKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  const key =
    typeof rawKey === 'string' && rawKey.trim().length > 0
      ? rawKey.trim()
      : null;

  const hasServiceRole =
    typeof process.env.SUPABASE_SERVICE_ROLE_KEY === 'string' &&
    process.env.SUPABASE_SERVICE_ROLE_KEY.trim().length > 0;

  return { url, key, hasServiceRole };
}

export function isServerSupabaseConfigured(): boolean {
  const { url, key } = getServerSupabaseEnv();
  return Boolean(url && key);
}

export function getServerSupabaseClient(): SupabaseClient | null {
  const { url, key } = getServerSupabaseEnv();
  if (!url || !key) return null;

  const configKey = `${url}::${key.slice(0, 12)}`;
  if (cachedClient && cachedConfigKey === configKey) {
    return cachedClient;
  }

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  cachedConfigKey = configKey;
  return cachedClient;
}

export async function testServerSupabaseConnection(): Promise<SupabaseConnectionTestResult> {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      configured: false,
      message:
        'Supabase environment variables SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are not configured on the server.',
    };
  }

  const [productsRes, variantsRes, zonesRes] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase
      .from('product_variants')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('delivery_zones')
      .select('id', { count: 'exact', head: true }),
  ]);

  const firstError =
    productsRes.error || variantsRes.error || zonesRes.error;
  if (firstError) {
    return {
      ok: false,
      configured: true,
      message: firstError.message || 'Failed to query Supabase tables.',
    };
  }

  return {
    ok: true,
    configured: true,
    message: 'Connected to Supabase via server environment variables.',
    counts: {
      products: productsRes.count ?? 0,
      productVariants: variantsRes.count ?? 0,
      deliveryZones: zonesRes.count ?? 0,
    },
  };
}

export async function fetchCatalogAndZonesFromSupabase(): Promise<{
  ok: boolean;
  configured: boolean;
  products: ServerCatalogProductRow[];
  variants: ServerCatalogVariantRow[];
  deliveryZones: ServerDeliveryZoneRow[];
  message?: string;
}> {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      configured: false,
      products: [],
      variants: [],
      deliveryZones: [],
      message: 'Supabase server environment variables are not configured.',
    };
  }

  const [productsRes, variantsRes, zonesRes] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, slug, name, subtitle, description, full_description, category, audience_category, fragrance_family, concentration, concentration_percent, label, default_size, price_pkr, original_price_pkr, in_stock, is_active, featured_rank, newest_rank',
      )
      .eq('is_active', true)
      .order('featured_rank', { ascending: true }),
    supabase
      .from('product_variants')
      .select(
        'id, product_id, bottle_size, sku, price_pkr, original_price_pkr, stock_count, is_active',
      )
      .eq('is_active', true),
    supabase
      .from('delivery_zones')
      .select(
        'id, name, region, fee_pkr, estimated_window, supported_provinces, priority_cities, is_nationwide_fallback, is_active, sort_order',
      )
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  const err = productsRes.error || variantsRes.error || zonesRes.error;
  if (err) {
    return {
      ok: false,
      configured: true,
      products: [],
      variants: [],
      deliveryZones: [],
      message: err.message,
    };
  }

  return {
    ok: true,
    configured: true,
    products: (productsRes.data ?? []) as ServerCatalogProductRow[],
    variants: (variantsRes.data ?? []) as ServerCatalogVariantRow[],
    deliveryZones: (zonesRes.data ?? []) as ServerDeliveryZoneRow[],
  };
}

function sanitizeStorageFileName(fileName: string): string {
  const cleaned = fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');
  return cleaned.slice(-80) || 'payment_proof.png';
}

function generateServerOrderNumber(): string {
  const nowPk = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }),
  );
  const y = nowPk.getFullYear();
  const m = String(nowPk.getMonth() + 1).padStart(2, '0');
  const d = String(nowPk.getDate()).padStart(2, '0');
  const rand = crypto.randomInt(1000, 10000);
  return `AUR-${y}${m}${d}-${rand}`;
}

function verifyImageBuffer(
  buffer: Buffer,
  declaredMime: string,
): boolean {
  if (buffer.length <= 0 || buffer.length > MAX_PAYMENT_PROOF_BYTES) {
    return false;
  }
  if (declaredMime === 'image/jpeg') {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }
  if (declaredMime === 'image/png') {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }
  return false;
}

function normalizeProvince(raw: string): string | null {
  const lower = raw.trim().toLowerCase();
  const matched = PAKISTAN_PROVINCES.find((p) => p.toLowerCase() === lower);
  return matched ?? null;
}

function isZoneCompatible(
  province: string,
  city: string,
  zone: ServerDeliveryZoneRow,
): { compatible: boolean; reason?: string } {
  const cityNorm = city.trim().toLowerCase();
  if (zone.priority_cities && zone.priority_cities.length > 0) {
    const matchesCity = zone.priority_cities.some((target) => {
      const t = target.toLowerCase();
      return cityNorm === t || cityNorm.startsWith(`${t} `) || cityNorm.includes(t);
    });
    if (!matchesCity) {
      return {
        compatible: false,
        reason: `${zone.name} applies to ${zone.region} and does not cover ${city}.`,
      };
    }
  }

  if (zone.supported_provinces && zone.supported_provinces.length > 0) {
    const matchesProvince = zone.supported_provinces.some(
      (p) => p.toLowerCase() === province.toLowerCase(),
    );
    if (!matchesProvince) {
      return {
        compatible: false,
        reason: `${zone.name} does not cover ${province}.`,
      };
    }
  }

  return { compatible: true };
}

function evaluateCouponForSubtotal(
  rawCode: string | null | undefined,
  itemSubtotalPkr: number,
):
  | {
      ok: true;
      coupon: {
        code: string;
        label: string;
        type: 'percentage' | 'fixed';
        value: number;
      } | null;
      discountAmountPkr: number;
    }
  | { ok: false; message: string } {
  if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
    return { ok: true, coupon: null, discountAmountPkr: 0 };
  }

  const normalized = rawCode.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,24}$/.test(normalized)) {
    return { ok: false, message: 'Invalid coupon code format.' };
  }

  const matched = SERVER_COUPON_DEFINITIONS[normalized];
  if (!matched) {
    return {
      ok: false,
      message: `Coupon code "${normalized}" is invalid or unavailable.`,
    };
  }

  const pkToday = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Karachi',
  });
  if (matched.expiresAt && pkToday > matched.expiresAt) {
    return {
      ok: false,
      message: `Coupon code "${normalized}" has expired.`,
    };
  }

  if (itemSubtotalPkr < matched.minOrderPkr) {
    return {
      ok: false,
      message: `Coupon code ${normalized} requires a minimum subtotal of Rs. ${matched.minOrderPkr}.`,
    };
  }

  const rawDiscount =
    matched.type === 'percentage'
      ? Math.round((itemSubtotalPkr * matched.value) / 100)
      : Math.round(matched.value);
  const discountAmountPkr = Math.min(itemSubtotalPkr, Math.max(0, rawDiscount));

  return {
    ok: true,
    coupon: {
      code: matched.code,
      label: matched.label,
      type: matched.type,
      value: matched.value,
    },
    discountAmountPkr,
  };
}

function formatSupabaseErrorMessage(error: {
  code?: string;
  message?: string;
}): { message: string; isMissingSchema: boolean } {
  const code = error.code ?? '';
  const rawMessage = error.message ?? '';

  if (code === 'PGRST205' || /could not find the table/i.test(rawMessage)) {
    return {
      isMissingSchema: true,
      message:
        'Your Supabase project is connected, but the orders table has not been created yet. Please run supabase/schema.sql in your Supabase SQL Editor.',
    };
  }

  if (code === '42501' || /row-level security/i.test(rawMessage)) {
    return {
      isMissingSchema: false,
      message:
        'Database permission check prevented saving the order. Please verify your Supabase RLS policies.',
    };
  }

  if (code === '23505') {
    return {
      isMissingSchema: false,
      message:
        'A duplicate order reference occurred. Please click Confirm Order once more.',
    };
  }

  return {
    isMissingSchema: false,
    message:
      rawMessage ||
      'Unable to save your order to Supabase right now. Please try again.',
  };
}

export async function createOrderViaServerSupabase(
  body: CreateOrderRequestBody,
): Promise<ServerOrderCreateResult> {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      statusCode: 503,
      message:
        'Supabase is not configured on the server. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.',
    };
  }

  // Deduplicate rapid retries on matching idempotencyKey
  const nowMs = Date.now();
  for (const [k, v] of idempotencyCache.entries()) {
    if (v.expiresAt <= nowMs) {
      idempotencyCache.delete(k);
    }
  }
  const rawIdemp =
    typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim() : '';
  if (rawIdemp) {
    const cached = idempotencyCache.get(rawIdemp);
    if (cached && cached.expiresAt > nowMs) {
      return cached.result;
    }
  }

  const fullName = body.customer?.fullName?.trim() ?? '';
  const mobile = body.customer?.mobile?.trim() ?? '';
  const email = body.customer?.email?.trim().toLowerCase() ?? '';
  const normalizedPhone = mobile.replace(/[\s()-]/g, '');

  if (fullName.length < 2 || fullName.length > 120) {
    return {
      ok: false,
      statusCode: 400,
      message: 'Please enter a valid full name.',
    };
  }
  if (!/^\+?\d{10,15}$/.test(normalizedPhone)) {
    return {
      ok: false,
      statusCode: 400,
      message: 'Please enter a valid Pakistani mobile number.',
    };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return {
      ok: false,
      statusCode: 400,
      message: 'Please enter a valid email address.',
    };
  }

  const countryRaw = (body.address?.country ?? '').trim().toLowerCase();
  if (countryRaw !== 'pakistan' && countryRaw !== 'pk') {
    return {
      ok: false,
      statusCode: 400,
      message: 'Delivery is currently supported within Pakistan only.',
    };
  }

  const province = normalizeProvince(body.address?.province ?? '');
  if (!province) {
    return {
      ok: false,
      statusCode: 400,
      message: 'Please select a valid province or territory.',
    };
  }

  const city = (body.address?.city ?? '').trim();
  const area = (body.address?.area ?? '').trim();
  const streetAddress = (body.address?.streetAddress ?? '').trim();
  const postalCode = (body.address?.postalCode ?? '').trim();
  const deliveryInstructions =
    (body.address?.deliveryInstructions ?? '').trim().slice(0, 500) || null;

  if (city.length < 2 || !area || streetAddress.length < 5) {
    return {
      ok: false,
      statusCode: 400,
      message: 'Please complete all required delivery address fields.',
    };
  }
  if (!/^[A-Za-z0-9 -]{3,12}$/.test(postalCode)) {
    return {
      ok: false,
      statusCode: 400,
      message: 'Please enter a valid postal code.',
    };
  }

  const zoneId = (body.deliveryZoneId ?? '').trim();
  if (!zoneId) {
    return {
      ok: false,
      statusCode: 400,
      message: 'Please select a delivery zone to calculate shipping charges.',
    };
  }

  const paymentMethod = (body.paymentMethod ?? '').trim().toLowerCase();
  if (
    paymentMethod !== 'cod' &&
    paymentMethod !== 'easypaisa' &&
    paymentMethod !== 'jazzcash'
  ) {
    return {
      ok: false,
      statusCode: 400,
      message: 'Unsupported payment method.',
    };
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0 || rawItems.length > 50) {
    return {
      ok: false,
      statusCode: 400,
      message: 'Your shopping bag must contain at least one item.',
    };
  }

  const aggregated = new Map<
    string,
    { productId: string; size: '30ml' | '50ml' | '100ml'; quantity: number }
  >();

  for (const item of rawItems) {
    const productId = typeof item.productId === 'string' ? item.productId.trim() : '';
    const size = item.size;
    const qty = Number(item.quantity);
    if (
      !productId ||
      (size !== '30ml' && size !== '50ml' && size !== '100ml') ||
      !Number.isInteger(qty) ||
      qty <= 0 ||
      qty > 50
    ) {
      return {
        ok: false,
        statusCode: 400,
        message: 'Invalid fragrance, bottle size, or quantity in order items.',
      };
    }
    const key = `${productId}::${size}`;
    const prev = aggregated.get(key);
    const nextQty = (prev?.quantity ?? 0) + qty;
    if (nextQty > 50) {
      return {
        ok: false,
        statusCode: 400,
        message: 'Maximum quantity per item exceeded.',
      };
    }
    aggregated.set(key, { productId, size, quantity: nextQty });
  }

  // Fetch authoritative catalog, variants, and delivery zone from Supabase
  const productIds = Array.from(
    new Set(Array.from(aggregated.values()).map((i) => i.productId)),
  );

  const [productsRes, variantsRes, zoneRes] = await Promise.all([
    supabase
      .from('products')
      .select('id, slug, name, in_stock, is_active')
      .in('id', productIds),
    supabase
      .from('product_variants')
      .select('id, product_id, bottle_size, sku, price_pkr, stock_count, is_active')
      .in('product_id', productIds),
    supabase
      .from('delivery_zones')
      .select('*')
      .eq('id', zoneId)
      .eq('is_active', true)
      .maybeSingle(),
  ]);

  if (productsRes.error || variantsRes.error || zoneRes.error) {
    const err = productsRes.error || variantsRes.error || zoneRes.error;
    return {
      ok: false,
      statusCode: 502,
      message: err?.message || 'Unable to verify catalog and shipping rates from Supabase.',
    };
  }

  const zone = zoneRes.data as ServerDeliveryZoneRow | null;
  if (!zone || !Number.isFinite(zone.fee_pkr) || zone.fee_pkr < 0) {
    return {
      ok: false,
      statusCode: 400,
      message: 'Selected delivery zone is invalid or inactive.',
    };
  }

  const zoneCompatibility = isZoneCompatible(province, city, zone);
  if (!zoneCompatibility.compatible) {
    return {
      ok: false,
      statusCode: 400,
      message: zoneCompatibility.reason || 'Selected delivery zone does not cover your city.',
    };
  }

  const productMap = new Map(
    (productsRes.data ?? []).map((p) => [p.id as string, p]),
  );
  const variantMap = new Map(
    (variantsRes.data ?? []).map((v) => [
      `${v.product_id as string}::${v.bottle_size as string}`,
      v,
    ]),
  );

  let itemSubtotalPkr = 0;
  const verifiedItems: Array<{
    productId: string;
    productSlug: string;
    productName: string;
    size: '30ml' | '50ml' | '100ml';
    sku: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }> = [];

  for (const entry of aggregated.values()) {
    const prod = productMap.get(entry.productId);
    const variant = variantMap.get(`${entry.productId}::${entry.size}`);

    if (!prod || !prod.is_active || !variant || !variant.is_active) {
      return {
        ok: false,
        statusCode: 400,
        message: 'One or more selected fragrances are unavailable.',
      };
    }

    if (!prod.in_stock || Number(variant.stock_count) <= 0) {
      return {
        ok: false,
        statusCode: 400,
        message: `${prod.name} (${entry.size}) is currently out of stock.`,
      };
    }

    if (Number(variant.stock_count) < entry.quantity) {
      return {
        ok: false,
        statusCode: 400,
        message: `Only ${variant.stock_count} bottle(s) of ${prod.name} (${entry.size}) remaining in stock.`,
      };
    }

    const unitPrice = Math.round(Number(variant.price_pkr));
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return {
        ok: false,
        statusCode: 500,
        message: `Invalid catalog price configured for ${prod.name}.`,
      };
    }

    const lineTotal = unitPrice * entry.quantity;
    itemSubtotalPkr += lineTotal;

    verifiedItems.push({
      productId: prod.id as string,
      productSlug: prod.slug as string,
      productName: prod.name as string,
      size: entry.size,
      sku: variant.sku as string,
      quantity: entry.quantity,
      unitPrice,
      lineTotal,
    });
  }

  const couponEval = evaluateCouponForSubtotal(body.couponCode, itemSubtotalPkr);
  if (!couponEval.ok) {
    return {
      ok: false,
      statusCode: 400,
      message: couponEval.message,
    };
  }

  const discountAmountPkr = couponEval.discountAmountPkr;
  const deliveryFeePkr = Math.round(Number(zone.fee_pkr));
  const grandTotalPkr = Math.max(
    0,
    itemSubtotalPkr - discountAmountPkr + deliveryFeePkr,
  );

  // Payment proof handling for manual Easypaisa / JazzCash transfers
  const isManualTransfer = paymentMethod !== 'cod';
  let uploadedProofPath: string | null = null;
  let proofFileName: string | null = null;
  let proofFileSize: number | null = null;
  let proofMimeType: string | null = null;

  const orderId = crypto.randomUUID();
  const orderNumber = generateServerOrderNumber();
  const createdAt = new Date().toISOString();

  if (isManualTransfer) {
    const proof = body.paymentProof;
    if (
      !proof ||
      typeof proof.base64Data !== 'string' ||
      typeof proof.mimeType !== 'string' ||
      (proof.mimeType !== 'image/jpeg' && proof.mimeType !== 'image/png')
    ) {
      return {
        ok: false,
        statusCode: 400,
        message:
          'Please upload your Easypaisa/JazzCash payment screenshot (JPG or PNG) before confirming.',
      };
    }

    const cleanBase64 = proof.base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    if (!verifyImageBuffer(buffer, proof.mimeType)) {
      return {
        ok: false,
        statusCode: 400,
        message:
          'Invalid payment proof image. Only valid JPG or PNG screenshots up to 5 MB are accepted.',
      };
    }

    const safeName = sanitizeStorageFileName(proof.fileName || 'payment_proof.png');
    const storagePath = `orders/${orderNumber}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(storagePath, buffer, {
        contentType: proof.mimeType,
        upsert: false,
      });

    if (uploadError) {
      return {
        ok: false,
        statusCode: 500,
        message: /bucket not found/i.test(uploadError.message)
          ? 'Payment proof storage bucket ("payment-proofs") is not set up in Supabase.'
          : `Could not upload payment proof screenshot: ${uploadError.message}`,
      };
    }

    uploadedProofPath = storagePath;
    proofFileName = (proof.fileName || safeName).slice(0, 160);
    proofFileSize = buffer.length;
    proofMimeType = proof.mimeType;
  }

  const serializedItems = verifiedItems.map((item) => ({
    product_id: item.productId,
    product_slug: item.productSlug,
    product_name: item.productName,
    bottle_size: item.size,
    sku: item.sku,
    quantity: item.quantity,
    unit_price_pkr: item.unitPrice,
    line_total_pkr: item.lineTotal,
  }));

  const formattedAddress = [
    streetAddress,
    area,
    city,
    province,
    'Pakistan',
    postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  const productSummary = verifiedItems
    .map((item) => `${item.productName} (${item.size} x ${item.quantity})`)
    .join(', ');

  const txRefId =
    isManualTransfer && typeof body.transactionRefId === 'string'
      ? body.transactionRefId.trim().slice(0, 100) || null
      : null;

  const orderRow = {
    id: orderId,
    order_number: orderNumber,
    name: fullName,
    email,
    mobile,
    address: formattedAddress,
    product: productSummary,
    total_amount: grandTotalPkr,
    date: createdAt,
    country: 'Pakistan',
    province,
    city,
    area,
    street_address: streetAddress,
    postal_code: postalCode,
    delivery_instructions: deliveryInstructions,
    delivery_zone_id: zone.id,
    delivery_zone_name: zone.name,
    gift_wrap: Boolean(body.giftWrap),
    coupon_code: couponEval.coupon ? couponEval.coupon.code : null,
    coupon_label: couponEval.coupon ? couponEval.coupon.label : null,
    item_subtotal_pkr: itemSubtotalPkr,
    discount_amount_pkr: discountAmountPkr,
    delivery_fee_pkr: deliveryFeePkr,
    payment_method: paymentMethod,
    payment_status: isManualTransfer
      ? 'awaiting_verification'
      : 'due_on_delivery',
    order_status: isManualTransfer ? 'pending_verification' : 'order_received',
    transaction_ref_id: txRefId,
    has_payment_proof: Boolean(isManualTransfer && uploadedProofPath),
    payment_proof_path: uploadedProofPath,
    payment_proof_file_name: proofFileName,
    payment_proof_file_size: proofFileSize,
    payment_proof_mime_type: proofMimeType,
    items: serializedItems,
  };

  const { error: orderInsertError } = await supabase
    .from('orders')
    .insert(orderRow);

  if (orderInsertError) {
    const formatted = formatSupabaseErrorMessage(orderInsertError);
    return {
      ok: false,
      statusCode: formatted.isMissingSchema ? 500 : 400,
      message: formatted.message,
      isMissingSchema: formatted.isMissingSchema,
    };
  }

  const orderItemsRows = serializedItems.map((item) => ({
    order_id: orderId,
    order_number: orderNumber,
    ...item,
  }));

  await supabase.from('order_items').insert(orderItemsRows);

  const successResult: ServerOrderCreateResult = {
    ok: true,
    statusCode: 201,
    orderId,
    orderNumber,
    createdAt,
    itemSubtotal: itemSubtotalPkr,
    discountAmount: discountAmountPkr,
    deliveryFee: deliveryFeePkr,
    grandTotal: grandTotalPkr,
    deliveryZoneId: zone.id,
    deliveryZoneName: zone.name,
    coupon: couponEval.coupon,
    paymentProofPath: uploadedProofPath,
    items: verifiedItems,
  };

  if (rawIdemp) {
    idempotencyCache.set(rawIdemp, {
      expiresAt: Date.now() + 10 * 60 * 1000,
      result: successResult,
    });
  }

  return successResult;
}
