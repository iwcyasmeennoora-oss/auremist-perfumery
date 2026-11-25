import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CreditCard,
  RotateCcw,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react';
import { formatAdminDateTime } from '../../data/adminDemoData';
import { AdminNotificationEntry, AdminSection } from '../../types/admin';

interface AdminNotificationsViewProps {
  notifications: AdminNotificationEntry[];
  onMarkRead: (id: string) => void;
  onToggleUnread?: (id: string) => void;
  onMarkAllRead: () => void;
  onOpenRelated: (
    section: Exclude<AdminSection, 'login'>,
    orderId?: string,
  ) => void;
}

type CategoryFilter =
  | 'all'
  | 'unread'
  | 'order'
  | 'payment'
  | 'inventory'
  | 'shipment'
  | 'cancelled';

export function AdminNotificationsView({
  notifications,
  onMarkRead,
  onToggleUnread,
  onMarkAllRead,
  onOpenRelated,
}: AdminNotificationsViewProps) {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const unreadCount = notifications.filter((n) => n.unread).length;

  const visibleNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter((n) => n.unread);
    return notifications.filter((n) => n.category === filter);
  }, [notifications, filter]);

  const iconForCategory = (cat: AdminNotificationEntry['category']) => {
    if (cat === 'payment') return CreditCard;
    if (cat === 'inventory') return AlertTriangle;
    if (cat === 'shipment') return Truck;
    if (cat === 'cancelled') return XCircle;
    return ShoppingBag;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/50">
          {(
            [
              { id: 'all', label: `All (${notifications.length})` },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'order', label: 'New Orders' },
              { id: 'payment', label: 'Payments' },
              { id: 'inventory', label: 'Low Stock' },
              { id: 'shipment', label: 'Shipments' },
              { id: 'cancelled', label: 'Cancelled' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#351522] text-[#FFF5E9]'
                  : 'text-[#5C434E] hover:text-[#351522]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs font-medium text-[#351522] hover:border-[#351522] cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-[#8C6526]" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      <section className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 overflow-hidden">
        {visibleNotifications.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-2">
            <Bell className="w-6 h-6 text-[#8C6526] mx-auto" />
            <p className="font-serif text-2xl font-medium text-[#351522]">
              No notifications in this view
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#D6AD72]/25">
            {visibleNotifications.map((item) => {
              const Icon = iconForCategory(item.category);
              return (
                <li
                  key={item.id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    item.unread ? 'bg-[#FFF5E9]' : 'bg-[#F8F0E7]/45'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                        item.category === 'cancelled'
                          ? 'bg-[#FDF3F5] border-[#7A1D38]/35 text-[#7A1D38]'
                          : 'bg-[#F8F0E7] border-[#D6AD72]/55 text-[#351522]'
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.6} />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-[#351522]">
                          {item.title}
                        </span>
                        {item.unread ? (
                          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8C6526]">
                            · Unread
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#5C434E]">
                            · Read
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
                        {item.message}
                      </p>
                      <span className="block text-[11px] text-[#5C434E] tabular-nums">
                        {formatAdminDateTime(item.timestamp)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                    {item.unread ? (
                      <button
                        type="button"
                        onClick={() => onMarkRead(item.id)}
                        className="px-3 py-1.5 rounded-lg border border-[#D6AD72]/60 bg-[#F8F0E7] text-xs font-medium text-[#351522] hover:border-[#351522] cursor-pointer"
                      >
                        Mark Read
                      </button>
                    ) : (
                      onToggleUnread && (
                        <button
                          type="button"
                          onClick={() => onToggleUnread(item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D6AD72]/60 bg-[#FFF5E9] text-xs font-medium text-[#5C434E] hover:text-[#351522] hover:border-[#351522] cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Mark Unread</span>
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onMarkRead(item.id);
                        onOpenRelated(item.targetSection, item.relatedOrderId);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-xs font-medium hover:bg-[#240D16] cursor-pointer"
                    >
                      Open
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
