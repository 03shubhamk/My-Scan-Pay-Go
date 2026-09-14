import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  QrCode,
  X,
  ExternalLink,
} from 'lucide-react';
import { useNotifications, NotificationType, ToastAlert } from '../context/NotificationContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();
  const navigate = useNavigate();

  if (toasts.length === 0) return null;

  const getToastIcon = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <ShoppingBag className="w-4 h-4" />
          </div>
        );
      case 'payment':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
            <CreditCard className="w-4 h-4" />
          </div>
        );
      case 'inventory':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'exit':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/20">
            <QrCode className="w-4 h-4" />
          </div>
        );
    }
  };

  const handleToastClick = (toast: ToastAlert) => {
    removeToast(toast.id);
    if (toast.link) {
      navigate(toast.link);
    }
  };

  return (
    <aside aria-label="System Notifications" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white rounded-xl shadow-xl border border-slate-200/80 p-4 flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in hover:shadow-2xl"
        >
          {/* Leading Icon */}
          {getToastIcon(toast.type)}

          {/* Toast Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-text-primary truncate">{toast.title}</h4>
              <span className="text-[10px] text-slate-400">Just now</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
              {toast.message}
            </p>

            {/* Quick Action Button */}
            {toast.link && (
              <button
                onClick={() => handleToastClick(toast)}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                <span>View details</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Close Dismiss Button */}
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </aside>
  );
};
