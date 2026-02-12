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
  status: MatchStatus;
  createdByPlayerId: string;
  createdByName: string;
  createdByTeamId?: string;

  opponentTeamId?: string;
  opponentTeamName?: string;

  matchDate: string;
  startTime: string;

  city: string;
  venue: string;

  notes?: string;

  createdAt: string;
  confirmedAt?: string;
  finishedAt?: string;
  cancelledAt?: string;
}

export interface TeamRating {
  id: string;
  teamId: string;
  fromTeamId: string;
  fromTeamName: string;
  rating: number; // 1 - 5
  comment?: string;
  createdAt: string;
}

export interface TeamReport {
  id: string;
  reportedTeamId: string;
  reportedTeamName: string;
  reporterTeamId: string;
  reporterTeamName: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  adminNotes?: string;
}

export const CITIES = [
  'طرابلس',
  'بنغازي',
  'مصراتة',
  'سبها',
  'سرت',
  'الزاوية',
  'زليتن',
  'الخمس',
  'اجدابيا',
  'البيضاء',
  'درنة',
  'طبرق',
  'غريان',
  'ترهونة',
  'بني وليد',
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
