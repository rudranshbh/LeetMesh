import { User } from 'firebase/auth';
import { Trophy, Plus, LogIn, LogOut, List, Sparkles } from 'lucide-react';
import { auth, provider, signInWithPopup, signOut } from '../firebase';

interface NavbarProps {
  user: User | null;
  onOpenCreate: () => void;
  onOpenDrawer: () => void;
  savedCount: number;
}

export function Navbar({ user, onOpenCreate, onOpenDrawer, savedCount }: NavbarProps) {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Sign-in failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out failed:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/30">
            <Trophy className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                Leet<span className="text-amber-400">Mesh</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Customizable LeetCode Social Leaderboards
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onOpenDrawer}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
              title="View your saved leaderboards"
            >
              <List className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">My Boards</span>
              <span className="bg-amber-500/20 text-amber-300 text-xs px-1.5 py-0.2 rounded-full font-mono">
                {savedCount}
              </span>
            </button>
          )}

          {user && (
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Create Board</span>
            </button>
          )}

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <img
                src={user.photoURL || 'https://assets.leetcode.com/users/default_avatar.jpg'}
                alt={user.displayName || 'User'}
                className="h-8 w-8 rounded-full ring-2 ring-slate-700 object-cover"
              />
              <div className="hidden md:block text-left text-xs">
                <p className="font-medium text-slate-200 truncate max-w-[120px]">
                  {user.displayName || 'Coder'}
                </p>
                <p className="text-slate-500 truncate max-w-[120px]">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <LogIn className="h-4 w-4 text-slate-400" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
