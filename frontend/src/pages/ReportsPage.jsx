import { useState } from 'react';
import { useApp } from '../App';
import { usePage } from '../App';
import { formatRelativeTime } from '../useHistory';
import { exportTxt, exportPdf, exportDocx } from '../exportUtils';
import { FileText, Download, ExternalLink, ChevronDown } from 'lucide-react';

const SENTIMENT_STYLES = {
  Positive: 'text-emerald-400 bg-emerald-500/10',
  Negative: 'text-red-400 bg-red-500/10',
  Neutral:  'text-indigo-400 bg-indigo-500/10',
};

function ReportRow({ entry, idx, onView }) {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(null);

  const handleExport = async (fmt) => {
    setExporting(fmt);
    setShowMenu(false);
    try {
      if (fmt === 'txt')  exportTxt(entry.result);
      if (fmt === 'pdf')  exportPdf(entry.result);
      if (fmt === 'docx') await exportDocx(entry.result);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:border-primary-500/40 transition-all duration-500 group bg-white/5 hover-lift">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-white/5 flex items-center justify-center text-lg font-black text-muted shrink-0 group-hover:scale-110 group-hover:text-primary-400 transition-all shadow-xl">
        {String(idx + 1).padStart(2, '0')}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-black text-main truncate group-hover:text-primary-400 transition-colors font-display tracking-tight">{entry.label}</h3>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">{formatRelativeTime(entry.timestamp)}</span>
          <span className="w-1 h-1 rounded-full bg-primary-500 opacity-40 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${SENTIMENT_STYLES[entry.sentiment] || SENTIMENT_STYLES.Neutral}`}>{entry.sentiment}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
        <button
          onClick={() => onView(entry)}
          className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:text-primary-400 hover:bg-primary-500/10 hover:border-primary-500/20 transition-all"
          title="View Intelligence"
        >
          <ExternalLink className="w-5 h-5" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(v => !v)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-main text-[10px] font-black uppercase tracking-widest text-main hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-primary-500/30 transition-all shadow-lg active:scale-95"
          >
            {exporting ? <div className="w-4 h-4 border-2 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
            GENERATE REPORT
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-3 w-48 glass-panel border border-main shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {[['pdf','PDF Report','📄'],['docx','Word Doc','📝'],['txt','Plain Text','📋']].map(([fmt, label, icon]) => (
                <button
                  key={fmt}
                  onClick={() => handleExport(fmt)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-sm font-black text-main hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
                >
                  <span className="text-lg">{icon}</span> {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { history } = useApp();
  const { navigateToAnalysis } = usePage();

  if (history.length === 0) return (
    <div className="glass-panel p-24 flex flex-col items-center justify-center text-center bg-white/5 border-white/10 border-dashed border-2">
      <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6 opacity-40">
        <FileText className="w-10 h-10 text-muted" />
      </div>
      <h3 className="text-xl font-black text-main mb-2 tracking-tight">No Reports Ready</h3>
      <p className="text-sm text-muted font-medium max-w-sm">Synthesize intelligence through the analysis engine to generate high-fidelity exportable reports.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-black text-main font-display tracking-tight">Intelligence Reports</h2>
        <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1 opacity-70">{history.length} modular reports ready for synthesis</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {history.map((entry, idx) => (
          <ReportRow key={entry.id} entry={entry} idx={idx} onView={navigateToAnalysis} />
        ))}
      </div>
    </div>
  );
}
