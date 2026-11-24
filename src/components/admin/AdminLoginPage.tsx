import { FormEvent, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Info,
  Lock,
} from 'lucide-react';
import { fadeUpVariants, LUXURY_EASE } from '../../lib/motion';
import { AdminSession } from '../../types/admin';
import { FloralEmblem } from '../FloralEmblem';

interface AdminLoginPageProps {
  onSignIn: (session: AdminSession) => void;
  onReturnToStorefront: () => void;
}

export function AdminLoginPage({
  onSignIn,
  onReturnToStorefront,
}: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const nextErrors: { email?: string; password?: string; form?: string } = {};

    if (!trimmedEmail) {
      nextErrors.email = 'Please enter your admin email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Please enter your password.';
    } else if (password.length < 8) {
      nextErrors.password =
        'Password must be at least 8 characters to preview the dashboard.';
    }

    if (Object.keys(nextErrors).length > 0) {
      nextErrors.form =
        'Please correct the highlighted fields before signing in.';
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSignIn({
      email: trimmedEmail,
      signedInAt: new Date().toISOString(),
      isDemoUiSession: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#FFF5E9] text-[#26151D] flex flex-col justify-between px-4 py-8 sm:px-8">
      <div className="max-w-md w-full mx-auto">
        <button
          type="button"
          onClick={onReturnToStorefront}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#351522] hover:text-[#8C6526] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.7} />
          <span>Return to Public Storefront</span>
        </button>
      </div>

      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full mx-auto my-8 rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/50 p-7 sm:p-9 space-y-6"
      >
        <div className="text-center space-y-2 pb-5 border-b border-[#D6AD72]/30">
          <div className="inline-flex items-center justify-center gap-2.5 mb-1">
            <FloralEmblem className="w-6 h-6 text-[#D6AD72]" />
            <span className="font-serif text-2xl font-semibold tracking-[0.18em] text-[#351522]">
              AUREMIST
            </span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C6526] font-semibold">
            Store Owner Portal
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#351522]">
            Admin Sign In
          </h1>
          <p className="text-xs text-[#5C434E] leading-relaxed">
            Access order management, payment verification review, and store
            operations.
          </p>
        </div>

        {/* Honest Frontend-Only UI Notice */}
        <div className="p-3.5 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/50 flex items-start gap-2.5 text-xs text-[#26151D]">
          <Info
            className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
            strokeWidth={1.8}
          />
          <p className="leading-relaxed">
            <strong className="font-semibold text-[#351522]">
              Frontend UI Preview Only:
            </strong>{' '}
            Backend authentication is not connected yet. Real credential
            verification and session cookies will be enforced on the server when
            connected.
          </p>
        </div>

        {errors.form && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-[#FDF3F5] border border-[#7A1D38]/40 flex items-start gap-2 text-xs text-[#7A1D38]"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.8} />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="admin-login-email"
              className="block text-xs font-medium text-[#351522] mb-1.5"
            >
              Admin Email Address
            </label>
            <input
              id="admin-login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email || errors.form) {
                  setErrors((prev) => ({
                    ...prev,
                    email: undefined,
                    form: undefined,
                  }));
                }
              }}
              placeholder="owner@auremist.com"
              className={`w-full px-3.5 py-2.5 rounded-lg bg-[#FFF5E9] border text-sm text-[#26151D] placeholder:text-[#5C434E]/60 focus:outline-none ${
                errors.email
                  ? 'border-[#7A1D38]'
                  : 'border-[#D6AD72]/60 focus:border-[#351522]'
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-[#7A1D38]">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="admin-login-password"
              className="block text-xs font-medium text-[#351522] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password || errors.form) {
                    setErrors((prev) => ({
                      ...prev,
                      password: undefined,
                      form: undefined,
                    }));
                  }
                }}
                placeholder="Enter password (min. 8 characters)"
                className={`w-full pl-3.5 pr-11 py-2.5 rounded-lg bg-[#FFF5E9] border text-sm text-[#26151D] placeholder:text-[#5C434E]/60 focus:outline-none ${
                  errors.password
                    ? 'border-[#7A1D38]'
                    : 'border-[#D6AD72]/60 focus:border-[#351522]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-[#5C434E] hover:text-[#351522] cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" strokeWidth={1.6} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={1.6} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-[#7A1D38]">{errors.password}</p>
            )}
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.18, ease: LUXURY_EASE }}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-sm font-medium tracking-wide hover:bg-[#240D16] transition-colors cursor-pointer min-h-[46px]"
          >
            <Lock className="w-4 h-4 text-[#D6AD72]" strokeWidth={1.7} />
            <span>Sign In to Admin Workspace</span>
          </motion.button>
        </form>
      </motion.div>

      <p className="max-w-md w-full mx-auto text-center text-[11px] text-[#5C434E]">
        AUREMIST PERFUMERY · Private Operations Interface (Frontend Demo)
      </p>
    </div>
  );
}
