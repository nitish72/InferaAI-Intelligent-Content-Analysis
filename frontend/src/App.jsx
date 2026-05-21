import { useState, useEffect, createContext, useContext } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import InsightsPage from './pages/InsightsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AuthModal from './AuthModal';
import { useAuth } from './AuthContext';
import { useHistory, formatRelativeTime } from './useHistory';
import './globals.css';

export const NavigationContext = createContext(null);
export const usePage = () => useContext(NavigationContext);

export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export default function App() {
  const { user, token, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [result, setResult] = useState(null);
  const [currentEntryResult, setCurrentEntryResult] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const historyData = useHistory();

  useEffect(() => {
    document.title = 'Infera AI | Intelligent Content Analysis';
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      return;
    }

    fetch('http://localhost:8000/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          setNotifications(historyData.history.length === 0 ? [{
            id: 'welcome',
            title: 'Welcome to Infera',
            msg: 'Start by uploading a document for analysis',
            time: 'Just now',
            color: 'bg-primary-500',
            read: false,
          }] : []);
          return;
        }

        setNotifications(data.map(item => ({
          id: item.id,
          title: item.title,
          msg: item.message,
          time: formatRelativeTime(item.created_at),
          color: item.type === 'success' ? 'bg-emerald-400' : item.type === 'info' ? 'bg-sky-400' : 'bg-primary-500',
          read: Boolean(item.is_read),
        })));
      })
      .catch(() => setNotifications([]));
  }, [token, historyData.history.length]);


  const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark');

  const navigateToAnalysis = (entry) => {
    setCurrentEntryResult(entry);
    setActivePage('analysis');
  };

  const addNotification = (notif) => {
    setNotifications(prev => [{
      id: Date.now(),
      time: 'Just now',
      read: false,
      color: 'bg-emerald-400',
      ...notif
    }, ...prev]);
  };

  const markNotificationAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (!token || id === 'welcome') return;
    await fetch(`http://localhost:8000/api/notifications/read/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read && n.id !== 'welcome').map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (!token || unreadIds.length === 0) return;
    await Promise.all(unreadIds.map(id =>
      fetch(`http://localhost:8000/api/notifications/read/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
    ));
  };


  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':  return <DashboardPage />;
      case 'analysis':   return <AnalysisPage initialEntry={currentEntryResult} />;
      case 'history':    return <HistoryPage />;
      case 'analytics':  return <AnalyticsPage />;
      case 'insights':   return <InsightsPage />;
      case 'reports':    return <ReportsPage />;
      case 'settings':   return <SettingsPage />;
      default:           return <DashboardPage />;
    }
  };

  return (
    <NavigationContext.Provider value={{ activePage, setActivePage, navigateToAnalysis }}>
      <AppContext.Provider value={{ 
        result, setResult, theme, toggleTheme, 
        notifications, addNotification, markNotificationAsRead, markAllAsRead,
        ...historyData 
      }}>
        <div className="min-h-screen flex bg-page text-main transition-colors duration-300 relative overflow-x-hidden">
          {/* Enhanced Background Aesthetics */}
          <div className="bg-blob bg-primary-600/20 -top-20 -left-20" />
          <div className="bg-blob bg-indigo-600/20 top-1/2 left-1/4" style={{ animationDelay: '-10s' }} />
          <div className="bg-blob bg-fuchsia-600/10 bottom-0 right-0" style={{ animationDelay: '-20s' }} />
          <div className="bg-blob bg-blue-600/15 top-0 right-1/4" style={{ animationDelay: '-15s' }} />

          {!user && <AuthModal onClose={() => {}} />}

          {user && (
            <>
              <Sidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                logout={logout}
                user={user}
              />
              <div
                className="flex-1 flex flex-col h-screen overflow-auto transition-all duration-300"
                style={{ marginLeft: sidebarCollapsed ? '64px' : '256px' }}
              >
                <Navbar theme={theme} toggleTheme={toggleTheme} user={user} logout={logout} />
                <main className="flex-1 p-6">
                  <div className="max-w-[1600px] mx-auto pb-10">
                    {renderPage()}
                  </div>
                </main>
              </div>
            </>
          )}
        </div>
      </AppContext.Provider>
    </NavigationContext.Provider>
  );
}
