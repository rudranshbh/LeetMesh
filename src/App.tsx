import { useState, useEffect, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { 
  fetchUserLeaderboards, 
  fetchLeaderboardById,
  createLeaderboardInDb, 
  updateLeaderboardInDb, 
  deleteLeaderboardFromDb,
  testConnection 
} from './db';
import { LeaderboardDoc, LeetCodeUserStats, SourceType } from './types';
import { DEFAULT_VISIBLE_COLUMNS } from './utils/constants';
import { fetchBatchLeetCodeStats, fetchLeetCodeUserStats, fetchLeetCodeSocial } from './api';
import { Navbar } from './components/Navbar';
import { SignInGate } from './components/SignInGate';
import { EmptyState } from './components/EmptyState';
import { LeaderboardHeader } from './components/LeaderboardHeader';
import { LeaderboardTable } from './components/LeaderboardTable';
import { CreateLeaderboardModal } from './components/CreateLeaderboardModal';
import { UserDetailModal } from './components/UserDetailModal';
import { SavedLeaderboardsDrawer } from './components/SavedLeaderboardsDrawer';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Leaderboards state
  const [savedBoards, setSavedBoards] = useState<LeaderboardDoc[]>([]);
  const [activeBoard, setActiveBoard] = useState<LeaderboardDoc | null>(null);

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState<LeetCodeUserStats | null>(null);

  // Operations state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Show notification toast with auto-dismiss
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Boot connection check & Auth state listener
  useEffect(() => {
    testConnection();

    const searchParams = new URLSearchParams(window.location.search);
    const sharedId = searchParams.get('board') || searchParams.get('share');

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // If a board was linked via URL, load it for the user
        if (sharedId) {
          try {
            const sharedDoc = await fetchLeaderboardById(sharedId);
            if (sharedDoc) {
              setActiveBoard(sharedDoc);
              showToast(`Opened leaderboard: "${sharedDoc.name}"`, 'info');
            } else {
              showToast('The requested leaderboard was not found or may have been deleted.', 'error');
            }
          } catch (err) {
            console.error('Error fetching shared board:', err);
          }
        }

        // Load the user's saved boards
        try {
          const boards = await fetchUserLeaderboards(currentUser.uid);
          setSavedBoards(boards);
          if (boards.length > 0 && !sharedId) {
            setActiveBoard((curr) => curr || boards[0]);
          }
        } catch (err) {
          console.error('Failed to load user leaderboards:', err);
        }
      } else {
        setSavedBoards([]);
        setActiveBoard(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const lastAutoRefreshRef = useRef<number>(Date.now());

  // Auto-refresh stats whenever the browser tab is opened, focused, or revisited
  useEffect(() => {
    if (!user || !activeBoard || activeBoard.members.length === 0) return;

    const executeAutoRefresh = async () => {
      const now = Date.now();
      // Enforce 20-second cooldown to avoid rate-limit spam on rapid tab switches
      if (now - lastAutoRefreshRef.current < 20000) return;
      lastAutoRefreshRef.current = now;

      try {
        const handles = activeBoard.members.map((m) => m.username);
        const batch = await fetchBatchLeetCodeStats(handles, true);

        const updatedBoard: LeaderboardDoc = {
          ...activeBoard,
          members: batch.results,
          updatedAt: new Date().toISOString()
        };

        setActiveBoard(updatedBoard);

        if (user && activeBoard.ownerId === user.uid && !updatedBoard.id.startsWith('demo_')) {
          await updateLeaderboardInDb(updatedBoard.id, {
            members: updatedBoard.members,
            updatedAt: updatedBoard.updatedAt
          });
          setSavedBoards((prev) =>
            prev.map((b) => (b.id === updatedBoard.id ? updatedBoard : b))
          );
        }

        showToast(`Tab active: Auto-synced live stats for ${batch.results.length} coders!`, 'info');
      } catch (err) {
        console.error('Auto-refresh error on tab focus:', err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        executeAutoRefresh();
      }
    };

    const handleFocus = () => {
      executeAutoRefresh();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, activeBoard?.id, activeBoard?.members.length]);

  // Sync URL query when activeBoard changes
  const switchActiveBoard = (board: LeaderboardDoc | null) => {
    setActiveBoard(board);
    if (board && !board.id.startsWith('demo_')) {
      const url = new URL(window.location.href);
      url.searchParams.set('board', board.id);
      window.history.replaceState(null, '', url.toString());
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('board');
      url.searchParams.delete('share');
      window.history.replaceState(null, '', url.toString());
    }
  };

  // Check if current user is owner vs view-only
  const isOwner = Boolean(user && activeBoard && activeBoard.ownerId === user.uid);
  const isViewOnly = Boolean(activeBoard && activeBoard.ownerId !== 'guest' && !isOwner);

  // Share board handler
  const handleShareBoard = async () => {
    if (!activeBoard || !user) return;

    let boardId = activeBoard.id;

    // Ensure it exists in Firestore
    if (boardId.startsWith('demo_') || boardId.startsWith('board_')) {
      try {
        showToast('Saving to cloud for share link...', 'info');
        const newDocId = await createLeaderboardInDb(activeBoard);
        boardId = newDocId;
        const updatedBoard = { ...activeBoard, id: newDocId };
        setActiveBoard(updatedBoard);
        setSavedBoards((prev) => [updatedBoard, ...prev.filter((b) => b.id !== activeBoard.id)]);
      } catch (err: any) {
        showToast('Failed to save to cloud before sharing', 'error');
        return;
      }
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}?board=${boardId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      const url = new URL(window.location.href);
      url.searchParams.set('board', boardId);
      window.history.replaceState(null, '', url.toString());
      showToast('🔗 Share link copied to clipboard! Anyone with this link can view this leaderboard.', 'success');
    } catch {
      window.prompt('Copy this shareable view-only link:', shareUrl);
    }
  };

  // Clone view-only shared board to current user's account
  const handleCloneBoard = async () => {
    if (!activeBoard || !user) return;

    try {
      showToast('Saving a copy to your account...', 'info');
      const clonedBoardData = {
        name: `${activeBoard.name} (Copy)`,
        description: activeBoard.description || '',
        sourceType: activeBoard.sourceType,
        sourceUsername: activeBoard.sourceUsername,
        autoRefetchMembers: false,
        members: activeBoard.members,
        sortBy: activeBoard.sortBy || 'totalSolved',
        sortOrder: activeBoard.sortOrder || 'desc',
        customColumns: activeBoard.customColumns || DEFAULT_VISIBLE_COLUMNS,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newId = await createLeaderboardInDb(clonedBoardData);
      const newBoard: LeaderboardDoc = { ...clonedBoardData, id: newId };
      setSavedBoards((prev) => [newBoard, ...prev]);
      switchActiveBoard(newBoard);
      showToast('Saved a copy to your account! You now have full ownership of this board.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to clone leaderboard', 'error');
    }
  };

  // Quick preset loader from EmptyState (for authenticated users)
  const handleQuickPreset = async (targetUsername: string) => {
    if (!user) return;

    setIsRefreshing(true);
    showToast(`Fetching social graph & stats for @${targetUsername}...`, 'info');
    try {
      const social = await fetchLeetCodeSocial(targetUsername, 'both', true);
      const usernames = social.users.map((u) => u.username).slice(0, 15);
      const batch = await fetchBatchLeetCodeStats(usernames);

      const newBoard: LeaderboardDoc = {
        id: `demo_${Date.now()}`,
        name: `@${targetUsername}'s Circle`,
        description: `Leaderboard tracking @${targetUsername} and their network.`,
        ownerId: user.uid,
        sourceType: 'both',
        sourceUsername: targetUsername,
        autoRefetchMembers: true,
        members: batch.results,
        sortBy: 'totalSolved',
        sortOrder: 'desc',
        customColumns: DEFAULT_VISIBLE_COLUMNS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docId = await createLeaderboardInDb(newBoard);
      newBoard.id = docId;
      setSavedBoards((prev) => [newBoard, ...prev]);

      switchActiveBoard(newBoard);
      showToast(`Leaderboard created with ${batch.results.length} coders!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to load preset', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Create new leaderboard from modal
  const handleCreateBoard = async (newBoardData: {
    name: string;
    description: string;
    sourceType: SourceType;
    sourceUsername?: string;
    autoRefetchMembers: boolean;
    members: LeetCodeUserStats[];
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    customColumns: string[];
  }) => {
    if (!user) return;

    const boardDoc: LeaderboardDoc = {
      ...newBoardData,
      id: `board_${Date.now()}`,
      ownerId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const docId = await createLeaderboardInDb(boardDoc);
      boardDoc.id = docId;
      setSavedBoards((prev) => [boardDoc, ...prev]);
      showToast(`Saved "${boardDoc.name}" to your account!`, 'success');
    } catch (err: any) {
      console.error('Failed to save to Firestore:', err);
      showToast('Created locally, but failed to save to cloud storage.', 'error');
    }

    switchActiveBoard(boardDoc);
  };

  // Refresh all stats
  const handleRefreshAll = async (refetchRosterIfEligible: boolean) => {
    if (!activeBoard || !user) return;

    setIsRefreshing(true);
    try {
      let currentMembers = [...activeBoard.members];

      if (refetchRosterIfEligible && activeBoard.sourceUsername && activeBoard.autoRefetchMembers) {
        showToast(`Re-syncing follower/following list for @${activeBoard.sourceUsername}...`, 'info');
        const social = await fetchLeetCodeSocial(
          activeBoard.sourceUsername,
          activeBoard.sourceType === 'manual' ? 'both' : activeBoard.sourceType,
          true
        );
        const newHandles = social.users.map((u) => u.username);
        const batch = await fetchBatchLeetCodeStats(newHandles, true);
        currentMembers = batch.results;
      } else {
        showToast(`Refreshing live statistics for ${currentMembers.length} coders...`, 'info');
        const handles = currentMembers.map((m) => m.username);
        const batch = await fetchBatchLeetCodeStats(handles, true);
        currentMembers = batch.results;
      }

      const updatedBoard: LeaderboardDoc = {
        ...activeBoard,
        members: currentMembers,
        updatedAt: new Date().toISOString()
      };

      setActiveBoard(updatedBoard);

      if (isOwner && !updatedBoard.id.startsWith('demo_')) {
        await updateLeaderboardInDb(updatedBoard.id, {
          members: updatedBoard.members,
          updatedAt: updatedBoard.updatedAt
        });
        setSavedBoards((prev) =>
          prev.map((b) => (b.id === updatedBoard.id ? updatedBoard : b))
        );
      }

      showToast(`Updated statistics for ${currentMembers.length} coders!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to refresh leaderboard', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Refresh single user stats
  const handleRefreshSingleUser = async (username: string) => {
    if (!activeBoard || !user) return;
    try {
      showToast(`Refreshing @${username}...`, 'info');
      const freshStats = await fetchLeetCodeUserStats(username, true);
      const updatedMembers = activeBoard.members.map((m) =>
        m.username.toLowerCase() === username.toLowerCase() ? freshStats : m
      );

      const updatedBoard: LeaderboardDoc = {
        ...activeBoard,
        members: updatedMembers,
        updatedAt: new Date().toISOString()
      };

      setActiveBoard(updatedBoard);

      if (selectedUserForModal?.username.toLowerCase() === username.toLowerCase()) {
        setSelectedUserForModal(freshStats);
      }

      if (isOwner && !updatedBoard.id.startsWith('demo_')) {
        await updateLeaderboardInDb(updatedBoard.id, {
          members: updatedBoard.members,
          updatedAt: updatedBoard.updatedAt
        });
        setSavedBoards((prev) =>
          prev.map((b) => (b.id === updatedBoard.id ? updatedBoard : b))
        );
      }

      showToast(`Updated stats for @${username}!`, 'success');
    } catch (err: any) {
      showToast(err.message || `Failed to refresh @${username}`, 'error');
    }
  };

  // Quick add coder to current board
  const handleAddMember = async (username: string) => {
    if (!activeBoard || isViewOnly || !user) return;
    const freshStats = await fetchLeetCodeUserStats(username, false);

    const filtered = activeBoard.members.filter(
      (m) => m.username.toLowerCase() !== username.toLowerCase()
    );
    const updatedMembers = [freshStats, ...filtered];

    const updatedBoard: LeaderboardDoc = {
      ...activeBoard,
      autoRefetchMembers: false,
      members: updatedMembers,
      updatedAt: new Date().toISOString()
    };

    setActiveBoard(updatedBoard);

    if (isOwner && !updatedBoard.id.startsWith('demo_')) {
      await updateLeaderboardInDb(updatedBoard.id, {
        members: updatedBoard.members,
        autoRefetchMembers: false,
        updatedAt: updatedBoard.updatedAt
      });
      setSavedBoards((prev) =>
        prev.map((b) => (b.id === updatedBoard.id ? updatedBoard : b))
      );
    }

    showToast(`Added @${freshStats.username} (${freshStats.totalSolved} solved) to the board!`, 'success');
  };

  // Remove member from board
  const handleRemoveMember = async (username: string) => {
    if (!activeBoard || isViewOnly || !user) return;
    const updatedMembers = activeBoard.members.filter(
      (m) => m.username.toLowerCase() !== username.toLowerCase()
    );

    const updatedBoard: LeaderboardDoc = {
      ...activeBoard,
      autoRefetchMembers: false,
      members: updatedMembers,
      updatedAt: new Date().toISOString()
    };

    setActiveBoard(updatedBoard);

    if (isOwner && !updatedBoard.id.startsWith('demo_')) {
      await updateLeaderboardInDb(updatedBoard.id, {
        members: updatedBoard.members,
        autoRefetchMembers: false,
        updatedAt: updatedBoard.updatedAt
      });
      setSavedBoards((prev) =>
        prev.map((b) => (b.id === updatedBoard.id ? updatedBoard : b))
      );
    }

    showToast(`Removed @${username} from board`, 'info');
  };

  // Delete board
  const handleDeleteBoard = async (id: string, name?: string) => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to delete "${name || activeBoard?.name}"?`)) {
      return;
    }

    try {
      if (!id.startsWith('demo_')) {
        await deleteLeaderboardFromDb(id);
      }
      setSavedBoards((prev) => prev.filter((b) => b.id !== id));
      if (activeBoard?.id === id) {
        const remaining = savedBoards.filter((b) => b.id !== id);
        switchActiveBoard(remaining.length > 0 ? remaining[0] : null);
      }
      showToast('Leaderboard deleted', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete leaderboard', 'error');
    }
  };

  // Sort change handler
  const handleSortChange = (columnId: string, order: 'asc' | 'desc') => {
    if (!activeBoard || !user) return;
    const updated: LeaderboardDoc = {
      ...activeBoard,
      sortBy: columnId,
      sortOrder: order
    };
    setActiveBoard(updated);
    if (isOwner && !updated.id.startsWith('demo_')) {
      updateLeaderboardInDb(updated.id, { sortBy: columnId, sortOrder: order });
    }
  };

  // Toggle visible columns
  const handleToggleColumn = (columnId: string) => {
    if (!activeBoard || !user) return;
    const currentCols = activeBoard.customColumns || DEFAULT_VISIBLE_COLUMNS;
    let nextCols: string[];
    if (currentCols.includes(columnId)) {
      if (currentCols.length <= 2) {
        showToast('At least two columns must remain visible', 'info');
        return;
      }
      nextCols = currentCols.filter((c) => c !== columnId);
    } else {
      nextCols = [...currentCols, columnId];
    }

    const updated: LeaderboardDoc = {
      ...activeBoard,
      customColumns: nextCols
    };
    setActiveBoard(updated);
    if (isOwner && !updated.id.startsWith('demo_')) {
      updateLeaderboardInDb(updated.id, { customColumns: nextCols });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
        <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Loading LeetMesh...</p>
      </div>
    );
  }

  const searchParams = new URLSearchParams(window.location.search);
  const hasSharedParam = Boolean(searchParams.get('board') || searchParams.get('share'));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom duration-200">
          <div className={`px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-medium flex items-center gap-2.5 ${
            notification.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-800'
              : notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
              : 'bg-slate-900/90 text-slate-200 border-slate-700'
          }`}>
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        user={user}
        onOpenCreate={() => user && setIsCreateModalOpen(true)}
        onOpenDrawer={() => user && setIsDrawerOpen(true)}
        savedCount={savedBoards.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {!user ? (
          // Strictly require Google sign-in before anything can happen
          <SignInGate hasSharedLink={hasSharedParam} />
        ) : activeBoard ? (
          <>
            <LeaderboardHeader
              board={activeBoard}
              onRefreshAll={handleRefreshAll}
              isRefreshing={isRefreshing}
              onAddMember={handleAddMember}
              onDeleteBoard={() => handleDeleteBoard(activeBoard.id, activeBoard.name)}
              isOwner={!isViewOnly}
              isViewOnly={isViewOnly}
              onShare={handleShareBoard}
              onCloneBoard={isViewOnly ? handleCloneBoard : undefined}
            />

            <LeaderboardTable
              members={activeBoard.members}
              sortBy={activeBoard.sortBy || 'totalSolved'}
              sortOrder={activeBoard.sortOrder || 'desc'}
              onSortChange={handleSortChange}
              visibleColumns={activeBoard.customColumns && activeBoard.customColumns.length >= 10 ? activeBoard.customColumns : DEFAULT_VISIBLE_COLUMNS}
              onToggleColumn={handleToggleColumn}
              onSelectUser={(u) => setSelectedUserForModal(u)}
              onRefreshUser={handleRefreshSingleUser}
              onRemoveUser={handleRemoveMember}
              isViewOnly={isViewOnly}
            />
          </>
        ) : (
          <EmptyState
            onOpenCreate={() => setIsCreateModalOpen(true)}
            onQuickPreset={handleQuickPreset}
          />
        )}
      </main>

      {/* Modals & Drawers - only rendered for authenticated users */}
      {user && (
        <>
          <CreateLeaderboardModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreated={handleCreateBoard}
          />

          <UserDetailModal
            user={selectedUserForModal}
            onClose={() => setSelectedUserForModal(null)}
            onRefreshUser={handleRefreshSingleUser}
          />

          <SavedLeaderboardsDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            leaderboards={savedBoards}
            activeBoardId={activeBoard?.id || null}
            onSelectBoard={(board) => switchActiveBoard(board)}
            onDeleteBoard={handleDeleteBoard}
            onOpenCreate={() => setIsCreateModalOpen(true)}
          />
        </>
      )}
    </div>
  );
}
