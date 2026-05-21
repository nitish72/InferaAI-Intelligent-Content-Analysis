import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, ChevronDown, LogOut, FileText, X } from 'lucide-react';
import { usePage } from '../App';
import { useApp } from '../App';

const PAGE_TITLES = {
  dashboard: { title: 'Dashboard',    sub: 'Overview & insights' },
  analysis:  { title: 'New Analysis', sub: 'Upload & analyze content' },
  history:   { title: 'History',      sub: 'Past analyses' },
  analytics: { title: 'Analytics',    sub: 'Performance metrics' },
  insights:  { title: 'AI Insights',  sub: 'Intelligent recommendations' },
  reports:   { title: 'Reports',      sub: 'Generated reports' },
  settings:  { title: 'Settings',     sub: 'Preferences & configuration' },
};

export default function Navbar({ theme, toggleTheme, user, logout }) {
  const { activePage, navigateToAnalysis } = usePage();
  const { history } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const searchRef  = useRef(null);
  const profileRef = useRef(null);
  const notifsRef  = useRef(null);
  const { 
    notifications, 
    markNotificationAsRead: markAsRead, 
    markAllAsRead 
  } = useApp();
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = e => {
      if (searchRef.current  && !searchRef.current.contains(e.target))  setShowSearch(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifsRef.current  && !notifsRef.current.contains(e.target))  setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleResultClick = (entry) => {
    navigateToAnalysis(entry);
    setShowSearch(false);
    setSearchQuery('');
  };

  const filtered = searchQuery.trim()
    ? history.filter(e => e.label?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  const pageInfo = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-4 px-8 py-4 border-b border-main glass-panel !rounded-none !border-x-0 !border-t-0 shrink-0"
    >
      {/* Page Info */}
      <div className="shrink-0 animate-in fade-in slide-in-from-top-2 duration-500">
        <h2 className="text-xl font-bold text-main leading-tight font-display tracking-tight">{pageInfo.title}</h2>
        <p className="text-xs text-muted font-semibold opacity-70">{pageInfo.sub}</p>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-lg relative hidden md:block" ref={searchRef}>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary-400 transition-colors pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            placeholder="Quick search across intelligence..."
            className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-2.5 text-sm text-main placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/40 transition-all duration-300"
          />
        </div>
        {showSearch && searchQuery.trim() && (
          <div className="absolute top-full mt-3 left-0 right-0 glass-panel shadow-2xl z-50 overflow-hidden border border-main animate-in fade-in zoom-in-95 duration-200">
            {filtered.length > 0 ? filtered.map(e => (
              <button 
                key={e.id} 
                onClick={() => handleResultClick(e)}
                className="w-full px-5 py-4 hover:bg-primary-500/5 text-left flex items-center gap-4 transition-all border-b border-main last:border-0 group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-muted group-hover:text-primary-400 transition-colors" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-main font-semibold truncate">{e.label}</div>
                  <div className="text-[10px] text-muted font-semibold uppercase tracking-widest mt-0.5">{e.sentiment} · {e.input_type}</div>
                </div>
              </button>
            )) : (
              <div className="px-6 py-8 text-center text-sm text-muted font-medium">No intelligence found for "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Theme */}
        <button onClick={toggleTheme} className="p-3 rounded-2xl text-muted hover:text-primary-400 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifsRef}>
          <button onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }} className="p-3 rounded-2xl text-muted hover:text-primary-400 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 relative">
            <Bell className="w-5 h-5" />
            {unread > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-fuchsia-500 rounded-full border-2 border-slate-900" />}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-full mt-3 w-96 glass-panel shadow-2xl z-50 border border-main overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-5 py-4 border-b border-main flex items-center justify-between bg-white/5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-main uppercase tracking-widest">Notifications</h3>
                  <span className="text-[10px] text-muted font-semibold uppercase tracking-widest opacity-60">{unread} unread messages</span>
                </div>
                {unread > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-widest"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.map(n => (
                  <button 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`w-full px-5 py-4 border-b border-main last:border-0 flex gap-4 transition-all hover:bg-white/5 text-left ${!n.read ? 'bg-primary-500/5' : ''}`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 shadow-lg ${n.color} ${n.read ? 'opacity-30' : 'animate-pulse'}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${n.read ? 'text-muted' : 'text-main'}`}>{n.title}</p>
                      <p className="text-xs text-muted leading-relaxed mt-0.5">{n.msg}</p>
                      <p className="text-[10px] text-muted/50 font-semibold mt-2 uppercase">{n.time}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative ml-2" ref={profileRef}>
          <button onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }} className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-2xl border border-white/10 hover:border-primary-500/30 bg-white/5 hover:bg-white/10 transition-all duration-300">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-primary-500/20">
              {initials}
            </div>
            <span className="text-sm font-semibold text-main hidden lg:inline tracking-tight">{user?.fullName?.split(' ')[0] || user?.email?.split('@')[0]}</span>
            <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-3 w-64 glass-panel shadow-2xl z-50 border border-main overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-5 py-4 border-b border-main bg-white/5">
                <p className="text-sm font-bold text-main truncate">{user?.fullName || 'User Account'}</p>
                <p className="text-xs text-muted truncate mt-0.5 font-medium">{user?.email}</p>
              </div>
              <div className="p-2">
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
