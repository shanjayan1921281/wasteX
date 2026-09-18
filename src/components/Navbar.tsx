import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Recycle, 
  ShoppingBag, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck
} from 'lucide-react';
import type { UserRole } from '../types';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenTests?: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenAuth,
  onOpenTests
}) => {
  const { userProfile, logoutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardRoute = (role: UserRole) => {
    switch (role) {
      case 'owner':
      case 'industry': return '/industry/dashboard';
      case 'dealer': return '/dealer/dashboard';
      case 'recycler': return '/recycler/dashboard';
      case 'consumer': return '/consumer/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
          id="nav-brand"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">WasteXchange</span>
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Eco Network
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">Simple & Smart Scrap Exchange</p>
          </div>
        </div>

        {/* Primary Desktop Navigation Links (Only shown when logged in) */}
        {userProfile && (
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              id="nav-marketplace-btn"
              onClick={() => onNavigate('/marketplace')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                currentRoute === '/marketplace'
                  ? 'text-emerald-800 bg-emerald-50 border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Scrap Marketplace
            </button>

            <button
              id="nav-consumer-marketplace-btn"
              onClick={() => onNavigate('/consumer/marketplace')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentRoute.startsWith('/consumer')
                  ? 'text-emerald-800 bg-emerald-50 border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Recycled Goods Store</span>
            </button>

            <button
              id="nav-recycler-btn"
              onClick={() => onNavigate('/recycler/dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentRoute.startsWith('/recycler')
                  ? 'text-emerald-800 bg-emerald-50 border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Recycle className="w-4 h-4 text-emerald-600" />
              <span>Recycling Center</span>
            </button>

            {onOpenTests && userProfile.role === 'admin' && (
              <button
                id="nav-tests-btn"
                onClick={onOpenTests}
                className="px-3 py-2 rounded-lg text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Verify Engine</span>
              </button>
            )}
          </nav>
        )}

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {userProfile ? (
            <div className="flex items-center gap-3">
              <button
                id="nav-dashboard-btn"
                onClick={() => onNavigate(getDashboardRoute(userProfile.role))}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Dashboard ({userProfile.role.toUpperCase()})</span>
              </button>

              <button
                id="nav-logout-btn"
                onClick={() => logoutUser()}
                className="p-2 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="nav-login-btn"
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 rounded-lg text-slate-700 hover:text-slate-900 text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer border border-transparent"
              >
                Sign In
              </button>
              <button
                id="nav-register-btn"
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all shadow-sm cursor-pointer"
              >
                Join Free
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle (Only if user is logged in or for simple access) */}
        <div className="md:hidden flex items-center gap-2">
          {!userProfile ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg shadow-xs"
              >
                Join Free
              </button>
            </div>
          ) : (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 text-slate-800 border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu (Authenticated only) */}
      {mobileMenuOpen && userProfile && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <button
            onClick={() => { onNavigate('/marketplace'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2.5 text-sm text-slate-800 font-bold border-b border-slate-100"
          >
            Scrap Marketplace
          </button>
          <button
            onClick={() => { onNavigate('/consumer/marketplace'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2.5 text-sm text-slate-800 font-bold border-b border-slate-100"
          >
            Recycled Goods Store
          </button>
          <button
            onClick={() => { onNavigate('/recycler/dashboard'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2.5 text-sm text-slate-800 font-bold border-b border-slate-100"
          >
            Recycling Center
          </button>
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <button
              onClick={() => {
                onNavigate(getDashboardRoute(userProfile.role));
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-lg text-center"
            >
              Open Dashboard ({userProfile.role.toUpperCase()})
            </button>
            <button
              onClick={() => {
                logoutUser();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-slate-100 text-red-600 font-bold text-sm rounded-lg text-center border border-slate-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
