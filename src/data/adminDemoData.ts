import {
  AdminActivityEntry,
  AdminOrderRecord,
  AdminOrderStatus,
  AdminPaymentStatus,
  SalesRangeKey,
} from '../types/admin';
import { BottleSize, PaymentMethodType } from '../types/perfume';
import { ALL_PERFUMES } from './fragrances';

export const LOW_STOCK_THRESHOLD = 5;

export const ORDER_STATUS_META: Record<
  AdminOrderStatus,
  { label: string; toneClass: string }
> = {
  order_received: {
    label: 'Order Received',
    toneClass: 'text-[#351522] border-[#D6AD72]/70 bg-[#FFF5E9]',
  },
  pending_verification: {
    label: 'Pending Verification',
    toneClass: 'text-[#8C6526] border-[#D6AD72] bg-[#F8F0E7]',
  },
  processing: {
    label: 'Processing',
    toneClass: 'text-[#351522] border-[#351522]/40 bg-[#F8F0E7]',
  },
  packed: {
    label: 'Packed / Ready',
    toneClass: 'text-[#351522] border-[#D6AD72] bg-[#FFF5E9]',
  },
  shipped: {
    label: 'Shipped',
    toneClass: 'text-[#26151D] border-[#D6AD72]/60 bg-[#F8F0E7]',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    toneClass: 'text-[#351522] border-[#351522]/50 bg-[#FFF5E9]',
  },
  delivered: {
    label: 'Delivered',
    toneClass: 'text-[#1F4E37] border-[#1F4E37]/35 bg-[#F2F7F4]',
  },
  cancelled: {
    label: 'Cancelled',
    toneClass: 'text-[#7A1D38] border-[#7A1D38]/35 bg-[#FDF3F5]',
  },
};

export const PAYMENT_STATUS_META: Record<
  AdminPaymentStatus,
  { label: string; toneClass: string }
> = {
  pay_on_delivery: {
    label: 'Pay on Delivery',
    toneClass: 'text-[#351522] border-[#D6AD72]/60 bg-[#FFF5E9]',
  },
  awaiting_verification: {
    label: 'Awaiting Verification',
    toneClass: 'text-[#8C6526] border-[#D6AD72] bg-[#F8F0E7]',
  },
  verified: {
    label: 'Verified',
    toneClass: 'text-[#1F4E37] border-[#1F4E37]/35 bg-[#F2F7F4]',
  },
  rejected: {
    label: 'Rejected',
    toneClass: 'text-[#7A1D38] border-[#7A1D38]/35 bg-[#FDF3F5]',
  },
};

export function formatPaymentMethodShort(method: PaymentMethodType): string {
  if (method === 'cod') return 'Cash on Delivery';
  if (method === 'easypaisa') return 'Easypaisa';
  return 'JazzCash';
}

export function formatAdminDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return iso.slice(0, 10);
  }
}

export function formatAdminDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return iso;
  }
}

/**
 * Demonstration sample orders clearly labeled for Phase 7 UI preview
 * until backend order APIs and database storage are connected.
 */
