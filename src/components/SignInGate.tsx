import { useState } from 'react';
import { Trophy, LogIn, Sparkles, Loader2, Users, BarChart2, Share2, ShieldCheck, ArrowRight, Zap, Terminal } from 'lucide-react';
import { auth, provider, signInWithPopup, signInWithRedirect } from '../firebase';
import { AnimatedMeshArtwork } from './AnimatedMeshArtwork';

interface SignInGateProps {
  hasSharedLink?: boolean;
}

export function SignInGate({ hasSharedLink }: SignInGateProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectErr: any) {
        setError(redirectErr.message || err.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-6rem)] flex items-center justify-center overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Ambient background glow highlights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl 2xl:max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Hero Copy & Google Auth */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          {/* Beacon pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>LEETCODE SOCIAL GRAPH & LEADERBOARD ENGINE</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Compete with your <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
                coding circle
              </span>{' '}
              in real-time.
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Import public followers, following lists, or hand-picked coders. Compare solved distributions,
              contest ratings, submission activity, and share view-only leaderboards with anyone.
            </p>
          </div>

          {/* Shared link callout if user came from a shared URL */}
          {hasSharedLink && (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5 max-w-md mx-auto lg:mx-0">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                <strong>Shared Leaderboard Invite:</strong> Sign in with Google to view live member statistics and rank standings.
              </span>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-2 max-w-md mx-auto lg:mx-0 space-y-3">
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3.5 py-3.5 px-6 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-white/10 transition-all cursor-pointer active:scale-98 disabled:opacity-50 ring-2 ring-white/20"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-slate-800" />
                  <span>Connecting with Google...</span>
                </>
              ) : (
                <>
                  {/* Google G Icon */}
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google to Start</span>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </>
              )}
            </button>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                {error}
              </p>
            )}

            <p className="text-xs text-slate-500 flex items-center justify-center lg:justify-start gap-1.5 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Protected by Google Firebase Auth. No API keys needed.</span>
            </p>
          </div>
        </div>

        {/* Right Column: High-End Animated Network Artwork */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <AnimatedMeshArtwork />
        </div>
      </div>
    </div>
  );
}
