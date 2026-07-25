export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  owner: number;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  owner: User;
  category_id: number | null;
  shared_with: User[];
  is_completed: boolean;
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
