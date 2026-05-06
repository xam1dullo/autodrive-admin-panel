export type UserRole = 'dev' | 'owner' | 'manager' | 'operator' | 'teacher';
export type Specialization = 'THEORY' | 'PRACTICE';
export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  branch_id?: string;
  branch_name?: string;
  phone?: string;
  avatar?: string;
  specialization?: Specialization;
  is_active?: boolean;
  created_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
