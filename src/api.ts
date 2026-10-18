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

async function handleResponse(res: Response, defaultErrorMsg: string) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (text.includes('The page c') || text.includes('<!DOCTYPE html>') || text.includes('<html>')) {
      throw new Error('Backend API proxy route not found (404). If deployed on Vercel, please ensure api routes are correctly proxied to server.ts.');
    }
    throw new Error(`Server error (${res.status} ${res.statusText})`);
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || defaultErrorMsg);
  }
  return data;
}

export async function fetchLeetCodeUserStats(username: string, forceFresh = false): Promise<LeetCodeUserStats> {
  const url = `/api/leetcode/user/${encodeURIComponent(username)}?fresh=${forceFresh}`;
  const res = await fetch(url);
  return handleResponse(res, `Failed to fetch stats for ${username}`);
}

export async function fetchLeetCodeSocial(
  username: string,
  type: 'followers' | 'following' | 'both' = 'both',
  includeSelf = true
): Promise<SocialGraphResponse> {
  const url = `/api/leetcode/social/${encodeURIComponent(username)}?type=${type}&includeSelf=${includeSelf}`;
  const res = await fetch(url);
  return handleResponse(res, `Failed to fetch social graph for ${username}`);
}

export async function fetchBatchLeetCodeStats(usernames: string[], forceFresh = false): Promise<BatchStatsResponse> {
  const res = await fetch('/api/leetcode/batch-stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames, forceFresh })
  });
  return handleResponse(res, 'Failed to fetch batch stats');
}
