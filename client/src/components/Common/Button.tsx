import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--text-main)',
          color: 'var(--text-inverse)',
          border: '1px solid var(--text-main)',
          boxShadow: '0 1px 2px rgba(27,28,29,0.08)'
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-surface-subtle)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-light)'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-main)',
          border: '1px solid var(--border-light)'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-muted)',
          border: '1px solid transparent'
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '0.35rem 0.65rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' };
      case 'lg':
        return { padding: '0.75rem 1.4rem', fontSize: '1rem', borderRadius: 'var(--radius-md)' };
      case 'md':
      default:
        return { padding: '0.55rem 1rem', fontSize: '0.875rem', borderRadius: 'var(--radius-md)' };
    }
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontWeight: 500,
        letterSpacing: '-0.01em',
        userSelect: 'none',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
    >
      {isLoading ? (
        <span
          style={{
            width: '1em',
            height: '1em',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            display: 'inline-block'
          }}
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
