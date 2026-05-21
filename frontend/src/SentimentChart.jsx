import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const SENTIMENT_COLORS = {
  positive: '#34d399',  // emerald
  negative: '#f87171',  // red
  neutral:  '#818cf8',  // indigo
};

const LABELS = { positive: 'Positive', negative: 'Negative', neutral: 'Neutral' };

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 shadow-xl text-sm">
      <span style={{ color: SENTIMENT_COLORS[name] }} className="font-semibold">
        {LABELS[name]}
      </span>
      <span className="text-gray-300 ml-2">{value}%</span>
    </div>
  );
}

// ── Confidence progress bar ───────────────────────────────────────────────────
function ConfidenceBar({ score = 75, label = 'High' }) {
  const color =
    score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171';

  return (
    <div className="space-y-2 pt-2 border-t border-dark-700/50">
      <div className="flex justify-between items-end">
        <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Confidence</span>
        <span className="text-xs font-bold whitespace-nowrap" style={{ color }}>
          {label} <span className="opacity-40 mx-1">/</span> {score}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-dark-900/50 rounded-full overflow-hidden p-[1px] border border-dark-700/30">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.5)]"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Percentage row ────────────────────────────────────────────────────────────
function SentimentRow({ type, value }) {
  const color = SENTIMENT_COLORS[type];
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 w-20 shrink-0">
        <span className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-medium text-gray-400 capitalize">{LABELS[type]}</span>
      </div>
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-dark-900/50 rounded-full overflow-hidden border border-dark-700/30">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${value}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-[11px] font-bold text-gray-200 w-8 text-right tabular-nums">{value}%</span>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function SentimentChart({ toneAnalysis }) {
  if (!toneAnalysis) return null;

  const scores = toneAnalysis.sentiment_scores || { positive: 60, negative: 15, neutral: 25 };
  const confidenceScore = toneAnalysis.confidence_score ?? 75;
  const confidenceLabel = toneAnalysis.confidence || 'High';

  const donutData = [
    { name: 'positive', value: scores.positive },
    { name: 'negative', value: scores.negative },
    { name: 'neutral',  value: scores.neutral  },
  ].filter(d => d.value > 0);

  // dominant sentiment
  const dominant = donutData.reduce((a, b) => (a.value > b.value ? a : b));

  return (
    <div className="relative overflow-hidden group w-full h-full flex flex-col">
      {/* ambient glow */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-all duration-700"
        style={{ backgroundColor: SENTIMENT_COLORS[dominant.name] }}
      />

      <div className="relative z-10 flex flex-col h-full space-y-6">
        {/* Header */}
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ backgroundColor: SENTIMENT_COLORS[dominant.name] }} />
          Sentiment Analysis
        </h3>

        {/* Donut chart + centre label */}
        <div className="relative h-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                animationBegin={0}
                animationDuration={900}
                strokeWidth={0}
              >
                {donutData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={SENTIMENT_COLORS[entry.name]}
                    opacity={0.9}
                    className="hover:opacity-100 transition-opacity duration-300"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centre overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-white tracking-tight">{dominant.value}%</span>
            <span
              className="text-[10px] font-bold uppercase tracking-widest mt-1"
              style={{ color: SENTIMENT_COLORS[dominant.name] }}
            >
              {LABELS[dominant.name]}
            </span>
          </div>
        </div>

        {/* Percentage rows */}
        <div className="flex-1 space-y-3 px-1">
          {donutData.map(d => (
            <SentimentRow key={d.name} type={d.name} value={d.value} />
          ))}
        </div>

        {/* Confidence bar */}
        <div className="mt-auto pt-2">
          <ConfidenceBar score={confidenceScore} label={confidenceLabel} />
        </div>
      </div>
    </div>
  );
}
