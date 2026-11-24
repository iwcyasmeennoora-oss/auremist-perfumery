import {
  CheckoutOrderPreview,
  OrderTrackingStageKey,
} from '../types/perfume';

const SESSION_CONFIRMED_ORDER_KEY = 'auremist_session_confirmed_order_v1';

export interface OrderTrackingStepView {
  key: OrderTrackingStageKey;
  stepNumber: number;
  label: string;
  description: string;
  state: 'completed' | 'awaiting' | 'upcoming';
}

/**
 * Strips private payment proof file names/sizes before storing order confirmation
 * in browser sessionStorage so private proof artifacts are never exposed.
 */
function sanitizeOrderForSession(
  order: CheckoutOrderPreview,
): CheckoutOrderPreview {
  const {
    proofFileName: _ignoredName,
    proofFileSize: _ignoredSize,
    ...safeOrder
  } = order;

  return {
    ...safeOrder,
    hasSubmittedProof:
      Boolean(order.hasSubmittedProof) || Boolean(order.proofFileName),
  };
}

/**
 * Persists the current customer's confirmed order in sessionStorage only
 * (tab/session scoped) so page refreshes retain confirmation details
 * without exposing order information across users or shared browser sessions.
 */
export function saveSessionConfirmedOrder(order: CheckoutOrderPreview): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = sanitizeOrderForSession(order);
    window.sessionStorage.setItem(
      SESSION_CONFIRMED_ORDER_KEY,
      JSON.stringify(sanitized),
    );
  } catch {
    // Ignore storage quota or private browsing errors gracefully.
  }
}

export function loadSessionConfirmedOrder(): CheckoutOrderPreview | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_CONFIRMED_ORDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutOrderPreview>;

    if (
      !parsed ||
      typeof parsed.orderNumber !== 'string' ||
      typeof parsed.createdAt !== 'string' ||
      !parsed.customer ||
      typeof parsed.customer.fullName !== 'string' ||
      !parsed.address ||
      !Array.isArray(parsed.items) ||
      parsed.items.length === 0 ||
      (parsed.paymentMethod !== 'cod' &&
        parsed.paymentMethod !== 'easypaisa' &&
        parsed.paymentMethod !== 'jazzcash')
    ) {
      return null;
    }

    return sanitizeOrderForSession(parsed as CheckoutOrderPreview);
  } catch {
    return null;
  }
}

export function clearSessionConfirmedOrder(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(SESSION_CONFIRMED_ORDER_KEY);
  } catch {
    // Ignore storage errors gracefully.
  }
}

export function formatOrderDateTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Timestamp unavailable';
  }

  try {
    return new Intl.DateTimeFormat('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export function getPaymentMethodDisplayName(
  method: CheckoutOrderPreview['paymentMethod'],
): string {
  if (method === 'cod') return 'Cash on Delivery (COD)';
  if (method === 'easypaisa') return 'Easypaisa (Manual Wallet Transfer)';
  return 'JazzCash (Manual Wallet Transfer)';
}

/**
 * Builds the 7-stage fulfillment timeline (6 stages for COD where payment verification
 * is not applicable).
 *
 * Security & Integrity Rule:
 * - Only highlight statuses actually received from the backend (`!order.isDemoPreview`
 *   and present in `order.backendTrackingStages`).
 * - Never mark future stages as completed.
 * - Never mark manual wallet payments as verified automatically.
 */
export function buildOrderTrackingTimeline(
  order: CheckoutOrderPreview,
): OrderTrackingStepView[] {
  const isManualTransfer = order.paymentMethod !== 'cod';
  const backendStages = new Set<OrderTrackingStageKey>(
    !order.isDemoPreview && Array.isArray(order.backendTrackingStages)
      ? order.backendTrackingStages
      : [],
  );

  const rawStages: Array<{
    key: OrderTrackingStageKey;
    label: string;
    description: string;
    applicable: boolean;
  }> = [
    {
      key: 'order_received',
      label: 'Order Received',
      description: order.isDemoPreview
        ? 'Demonstration preview recorded in this browser session.'
        : 'Order received and logged by the store.',
      applicable: true,
    },
    {
      key: 'payment_verification',
      label: 'Payment Verification',
      description:
        'Awaiting independent admin verification of your wallet transfer.',
      applicable: isManualTransfer,
    },
    {
      key: 'confirmed_processing',
      label: 'Confirmed / Processing',
      description: 'Order verified and queued at the atelier.',
      applicable: true,
    },
    {
      key: 'packed_ready',
      label: 'Packed / Ready to Dispatch',
      description: 'Fragrance parcel sealed and labeled for courier pickup.',
      applicable: true,
    },
    {
      key: 'shipped_dispatched',
      label: 'Shipped / Dispatched',
      description: 'Handed over to regional courier partner.',
      applicable: true,
    },
    {
      key: 'out_for_delivery',
      label: 'Out for Delivery',
      description: 'With local delivery rider for doorstep handover.',
      applicable: true,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      description: 'Parcel delivered to recipient address.',
      applicable: true,
    },
  ];

  return rawStages
    .filter((stage) => stage.applicable)
    .map((stage, index) => {
      let state: OrderTrackingStepView['state'] = 'upcoming';

      if (backendStages.has(stage.key)) {
        state = 'completed';
      } else if (
        stage.key === 'payment_verification' &&
        isManualTransfer &&
        !backendStages.has('payment_verification')
      ) {
        state = 'awaiting';
      }

      return {
        key: stage.key,
        stepNumber: index + 1,
        label: stage.label,
        description: stage.description,
        state,
      };
    });
}
