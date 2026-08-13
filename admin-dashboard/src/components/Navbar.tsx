import React from 'react';
import { Search, Bell, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export interface HeaderProps {
  pageTitle?: string;
}

export const Navbar: React.FC<HeaderProps> = ({ pageTitle = 'Dashboard Overview' }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-surface-border px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
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
      <div className="flex items-center gap-4">
        {/* System Health Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>System Healthy</span>
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </button>

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
