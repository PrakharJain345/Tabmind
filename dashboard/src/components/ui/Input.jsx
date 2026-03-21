import React from 'react';

/**
 * Reusable Input component with focus-glow states.
 * @param {Object} props
 * @param {string} [props.placeholder]
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {React.ReactNode} [props.icon]
 * @param {Function} [props.onKeyDown]
 * @param {string} [props.type]
 * @param {string} [props.className]
 */
const Input = ({ 
  placeholder, 
  value, 
  onChange, 
  icon, 
  onKeyDown, 
  type = 'text',
  className = '',
  ...props 
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      {icon && (
        <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`
          bg-[rgba(255,255,255,0.04)] 
          border border-[var(--border-default)] 
          rounded-md py-[10px] px-[14px] 
          ${icon ? 'pl-[42px]' : ''}
          font-ui text-base text-text-primary 
          w-full outline-none transition-all duration-150
          placeholder:text-text-muted
          focus:border-[var(--purple-500)] 
          focus:shadow-purple 
          focus:bg-[rgba(255,255,255,0.06)]
        `}
        {...props}
      />
    </div>
  );
};

export default Input;
