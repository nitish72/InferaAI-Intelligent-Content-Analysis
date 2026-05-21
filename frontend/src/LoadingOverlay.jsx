import { useState, useEffect } from 'react';
import { Brain, Search, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

// ── Processing steps shown during AI analysis ─────────────────────────────────
const STEPS = [
  { id: 1, icon: FileText,    label: 'Reading content',         detail: 'Parsing and cleaning input text...' },
  { id: 2, icon: Search,      label: 'Analyzing structure',     detail: 'Identifying key themes and context...' },
  { id: 3, icon: Brain,       label: 'Generating insights',     detail: 'Applying Neural Engine optimization...' },
  { id: 4, icon: Sparkles,    label: 'Finalizing report',       detail: 'Structuring output sections...' },
];

// ── Orbiting dots loader ──────────────────────────────────────────────────────
function OrbitLoader() {
  return (
    <div className="relative w-20 h-20 mx-auto">
      {/* Core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/40 animate-pulse-slow">
          <Brain className="w-5 h-5 text-white" />
        </div>
      </div>
      {/* Orbiting dots */}
      {[
        { style: { animation: 'orbit 2.4s linear infinite' },  color: 'bg-primary-400' },
        { style: { animation: 'orbit2 2.4s linear infinite' }, color: 'bg-accent-400' },
        { style: { animation: 'orbit3 2.4s linear infinite' }, color: 'bg-indigo-400' },
      ].map((dot, i) => (
        <div key={i} className="absolute inset-0 flex items-center justify-center" style={dot.style}>
          <div className={`w-2.5 h-2.5 rounded-full ${dot.color} shadow-lg`} />
        </div>
      ))}
    </div>
  );
}

// ── Typing text animation ─────────────────────────────────────────────────────
function TypingText({ text }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [text]);

  return (
    <span className={`text-gray-400 text-sm ${displayed.length < text.length ? 'cursor-blink' : ''}`}>
      {displayed}
    </span>
  );
}

// ── Step progress indicator ───────────────────────────────────────────────────
function StepProgress({ currentStep }) {
  return (
    <div className="w-full space-y-2 mt-6">
      {STEPS.map((step, idx) => {
        const StepIcon = step.icon;
        const done    = idx + 1 < currentStep;
        const active  = idx + 1 === currentStep;
        const pending = idx + 1 > currentStep;

        return (
          <div
            key={step.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500"
            style={{
              opacity:   pending ? 0.3 : 1,
              animation: active  ? 'step-in 0.4s ease' : 'none',
              background: active ? 'rgba(99,102,241,0.08)' : 'transparent',
              border:    active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
            }}
          >
            {/* Icon circle */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
              done   ? 'bg-accent-500/20 border border-accent-500/40' :
              active ? 'bg-primary-500/20 border border-primary-500/40 shadow-sm shadow-primary-500/20' :
                       'bg-dark-700 border border-dark-600'
            }`}>
              {done
                ? <CheckCircle2 className="w-4 h-4 text-accent-400" />
                : <StepIcon className={`w-4 h-4 ${active ? 'text-primary-400' : 'text-gray-600'}`} />
              }
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${done ? 'text-accent-400' : active ? 'text-white' : 'text-gray-500'}`}>
                {step.label}
              </p>
              {active && (
                <div className="mt-0.5">
                  <TypingText text={step.detail} />
                </div>
              )}
            </div>

            {/* Active spinner */}
            {active && (
              <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Thin progress bar at top ──────────────────────────────────────────────────
function TopProgressBar({ step, total }) {
  const pct = Math.round(((step - 1) / total) * 100);
  return (
    <div className="w-full h-1 bg-dark-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary-600 via-primary-400 to-accent-400 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Main Loading Overlay ──────────────────────────────────────────────────────
export default function LoadingOverlay({ isVisible }) {
  const [step, setStep] = useState(1);

  // Auto-advance steps on a realistic schedule
  useEffect(() => {
    if (!isVisible) { setStep(1); return; }

    const timings = [0, 1400, 3000, 5200]; // ms delay per step
    const timers  = timings.map((delay, idx) =>
      setTimeout(() => setStep(idx + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="flex flex-col items-center py-6 px-2 animate-in fade-in duration-400"
    >
      {/* Top progress bar */}
      <div className="w-full mb-8">
        <TopProgressBar step={step} total={STEPS.length} />
      </div>

      {/* Orbiting loader */}
      <OrbitLoader />

      {/* Title */}
      <div className="mt-6 text-center">
        <p className="text-white font-semibold text-lg tracking-tight">
          AI is analyzing your content
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Neural Engine: AI-powered intelligent content analysis
        </p>
      </div>

      {/* Steps */}
      <div className="w-full max-w-sm">
        <StepProgress currentStep={step} />
      </div>
    </div>
  );
}

// ── Skeleton Loaders ──────────────────────────────────────────────────────────

function SkeletonLine({ width = 'w-full', height = 'h-3' }) {
  return <div className={`shimmer-bg rounded-lg ${width} ${height}`} />;
}

export function SkeletonCard({ lines = 3, hasHeader = true }) {
  return (
    <div className="glass-panel p-5 space-y-3">
      {hasHeader && (
        <div className="flex items-center gap-2 mb-4">
          <div className="shimmer-bg w-4 h-4 rounded" />
          <SkeletonLine width="w-28" height="h-3" />
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={i === lines - 1 ? 'w-3/4' : 'w-full'}
          height="h-3"
        />
      ))}
    </div>
  );
}

export function SkeletonOutput() {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-2">
        <SkeletonLine width="w-32" height="h-5" />
        <div className="flex gap-2">
          <SkeletonLine width="w-16" height="h-7" />
          <SkeletonLine width="w-20" height="h-7" />
        </div>
      </div>
      <SkeletonCard lines={4} />
      <SkeletonCard lines={5} />
      <SkeletonCard lines={3} />
      <div className="grid grid-cols-3 gap-4">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
    </div>
  );
}
