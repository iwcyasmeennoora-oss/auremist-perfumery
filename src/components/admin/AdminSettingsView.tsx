import { FormEvent, useState } from 'react';
import {
  CheckCircle2,
  Info,
  Plus,
  Save,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';
import { AdminStoreSettings } from '../../types/admin';

interface AdminSettingsViewProps {
  settings: AdminStoreSettings;
  onSaveSettings: (nextSettings: AdminStoreSettings) => void;
}

export function AdminSettingsView({
  settings,
  onSaveSettings,
}: AdminSettingsViewProps) {
  const [draft, setDraft] = useState<AdminStoreSettings>(settings);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneRegion, setNewZoneRegion] = useState('');
  const [newZoneFee, setNewZoneFee] = useState('');
  const [newZoneWindow, setNewZoneWindow] = useState('');
  const [zoneError, setZoneError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveSettings(draft);
    setSavedSuccess(true);
    window.setTimeout(() => setSavedSuccess(false), 2600);
  };

  const handleAddZone = () => {
    setZoneError(null);
    if (!newZoneName.trim() || !newZoneRegion.trim()) {
      setZoneError(
        'Enter both a delivery zone name and region before adding.',
      );
      return;
    }
    const parsedFee = Number(newZoneFee);
    if (!Number.isFinite(parsedFee) || parsedFee < 0 || newZoneFee.trim() === '') {
      setZoneError('Enter a valid non-negative delivery charge in PKR.');
      return;
    }

    setDraft((prev) => ({
      ...prev,
      deliveryZones: [
        ...prev.deliveryZones,
        {
          id: `zone-${Date.now()}`,
          name: newZoneName.trim(),
          region: newZoneRegion.trim(),
          feePkr: Math.round(parsedFee),
          estimatedWindow: newZoneWindow.trim() || 'To be confirmed',
          active: true,
        },
      ],
    }));
    setNewZoneName('');
    setNewZoneRegion('');
    setNewZoneFee('');
    setNewZoneWindow('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/55 flex items-start gap-3">
        <Info
          className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
          strokeWidth={1.8}
        />
        <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
          <strong className="font-semibold text-[#351522]">
            Store Settings (Demo Configuration):
          </strong>{' '}
          Editable placeholders are shown where verified business details,
          wallet account numbers, and delivery charges are not yet configured.
          No real payment credentials or shipping fees are fabricated; changes
          persist in the current session until backend APIs are connected.
        </p>
      </div>

      {savedSuccess && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-[#F2F7F4] border border-[#1F4E37]/35 flex items-center gap-2 text-xs font-medium text-[#1F4E37]"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={1.7} />
          <span>Store settings updated in the current admin workspace session.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Store Name, Contact Information & Currency */}
        <section className="lg:col-span-6 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-4">
          <h2 className="font-serif text-2xl font-medium text-[#351522] pb-3 border-b border-[#D6AD72]/25">
            Store Identity &amp; Contact
          </h2>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-medium text-[#351522] mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={draft.storeName}
                onChange={(e) =>
                  setDraft({ ...draft, storeName: e.target.value })
                }
                placeholder="AUREMIST PERFUMERY"
                className="w-full px-3.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 focus:outline-none focus:border-[#351522]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#351522] mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={draft.tagline}
                onChange={(e) =>
                  setDraft({ ...draft, tagline: e.target.value })
                }
                placeholder="Find the notes that feel like you."
                className="w-full px-3.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 focus:outline-none focus:border-[#351522]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#351522] mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={draft.supportEmail}
                  onChange={(e) =>
                    setDraft({ ...draft, supportEmail: e.target.value })
                  }
                  placeholder="Enter verified support email"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 placeholder:text-[#5C434E]/60 focus:outline-none focus:border-[#351522]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#351522] mb-1">
                  Contact Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={draft.supportPhone}
                  onChange={(e) =>
                    setDraft({ ...draft, supportPhone: e.target.value })
                  }
                  placeholder="Enter verified business phone"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 tabular-nums placeholder:text-[#5C434E]/60 focus:outline-none focus:border-[#351522]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#351522] mb-1">
                Atelier / Business Address
              </label>
              <input
                type="text"
                value={draft.atelierAddress}
                onChange={(e) =>
                  setDraft({ ...draft, atelierAddress: e.target.value })
                }
                placeholder="Enter verified boutique / dispatch address"
                className="w-full px-3.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 placeholder:text-[#5C434E]/60 focus:outline-none focus:border-[#351522]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#351522] mb-1">
                  Store Currency
                </label>
                <input
                  type="text"
                  value={draft.currencyLabel}
                  onChange={(e) =>
                    setDraft({ ...draft, currencyLabel: e.target.value })
                  }
                  placeholder="PKR (Rs.)"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 focus:outline-none focus:border-[#351522]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#351522] mb-1">
                  Low-Stock Threshold (Units)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={draft.lowStockThreshold}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      lowStockThreshold: Math.max(
                        1,
                        Number(e.target.value) || 5,
                      ),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 tabular-nums focus:outline-none focus:border-[#351522]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Payment Methods & Manual Wallet Instructions */}
        <section className="lg:col-span-6 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-4">
          <h2 className="font-serif text-2xl font-medium text-[#351522] pb-3 border-b border-[#D6AD72]/25">
            Payment Method Toggles &amp; Wallet Instructions
          </h2>

          <div className="space-y-3 text-xs sm:text-sm">
            {[
              {
                key: 'codEnabled' as const,
                title: 'Cash on Delivery (COD)',
                subtitle: 'Allow customers to pay upon courier delivery.',
              },
              {
                key: 'easypaisaEnabled' as const,
                title: 'Easypaisa (Manual Verification)',
                subtitle:
                  'Require transaction ID and private receipt screenshot before fulfillment.',
              },
              {
                key: 'jazzcashEnabled' as const,
                title: 'JazzCash (Manual Verification)',
                subtitle:
                  'Require transaction ID and private receipt screenshot before fulfillment.',
              },
            ].map((toggle) => {
              const enabled = draft[toggle.key];
              return (
                <div
                  key={toggle.key}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/45"
                >
                  <div>
                    <p className="font-medium text-[#351522]">{toggle.title}</p>
                    <p className="text-[11px] text-[#5C434E]">
                      {toggle.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({ ...draft, [toggle.key]: !enabled })
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer shrink-0 ${
                      enabled
                        ? 'bg-[#F2F7F4] border-[#1F4E37]/35 text-[#1F4E37]'
                        : 'bg-[#FFF5E9] border-[#D6AD72]/60 text-[#5C434E]'
                    }`}
                  >
                    {enabled ? (
                      <>
                        <ToggleRight className="w-4 h-4" strokeWidth={1.7} />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" strokeWidth={1.7} />
                        <span>Disabled</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}

            <div>
              <label className="block text-xs font-medium text-[#351522] mb-1">
                Easypaisa / JazzCash Receiver Number (Placeholder until configured)
              </label>
              <input
                type="text"
                value={draft.walletRecipientNumber}
                onChange={(e) =>
                  setDraft({ ...draft, walletRecipientNumber: e.target.value })
                }
                placeholder="Enter verified merchant mobile wallet number"
                className="w-full px-3.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 tabular-nums placeholder:text-[#5C434E]/60 focus:outline-none focus:border-[#351522]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#351522] mb-1">
                Easypaisa / JazzCash Payment Instructions
              </label>
              <textarea
                rows={3}
                value={draft.walletInstructions}
                onChange={(e) =>
                  setDraft({ ...draft, walletInstructions: e.target.value })
                }
                placeholder="Enter verified account title and step-by-step transfer instructions to display once live wallet details are ready."
                className="w-full px-3.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs placeholder:text-[#5C434E]/60 focus:outline-none focus:border-[#351522]"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Delivery Zones & Shipping Charges */}
      <section className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-4">
        <div className="pb-3 border-b border-[#D6AD72]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-2xl font-medium text-[#351522]">
              Delivery Zones &amp; Shipping Charges
            </h2>
            <p className="text-xs text-[#5C434E]">
              Manage active regional courier zones and PKR shipping rates applied during customer checkout.
            </p>
          </div>
        </div>

        {draft.deliveryZones.length === 0 ? (
          <div className="p-5 rounded-lg bg-[#F8F0E7] border border-dashed border-[#D6AD72]/65 text-center space-y-1">
            <p className="text-sm font-medium text-[#351522]">
              No delivery zones or shipping fees configured yet
            </p>
            <p className="text-xs text-[#5C434E]">
              No placeholder fees have been invented. Add your actual courier
              zones and PKR charges using the form below.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#D6AD72]/25">
            {draft.deliveryZones.map((zone) => (
              <div
                key={zone.id}
                className="py-3 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center text-xs"
              >
                <div className="lg:col-span-4">
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-[#5C434E] mb-1">
                    Zone &amp; Region
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={zone.name}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          deliveryZones: prev.deliveryZones.map((z) =>
                            z.id === zone.id ? { ...z, name: e.target.value } : z,
                          ),
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs font-medium text-[#351522]"
                    />
                    <input
                      type="text"
                      value={zone.region}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          deliveryZones: prev.deliveryZones.map((z) =>
                            z.id === zone.id
                              ? { ...z, region: e.target.value }
                              : z,
                          ),
                        }))
                      }
                      className="w-32 px-2.5 py-1.5 rounded bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs text-[#5C434E]"
                    />
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-[#5C434E] mb-1">
                    Estimated Window
                  </label>
                  <input
                    type="text"
                    value={zone.estimatedWindow}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        deliveryZones: prev.deliveryZones.map((z) =>
                          z.id === zone.id
                            ? { ...z, estimatedWindow: e.target.value }
                            : z,
                        ),
                      }))
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-[#5C434E] mb-1">
                    Fee (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={zone.feePkr}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        deliveryZones: prev.deliveryZones.map((z) =>
                          z.id === zone.id
                            ? {
                                ...z,
                                feePkr: Math.max(0, Number(e.target.value) || 0),
                              }
                            : z,
                        ),
                      }))
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs font-semibold tabular-nums"
                  />
                </div>

                <div className="lg:col-span-3 flex items-center justify-end gap-2 pt-3 lg:pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        deliveryZones: prev.deliveryZones.map((z) =>
                          z.id === zone.id ? { ...z, active: !z.active } : z,
                        ),
                      }))
                    }
                    className={`px-3 py-1.5 rounded border text-[11px] font-medium cursor-pointer ${
                      zone.active
                        ? 'bg-[#F2F7F4] border-[#1F4E37]/35 text-[#1F4E37]'
                        : 'bg-[#F8F0E7] border-[#D6AD72]/60 text-[#5C434E]'
                    }`}
                  >
                    {zone.active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        deliveryZones: prev.deliveryZones.filter(
                          (z) => z.id !== zone.id,
                        ),
                      }))
                    }
                    aria-label={`Remove ${zone.name}`}
                    className="p-1.5 rounded border border-[#7A1D38]/35 bg-[#FDF3F5] text-[#7A1D38] hover:bg-[#7A1D38] hover:text-[#FFF5E9] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {zoneError && (
          <p className="text-xs text-[#7A1D38] font-medium">{zoneError}</p>
        )}

        <div className="pt-4 border-t border-[#D6AD72]/25 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-medium text-[#351522] mb-1">
              Zone Name
            </label>
            <input
              type="text"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              placeholder="Enter delivery zone name"
              className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-medium text-[#351522] mb-1">
              Region / City
            </label>
            <input
              type="text"
              value={newZoneRegion}
              onChange={(e) => setNewZoneRegion(e.target.value)}
              placeholder="Enter region or city"
              className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-[#351522] mb-1">
              Fee (PKR)
            </label>
            <input
              type="number"
              min={0}
              step={50}
              value={newZoneFee}
              onChange={(e) => setNewZoneFee(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs tabular-nums"
            />
          </div>
          <div className="sm:col-span-3 flex gap-2">
            <input
              type="text"
              value={newZoneWindow}
              onChange={(e) => setNewZoneWindow(e.target.value)}
              placeholder="Delivery window"
              aria-label="Estimated delivery window"
              className="w-full px-2.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs"
            />
            <button
              type="button"
              onClick={handleAddZone}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.7} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-sm font-medium hover:bg-[#240D16] transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#D6AD72]" strokeWidth={1.7} />
          <span>Save Store Settings</span>
        </button>
      </div>
    </form>
  );
}
