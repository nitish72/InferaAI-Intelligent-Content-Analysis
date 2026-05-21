import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../AuthContext';
import { useApp } from '../App';
import SentimentChart from '../SentimentChart';
import ChatPanel from '../ChatPanel';
import LoadingOverlay, { SkeletonOutput } from '../LoadingOverlay';
import { exportTxt, exportPdf, exportDocx } from '../exportUtils';
import {
  Upload, Link as LinkIcon, Type, Sparkles, FileText,
  X, Copy, Download, CheckCircle2, AlertCircle,
  Brain, ListChecks, Lightbulb, Tag, BarChart3,
  Hash, Library, Users, BookOpen, Layers, PenTool,
  Target, ChevronDown, AlignLeft
} from 'lucide-react';

const TABS = [
  { id: 'summary',  label: 'Summary',    icon: Brain },
  { id: 'sentiment',label: 'Sentiment',  icon: BarChart3 },
  { id: 'insights', label: 'Insights',   icon: Lightbulb },
  { id: 'keywords', label: 'Keywords',   icon: Tag },
  { id: 'metadata', label: 'Metadata',   icon: Target },
  { id: 'chat',     label: 'Chat',       icon: AlignLeft },
];

function ResultTabs({ data, entry, updateEntry }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [copied, setCopied] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.summary_detailed || data.executive_summary || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleExport = async fmt => {
    setShowExport(false);
    if (fmt === 'txt')  exportTxt(data);
    if (fmt === 'pdf')  exportPdf(data);
    if (fmt === 'docx') await exportDocx(data);
  };

  const sentimentColor = { Positive: 'text-emerald-400', Negative: 'text-red-400', Neutral: 'text-indigo-400' }[data.tone_analysis?.sentiment] || 'text-gray-400';

  return (
    <div className="glass-panel overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Premium Tab Bar */}
      <div className="flex items-center justify-between px-8 pt-6 pb-0 border-b border-main gap-4 bg-white/5">
        <div className="flex gap-2 overflow-x-auto pb-px">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all duration-300 whitespace-nowrap border-b-2 tracking-tight ${
                activeTab === id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-muted hover:text-main hover:bg-white/5 rounded-t-xl'
              }`}
            >
              <Icon className={`w-4 h-4 ${activeTab === id ? 'scale-110' : ''}`} /> {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 pb-3 shrink-0">
          <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-main text-xs font-semibold text-main hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'COPIED' : 'COPY'}
          </button>
          <div className="relative" ref={exportRef}>
            <button onClick={() => setShowExport(v => !v)} className="btn-premium !px-4 !py-2 !text-xs !rounded-xl flex items-center gap-2">
              <Download className="w-4 h-4" /> EXPORT <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showExport ? 'rotate-180' : ''}`} />
            </button>
            {showExport && (
              <div className="absolute right-0 top-full mt-3 w-48 glass-panel border border-main shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {[['pdf','PDF Report','📄'],['docx','Word Doc','📝'],['txt','Plain Text','📋']].map(([fmt, label, icon]) => (
                  <button key={fmt} onClick={() => handleExport(fmt)} className="w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold text-main hover:bg-white/10 transition-colors text-left">
                    <span className="text-lg">{icon}</span>{label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Tab Content */}
      <div className="p-10">
        {/* Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div>
              <p className="text-[10px] text-primary-400 uppercase tracking-[0.2em] font-bold mb-3">Executive Intelligence Summary</p>
              <p className="text-main leading-[1.8] text-lg font-medium">{data.summary_detailed || data.executive_summary}</p>
            </div>
            {data.key_points?.length > 0 && (
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-primary-400 uppercase tracking-[0.2em] font-bold mb-6 flex items-center gap-2">
                  <ListChecks className="w-4 h-4" /> Core Knowledge Points
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                  {data.key_points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-4 text-sm text-main font-medium group">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] shrink-0 group-hover:scale-125 transition-transform" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Sentiment */}
        {activeTab === 'sentiment' && data.tone_analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="glass-panel p-8 space-y-6 bg-white/5 border-white/10">
              {[
                { label: 'Overall Tone', value: data.tone_analysis.overall_tone },
                { label: 'Primary Sentiment', value: data.tone_analysis.sentiment, className: sentimentColor },
                { label: 'Level of Formality', value: data.tone_analysis.formality },
                { label: 'Confidence Score', value: `${data.tone_analysis.confidence_score || 85}%` },
              ].map(({ label, value, className }) => (
                <div key={label} className="flex items-center justify-between py-4 border-b border-main last:border-0 group">
                  <span className="text-[10px] text-muted uppercase tracking-[0.15em] font-bold opacity-70">{label}</span>
                  <span className={`text-base font-bold tracking-tight ${className || 'text-main'}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="glass-panel p-8 h-full flex flex-col bg-white/5 border-white/10">
              <SentimentChart toneAnalysis={data.tone_analysis} />
            </div>
          </div>
        )}

        {/* Insights */}
        {activeTab === 'insights' && (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {data.important_insights?.length > 0 ? data.important_insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-5 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all hover-lift">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-base text-main leading-relaxed font-medium pt-1">{ins}</p>
              </div>
            )) : (
              <div className="text-center py-20 opacity-30">
                <Brain className="w-12 h-12 mx-auto mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">No deep insights detected</p>
              </div>
            )}
          </div>
        )}

        {/* Keywords */}
        {activeTab === 'keywords' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            {data.keywords?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {data.keywords.map((kw, i) => (
                  <span key={i} className="px-5 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold uppercase tracking-widest hover:scale-110 transition-all cursor-default shadow-lg shadow-cyan-500/5">
                    # {kw}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 opacity-30">
                <Tag className="w-12 h-12 mx-auto mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">No keywords extracted</p>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        {activeTab === 'metadata' && data.metadata_insights && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {[
              { label: 'Contextual Topic', value: data.metadata_insights.detected_topic, icon: Hash, color: 'text-indigo-400 bg-indigo-500/10' },
              { label: 'Content Category', value: data.metadata_insights.category, icon: Library, color: 'text-blue-400 bg-blue-500/10' },
              { label: 'Target Audience', value: data.metadata_insights.estimated_audience, icon: Users, color: 'text-fuchsia-400 bg-fuchsia-500/10' },
              { label: 'Reading Difficulty', value: data.metadata_insights.reading_difficulty, icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/10' },
              { label: 'Structural Complexity', value: data.metadata_insights.content_complexity, icon: Layers, color: 'text-amber-400 bg-amber-500/10' },
              { label: 'Narrative Style', value: data.metadata_insights.writing_style, icon: PenTool, color: 'text-primary-400 bg-primary-500/10' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 hover:border-primary-500/30 transition-all group hover-lift">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${color} shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60 mb-1 block">{label}</span>
                  <div className="text-base text-main font-black tracking-tight">{value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat */}
        {activeTab === 'chat' && entry && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <ChatPanel entry={entry} updateEntry={updateEntry} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalysisPage({ initialEntry }) {
  const { token } = useAuth();
  const { addEntry, updateEntry, setCurrentEntryId, history } = useApp();

  const [inputType, setInputType]     = useState('text');
  const [inputText, setInputText]     = useState('');
  const [inputUrl, setInputUrl]       = useState('');
  const [file, setFile]               = useState(null);
  const [summaryLength, setLength]    = useState('detailed');
  const [summaryTone, setTone]        = useState('professional');
  const [isSummarizing, setAnalyzing] = useState(false);
  const [showSkeleton, setSkeleton]   = useState(false);
  const [result, setResult]           = useState(initialEntry?.result || null);
  const [currentId, setCurrentId]     = useState(initialEntry?.id || null);
  const [error, setError]             = useState('');

  const currentEntry = history.find(e => e.id === currentId) || null;

  const onDrop = useCallback(files => { if (files[0]) setFile(files[0]); }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }, maxFiles: 1
  });

  const canAnalyze = () => {
    if (inputType === 'text') return inputText.trim().length > 0;
    if (inputType === 'url')  return inputUrl.trim().length > 0;
    if (inputType === 'file') return file !== null;
  };

  const handleAnalyze = async () => {
    if (!canAnalyze()) return;
    setAnalyzing(true); setResult(null); setError(''); setSkeleton(false);
    try {
      const API = 'http://localhost:8000/api';
      let res;
      if (inputType === 'text') {
        res = await fetch(`${API}/summarize/text`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ text: inputText, length: summaryLength, tone: summaryTone }) });
      } else if (inputType === 'url') {
        res = await fetch(`${API}/summarize/url`,  { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ url: inputUrl, length: summaryLength, tone: summaryTone }) });
      } else {
        const fd = new FormData();
        fd.append('file', file); fd.append('length', summaryLength); fd.append('tone', summaryTone);
        res = await fetch(`${API}/summarize/file`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Analysis failed');
      setAnalyzing(false); setSkeleton(true);
      await new Promise(r => setTimeout(r, 500));
      setSkeleton(false); setResult(data);
      const label = inputType === 'text' ? inputText.trim().slice(0, 40) + '...' : inputType === 'url' ? inputUrl : file?.name || 'File';
      const id = await addEntry({ label, input_type: inputType, sentiment: data.tone_analysis?.sentiment || 'Neutral', summary_preview: (data.summary_detailed || '').slice(0, 120), keywords: data.keywords?.slice(0, 4) || [], result: data });
      setCurrentId(id);
      setCurrentEntryId(id);
    } catch (err) {
      setError(err.message); setAnalyzing(false); setSkeleton(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Premium Input Panel */}
        <div className="lg:col-span-2 glass-panel p-8 flex flex-col h-[480px]">
          {/* Enhanced Input Selector */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-main">
              {[{ id:'text', icon:Type, label:'TEXT' }, { id:'url', icon:LinkIcon, label:'URL' }, { id:'file', icon:Upload, label:'FILE' }].map(({ id, icon: Icon, label }) => (
                <button 
                  key={id} 
                  onClick={() => setInputType(id)} 
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 uppercase tracking-widest ${inputType === id ? 'bg-white dark:bg-slate-800 text-primary-400 shadow-xl border border-primary-500/20 scale-105' : 'text-muted hover:text-main'}`}
                >
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>
            {inputType === 'text' && (
              <div className="px-4 py-1.5 bg-primary-500/5 rounded-full border border-primary-500/10">
                <span className="text-[10px] font-bold text-primary-400 uppercase tracking-tighter">{inputText.length} CHARACTERS</span>
              </div>
            )}
          </div>

          {/* Large Input Area */}
          <div className="flex-1 min-h-0">
            {inputType === 'text' && (
              <textarea 
                value={inputText} 
                onChange={e => setInputText(e.target.value)} 
                placeholder="Paste your intellectual content here for deep analysis..." 
                className="w-full h-full bg-slate-100/30 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-main placeholder:text-muted/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/30 resize-none transition-all duration-300 text-base font-medium leading-relaxed" 
              />
            )}
            {inputType === 'url' && (
              <div className="flex items-center justify-center h-full px-10">
                <div className="w-full max-w-lg">
                  <div className="relative group">
                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted group-focus-within:text-primary-400 transition-colors" />
                    <input 
                      type="url" 
                      value={inputUrl} 
                      onChange={e => setInputUrl(e.target.value)} 
                      className="w-full pl-16 pr-6 py-5 bg-slate-100/30 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl text-main placeholder:text-muted/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/30 text-base font-semibold transition-all duration-300" 
                      placeholder="https://article-link.com/content" 
                    />
                  </div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-[0.2em] text-center mt-6 opacity-50">Secure link ingestion active</p>
                </div>
              </div>
            )}
            {inputType === 'file' && (
              <div {...getRootProps()} className={`w-full h-full rounded-[2rem] border-4 border-dashed flex flex-col items-center justify-center p-10 cursor-pointer transition-all duration-500 group ${isDragActive ? 'border-primary-500 bg-primary-500/10 scale-[0.98]' : 'border-slate-200 dark:border-slate-800 hover:border-primary-500/30 hover:bg-white/5'}`}>
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex flex-col items-center text-center animate-in zoom-in duration-300">
                    <div className="w-24 h-24 rounded-[2rem] bg-primary-500/10 flex items-center justify-center mb-6 border border-primary-500/20 relative shadow-2xl">
                      <FileText className="w-10 h-10 text-primary-400" />
                      <button 
                        onClick={e => { e.stopPropagation(); setFile(null); }} 
                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-2xl flex items-center justify-center text-white hover:bg-red-600 transition-all shadow-lg hover:scale-110 active:scale-90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-lg font-bold text-main truncate max-w-[300px] tracking-tight">{file.name}</p>
                    <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB • READY</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${isDragActive ? 'animate-bounce' : ''}`}>
                      <Upload className={`w-10 h-10 ${isDragActive ? 'text-primary-400' : 'text-muted/40'}`} />
                    </div>
                    <p className="text-lg font-bold text-main mb-2 tracking-tight">{isDragActive ? 'RELEASE TO ANALYZE' : 'INGEST DOCUMENT'}</p>
                    <p className="text-sm text-muted font-semibold uppercase tracking-widest opacity-50">PDF, DOCX Supported • MAX 20MB</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-main">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                {['concise','detailed'].map(opt => (
                  <button key={opt} onClick={() => setLength(opt)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${summaryLength === opt ? 'bg-white dark:bg-slate-800 text-primary-400 shadow-md' : 'text-muted'}`}>{opt}</button>
                ))}
              </div>
              <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                {['professional','casual'].map(opt => (
                  <button key={opt} onClick={() => setTone(opt)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${summaryTone === opt ? 'bg-white dark:bg-slate-800 text-indigo-400 shadow-md' : 'text-muted'}`}>{opt}</button>
                ))}
              </div>
            </div>
            <button 
              onClick={handleAnalyze} 
              disabled={isSummarizing || !canAnalyze()} 
              className="btn-premium flex items-center gap-3 !px-8 !py-4 group"
            >
              {isSummarizing ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> <span className="uppercase tracking-widest font-bold">Synthesizing...</span></>
              ) : (
                <><Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /> <span className="uppercase tracking-widest font-bold">Execute Analysis</span></>
              )}
            </button>
          </div>
        </div>

        {/* Intelligence Settings Panel */}
        <div className="glass-panel p-8 space-y-8 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-main font-display tracking-tight mb-2">Engine Configuration</h3>
            <p className="text-xs text-muted font-semibold uppercase tracking-widest opacity-60">Fine-tune extraction parameters</p>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-primary-500/10 to-indigo-500/10 border border-primary-500/20 relative overflow-hidden group">
              <Brain className="absolute -right-4 -bottom-4 w-24 h-24 text-primary-500/5 group-hover:scale-110 transition-transform duration-1000" />
              <p className="text-[10px] text-primary-400 uppercase tracking-[0.2em] font-bold mb-2">Cognitive Core</p>
              <p className="text-lg font-bold text-main tracking-tight">Neural Engine</p>
              <p className="text-[10px] text-muted font-semibold uppercase tracking-widest mt-2 opacity-50">AI-powered intelligent content analysis</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-3 ml-1">Detail Resolution</p>
                <div className="grid grid-cols-2 gap-3">
                  {['concise','detailed'].map(opt => (
                    <button key={opt} onClick={() => setLength(opt)} className={`py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${summaryLength === opt ? 'bg-primary-500/10 border-primary-500/30 text-primary-400 shadow-xl shadow-primary-500/5' : 'bg-white/5 border-white/5 text-muted hover:bg-white/10'}`}>{opt}</button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-3 ml-1">Output Modulation</p>
                <div className="grid grid-cols-2 gap-3">
                  {['professional','casual'].map(opt => (
                    <button key={opt} onClick={() => setTone(opt)} className={`py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${summaryTone === opt ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-xl shadow-indigo-500/5' : 'bg-white/5 border-white/5 text-muted hover:bg-white/10'}`}>{opt}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-[10px] text-muted font-semibold uppercase tracking-widest">System ready for Ingestion</p>
          </div>
        </div>
      </div>

      {/* Output Intelligence */}
      {isSummarizing && <LoadingOverlay isVisible={isSummarizing} />}
      {showSkeleton && !isSummarizing && <SkeletonOutput />}
      {error && !isSummarizing && !showSkeleton && (
        <div className="flex items-center gap-4 p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 animate-in zoom-in duration-300">
          <AlertCircle className="w-8 h-8 shrink-0" />
          <div>
            <p className="text-sm font-bold uppercase tracking-widest mb-1">Analysis Interrupted</p>
            <p className="text-sm font-medium opacity-80">{error}</p>
          </div>
        </div>
      )}
      {result && !isSummarizing && !showSkeleton && (
        <ResultTabs data={result} entry={currentEntry} updateEntry={updateEntry} />
      )}
      {!result && !isSummarizing && !showSkeleton && !error && (
        <div className="glass-panel p-24 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 border border-main flex items-center justify-center mb-8 shadow-2xl relative z-10 group-hover:rotate-6 transition-transform duration-500">
            <Sparkles className="w-10 h-10 text-primary-500/40 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-main mb-3 font-display tracking-tight relative z-10">Cognitive Engine Idle</h3>
          <p className="text-base text-muted font-medium max-w-sm relative z-10">Awaiting your content input. Paste text, enter a URL, or upload a document to begin the intelligence extraction process.</p>
        </div>
      )}
    </div>
  );
}
