import { useMemo } from 'react';
import { useApp } from '../App';
import { usePage } from '../App';
import { formatRelativeTime } from '../useHistory';
import {
  Sparkles, BarChart3, Clock, FileText, TrendingUp,
  Upload, History, ChevronRight, Brain, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

function StatCard({ icon: Icon, label, value, sub, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="glass-panel p-6 flex flex-col gap-4 hover-lift group cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 duration-500 ${color} shadow-lg shadow-current/10`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold opacity-60">{label}</span>
      </div>
      <div>
        <div className="text-3xl font-bold text-main tracking-tight font-display">{value}</div>
        <div className="text-xs text-muted mt-1 font-semibold flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          {sub}
        </div>
      </div>
    </div>
  );
}

const SENTIMENT_COLORS = { Positive: '#10b981', Negative: '#ef4444', Neutral: '#6366f1' };

export default function DashboardPage() {
  const { history } = useApp();
  const { setActivePage } = usePage();

  const stats = useMemo(() => {
    let totalSourceWords = 0, totalSummaryWords = 0;
    history.forEach(e => {
      const src = (e.result?.source_text || '').split(/\s+/).filter(Boolean).length;
      const sum = ((e.result?.summary_detailed || e.result?.executive_summary || '')).split(/\s+/).filter(Boolean).length;
      totalSourceWords += src;
      totalSummaryWords += sum;
    });
    const saved = Math.max(0, totalSourceWords - totalSummaryWords);
    const mins  = Math.round(saved / 225);
    const avgConf = history.length
      ? Math.round(history.reduce((a, e) => a + (e.result?.tone_analysis?.confidence_score ?? 75), 0) / history.length)
      : 0;
    return {
      total:    history.length,
      words:    saved >= 1000 ? (saved / 1000).toFixed(1) + 'k' : saved,
      time:     mins < 60 ? mins + 'm' : (mins / 60).toFixed(1) + 'h',
      avgConf:  avgConf,
    };
  }, [history]);

  const activityData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { label: d.toLocaleDateString('en', { weekday: 'short' }), date: d.toDateString(), count: 0 };
    });
    history.forEach(e => {
      const day = days.find(d => d.date === new Date(e.timestamp).toDateString());
      if (day) day.count++;
    });
    return days;
  }, [history]);

  const sentimentData = useMemo(() => {
    const counts = { Positive: 0, Negative: 0, Neutral: 0 };
    history.forEach(e => { if (counts[e.sentiment] !== undefined) counts[e.sentiment]++; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [history]);

  const recent = history.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Hero Welcome Banner */}
      <div className="glass-panel p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden relative group">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary-600/10 blur-[100px] group-hover:bg-primary-600/20 transition-colors duration-1000" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-indigo-600/10 blur-[80px]" />
        
        <div className="relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4 animate-bounce-slow">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            <span className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">System Operational</span>
          </div>
          <h2 className="text-4xl font-bold text-main tracking-tight font-display mb-3">
            Welcome to <span className="gradient-text">Infera Intelligence</span>
          </h2>
          <p className="text-base text-muted font-medium max-w-lg leading-relaxed">
            Unlocking deeper insights from your content with state-of-the-art AI analysis and sentiment tracking.
          </p>
        </div>

        <button
          onClick={() => setActivePage('analysis')}
          className="btn-premium mt-8 md:mt-0 shrink-0 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/20 group-hover:rotate-12 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-lg">Start New Analysis</span>
          </div>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={FileText}   label="Total Analyses" value={stats.total}   sub="+12% from last week"   color="text-primary-400 bg-primary-500/10"  onClick={() => setActivePage('history')} />
        <StatCard icon={BarChart3}  label="Words Saved"    value={stats.words}   sub="Efficiency gain"       color="text-emerald-400 bg-emerald-500/10"  />
        <StatCard icon={Clock}      label="Time Saved"     value={stats.time}    sub="Reading optimization"  color="text-amber-400 bg-amber-500/10"     />
        <StatCard icon={Activity}   label="Avg Confidence" value={`${stats.avgConf}%`} sub="Model precision"    color="text-fuchsia-400 bg-fuchsia-500/10" onClick={() => setActivePage('analytics')} />
      </div>

      {/* Intelligence Insights row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Activity Intelligence */}
        <div className="lg:col-span-2 glass-panel p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-main font-display tracking-tight">Processing Velocity</h3>
              <p className="text-xs text-muted font-semibold uppercase tracking-widest mt-1 opacity-70">Analysis frequency over 7 days</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-500/5 border border-primary-500/10 text-[10px] font-bold text-primary-400 uppercase tracking-tighter">
              Live Feed <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            </div>
          </div>
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', fontSize: '12px', boxShadow: 'var(--glass-shadow)' }}
                  itemStyle={{ color: 'var(--primary-400)', fontWeight: 700 }}
                  labelStyle={{ color: 'var(--text-main)', fontWeight: 800, marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#colorCount)" strokeWidth={4} dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex flex-col items-center justify-center text-muted gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center animate-pulse">
                <Brain className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest opacity-50">No activity detected</p>
            </div>
          )}
        </div>

        {/* Sentiment Spectrum */}
        <div className="glass-panel p-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-main font-display tracking-tight">Tone Spectrum</h3>
            <p className="text-xs text-muted font-semibold uppercase tracking-widest mt-1 opacity-70">Distribution analysis</p>
          </div>
          {sentimentData.length > 0 ? (
            <>
              <div className="relative h-[160px] mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={8} dataKey="value" strokeWidth={0}>
                      {sentimentData.map(entry => (
                        <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-main leading-none">{history.length}</span>
                  <span className="text-[8px] text-muted font-bold uppercase tracking-tighter">Total</span>
                </div>
              </div>
              <div className="space-y-3">
                {sentimentData.map(d => (
                  <div key={d.name} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" style={{ background: SENTIMENT_COLORS[d.name], boxShadow: `0 0 12px ${SENTIMENT_COLORS[d.name]}44` }} />
                      <span className="text-xs font-semibold text-main opacity-80 group-hover:opacity-100">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-main">{Math.round((d.value/history.length)*100)}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-muted font-bold uppercase tracking-widest opacity-30">
              Empty Spectrum
            </div>
          )}
        </div>
      </div>

      {/* Global Activity Feed */}
      <div className="glass-panel p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-main font-display tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <History className="w-4 h-4 text-muted" />
              </div>
              Intelligence Feed
            </h3>
            <p className="text-xs text-muted font-semibold uppercase tracking-widest mt-1 opacity-70">Your recent knowledge extractions</p>
          </div>
          {history.length > 0 && (
            <button onClick={() => setActivePage('history')} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-muted hover:text-primary-400 hover:bg-primary-500/10 transition-all uppercase tracking-widest">
              View Database
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-main rounded-3xl">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-6">
              <Upload className="w-8 h-8 text-muted opacity-30" />
            </div>
            <h4 className="text-base font-bold text-main mb-2">Initialize Database</h4>
            <p className="text-sm text-muted font-medium mb-6">Start your first analysis to begin tracking intelligence.</p>
            <button onClick={() => setActivePage('analysis')} className="btn-premium !py-2.5">Get Started</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recent.map(entry => {
              const sColors = { Positive: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', Negative: 'text-red-400 bg-red-500/10 border-red-500/20', Neutral: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
              return (
                <div key={entry.id} onClick={() => setActivePage('history')} className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 hover:bg-white/10 transition-all group cursor-pointer border border-transparent hover:border-white/10 hover-lift">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-muted group-hover:text-primary-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-main truncate group-hover:text-primary-400 transition-colors tracking-tight">{entry.label}</p>
                    <p className="text-[10px] text-muted font-semibold uppercase tracking-widest mt-0.5 opacity-60">{formatRelativeTime(entry.timestamp)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${sColors[entry.sentiment] || sColors.Neutral}`}>
                    {entry.sentiment}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
