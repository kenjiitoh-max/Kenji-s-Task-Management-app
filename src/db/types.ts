export type GoalTerm = 'short' | 'medium' | 'long';

export type CategoryKind = 'weight' | 'bird' | 'engineer' | 'reader' | 'athlete';

export interface Category {
  id: number;
  name: string;
  color: string;
  kind: CategoryKind | null;
  created_at: string;
}

export interface BodyRecord {
  id: number;
  date: string;
  weight_kg: number;
  body_fat_pct: number | null;
  created_at: string;
}

export type Sex = 'male' | 'female';

export interface BodyProfile {
  height_cm: number | null;
  sex: Sex;
}

export interface Goal {
  id: number;
  category_id: number;
  term: GoalTerm;
  description: string;
  target_date: string | null;
  created_at: string;
}

export type BookStatus = 'want' | 'reading' | 'done';

export interface Book {
  id: number;
  category_id: number;
  title: string;
  authors: string | null;
  cover_url: string | null;
  external_id: string | null;
  status: BookStatus;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSet {
  id: number;
  category_id: number;
  exercise: string;
  weight_kg: number;
  reps: number;
  sets: number;
  date: string;
  performed_at: string;
}

export interface DailyAction {
  id: number;
  category_id: number;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
