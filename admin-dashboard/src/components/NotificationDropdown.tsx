import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  QrCode,
  CheckCheck,
  Trash2,
  WifiOff,
  ChevronRight,
} from 'lucide-react';
import { useNotifications, AdminNotification, NotificationType } from '../context/NotificationContext';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'transactions' | 'alerts'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    socketStatus,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'transactions') {
      return item.type === 'order' || item.type === 'payment';
    }
    if (activeFilter === 'alerts') {
      return item.type === 'inventory' || item.type === 'exit';
    }
    return true;
  });

  const handleNotificationClick = (item: AdminNotification) => {
    markAsRead(item.id);
    setIsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const getEventIcon = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
        );
      case 'payment':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
        );
      case 'inventory':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'exit':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
            <QrCode className="w-4 h-4" />
          </div>
        );
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return 'Just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(isoString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-all relative ${
          isOpen
            ? 'bg-primary/10 text-primary'
            : 'text-slate-600 hover:bg-slate-100 hover:text-text-primary'
        }`}
        title="Notifications & Live Activity"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-24px)] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-text-primary">Live Activity & Alerts</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {/* Socket Status Badge */}
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                  socketStatus === 'connected'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : socketStatus === 'connecting'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title={
                  socketStatus === 'connected'
                    ? 'Connected to real-time event socket'
                    : 'Reconnecting socket (REST API fallback active)'
                }
              >
                {socketStatus === 'connected' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Socket</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-600" />
                    <span>REST Fallback</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1 mt-3">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-white text-text-primary shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-text-primary hover:bg-slate-100'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveFilter('transactions')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeFilter === 'transactions'
                    ? 'bg-white text-text-primary shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-text-primary hover:bg-slate-100'
                }`}
              >
                Orders & Pay
              </button>
              <button
                onClick={() => setActiveFilter('alerts')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeFilter === 'alerts'
                    ? 'bg-white text-text-primary shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-text-primary hover:bg-slate-100'
                }`}
              >
                Alerts & Exit
              </button>
            </div>
          </div>

          {/* Notification Items List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="text-xs font-medium text-slate-500">No recent notifications</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Real-time events will automatically stream here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors relative group ${
                    !item.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  {/* Event Icon */}
                  {getEventIcon(item.type)}

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${!item.read ? 'text-text-primary' : 'text-slate-600'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-primary absolute right-3 top-4" />
                  )}

                  {/* Hover Arrow */}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 absolute right-2.5 top-1/2 -translate-y-1/2 transition-opacity" />
                </div>
              ))
            )}
          </div>

          {/* Action Footer */}
          <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200/60 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>

            <button
              onClick={clearAll}
              disabled={notifications.length === 0}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-rose-100 text-rose-600 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear log</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
