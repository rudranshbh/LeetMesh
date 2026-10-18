export interface LeetCodeSubmission {
  title: string;
  timestamp: number;
  status: string;
  lang?: string;
}

export interface LeetCodeUserStats {
  username: string;
  realName: string;
  avatar: string;
  countryName?: string | null;
  ranking?: number | null;
  reputation?: number;
  totalSolved: number;
  totalSubmissions: number;
  easySolved: number;
  easySubmissions: number;
  mediumSolved: number;
  mediumSubmissions: number;
  hardSolved: number;
  hardSubmissions: number;
  acceptanceRate: number;
  contestRating?: number | null;
  contestGlobalRanking?: number | null;
  attendedContests?: number;
  contestTopPercentage?: number | null;
  contestBadge?: string | null;
  lastSubmission?: LeetCodeSubmission | null;
  activeDaysPastYear?: number;
  lastUpdated: string;
}

export interface SocialUserCandidate {
  username: string;
  userAvatar: string;
  realName: string;
  relation: string;
  selected?: boolean;
}

export type SourceType = 'followers' | 'following' | 'both' | 'manual';

export interface LeaderboardDoc {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  sourceType: SourceType;
  sourceUsername?: string;
  autoRefetchMembers: boolean;
  members: LeetCodeUserStats[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  customColumns: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ColumnDefinition {
  id: string;
  label: string;
  category: 'general' | 'solved' | 'contest' | 'activity';
  align?: 'left' | 'center' | 'right';
  description?: string;
  defaultVisible: boolean;
}
