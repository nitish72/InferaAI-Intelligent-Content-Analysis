import { usePage } from '../App';
import {
  LayoutDashboard, Upload, History, BarChart3, Lightbulb,
  FileText, Settings, Sparkles, ChevronLeft, LogOut, User as UserIcon
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'analysis',  icon: Upload,          label: 'New Analysis' },
  { id: 'history',   icon: History,         label: 'History' },
  { id: 'analytics', icon: BarChart3,       label: 'Analytics' },
  { id: 'insights',  icon: Lightbulb,       label: 'AI Insights' },
  { id: 'reports',   icon: FileText,        label: 'Reports' },
  { id: 'settings',  icon: Settings,        label: 'Settings' },
];

export default function Sidebar({ collapsed, setCollapsed, user, logout }) {
  const { activePage, setActivePage } = usePage();

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <aside
      className="fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-500 border-r border-main glass-panel !rounded-none !border-y-0 !border-l-0"
      style={{
        width: collapsed ? '80px' : '280px',
      }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-6 py-8 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 via-indigo-600 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-xl shadow-primary-500/30 group cursor-pointer hover:rotate-12 transition-transform duration-500">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden animate-in fade-in slide-in-from-left-2 duration-500">
            <h1 className="text-xl font-bold tracking-tight font-display">
              Infera<span className="gradient-text">AI</span>
            </h1>
            <p className="text-[10px] text-muted font-semibold uppercase tracking-widest opacity-70">Intelligence</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden ${
                collapsed ? 'justify-center' : ''
              } ${active
                ? 'bg-gradient-to-r from-primary-500/20 to-indigo-500/10 text-primary-400 shadow-sm border border-primary-500/20'
                : 'text-muted hover:text-main hover:bg-white/5 border border-transparent'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-primary-500 to-fuchsia-500 rounded-full" />
              )}
              <Icon className={`w-5 h-5 shrink-0 transition-all duration-300 ${active ? 'text-primary-400 scale-110' : 'group-hover:text-primary-400 group-hover:scale-110'}`} />
              {!collapsed && <span className="tracking-tight">{label}</span>}
              {!active && !collapsed && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      {!collapsed && (
        <div className="p-4 mx-4 mb-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg shadow-primary-500/20">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-main truncate">{user?.fullName || user?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-muted truncate font-medium">{user?.email}</p>
            </div>
            <button onClick={logout} className="p-2 rounded-xl text-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Collapse btn */}
      <div className="p-4 border-t border-main/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-muted hover:text-main hover:bg-white/5 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <ChevronLeft className={`w-5 h-5 transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span className="uppercase tracking-widest">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
