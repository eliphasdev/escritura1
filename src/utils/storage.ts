import { Lesson, PersonalBest, SessionResult, Badge, UserStats, CosmicRank } from '../types';
import { INITIAL_LESSONS, INITIAL_BADGES } from '../data/lessons';

const STORAGE_KEYS = {
  CUSTOM_LESSONS: 'astro_custom_lessons_v1',
  PERSONAL_BESTS: 'astro_personal_bests_v1',
  SESSIONS: 'astro_sessions_v1',
  BADGES: 'astro_badges_v1',
  STATS: 'astro_stats_v1',
};

export function getLessons(): Lesson[] {
  try {
    const rawCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_LESSONS);
    const custom: Lesson[] = rawCustom ? JSON.parse(rawCustom) : [];
    return [...INITIAL_LESSONS, ...custom];
  } catch {
    return INITIAL_LESSONS;
  }
}

export function saveCustomLesson(lesson: Lesson): void {
  try {
    const rawCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_LESSONS);
    const custom: Lesson[] = rawCustom ? JSON.parse(rawCustom) : [];
    custom.unshift(lesson);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_LESSONS, JSON.stringify(custom));
  } catch (err) {
    console.error('Failed to save custom lesson:', err);
  }
}

export function deleteCustomLesson(lessonId: string): void {
  try {
    const rawCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_LESSONS);
    if (!rawCustom) return;
    const custom: Lesson[] = JSON.parse(rawCustom);
    const updated = custom.filter(l => l.id !== lessonId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_LESSONS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete custom lesson:', err);
  }
}

export function getPersonalBests(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PERSONAL_BESTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getLinePersonalBest(lessonId: string, lineIndex: number): number | undefined {
  const pbs = getPersonalBests();
  const key = `${lessonId}_${lineIndex}`;
  return pbs[key];
}

export function saveLinePersonalBest(lessonId: string, lineIndex: number, timeMs: number): boolean {
  try {
    const pbs = getPersonalBests();
    const key = `${lessonId}_${lineIndex}`;
    const previous = pbs[key];
    
    if (previous === undefined || timeMs < previous) {
      pbs[key] = timeMs;
      localStorage.setItem(STORAGE_KEYS.PERSONAL_BESTS, JSON.stringify(pbs));
      return true; // New record!
    }
    return false;
  } catch {
    return false;
  }
}

export function getSessions(): SessionResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: SessionResult): void {
  try {
    const sessions = getSessions();
    sessions.unshift(session);
    // Keep last 50 sessions
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions.slice(0, 50)));

    // Update aggregate stats & badges
    updateStatsAndBadges(session);
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

export function getUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  return {
    totalMissionsCompleted: 0,
    totalLinesCopied: 0,
    totalStars: 0,
    totalRecordsBeaten: 0,
    fastestLineMs: 0,
    rank: 'Cadete Espacial',
    consecutiveDays: 1
  };
}

export function calculateRank(stars: number, linesCopied: number): CosmicRank {
  if (stars >= 30 || linesCopied >= 50) return 'Comandante Galáctico';
  if (stars >= 20 || linesCopied >= 30) return 'Capitán Estelar';
  if (stars >= 10 || linesCopied >= 15) return 'Astronauta Veloz';
  if (stars >= 4 || linesCopied >= 6) return 'Piloto de Órbita';
  return 'Cadete Espacial';
}

function updateStatsAndBadges(session: SessionResult): void {
  const currentStats = getUserStats();

  const linesInSession = session.lineRecords.length;
  const newLinesTotal = currentStats.totalLinesCopied + linesInSession;
  const newMissionsTotal = currentStats.totalMissionsCompleted + 1;
  const newStarsTotal = currentStats.totalStars + session.starsEarned;
  const newRecordsTotal = currentStats.totalRecordsBeaten + session.personalBestsCount;

  // Fastest line
  const fastestInSession = Math.min(...session.lineRecords.map(r => r.durationMs));
  const newFastestLine = currentStats.fastestLineMs === 0 
    ? fastestInSession 
    : Math.min(currentStats.fastestLineMs, fastestInSession);

  const newRank = calculateRank(newStarsTotal, newLinesTotal);

  const updatedStats: UserStats = {
    totalMissionsCompleted: newMissionsTotal,
    totalLinesCopied: newLinesTotal,
    totalStars: newStarsTotal,
    totalRecordsBeaten: newRecordsTotal,
    fastestLineMs: newFastestLine,
    rank: newRank,
    consecutiveDays: currentStats.consecutiveDays || 1
  };

  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats));

  // Update badges
  checkAndUnlockBadges(updatedStats, session);
}

export function getBadges(): Badge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BADGES);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_BADGES;
}

function checkAndUnlockBadges(stats: UserStats, session: SessionResult): void {
  const badges = getBadges();
  let changed = false;

  const now = new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });

  badges.forEach(b => {
    if (!b.unlocked) {
      if (b.id === 'primer-despegue' && stats.totalMissionsCompleted >= 1) {
        b.unlocked = true;
        b.unlockedAt = now;
        changed = true;
      } else if (b.id === 'velocidad-luz' && stats.totalRecordsBeaten >= 1) {
        b.unlocked = true;
        b.unlockedAt = now;
        changed = true;
      } else if (b.id === 'maestro-ligada' && stats.totalLinesCopied >= 10) {
        b.unlocked = true;
        b.unlockedAt = now;
        changed = true;
      } else if (b.id === 'comandante-estelar' && stats.totalStars >= 15) {
        b.unlocked = true;
        b.unlockedAt = now;
        changed = true;
      }
    }
  });

  if (changed) {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  }
}
