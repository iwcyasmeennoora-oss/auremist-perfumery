import { useState } from 'react';

interface LuxuryImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  loading?: 'eager' | 'lazy';
}

export function LuxuryImage({
  src,
  alt,
  className = '',
  fallbackTitle = 'AUREMIST PERFUMERY',
  loading = 'lazy',
}: LuxuryImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F4EDE2] via-[#EAE0D0] to-[#DFD0BC] text-[#4A192C] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
          className="mb-3 text-[#B89352]"
        >
          <rect x="11" y="4" width="10" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <path d="M13 9V12H19V9" stroke="currentColor" strokeWidth="1.25" />
          <rect x="7" y="12" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.25" />
        </svg>
        <span className="font-serif text-lg tracking-wide">{fallbackTitle}</span>
        <span className="text-xs text-[#614E54] mt-1">Eau de Parfum</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
