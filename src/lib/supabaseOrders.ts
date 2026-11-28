import {
  AppliedCoupon,
  CheckoutOrderPreview,
  PaymentProofState,
} from '../types/perfume';

export type SupabaseOrderSubmitResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      createdAt: string;
      itemSubtotal: number;
      discountAmount: number;
      deliveryFee: number;
      grandTotal: number;
      deliveryZoneId: string;
      deliveryZoneName: string;
      coupon: AppliedCoupon | null;
      paymentProofPath: string | null;
    }
  | {
      ok: false;
      message: string;
      isMissingSchema?: boolean;
    };

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const commaIdx = reader.result.indexOf(',');
        resolve(commaIdx >= 0 ? reader.result.slice(commaIdx + 1) : reader.result);
      } else {
        reject(new Error('Could not read payment proof image file.'));
      }
    };
    reader.onerror = () =>
      reject(new Error('Could not read payment proof image file.'));
    reader.readAsDataURL(file);
  });
}

export async function submitCheckoutOrderToSupabase(
  order: CheckoutOrderPreview,
  paymentProof: PaymentProofState | null,
  idempotencyKey?: string,
): Promise<SupabaseOrderSubmitResult> {
  const isManualTransfer = order.paymentMethod !== 'cod';
  let serializedProof: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    base64Data: string;
  } | null = null;

  if (isManualTransfer && paymentProof?.file) {
    try {
      const base64Data = await readFileAsBase64(paymentProof.file);
      serializedProof = {
        fileName: paymentProof.fileName,
        fileSize: paymentProof.fileSize,
        mimeType: paymentProof.mimeType,
        base64Data,
      };
    } catch {
      return {
        ok: false,
        message:
          'Unable to read your uploaded payment screenshot. Please re-select the file and try again.',
      };
    }
  }

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        idempotencyKey,
        customer: {
          fullName: order.customer.fullName.trim(),
          mobile: order.customer.mobile.trim(),
          email: order.customer.email.trim(),
        },
        address: {
          country: order.address.country.trim(),
          province: order.address.province.trim(),
          city: order.address.city.trim(),
          area: order.address.area.trim(),
          streetAddress: order.address.streetAddress.trim(),
          postalCode: order.address.postalCode.trim(),
          deliveryInstructions: order.address.deliveryInstructions.trim(),
        },
        deliveryZoneId: order.deliveryZoneId,
        giftWrap: Boolean(order.giftWrap),
        couponCode: order.coupon ? order.coupon.code : null,
        items: order.items.map((item) => ({
          productId: item.product.id,
          size: item.size,
          quantity: item.quantity,
        })),
        paymentMethod: order.paymentMethod,
        transactionRefId:
          isManualTransfer && order.transactionRefId
            ? order.transactionRefId.trim()
            : undefined,
        paymentProof: serializedProof,
      }),
    });

    const data = (await response.json()) as {
      ok?: boolean;
      message?: string;
      isMissingSchema?: boolean;
      orderId?: string;
      orderNumber?: string;
      createdAt?: string;
      itemSubtotal?: number;
      discountAmount?: number;
      deliveryFee?: number;
      grandTotal?: number;
      deliveryZoneId?: string;
      deliveryZoneName?: string;
      coupon?: AppliedCoupon | null;
      paymentProofPath?: string | null;
    };

    if (!response.ok || !data.ok || !data.orderId) {
      return {
        ok: false,
        message:
          data.message ||
          'Unable to save your order to the database right now. Please try again.',
        isMissingSchema: data.isMissingSchema,
      };
    }

    return {
      ok: true,
      orderId: data.orderId,
      orderNumber: data.orderNumber ?? order.orderNumber,
      createdAt: data.createdAt ?? order.createdAt,
      itemSubtotal:
        typeof data.itemSubtotal === 'number'
          ? data.itemSubtotal
          : order.itemSubtotal,
      discountAmount:
        typeof data.discountAmount === 'number'
          ? data.discountAmount
          : order.discountAmount,
      deliveryFee:
        typeof data.deliveryFee === 'number'
          ? data.deliveryFee
          : (order.deliveryFee ?? 0),
      grandTotal:
        typeof data.grandTotal === 'number'
          ? data.grandTotal
          : order.grandTotal,
      deliveryZoneId: data.deliveryZoneId ?? order.deliveryZoneId ?? '',
      deliveryZoneName: data.deliveryZoneName ?? order.deliveryZoneName ?? '',
      coupon: data.coupon !== undefined ? data.coupon : order.coupon,
      paymentProofPath: data.paymentProofPath ?? null,
    };
  } catch {
    return {
      ok: false,
      message:
        'Could not reach the checkout server. Please verify your connection and try again.',
    };
  }
}
