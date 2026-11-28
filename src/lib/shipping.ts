import {
  AdminDeliveryZoneSetting,
  AdminOrderRecord,
  AdminStoreSettings,
} from '../types/admin';
import {
  CheckoutOrderPreview,
  DeliveryZoneOption,
} from '../types/perfume';

const STORE_SETTINGS_STORAGE_KEY = 'auremist_store_settings_v1';
const PLACED_ORDERS_STORAGE_KEY = 'auremist_placed_orders_v1';

export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Islamabad Capital Territory',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan',
] as const;

export const DEFAULT_DELIVERY_ZONES: AdminDeliveryZoneSetting[] = [
  {
    id: 'zone-lahore-urban',
    name: 'Lahore Urban Courier',
    region: 'Lahore, Punjab',
    feePkr: 200,
    estimatedWindow: '1–2 business days',
    active: true,
  },
  {
    id: 'zone-karachi-metro',
    name: 'Karachi Metro Express',
    region: 'Karachi, Sindh',
    feePkr: 250,
    estimatedWindow: '1–2 business days',
    active: true,
  },
  {
    id: 'zone-islamabad-rawalpindi',
    name: 'Islamabad / Rawalpindi Courier',
    region: 'Islamabad & Rawalpindi',
    feePkr: 250,
    estimatedWindow: '1–2 business days',
    active: true,
  },
  {
    id: 'zone-nationwide-standard',
    name: 'Nationwide Standard Courier',
    region: 'All Other Cities Across Pakistan',
    feePkr: 350,
    estimatedWindow: '3–5 business days',
    active: true,
  },
];

function inferZoneMetadata(
  zone: AdminDeliveryZoneSetting,
): Pick<
  DeliveryZoneOption,
  'supportedProvinces' | 'priorityCities' | 'isNationwideFallback'
> {
  const id = zone.id.toLowerCase();
  const haystack = `${zone.name} ${zone.region}`.toLowerCase();

  if (id === 'zone-lahore-urban' || haystack.includes('lahore')) {
    return {
      supportedProvinces: ['Punjab'],
      priorityCities: ['lahore'],
      isNationwideFallback: false,
    };
  }
  if (id === 'zone-karachi-metro' || haystack.includes('karachi')) {
    return {
      supportedProvinces: ['Sindh'],
      priorityCities: ['karachi'],
      isNationwideFallback: false,
    };
  }
  if (
    id === 'zone-islamabad-rawalpindi' ||
    haystack.includes('islamabad') ||
    haystack.includes('rawalpindi')
  ) {
    return {
      supportedProvinces: ['Islamabad Capital Territory', 'Punjab'],
      priorityCities: ['islamabad', 'rawalpindi'],
      isNationwideFallback: false,
    };
  }
  if (
    id === 'zone-nationwide-standard' ||
    haystack.includes('nationwide') ||
    haystack.includes('pakistan') ||
    haystack.includes('all cities')
  ) {
    return {
      supportedProvinces: [...PAKISTAN_PROVINCES],
      priorityCities: [],
      isNationwideFallback: true,
    };
  }

  return {
    supportedProvinces: [...PAKISTAN_PROVINCES],
    priorityCities: [],
    isNationwideFallback: false,
  };
}

export function mapAdminZonesToOptions(
  zones: AdminDeliveryZoneSetting[],
): DeliveryZoneOption[] {
  return zones
    .filter(
      (z) =>
        z.active &&
        Number.isFinite(z.feePkr) &&
        z.feePkr >= 0 &&
        z.name.trim().length > 0,
    )
    .map((z) => ({
      id: z.id,
      name: z.name.trim(),
      region: z.region.trim(),
      fee: Math.round(z.feePkr),
      estimatedWindow: z.estimatedWindow.trim() || undefined,
      ...inferZoneMetadata(z),
    }));
}

export function loadStoreSettingsFromStorage(
  fallback: AdminStoreSettings,
): AdminStoreSettings {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORE_SETTINGS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AdminStoreSettings>;
    if (!parsed || typeof parsed !== 'object') return fallback;

    const deliveryZones = Array.isArray(parsed.deliveryZones)
      ? parsed.deliveryZones.filter(
          (z): z is AdminDeliveryZoneSetting =>
            Boolean(z) &&
            typeof z.id === 'string' &&
            typeof z.name === 'string' &&
            typeof z.region === 'string' &&
            typeof z.feePkr === 'number' &&
            Number.isFinite(z.feePkr) &&
            z.feePkr >= 0 &&
            typeof z.active === 'boolean',
        )
      : fallback.deliveryZones;

    return {
      ...fallback,
      ...parsed,
      deliveryZones,
    };
  } catch {
    return fallback;
  }
}