export const DEMO_ADMIN_ORDERS: AdminOrderRecord[] = [
  {
    id: 'demo-ord-1012',
    orderNumber: 'AUR-20261124-4821',
    createdAt: '2026-11-24T06:40:00.000Z',
    customer: {
      fullName: 'Areeba Khan',
      mobile: '0321 4489210',
      email: 'areeba.khan@example.pk',
      streetAddress: 'House 18-B, Street 4, Khayaban-e-Ittehad',
      area: 'DHA Phase 6',
      city: 'Karachi',
      province: 'Sindh',
      country: 'Pakistan',
      postalCode: '75500',
      deliveryInstructions: 'Call 15 minutes before arrival at the main gate.',
    },
    items: [
      {
        productId: 'velvet-oud',
        productName: 'Velvet Oud',
        size: '100ml',
        sku: 'AUR-VO-100',
        quantity: 1,
        unitPrice: 4900,
        lineTotal: 4900,
      },
      {
        productId: 'amber-silk',
        productName: 'Amber Silk',
        size: '50ml',
        sku: 'AUR-AS-050',
        quantity: 1,
        unitPrice: 4400,
        lineTotal: 4400,
      },
    ],
    itemSubtotal: 9300,
    couponCode: 'WELCOME10',
    discountAmount: 930,
    deliveryZone: 'Karachi Metro Express',
    deliveryFee: 250,
    grandTotal: 8620,
    paymentMethod: 'easypaisa',
    paymentStatus: 'awaiting_verification',
    orderStatus: 'pending_verification',
    transactionRefId: 'EP-9942184031',
    hasPrivateProof: true,
    isDemoRecord: true,
  },
  {
    id: 'demo-ord-1011',
    orderNumber: 'AUR-20261124-4795',
    createdAt: '2026-11-24T04:15:00.000Z',
    customer: {
      fullName: 'Zainab Tariq',
      mobile: '0300 8412290',
      email: 'zainab.t@example.pk',
      streetAddress: '42 Main Boulevard, Block H',
      area: 'Gulberg III',
      city: 'Lahore',
      province: 'Punjab',
      country: 'Pakistan',
      postalCode: '54660',
    },
    items: [
      {
        productId: 'rose-velours',
        productName: 'Rose Velours',
        size: '100ml',
        sku: 'AUR-RV-100',
        quantity: 1,
        unitPrice: 5300,
        lineTotal: 5300,
      },
    ],
    itemSubtotal: 5300,
    couponCode: 'AUREMIST200',
    discountAmount: 200,
    deliveryZone: 'Lahore Urban Courier',
    deliveryFee: 200,
    grandTotal: 5300,
    paymentMethod: 'cod',
    paymentStatus: 'pay_on_delivery',
    orderStatus: 'order_received',
    isDemoRecord: true,
  },
  {
    id: 'demo-ord-1010',
    orderNumber: 'AUR-20261123-4710',
    createdAt: '2026-11-23T14:20:00.000Z',
    customer: {
      fullName: 'Hamza Siddiqui',
      mobile: '0333 5190842',
      email: 'hamza.siddiqui@example.pk',
      streetAddress: 'Plot 9, Margalla Road',
      area: 'Sector F-7/2',
      city: 'Islamabad',
      province: 'Islamabad Capital Territory',
      country: 'Pakistan',
      postalCode: '44000',
      deliveryInstructions: 'Deliver at reception desk between 11 AM and 5 PM.',
    },
    items: [
      {
        productId: 'cedar-noir',
        productName: 'Cedar Noir',
        size: '100ml',
        sku: 'AUR-CN-100',
        quantity: 2,
        unitPrice: 5400,
        lineTotal: 10800,
      },
    ],
    itemSubtotal: 10800,
    couponCode: null,
    discountAmount: 0,
    deliveryZone: 'Islamabad / Rawalpindi',
    deliveryFee: 250,
    grandTotal: 11050,
    paymentMethod: 'jazzcash',
    paymentStatus: 'awaiting_verification',
    orderStatus: 'pending_verification',
    transactionRefId: 'JC-7729018412',
    hasPrivateProof: true,
    isDemoRecord: true,
  },
  {
    id: 'demo-ord-1009',
    orderNumber: 'AUR-20261122-4662',
    createdAt: '2026-11-22T11:50:00.000Z',
    customer: {
      fullName: 'Maham Raza',
      mobile: '0345 7710934',
      email: 'maham.raza@example.pk',
      streetAddress: '112 Tulip Block, Bahria Town',
      area: 'Bahria Town',
      city: 'Lahore',
      province: 'Punjab',
      country: 'Pakistan',
      postalCode: '53720',
    },
    items: [
      {
        productId: 'ivory-neroli',
        productName: 'Ivory Neroli',
        size: '100ml',
        sku: 'AUR-IN-100',
        quantity: 1,
        unitPrice: 4500,
        lineTotal: 4500,
      },
      {
        productId: 'nocturne-fig',
        productName: 'Nocturne Fig',
        size: '30ml',
        sku: 'AUR-NF-030',
        quantity: 1,
        unitPrice: 2900,
        lineTotal: 2900,
      },
    ],
    itemSubtotal: 7400,
    couponCode: 'WELCOME10',
    discountAmount: 740,
    deliveryZone: 'Lahore Urban Courier',
    deliveryFee: 200,
    grandTotal: 6860,
    paymentMethod: 'easypaisa',
    paymentStatus: 'verified',
    orderStatus: 'processing',
    transactionRefId: 'EP-8834120092',
    hasPrivateProof: true,
    isDemoRecord: true,
  },
  {
    id: 'demo-ord-1008',
    orderNumber: 'AUR-20261121-4608',
    createdAt: '2026-11-21T16:05:00.000Z',
    customer: {
      fullName: 'Bilal Qureshi',
      mobile: '0312 6044819',
      email: 'bilal.qureshi@example.pk',
      streetAddress: 'Bungalow 7, University Road',
      area: 'University Town',
      city: 'Peshawar',
      province: 'Khyber Pakhtunkhwa',
      country: 'Pakistan',
      postalCode: '25000',
    },
    items: [
      {
        productId: 'saffron-dor',
        productName: "Saffron d'Or",
        size: '100ml',
        sku: 'AUR-SD-100',
        quantity: 1,
        unitPrice: 5200,
        lineTotal: 5200,
      },
    ],
    itemSubtotal: 5200,
    couponCode: null,
    discountAmount: 0,
    deliveryZone: 'Nationwide Standard Courier',
    deliveryFee: 350,
    grandTotal: 5550,
    paymentMethod: 'cod',
    paymentStatus: 'pay_on_delivery',
    orderStatus: 'processing',
    isDemoRecord: true,
  },
  {
    id: 'demo-ord-1007',
    orderNumber: 'AUR-20261119-4540',
    createdAt: '2026-11-19T12:30:00.000Z',
    customer: {
      fullName: 'Sana Farooq',
      mobile: '0301 9923104',
      email: 'sana.farooq@example.pk',
      streetAddress: 'Apartment 5B, Clifton Block 4',
      area: 'Clifton',
      city: 'Karachi',
      province: 'Sindh',
      country: 'Pakistan',
      postalCode: '75600',
    },
    items: [
      {
        productId: 'amalfi-citrus',
        productName: 'Amalfi Citrus',
        size: '100ml',
        sku: 'AUR-AC-100',
        quantity: 1,
        unitPrice: 4600,
        lineTotal: 4600,
      },
      {
        productId: 'rose-velours',
        productName: 'Rose Velours',
        size: '50ml',
        sku: 'AUR-RV-050',
        quantity: 1,
        unitPrice: 4200,
        lineTotal: 4200,
      },
    ],
    itemSubtotal: 8800,
    couponCode: 'AUREMIST200',
    discountAmount: 200,
    deliveryZone: 'Karachi Metro Express',
    deliveryFee: 250,
    grandTotal: 8850,
    paymentMethod: 'jazzcash',
    paymentStatus: 'verified',
    orderStatus: 'packed',
    transactionRefId: 'JC-6401189204',
    hasPrivateProof: true,
    isDemoRecord: true,
  },
  {
    id: 'demo-ord-1006',
    orderNumber: 'AUR-20261117-4491',
    createdAt: '2026-11-17T09:45:00.000Z',
    customer: {
      fullName: 'Usman Malik',
      mobile: '0334 4100823',
      email: 'usman.malik@example.pk',
      streetAddress: 'House 29, Satellite Town Block C',
      area: 'Satellite Town',
      city: 'Rawalpindi',
      province: 'Punjab',
      country: 'Pakistan',
      postalCode: '46300',
    },
    items: [
      {
        productId: 'velvet-oud',
        productName: 'Velvet Oud',
        size: '50ml',
        sku: 'AUR-VO-050',
        quantity: 2,
        unitPrice: 3600,
        lineTotal: 7200,
      },
    ],
    itemSubtotal: 7200,
    couponCode: null,
    discountAmount: 0,
    deliveryZone: 'Islamabad / Rawalpindi',
    deliveryFee: 250,
    grandTotal: 7450,
    paymentMethod: 'cod',
    paymentStatus: 'pay_on_delivery',
    orderStatus: 'shipped',
    isDemoRecord: true,
  },
  {
    id: 'demo-ord-1005',
    orderNumber: 'AUR-20261114-4412',
    createdAt: '2026-11-14T15:10:00.000Z',
    customer: {
      fullName: 'Hira Javed',
      mobile: '0322 8851290',
      email: 'hira.javed@example.pk',
      streetAddress: '14 Officers Colony, Bosan Road',
      area: 'Bosan Road',
      city: 'Multan',
      province: 'Punjab',
      country: 'Pakistan',
      postalCode: '60000',
    },
    items: [
      {
        productId: 'nocturne-fig',
        productName: 'Nocturne Fig',
        size: '100ml',
        sku: 'AUR-NF-100',
        quantity: 1,
        unitPrice: 4700,
        lineTotal: 4700,
      },
    ],
    itemSubtotal: 4700,
    couponCode: 'WELCOME10',
    discountAmount: 470,
    deliveryZone: 'Nationwide Standard Courier',
    deliveryFee: 350,
    grandTotal: 4580,
    paymentMethod: 'easypaisa',
    paymentStatus: 'verified',
    orderStatus: 'out_for_delivery',
    transactionRefId: 'EP-5119042817',
    hasPrivateProof: true,
    isDemoRecord: true,
  },
  {
    id: 'demo-ord-1004',
    orderNumber: 'AUR-20261111-4328',
    createdAt: '2026-11-11T10:25:00.000Z',
    customer: {
      fullName: 'Farhan Ahmed',
      mobile: '0302 3349182',
      email: 'farhan.ahmed@example.pk',
      streetAddress: 'House 8, Model Town Extension',
      area: 'Model Town',
      city: 'Lahore',
      province: 'Punjab',
      country: 'Pakistan',
      postalCode: '54700',
    },
    items: [
      {
        productId: 'cedar-noir',
        productName: 'Cedar Noir',
        size: '50ml',
        sku: 'AUR-CN-050',
        quantity: 1,
        unitPrice: 4100,
        lineTotal: 4100,
      },
      {
        productId: 'amalfi-citrus',
        productName: 'Amalfi Citrus',
        size: '30ml',
        sku: 'AUR-AC-030',
        quantity: 1,
        unitPrice: 3100,
        lineTotal: 3100,
      },
    ],
    itemSubtotal: 7200,
    couponCode: null,
    discountAmount: 0,
    deliveryZone: 'Lahore Urban Courier',
    deliveryFee: 200,
    grandTotal: 7400,
    paymentMethod: 'cod',
    paymentStatus: 'pay_on_delivery',
    orderStatus: 'delivered',
    isDemoRecord: true,
  },
  {
    id: 'demo-ord-1003',
    orderNumber: 'AUR-20261108-4204',
    createdAt: '2026-11-08T13:55:00.000Z',
    customer: {
      fullName: 'Nadia Hussain',
      mobile: '0331 7409821',
      email: 'nadia.hussain@example.pk',
      streetAddress: 'Street 12, Chaklala Scheme III',
      area: 'Chaklala Scheme III',
      city: 'Rawalpindi',
      province: 'Punjab',
      country: 'Pakistan',
      postalCode: '46000',
    },
    items: [
      {
        productId: 'saffron-dor',
        productName: "Saffron d'Or",
        size: '50ml',
        sku: 'AUR-SD-050',
        quantity: 1,
        unitPrice: 3900,
        lineTotal: 3900,
      },
    ],
    itemSubtotal: 3900,
    couponCode: null,
    discountAmount: 0,
    deliveryZone: 'Islamabad / Rawalpindi',
    deliveryFee: 250,
    grandTotal: 4150,
    paymentMethod: 'jazzcash',
    paymentStatus: 'verified',
    orderStatus: 'delivered',
    transactionRefId: 'JC-4109283711',
    hasPrivateProof: true,
    isDemoRecord: true,
  },
  {
    id: 'demo-ord-1002',
    orderNumber: 'AUR-20261104-4119',
    createdAt: '2026-11-04T08:30:00.000Z',
    customer: {
      fullName: 'Saad Mahmood',
      mobile: '0300 4129901',
      email: 'saad.mahmood@example.pk',
      streetAddress: '21-C, Peoples Colony No. 1',
      area: 'Peoples Colony',
      city: 'Faisalabad',
      province: 'Punjab',
      country: 'Pakistan',
      postalCode: '38000',
    },
    items: [
      {
        productId: 'ivory-neroli',
        productName: 'Ivory Neroli',
        size: '50ml',
        sku: 'AUR-IN-050',
        quantity: 1,
        unitPrice: 3400,
        lineTotal: 3400,
      },
    ],
    itemSubtotal: 3400,
    couponCode: null,
    discountAmount: 0,
    deliveryZone: 'Nationwide Standard Courier',
    deliveryFee: 350,
    grandTotal: 3750,
    paymentMethod: 'easypaisa',
    paymentStatus: 'rejected',
    orderStatus: 'cancelled',
    transactionRefId: 'EP-INVALID-0041',
    hasPrivateProof: true,
    isDemoRecord: true,
  },
  {
    id: 'demo-ord-1001',
    orderNumber: 'AUR-20261029-4010',
    createdAt: '2026-10-29T16:15:00.000Z',
    customer: {
      fullName: 'Ayesha Kamran',
      mobile: '0346 2180944',
      email: 'ayesha.kamran@example.pk',
      streetAddress: 'Plot 33, Phase 2',
      area: 'Hayatabad',
      city: 'Peshawar',
      province: 'Khyber Pakhtunkhwa',
      country: 'Pakistan',
      postalCode: '25100',
    },
    items: [
      {
        productId: 'velvet-oud',
        productName: 'Velvet Oud',
        size: '100ml',
        sku: 'AUR-VO-100',
        quantity: 1,
        unitPrice: 4900,
        lineTotal: 4900,
      },
    ],
    itemSubtotal: 4900,
    couponCode: 'AUREMIST200',
    discountAmount: 200,
    deliveryZone: 'Nationwide Standard Courier',
    deliveryFee: 350,
    grandTotal: 5050,
    paymentMethod: 'cod',
    paymentStatus: 'pay_on_delivery',
    orderStatus: 'delivered',
    isDemoRecord: true,
  },
];

