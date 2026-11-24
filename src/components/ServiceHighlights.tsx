import { motion } from 'motion/react';
import { Award, Headphones, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import { SERVICE_HIGHLIGHTS } from '../data/fragrances';
import {
  LUXURY_EASE,
  staggerContainerVariants,
  staggerItemVariants,
  VIEWPORT_ONCE,
} from '../lib/motion';

const ICON_MAP = {
  quality: Award,
  shipping: Truck,
  security: ShieldCheck,
  support: Headphones,
  returns: RefreshCw,
} as const;

export function ServiceHighlights() {
  return (
    <section
      aria-label="Service benefits"
      className="bg-[#FFF5E9] border-b border-[#C69A50]/25"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-7">
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-5 gap-x-4 lg:gap-0 lg:divide-x lg:divide-[#C69A50]/35"
        >
          {SERVICE_HIGHLIGHTS.map((item, index) => {
            const Icon = ICON_MAP[item.id as keyof typeof ICON_MAP];
            const isLastOddMobile = index === SERVICE_HIGHLIGHTS.length - 1;
            return (
              <motion.div
                key={item.id}
                variants={staggerItemVariants}
                className={`group flex flex-col items-center text-center justify-center px-3 lg:px-5 ${
                  isLastOddMobile ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2, ease: LUXURY_EASE }}
                >
                  <Icon
                    className="w-5 h-5 text-[#C69A50] mb-2 transition-transform duration-200 group-hover:scale-110"
                    strokeWidth={1.5}
                  />
                </motion.div>
                <h2 className="font-serif text-lg font-semibold text-[#430F25] leading-tight whitespace-nowrap">
                  {item.title}
                </h2>
                <p className="text-xs text-[#26151D]/70 mt-0.5 whitespace-nowrap">
                  {item.detail}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
