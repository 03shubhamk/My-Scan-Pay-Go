import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'secondary';
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  showDot = true,
  className = '',
}) => {
  const actualVariant = variant === 'secondary' ? 'neutral' : variant;

  const variantStyles = {
    success: 'bg-status-successBg text-status-successText border-emerald-200',
    warning: 'bg-status-warningBg text-status-warningText border-amber-200',
    danger: 'bg-status-dangerBg text-status-dangerText border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dotStyles = {
    success: 'bg-status-successDot',
    warning: 'bg-status-warningDot',
    danger: 'bg-status-dangerDot',
    info: 'bg-blue-500',
    neutral: 'bg-slate-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${variantStyles[actualVariant]} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[actualVariant]}`} />}
      {children}
    </span>
  );
};
