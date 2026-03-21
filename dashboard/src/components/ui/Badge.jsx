import React from 'react';
import { 
  Circle, 
  CheckCircle2, 
  Bookmark, 
  AlertCircle, 
  Clock 
} from 'lucide-react';

const statusConfig = {
  open: {
    label: 'Open',
    className: 'bg-[var(--info-bg)] text-[#60A5FA] border-[rgba(59,130,246,0.25)]',
    icon: Circle
  },
  done: {
    label: 'Fulfilled',
    className: 'bg-[var(--success-bg)] text-[#34D399] border-[rgba(16,185,129,0.25)]',
    icon: CheckCircle2
  },
  saved: {
    label: 'Saved',
    className: 'bg-[var(--warning-bg)] text-[#FBBF24] border-[rgba(245,158,11,0.25)]',
    icon: Bookmark
  },
  abandoned: {
    label: 'Abandoned',
    className: 'bg-[var(--danger-bg)] text-[#F87171] border-[rgba(239,68,68,0.25)]',
    icon: AlertCircle
  },
  pending: {
    label: 'Pending',
    className: 'bg-[rgba(148,163,184,0.1)] text-text-muted border-[var(--border-subtle)]',
    icon: Clock
  }
};

/**
 * Status Badge component for Tabs.
 * @param {Object} props
 * @param {'open'|'done'|'saved'|'abandoned'|'pending'} props.status
 * @param {string} [props.label]
 */
const Badge = ({ status, label }) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`
      inline-flex items-center gap-[5px] px-[10px] py-[3px] 
      rounded-full border text-[11px] font-semibold 
      uppercase tracking-[0.5px] 
      ${config.className}
    `}>
      <Icon size={12} />
      {label || config.label}
    </span>
  );
};

export default Badge;
