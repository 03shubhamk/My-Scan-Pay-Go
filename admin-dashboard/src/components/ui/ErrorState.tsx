import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Failed to load data from the server. Please verify network connection or try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-6 bg-red-50/50 border border-red-200 rounded-lg flex items-start gap-4 ${className}`}>
      <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-red-900 mb-1">{title}</h4>
        <p className="text-xs text-red-700 mb-4">{message}</p>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            Retry Request
          </Button>
        )}
      </div>
    </div>
  );
};
