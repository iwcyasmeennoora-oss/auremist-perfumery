import { FormEvent, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import {
  fadeUpVariants,
  LUXURY_EASE,
  VIEWPORT_ONCE,
} from '../lib/motion';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'submitted'>('idle');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      return;
    }
    setStatus('submitted');
    setEmail('');
  };

  return (
    <section
      aria-label="Newsletter subscription"
      className="bg-[#FFF5E9] py-20 sm:py-24"
    >
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="max-w-xl mx-auto px-4 sm:px-8 text-center"
      >
        <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#430F25] mb-3">
          A Note of Elegance
        </h2>

        <p className="text-sm sm:text-[15px] text-[#26151D]/75 mb-8">
          Discover new arrivals and exclusive collections.
        </p>

        <AnimatePresence mode="wait">
          {status === 'submitted' ? (
            <motion.div
              key="submitted"
              role="status"
              initial={{ opacity: 0, scale: 0.96, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: LUXURY_EASE }}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg border border-[#C69A50]/45 text-sm text-[#430F25]"
            >
              <Check className="w-4 h-4 text-[#C69A50]" strokeWidth={2} />
              <span>
                Thank you—your email is noted for this preview session.
              </span>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-md mx-auto"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="Enter your email"
                aria-invalid={status === 'error'}
                className="flex-1 px-4 py-3 rounded-lg bg-[#FFF5E9] border border-[#C69A50]/45 text-sm text-[#26151D] placeholder:text-[#26151D]/45 focus:outline-none focus:border-[#430F25] transition-colors min-h-[44px]"
              />
              <motion.button
                type="submit"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15, ease: LUXURY_EASE }}
                className="px-7 py-3 rounded-lg bg-[#430F25] text-[#FFF5E9] text-sm font-medium tracking-wide border border-[#C69A50]/45 hover:bg-[#2B0817] transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C69A50]"
              >
                Subscribe
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {status === 'error' && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-[#7F1D1D] mt-3"
          >
            Please enter a valid email address.
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}
