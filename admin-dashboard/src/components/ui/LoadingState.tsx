import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-slate-500 space-y-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-brand-600`} />
      <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  );
};

export const SkeletonRow: React.FC = () => {
  return (
    <div className="animate-pulse flex items-center space-x-4 py-4 px-6 border-b border-surface-border">
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
    </div>
  );
};
