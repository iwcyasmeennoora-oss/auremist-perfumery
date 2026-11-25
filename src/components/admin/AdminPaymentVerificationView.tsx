import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileImage,
  Info,
  Lock,
  MessageSquarePlus,
  RefreshCw,
  Smartphone,
  X,
  XCircle,
} from 'lucide-react';
import {
  formatAdminDateTime,
  formatPaymentMethodShort,
  PAYMENT_STATUS_META,
} from '../../data/adminDemoData';
import { formatPrice } from '../../data/fragrances';
import { AdminOrderRecord, AdminPaymentStatus } from '../../types/admin';

interface AdminPaymentVerificationViewProps {
  orders: AdminOrderRecord[];
  walletRecipientNumber?: string;
  onSelectOrder: (order: AdminOrderRecord) => void;
  onReviewPayment: (params: {
    orderId: string;
    decision: 'verified' | 'rejected' | 'reupload_requested';
    note?: string;
  }) => void;
  onSaveInternalNote: (orderId: string, internalNote: string) => void;
}

type WalletTab =
  | 'awaiting_verification'
  | 'reupload_requested'
  | 'verified'
  | 'rejected'
  | 'all';

export function AdminPaymentVerificationView({
  orders,
  walletRecipientNumber,
  onSelectOrder,
  onReviewPayment,
  onSaveInternalNote,
}: AdminPaymentVerificationViewProps) {
  const [activeTab, setActiveTab] = useState<WalletTab>('awaiting_verification');
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<'rejected' | 'reupload_requested' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [previewOrder, setPreviewOrder] = useState<AdminOrderRecord | null>(null);
  const [internalDrafts, setInternalDrafts] = useState<Record<string, string>>({});
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);

  const walletOrders = useMemo(
    () => orders.filter((o) => o.paymentMethod !== 'cod'),
    [orders],
  );

  const counts = useMemo(
    () => ({
      awaiting_verification: walletOrders.filter(
        (o) => o.paymentStatus === 'awaiting_verification',
      ).length,
      reupload_requested: walletOrders.filter(
        (o) => o.paymentStatus === 'reupload_requested',
      ).length,
      verified: walletOrders.filter((o) => o.paymentStatus === 'verified')
        .length,
      rejected: walletOrders.filter((o) => o.paymentStatus === 'rejected')
        .length,
      all: walletOrders.length,
    }),
    [walletOrders],
  );

  const visibleOrders = useMemo(() => {
    if (activeTab === 'all') return walletOrders;
    return walletOrders.filter((o) => o.paymentStatus === activeTab);
  }, [walletOrders, activeTab]);

  const handleConfirmDecision = (orderId: string) => {
    if (!actionMode) return;
    const trimmed = actionNote.trim();
    if (trimmed.length < 4) {
      setActionError(
        actionMode === 'rejected'
          ? 'Please enter a brief reason (at least 4 characters) before rejecting.'
          : 'Please specify what the customer should re-upload (at least 4 characters).',
      );
      return;
    }
    onReviewPayment({ orderId, decision: actionMode, note: trimmed });
    setActionOrderId(null);
    setActionMode(null);
    setActionNote('');
    setActionError(null);
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
            Manual Wallet Transfer Review (Demo Mode):
          </strong>{' '}
          Inspect Easypaisa and JazzCash transfers
          {walletRecipientNumber?.trim()
            ? ` sent to ${walletRecipientNumber.trim()}`
            : ' sent to your configured wallet account'}
          . Cash on Delivery (COD) orders never require screenshot verification,
          payments are never auto-approved, and uploaded proofs remain private
          until backend storage is connected.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Payment verification filter tabs"
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/50"
        >
          {(
            [
              {
                id: 'awaiting_verification',
                label: `Awaiting Review (${counts.awaiting_verification})`,
              },
              {
                id: 'reupload_requested',
                label: `Re-upload (${counts.reupload_requested})`,
              },
              { id: 'verified', label: `Verified (${counts.verified})` },
              { id: 'rejected', label: `Rejected (${counts.rejected})` },
              { id: 'all', label: `All Transfers (${counts.all})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setActionOrderId(null);
                setActionMode(null);
                setActionError(null);
              }}
              className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#351522] text-[#FFF5E9]'
                  : 'text-[#5C434E] hover:text-[#351522]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Cards */}
      {visibleOrders.length === 0 ? (
        <div className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 py-14 px-6 text-center space-y-2">
          <p className="font-serif text-2xl font-medium text-[#351522]">
            No wallet transfers in this queue
          </p>
          <p className="text-xs sm:text-sm text-[#5C434E]">
            Switch tabs above to inspect other manual transfer statuses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {visibleOrders.map((order) => {
            const isActionable =
              order.paymentStatus === 'awaiting_verification' ||
              order.paymentStatus === 'reupload_requested';
            const isEditingAction = actionOrderId === order.id && actionMode !== null;
            const statusMeta =
              PAYMENT_STATUS_META[order.paymentStatus as AdminPaymentStatus];
            const internalDraft =
              internalDrafts[order.id] ?? order.internalPaymentNote ?? '';

            return (
              <article
                key={order.id}
                className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-[#D6AD72]/25">
                    <div className="min-w-0">
                      <span className="block text-[11px] uppercase tracking-[0.14em] text-[#8C6526] font-semibold">
                        {formatPaymentMethodShort(order.paymentMethod)} ·{' '}
                        {formatAdminDateTime(order.createdAt)}
                      </span>
                      <h3 className="font-serif text-2xl font-semibold text-[#351522] tabular-nums mt-0.5">
                        {order.orderNumber}
                      </h3>
                      <p className="text-xs text-[#5C434E]">
                        {order.customer.fullName} ·{' '}
                        <span className="tabular-nums">
                          {order.customer.mobile}
                        </span>
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded border text-[11px] font-medium shrink-0 ${statusMeta.toneClass}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-[#5C434E]">Expected Amount</dt>
                      <dd className="text-base font-semibold text-[#351522] tabular-nums mt-0.5">
                        {formatPrice(order.grandTotal)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#5C434E]">Transaction Ref ID</dt>
                      <dd className="font-mono text-xs font-medium text-[#26151D] mt-1 break-all">
                        {order.transactionRefId ?? 'Not provided'}
                      </dd>
                    </div>
                  </dl>

                  {/* Private Payment Proof Status & Admin-Only Preview Trigger */}
                  <div className="p-3.5 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/45 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#26151D]">
                    <div className="flex items-start gap-2.5">
                      <Lock
                        className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
                        strokeWidth={1.7}
                      />
                      <div className="space-y-0.5">
                        <p className="font-medium text-[#351522] flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-[#8C6526]" />
                          <span>
                            {order.hasPrivateProof
                              ? 'Private Payment Proof Attached (Demo)'
                              : 'No screenshot metadata attached'}
                          </span>
                        </p>
                        <p className="text-[11px] text-[#5C434E] leading-relaxed">
                          Protected from public URLs. Match Ref ID and{' '}
                          {formatPrice(order.grandTotal)} before verifying.
                        </p>
                      </div>
                    </div>

                    {order.hasPrivateProof && (
                      <button
                        type="button"
                        onClick={() => setPreviewOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FFF5E9] border border-[#D6AD72]/70 text-[11px] font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors shrink-0 self-start sm:self-center cursor-pointer"
                      >
                        <FileImage className="w-3.5 h-3.5" />
                        <span>Preview Proof</span>
                      </button>
                    )}
                  </div>

                  {order.paymentReviewNote && (
                    <div className="p-3 rounded-lg bg-[#FDF3F5] border border-[#7A1D38]/30 text-xs text-[#7A1D38]">
                      <strong>Customer Decision Note:</strong>{' '}
                      {order.paymentReviewNote}
                    </div>
                  )}

                  {/* Internal Admin Note */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`internal-note-${order.id}`}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-[#351522]"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5 text-[#8C6526]" />
                      <span>Internal Verification Note (Admin Only)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        id={`internal-note-${order.id}`}
                        type="text"
                        value={internalDraft}
                        onChange={(e) =>
                          setInternalDrafts((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        placeholder="Add private reconciliation note..."
                        className="flex-1 px-3 py-1.5 rounded-md bg-[#F8F0E7] border border-[#D6AD72]/55 text-xs text-[#26151D] focus:outline-none focus:border-[#351522]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onSaveInternalNote(order.id, internalDraft.trim());
                          setSavedNoteId(order.id);
                          window.setTimeout(() => setSavedNoteId(null), 1800);
                        }}
                        className="px-3 py-1.5 rounded-md bg-[#F8F0E7] border border-[#D6AD72]/60 text-[11px] font-medium text-[#351522] hover:border-[#351522] cursor-pointer shrink-0"
                      >
                        {savedNoteId === order.id ? 'Saved' : 'Save Note'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D6AD72]/25 space-y-3">
                  {isEditingAction && (
                    <div className="space-y-2 p-3 rounded-lg bg-[#F8F0E7] border border-[#7A1D38]/35">
                      <label
                        htmlFor={`decision-note-${order.id}`}
                        className="block text-xs font-medium text-[#351522]"
                      >
                        {actionMode === 'rejected'
                          ? 'Reason for Rejection'
                          : 'Re-upload Request Message'}
                      </label>
                      <input
                        id={`decision-note-${order.id}`}
                        type="text"
                        value={actionNote}
                        onChange={(e) => {
                          setActionNote(e.target.value);
                          setActionError(null);
                        }}
                        placeholder={
                          actionMode === 'rejected'
                            ? 'e.g. Amount mismatch or invalid transaction ID'
                            : 'e.g. Screenshot cropped — please re-upload showing full Ref ID'
                        }
                        className="w-full px-3 py-2 rounded-md bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs text-[#26151D] focus:outline-none focus:border-[#351522]"
                      />
                      {actionError && (
                        <p className="text-[11px] text-[#7A1D38] flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{actionError}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleConfirmDecision(order.id)}
                          className={`px-3.5 py-1.5 rounded-md text-[#FFF5E9] text-xs font-medium cursor-pointer ${
                            actionMode === 'rejected'
                              ? 'bg-[#7A1D38]'
                              : 'bg-[#8C6526]'
                          }`}
                        >
                          {actionMode === 'rejected'
                            ? 'Confirm Rejection'
                            : 'Send Re-upload Request'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActionOrderId(null);
                            setActionMode(null);
                            setActionNote('');
                            setActionError(null);
                          }}
                          className="px-3 py-1.5 rounded-md border border-[#D6AD72]/60 text-xs text-[#351522] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs font-medium text-[#351522] hover:border-[#351522] transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={1.6} />
                      <span>Order Details</span>
                    </button>

                    {isActionable && !isEditingAction && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActionOrderId(order.id);
                            setActionMode('reupload_requested');
                            setActionNote('');
                            setActionError(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D6AD72] bg-[#F8F0E7] text-xs font-medium text-[#8C6526] hover:bg-[#8C6526] hover:text-[#FFF5E9] transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.7} />
                          <span>Request Re-upload</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActionOrderId(order.id);
                            setActionMode('rejected');
                            setActionNote('');
                            setActionError(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#7A1D38]/45 bg-[#FDF3F5] text-xs font-medium text-[#7A1D38] hover:bg-[#7A1D38] hover:text-[#FFF5E9] transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" strokeWidth={1.7} />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onReviewPayment({
                              orderId: order.id,
                              decision: 'verified',
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-xs font-medium hover:bg-[#240D16] transition-colors cursor-pointer"
                        >
                          <CheckCircle2
                            className="w-3.5 h-3.5 text-[#D6AD72]"
                            strokeWidth={1.7}
                          />
                          <span>Verify Payment</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Private Admin-Only Screenshot Preview Modal */}
      {previewOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Private payment proof preview for ${previewOrder.orderNumber}`}
        >
          <div
            onClick={() => setPreviewOrder(null)}
            className="fixed inset-0 bg-[#26151D]/60"
          />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/60 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#D6AD72]/30">
              <div>
                <span className="block text-[10px] uppercase tracking-[0.16em] text-[#8C6526] font-semibold">
                  Private Admin-Only Preview (Demo)
                </span>
                <h2 className="font-serif text-2xl font-medium text-[#351522] tabular-nums">
                  {previewOrder.orderNumber}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOrder(null)}
                aria-label="Close proof preview"
                className="p-1.5 text-[#5C434E] hover:text-[#351522] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Private Wallet Receipt Surface */}
            <div className="rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 p-5 space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-[#D6AD72]/30 pb-3">
                <span className="font-semibold text-[#351522]">
                  {formatPaymentMethodShort(previewOrder.paymentMethod)} Transfer
                  Receipt
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#8C6526] font-medium">
                  <Lock className="w-3 h-3" />
                  <span>Private Storage</span>
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5C434E]">Sender</span>
                  <span className="font-medium text-[#351522]">
                    {previewOrder.customer.fullName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C434E]">Transfer Amount</span>
                  <span className="font-semibold text-[#351522] tabular-nums">
                    {formatPrice(previewOrder.grandTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C434E]">Transaction Ref ID</span>
                  <span className="font-mono text-[#26151D]">
                    {previewOrder.transactionRefId ?? 'Pending Ref'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C434E]">Submission Timestamp</span>
                  <span className="tabular-nums text-[#5C434E]">
                    {formatAdminDateTime(previewOrder.createdAt)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#5C434E] pt-2 border-t border-[#D6AD72]/25 leading-relaxed">
                Demo receipt preview only. Once backend object storage is
                connected, signed temporary image URLs accessible exclusively to
                authenticated admins render here.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewOrder(null)}
                className="px-4 py-2 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-xs font-medium cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
