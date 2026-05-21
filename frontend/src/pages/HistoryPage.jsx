import { useState } from 'react';
import { useApp } from '../App';
import { usePage } from '../App';
import { formatRelativeTime } from '../useHistory';
import { Search, FileText, Trash2, X, Filter, ExternalLink } from 'lucide-react';

const SENTIMENT_STYLES = {
  Positive: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Negative: 'text-red-400 bg-red-500/10 border-red-500/20',
  Neutral:  'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
};
const TYPE_LABELS = { text: '📄 Text', url: '🔗 URL', file: '📁 File' };

export default function HistoryPage() {
  const { history, removeEntry, clearHistory } = useApp();
  const { navigateToAnalysis } = usePage();
  const [search, setSearch]         = useState('');
  const [filterSentiment, setFilter] = useState('all');

  const filtered = history.filter(e => {
    const matchSearch = !search.trim() || e.label?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterSentiment === 'all' || e.sentiment === filterSentiment;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-main font-display tracking-tight">Analysis History</h2>
          <p className="text-xs text-muted font-semibold uppercase tracking-widest mt-1 opacity-70">{history.length} intelligence records found</p>
        </div>
        {history.length > 0 && (
          <button onClick={clearHistory} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-bold uppercase tracking-widest transition-all active:scale-95">
            <Trash2 className="w-4 h-4" /> Wipe Database
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="glass-panel p-6 flex flex-wrap items-center gap-4 bg-white/5 border-white/10">
        <div className="relative flex-1 min-w-[300px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted group-focus-within:text-primary-400 transition-colors" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Query intelligence by title or semantic content..."
            className="w-full pl-12 pr-10 py-3 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-main placeholder-muted/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/30 transition-all duration-300"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-main">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-main">
          {['all','Positive','Negative','Neutral'].map(s => (
            <button 
              key={s} 
              onClick={() => setFilter(s)} 
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${filterSentiment === s ? 'bg-white dark:bg-slate-800 text-primary-400 shadow-xl border border-primary-500/20 scale-105' : 'text-muted hover:text-main'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Intelligence List */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-24 flex flex-col items-center justify-center text-center bg-white/5 border-white/10 border-dashed border-2">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6 opacity-40">
            <FileText className="w-10 h-10 text-muted" />
          </div>
          <h3 className="text-xl font-bold text-main mb-2 tracking-tight">{history.length === 0 ? 'No Intelligence Collected' : 'No Matching Records'}</h3>
          <p className="text-sm text-muted font-medium max-w-sm">{history.length === 0 ? 'Initialize your first analysis to begin building your intelligence database.' : 'Refine your search query to locate specific intelligence records.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(entry => (
            <div 
              key={entry.id} 
              className="glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:border-primary-500/40 transition-all duration-500 group cursor-pointer hover-lift bg-white/5" 
              onClick={() => navigateToAnalysis(entry)}
            >
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shrink-0 border border-white/5 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <FileText className="w-8 h-8 text-muted group-hover:text-primary-400 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className="text-lg font-bold text-main group-hover:text-primary-400 transition-colors truncate font-display tracking-tight">{entry.label}</h3>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-60 bg-white/5 px-3 py-1 rounded-full border border-white/5">{formatRelativeTime(entry.timestamp)}</span>
                </div>
                <p className="text-sm text-muted mb-4 line-clamp-1 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{entry.summary_preview}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${SENTIMENT_STYLES[entry.sentiment] || SENTIMENT_STYLES.Neutral}`}>{entry.sentiment}</span>
                  {entry.input_type && (
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-main">
                      {TYPE_LABELS[entry.input_type] || entry.input_type}
                    </span>
                  )}
                  {entry.keywords?.slice(0, 3).map((kw, i) => (
                    <span key={i} className="text-[10px] font-bold text-primary-400 uppercase tracking-widest bg-primary-500/5 px-3 py-1 rounded-full border border-primary-500/10">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button onClick={e => { e.stopPropagation(); navigateToAnalysis(entry); }} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:text-primary-400 hover:bg-primary-500/10 hover:border-primary-500/20 transition-all">
                  <ExternalLink className="w-4.5 h-4.5" />
                </button>
                <button onClick={e => { e.stopPropagation(); removeEntry(entry.id); }} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all">
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
