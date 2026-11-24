import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { ABOUT_ATELIER_IMAGE } from '../data/fragrances';
import {
  LUXURY_EASE,
  staggerContainerVariants,
  staggerItemVariants,
  VIEWPORT_ONCE,
} from '../lib/motion';
import { LuxuryImage } from './LuxuryImage';

interface AtelierStoryAndFaqProps {
  onDiscoverStory: () => void;
}

export function AtelierStoryAndFaq({
  onDiscoverStory,
}: AtelierStoryAndFaqProps) {
  return (
    <section
      id="about"
      className="bg-[#FFF5E9] py-20 sm:py-24 border-b border-[#C69A50]/25 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Minimal Two-Column Perfume Photography */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT_ONCE}
            transition={{ duration: 0.75, ease: LUXURY_EASE }}
            className="lg:col-span-6"
          >
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[#C69A50]/30 bg-[#FFF5E9] group">
              <LuxuryImage
                src={ABOUT_ATELIER_IMAGE}
                alt="Auremist Perfumery atelier table with glass essence flacons, brass pipette, and damask rose petals"
                fallbackTitle="AUREMIST ATELIER"
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </div>
          </motion.div>

          {/* Short Brand Introduction */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="lg:col-span-6 lg:pl-6"
          >
            <motion.p
              variants={staggerItemVariants}
              className="text-[11px] tracking-[0.26em] uppercase text-[#C69A50] font-semibold mb-3"
            >
              About Auremist
            </motion.p>

            <motion.h2
              variants={staggerItemVariants}
              className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-medium text-[#430F25] mb-5 leading-tight"
            >
              The Art of Fragrance
            </motion.h2>

            <motion.p
              variants={staggerItemVariants}
              className="text-base text-[#26151D]/80 leading-relaxed max-w-md mb-8"
            >
              A considered collection of scents, crafted to leave a lasting
              impression.
            </motion.p>

            <motion.div variants={staggerItemVariants}>
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: LUXURY_EASE }}
                onClick={onDiscoverStory}
                className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-lg bg-[#430F25] text-[#FFF5E9] text-sm font-medium tracking-wide border border-[#C69A50] hover:bg-[#2B0817] transition-colors duration-200 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C69A50]"
              >
                <span>Discover Our Story</span>
                <ArrowRight
                  className="w-4 h-4 text-[#C69A50] transition-transform duration-200 group-hover:translate-x-1"
                  strokeWidth={1.6}
                />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
