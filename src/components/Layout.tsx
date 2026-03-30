import React from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageCircle, 
  FileText, 
  AlertCircle, 
  Apple, 
  Settings,
  Heart,
  Globe
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Loader2, LogOut } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Layout: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, loading, isOnboarded, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFF1F2]">
        <Loader2 className="w-12 h-12 text-[#F43F5E] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to onboarding if not done
  if (!isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Prevent going back to onboarding if already done
  if (isOnboarded && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />;
  }

  const sidebarItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/' },
    { icon: MessageCircle, label: t('chatbot'), path: '/chatbot' },
    { icon: Users, label: t('community'), path: '/community' },
    { icon: FileText, label: t('reports'), path: '/reports' },
    { icon: Apple, label: t('nutrition'), path: '/nutrition' },
    { icon: AlertCircle, label: t('sos'), path: '/sos' },
  ];

  const isOnboarding = location.pathname === '/onboarding';

  if (isOnboarding) {
    return (
      <main className="h-screen w-full overflow-y-auto bg-[#FFF1F2]">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFF1F2]">
      {/* Sidebar */}
      <aside className="w-72 glass-card m-4 hidden lg:flex flex-col flex-shrink-0">
        <div className="p-8 flex items-center gap-3">
          <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="text-white fill-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#881337] tracking-tight">{language === 'ta' ? 'பிரெக்னாகேர்' : 'PregnaCare'}</h1>
            <p className="text-xs font-semibold text-[#FB7185] uppercase tracking-wider">{language === 'ta' ? 'சரணாலயம்' : 'Sanctuary'}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 font-semibold group",
                isActive 
                  ? "bg-[#F43F5E] text-white premium-shadow" 
                  : "text-[#64748B] hover:bg-[#FFE4E6] hover:text-[#F43F5E]"
              )}
            >
              <item.icon size={22} className={cn("transition-transform group-hover:scale-110")} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 space-y-2">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="w-full p-4 glass-card flex items-center gap-4 text-[#F43F5E] font-bold hover:bg-[#FFE4E6] transition-colors"
          >
            <Globe size={22} />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>
          <button className="w-full p-4 glass-card flex items-center gap-4 text-[#64748B] font-semibold hover:bg-[#FFE4E6] transition-colors">
            <Settings size={22} />
            <span>{t('settings')}</span>
          </button>
          <button 
            onClick={signOut}
            className="w-full p-4 glass-card flex items-center gap-4 text-rose-600 font-bold hover:bg-rose-50 transition-colors"
          >
            <LogOut size={22} />
            <span>{t('sign_out')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-4 lg:p-8">
        <div className="max-w-7xl mx-auto pb-20">
          <Outlet />
        </div>

        {/* Floating Mobile Nav (Visible only on small screens) */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] glass-card p-4 flex justify-between items-center z-50">
           {sidebarItems.slice(0, 4).map((item) => (
             <NavLink key={item.path} to={item.path} className={({ isActive }) => cn("p-3 rounded-full", isActive ? "bg-[#F43F5E] text-white shadow-lg" : "text-[#64748B]")}>
               <item.icon size={24} />
             </NavLink>
           ))}
           <NavLink to="/sos" className="p-4 bg-[#B50045] text-white rounded-full shadow-xl">
             <AlertCircle size={24} />
           </NavLink>
        </div>
      </main>
    </div>
  );
};

export default Layout;
