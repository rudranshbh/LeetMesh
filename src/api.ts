import { LeetCodeUserStats, SocialUserCandidate } from './types';

export interface SocialGraphResponse {
  sourceUsername: string;
  type: string;
  totalFound: number;
  followersCount: number;
  followingCount: number;
  users: SocialUserCandidate[];
}

export interface BatchStatsResponse {
  totalRequested: number;
  totalSuccess: number;
  results: LeetCodeUserStats[];
  failed: string[];
}

export async function fetchLeetCodeUserStats(username: string, forceFresh = false): Promise<LeetCodeUserStats> {
  const url = `/api/leetcode/user/${encodeURIComponent(username)}?fresh=${forceFresh}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch stats for ${username}`);
  }
  return data;
}

export async function fetchLeetCodeSocial(
  username: string,
  type: 'followers' | 'following' | 'both' = 'both',
  includeSelf = true
): Promise<SocialGraphResponse> {
  const url = `/api/leetcode/social/${encodeURIComponent(username)}?type=${type}&includeSelf=${includeSelf}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch social graph for ${username}`);
  }
  return data;
}

export async function fetchBatchLeetCodeStats(usernames: string[], forceFresh = false): Promise<BatchStatsResponse> {
  const res = await fetch('/api/leetcode/batch-stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames, forceFresh })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch batch stats');
  }
  return data;
}
