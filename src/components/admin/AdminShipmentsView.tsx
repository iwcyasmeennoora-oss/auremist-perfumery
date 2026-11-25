import { useMemo, useState } from 'react';
import { Calendar, Eye, Info, MapPin, Truck } from 'lucide-react';
import {
  formatAdminDate,
  ORDER_STATUS_META,
} from '../../data/adminDemoData';
import { AdminOrderRecord, AdminOrderStatus } from '../../types/admin';

interface AdminShipmentsViewProps {
  orders: AdminOrderRecord[];
  onSelectOrder: (order: AdminOrderRecord) => void;
  onUpdateShipment: (params: {
    orderId: string;
    courierName: string;
    trackingCode: string;
    orderStatus: AdminOrderStatus;
    shipmentDate?: string;
  }) => void;
}

const COURIER_PARTNERS = [
  'TCS Express',
  'Leopards Courier',
  'Trax Logistics',
  'M&P Express',
  'PostEx',
];

const FULFILLMENT_STAGES: AdminOrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
];

export function AdminShipmentsView({
  orders,
  onSelectOrder,
  onUpdateShipment,
}: AdminShipmentsViewProps) {
  const [stageFilter, setStageFilter] = useState<'all' | AdminOrderStatus>(
    'all',
  );
  const [draftEdits, setDraftEdits] = useState<
    Record<
      string,
      {
        courierName: string;
        customCourier: string;
        trackingCode: string;
        orderStatus: AdminOrderStatus;
        shipmentDate: string;
      }
    >
  >({});
  const [savedNoticeId, setSavedNoticeId] = useState<string | null>(null);

  const dispatchableOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.orderStatus !== 'cancelled' &&
        o.orderStatus !== 'pending_verification',
    );
  }, [orders]);

  const visibleOrders = useMemo(() => {
    if (stageFilter === 'all') return dispatchableOrders;
    return dispatchableOrders.filter((o) => o.orderStatus === stageFilter);
  }, [dispatchableOrders, stageFilter]);

  const getDraft = (order: AdminOrderRecord) => {
    if (draftEdits[order.id]) return draftEdits[order.id];
    const existingCourier = order.courierName ?? COURIER_PARTNERS[0];
    const isPreset = COURIER_PARTNERS.includes(existingCourier);
    return {
      courierName: isPreset ? existingCourier : 'CUSTOM',
      customCourier: isPreset ? '' : existingCourier,
      trackingCode: order.trackingCode ?? '',
      orderStatus: FULFILLMENT_STAGES.includes(order.orderStatus)
        ? order.orderStatus
        : 'processing',
      shipmentDate: order.dispatchedAt ? order.dispatchedAt.slice(0, 10) : '',
    };
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/55 flex items-start gap-3">
        <Info
          className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
          strokeWidth={1.8}
        />
        <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
          <strong className="font-semibold text-[#351522]">
            Shipment Management (Demo Mode):
          </strong>{' '}
          Inspect full delivery addresses, assign courier partners, record
          tracking references and shipment dates, and update delivery stages in
          this frontend preview. No real shipments or live courier APIs are
          connected yet.
        </p>
      </div>

      {/* Stage Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/50">
          <button
            type="button"
            onClick={() => setStageFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer ${
              stageFilter === 'all'
                ? 'bg-[#351522] text-[#FFF5E9]'
                : 'text-[#5C434E] hover:text-[#351522]'
            }`}
          >
            All Fulfillment ({dispatchableOrders.length})
          </button>
          {FULFILLMENT_STAGES.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => setStageFilter(stage)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer whitespace-nowrap ${
                stageFilter === stage
                  ? 'bg-[#351522] text-[#FFF5E9]'
                  : 'text-[#5C434E] hover:text-[#351522]'
              }`}
            >
              {ORDER_STATUS_META[stage].label}
            </button>
          ))}
        </div>
      </div>

      {/* Shipment Rows */}
      <div className="space-y-4">
        {visibleOrders.length === 0 ? (
          <div className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 py-12 px-6 text-center">
            <p className="font-serif text-2xl font-medium text-[#351522]">
              No orders in this shipment stage
            </p>
          </div>
        ) : (
          visibleOrders.map((order) => {
            const draft = getDraft(order);
            const resolvedCourier =
              draft.courierName === 'CUSTOM'
                ? draft.customCourier.trim() || 'Custom Courier'
                : draft.courierName;

            return (
              <article
                key={order.id}
                className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-[#D6AD72]/25">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Truck
                        className="w-4 h-4 text-[#8C6526]"
                        strokeWidth={1.7}
                      />
                      <span className="font-serif text-xl font-semibold text-[#351522] tabular-nums">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded border text-[11px] font-medium ${ORDER_STATUS_META[order.orderStatus].toneClass}`}
                      >
                        {ORDER_STATUS_META[order.orderStatus].label}
                      </span>
                    </div>

                    <p className="text-xs text-[#5C434E]">
                      {order.customer.fullName} · {order.customer.mobile} · Zone:{' '}
                      <strong className="font-medium text-[#351522]">
                        {order.deliveryZone}
                      </strong>{' '}
                      · Ordered {formatAdminDate(order.createdAt)}
                    </p>

                    <div className="flex items-start gap-1.5 text-xs text-[#26151D]">
                      <MapPin className="w-3.5 h-3.5 text-[#8C6526] shrink-0 mt-0.5" />
                      <span>
                        {order.customer.streetAddress}, {order.customer.area},{' '}
                        {order.customer.city}, {order.customer.province},{' '}
                        {order.customer.country} ({order.customer.postalCode})
                        {order.customer.deliveryInstructions
                          ? ` — Note: "${order.customer.deliveryInstructions}"`
                          : ''}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectOrder(order)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs font-medium text-[#351522] hover:border-[#351522] cursor-pointer self-start shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Order</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
                  <div className="lg:col-span-3 space-y-1.5">
                    <label className="block text-[11px] font-medium text-[#351522]">
                      Courier Partner
                    </label>
                    <select
                      value={draft.courierName}
                      onChange={(e) =>
                        setDraftEdits((prev) => ({
                          ...prev,
                          [order.id]: {
                            ...draft,
                            courierName: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs text-[#26151D] focus:outline-none focus:border-[#351522]"
                    >
                      {COURIER_PARTNERS.map((partner) => (
                        <option key={partner} value={partner}>
                          {partner}
                        </option>
                      ))}
                      <option value="CUSTOM">Other / Custom Courier</option>
                    </select>
                    {draft.courierName === 'CUSTOM' && (
                      <input
                        type="text"
                        value={draft.customCourier}
                        onChange={(e) =>
                          setDraftEdits((prev) => ({
                            ...prev,
                            [order.id]: {
                              ...draft,
                              customCourier: e.target.value,
                            },
                          }))
                        }
                        placeholder="Enter courier name"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs text-[#26151D] focus:outline-none focus:border-[#351522]"
                      />
                    )}
                  </div>

                  <div className="lg:col-span-3">
                    <label className="block text-[11px] font-medium text-[#351522] mb-1">
                      Tracking Number (Demo)
                    </label>
                    <input
                      type="text"
                      value={draft.trackingCode}
                      onChange={(e) =>
                        setDraftEdits((prev) => ({
                          ...prev,
                          [order.id]: {
                            ...draft,
                            trackingCode: e.target.value,
                          },
                        }))
                      }
                      placeholder="e.g. TCS-PK-908411"
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs font-mono text-[#26151D] focus:outline-none focus:border-[#351522]"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="flex items-center gap-1 text-[11px] font-medium text-[#351522] mb-1">
                      <Calendar className="w-3 h-3 text-[#8C6526]" />
                      <span>Shipment Date</span>
                    </label>
                    <input
                      type="date"
                      value={draft.shipmentDate}
                      onChange={(e) =>
                        setDraftEdits((prev) => ({
                          ...prev,
                          [order.id]: {
                            ...draft,
                            shipmentDate: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs tabular-nums text-[#26151D] focus:outline-none focus:border-[#351522]"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-[11px] font-medium text-[#351522] mb-1">
                      Delivery Status
                    </label>
                    <select
                      value={draft.orderStatus}
                      onChange={(e) =>
                        setDraftEdits((prev) => ({
                          ...prev,
                          [order.id]: {
                            ...draft,
                            orderStatus: e.target.value as AdminOrderStatus,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs text-[#26151D] focus:outline-none focus:border-[#351522]"
                    >
                      {FULFILLMENT_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {ORDER_STATUS_META[stage].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateShipment({
                          orderId: order.id,
                          courierName: resolvedCourier,
                          trackingCode: draft.trackingCode.trim(),
                          orderStatus: draft.orderStatus,
                          shipmentDate: draft.shipmentDate || undefined,
                        });
                        setSavedNoticeId(order.id);
                        window.setTimeout(() => setSavedNoticeId(null), 2000);
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-xs font-medium hover:bg-[#240D16] transition-colors cursor-pointer"
                    >
                      {savedNoticeId === order.id ? 'Updated' : 'Save Dispatch'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
