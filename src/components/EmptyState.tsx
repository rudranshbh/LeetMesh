import { Trophy, Users, BarChart3, Cloud, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface EmptyStateProps {
  onOpenCreate: () => void;
  onQuickPreset: (username: string) => void;
}

export function EmptyState({ onOpenCreate, onQuickPreset }: EmptyStateProps) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Real-time LeetCode Social Analytics</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Track & Compete with Your <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
            LeetCode Network
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base text-slate-400 leading-relaxed">
          Generate live leaderboards directly from followers, following lists, or hand-picked coders.
          Compare problem breakdowns, contest ratings, streaks, and recent submission activity.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenCreate}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-95"
          >
            <span>Create Leaderboard</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Quick Launch Presets */}
      <div className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Or explore community circles with one click
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              handle: 'lee215',
              title: '@lee215 Circle',
              desc: 'Legendary solution author with 230K+ reputation'
            },
            {
              handle: 'tourist',
              title: '@tourist Network',
              desc: 'World champion competitive programmer'
            },
            {
              handle: 'neal_wu',
              title: '@neal_wu Circle',
              desc: 'Top-ranked LeetCode contest champion'
            }
          ].map((preset) => (
            <button
              key={preset.handle}
              onClick={() => onQuickPreset(preset.handle)}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-slate-200 group-hover:text-amber-400">
                  {preset.title}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-1">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Social Graph Import</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fetch followers, following, or both with candidate search and selective multi-pick.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <BarChart3 className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Customizable Metrics</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sort by Easy/Med/Hard solved, contest rating, badges, global ranking, and last active time.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Cloud className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Persistent Cloud Storage</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sign in with Google to save multiple named leaderboards and access them across devices.
          </p>
        </div>
      </div>
    </div>
  );
}
