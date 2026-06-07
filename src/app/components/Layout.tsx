import { useState } from 'react';
import { User } from '../store';
import {
  LayoutDashboard, Send, Download, Upload, Building2, LogOut, Globe, Menu, X,
} from 'lucide-react';

export type UserView = 'dashboard' | 'transfer' | 'deposit' | 'withdraw' | 'sarafi';

interface LayoutProps {
  user: User;
  view: UserView;
  onViewChange: (v: UserView) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: UserView; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transfer', label: 'Send Money', icon: Send },
  { id: 'deposit', label: 'Deposit', icon: Download },
  { id: 'withdraw', label: 'Withdraw', icon: Upload },
  { id: 'sarafi', label: 'Exchange Office', icon: Building2 },
];

export function Layout({ user, view, onViewChange, onLogout, children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar overlay for mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#212529] flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Globe className="text-white w-5 h-5" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold tracking-wide">FINOVIX</div>
            <div className="text-white/50 text-xs">Money Transfer</div>
          </div>
          <button className="ml-auto lg:hidden text-white/60 hover:text-white" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-sm mb-2">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-white text-sm">{user.name}</div>
          <div className="text-white/50 text-xs mt-0.5">{user.account_number}</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { onViewChange(item.id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  view === item.id ? 'bg-white text-[#212529]' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="text-[#212529]">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-[#212529] text-sm">FINOVIX</span>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
