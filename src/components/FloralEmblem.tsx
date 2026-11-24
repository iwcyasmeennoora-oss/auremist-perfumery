interface FloralEmblemProps {
  className?: string;
}

export function FloralEmblem({ className = 'w-6 h-6' }: FloralEmblemProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Delicate 8-petal gold botanical emblem */}
      <circle cx="18" cy="18" r="2.2" fill="currentColor" />
      <path
        d="M18 4.5C20 8.5 20 12.2 18 15.2C16 12.2 16 8.5 18 4.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M18 31.5C20 27.5 20 23.8 18 20.8C16 23.8 16 27.5 18 31.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 18C8.5 16 12.2 16 15.2 18C12.2 20 8.5 20 4.5 18Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M31.5 18C27.5 16 23.8 16 20.8 18C23.8 20 27.5 20 31.5 18Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 8.5C12 10 14.5 12.5 15.8 15.8C12.5 14.5 10 12 8.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M27.5 27.5C24 26 21.5 23.5 20.2 20.2C23.5 21.5 26 24 27.5 27.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M27.5 8.5C26 12 23.5 14.5 20.2 15.8C21.5 12.5 24 10 27.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 27.5C10 24 12.5 21.5 15.8 20.2C14.5 23.5 12 26 8.5 27.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
