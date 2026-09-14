import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  QrCode,
  Users,
  BarChart3,
  Settings,
  ShoppingBag,
  LogOut,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Products & Barcodes', icon: Package },
    { to: '/inventory', label: 'Inventory Management', icon: Boxes },
    { to: '/orders', label: 'Orders Ledger', icon: ShoppingCart },
    { to: '/payments', label: 'Payments & Settlement', icon: CreditCard },
    { to: '/exit-verifier', label: 'Exit Gate Verifier', icon: QrCode },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-60 bg-sidebar text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800 shrink-0 sticky top-0 h-screen select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-snug">Scan. Pay. Go.</h2>
            <p className="text-[11px] text-slate-400 font-medium">Self-Checkout Admin</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Left 3px Active Indicator Line */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r" />
                  )}
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-medium transition-colors ${
              isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`
          }
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Store Settings</span>
        </NavLink>

        <div className="pt-2 flex items-center justify-between px-3 py-2 bg-slate-900/50 rounded border border-slate-800/80">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Store Admin'}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user?.role || 'ADMIN'}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
