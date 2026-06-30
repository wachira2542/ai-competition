export interface Project {
  id: string;
  name: string;
  team: string;
  objective: string;
  tech_stack: string;
  target_users: string;
}

export interface Rubric {
  min: number;
  max: number;
  label: string;
  desc: string;
}

export interface Criterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  rubrics: Rubric[];
}

export interface ScoreMap {
  [criteriaId: string]: number | string;
}

export interface EvaluationDetail {
  user_id: number;
  username: string;
  scores: ScoreMap;
  comment: string;
  total_score: number;
}

export interface Evaluation {
  id?: number;
  project_id: string;
  scores: ScoreMap; // Now this is average scores for GET /evaluations
  comment: string; // Deprecated for aggregated view, but kept for compatibility
  total_score: number; // Average total score
  judge_count?: number; // How many judges scored it
  details?: EvaluationDetail[]; // Array of individual judge scores (admin only)
  created_at?: string;
  updated_at?: string;
}

export interface ProjectWithEvaluation extends Project {
  isEvaluated: boolean;
  totalScore: number;
  comment: string;
  scores: ScoreMap | null;
  judgeCount?: number;
  details?: EvaluationDetail[];
}

export type RevealState = 'idle' | 'counting-1' | 'revealed-1' | 'counting-2' | 'revealed-2' | 'counting-3' | 'revealed-3' | 'revealed';
