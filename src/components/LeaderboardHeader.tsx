import { useState } from 'react';
import { 
  RefreshCw, 
  Download, 
  Trash2, 
  UserPlus, 
  Plus, 
  Loader2, 
  Share2,
  Eye,
  BookmarkPlus
} from 'lucide-react';
import { LeaderboardDoc } from '../types';
import { exportLeaderboardToCSV, formatRelativeTime } from '../utils/constants';

interface LeaderboardHeaderProps {
  board: LeaderboardDoc;
  onRefreshAll: (refetchRosterIfEligible: boolean) => Promise<void>;
  isRefreshing: boolean;
  onAddMember: (username: string) => Promise<void>;
  onDeleteBoard: () => void;
  isOwner: boolean;
  isViewOnly: boolean;
  onShare: () => void;
  onCloneBoard?: () => void;
}

export function LeaderboardHeader({
  board,
  onRefreshAll,
  isRefreshing,
  onAddMember,
  onDeleteBoard,
  isOwner,
  isViewOnly,
  onShare,
  onCloneBoard,
}: LeaderboardHeaderProps) {
  const [showAddInput, setShowAddInput] = useState(false);
  const [newHandle, setNewHandle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const handle = newHandle.trim().replace(/^@/, '');
    if (!handle) return;

    setAddError(null);
    setIsAdding(true);
    try {
      await onAddMember(handle);
      setNewHandle('');
      setShowAddInput(false);
    } catch (err: any) {
      setAddError(err.message || 'Failed to add coder');
    } finally {
      setIsAdding(false);
    }
  };

  const handleExport = () => {
    exportLeaderboardToCSV(board.name, board.members);
  };

  const lastUpdatedSec = board.updatedAt || board.createdAt 
    ? Math.floor(new Date(board.updatedAt || board.createdAt).getTime() / 1000)
    : undefined;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
      {/* View-Only Slim Banner */}
      {isViewOnly && (
        <div className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>View-Only Shared Board</span>
          </div>

          {onCloneBoard && (
            <button
              onClick={onCloneBoard}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-md transition-colors cursor-pointer text-[11px]"
            >
              <BookmarkPlus className="h-3 w-3" />
              <span>Save Copy</span>
            </button>
          )}
        </div>
      )}

      {/* Main Bar: Clean title, count, and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title and stats summary */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate max-w-md">
              {board.name}
            </h1>
            {board.sourceUsername && (
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                @{board.sourceUsername}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
            <span className="font-medium text-slate-300">{board.members.length} coders</span>
            <span>•</span>
            <span>Updated {formatRelativeTime(lastUpdatedSec)}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono" title="Automatically fetches fresh statistics whenever this browser tab is focused">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>Auto-Sync on Tab Focus</span>
            </span>
            {board.description && (
              <>
                <span>•</span>
                <span className="text-slate-500 truncate max-w-[200px]">{board.description}</span>
              </>
            )}
          </div>
        </div>

        {/* Uncluttered Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
            title="Share view-only link"
          >
            <Share2 className="h-3.5 w-3.5 text-amber-400" />
            <span>Share</span>
          </button>

          {!isViewOnly && isOwner && (
            <button
              onClick={() => setShowAddInput(!showAddInput)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5 text-amber-400" />
              <span>Add Coder</span>
            </button>
          )}

          <button
            onClick={() => onRefreshAll(board.autoRefetchMembers)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden md:inline">CSV</span>
          </button>

          {!isViewOnly && isOwner && (
            <button
              onClick={onDeleteBoard}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer ml-1"
              title="Delete board"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Add Coder Form */}
      {showAddInput && !isViewOnly && (
        <form onSubmit={handleQuickAdd} className="pt-2 border-t border-slate-800/80 flex gap-2 max-w-sm">
          <input
            type="text"
            value={newHandle}
            onChange={(e) => setNewHandle(e.target.value.replace(/[@\s]/g, ''))}
            placeholder="LeetCode username..."
            className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={isAdding || !newHandle.trim()}
            className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg disabled:opacity-50 flex items-center gap-1 cursor-pointer shrink-0"
          >
            {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3 stroke-[3]" />}
            <span>Add</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddInput(false);
              setAddError(null);
            }}
            className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
        </form>
      )}

      {addError && <p className="text-xs text-rose-400">{addError}</p>}
    </div>
  );
}
