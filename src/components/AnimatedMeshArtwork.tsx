import { motion } from 'motion/react';
import { Terminal, Activity, Cpu } from 'lucide-react';

export function AnimatedMeshArtwork() {
  return (
    <div className="relative w-full max-w-lg lg:max-w-xl mx-auto flex flex-col items-center justify-center select-none space-y-4">
      {/* Central Core Server Node */}
      <div className="relative w-full aspect-[4/3] sm:aspect-square flex items-center justify-center">
        {/* Ambient background glow aura */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-indigo-500/15 rounded-full blur-3xl -z-10 animate-pulse duration-1000" />

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-20 w-72 sm:w-80 bg-slate-900/95 border border-slate-700/90 rounded-2xl p-5 shadow-2xl backdrop-blur-xl ring-1 ring-amber-500/40"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center ring-1 ring-amber-500/40 shadow-inner">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-sm font-bold text-white tracking-wide">LEETMESH CORE</span>
                <p className="text-[11px] text-emerald-400 font-mono">GraphQL Proxy Cluster</p>
              </div>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="pt-3.5 space-y-2 text-xs font-mono text-slate-300">
            <div className="flex justify-between bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">Cache TTL</span>
              <span className="text-amber-400 font-bold">180s Active</span>
            </div>
            <div className="flex justify-between bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">Pipeline Workers</span>
              <span className="text-emerald-400 font-bold">3 Concurrent</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Lower Technical Telemetry Console */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-3 font-mono text-xs overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-slate-300 font-semibold flex items-center gap-1.5 pl-1">
              <Terminal className="h-3 w-3 text-amber-400" />
              <span>leetmesh-cluster :: diagnostics</span>
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>Operational • 12ms</span>
          </span>
        </div>

        <div className="space-y-1 text-[11px] leading-relaxed">
          <div className="text-slate-400">
            <span className="text-amber-400">GET</span> /api/leetcode/batch-stats <span className="text-slate-500">→</span> statusCode: <span className="text-emerald-300">200 OK</span>
          </div>
          <div className="text-slate-500 text-[10px] pl-3 border-l-2 border-slate-800 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span>rateLimitCheck: <strong className="text-slate-300">Passed</strong></span>
            <span>batchSize: <strong className="text-amber-300">15 Coders</strong></span>
            <span>latency: <strong className="text-indigo-300">18ms avg</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-900 text-[10px]">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <p className="text-slate-400 text-[9px] uppercase tracking-wider">Protocol</p>
            <p className="font-bold text-amber-300 mt-0.5">HTTPS / GraphQL</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <p className="text-slate-400 text-[9px] uppercase tracking-wider">Storage</p>
            <p className="font-bold text-emerald-400 mt-0.5">Google Firestore</p>
          </div>
          <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex sm:flex-col justify-between sm:justify-start">
            <p className="text-slate-400 text-[9px] uppercase tracking-wider">Sharing</p>
            <p className="font-bold text-sky-400 mt-0.5">View-Only Mode</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
