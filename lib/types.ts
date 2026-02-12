export type Position = 'حارس' | 'دفاع' | 'وسط' | 'هجوم';
export type PlayerLevel = 'مبتدئ' | 'متوسط' | 'متقدم' | 'محترف';
export type AgeGroup = 'أقل من 14' | '14-17' | '18-24' | '25-34' | '35-44' | '45+';
export type TeamLevel = 'مبتدئ' | 'متوسط' | 'متقدم' | 'محترف';

export type MatchStatus = 'pending' | 'confirmed' | 'finished' | 'cancelled';
export type MatchType = 'direct' | 'challenge';
export type InviteStatus = 'pending' | 'accepted' | 'rejected';
export type ReportStatus = 'open' | 'closed';

export interface PlayerProfile {
  id: string;
  playerId: string;
  name: string;
  position: Position;
  level: PlayerLevel;
  city: string;
  area: string;
  ageGroup: AgeGroup;
  showAgeGroup: boolean;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  city: string;
  level: TeamLevel;
  captainId: string;
  memberIds: string[];
  averageRating: number;
  totalRatings: number;
  createdAt: string;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  teamName: string;
  fromPlayerId: string;
  fromPlayerName: string;
  toPlayerId: string;
  status: InviteStatus;
  createdAt: string;
}

export interface Match {
  id: string;
  type: MatchType;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId?: string;
  awayTeamName?: string;
  date: string;
  time: string;
  city: string;
  stadium?: string;
  locationUrl?: string;
  notes?: string;
  status: MatchStatus;
  createdBy: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  matchId: string;
  fromTeamId: string;
  toTeamId: string;
  stars: number;
  note?: string;
  createdAt: string;
}

export interface FreeAgent {
  id: string;
  playerId: string;
  playerName: string;
  position: Position;
  city: string;
  area: string;
  level: PlayerLevel;
  note?: string;
  createdAt: string;
  expiresAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'team' | 'player' | 'match';
  targetId: string;
  targetName: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  createdAt: string;
}

export const CITIES = [
  'الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام',
  'الخبر', 'الظهران', 'تبوك', 'أبها', 'الطائف',
  'حائل', 'بريدة', 'نجران', 'جازان', 'ينبع',
];

export const POSITIONS: Position[] = ['حارس', 'دفاع', 'وسط', 'هجوم'];
export const PLAYER_LEVELS: PlayerLevel[] = ['مبتدئ', 'متوسط', 'متقدم', 'محترف'];
export const TEAM_LEVELS: TeamLevel[] = ['مبتدئ', 'متوسط', 'متقدم', 'محترف'];
export const AGE_GROUPS: AgeGroup[] = ['أقل من 14', '14-17', '18-24', '25-34', '35-44', '45+'];

export const REPORT_REASONS = [
  'سلوك غير رياضي',
  'عدم الحضور المتكرر',
  'إساءة لفظية',
  'معلومات مزيفة',
  'تلاعب بالنتائج',
  'أخرى',
];

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  pending: 'في انتظار',
  confirmed: 'مؤكدة',
  finished: 'منتهية',
  cancelled: 'ملغية',
};
