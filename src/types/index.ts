export type PracticeMode = 'notebook' | 'canvas';

export type CosmicRank = 
  | 'Cadete Espacial'
  | 'Piloto de Órbita'
  | 'Astronauta Veloz'
  | 'Capitán Estelar'
  | 'Comandante Galáctico';

export interface Lesson {
  id: string;
  title: string;
  category: 'Primeros Trazos' | 'Aventura Espacial' | 'Mundo Animal' | 'Cuentos y Retos' | 'Personalizados';
  difficulty: 'Fácil' | 'Medio' | 'Desafío';
  description: string;
  lines: string[];
  targetTimePerLineSec: number;
  iconName: string;
  isCustom?: boolean;
}

export interface LineRecord {
  lineIndex: number;
  text: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  previousBestMs?: number;
  isNewPersonalBest: boolean;
}

export interface SessionResult {
  id: string;
  lessonId: string;
  lessonTitle: string;
  timestamp: number;
  mode: PracticeMode;
  totalDurationMs: number;
  lineRecords: LineRecord[];
  personalBestsCount: number;
  starsEarned: number;
  rankAchieved: CosmicRank;
}

export interface PersonalBest {
  lessonId: string;
  lineIndex: number;
  bestTimeMs: number;
  date: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  condition: string;
}

export interface UserStats {
  totalMissionsCompleted: number;
  totalLinesCopied: number;
  totalStars: number;
  totalRecordsBeaten: number;
  fastestLineMs: number;
  rank: CosmicRank;
  consecutiveDays: number;
}
