import { motion } from 'motion/react';
import { Trophy, CheckCircle2, Flame, Award, Zap, GitBranch, Terminal } from 'lucide-react';

export function AnimatedMeshArtwork() {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center select-none">
      {/* Ambient background glow aura */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-indigo-500/15 rounded-full blur-3xl -z-10 animate-pulse duration-1000" />

      {/* SVG Connecting Mesh Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="lineGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Dynamic mesh lines */}
        <motion.path
          d="M 250 250 L 110 110"
          stroke="url(#lineGrad1)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: 1 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        <motion.path
          d="M 250 250 L 390 120"
          stroke="url(#lineGrad1)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: -1 }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        />
        <motion.path
          d="M 250 250 L 370 380"
          stroke="url(#lineGrad2)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: 1 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.path
          d="M 250 250 L 130 370"
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
        className="relative z-20 w-64 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl ring-1 ring-amber-500/30"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src="https://assets.leetcode.com/users/lee215/avatar_1551541889.png"
                alt="lee215"
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-amber-400/80 shadow-md"
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

        {/* Problems breakdown segment */}
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
        animate={{ y: [0, 8, 0], x: [0, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-4 left-2 z-10 p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md max-w-[150px]"
      >
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-xs font-bold ring-1 ring-indigo-500/40">
            🥇
          </div>
          <div className="min-w-0">
            <p className="text-xs font-mono font-bold text-slate-200 truncate">@tourist</p>
            <p className="text-[10px] text-emerald-400 font-mono">Rank #1 Global</p>
          </div>
        </div>
      </motion.div>

      {/* Satellite Node 2: Floating Streak Badge */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-6 right-2 z-10 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 shadow-xl backdrop-blur-md flex items-center gap-2"
      >
        <div className="p-1 rounded-md bg-orange-500/30 text-orange-400">
          <Flame className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-orange-300 font-mono">312 Day Streak</p>
          <p className="text-[9px] text-slate-400">Active Network</p>
        </div>
      </motion.div>

      {/* Satellite Node 3: Live Accepted Submission Chip */}
      <motion.div
        animate={{ y: [0, 6, 0], x: [0, 3, 0] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="absolute bottom-6 left-4 z-10 p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 shadow-xl backdrop-blur-md flex items-center gap-2.5"
      >
        <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-200">Trapping Rain Water</p>
          <p className="text-[9px] text-emerald-400 font-mono">AC • 0ms (Beats 100%)</p>
        </div>
      </motion.div>

      {/* Satellite Node 4: Network Mesh Status Chip */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="absolute bottom-8 right-2 z-10 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md flex items-center gap-2"
      >
        <div className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
        <span className="text-[10px] font-mono text-slate-300">Live GraphQL Sync</span>
      </motion.div>
    </div>
  );
}
