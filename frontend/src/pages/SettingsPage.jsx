import { useState } from 'react';
import { useApp } from '../App';
import { useAuth } from '../AuthContext';
import { Sun, Moon, Brain, Sliders, User, Shield, Bell, Trash2, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme, clearHistory, history } = useApp();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [defaultLength, setDefaultLength] = useState('detailed');
  const [defaultTone, setDefaultTone]     = useState('professional');
  const [notifs, setNotifs]               = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-black text-main font-display tracking-tight">System Settings</h2>
        <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1 opacity-70">Manage your cognitive environment and preferences</p>
      </div>

      {/* Premium Profile Section */}
      <div className="glass-panel p-8 space-y-6 bg-white/5 border-white/10 group">
        <h3 className="text-base font-black text-main flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center shadow-lg shadow-primary-500/5">
            <User className="w-5 h-5 text-primary-400" />
          </div>
          Intelligence Profile
        </h3>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-2xl shadow-primary-500/30 group-hover:rotate-6 transition-transform duration-500">
            {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-black text-main tracking-tight">{user?.fullName || 'User Alpha'}</p>
            <p className="text-sm text-muted font-bold opacity-60 uppercase tracking-widest mt-1">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Appearance Configuration */}
      <div className="glass-panel p-8 space-y-6 bg-white/5 border-white/10">
        <h3 className="text-base font-black text-main flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center shadow-lg shadow-violet-500/5">
            <Sliders className="w-5 h-5 text-violet-400" />
          </div>
          Interface Dynamics
        </h3>
        <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-violet-500/20 transition-all group">
          <div>
            <p className="text-sm font-black text-main uppercase tracking-widest">Global Theme</p>
            <p className="text-xs text-muted font-medium mt-1 opacity-70">Toggle between high-contrast light and dark modalities</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-main bg-slate-100 dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest text-main hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-primary-500/30 transition-all shadow-xl active:scale-95"
          >
            {theme === 'dark' ? <><Sun className="w-4 h-4 text-amber-400 animate-pulse" /> LIGHT MODE</> : <><Moon className="w-4 h-4 text-indigo-400 animate-pulse" /> DARK MODE</>}
          </button>
        </div>
      </div>

      {/* Analysis Logic Defaults */}
      <div className="glass-panel p-8 space-y-8 bg-white/5 border-white/10">
        <h3 className="text-base font-black text-main flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <Brain className="w-5 h-5 text-emerald-400" />
          </div>
          Cognitive Calibration
        </h3>
        <div className="space-y-8">
          <div>
            <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-black mb-4 ml-1">Default Extraction Resolution</p>
            <div className="grid grid-cols-2 gap-4">
              {['concise', 'detailed'].map(opt => (
                <button key={opt} onClick={() => setDefaultLength(opt)} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${defaultLength === opt ? 'bg-primary-500/10 text-primary-400 border-primary-500/30 shadow-xl shadow-primary-500/5' : 'bg-white/5 text-muted border-white/5 hover:bg-white/10'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-black mb-4 ml-1">Default Narrative Tone</p>
            <div className="grid grid-cols-2 gap-4">
              {['professional', 'casual'].map(opt => (
                <button key={opt} onClick={() => setDefaultTone(opt)} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${defaultTone === opt ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-xl shadow-indigo-500/5' : 'bg-white/5 text-muted border-white/5 hover:bg-white/10'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Signals */}
      <div className="glass-panel p-8 space-y-6 bg-white/5 border-white/10">
        <h3 className="text-base font-black text-main flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shadow-lg shadow-amber-500/5">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          Status Indicators
        </h3>
        <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-all">
          <div>
            <p className="text-sm font-black text-main uppercase tracking-widest">Synthesis Completion</p>
            <p className="text-xs text-muted font-medium mt-1 opacity-70">Trigger alerts upon successful intelligence extraction</p>
          </div>
          <button
            onClick={() => setNotifs(!notifs)}
            className={`relative w-14 h-7 rounded-full transition-all duration-500 shadow-inner ${notifs ? 'bg-gradient-to-r from-primary-500 to-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-xl transition-all duration-500 ease-out ${notifs ? 'left-8' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Destructive Actions */}
      <div className="glass-panel p-8 space-y-6 bg-red-500/[0.03] border-red-500/20">
        <h3 className="text-base font-black text-red-400 flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center shadow-lg shadow-red-500/5">
            <Shield className="w-5 h-5" />
          </div>
          Security Override
        </h3>
        <div className="flex items-center justify-between p-6 rounded-3xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all">
          <div>
            <p className="text-sm font-black text-main uppercase tracking-widest">Purge Intelligence</p>
            <p className="text-xs text-muted font-medium mt-1 opacity-70">Permanently delete {history.length} records from history</p>
          </div>
          <button onClick={clearHistory} className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-red-500/30 bg-red-500/10 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-all active:scale-95">
            <Trash2 className="w-4 h-4" /> PURGE ALL
          </button>
        </div>
      </div>

      {/* Global Commitment */}
      <button
        onClick={handleSave}
        className="btn-premium w-full !py-5 !rounded-3xl flex items-center justify-center gap-3 group shadow-2xl"
      >
        {saved ? (
          <div className="flex items-center gap-3 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-6 h-6" /> 
            <span className="uppercase tracking-[0.2em] font-black">CONFIGURATION COMMITTED</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="uppercase tracking-[0.2em] font-black">SAVE GLOBAL PREFERENCES</span>
          </div>
        )}
      </button>
    </div>
  );
}