export function saveStoreSettingsToStorage(
  settings: AdminStoreSettings,
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORE_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings),
    );
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

let liveServerDeliveryZones: DeliveryZoneOption[] | null = null;

export function setServerDeliveryZones(zones: DeliveryZoneOption[] | null): void {
  liveServerDeliveryZones =
    zones && zones.length > 0 ? zones : null;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auremist:delivery-zones-updated'));
  }
}

export function getActiveDeliveryZones(): DeliveryZoneOption[] {
  const defaultZones =
    liveServerDeliveryZones && liveServerDeliveryZones.length > 0
      ? liveServerDeliveryZones
      : mapAdminZonesToOptions(DEFAULT_DELIVERY_ZONES);

  if (typeof window === 'undefined') {
    return defaultZones;
  }
  try {
    const raw = window.localStorage.getItem(STORE_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return defaultZones;
    }
    const parsed = JSON.parse(raw) as Partial<AdminStoreSettings>;
    if (Array.isArray(parsed?.deliveryZones)) {
      return mapAdminZonesToOptions(parsed.deliveryZones);
    }
  } catch {
    // Fallback to live server / default configured zones
  }
  return defaultZones;
}

export function isCountrySupportedForDelivery(country: string): boolean {
  const normalized = country.trim().toLowerCase();
  return normalized === 'pakistan' || normalized === 'pk';
}

export function isProvinceSupportedForDelivery(province: string): boolean {
  const normalized = province.trim().toLowerCase();
  return PAKISTAN_PROVINCES.some((p) => p.toLowerCase() === normalized);
}

export function isZoneCompatibleWithAddress(
  address: { country: string; province: string; city: string },
  zone: DeliveryZoneOption,
): { compatible: boolean; reason?: string } {
  const country = address.country.trim();
  const province = address.province.trim();
  const city = address.city.trim().toLowerCase();

  if (!country || !province || !city) {
    return {
      compatible: false,
      reason:
        'Please select your province and enter your delivery city to calculate shipping charges.',
    };
  }

  if (!isCountrySupportedForDelivery(country)) {
    return {
      compatible: false,
      reason:
        'We currently deliver within Pakistan only. Please enter a supported delivery country.',
    };
  }

  if (!isProvinceSupportedForDelivery(province)) {
    return {
      compatible: false,
      reason: 'Please select a valid supported province or territory.',
    };
  }

  if (zone.priorityCities && zone.priorityCities.length > 0) {
    const cityMatches = zone.priorityCities.some(
      (targetCity) =>
        city === targetCity ||
        city.startsWith(`${targetCity} `) ||
        city.includes(targetCity),
    );
    if (!cityMatches) {
      return {
        compatible: false,
        reason: `${zone.name} applies to ${zone.region}. Select a delivery zone covering ${address.city.trim()}.`,
      };
    }
  }

  if (zone.supportedProvinces && zone.supportedProvinces.length > 0) {
    const provMatches = zone.supportedProvinces.some(
      (p) => p.toLowerCase() === province.toLowerCase(),
    );
    if (!provMatches) {
      return {
        compatible: false,
        reason: `${zone.name} does not cover ${province}. Please choose an eligible delivery zone.`,
      };
    }
  }

  return { compatible: true };
}

export interface DeliveryLocationResolution {
  status:
    | 'missing_location'
    | 'unsupported_location'
    | 'no_zones_configured'
    | 'matched';
  recommendedZone: DeliveryZoneOption | null;
  eligibleZones: DeliveryZoneOption[];
  message?: string;
}

