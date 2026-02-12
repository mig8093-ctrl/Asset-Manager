import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import type {
  Team, TeamInvite, Match, MatchStatus, Rating, FreeAgent, Report,
} from './types';
import {
  teamsStorage, invitesStorage, matchesStorage,
  ratingsStorage, freeAgentsStorage, reportsStorage,
} from './storage';

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function now(): string {
  return new Date().toISOString();
}

interface DataContextValue {
  teams: Team[];
  getMyTeams: (playerId: string) => Team[];
  getTeam: (id: string) => Team | undefined;
  createTeam: (team: Omit<Team, 'id' | 'averageRating' | 'totalRatings' | 'createdAt'>) => Team;
  deleteTeam: (id: string) => void;
  removeMember: (teamId: string, playerId: string) => void;

  invites: TeamInvite[];
  getMyInvites: (playerId: string) => TeamInvite[];
  sendInvite: (invite: Omit<TeamInvite, 'id' | 'status' | 'createdAt'>) => TeamInvite;
  respondInvite: (inviteId: string, accept: boolean) => void;

  matches: Match[];
  getMyMatches: (playerId: string) => Match[];
  getMatch: (id: string) => Match | undefined;
  createMatch: (match: Omit<Match, 'id' | 'createdAt'>) => Match;
  updateMatchStatus: (matchId: string, status: MatchStatus) => void;
  respondChallenge: (matchId: string, accept: boolean) => void;

  ratings: Rating[];
  getTeamRatings: (teamId: string) => Rating[];
  addRating: (rating: Omit<Rating, 'id' | 'createdAt'>) => void;

  freeAgents: FreeAgent[];
  getActiveFreeAgents: () => FreeAgent[];
  toggleFreeAgent: (agent: Omit<FreeAgent, 'id' | 'createdAt' | 'expiresAt'>) => void;
  isPlayerFreeAgent: (playerId: string) => boolean;

  reports: Report[];
  addReport: (report: Omit<Report, 'id' | 'status' | 'createdAt'>) => void;

