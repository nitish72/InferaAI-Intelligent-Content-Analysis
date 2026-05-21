import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageSquare } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function ChatPanel({ entry, updateEntry }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const { token } = useAuth();

  const messages = entry.chat || entry.result?.chat || [];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: input.trim() }];
    updateEntry(entry.id, { chat: newMessages });
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          context: entry.result?.source_text || '',
          messages: newMessages
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);

      updateEntry(entry.id, { 
        chat: [...newMessages, { role: 'assistant', content: data.reply }]
      });
    } catch (err) {
      updateEntry(entry.id, {
        chat: [...newMessages, { role: 'assistant', content: "Error: " + err.message }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel flex flex-col h-[600px] overflow-hidden mt-8 animate-in slide-in-from-bottom-6 fade-in duration-700 shadow-2xl bg-white/5 border-white/10">
      {/* Premium Chat Header */}
      <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20 shadow-lg shadow-primary-500/5">
            <MessageSquare className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="font-black text-main text-base font-display tracking-tight uppercase">Cognitive Assistant</h3>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest opacity-60">Contextual document intelligence active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-black text-muted uppercase tracking-widest">Neural Link Active</span>
        </div>
      </div>

      {/* Enhanced Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth bg-transparent custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-30">
            <div className="w-20 h-20 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 border border-white/10 flex items-center justify-center">
              <Bot className="w-10 h-10" />
            </div>
            <div className="max-w-xs space-y-2">
              <p className="text-base font-black text-main uppercase tracking-widest">Core Analysis Complete</p>
              <p className="text-xs font-medium leading-relaxed">
                Interrogate the document for specific knowledge, semantic clarifications, or executive distillations.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xl transition-transform duration-500 hover:rotate-6 ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-primary-500/20 border border-white/10' 
                  : 'bg-white/10 border border-white/10 text-primary-400'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] px-6 py-4 text-sm shadow-2xl leading-relaxed font-medium transition-all ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-primary-600 to-indigo-700 text-white rounded-3xl rounded-tr-sm'
                  : 'bg-white/10 border border-white/10 text-main rounded-3xl rounded-tl-sm backdrop-blur-md'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-white/10 border border-white/10 text-primary-400">
              <Bot className="w-5 h-5" />
            </div>
            <div className="max-w-[75%] rounded-3xl px-6 py-4 bg-white/10 border border-white/10 text-main rounded-tl-sm flex items-center gap-2 backdrop-blur-md">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Premium Input Area */}
      <form onSubmit={handleSend} className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="relative flex items-center group">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Interrogate document contents..."
            className="w-full bg-slate-100/30 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl pl-6 pr-16 py-4 text-sm font-bold text-main placeholder:text-muted/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/30 transition-all duration-300 shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2.5 w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed hover:from-primary-500 hover:to-indigo-500 transition-all shadow-lg shadow-primary-500/20 active:scale-90"
          >
            <Send className="w-5 h-5 -ml-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
