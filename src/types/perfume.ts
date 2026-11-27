export type FragranceCategory =
  | 'All'
  | 'Woody & Oud'
  | 'Floral'
  | 'Amber & Spice'
  | 'Fresh Botanicals';

export type AudienceCategory = 'Men' | 'Women' | 'Unisex';

export type FragranceFamily =
  | 'Woody'
  | 'Floral'
  | 'Fresh'
  | 'Oud'
  | 'Amber'
  | 'Citrus';

export type BottleSize = '30ml' | '50ml' | '100ml';

export type AvailabilityFilter = 'In Stock' | 'Out of Stock';

export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc';

export type AppPage =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'admin';

export type ProductLabel = 'Best Seller' | 'New' | 'Signature';

export type ConcentrationType =
  | 'Eau de Parfum'
  | 'Extrait de Parfum'
  | 'Eau de Toilette';

export interface ProductGalleryImage {
  src: string;
  alt: string;
  caption: string;
}

export interface BottleVariant {
  size: BottleSize;
  price: number;
  originalPrice?: number;
  sku: string;
  stockCount: number;
}

export interface FragranceDemoProfile {
  longevity?: string;
  projection?: string;
  season?: string;
  occasion?: string;
  intendedAudience?: AudienceCategory;
}

export interface PerfumeProduct {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: Exclude<FragranceCategory, 'All'>;
  audienceCategory: AudienceCategory;
  fragranceFamily: FragranceFamily;
  concentration: ConcentrationType;
  concentrationPercent: string;
  label: ProductLabel;
  notes: string[];
  pyramid: {
    top: string;
    heart: string;
    base: string;
  };
  fragranceProfile: FragranceDemoProfile;
  price: number;
  originalPrice?: number;
  defaultSize: BottleSize;
  variants: BottleVariant[];
  inStock: boolean;
  featuredRank: number;
  newestRank: number;
  image: string;
  gallery: ProductGalleryImage[];
  description: string;
  fullDescription?: string;
}

export interface CartItem {
  product: PerfumeProduct;
  size: BottleSize;
  unitPrice: number;
  sku: string;
  quantity: number;
}

export interface AppliedCoupon {
  code: string;
  label: string;
  type: 'percentage' | 'fixed';
  value: number;
}

export interface DeliveryZoneOption {
  id: string;
  name: string;
  region: string;
  fee: number;
  estimatedWindow?: string;
  supportedProvinces?: string[];
  priorityCities?: string[];
  isNationwideFallback?: boolean;
}

export type PaymentMainOption = 'cod' | 'wallet';

export type PaymentMethodType = 'cod' | 'easypaisa' | 'jazzcash';

export interface CheckoutCustomerInfo {
  fullName: string;
  mobile: string;
  email: string;
}

export interface CheckoutAddressInfo {
  country: string;
  city: string;
  province: string;
  area: string;
  streetAddress: string;
  postalCode: string;
  deliveryInstructions: string;
}

export interface PaymentProofState {
  file: File;
  fileName: string;
  fileSize: number;
  mimeType: 'image/jpeg' | 'image/png';
  previewObjectUrl: string;
}

export type OrderTrackingStageKey =
  | 'order_received'
  | 'payment_verification'
  | 'confirmed_processing'
  | 'packed_ready'
  | 'shipped_dispatched'
  | 'out_for_delivery'
  | 'delivered';

export interface PreparedCheckoutOrderPayload {
  customer: CheckoutCustomerInfo;
  address: CheckoutAddressInfo;
  deliveryZoneId: string;
  deliveryZoneName: string;
  items: Array<{
    productId: string;
    slug: string;
    size: string;
    sku: string;
    quantity: number;
  }>;
  giftWrap: boolean;
  couponCode: string | null;
  itemSubtotalPkr: number;
  discountAmountPkr: number;
  deliveryFeePkr: number;
  paymentMethod: PaymentMethodType;
  transactionRefId?: string;
  /**
   * Uploaded through a private authenticated FormData multipart endpoint.
   * Never expose uploaded proof files via public image URLs.
   */
  hasPrivatePaymentProof: boolean;
  /** Client total including shipping; backend must recompute authoritatively. */
  advisoryClientTotalPkr: number;
}

export interface CheckoutOrderPreview {
  orderNumber: string;
  createdAt: string;
  customer: CheckoutCustomerInfo;
  address: CheckoutAddressInfo;
  deliveryZoneId?: string | null;
  deliveryZoneName: string | null;
  items: CartItem[];
  giftWrap: boolean;
  coupon: AppliedCoupon | null;
  itemSubtotal: number;
  discountAmount: number;
  deliveryFee: number | null;
  grandTotal: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'due_on_delivery' | 'awaiting_verification';
  statusLabel: string;
  statusMessage: string;
  transactionRefId?: string;
  proofFileName?: string;
  proofFileSize?: number;
  hasSubmittedProof?: boolean;
  backendOrderId?: string;
  backendTrackingStages?: OrderTrackingStageKey[];
  backendOrderPayload?: PreparedCheckoutOrderPayload;
  isDemoPreview: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
