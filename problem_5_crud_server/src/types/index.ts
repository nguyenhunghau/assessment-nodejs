export type UserRole = 'admin' | 'employee';

export interface User {
  id?: number;
  email: string;
  password_hash?: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export interface Employee {
  id?: number;
  user_id: number;
  first_name: string;
  last_name: string;
  department?: string;
  position?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string; // ISO date string (YYYY-MM-DD)
  assigned_to_user_id: number;
  created_by_user_id: number;
  created_at?: Date;
  updated_at?: Date;
}
