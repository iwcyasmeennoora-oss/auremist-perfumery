import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { HERO_IMAGE } from '../data/fragrances';
import { LUXURY_EASE } from '../lib/motion';
import { LuxuryImage } from './LuxuryImage';

interface HeroSectionProps {
  onShopCollection: () => void;
}

export function HeroSection({ onShopCollection }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative w-full bg-[#FFF5E9] overflow-hidden border-b border-[#C69A50]/25"
    >
      <div className="relative md:min-h-[540px] lg:min-h-[620px] xl:min-h-[660px] flex flex-col md:flex-row md:items-center">
        {/* Desktop & Tablet Full-Bleed Campaign Image */}
        <motion.div
          initial={{ opacity: 0.85, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: LUXURY_EASE }}
          className="hidden md:block absolute inset-0 bg-[#FFF5E9]"
        >
          <LuxuryImage
            src={HERO_IMAGE}
            alt="AUREMIST Eau de Parfum deep burgundy glass bottle with brushed gold cap surrounded by burgundy roses and silk"
            fallbackTitle="AUREMIST PERFUMERY"
            loading="eager"
            className="w-full h-full object-cover object-[75%_38%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#FFF5E9] via-[#FFF5E9]/86 md:w-[54%] lg:w-[46%] to-transparent"
          />
        </motion.div>

        {/* Left Minimal Editorial Typography */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 pt-12 pb-6 md:py-20">
          <div className="max-w-lg">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05, ease: LUXURY_EASE }}
              className="text-[11px] tracking-[0.26em] uppercase text-[#C69A50] font-semibold mb-4"
            >
              Haute Parfumerie
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: LUXURY_EASE }}
              className="font-serif text-4xl sm:text-5xl lg:text-[62px] font-medium tracking-[0.04em] leading-[1.04] text-[#430F25] mb-4"
            >
              AUREMIST PERFUMERY
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: LUXURY_EASE }}
              className="font-serif italic text-xl sm:text-2xl text-[#26151D] leading-snug mb-3"
            >
              Find the notes that feel like you.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.26, ease: LUXURY_EASE }}
              className="text-sm sm:text-[15px] text-[#26151D]/75 leading-relaxed max-w-sm mb-8"
            >
              Small-batch Eau de Parfum crafted with rare botanicals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.32, ease: LUXURY_EASE }}
            >
              <motion.button
                type="button"
                onClick={onShopCollection}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: LUXURY_EASE }}
                className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-lg bg-[#430F25] text-[#FFF5E9] text-sm font-medium tracking-wide border border-[#C69A50] hover:bg-[#2B0817] transition-colors duration-200 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C69A50]"
              >
                <span>Shop Collection</span>
                <ArrowRight
                  className="w-4 h-4 text-[#C69A50] transition-transform duration-200 group-hover:translate-x-1"
                  strokeWidth={1.6}
                />
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Uncropped Bottle Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.15, ease: LUXURY_EASE }}
          className="md:hidden relative w-full aspect-[16/10] bg-[#FFF5E9] overflow-hidden"
        >
          <LuxuryImage
            src={HERO_IMAGE}
            alt="AUREMIST Eau de Parfum deep burgundy glass bottle with brushed gold cap surrounded by burgundy roses and silk"
            fallbackTitle="AUREMIST PERFUMERY"
            loading="eager"
            className="w-full h-full object-cover object-[76%_40%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#FFF5E9] to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
