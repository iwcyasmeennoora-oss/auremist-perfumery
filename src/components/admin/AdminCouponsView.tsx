import { FormEvent, useState } from 'react';
import {
  Edit3,
  Info,
  Plus,
  Save,
  Tag,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';
import { formatPrice } from '../../data/fragrances';
import { AdminCouponRecord } from '../../types/admin';

interface AdminCouponsViewProps {
  coupons: AdminCouponRecord[];
  onAddCoupon: (coupon: AdminCouponRecord) => void;
  onUpdateCoupon: (coupon: AdminCouponRecord) => void;
  onToggleCoupon: (couponId: string) => void;
  onDeleteCoupon: (couponId: string) => void;
}

export function AdminCouponsView({
  coupons,
  onAddCoupon,
  onUpdateCoupon,
  onToggleCoupon,
  onDeleteCoupon,
}: AdminCouponsViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('15');
  const [minOrderPkr, setMinOrderPkr] = useState('3000');
  const [usageLimit, setUsageLimit] = useState('100');
  const [expiresAt, setExpiresAt] = useState('2026-12-31');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setDescription('');
    setType('percentage');
    setValue('15');
    setMinOrderPkr('3000');
    setUsageLimit('100');
    setExpiresAt('2026-12-31');
    setIsActive(true);
    setFormError(null);
  };

  const startEdit = (coupon: AdminCouponRecord) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setDescription(coupon.description);
    setType(coupon.type);
    setValue(String(coupon.value));
    setMinOrderPkr(String(coupon.minOrderPkr));
    setUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : '');
    setExpiresAt(coupon.expiresAt);
    setIsActive(coupon.isActive);
    setFormError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanedCode = code.trim().toUpperCase();
    const numericValue = Number(value);
    const numericMin = Number(minOrderPkr) || 0;
    const parsedLimit = usageLimit.trim() ? Number(usageLimit) : null;

    if (!cleanedCode || !/^[A-Z0-9_-]{3,24}$/.test(cleanedCode)) {
      setFormError(
        'Coupon code must be 3–24 alphanumeric characters without spaces.',
      );
      return;
    }

    if (coupons.some((c) => c.id !== editingId && c.code === cleanedCode)) {
      setFormError(`Coupon ${cleanedCode} already exists.`);
      return;
    }

    if (
      !Number.isFinite(numericValue) ||
      numericValue <= 0 ||
      (type === 'percentage' && numericValue > 90)
    ) {
      setFormError(
        type === 'percentage'
          ? 'Percentage discount must be between 1% and 90%.'
          : 'Fixed PKR discount must be greater than Rs. 0.',
      );
      return;
    }

    if (parsedLimit !== null && (!Number.isFinite(parsedLimit) || parsedLimit < 1)) {
      setFormError('Usage limit must be at least 1, or leave blank for unlimited.');
      return;
    }

    const nextDescription =
      description.trim() ||
      (type === 'percentage'
        ? `${numericValue}% boutique discount`
        : `Flat ${formatPrice(numericValue)} discount`);

    if (editingId) {
      const existing = coupons.find((c) => c.id === editingId);
      if (existing) {
        onUpdateCoupon({
          ...existing,
          code: cleanedCode,
          description: nextDescription,
          type,
          value: numericValue,
          minOrderPkr: Math.max(0, numericMin),
          usageLimit: parsedLimit ? Math.floor(parsedLimit) : null,
          expiresAt: expiresAt || '2026-12-31',
          isActive,
        });
      }
      resetForm();
      return;
    }

    onAddCoupon({
      id: `coup-${Date.now()}`,
      code: cleanedCode,
      description: nextDescription,
      type,
      value: numericValue,
      minOrderPkr: Math.max(0, numericMin),
      usageCount: 0,
      usageLimit: parsedLimit ? Math.floor(parsedLimit) : null,
      expiresAt: expiresAt || '2026-12-31',
      isActive,
    });

    resetForm();
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
            Promotional Coupons (Demo Mode):
          </strong>{' '}
          Add, edit, set usage limits, toggle Active/Inactive status, or delete
          coupons. Server validation rules will enforce eligibility at checkout
          when backend APIs connect.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coupon Table */}
        <section className="lg:col-span-8 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 overflow-hidden">
          <div className="px-5 py-4 bg-[#F8F0E7] border-b border-[#D6AD72]/30 flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#8C6526]" strokeWidth={1.7} />
            <h2 className="font-serif text-2xl font-medium text-[#351522]">
              Active &amp; Scheduled Coupons ({coupons.length})
            </h2>
          </div>

          {coupons.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-2">
              <p className="font-serif text-xl font-medium text-[#351522]">
                No coupons configured
              </p>
              <p className="text-xs text-[#5C434E]">
                Create a promotional coupon using the form on the right.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#D6AD72]/30 text-[11px] uppercase tracking-[0.12em] text-[#5C434E]">
                    <th className="py-3 px-4 font-semibold">Code</th>
                    <th className="py-3 px-4 font-semibold">Discount</th>
                    <th className="py-3 px-4 font-semibold">Min Order</th>
                    <th className="py-3 px-4 font-semibold">Expiry</th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Usage / Limit
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D6AD72]/20">
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="hover:bg-[#F8F0E7]/65 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold text-[#351522] block">
                          {coupon.code}
                        </span>
                        <span className="text-[11px] text-[#5C434E] block max-w-[200px] truncate">
                          {coupon.description}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#351522] tabular-nums whitespace-nowrap">
                        {coupon.type === 'percentage'
                          ? `${coupon.value}% off`
                          : `${formatPrice(coupon.value)} off`}
                      </td>
                      <td className="py-3.5 px-4 text-[#5C434E] tabular-nums whitespace-nowrap">
                        {formatPrice(coupon.minOrderPkr)}
                      </td>
                      <td className="py-3.5 px-4 text-[#5C434E] tabular-nums whitespace-nowrap">
                        {coupon.expiresAt}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums whitespace-nowrap">
                        {coupon.usageCount} /{' '}
                        {coupon.usageLimit ? coupon.usageLimit : 'Unlimited'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onToggleCoupon(coupon.id)}
                            aria-label={`Toggle coupon ${coupon.code}`}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-medium cursor-pointer ${
                              coupon.isActive
                                ? 'bg-[#F2F7F4] border-[#1F4E37]/35 text-[#1F4E37]'
                                : 'bg-[#F8F0E7] border-[#D6AD72]/60 text-[#5C434E]'
                            }`}
                          >
                            {coupon.isActive ? (
                              <>
                                <ToggleRight className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-3.5 h-3.5" />
                                <span>Inactive</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => startEdit(coupon)}
                            aria-label={`Edit coupon ${coupon.code}`}
                            className="p-1.5 rounded border border-[#D6AD72]/50 text-[#351522] hover:border-[#351522] cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onDeleteCoupon(coupon.id);
                              if (editingId === coupon.id) resetForm();
                            }}
                            aria-label={`Delete coupon ${coupon.code}`}
                            className="p-1.5 rounded border border-[#D6AD72]/50 text-[#5C434E] hover:text-[#7A1D38] hover:border-[#7A1D38]/40 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Create / Edit Coupon Form */}
        <section className="lg:col-span-4 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-[#D6AD72]/25">
            <h2 className="font-serif text-2xl font-medium text-[#351522]">
              {editingId ? 'Edit Coupon' : 'Create Coupon'}
            </h2>
            <p className="text-xs text-[#5C434E] mt-0.5">
              {editingId
                ? 'Modify discount terms, limit, or expiry.'
                : 'Configure a new PKR or percentage discount rule.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label
                htmlFor="admin-coupon-code"
                className="block text-xs font-medium text-[#351522] mb-1"
              >
                Coupon Code
              </label>
              <input
                id="admin-coupon-code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setFormError(null);
                }}
                placeholder="e.g. WINTER15"
                className="w-full px-3.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-sm font-mono uppercase focus:outline-none focus:border-[#351522]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="admin-coupon-type"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Discount Type
                </label>
                <select
                  id="admin-coupon-type"
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as 'percentage' | 'fixed')
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs sm:text-sm focus:outline-none focus:border-[#351522]"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (Rs.)</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="admin-coupon-value"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Value
                </label>
                <input
                  id="admin-coupon-value"
                  type="number"
                  min={1}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setFormError(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-sm tabular-nums focus:outline-none focus:border-[#351522]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="admin-coupon-min"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Min Order (PKR)
                </label>
                <input
                  id="admin-coupon-min"
                  type="number"
                  min={0}
                  step={100}
                  value={minOrderPkr}
                  onChange={(e) => setMinOrderPkr(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-sm tabular-nums focus:outline-none focus:border-[#351522]"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-coupon-limit"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Usage Limit
                </label>
                <input
                  id="admin-coupon-limit"
                  type="number"
                  min={1}
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-sm tabular-nums focus:outline-none focus:border-[#351522]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="admin-coupon-exp"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Expiry Date
                </label>
                <input
                  id="admin-coupon-exp"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs tabular-nums focus:outline-none focus:border-[#351522]"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-coupon-status"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Status
                </label>
                <select
                  id="admin-coupon-status"
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs sm:text-sm focus:outline-none focus:border-[#351522]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-coupon-desc"
                className="block text-xs font-medium text-[#351522] mb-1"
              >
                Description
              </label>
              <input
                id="admin-coupon-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional note for store team"
                className="w-full px-3.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-sm focus:outline-none focus:border-[#351522]"
              />
            </div>

            {formError && (
              <p className="text-xs text-[#7A1D38]">{formError}</p>
            )}

            <div className="flex items-center gap-2.5">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 rounded-lg border border-[#D6AD72]/60 text-xs font-medium text-[#351522] cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-xs sm:text-sm font-medium hover:bg-[#240D16] transition-colors cursor-pointer"
              >
                {editingId ? (
                  <>
                    <Save className="w-4 h-4 text-[#D6AD72]" strokeWidth={1.8} />
                    <span>Save Coupon</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-[#D6AD72]" strokeWidth={1.8} />
                    <span>Add Demo Coupon</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
