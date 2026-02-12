import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  PlayerProfile, Team, TeamInvite, Match, Rating, FreeAgent, Report,
} from './types';

const KEYS = {
  PROFILE: '@koralink_profile',
  TEAMS: '@koralink_teams',
  INVITES: '@koralink_invites',
  MATCHES: '@koralink_matches',
  RATINGS: '@koralink_ratings',
  FREE_AGENTS: '@koralink_free_agents',
  REPORTS: '@koralink_reports',
  THEME: '@koralink_theme',
};

async function getItem<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  return JSON.parse(raw) as T;
}

async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const profileStorage = {
  get: () => getItem<PlayerProfile | null>(KEYS.PROFILE, null),
  set: (p: PlayerProfile) => setItem(KEYS.PROFILE, p),
  clear: () => AsyncStorage.removeItem(KEYS.PROFILE),
};

export const teamsStorage = {
  getAll: () => getItem<Team[]>(KEYS.TEAMS, []),
  save: (teams: Team[]) => setItem(KEYS.TEAMS, teams),
};

export const invitesStorage = {
  getAll: () => getItem<TeamInvite[]>(KEYS.INVITES, []),
  save: (invites: TeamInvite[]) => setItem(KEYS.INVITES, invites),
};

export const matchesStorage = {
  getAll: () => getItem<Match[]>(KEYS.MATCHES, []),
  save: (matches: Match[]) => setItem(KEYS.MATCHES, matches),
};

export const ratingsStorage = {
  getAll: () => getItem<Rating[]>(KEYS.RATINGS, []),
  save: (ratings: Rating[]) => setItem(KEYS.RATINGS, ratings),
};

export const freeAgentsStorage = {
  getAll: () => getItem<FreeAgent[]>(KEYS.FREE_AGENTS, []),
  save: (agents: FreeAgent[]) => setItem(KEYS.FREE_AGENTS, agents),
};

export const reportsStorage = {
  getAll: () => getItem<Report[]>(KEYS.REPORTS, []),
  save: (reports: Report[]) => setItem(KEYS.REPORTS, reports),
};

export const themeStorage = {
  get: () => getItem<'light' | 'dark'>(KEYS.THEME, 'light'),
  set: (theme: 'light' | 'dark') => setItem(KEYS.THEME, theme),
};
