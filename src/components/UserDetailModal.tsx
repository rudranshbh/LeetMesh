import { X, ExternalLink, Award, CheckCircle2, Calendar, Flame, RefreshCw, BarChart2 } from 'lucide-react';
import { LeetCodeUserStats } from '../types';
import { formatRelativeTime } from '../utils/constants';

interface UserDetailModalProps {
  user: LeetCodeUserStats | null;
  onClose: () => void;
  onRefreshUser?: (username: string) => void;
}

export function UserDetailModal({ user, onClose, onRefreshUser }: UserDetailModalProps) {
  if (!user) return null;

  const total = user.totalSolved || 0;
  const easyPct = total > 0 ? (user.easySolved / total) * 100 : 0;
  const medPct = total > 0 ? (user.mediumSolved / total) * 100 : 0;
  const hardPct = total > 0 ? (user.hardSolved / total) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header / Avatar banner */}
        <div className="relative p-6 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-4">
            <img
              src={user.avatar}
              alt={user.username}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-amber-500/40 shadow-xl"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white truncate font-mono">
                  @{user.username}
                </h3>
                {user.contestBadge && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {user.contestBadge}
                  </span>
                )}
              </div>

              {user.realName && (
                <p className="text-sm text-slate-300 truncate">{user.realName}</p>
              )}

              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                {user.countryName && <span>📍 {user.countryName}</span>}
                {user.ranking && <span>Global #{user.ranking.toLocaleString()}</span>}
                <span>⭐ Rep: {user.reputation?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Solved Problems Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-slate-400">
              <span>Problems Solved</span>
              <span className="font-mono text-amber-400 text-sm font-bold">{user.totalSolved}</span>
            </div>

            {/* Segmented bar */}
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex">
              <div style={{ width: `${easyPct}%` }} className="bg-emerald-500 transition-all" title={`Easy: ${user.easySolved}`} />
              <div style={{ width: `${medPct}%` }} className="bg-amber-500 transition-all" title={`Medium: ${user.mediumSolved}`} />
              <div style={{ width: `${hardPct}%` }} className="bg-rose-500 transition-all" title={`Hard: ${user.hardSolved}`} />
            </div>

            {/* Badges row */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/20 text-center">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Easy</span>
                <p className="text-lg font-bold font-mono text-emerald-300 mt-0.5">{user.easySolved}</p>
                <p className="text-[10px] text-slate-500">{user.easySubmissions} subs</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/20 text-center">
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Medium</span>
                <p className="text-lg font-bold font-mono text-amber-300 mt-0.5">{user.mediumSolved}</p>
                <p className="text-[10px] text-slate-500">{user.mediumSubmissions} subs</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/20 text-center">
                <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Hard</span>
                <p className="text-lg font-bold font-mono text-rose-300 mt-0.5">{user.hardSolved}</p>
                <p className="text-[10px] text-slate-500">{user.hardSubmissions} subs</p>
              </div>
            </div>
          </div>

          {/* Contest Stats */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-slate-400">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Contest Performance</span>
            </div>

            {user.contestRating ? (
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <p className="text-[11px] text-slate-500">Rating</p>
                  <p className="text-base font-bold font-mono text-amber-400">{user.contestRating}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Global Rank</p>
                  <p className="text-base font-bold font-mono text-slate-200">
                    {user.contestGlobalRanking ? `#${user.contestGlobalRanking.toLocaleString()}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Attended</p>
                  <p className="text-base font-bold font-mono text-slate-200">
                    {user.attendedContests ?? 0}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No contest participation recorded yet.</p>
            )}
          </div>

          {/* Activity & Recent Submission */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-slate-400">
                <Flame className="h-4 w-4 text-orange-400" />
                <span>Recent Activity</span>
              </div>
              {user.activeDaysPastYear !== undefined && (
                <span className="text-xs text-slate-400 font-mono">
                  {user.activeDaysPastYear} active days this year
                </span>
              )}
            </div>

            {user.lastSubmission ? (
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200 truncate pr-2">
                    {user.lastSubmission.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                    user.lastSubmission.status === 'Accepted'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {user.lastSubmission.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{formatRelativeTime(user.lastSubmission.timestamp)}</span>
                  <span>•</span>
                  <span>{user.lastSubmission.lang}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No recent submission data available.</p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-4 bg-slate-950/60 border-t border-slate-800">
          {onRefreshUser && (
            <button
              onClick={() => onRefreshUser(user.username)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Stats</span>
            </button>
          )}

          <a
            href={`https://leetcode.com/u/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors cursor-pointer ml-auto"
          >
            <span>Open LeetCode Profile</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
