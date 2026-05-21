import { useMemo } from 'react';
import { useApp } from '../App';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { TrendingUp, Activity, BarChart3, Target } from 'lucide-react';

export default function AnalyticsPage() {
  const { history } = useApp();

  const sentimentCounts = useMemo(() => {
    const c = { Positive: 0, Negative: 0, Neutral: 0 };
    history.forEach(e => { if (c[e.sentiment] !== undefined) c[e.sentiment]++; });
    return Object.entries(c).map(([name, count]) => ({ name, count }));
  }, [history]);

  const confidenceData = useMemo(() =>
    history.slice(-10).map((e, i) => ({
      label: `#${history.length - 9 + i}`,
      score: e.result?.tone_analysis?.confidence_score ?? 75,
    }))
  , [history]);

  const typeData = useMemo(() => {
    const c = { text: 0, url: 0, file: 0 };
    history.forEach(e => { if (c[e.input_type] !== undefined) c[e.input_type]++; });
    return [
      { subject: 'Text', value: c.text },
      { subject: 'URL',  value: c.url  },
      { subject: 'File', value: c.file },
    ];
  }, [history]);

  const avgConf = history.length
    ? Math.round(history.reduce((a, e) => a + (e.result?.tone_analysis?.confidence_score ?? 75), 0) / history.length)
    : 0;

  const tooltipStyle = { 
    background: 'var(--bg-card)', 
    border: '1px solid var(--border-color)', 
    borderRadius: 12, 
    fontSize: 12,
    color: 'var(--text-main)',
    boxShadow: 'var(--glass-shadow)'
  };

  if (history.length === 0) return (
    <div className="glass-panel p-20 flex flex-col items-center justify-center text-center">
      <BarChart3 className="w-12 h-12 text-muted opacity-20 mb-4" />
      <h3 className="text-base font-semibold text-main mb-1">No Analytics Yet</h3>
      <p className="text-sm text-muted">Run some analyses to see your performance data here.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-main font-display tracking-tight">Intelligence Analytics</h2>
          <p className="text-xs text-muted font-semibold uppercase tracking-widest mt-1 opacity-70">Performance metrics across {history.length} deep analyses</p>
        </div>
      </div>

      {/* High-Impact KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Extractions', value: history.length, icon: Activity, color: 'text-primary-400 bg-primary-500/10' },
          { label: 'Mean Confidence', value: `${avgConf}%`, icon: Target, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Positive Resonance', value: `${history.length ? Math.round((sentimentCounts.find(s=>s.name==='Positive')?.count||0)/history.length*100) : 0}%`, icon: TrendingUp, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'Ingestion Vectors', value: typeData.filter(t=>t.value>0).length, icon: BarChart3, color: 'text-violet-400 bg-violet-500/10' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-panel p-6 bg-white/5 border-white/10 hover-lift group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color} shadow-lg shadow-current/5 group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-main tracking-tight group-hover:text-primary-400 transition-colors">{value}</div>
            <div className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1 opacity-60">{label}</div>
          </div>
        ))}
      </div>

      {/* Advanced Charts Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 bg-white/5 border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-base font-bold text-main mb-1 tracking-tight">Sentiment Landscape</h3>
          <p className="text-[10px] text-muted font-semibold uppercase tracking-widest mb-8 opacity-60">Distribution of emotional tone across records</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sentimentCounts}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{fill: 'var(--border-color)', opacity: 0.1}} contentStyle={tooltipStyle} wrapperStyle={{ outline: 'none' }} />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[8,8,0,0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-8 bg-white/5 border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-base font-bold text-main mb-1 tracking-tight">Confidence Velocity</h3>
          <p className="text-[10px] text-muted font-semibold uppercase tracking-widest mb-8 opacity-60">AI precision trend over last {confidenceData.length} cycles</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={confidenceData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: 'none' }} />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', r: 6, strokeWidth: 0 }} activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }} animationDuration={2000} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
