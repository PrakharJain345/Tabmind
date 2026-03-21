import React from 'react';

/**
 * Reusable Card component with glassmorphism styling.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {boolean} [props.accent] - If true, adds a purple left accent border.
 */
const Card = ({ children, className = '', accent = false }) => {
  return (
    <div className={`
      bg-[rgba(15,15,26,0.7)] 
      border border-[var(--border-subtle)] 
      rounded-lg p-5 
      backdrop-blur-[10px] 
      shadow-card 
      transition-all duration-200 
      hover:border-[var(--border-default)] 
      hover:shadow-elevated
      ${accent ? 'border-l-2 border-l-[var(--purple-500)]' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
