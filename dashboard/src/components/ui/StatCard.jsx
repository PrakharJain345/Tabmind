import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from './Card';

/**
 * Stat Card for displaying dashboard metrics.
 * @param {Object} props
 * @param {string} props.label
 * @param {string|number} props.value
 * @param {string} [props.change] - Optional e.g., "+12%" or "-5%"
 * @param {React.ReactNode} [props.icon]
 * @param {string} [props.glowColor] - Optional glow color class (shadow-purple, shadow-success, etc)
 */
const StatCard = ({ label, value, change, icon, glowColor = '' }) => {
  const isPositive = change && change.startsWith('+');
  
  return (
    <Card className={`stat-card relative flex flex-col gap-1 overflow-hidden ${glowColor}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-medium text-text-muted uppercase tracking-wider">
          {label}
        </span>
        {icon && <div className="text-[var(--purple-300)] opacity-70">{icon}</div>}
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="stat-value text-[32px] font-display font-bold text-text-primary">
          {value}
        </div>
        
        {change && (
          <div className={`
            flex items-center gap-1 text-[13px] font-bold py-1 px-2 rounded-full
            ${isPositive ? 'text-[var(--success)] bg-[var(--success-bg)]' : 'text-[var(--danger)] bg-[var(--danger-bg)]'}
          `}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </div>
        )}
      </div>

      {/* Subtle indicator line at bottom if glowColor is provided */}
      {glowColor && (
        <div className={`absolute bottom-0 left-0 w-full h-[1px] opacity-30 ${glowColor.replace('shadow-', 'bg-')}`}></div>
      )}
    </Card>
  );
};

export default StatCard;
