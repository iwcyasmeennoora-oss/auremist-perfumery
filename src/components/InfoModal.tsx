import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FileText, HelpCircle, Package, ShieldCheck, Sparkles, User, X } from 'lucide-react';
import { FAQ_ITEMS } from '../data/fragrances';
import { LUXURY_EASE } from '../lib/motion';

export type InfoModalType =
  | 'account'
  | 'track-order'
  | 'story'
  | 'faq'
  | 'privacy'
  | 'terms'
  | null;

interface InfoModalProps {
  type: InfoModalType;
  onClose: () => void;
  onExploreShop: () => void;
}

export function InfoModal({ type, onClose, onExploreShop }: InfoModalProps) {
  useEffect(() => {
    if (!type) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type, onClose]);

  const content = type
    ? {
        account: {
          icon: User,
          kicker: 'Member Atelier · Frontend Preview',
          title: 'Private Client Account',
          body: 'Client profiles, saved scent wardrobes, and order history are reserved for our upcoming backend release. In this storefront stage, you can freely browse fragrances and curate your local shopping bag.',
          cta: 'Continue Exploring',
        },
        'track-order': {
          icon: Package,
          kicker: 'Courier Concierge · Frontend Preview',
          title: 'Order Tracking & Dispatch',
          body: 'Live order lookup will connect to our fulfillment system in the next development phase. For current boutique inquiries, reach our concierge directly at concierge@auremist.com.',
          cta: 'Return to Boutique',
        },
        story: {
          icon: Sparkles,
          kicker: 'The House of Auremist',
          title: 'The Art of Fragrance',
          body: 'Founded on the belief that scent is an intimate signature, Auremist Perfumery composes small-batch Eau de Parfum from cold-pressed botanicals, Damascus rose, and slow-aged woods—rested eight weeks for quiet, enduring presence.',
          cta: 'Explore Collection',
        },
        faq: {
          icon: HelpCircle,
          kicker: 'Atelier Guidance',
          title: 'Frequently Asked Questions',
          body: '',
          cta: 'Shop Collection',
        },
        privacy: {
          icon: ShieldCheck,
          kicker: 'Client Privacy',
          title: 'Privacy Policy',
          body: 'Shopping bag and wishlist preferences in this frontend preview are stored locally in your browser. Checkout details and wallet payment screenshots are processed privately and will be protected by server-side access controls once backend services connect.',
          cta: 'Close Policy',
        },
        terms: {
          icon: FileText,
          kicker: 'Boutique Terms',
          title: 'Terms of Service',
          body: 'All AUREMIST PERFUMERY fragrances are listed in PKR. Unopened, sealed bottles qualify for 30-day returns or exchanges. Final pricing, coupon validity, stock allocation, and regional shipping charges are confirmed by backend order processing.',
          cta: 'Close Terms',
        },
      }[type]
    : null;

  return (
    <AnimatePresence>
      {type && content && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={content.title}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: LUXURY_EASE }}
            className="fixed inset-0 bg-[#26151D]/55 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
            className="relative z-10 w-full max-w-md rounded-xl bg-[#FFF5E9] border border-[#C69A50]/45 p-7 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute top-4 right-4 p-1.5 text-[#5C434E] hover:text-[#430F25] cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>

            <div className="w-10 h-10 rounded-full border border-[#C69A50]/45 bg-[#F8EBDD] flex items-center justify-center mb-4">
              <content.icon
                className="w-4 h-4 text-[#430F25]"
                strokeWidth={1.6}
              />
            </div>

            <p className="text-[11px] tracking-[0.18em] uppercase text-[#C69A50] font-semibold mb-2">
              {content.kicker}
            </p>

            <h2 className="font-serif text-3xl font-medium text-[#430F25] mb-3">
              {content.title}
            </h2>

            {type === 'faq' ? (
              <div className="divide-y divide-[#C69A50]/25 mb-6">
                {FAQ_ITEMS.map((item) => (
                  <div key={item.id} className="py-3.5">
                    <h3 className="font-serif text-lg font-medium text-[#26151D] mb-1">
                      {item.question}
                    </h3>
                    <p className="text-xs text-[#5C434E] leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#5C434E] leading-relaxed mb-7">
                {content.body}
              </p>
            )}

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onClose();
                if (type === 'story' || type === 'faq') {
                  onExploreShop();
                }
              }}
              className="w-full py-3 px-6 rounded-lg bg-[#430F25] text-[#FFF5E9] border border-[#C69A50]/45 text-xs font-medium tracking-wide hover:bg-[#2B0817] transition-colors cursor-pointer"
            >
              {content.cta}
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
