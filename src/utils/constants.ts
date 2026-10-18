import { ColumnDefinition, LeetCodeUserStats } from '../types';

export const AVAILABLE_COLUMNS: ColumnDefinition[] = [
  { id: 'rank', label: '#', category: 'general', align: 'center', defaultVisible: true },
  { id: 'user', label: 'Coder', category: 'general', align: 'left', defaultVisible: true },
  { id: 'totalSolved', label: 'Solved', category: 'solved', align: 'right', defaultVisible: true },
  { id: 'easySolved', label: 'Easy', category: 'solved', align: 'right', defaultVisible: true },
  { id: 'mediumSolved', label: 'Med', category: 'solved', align: 'right', defaultVisible: true },
  { id: 'hardSolved', label: 'Hard', category: 'solved', align: 'right', defaultVisible: true },
  { id: 'contestRating', label: 'Rating', category: 'contest', align: 'right', defaultVisible: true },
  { id: 'contestBadge', label: 'Badge', category: 'contest', align: 'center', defaultVisible: true },
  { id: 'contestGlobalRanking', label: 'Rank', category: 'contest', align: 'right', defaultVisible: true },
  { id: 'attendedContests', label: 'Contests', category: 'contest', align: 'right', defaultVisible: true },
  { id: 'acceptanceRate', label: 'Acc %', category: 'solved', align: 'right', defaultVisible: true },
  { id: 'lastSubmission', label: 'Last Active', category: 'activity', align: 'left', defaultVisible: true },
  { id: 'actions', label: 'Actions', category: 'general', align: 'center', defaultVisible: true },
];

// All columns are now visible by default per user request
export const DEFAULT_VISIBLE_COLUMNS = AVAILABLE_COLUMNS.map(c => c.id);

export function formatRelativeTime(timestampSec?: number): string {
  if (!timestampSec) return 'Inactive';
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestampSec;

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / (86400 * 7))}w ago`;
  if (diff < 86400 * 365) return `${Math.floor(diff / (86400 * 30))}mo ago`;
  return `${Math.floor(diff / (86400 * 365))}y ago`;
}

export function exportLeaderboardToCSV(title: string, members: LeetCodeUserStats[]) {
  const headers = [
    'Rank',
    'Username',
    'Real Name',
    'Total Solved',
    'Easy Solved',
    'Medium Solved',
    'Hard Solved',
    'Contest Rating',
    'Contest Badge',
    'Contest Global Rank',
    'Contests Attended',
    'Acceptance Rate',
    'Last Submission Title',
    'Last Submission Date'
  ];

  const rows = members.map((m, index) => [
    index + 1,
    `"${m.username}"`,
    `"${m.realName.replace(/"/g, '""')}"`,
    m.totalSolved,
    m.easySolved,
    m.mediumSolved,
    m.hardSolved,
    m.contestRating ?? '',
    `"${m.contestBadge ?? ''}"`,
    m.contestGlobalRanking ?? '',
    m.attendedContests ?? 0,
    `"${m.acceptanceRate}%"`,
    `"${(m.lastSubmission?.title || '').replace(/"/g, '""')}"`,
    m.lastSubmission?.timestamp ? new Date(m.lastSubmission.timestamp * 1000).toISOString() : ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_leaderboard.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
