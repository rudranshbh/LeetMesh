import { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  SlidersHorizontal, 
  Search, 
  ExternalLink, 
  Trash2, 
  RefreshCw, 
  Filter, 
  Award, 
  Check, 
  TrendingUp,
  X
} from 'lucide-react';
import { LeetCodeUserStats } from '../types';
import { AVAILABLE_COLUMNS, formatRelativeTime } from '../utils/constants';

interface LeaderboardTableProps {
  members: LeetCodeUserStats[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (columnId: string, order: 'asc' | 'desc') => void;
  visibleColumns: string[];
  onToggleColumn: (columnId: string) => void;
  onSelectUser: (user: LeetCodeUserStats) => void;
  onRefreshUser: (username: string) => void;
  onRemoveUser: (username: string) => void;
  isViewOnly?: boolean;
}

export function LeaderboardTable({
  members,
  sortBy,
  sortOrder,
  onSortChange,
  visibleColumns,
  onToggleColumn,
  onSelectUser,
  onRefreshUser,
  onRemoveUser,
  isViewOnly = false,
}: LeaderboardTableProps) {
  // Local table filters
  const [searchQuery, setSearchQuery] = useState('');
  const [minSolved, setMinSolved] = useState<number | ''>('');
  const [minRating, setMinRating] = useState<number | ''>('');
  const [badgeFilter, setBadgeFilter] = useState<string>('all');
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Column toggle
  const isColVisible = (id: string) => visibleColumns.includes(id);

  // Header click handler for sorting
  const handleHeaderClick = (columnId: string) => {
    // If not sortable
    if (columnId === 'avatar' || columnId === 'actions') return;

    if (sortBy === columnId) {
      onSortChange(columnId, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default new column to desc for numeric values, asc for username
      const defaultDesc = columnId !== 'user';
      onSortChange(columnId, defaultDesc ? 'desc' : 'asc');
    }
  };

  // Filtered & Sorted members
  const processedMembers = useMemo(() => {
    let result = [...members];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        m => m.username.toLowerCase().includes(q) || m.realName.toLowerCase().includes(q)
      );
    }

    // Min solved
    if (typeof minSolved === 'number' && minSolved > 0) {
      result = result.filter(m => m.totalSolved >= minSolved);
    }

    // Min rating
    if (typeof minRating === 'number' && minRating > 0) {
      result = result.filter(m => (m.contestRating || 0) >= minRating);
    }

    // Badge filter
    if (badgeFilter !== 'all') {
      if (badgeFilter === 'none') {
        result = result.filter(m => !m.contestBadge);
      } else {
        result = result.filter(m => m.contestBadge?.toLowerCase() === badgeFilter.toLowerCase());
      }
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      switch (sortBy) {
        case 'user':
          valA = a.username.toLowerCase();
          valB = b.username.toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        case 'totalSolved':
          valA = a.totalSolved;
          valB = b.totalSolved;
          break;
        case 'easySolved':
          valA = a.easySolved;
          valB = b.easySolved;
          break;
        case 'mediumSolved':
          valA = a.mediumSolved;
          valB = b.mediumSolved;
          break;
        case 'hardSolved':
          valA = a.hardSolved;
          valB = b.hardSolved;
          break;
        case 'contestRating':
          valA = a.contestRating || 0;
          valB = b.contestRating || 0;
          break;
        case 'contestGlobalRanking':
          // lower ranking is better!
          valA = a.contestGlobalRanking || 9999999;
          valB = b.contestGlobalRanking || 9999999;
          break;
        case 'attendedContests':
          valA = a.attendedContests || 0;
          valB = b.attendedContests || 0;
          break;
        case 'acceptanceRate':
          valA = a.acceptanceRate || 0;
          valB = b.acceptanceRate || 0;
          break;
        case 'lastSubmission':
          valA = a.lastSubmission?.timestamp || 0;
          valB = b.lastSubmission?.timestamp || 0;
          break;
        case 'rank':
        default:
          valA = a.totalSolved;
          valB = b.totalSolved;
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [members, searchQuery, minSolved, minRating, badgeFilter, sortBy, sortOrder]);

  const activeFilterCount = (minSolved !== '' ? 1 : 0) + (minRating !== '' ? 1 : 0) + (badgeFilter !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery('');
    setMinSolved('');
    setMinRating('');
    setBadgeFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search, Filter toggle, Column customizer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coders by username or name..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Filters Toggle Button */}
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
              activeFilterCount > 0
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Filter className="h-3.5 w-3.5 text-amber-400" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Customize Columns Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <span>Columns</span>
            </button>

            {/* Column Picker Dropdown */}
            {showColumnPicker && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 p-2 text-xs space-y-1 divide-y divide-slate-800">
                <div className="px-2 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Visible Columns
                </div>
                <div className="pt-1 max-h-60 overflow-y-auto space-y-0.5">
                  {AVAILABLE_COLUMNS.map((col) => {
                    const checked = isColVisible(col.id);
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => onToggleColumn(col.id)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer text-left"
                      >
                        <span>{col.label}</span>
                        {checked && <Check className="h-3.5 w-3.5 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Filter Drawer */}
      {showFilterDrawer && (
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              <span>Refine Coder Rankings</span>
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Min. Problems Solved</label>
              <input
                type="number"
                value={minSolved}
                onChange={(e) => setMinSolved(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)))}
                placeholder="e.g. 100"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Min. Contest Rating</label>
              <input
                type="number"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)))}
                placeholder="e.g. 1800"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Contest Badge</label>
              <select
                value={badgeFilter}
                onChange={(e) => setBadgeFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              >
                <option value="all">All Badges</option>
                <option value="Guardian">Guardian</option>
                <option value="Knight">Knight</option>
                <option value="none">No Badge</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 select-none">
                {isColVisible('rank') && (
                  <th
                    scope="col"
                    onClick={() => handleHeaderClick('rank')}
                    className="py-3 px-3 text-center cursor-pointer hover:text-white"
                  >
                    <div className="inline-flex items-center gap-1 justify-center">
                      <span>#</span>
                      {sortBy === 'rank' && (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-amber-400" /> : <ArrowDown className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                  </th>
                )}

                {isColVisible('user') && (
                  <th
                    scope="col"
                    onClick={() => handleHeaderClick('user')}
                    className="py-3 px-4 text-left cursor-pointer hover:text-white"
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>Coder</span>
                      {sortBy === 'user' && (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-amber-400" /> : <ArrowDown className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                  </th>
                )}

                {isColVisible('totalSolved') && (
                  <th
                    scope="col"
                    onClick={() => handleHeaderClick('totalSolved')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  >
                    <div className="inline-flex items-center gap-1 justify-end">
                      <span>Solved</span>
                      {sortBy === 'totalSolved' && (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-amber-400" /> : <ArrowDown className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                  </th>
                )}

                {isColVisible('easySolved') && (
                  <th
                    scope="col"
                    onClick={() => handleHeaderClick('easySolved')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-emerald-400 text-emerald-500/80"
                  >
                    <div className="inline-flex items-center gap-1 justify-end">
                      <span>Easy</span>
                      {sortBy === 'easySolved' && (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-emerald-400" /> : <ArrowDown className="h-3 w-3 text-emerald-400" />
                      )}
                    </div>
                  </th>
                )}

                {isColVisible('mediumSolved') && (
                  <th
                    scope="col"
                    onClick={() => handleHeaderClick('mediumSolved')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-amber-400 text-amber-500/80"
                  >
                    <div className="inline-flex items-center gap-1 justify-end">
                      <span>Med</span>
                      {sortBy === 'mediumSolved' && (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-amber-400" /> : <ArrowDown className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                  </th>
                )}

                {isColVisible('hardSolved') && (
                  <th
                    scope="col"
                    onClick={() => handleHeaderClick('hardSolved')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-rose-400 text-rose-500/80"
                  >
                    <div className="inline-flex items-center gap-1 justify-end">
                      <span>Hard</span>
                      {sortBy === 'hardSolved' && (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-rose-400" /> : <ArrowDown className="h-3 w-3 text-rose-400" />
                      )}
                    </div>
                  </th>
                )}

                {isColVisible('contestRating') && (
                  <th
                    scope="col"
                    onClick={() => handleHeaderClick('contestRating')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  >
                    <div className="inline-flex items-center gap-1 justify-end">
                      <span>Rating</span>
                      {sortBy === 'contestRating' && (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-amber-400" /> : <ArrowDown className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                  </th>
                )}

                {isColVisible('contestBadge') && (
                  <th scope="col" className="py-3 px-3 text-center">
                    <span>Badge</span>
                  </th>
                )}

                {isColVisible('contestGlobalRanking') && (
                  <th
                    scope="col"
                    onClick={() => handleHeaderClick('contestGlobalRanking')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-white whitespace-nowrap"
                  >
                    <div className="inline-flex items-center gap-1 justify-end">
                      <span>Rank</span>
                      {sortBy === 'contestGlobalRanking' && (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-amber-400" /> : <ArrowDown className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                  </th>
                )}

                {isColVisible('attendedContests') && (
                  <th
                    scope="col"
                    onClick={() => handleHeaderClick('attendedContests')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  >
                    <div className="inline-flex items-center gap-1 justify-end">
                      <span>Contests</span>
                      {sortBy === 'attendedContests' && (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-amber-400" /> : <ArrowDown className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                  </th>
                )}

                {isColVisible('acceptanceRate') && (
                  <th
                    scope="col"
                    onClick={() => handleHeaderClick('acceptanceRate')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  >
                    <div className="inline-flex items-center gap-1 justify-end">
                      <span>Acc %</span>
                      {sortBy === 'acceptanceRate' && (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-amber-400" /> : <ArrowDown className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                  </th>
                )}

                {isColVisible('lastSubmission') && (
                  <th
                    scope="col"
                    onClick={() => handleHeaderClick('lastSubmission')}
                    className="py-3 px-4 text-left cursor-pointer hover:text-white"
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>Last Active</span>
                      {sortBy === 'lastSubmission' && (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-amber-400" /> : <ArrowDown className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                  </th>
                )}

                {isColVisible('actions') && (
                  <th scope="col" className="py-3 px-3 text-center">
                    <span>Actions</span>
                  </th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60">
              {processedMembers.map((member, index) => {
                const rank = index + 1;
                return (
                  <tr
                    key={member.username}
                    className="hover:bg-slate-900/60 transition-colors group cursor-pointer"
                    onClick={() => onSelectUser(member)}
                  >
                    {/* Rank */}
                    {isColVisible('rank') && (
                      <td className="py-3.5 px-3 text-center font-mono">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 shadow-sm shadow-amber-500/20">
                            🥇
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-400/20 text-slate-300 text-xs font-bold border border-slate-400/30">
                            🥈
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-700/20 text-amber-600 text-xs font-bold border border-amber-700/30">
                            🥉
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs font-medium">{rank}</span>
                        )}
                      </td>
                    )}

                    {/* User */}
                    {isColVisible('user') && (
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.username}
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                                {member.username}
                              </span>
                            </div>
                            {member.realName && (
                              <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                                {member.realName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Total Solved */}
                    {isColVisible('totalSolved') && (
                      <td className="py-3.5 px-3 text-right">
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          {member.totalSolved.toLocaleString()}
                        </span>
                      </td>
                    )}

                    {/* Easy */}
                    {isColVisible('easySolved') && (
                      <td className="py-3.5 px-3 text-right font-mono text-emerald-400 text-xs">
                        {member.easySolved}
                      </td>
                    )}

                    {/* Medium */}
                    {isColVisible('mediumSolved') && (
                      <td className="py-3.5 px-3 text-right font-mono text-amber-400 text-xs">
                        {member.mediumSolved}
                      </td>
                    )}

                    {/* Hard */}
                    {isColVisible('hardSolved') && (
                      <td className="py-3.5 px-3 text-right font-mono text-rose-400 text-xs font-semibold">
                        {member.hardSolved}
                      </td>
                    )}

                    {/* Contest Rating */}
                    {isColVisible('contestRating') && (
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-200 text-xs">
                        {member.contestRating ? (
                          <span className="text-amber-300 font-semibold">{member.contestRating}</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    )}

                    {/* Contest Badge */}
                    {isColVisible('contestBadge') && (
                      <td className="py-3.5 px-3 text-center">
                        {member.contestBadge ? (
                          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            member.contestBadge.toLowerCase() === 'guardian'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-xs shadow-amber-500/20'
                              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          }`}>
                            {member.contestBadge}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                    )}

                    {/* Contest Global Rank */}
                    {isColVisible('contestGlobalRanking') && (
                      <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-400">
                        {member.contestGlobalRanking ? `#${member.contestGlobalRanking.toLocaleString()}` : '—'}
                      </td>
                    )}

                    {/* Contests Attended */}
                    {isColVisible('attendedContests') && (
                      <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-400">
                        {member.attendedContests ?? 0}
                      </td>
                    )}

                    {/* Acceptance Rate */}
                    {isColVisible('acceptanceRate') && (
                      <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-400">
                        {member.acceptanceRate ? `${member.acceptanceRate}%` : '—'}
                      </td>
                    )}

                    {/* Last Submission */}
                    {isColVisible('lastSubmission') && (
                      <td className="py-3.5 px-4 text-left">
                        {member.lastSubmission ? (
                          <div className="max-w-[200px]">
                            <p className="text-xs text-slate-300 truncate" title={member.lastSubmission.title}>
                              {member.lastSubmission.title}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <span className={member.lastSubmission.status === 'Accepted' ? 'text-emerald-400' : 'text-slate-400'}>
                                {member.lastSubmission.status}
                              </span>
                              <span>•</span>
                              <span>{formatRelativeTime(member.lastSubmission.timestamp)}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600 italic">No recent activity</span>
                        )}
                      </td>
                    )}

                    {/* Actions */}
                    {isColVisible('actions') && (
                      <td
                        className="py-3.5 px-3 text-center"
                        onClick={(e) => e.stopPropagation()} // Prevent row click opening modal
                      >
                        <div className="inline-flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onRefreshUser(member.username)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title={`Refresh ${member.username}'s stats`}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>

                          <a
                            href={`https://leetcode.com/u/${member.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Open LeetCode profile"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>

                          {!isViewOnly && (
                            <button
                              type="button"
                              onClick={() => onRemoveUser(member.username)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Remove from board"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty matching filters state */}
        {processedMembers.length === 0 && (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <p className="text-sm">No coders matched your filter criteria.</p>
            <button
              onClick={resetFilters}
              className="text-xs text-amber-400 hover:underline cursor-pointer font-medium"
            >
              Clear filters to show all members
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
