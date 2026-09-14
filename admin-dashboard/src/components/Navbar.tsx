import React from 'react';
import { Search, WifiOff, User } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { useNotifications } from '../context/NotificationContext';

export interface HeaderProps {
  pageTitle?: string;
}

export const Navbar: React.FC<HeaderProps> = ({ pageTitle = 'Dashboard Overview' }) => {
  const { user } = useAuth();
  const { socketStatus } = useNotifications();

  return (
    <header className="h-16 bg-white border-b border-surface-border px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title & Page Header */}
      <div>
        <h1 className="text-lg font-bold text-text-primary">{pageTitle}</h1>
        <p className="text-xs text-text-muted">Real-time Retail Operations & Exit Control</p>
      </div>

      {/* Center Quick Search */}
      <div className="hidden md:flex items-center w-72">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, barcodes, products..."
            className="w-full bg-slate-50 border border-surface-border text-xs rounded-md h-9 pl-9 pr-3 text-text-primary placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3.5">
        {/* System & Socket Sync Indicator */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            socketStatus === 'connected'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : socketStatus === 'connecting'
              ? 'bg-amber-50 border-amber-200 text-amber-800 animate-pulse'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          {socketStatus === 'connected' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-600" />
              <span>REST Fallback</span>
            </>
          )}
        </div>

        {/* Live Notification Dropdown Popover */}
        <NotificationDropdown />

        {/* User Profile Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-surface-border">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 font-semibold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-text-primary">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-text-muted truncate max-w-[120px]">{user?.email || 'admin@scanpaygo.com'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
