import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { LUXURY_EASE } from '../lib/motion';
import { AppPage } from '../types/perfume';
import { FloralEmblem } from './FloralEmblem';

interface NavbarProps {
  currentPage: AppPage;
  cartCount: number;
  wishlistCount: number;
  onNavigate: (page: AppPage, sectionId?: string) => void;
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
  onOpenAccount: () => void;
  onOpenCart: () => void;
  onOpenFaq: () => void;
}

const NAV_LINKS = [
  { label: 'Home', page: 'home' as AppPage, sectionId: 'home' },
  { label: 'Shop', page: 'shop' as AppPage, sectionId: undefined },
  { label: 'Categories', page: 'home' as AppPage, sectionId: 'categories' },
  { label: 'About', page: 'home' as AppPage, sectionId: 'about' },
  { label: 'FAQ', page: 'home' as AppPage, sectionId: undefined },
  { label: 'Contact', page: 'home' as AppPage, sectionId: 'contact' },
];

export function Navbar({
  currentPage,
  cartCount,
  wishlistCount,
  onNavigate,
  onOpenSearch,
  onOpenWishlist,
  onOpenAccount,
  onOpenCart,
  onOpenFaq,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: LUXURY_EASE }}
      className="sticky top-0 z-40 bg-[#FFF5E9]/95 backdrop-blur-md border-b border-[#C69A50]/25"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 md:h-[72px] grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-4 lg:gap-8">
        {/* Left: AUREMIST Wordmark & Gold Floral Emblem */}
        <div className="flex items-center gap-2.5 justify-self-start shrink-0">
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 -ml-2 text-[#26151D] hover:text-[#430F25] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#430F25]"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            )}
          </motion.button>

          <button
            type="button"
            onClick={() => onNavigate('home', 'home')}
            className="inline-flex items-center gap-2 sm:gap-2.5 whitespace-nowrap shrink-0 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#430F25]"
          >
            <FloralEmblem className="w-5 h-5 sm:w-6 sm:h-6 text-[#C69A50] transition-transform duration-300 group-hover:rotate-12" />
            <span className="font-serif text-[19px] sm:text-[26px] font-semibold tracking-[0.12em] sm:tracking-[0.16em] text-[#430F25]">
              AUREMIST
            </span>
          </button>
        </div>

        {/* Center: Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center justify-center gap-7 lg:gap-9 text-[13px] font-medium tracking-[0.06em] text-[#26151D]"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              (link.label === 'Home' && currentPage === 'home') ||
              (link.label === 'Shop' &&
                (currentPage === 'shop' || currentPage === 'product'));

            return link.label === 'FAQ' ? (
              <button
                key={link.label}
                type="button"
                onClick={onOpenFaq}
                className="relative py-1 whitespace-nowrap shrink-0 hover:text-[#430F25] transition-colors duration-200 cursor-pointer after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-0 after:bg-[#C69A50] hover:after:w-full after:transition-all after:duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#430F25]"
              >
                {link.label}
              </button>
            ) : (
              <button
                key={link.label}
                type="button"
                onClick={() => onNavigate(link.page, link.sectionId)}
                className={`relative py-1 whitespace-nowrap shrink-0 hover:text-[#430F25] transition-colors duration-200 cursor-pointer after:absolute after:left-0 after:bottom-0 after:h-[1px] after:bg-[#C69A50] after:transition-all after:duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#430F25] ${
                  isActive
                    ? 'text-[#430F25] after:w-full'
                    : 'after:w-0 hover:after:w-full'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Search, Wishlist, Account & Shopping Bag */}
        <div className="flex items-center justify-self-end gap-0.5 sm:gap-1.5 shrink-0">
          <motion.button
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenSearch}
            aria-label="Search fragrances"
            className="p-1.5 sm:p-2.5 text-[#26151D] hover:text-[#430F25] transition-colors duration-200 min-w-[34px] min-h-[34px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#430F25]"
          >
            <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenWishlist}
            aria-label={`Wishlist with ${wishlistCount} saved fragrances`}
            className="relative p-1.5 sm:p-2.5 text-[#26151D] hover:text-[#430F25] transition-colors duration-200 min-w-[34px] min-h-[34px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#430F25]"
          >
            <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
            <AnimatePresence>
              {wishlistCount > 0 && (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2, ease: LUXURY_EASE }}
                  className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#C69A50] text-[#26151D] border border-[#430F25]/25 text-[10px] font-semibold tabular-nums flex items-center justify-center"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenAccount}
            aria-label="Account"
            className="p-1.5 sm:p-2.5 text-[#26151D] hover:text-[#430F25] transition-colors duration-200 min-w-[34px] min-h-[34px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#430F25]"
          >
            <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenCart}
            aria-label={`Shopping bag with ${cartCount} items`}
            className="relative p-1.5 sm:p-2.5 text-[#26151D] hover:text-[#430F25] transition-colors duration-200 min-w-[34px] min-h-[34px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#430F25]"
          >
            <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2, ease: LUXURY_EASE }}
                  className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#430F25] text-[#FFF5E9] border border-[#C69A50]/60 text-[10px] font-medium tabular-nums flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
            className="md:hidden border-t border-[#C69A50]/25 bg-[#FFF5E9]"
          >
            <nav
              aria-label="Mobile navigation"
              className="px-6 py-4 flex flex-col divide-y divide-[#C69A50]/20"
            >
              {NAV_LINKS.map((link) =>
                link.label === 'FAQ' ? (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenFaq();
                    }}
                    className="py-3.5 text-sm font-medium tracking-wide text-[#26151D] hover:text-[#430F25] transition-colors min-h-[44px] flex items-center justify-between w-full text-left cursor-pointer"
                  >
                    <span>{link.label}</span>
                    <span className="text-[#C69A50] text-xs" aria-hidden="true">
                      →
                    </span>
                  </button>
                ) : (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate(link.page, link.sectionId);
                    }}
                    className="py-3.5 text-sm font-medium tracking-wide text-[#26151D] hover:text-[#430F25] transition-colors min-h-[44px] flex items-center justify-between w-full text-left cursor-pointer"
                  >
                    <span>{link.label}</span>
                    <span className="text-[#C69A50] text-xs" aria-hidden="true">
                      →
                    </span>
                  </button>
                ),
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
