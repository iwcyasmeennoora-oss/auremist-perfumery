import { motion } from 'motion/react';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import {
  LUXURY_EASE,
  staggerContainerVariants,
  staggerItemVariants,
  VIEWPORT_ONCE,
} from '../lib/motion';
import { AppPage } from '../types/perfume';
import { FloralEmblem } from './FloralEmblem';

interface FooterProps {
  onNavigate: (page: AppPage, sectionId?: string) => void;
  onOpenTrackOrder: () => void;
  onOpenFaq: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export function Footer({
  onNavigate,
  onOpenTrackOrder,
  onOpenFaq,
  onOpenPrivacy,
  onOpenTerms,
}: FooterProps) {
  return (
    <footer
      id="contact"
      className="bg-[#430F25] text-[#FFF5E9] border-t border-[#C69A50]/30 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-10">
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-[#C69A50]/25"
        >
          {/* Brand Lockup */}
          <motion.div variants={staggerItemVariants} className="lg:col-span-5 pr-4">
            <button
              type="button"
              onClick={() => onNavigate('home', 'home')}
              className="inline-flex items-center gap-2.5 mb-3 group cursor-pointer"
            >
              <FloralEmblem className="w-6 h-6 text-[#C69A50] transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-serif text-2xl font-semibold tracking-[0.16em] text-[#FFF5E9]">
                AUREMIST
              </span>
            </button>
            <p className="font-serif italic text-lg text-[#C69A50] mb-6">
              Find the notes that feel like you.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              <motion.a
                href="#contact"
                aria-label="Auremist on Instagram"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.2, ease: LUXURY_EASE }}
                className="w-9 h-9 rounded-full border border-[#C69A50]/45 flex items-center justify-center text-[#FFF5E9] hover:text-[#C69A50] hover:border-[#C69A50] transition-colors"
              >
                <Instagram className="w-4 h-4" strokeWidth={1.5} />
              </motion.a>
              <motion.a
                href="#contact"
                aria-label="Auremist on Pinterest"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.2, ease: LUXURY_EASE }}
                className="w-9 h-9 rounded-full border border-[#C69A50]/45 flex items-center justify-center text-[#FFF5E9] hover:text-[#C69A50] hover:border-[#C69A50] transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="w-4 h-4"
                >
                  <path d="M8 20l4-9" />
                  <path d="M10.7 14c.437 1.263 1.43 2 2.55 2c2.071 0 3.75-1.554 3.75-4a5 5 0 1 0-9.7 1.7" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </motion.a>
              <motion.a
                href="#contact"
                aria-label="Auremist on TikTok"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.2, ease: LUXURY_EASE }}
                className="w-9 h-9 rounded-full border border-[#C69A50]/45 flex items-center justify-center text-[#FFF5E9] hover:text-[#C69A50] hover:border-[#C69A50] transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="w-4 h-4"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </motion.a>
            </div>
          </motion.div>

          {/* Minimal Navigation Links */}
          <motion.div variants={staggerItemVariants} className="lg:col-span-4">
            <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C69A50] mb-4">
              Navigation
            </h3>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-sm text-[#FFF5E9]/85">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home', 'home')}
                  className="hover:text-[#C69A50] transition-colors cursor-pointer text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('shop')}
                  className="hover:text-[#C69A50] transition-colors cursor-pointer text-left"
                >
                  Shop
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home', 'categories')}
                  className="hover:text-[#C69A50] transition-colors cursor-pointer text-left"
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home', 'about')}
                  className="hover:text-[#C69A50] transition-colors cursor-pointer text-left"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenFaq}
                  className="hover:text-[#C69A50] transition-colors cursor-pointer text-left"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTrackOrder}
                  className="hover:text-[#C69A50] transition-colors cursor-pointer text-left"
                >
                  Track Order
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Contact Placeholder */}
          <motion.div variants={staggerItemVariants} className="lg:col-span-3">
            <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C69A50] mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-[#FFF5E9]/85">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C69A50] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>24 Clifton Atelier, Karachi</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C69A50] shrink-0" strokeWidth={1.5} />
                <a
                  href="mailto:concierge@auremist.com"
                  className="hover:text-[#C69A50] transition-colors"
                >
                  concierge@auremist.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C69A50] shrink-0" strokeWidth={1.5} />
                <span className="tabular-nums">+92 300 000 0000</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FFF5E9]/60">
          <p>© {new Date().getFullYear()} AUREMIST PERFUMERY. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="hover:text-[#C69A50] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={onOpenTerms}
              className="hover:text-[#C69A50] transition-colors cursor-pointer"
            >
              Terms
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
