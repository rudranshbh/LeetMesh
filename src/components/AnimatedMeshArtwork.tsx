import { motion } from 'motion/react';
import { CheckCircle2, Flame, Terminal, Cpu, Activity, Zap, GitBranch, Code2 } from 'lucide-react';

export function AnimatedMeshArtwork() {
  return (
    <div className="relative w-full max-w-lg lg:max-w-xl mx-auto flex flex-col items-center justify-center select-none space-y-4">
      {/* Upper Mesh Node Graph */}
      <div className="relative w-full aspect-[4/3] sm:aspect-square flex items-center justify-center">
        {/* Ambient background glow aura */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-indigo-500/15 rounded-full blur-3xl -z-10 animate-pulse duration-1000" />

        {/* SVG Connecting Mesh Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="lineGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Dynamic mesh lines */}
          <motion.path
            d="M 250 200 L 90 90"
            stroke="url(#lineGrad1)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            initial={{ pathOffset: 0 }}
            animate={{ pathOffset: 1 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          <motion.path
            d="M 250 200 L 400 90"
            stroke="url(#lineGrad1)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            initial={{ pathOffset: 0 }}
            animate={{ pathOffset: -1 }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          />
          <motion.path
            d="M 250 200 L 380 320"
            stroke="url(#lineGrad2)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            initial={{ pathOffset: 0 }}
            animate={{ pathOffset: 1 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.path
            d="M 250 200 L 100 310"
            stroke="url(#lineGrad2)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            initial={{ pathOffset: 0 }}
            animate={{ pathOffset: -1 }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'linear' }}
          />
        </svg>

        {/* Central Host Coder Node */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-20 w-60 sm:w-64 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl ring-1 ring-amber-500/30"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="https://assets.leetcode.com/users/lee215/avatar_1551541889.png"
                  alt="lee215"
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover ring-2 ring-amber-400/80 shadow-md"
                />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-slate-950">
                  1
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-white">@lee215</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Guardian
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Rating 2,204 • Rank #7.5K</p>
              </div>
            </div>
          </div>

          {/* Solved Progress Breakdown */}
          <div className="pt-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Solved</span>
              <span className="font-bold text-amber-400">686 / 3,400</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex">
              <div style={{ width: '18%' }} className="bg-emerald-500" />
              <div style={{ width: '60%' }} className="bg-amber-500" />
              <div style={{ width: '22%' }} className="bg-rose-500" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
              <span className="text-emerald-400">126 Easy</span>
              <span className="text-amber-400">411 Med</span>
              <span className="text-rose-400">149 Hard</span>
            </div>
          </div>
        </motion.div>

        {/* Satellite Node 1: Top Competitor (Tourist) */}
        <motion.div
          animate={{ y: [0, 7, 0], x: [0, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute top-2 left-1 sm:left-4 z-10 p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md max-w-[130px] sm:max-w-[150px]"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-xs font-bold ring-1 ring-indigo-500/40 shrink-0">
              🥇
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-mono font-bold text-slate-200 truncate">@tourist</p>
              <p className="text-[9px] sm:text-[10px] text-emerald-400 font-mono">Rank #1 Global</p>
            </div>
          </div>
        </motion.div>

        {/* Satellite Node 2: Streak Badge */}
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-4 right-1 sm:right-4 z-10 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 shadow-xl backdrop-blur-md flex items-center gap-2"
        >
          <div className="p-1 rounded-md bg-orange-500/30 text-orange-400 shrink-0">
            <Flame className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-orange-300 font-mono">312 Day Streak</p>
            <p className="text-[8px] sm:text-[9px] text-slate-400">Active Sync</p>
          </div>
        </motion.div>

        {/* Satellite Node 3: Live Accepted Submission Chip */}
        <motion.div
          animate={{ y: [0, 6, 0], x: [0, 3, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="absolute bottom-2 left-2 sm:left-6 z-10 p-2 sm:p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 shadow-xl backdrop-blur-md flex items-center gap-2"
        >
          <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-semibold text-slate-200 truncate max-w-[110px] sm:max-w-[140px]">Trapping Rain Water</p>
            <p className="text-[8px] sm:text-[9px] text-emerald-400 font-mono">AC • 0ms (Beats 100%)</p>
          </div>
        </motion.div>

        {/* Satellite Node 4: Network Mesh Status Chip */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          className="absolute bottom-4 right-2 sm:right-6 z-10 p-2 sm:p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md flex items-center gap-2"
        >
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-300">Live GraphQL Sync</span>
        </motion.div>
      </div>

      {/* Lower Technical Telemetry Console (Handcrafted Developer Artwork) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full bg-slate-950/90 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-md space-y-3 font-mono text-xs overflow-hidden relative"
      >
        {/* Subtle scanline / glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-slate-300 font-semibold flex items-center gap-1.5 pl-1">
              <Terminal className="h-3 w-3 text-amber-400" />
              <span>leetmesh-engine :: telemetry</span>
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>200 OK • 12ms</span>
          </span>
        </div>

        {/* Code / GraphQL Execution Log */}
        <div className="space-y-1 text-[11px] leading-relaxed">
          <div className="text-slate-400">
            <span className="text-amber-400">POST</span> /graphql <span className="text-slate-500">→</span> matchedUser(username: <span className="text-emerald-300">"lee215"</span>)
          </div>
          <div className="text-slate-500 text-[10px] pl-3 border-l-2 border-slate-800 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span>acSubmissions: <strong className="text-slate-300">686</strong></span>
            <span>contestRating: <strong className="text-amber-300">2204.6</strong></span>
            <span>percentile: <strong className="text-indigo-300">Top 0.28%</strong></span>
          </div>
        </div>

        {/* Technical Benchmarks (Runtime / Memory / Complexity) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-900 text-[10px]">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <p className="text-slate-400 text-[9px] uppercase tracking-wider">Complexity</p>
            <p className="font-bold text-amber-300 mt-0.5">O(V + E log V)</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <p className="text-slate-400 text-[9px] uppercase tracking-wider">Memory</p>
            <p className="font-bold text-emerald-400 mt-0.5">44.2 MB (96%)</p>
          </div>
          <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex sm:flex-col justify-between sm:justify-start">
            <p className="text-slate-400 text-[9px] uppercase tracking-wider">Runtime</p>
            <p className="font-bold text-sky-400 mt-0.5">3 ms (Beats 99.4%)</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