export function resolveDeliveryForAddress(
  address: { country: string; province: string; city: string },
  zones: DeliveryZoneOption[],
): DeliveryLocationResolution {
  const country = address.country.trim();
  const province = address.province.trim();
  const city = address.city.trim();

  if (!country || !province || !city) {
    return {
      status: 'missing_location',
      recommendedZone: null,
      eligibleZones: [],
      message:
        'Enter your country, province, and city to calculate exact courier charges.',
    };
  }

  if (!isCountrySupportedForDelivery(country)) {
    return {
      status: 'unsupported_location',
      recommendedZone: null,
      eligibleZones: [],
      message:
        'Delivery is currently supported within Pakistan only. Please enter a valid Pakistan delivery address.',
    };
  }

  if (!isProvinceSupportedForDelivery(province)) {
    return {
      status: 'unsupported_location',
      recommendedZone: null,
      eligibleZones: [],
      message: 'Please select a valid province or state for delivery.',
    };
  }

  if (zones.length === 0) {
    return {
      status: 'no_zones_configured',
      recommendedZone: null,
      eligibleZones: [],
      message:
        'No active delivery zones are currently enabled in store settings. Shipping charges cannot be assumed free.',
    };
  }

  const eligibleZones = zones.filter(
    (z) => isZoneCompatibleWithAddress(address, z).compatible,
  );

  if (eligibleZones.length === 0) {
    return {
      status: 'unsupported_location',
      recommendedZone: null,
      eligibleZones: [],
      message: `No configured delivery zone covers ${city}, ${province}. Please choose another supported city or update store delivery zones.`,
    };
  }

  const cityNormalized = city.toLowerCase();
  const citySpecificMatch = eligibleZones.find(
    (z) =>
      z.priorityCities &&
      z.priorityCities.some(
        (c) =>
          cityNormalized === c ||
          cityNormalized.startsWith(`${c} `) ||
          cityNormalized.includes(c),
      ),
  );

  const customMatch = eligibleZones.find(
    (z) =>
      !z.isNationwideFallback &&
      (z.region.toLowerCase().includes(cityNormalized) ||
        z.name.toLowerCase().includes(cityNormalized)),
  );

  const recommendedZone =
    citySpecificMatch ?? customMatch ?? eligibleZones[0] ?? null;

  return {
    status: 'matched',
    recommendedZone,
    eligibleZones,
  };
}

export function loadStoredCheckoutOrders(): AdminOrderRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PLACED_ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is AdminOrderRecord =>
        Boolean(entry) &&
        typeof entry.id === 'string' &&
        typeof entry.orderNumber === 'string' &&
        typeof entry.grandTotal === 'number' &&
        Number.isFinite(entry.grandTotal),
    );
  } catch {
    return [];
  }
}

export function appendStoredOrderFromCheckout(order: CheckoutOrderPreview): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadStoredCheckoutOrders();
    if (existing.some((o) => o.orderNumber === order.orderNumber)) return;

    const record: AdminOrderRecord = {
      id: `local-ord-${Date.now()}`,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customer: {
        fullName: order.customer.fullName,
        mobile: order.customer.mobile,
        email: order.customer.email,
        streetAddress: order.address.streetAddress,
        area: order.address.area,
        city: order.address.city,
        province: order.address.province,
        country: order.address.country,
        postalCode: order.address.postalCode,
        deliveryInstructions: order.address.deliveryInstructions || undefined,
      },
      items: order.items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        size: item.size,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.unitPrice * item.quantity,
      })),
      itemSubtotal: order.itemSubtotal,
      couponCode: order.coupon ? order.coupon.code : null,
      discountAmount: order.discountAmount,
      deliveryZone: order.deliveryZoneName ?? 'Unassigned Zone',
      deliveryFee:
        order.deliveryFee !== null && Number.isFinite(order.deliveryFee)
          ? order.deliveryFee
          : 0,
      grandTotal: order.grandTotal,
      paymentMethod: order.paymentMethod,
      paymentStatus:
        order.paymentMethod === 'cod'
          ? 'pay_on_delivery'
          : 'awaiting_verification',
      orderStatus:
        order.paymentMethod === 'cod'
          ? 'order_received'
          : 'pending_verification',
      transactionRefId: order.transactionRefId,
      hasPrivateProof: Boolean(order.hasSubmittedProof || order.proofFileName),
      isDemoRecord: true,
    };

    window.localStorage.setItem(
      PLACED_ORDERS_STORAGE_KEY,
      JSON.stringify([record, ...existing].slice(0, 50)),
    );
  } catch {
    // Ignore storage errors gracefully
  }
}
