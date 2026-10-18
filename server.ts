import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

// In-memory cache with 3-minute TTL to respect LeetCode rate limits
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const userStatsCache = new Map<string, CacheEntry<any>>();
const socialCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

const LEETCODE_GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql';

const HEADERS = {
  'Content-Type': 'application/json',
  'Referer': 'https://leetcode.com',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Origin': 'https://leetcode.com'
};

async function executeLeetCodeGraphQL(query: string, variables: Record<string, any>) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
  try {
    const res = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ query, variables }),
      signal: controller.signal
    });

    if (!res.ok) {
      throw new Error(`LeetCode server responded with status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Transform raw GraphQL data into clean user stats object
function formatUserStats(data: any, username: string) {
  const user = data?.matchedUser;
  if (!user) return null;

  const acList = user.submitStatsGlobal?.acSubmissionNum || [];
  const allStat = acList.find((s: any) => s.difficulty === 'All') || { count: 0, submissions: 0 };
  const easyStat = acList.find((s: any) => s.difficulty === 'Easy') || { count: 0, submissions: 0 };
  const medStat = acList.find((s: any) => s.difficulty === 'Medium') || { count: 0, submissions: 0 };
  const hardStat = acList.find((s: any) => s.difficulty === 'Hard') || { count: 0, submissions: 0 };

  const contest = data.userContestRanking;
  const recentSub = data.recentSubmissionList?.[0] || null;

  // Active days count from submission calendar if available
  let activeDaysPastYear = 0;
  if (user.submissionCalendar) {
    try {
      const cal = JSON.parse(user.submissionCalendar);
      activeDaysPastYear = Object.keys(cal).length;
    } catch {
      // ignore
    }
  }

  const acceptanceRate = allStat.submissions > 0 
    ? Number(((allStat.count / allStat.submissions) * 100).toFixed(1))
    : 0;

  return {
    username: user.username || username,
    realName: user.profile?.realName || '',
    avatar: user.profile?.userAvatar || 'https://assets.leetcode.com/users/default_avatar.jpg',
    countryName: user.profile?.countryName || null,
    ranking: user.profile?.ranking || null,
    reputation: user.profile?.reputation || 0,
    totalSolved: allStat.count || 0,
    totalSubmissions: allStat.submissions || 0,
    easySolved: easyStat.count || 0,
    easySubmissions: easyStat.submissions || 0,
    mediumSolved: medStat.count || 0,
    mediumSubmissions: medStat.submissions || 0,
    hardSolved: hardStat.count || 0,
    hardSubmissions: hardStat.submissions || 0,
    acceptanceRate,
    contestRating: contest?.rating ? Math.round(contest.rating) : null,
    contestGlobalRanking: contest?.globalRanking || null,
    attendedContests: contest?.attendedContestsCount || 0,
    contestTopPercentage: contest?.topPercentage ? Number(contest.topPercentage.toFixed(1)) : null,
    contestBadge: contest?.badge?.name || null,
    lastSubmission: recentSub ? {
      title: recentSub.title,
      timestamp: Number(recentSub.timestamp),
      status: recentSub.statusDisplay,
      lang: recentSub.lang || 'Code'
    } : null,
    activeDaysPastYear,
    lastUpdated: new Date().toISOString()
  };
}

const USER_DATA_QUERY = `
  query getUserStats($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        userAvatar
        realName
        countryName
        reputation
        starRating
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      submissionCalendar
    }
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
      badge {
        name
      }
    }
    recentSubmissionList(username: $username) {
      title
      timestamp
      statusDisplay
      lang
    }
  }
`;

async function fetchSingleUserStats(username: string, forceFresh = false) {
  const normalized = username.trim().toLowerCase();
  const cached = userStatsCache.get(normalized);
  const now = Date.now();

  if (!forceFresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const raw = await executeLeetCodeGraphQL(USER_DATA_QUERY, { username: normalized });
  const formatted = formatUserStats(raw?.data, normalized);
  if (!formatted) {
    return null;
  }

  userStatsCache.set(normalized, { data: formatted, timestamp: now });
  return formatted;
}

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'LeetMesh backend', time: new Date().toISOString() });
});

// 2. Fetch single user stats
app.get('/api/leetcode/user/:username', async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const forceFresh = req.query.fresh === 'true';
    const stats = await fetchSingleUserStats(username, forceFresh);

    if (!stats) {
      return res.status(404).json({ error: `LeetCode user "${username}" was not found or has no public profile.` });
    }

    return res.json(stats);
  } catch (error: any) {
    console.error('Error fetching LeetCode user:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch LeetCode user data.' });
  }
});

// 3. Fetch followers / following
const SOCIAL_QUERY = `
  query getSocialGraph($userSlug: String!) {
    matchedUser(username: $userSlug) {
      username
      profile {
        userAvatar
        realName
      }
    }
    followers(userSlug: $userSlug) {
      users {
        userSlug
        userAvatar
        realName
      }
    }
    following(userSlug: $userSlug) {
      users {
        userSlug
        userAvatar
        realName
      }
    }
  }