  isLoading: boolean;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [freeAgents, setFreeAgents] = useState<FreeAgent[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [t, i, m, r, fa, rep] = await Promise.all([
        teamsStorage.getAll(),
        invitesStorage.getAll(),
        matchesStorage.getAll(),
        ratingsStorage.getAll(),
        freeAgentsStorage.getAll(),
        reportsStorage.getAll(),
      ]);
      setTeams(t);
      setInvites(i);
      setMatches(m);
      setRatings(r);
      setFreeAgents(fa);
      setReports(rep);
      setIsLoading(false);
    }
    load();
  }, []);

  const getMyTeams = useCallback((playerId: string) => {
    return teams.filter(t => t.captainId === playerId || t.memberIds.includes(playerId));
  }, [teams]);

  const getTeam = useCallback((id: string) => {
    return teams.find(t => t.id === id);
  }, [teams]);

  const createTeam = useCallback((team: Omit<Team, 'id' | 'averageRating' | 'totalRatings' | 'createdAt'>) => {
    const newTeam: Team = {
      ...team,
      id: generateId(),
      averageRating: 0,
      totalRatings: 0,
      createdAt: now(),
    };
    const updated = [...teams, newTeam];
    setTeams(updated);
    teamsStorage.save(updated);
    return newTeam;
  }, [teams]);

  const deleteTeam = useCallback((id: string) => {
    const updated = teams.filter(t => t.id !== id);
    setTeams(updated);
    teamsStorage.save(updated);
  }, [teams]);

  const removeMember = useCallback((teamId: string, playerId: string) => {
    const updated = teams.map(t =>
      t.id === teamId
        ? { ...t, memberIds: t.memberIds.filter(m => m !== playerId) }
        : t
    );
    setTeams(updated);
    teamsStorage.save(updated);
  }, [teams]);

  const getMyInvites = useCallback((playerId: string) => {
    return invites.filter(i => i.toPlayerId === playerId && i.status === 'pending');
  }, [invites]);

  const sendInvite = useCallback((invite: Omit<TeamInvite, 'id' | 'status' | 'createdAt'>) => {
    const newInvite: TeamInvite = {
      ...invite,
      id: generateId(),
      status: 'pending',
      createdAt: now(),
    };
    const updated = [...invites, newInvite];
    setInvites(updated);
    invitesStorage.save(updated);
    return newInvite;
  }, [invites]);

  const respondInvite = useCallback((inviteId: string, accept: boolean) => {
    const invite = invites.find(i => i.id === inviteId);
    if (!invite) return;

    const updatedInvites = invites.map(i =>
      i.id === inviteId
        ? { ...i, status: accept ? 'accepted' as const : 'rejected' as const }
        : i
    );
    setInvites(updatedInvites);
    invitesStorage.save(updatedInvites);

    if (accept) {
      const updatedTeams = teams.map(t =>
        t.id === invite.teamId && !t.memberIds.includes(invite.toPlayerId)
          ? { ...t, memberIds: [...t.memberIds, invite.toPlayerId] }
          : t
      );
      setTeams(updatedTeams);
      teamsStorage.save(updatedTeams);
    }
  }, [invites, teams]);

  const getMyMatches = useCallback((playerId: string) => {
    const myTeamIds = teams
      .filter(t => t.captainId === playerId || t.memberIds.includes(playerId))
      .map(t => t.id);
    return matches.filter(m =>
      myTeamIds.includes(m.homeTeamId) || (m.awayTeamId && myTeamIds.includes(m.awayTeamId))
    );
  }, [teams, matches]);

  const getMatch = useCallback((id: string) => {
    return matches.find(m => m.id === id);
  }, [matches]);

  const createMatch = useCallback((match: Omit<Match, 'id' | 'createdAt'>) => {
    const newMatch: Match = {
      ...match,
      id: generateId(),
      createdAt: now(),
    };
    const updated = [...matches, newMatch];
    setMatches(updated);
    matchesStorage.save(updated);
    return newMatch;
  }, [matches]);

  const updateMatchStatus = useCallback((matchId: string, status: MatchStatus) => {
    const updated = matches.map(m =>
      m.id === matchId ? { ...m, status } : m
    );
    setMatches(updated);
    matchesStorage.save(updated);
  }, [matches]);

  const respondChallenge = useCallback((matchId: string, accept: boolean) => {
    const updated = matches.map(m =>
      m.id === matchId
        ? { ...m, status: accept ? 'confirmed' as const : 'cancelled' as const }
        : m
    );
    setMatches(updated);
    matchesStorage.save(updated);
  }, [matches]);

  const getTeamRatings = useCallback((teamId: string) => {
    return ratings.filter(r => r.toTeamId === teamId);
  }, [ratings]);

  const addRating = useCallback((rating: Omit<Rating, 'id' | 'createdAt'>) => {
    const newRating: Rating = {
      ...rating,
      id: generateId(),
      createdAt: now(),
    };
    const updatedRatings = [...ratings, newRating];
    setRatings(updatedRatings);
    ratingsStorage.save(updatedRatings);

    const teamRatings = updatedRatings.filter(r => r.toTeamId === rating.toTeamId);
    const totalRatings = teamRatings.length;
    const averageRating = teamRatings.reduce((sum, r) => sum + r.stars, 0) / totalRatings;

    const updatedTeams = teams.map(t =>
      t.id === rating.toTeamId
        ? { ...t, averageRating, totalRatings }
        : t
    );
    setTeams(updatedTeams);
    teamsStorage.save(updatedTeams);
  }, [ratings, teams]);

  const getActiveFreeAgents = useCallback(() => {
    const currentTime = new Date().toISOString();
    return freeAgents.filter(a => a.expiresAt > currentTime);
  }, [freeAgents]);

  const toggleFreeAgent = useCallback((agent: Omit<FreeAgent, 'id' | 'createdAt' | 'expiresAt'>) => {
    const currentTime = new Date().toISOString();
    const existing = freeAgents.find(
      a => a.playerId === agent.playerId && a.expiresAt > currentTime
    );

    let updated: FreeAgent[];
    if (existing) {
      updated = freeAgents.filter(a => a.id !== existing.id);
    } else {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const newAgent: FreeAgent = {
        ...agent,
        id: generateId(),
        createdAt: now(),
        expiresAt,
      };
      updated = [...freeAgents, newAgent];
    }
    setFreeAgents(updated);
    freeAgentsStorage.save(updated);
  }, [freeAgents]);

  const isPlayerFreeAgent = useCallback((playerId: string) => {
    const currentTime = new Date().toISOString();
    return freeAgents.some(a => a.playerId === playerId && a.expiresAt > currentTime);
  }, [freeAgents]);

  const addReport = useCallback((report: Omit<Report, 'id' | 'status' | 'createdAt'>) => {
    const newReport: Report = {
      ...report,
      id: generateId(),
      status: 'open',
      createdAt: now(),
    };
    const updated = [...reports, newReport];
    setReports(updated);
    reportsStorage.save(updated);
  }, [reports]);

  const value = useMemo<DataContextValue>(() => ({
    teams,
    getMyTeams,
    getTeam,
    createTeam,
    deleteTeam,
    removeMember,
    invites,
    getMyInvites,
    sendInvite,
    respondInvite,
    matches,
    getMyMatches,
    getMatch,
    createMatch,
    updateMatchStatus,
    respondChallenge,
    ratings,
    getTeamRatings,
    addRating,
    freeAgents,
    getActiveFreeAgents,
    toggleFreeAgent,
    isPlayerFreeAgent,
    reports,
    addReport,
    isLoading,
  }), [
    teams, getMyTeams, getTeam, createTeam, deleteTeam, removeMember,
    invites, getMyInvites, sendInvite, respondInvite,
    matches, getMyMatches, getMatch, createMatch, updateMatchStatus, respondChallenge,
    ratings, getTeamRatings, addRating,
    freeAgents, getActiveFreeAgents, toggleFreeAgent, isPlayerFreeAgent,
    reports, addReport,
    isLoading,
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
