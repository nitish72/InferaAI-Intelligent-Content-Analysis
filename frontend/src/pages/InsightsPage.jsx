import { useMemo } from 'react';
import { useApp } from '../App';
import { Lightbulb, Tag, TrendingUp, Brain } from 'lucide-react';

export default function InsightsPage() {
  const { history } = useApp();

  const allInsights = useMemo(() =>
    history.flatMap(e => (e.result?.important_insights || []).map(ins => ({ text: ins, label: e.label, sentiment: e.sentiment })))
  , [history]);

  const allKeywords = useMemo(() => {
    const freq = {};
    history.forEach(e => e.keywords?.forEach(kw => { freq[kw] = (freq[kw] || 0) + 1; }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 30);
  }, [history]);

  const topTones = useMemo(() => {
    const c = {};
    history.forEach(e => { const t = e.result?.tone_analysis?.overall_tone; if (t) c[t] = (c[t] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [history]);

  if (history.length === 0) return (
    <div className="glass-panel p-20 flex flex-col items-center justify-center text-center">
      <Lightbulb className="w-12 h-12 text-muted opacity-20 mb-4" />
      <h3 className="text-base font-semibold text-main mb-1">No Insights Yet</h3>
      <p className="text-sm text-muted">Run analyses to generate AI insights here.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-main font-display tracking-tight">AI Insights Hub</h2>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1 opacity-70">Synthesized intelligence from your collective database</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Key Insights Intelligence Feed */}
        <div className="glass-panel p-8 lg:row-span-2 bg-white/5 border-white/10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-black text-main flex items-center gap-3 tracking-tight">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shadow-lg shadow-amber-500/5">
                <Lightbulb className="w-5 h-5 text-amber-500" />
              </div>
              Intelligence Feed
            </h3>
            <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full border border-white/5">{allInsights.length} DATA POINTS</span>
          </div>
          
          {allInsights.length > 0 ? (
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {allInsights.map((ins, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/20 transition-all hover-lift group">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2.5 shrink-0 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  <div>
                    <p className="text-sm text-main leading-relaxed font-medium">{ins.text}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[10px] text-muted font-black uppercase tracking-widest opacity-50">SOURCE:</span>
                      <span className="text-[10px] text-primary-400 font-black uppercase tracking-widest">{ins.label}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center">
              <Brain className="w-12 h-12 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">No deep insights detected</p>
            </div>
          )}
        </div>

        {/* Top Keywords Cloud */}
        <div className="glass-panel p-8 bg-white/5 border-white/10">
          <h3 className="text-base font-black text-main flex items-center gap-3 tracking-tight mb-8">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center shadow-lg shadow-cyan-500/5">
              <Tag className="w-5 h-5 text-cyan-400" />
            </div>
            Global Semantics
          </h3>
          <div className="flex flex-wrap gap-3">
            {allKeywords.map(([kw, count]) => (
              <span key={kw} className="px-5 py-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:scale-110 hover:bg-cyan-500/10 transition-all cursor-default shadow-lg shadow-cyan-500/5 group">
                <span className="opacity-50">#</span> {kw} 
                <span className="bg-cyan-400/10 px-2 py-0.5 rounded-lg text-[9px] group-hover:bg-cyan-400/20 transition-colors">{count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Dominant Tones Analysis */}
        <div className="glass-panel p-8 bg-white/5 border-white/10">
          <h3 className="text-base font-black text-main flex items-center gap-3 tracking-tight mb-8">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center shadow-lg shadow-violet-500/5">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
            Narrative Archetypes
          </h3>
          <div className="space-y-6">
            {topTones.map(([tone, count]) => (
              <div key={tone} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-main uppercase tracking-widest">{tone}</span>
                  <span className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">{count} EXTRACTIONS</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out group-hover:shadow-[0_0_12px_rgba(139,92,246,0.5)]" 
                    style={{ width: `${(count / history.length) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