`;

app.get('/api/leetcode/social/:username', async (req: Request, res: Response) => {
  try {
    const username = req.params.username?.trim();
    const type = (req.query.type as string) || 'both'; // 'followers' | 'following' | 'both'
    const includeSelf = req.query.includeSelf !== 'false';

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const cacheKey = `${username.toLowerCase()}_${type}_${includeSelf}`;
    const cached = socialCache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return res.json(cached.data);
    }

    const raw = await executeLeetCodeGraphQL(SOCIAL_QUERY, { userSlug: username });
    if (!raw?.data?.matchedUser) {
      return res.status(404).json({ error: `LeetCode user "${username}" does not exist.` });
    }

    const targetUser = raw.data.matchedUser;
    const rawFollowers = raw.data.followers?.users || [];
    const rawFollowing = raw.data.following?.users || [];

    const map = new Map<string, { username: string; userAvatar: string; realName: string; relation: string }>();

    // Optionally include the queried user themselves
    if (includeSelf) {
      map.set(targetUser.username.toLowerCase(), {
        username: targetUser.username,
        userAvatar: targetUser.profile?.userAvatar || 'https://assets.leetcode.com/users/default_avatar.jpg',
        realName: targetUser.profile?.realName || '',
        relation: 'Host User'
      });
    }

    if (type === 'followers' || type === 'both') {
      for (const u of rawFollowers) {
        if (!u?.userSlug) continue;
        const key = u.userSlug.toLowerCase();
        if (map.has(key)) {
          const existing = map.get(key)!;
          if (existing.relation !== 'Host User') {
            existing.relation = 'Mutual';
          }
        } else {
          map.set(key, {
            username: u.userSlug,
            userAvatar: u.userAvatar || 'https://assets.leetcode.com/users/default_avatar.jpg',
            realName: u.realName || '',
            relation: 'Follower'
          });
        }
      }
    }

    if (type === 'following' || type === 'both') {
      for (const u of rawFollowing) {
        if (!u?.userSlug) continue;
        const key = u.userSlug.toLowerCase();
        if (map.has(key)) {
          const existing = map.get(key)!;
          if (existing.relation === 'Follower') {
            existing.relation = 'Mutual';
          }
        } else {
          map.set(key, {
            username: u.userSlug,
            userAvatar: u.userAvatar || 'https://assets.leetcode.com/users/default_avatar.jpg',
            realName: u.realName || '',
            relation: 'Following'
          });
        }
      }
    }

    const users = Array.from(map.values());
    const result = {
      sourceUsername: targetUser.username,
      type,
      totalFound: users.length,
      followersCount: rawFollowers.length,
      followingCount: rawFollowing.length,
      users
    };

    socialCache.set(cacheKey, { data: result, timestamp: now });
    return res.json(result);
  } catch (error: any) {
    console.error('Error fetching social graph:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch social graph.' });
  }
});

// 4. Batch stats fetch with concurrency control and error tolerance
app.post('/api/leetcode/batch-stats', async (req: Request, res: Response) => {
  try {
    const { usernames, forceFresh = false } = req.body;
    if (!Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ error: 'Usernames array is required.' });
    }

    const uniqueUsernames = Array.from(new Set(usernames.map(u => String(u).trim()))).filter(Boolean).slice(0, 50);

    const results: any[] = [];
    const failed: string[] = [];

    // Process with concurrency limit of 3 to avoid overwhelming LeetCode and hitting 429
    const CONCURRENCY = 3;
    for (let i = 0; i < uniqueUsernames.length; i += CONCURRENCY) {
      const chunk = uniqueUsernames.slice(i, i + CONCURRENCY);
      const promises = chunk.map(async (uname) => {
        try {
          const stats = await fetchSingleUserStats(uname, forceFresh);
          if (stats) {
            results.push(stats);
          } else {
            failed.push(uname);
          }
        } catch (err) {
          console.error(`Failed to fetch stats for ${uname}:`, err);
          failed.push(uname);
        }
      });
      await Promise.all(promises);
      // Small pause between chunks
      if (i + CONCURRENCY < uniqueUsernames.length) {
        await new Promise(r => setTimeout(r, 120));
      }
    }

    return res.json({
      totalRequested: uniqueUsernames.length,
      totalSuccess: results.length,
      results,
      failed
    });
  } catch (error: any) {
    console.error('Error in batch stats:', error);
    return res.status(500).json({ error: error.message || 'Batch fetch failed' });
  }
});

// Setup Vite middleware in dev or static server in prod
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[LeetMesh Server] running on http://localhost:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer();
