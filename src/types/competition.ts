export type QuestionStatus = 'unplayed' | 'playing' | 'completed';

export type CompetitionView =
  | 'home'
  | 'round1_select'
  | 'round1_stage'
  | 'round2_select'
  | 'round2_stage'
  | 'admin';

export interface QuizQuestion {
  id: string;
  order: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  imageUrl?: string;
  explanation?: string;
}

export interface QuizPackage {
  id: string;
  number: number;
  title: string;
  status: QuestionStatus;
  questions: QuizQuestion[];
  score?: number; // max 20 (5 pts each)
  results?: {
    questionId: string;
    isCorrect: boolean;
    points: number;
  }[];
  playedAt?: string;
  teamAssigned?: string;
}

export interface Situation {
  id: string;
  number: number;
  title: string;
  content: string;
  status: QuestionStatus;
  imageUrl?: string;
  assignedTeam?: string;
  elapsedSeconds?: number;
  overtimeSeconds?: number;
  judgeScore?: number; // 0 - 30
  penaltyScore?: number; // auto computed
  finalScore?: number; // judgeScore - penaltyScore
  playedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  unit: string;
  members: string;
  round1Score: number;
  round2Score: number;
  totalScore: number;
}

export interface AppSettings {
  competitionName: string;
  organizer: string;
  round1Title: string;
  round1Subtitle: string;
  round2Title: string;
  round2Subtitle: string;
  round1TimeLimit: number; // 10 seconds
  round2TimeLimit: number; // 420 seconds (7 minutes)
  soundEnabled: boolean;
  volume: number;
}

export interface SyncStatus {
  state: 'synced' | 'syncing' | 'error' | 'offline';
  lastSyncedAt?: string;
  message?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'operator';
  displayName: string;
}
