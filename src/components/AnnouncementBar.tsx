import { motion } from 'motion/react';
import { LUXURY_EASE } from '../lib/motion';

interface AnnouncementBarProps {
  onOpenTrackOrder: () => void;
}

export function AnnouncementBar({ onOpenTrackOrder }: AnnouncementBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: LUXURY_EASE }}
      className="bg-[#430F25] text-[#FFF5E9] border-b border-[#C69A50]/35"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-9 flex items-center justify-between gap-4 text-[11px] sm:text-xs tracking-wide">
        <div className="flex items-center gap-3 sm:gap-4 truncate">
          <span className="whitespace-nowrap font-medium text-[#FFF5E9]">
            Nationwide Courier Delivery
          </span>
          <span className="hidden sm:inline text-[#C69A50]" aria-hidden="true">
            ·
          </span>
          <span className="hidden sm:inline text-[#F8EBDD] whitespace-nowrap">
            Discover Your Signature Scent
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={onOpenTrackOrder}
            className="text-[#F8EBDD] hover:text-[#DFBC7E] transition-colors duration-200 underline-offset-4 hover:underline whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C69A50]"
          >
            Track Your Order
          </button>
          <span className="text-[#C69A50]/70" aria-hidden="true">
            |
          </span>
          <a
            href="#contact"
            className="text-[#F8EBDD] hover:text-[#DFBC7E] transition-colors duration-200 underline-offset-4 hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C69A50]"
          >
            Contact Us
          </a>
        </div>
      </div>
    </motion.div>
  );
}
