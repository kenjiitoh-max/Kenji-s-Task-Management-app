export type GoalTerm = 'short' | 'medium' | 'long';

export interface Category {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Goal {
  id: number;
  category_id: number;
  term: GoalTerm;
  description: string;
  target_date: string | null;
  created_at: string;
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
