import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { COLLECTION_BANNER_IMAGE } from '../data/fragrances';
import {
  LUXURY_EASE,
  staggerContainerVariants,
  staggerItemVariants,
  VIEWPORT_ONCE,
} from '../lib/motion';
import { LuxuryImage } from './LuxuryImage';

interface LuxuryGiftBannerProps {
  onShopCollection: () => void;
}

export function LuxuryGiftBanner({ onShopCollection }: LuxuryGiftBannerProps) {
  return (
    <section
      aria-label="Signature scent collection banner"
      className="relative w-full min-h-[440px] sm:min-h-[480px] lg:min-h-[540px] flex items-center bg-[#430F25] text-[#FFF5E9] overflow-hidden border-b border-[#C69A50]/30"
    >
      {/* Full-Width Deep Burgundy & Gold Editorial Perfume Photograph */}
      <motion.div
        initial={{ opacity: 0.85, scale: 1.04 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={VIEWPORT_ONCE}
        transition={{ duration: 1.1, ease: LUXURY_EASE }}
        className="absolute inset-0"
      >
        <LuxuryImage
          src={COLLECTION_BANNER_IMAGE}
          alt="AUREMIST faceted crystal perfume bottle resting on deep burgundy velvet beside dark damask roses"
          fallbackTitle="AUREMIST PERFUMERY"
          className="w-full h-full object-cover object-left md:object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#2B0817]/95 via-[#430F25]/65 to-[#430F25]/15 lg:bg-gradient-to-l lg:from-[#2B0817]/95 lg:via-[#430F25]/70 lg:to-transparent"
        />
      </motion.div>

      {/* Right-Aligned Minimal Editorial Copy */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 py-16 sm:py-20 flex justify-end">
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="w-full lg:w-[44%]"
        >
          <motion.p
            variants={staggerItemVariants}
            className="text-[11px] tracking-[0.26em] uppercase text-[#C69A50] font-semibold mb-3"
          >
            AUREMIST Atelier
          </motion.p>

          <motion.h2
            variants={staggerItemVariants}
            className="font-serif text-4xl sm:text-5xl font-medium leading-[1.08] text-[#FFF5E9] mb-4"
          >
            Find Your Signature Scent
          </motion.h2>

          <motion.p
            variants={staggerItemVariants}
            className="text-sm sm:text-[15px] text-[#FFF5E9]/85 leading-relaxed max-w-sm mb-8"
          >
            Timeless Eau de Parfum compositions crafted to linger from dawn
            until dusk.
          </motion.p>

          <motion.div variants={staggerItemVariants}>
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: LUXURY_EASE }}
              onClick={onShopCollection}
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-lg bg-[#C69A50] text-[#26151D] text-sm font-semibold tracking-wide hover:bg-[#FFF5E9] transition-colors duration-200 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF5E9]"
            >
              <span>Shop Collection</span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                strokeWidth={1.75}
              />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