export const DEMO_ADMIN_ACTIVITY: AdminActivityEntry[] = [
  {
    id: 'act-1',
    timestamp: '2026-11-24T06:41:00.000Z',
    title: 'Manual payment proof submitted',
    detail: 'Easypaisa transfer receipt awaiting review for order AUR-20261124-4821.',
    orderNumber: 'AUR-20261124-4821',
    kind: 'payment',
  },
  {
    id: 'act-2',
    timestamp: '2026-11-24T04:15:00.000Z',
    title: 'New Cash on Delivery order received',
    detail: 'Zainab Tariq placed a COD order from Gulberg III, Lahore (Rs. 5,300).',
    orderNumber: 'AUR-20261124-4795',
    kind: 'order',
  },
  {
    id: 'act-3',
    timestamp: '2026-11-23T14:22:00.000Z',
    title: 'JazzCash transfer pending review',
    detail: 'Order AUR-20261123-4710 (Rs. 11,050) awaiting payment verification.',
    orderNumber: 'AUR-20261123-4710',
    kind: 'payment',
  },
  {
    id: 'act-4',
    timestamp: '2026-11-22T12:10:00.000Z',
    title: 'Variant inventory threshold alert',
    detail: 'Amber Silk 50ml (AUR-AS-050) has 3 units remaining in stock.',
    kind: 'inventory',
  },
  {
    id: 'act-5',
    timestamp: '2026-11-21T16:40:00.000Z',
    title: 'Order moved to Processing',
    detail: 'Order AUR-20261121-4608 prepared for atelier fulfillment.',
    orderNumber: 'AUR-20261121-4608',
    kind: 'fulfillment',
  },
];

