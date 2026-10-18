import { X, Trophy, Trash2, Calendar, Users, Plus, ArrowRight } from 'lucide-react';
import { LeaderboardDoc } from '../types';

interface SavedLeaderboardsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboards: LeaderboardDoc[];
  activeBoardId: string | null;
  onSelectBoard: (board: LeaderboardDoc) => void;
  onDeleteBoard: (id: string, name: string) => void;
  onOpenCreate: () => void;
}

export function SavedLeaderboardsDrawer({
  isOpen,
  onClose,
  leaderboards,
  activeBoardId,
  onSelectBoard,
  onDeleteBoard,
  onOpenCreate,
}: SavedLeaderboardsDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">My Saved Leaderboards</h2>
              <p className="text-xs text-slate-400">{leaderboards.length} saved in your cloud account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Boards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {leaderboards.map((board) => {
            const isActive = board.id === activeBoardId;
            return (
              <div
                key={board.id}
                onClick={() => {
                  onSelectBoard(board);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'}`}>
                      {board.name}
                    </h3>
                    {board.description && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{board.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-mono text-slate-400">
                        <Users className="h-3 w-3" />
                        <span>{board.members?.length || 0} coders</span>
                      </span>
                      <span>•</span>
                      <span>{new Date(board.updatedAt || board.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBoard(board.id, board.name);
                    }}
                    className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-40 group-hover:opacity-100 cursor-pointer"
                    title="Delete board"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {leaderboards.length === 0 && (
            <div className="text-center py-12 text-slate-500 space-y-3">
              <p className="text-sm">You haven't saved any leaderboards yet.</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreate();
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Create your first board</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={() => {
              onClose();
              onOpenCreate();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span>Create New Board</span>
          </button>
        </div>
      </div>
    </div>
  );
}
