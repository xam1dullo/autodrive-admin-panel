export type UserRole = 'owner' | 'manager';

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  branch_id?: string;
  branch_name?: string;
  phone?: string;
  avatar?: string;
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
