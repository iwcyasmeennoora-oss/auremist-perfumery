import { BottleSize, PaymentMethodType } from './perfume';

export type AdminSection = 'overview' | 'orders' | 'inventory';

export type AdminOrderStatus =
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
  | 'rejected';

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
  isDemoRecord: true;
}

export interface AdminActivityEntry {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  orderNumber?: string;
  kind: 'order' | 'payment' | 'fulfillment' | 'inventory';
}

export interface AdminSession {
  email: string;
  signedInAt: string;
  isDemoUiSession: true;
}

export type SalesRangeKey = '7d' | '14d' | '30d';