export interface LowStockVariantEntry {
  productId: string;
  productName: string;
  size: BottleSize;
  sku: string;
  price: number;
  stockCount: number;
}

export function getLowStockVariants(
  threshold = LOW_STOCK_THRESHOLD,
): LowStockVariantEntry[] {
  const rows: LowStockVariantEntry[] = [];
  for (const product of ALL_PERFUMES) {
    for (const variant of product.variants) {
      if (variant.stockCount <= threshold) {
        rows.push({
          productId: product.id,
          productName: product.name,
          size: variant.size,
          sku: variant.sku,
          price: variant.price,
          stockCount: variant.stockCount,
        });
      }
    }
  }
  return rows.sort((a, b) => a.stockCount - b.stockCount);
}

export interface AdminOverviewMetrics {
  totalOrders: number;
  totalSalesRevenue: number;
  averageOrderValue: number;
  awaitingVerificationCount: number;
  processingCount: number;
  lowStockCount: number;
}

export function computeAdminOverviewMetrics(
  orders: AdminOrderRecord[],
): AdminOverviewMetrics {
  const activeOrders = orders.filter((o) => o.orderStatus !== 'cancelled');
  const totalSalesRevenue = activeOrders.reduce(
    (sum, o) => sum + o.grandTotal,
    0,
  );
  const averageOrderValue =
    activeOrders.length > 0
      ? Math.round(totalSalesRevenue / activeOrders.length)
      : 0;
  const awaitingVerificationCount = orders.filter(
    (o) => o.paymentStatus === 'awaiting_verification',
  ).length;
  const processingCount = orders.filter(
    (o) => o.orderStatus === 'processing' || o.orderStatus === 'packed',
  ).length;
  const lowStockCount = getLowStockVariants().length;

  return {
    totalOrders: orders.length,
    totalSalesRevenue,
    averageOrderValue,
    awaitingVerificationCount,
    processingCount,
    lowStockCount,
  };
}

