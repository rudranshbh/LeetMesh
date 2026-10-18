import { useState } from 'react';
import { X, Search, CheckSquare, Square, Users, UserPlus, Sparkles, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { fetchLeetCodeSocial, fetchBatchLeetCodeStats, fetchLeetCodeUserStats } from '../api';
import { SocialUserCandidate, SourceType, LeetCodeUserStats } from '../types';
import { DEFAULT_VISIBLE_COLUMNS } from '../utils/constants';

interface CreateLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newBoard: {
    name: string;
    description: string;
    sourceType: SourceType;
    sourceUsername?: string;
    autoRefetchMembers: boolean;
    members: LeetCodeUserStats[];
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    customColumns: string[];
  }) => Promise<void>;
}

export function CreateLeaderboardModal({ isOpen, onClose, onCreated }: CreateLeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<'social' | 'manual'>('social');
  
  // Step 1: Social input
  const [targetUsername, setTargetUsername] = useState('');
  const [socialType, setSocialType] = useState<'followers' | 'following' | 'both'>('both');
  const [includeSelf, setIncludeSelf] = useState(true);
  const [isFetchingSocial, setIsFetchingSocial] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);

  // Step 2: Candidates
  const [candidates, setCandidates] = useState<SocialUserCandidate[]>([]);
  const [selectedUsernames, setSelectedUsernames] = useState<Set<string>>(new Set());
  const [candidateSearch, setCandidateSearch] = useState('');
  const [additionalUsername, setAdditionalUsername] = useState('');

  // Manual Tab
  const [manualUsernamesText, setManualUsernamesText] = useState('');

  // Leaderboard metadata
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [hasFetchedSocial, setHasFetchedSocial] = useState(false);

  // Loading state during generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number; user?: string } | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFetchSocial = async (overrideUsername?: string) => {
    const username = (overrideUsername || targetUsername).trim();
    if (!username) {
      setSocialError('Please enter a LeetCode username.');
      return;
    }

    setSocialError(null);
    setIsFetchingSocial(true);
    try {
      const data = await fetchLeetCodeSocial(username, socialType, includeSelf);
      if (data.users.length === 0) {
        setSocialError(`No ${socialType} found for @${username}. You can still add members manually below.`);
      }
      setCandidates(data.users);
      // Select all by default
      const all = new Set(data.users.map(u => u.username));
      setSelectedUsernames(all);
      setHasFetchedSocial(true);
      if (!boardName) {
        const typeLabel = socialType === 'followers' ? 'Followers' : socialType === 'following' ? 'Following' : 'Circle';
        setBoardName(`@${username}'s ${typeLabel}`);
      }
    } catch (err: any) {
      setSocialError(err.message || 'Failed to fetch followers/following. Please check the username.');
    } finally {
      setIsFetchingSocial(false);
    }
  };

  const toggleSelectUser = (username: string) => {
    const next = new Set(selectedUsernames);
    if (next.has(username)) {
      next.delete(username);
    } else {
      next.add(username);
    }
    setSelectedUsernames(next);
  };

  const filteredCandidates = candidates.filter((c: SocialUserCandidate) =>
    c.username.toLowerCase().includes(candidateSearch.toLowerCase()) ||
    c.realName.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  const handleSelectAll = () => {
    const filtered = filteredCandidates.map((c: SocialUserCandidate) => c.username);
    const next = new Set(selectedUsernames);
    filtered.forEach((u: string) => next.add(u));
    setSelectedUsernames(next);
  };

  const handleDeselectAll = () => {
    const filtered = new Set(filteredCandidates.map((c: SocialUserCandidate) => c.username));
    const next = new Set(Array.from(selectedUsernames).filter((u: string) => !filtered.has(u)));
    setSelectedUsernames(next);
  };

  const handleAddExtraCandidate = () => {
    const extra = additionalUsername.trim();
    if (!extra) return;
    if (candidates.some((c: SocialUserCandidate) => c.username.toLowerCase() === extra.toLowerCase())) {
      const next = new Set(selectedUsernames);
      next.add(extra);
      setSelectedUsernames(next);
      setAdditionalUsername('');
      return;
    }

    const newCandidate: SocialUserCandidate = {
      username: extra,
      userAvatar: 'https://assets.leetcode.com/users/default_avatar.jpg',
      realName: '',
      relation: 'Custom'
    };
    setCandidates([newCandidate, ...candidates]);
    const next = new Set(selectedUsernames);
    next.add(extra);
    setSelectedUsernames(next);
    setAdditionalUsername('');
  };

  const handleSubmit = async () => {
    setGenError(null);

    let usernamesToFetch: string[] = [];
    let isFullList = false;
    let sourceType: SourceType = 'manual';

    if (activeTab === 'social') {
      usernamesToFetch = Array.from(selectedUsernames);
      sourceType = socialType;
      // If every single candidate was chosen without manual pruning, we allow autoRefetch
      isFullList = candidates.length > 0 && selectedUsernames.size === candidates.length;
    } else {
      usernamesToFetch = manualUsernamesText
        .split(/[,\s\n]+/)
        .map((u: string) => u.trim().replace(/^@/, ''))
        .filter(Boolean);
      sourceType = 'manual';
      isFullList = false;
    }

    if (usernamesToFetch.length === 0) {
      setGenError('Please select or enter at least one LeetCode username.');
      return;
    }

    const finalBoardName = boardName.trim() || `Leaderboard (${usernamesToFetch.length} coders)`;

    setIsGenerating(true);
    setGenerationProgress({ current: 0, total: usernamesToFetch.length });

    try {
      // Fetch stats using batch API
      const batchResult = await fetchBatchLeetCodeStats(usernamesToFetch);

      if (batchResult.results.length === 0) {
        throw new Error('Could not retrieve statistics for any of the provided usernames. Verify the LeetCode handles.');
      }

      await onCreated({
        name: finalBoardName,
        description: boardDescription.trim(),
        sourceType,
        sourceUsername: activeTab === 'social' ? targetUsername.trim() : undefined,
        // Requirement: For leaderboards created using manually selected users, disable automatic member-list refetch while allowing stat updates
        autoRefetchMembers: isFullList,
        members: batchResult.results,
        sortBy: 'totalSolved',
        sortOrder: 'desc',
        customColumns: DEFAULT_VISIBLE_COLUMNS
      });

      onClose();
    } catch (err: any) {
      setGenError(err.message || 'Failed to generate leaderboard stats.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create LeetCode Leaderboard</h2>
              <p className="text-xs text-slate-400">Import followers/following or build a custom roster</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 px-6 pt-2 bg-slate-950/20">
          <button
            onClick={() => setActiveTab('social')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'social'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>From Followers / Following</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Manual Usernames List</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'social' ? (
            <div className="space-y-4">
              {/* Username Input & Type Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Source LeetCode Username
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono text-sm">@</span>
                    <input
                      type="text"
                      value={targetUsername}
                      onChange={(e) => setTargetUsername(e.target.value.replace(/[@\s]/g, ''))}
                      placeholder="e.g. lee215, tourist, neal_wu"
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFetchSocial();
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleFetchSocial()}
                    disabled={isFetchingSocial || !targetUsername.trim()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-sm rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {isFetchingSocial ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <span>Fetch Roster</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-500">Popular:</span>
                  {['lee215', 'tourist', 'neal_wu', 'StefanPochmann'].map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => {
                        setTargetUsername(handle);
                        handleFetchSocial(handle);
                      }}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      @{handle}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Mode Options */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'both', label: 'Followers + Following' },
                  { id: 'followers', label: 'Followers Only' },
                  { id: 'following', label: 'Following Only' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSocialType(opt.id as any)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                      socialType === opt.id
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeSelf}
                  onChange={(e) => setIncludeSelf(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                />
                <span>Include host coder (@{targetUsername || 'user'}) in the leaderboard</span>
              </label>

              {socialError && (
                <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{socialError}</span>
                </div>
              )}

              {/* Candidates Selector */}
              {hasFetchedSocial && candidates.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-300">
                        Select Coders to Include
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                        {selectedUsernames.size} of {candidates.length} selected
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-xs text-amber-400 hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="text-xs text-slate-400 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Filter candidates search */}
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                      placeholder="Filter candidate names or handles..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Candidate list box */}
                  <div className="border border-slate-800 rounded-xl bg-slate-950/60 max-h-48 overflow-y-auto divide-y divide-slate-800/60 p-1">
                    {filteredCandidates.map((c: SocialUserCandidate) => {
                      const isSelected = selectedUsernames.has(c.username);
                      return (
                        <div
                          key={c.username}
                          onClick={() => toggleSelectUser(c.username)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <button type="button" className="text-slate-400">
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-amber-400" />
                              ) : (
                                <Square className="h-4 w-4 text-slate-600" />
                              )}
                            </button>
                            <img
                              src={c.userAvatar}
                              alt={c.username}
                              className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-700"
                            />
                            <div>
                              <p className="text-xs font-mono font-medium text-slate-200">{c.username}</p>
                              {c.realName && (
                                <p className="text-[10px] text-slate-500">{c.realName}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {c.relation}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Append custom user to candidates */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={additionalUsername}
                      onChange={(e) => setAdditionalUsername(e.target.value.replace(/[@\s]/g, ''))}
                      placeholder="Add an extra LeetCode handle..."
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddExtraCandidate();
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddExtraCandidate}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Enter LeetCode Usernames
                </label>
                <textarea
                  rows={4}
                  value={manualUsernamesText}
                  onChange={(e) => setManualUsernamesText(e.target.value)}
                  placeholder="Paste usernames separated by commas, spaces, or new lines...&#10;e.g. lee215, tourist, neal_wu, StefanPochmann, awice"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
                <p>
                  💡 <strong>Tip:</strong> You can enter your study group, university peers, or competitive programming friends. Member stats will be fetched automatically.
                </p>
              </div>
            </div>
          )}

          {/* Board Name & Description */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Leaderboard Name
              </label>
              <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="e.g. Algorithms Champions, Team Alpha"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={boardDescription}
                onChange={(e) => setBoardDescription(e.target.value)}
                placeholder="e.g. Weekly problem-solving contest ladder"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          {genError && (
            <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{genError}</span>
            </div>
          )}

          {isGenerating && generationProgress && (
            <div className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Fetching live stats from LeetCode...</span>
                <span className="font-mono text-amber-400">
                  {generationProgress.total} coders
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-1.5 rounded-full animate-pulse w-full" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isGenerating || (activeTab === 'social' && selectedUsernames.size === 0)}
            className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-sm rounded-lg shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Building Leaderboard...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Board</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
