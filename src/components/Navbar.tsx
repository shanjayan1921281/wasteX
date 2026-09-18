import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Recycle, 
  Cpu, 
  ShoppingBag, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert, 
  Building2, 
  Truck, 
  ShieldCheck,
  ChevronDown
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
  onOpenTests,
  unreadCount = 0
}) => {
  const { userProfile, logoutUser, switchDemoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

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

        {/* Primary Desktop Navigation Links */}
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

          {onOpenTests && (
            <button
              id="nav-tests-btn"
              onClick={onOpenTests}
              className="px-3 py-2 rounded-lg text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Verify Engine (5 Tests)</span>
            </button>
          )}

          {/* Quick Role Switcher for Hackathon Demonstrator */}
          <div className="relative ml-2">
            <button
              id="role-switch-trigger"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 transition-colors cursor-pointer shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Role: {userProfile ? userProfile.role.toUpperCase() : 'SELECT ROLE'}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 text-xs">
                <div className="px-3.5 py-2 text-[11px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100 bg-slate-50">
                  Select Who You Are
                </div>
                <button
                  id="role-select-industry"
                  onClick={async () => {
                    await switchDemoRole('owner');
                    setRoleDropdownOpen(false);
                    onNavigate('/industry/dashboard');
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-800 hover:bg-emerald-50 flex items-center gap-3 cursor-pointer border-b border-slate-100 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">🏭 Waste Owner / Factory</div>
                    <div className="text-[11px] text-slate-500">Sell scrap, check AI value, 4 pathways</div>
                  </div>
                </button>
                <button
                  id="role-select-dealer"
                  onClick={async () => {
                    await switchDemoRole('dealer');
                    setRoleDropdownOpen(false);
                    onNavigate('/dealer/dashboard');
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-800 hover:bg-amber-50 flex items-center gap-3 cursor-pointer border-b border-slate-100 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">🤝 Scrap Dealer / Buyer</div>
                    <div className="text-[11px] text-slate-500">Buy scrap in bulk from factories</div>
                  </div>
                </button>
                <button
                  id="role-select-recycler"
                  onClick={async () => {
                    await switchDemoRole('recycler');
                    setRoleDropdownOpen(false);
                    onNavigate('/recycler/dashboard');
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-800 hover:bg-emerald-50 flex items-center gap-3 cursor-pointer border-b border-slate-100 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                    <Recycle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">♻️ Recycling Factory</div>
                    <div className="text-[11px] text-slate-500">Convert raw scrap into useful goods</div>
                  </div>
                </button>
                <button
                  id="role-select-consumer"
                  onClick={async () => {
                    await switchDemoRole('consumer');
                    setRoleDropdownOpen(false);
                    onNavigate('/consumer/marketplace');
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-800 hover:bg-blue-50 flex items-center gap-3 cursor-pointer border-b border-slate-100 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">🛒 Everyday Buyer / Consumer</div>
                    <div className="text-[11px] text-slate-500">Buy beautiful recycled products</div>
                  </div>
                </button>
                <button
                  id="role-select-admin"
                  onClick={async () => {
                    await switchDemoRole('admin');
                    setRoleDropdownOpen(false);
                    onNavigate('/admin/dashboard');
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-800 hover:bg-purple-50 flex items-center gap-3 cursor-pointer transition-colors"
                >
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">🛡️ Admin Manager</div>
                    <div className="text-[11px] text-slate-500">System rules & safety supervision</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {userProfile ? (
            <>
              <button
                id="nav-dashboard-btn"
                onClick={() => onNavigate(getDashboardRoute(userProfile.role))}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>My Dashboard</span>
              </button>

              <button
                id="nav-logout-btn"
                onClick={() => logoutUser()}
                className="p-2 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                id="nav-login-btn"
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 rounded-lg text-slate-700 hover:text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                id="nav-register-btn"
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Join Free
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-800 border border-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
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
            onClick={() => { onNavigate('/how-it-works'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2.5 text-sm text-slate-800 font-bold border-b border-slate-100"
          >
            How It Works
          </button>

          <div className="pt-3 space-y-2">
            <span className="text-xs uppercase text-slate-500 font-bold block">Quick Switch Role:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={async () => {
                  await switchDemoRole('owner');
                  setMobileMenuOpen(false);
                  onNavigate('/industry/dashboard');
                }}
                className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 text-left"
              >
                🏭 Waste Owner
              </button>
              <button
                onClick={async () => {
                  await switchDemoRole('dealer');
                  setMobileMenuOpen(false);
                  onNavigate('/dealer/dashboard');
                }}
                className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 text-left"
              >
                🤝 Scrap Dealer
              </button>
              <button
                onClick={async () => {
                  await switchDemoRole('recycler');
                  setMobileMenuOpen(false);
                  onNavigate('/recycler/dashboard');
                }}
                className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 text-left"
              >
                ♻️ Recycler Plant
              </button>
              <button
                onClick={async () => {
                  await switchDemoRole('consumer');
                  setMobileMenuOpen(false);
                  onNavigate('/consumer/marketplace');
                }}
                className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 text-left"
              >
                🛒 Everyday Buyer
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            {userProfile ? (
              <button
                onClick={() => {
                  onNavigate(getDashboardRoute(userProfile.role));
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-lg text-center"
              >
                Open My Dashboard
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                  className="w-1/2 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                >
                  Register Free
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