export interface SalesChartBucket {
  key: string;
  label: string;
  revenue: number;
  orderCount: number;
}

const REFERENCE_NOW_MS = new Date('2026-11-24T23:59:59.000Z').getTime();

export function buildSalesChartSeries(
  orders: AdminOrderRecord[],
  range: SalesRangeKey,
): SalesChartBucket[] {
  const days = range === '7d' ? 7 : range === '14d' ? 14 : 30;
  const cutoffMs = REFERENCE_NOW_MS - days * 24 * 60 * 60 * 1000;

  const filtered = orders.filter((o) => {
    if (o.orderStatus === 'cancelled') return false;
    const t = new Date(o.createdAt).getTime();
    return t >= cutoffMs && t <= REFERENCE_NOW_MS;
  });

  const bucketCount = range === '7d' ? 7 : range === '14d' ? 7 : 6;
  const stepDays = days / bucketCount;
  const buckets: SalesChartBucket[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const startMs = cutoffMs + i * stepDays * 24 * 60 * 60 * 1000;
    const endMs = cutoffMs + (i + 1) * stepDays * 24 * 60 * 60 * 1000;
    const bucketEndDate = new Date(endMs);
    const label = new Intl.DateTimeFormat('en-PK', {
      day: '2-digit',
      month: 'short',
    }).format(bucketEndDate);

    const matching = filtered.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t > startMs && t <= endMs;
    });

    buckets.push({
      key: `${range}-${i}`,
      label,
      revenue: matching.reduce((sum, o) => sum + o.grandTotal, 0),
      orderCount: matching.length,
    });
  }

  return buckets;
}

export function buildOrderStatusDistribution(orders: AdminOrderRecord[]): Array<{
  status: AdminOrderStatus;
  label: string;
  count: number;
  percent: number;
}> {
  const statuses: AdminOrderStatus[] = [
    'order_received',
    'pending_verification',
    'processing',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  const total = Math.max(orders.length, 1);

  return statuses
    .map((status) => {
      const count = orders.filter((o) => o.orderStatus === status).length;
      return {
        status,
        label: ORDER_STATUS_META[status].label,
        count,
        percent: Math.round((count / total) * 100),
      };
    })
    .filter((entry) => entry.count > 0);
}
