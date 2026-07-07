import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle =
    'relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden';

  const variants = {
    primary:
      'bg-primary-600 hover:bg-primary-500 text-white focus:ring-primary-500 shadow-lg shadow-primary-950/20 active:scale-[0.98]',
    secondary:
      'glass-panel text-gray-200 hover:bg-white/5 border border-white/10 focus:ring-violet-500 active:scale-[0.98]',
    danger:
      'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500 active:scale-[0.98]',
    success:
      'bg-accent-emerald hover:bg-accent-emerald/80 text-white focus:ring-accent-emerald active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
};
