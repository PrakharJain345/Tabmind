import React from 'react';

/**
 * Reusable Button component with design-system variants.
 * @param {Object} props
 * @param {'primary'|'secondary'|'danger'|'icon'} props.variant
 * @param {React.ReactNode} props.children
 * @param {Function} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
const Button = ({ 
  variant = 'primary', 
  children, 
  onClick, 
  disabled = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center gap-2 rounded-md transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";
  
  const variants = {
    primary: "bg-[var(--purple-500)] text-white px-5 py-[10px] font-semibold shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:bg-[var(--purple-400)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.5)] hover:-translate-y-[1px]",
    secondary: "bg-transparent text-text-secondary border border-[var(--border-default)] px-5 py-[10px] font-medium hover:bg-bg-elevated hover:text-text-primary hover:border-[var(--border-active)]",
    danger: "bg-[rgba(239,68,68,0.15)] text-[#EF4444] border border-[rgba(239,68,68,0.3)] px-5 py-[10px] hover:bg-[rgba(239,68,68,0.25)]",
    icon: "bg-bg-elevated border border-[var(--border-subtle)] p-2 text-text-secondary hover:bg-bg-overlay hover:text-text-primary",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
