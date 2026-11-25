import {
  AudienceCategory,
  BottleSize,
  ConcentrationType,
  FragranceCategory,
  FragranceFamily,
  PaymentMethodType,
} from './perfume';

export type AdminSection =
  | 'login'
  | 'dashboard'
  | 'orders'
  | 'payment-verification'
  | 'products'
  | 'inventory'
  | 'categories'
  | 'coupons'
  | 'shipments'
  | 'notifications'
  | 'reports'
  | 'settings';

export type AdminOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'order_received'
  | 'pending_verification'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type AdminPaymentStatus =
  | 'pay_on_delivery'
  | 'awaiting_verification'
  | 'verified'
  | 'rejected'
  | 'reupload_requested';

export interface AdminOrderLineItem {
  productId: string;
  productName: string;
  size: BottleSize;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface AdminOrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: {
    fullName: string;
    mobile: string;
    email: string;
    streetAddress: string;
    area: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
    deliveryInstructions?: string;
  };
  items: AdminOrderLineItem[];
  itemSubtotal: number;
  couponCode: string | null;
  discountAmount: number;
  deliveryZone: string;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: AdminPaymentStatus;
  orderStatus: AdminOrderStatus;
  transactionRefId?: string;
  hasPrivateProof?: boolean;
  proofFileName?: string;
  paymentReviewNote?: string;
  internalPaymentNote?: string;
  courierName?: string;
  trackingCode?: string;
  dispatchedAt?: string;
  isDemoRecord: true;
}

export interface AdminActivityEntry {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  orderNumber?: string;
  kind: 'order' | 'payment' | 'fulfillment' | 'inventory' | 'system';
}

export interface AdminNotificationEntry {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  category: 'payment' | 'order' | 'inventory' | 'shipment' | 'cancelled';
  unread: boolean;
  targetSection: Exclude<AdminSection, 'login'>;
  relatedOrderId?: string;
}

export interface AdminProductVariantRow {
  size: BottleSize;
  price: number;
  originalPrice?: number;
  sku: string;
  stockCount: number;
}

export interface AdminProductRecord {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  audienceCategory: AudienceCategory;
  fragranceFamily: FragranceFamily;
  concentration: ConcentrationType;
  image: string;
  inStock: boolean;
  status: 'active' | 'draft';
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  variants: AdminProductVariantRow[];
}

export interface AdminCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
}

export interface AdminCouponRecord {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderPkr: number;
  usageCount: number;
  usageLimit: number | null;
  expiresAt: string;
  isActive: boolean;
}

export interface AdminDeliveryZoneSetting {
  id: string;
  name: string;
  region: string;
  feePkr: number;
  estimatedWindow: string;
  active: boolean;
}

export interface AdminStoreSettings {
  storeName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  atelierAddress: string;
  currencyLabel: string;
  walletRecipientNumber: string;
  walletInstructions: string;
  codEnabled: boolean;
  easypaisaEnabled: boolean;
  jazzcashEnabled: boolean;
  lowStockThreshold: number;
  deliveryZones: AdminDeliveryZoneSetting[];
}

export interface AdminSession {
  email: string;
  displayName: string;
  signedInAt: string;
  isDemoUiSession: true;
}

export type SalesRangeKey = '7d' | '14d' | '30d';
