import {
  CheckoutOrderPreview,
  PaymentProofState,
} from '../types/perfume';
import { getSupabaseClient } from './supabaseClient';

export type SupabaseOrderSubmitResult =
  | {
      ok: true;
      orderId: string;
      paymentProofPath: string | null;
    }
  | {
      ok: false;
      message: string;
      isMissingSchema?: boolean;
    };

function generateUuidV4(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return '00000000-0000-4000-8000-000000000000';
}

function sanitizeStorageFileName(fileName: string): string {
  const cleaned = fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');
  return cleaned.slice(-80) || 'payment_proof.png';
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
        'Your Supabase project is connected, but the orders table has not been created yet. Please run supabase/schema.sql in your Supabase SQL Editor and try confirming again.',
    };
  }

  if (code === '42501' || /row-level security/i.test(rawMessage)) {
    return {
      isMissingSchema: false,
      message:
        'Database permission check prevented saving the order. Please verify the RLS policies from supabase/schema.sql are applied in Supabase.',
    };
  }

  if (code === '23505') {
    return {
      isMissingSchema: false,
      message:
        'A duplicate order reference occurred. Please click Confirm Order once more to generate a fresh reference.',
    };
  }

  return {
    isMissingSchema: false,
    message:
      rawMessage ||
      'Unable to save your order to the database right now. Please check your connection and try again.',
  };
}

export async function submitCheckoutOrderToSupabase(
  order: CheckoutOrderPreview,
  paymentProof: PaymentProofState | null,
): Promise<SupabaseOrderSubmitResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      message:
        'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.',
    };
  }

  const orderId = generateUuidV4();
  const isManualTransfer = order.paymentMethod !== 'cod';
  const resolvedDeliveryFee =
    order.deliveryFee !== null && Number.isFinite(order.deliveryFee)
      ? Math.round(order.deliveryFee)
      : 0;
  const resolvedSubtotal = Number.isFinite(order.itemSubtotal)
    ? Math.round(order.itemSubtotal)
    : 0;
  const resolvedDiscount = Number.isFinite(order.discountAmount)
    ? Math.round(order.discountAmount)
    : 0;
  const resolvedGrandTotal = Math.max(
    0,
    resolvedSubtotal - resolvedDiscount + resolvedDeliveryFee,
  );

  let uploadedProofPath: string | null = null;
  if (isManualTransfer && paymentProof?.file) {
    const safeName = sanitizeStorageFileName(paymentProof.fileName);
    const storagePath = `orders/${order.orderNumber}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(storagePath, paymentProof.file, {
        contentType: paymentProof.mimeType,
        upsert: false,
      });

    if (uploadError) {
      return {
        ok: false,
        message:
          /bucket not found/i.test(uploadError.message)
            ? 'Payment proof storage bucket ("payment-proofs") is not set up in Supabase yet. Please run supabase/schema.sql in your Supabase SQL Editor.'
            : `Could not upload payment proof screenshot: ${uploadError.message}`,
      };
    }

    uploadedProofPath = storagePath;
  }

  const serializedItems = order.items.map((item) => {
    const unitPricePkr = Number.isFinite(item.unitPrice)
      ? Math.round(item.unitPrice)
      : 0;
    const quantity = Number.isFinite(item.quantity)
      ? Math.max(1, Math.floor(item.quantity))
      : 1;
    return {
      product_id: item.product.id,
      product_slug: item.product.slug,
      product_name: item.product.name,
      bottle_size: item.size,
      sku: item.sku,
      quantity,
      unit_price_pkr: unitPricePkr,
      line_total_pkr: unitPricePkr * quantity,
    };
  });

  const formattedAddress = [
    order.address.streetAddress.trim(),
    order.address.area.trim(),
    order.address.city.trim(),
    order.address.province.trim(),
    order.address.country.trim(),
    order.address.postalCode.trim(),
  ]
    .filter(Boolean)
    .join(', ');

  const productSummary = serializedItems
    .map((item) => `${item.product_name} (${item.bottle_size} x ${item.quantity})`)
    .join(', ');

  const orderRow = {
    id: orderId,
    order_number: order.orderNumber,
    name: order.customer.fullName.trim(),
    email: order.customer.email.trim(),
    mobile: order.customer.mobile.trim(),
    address: formattedAddress,
    product: productSummary,
    total_amount: resolvedGrandTotal,
    date: order.createdAt,
    country: order.address.country.trim(),
    province: order.address.province.trim(),
    city: order.address.city.trim(),
    area: order.address.area.trim(),
    street_address: order.address.streetAddress.trim(),
    postal_code: order.address.postalCode.trim(),
    delivery_instructions: order.address.deliveryInstructions.trim() || null,
    delivery_zone_id: order.deliveryZoneId ?? 'unassigned',
    delivery_zone_name: order.deliveryZoneName ?? 'Standard Delivery',
    gift_wrap: Boolean(order.giftWrap),
    coupon_code: order.coupon ? order.coupon.code : null,
    coupon_label: order.coupon ? order.coupon.label : null,
    item_subtotal_pkr: resolvedSubtotal,
    discount_amount_pkr: resolvedDiscount,
    delivery_fee_pkr: resolvedDeliveryFee,
    payment_method: order.paymentMethod,
    payment_status: isManualTransfer
      ? 'awaiting_verification'
      : 'due_on_delivery',
    order_status: isManualTransfer ? 'pending_verification' : 'order_received',
    transaction_ref_id:
      isManualTransfer && order.transactionRefId
        ? order.transactionRefId.trim()
        : null,
    has_payment_proof: Boolean(isManualTransfer && paymentProof),
    payment_proof_path: uploadedProofPath,
    payment_proof_file_name:
      isManualTransfer && paymentProof ? paymentProof.fileName : null,
    payment_proof_file_size:
      isManualTransfer && paymentProof ? paymentProof.fileSize : null,
    payment_proof_mime_type:
      isManualTransfer && paymentProof ? paymentProof.mimeType : null,
    items: serializedItems,
  };

  const { error: orderInsertError } = await supabase
    .from('orders')
    .insert(orderRow);

  if (orderInsertError) {
    const formatted = formatSupabaseErrorMessage(orderInsertError);
    return {
      ok: false,
      message: formatted.message,
      isMissingSchema: formatted.isMissingSchema,
    };
  }

  const orderItemsRows = serializedItems.map((item) => ({
    order_id: orderId,
    order_number: order.orderNumber,
    ...item,
  }));

  const { error: itemsInsertError } = await supabase
    .from('order_items')
    .insert(orderItemsRows);

  if (
    itemsInsertError &&
    itemsInsertError.code !== 'PGRST205' &&
    !/could not find the table/i.test(itemsInsertError.message)
  ) {
    // Primary `orders` record including `items` JSONB already succeeded;
    // return success so the customer never double-submits a saved order.
    return {
      ok: true,
      orderId,
      paymentProofPath: uploadedProofPath,
    };
  }

  return {
    ok: true,
    orderId,
    paymentProofPath: uploadedProofPath,
  };
}
