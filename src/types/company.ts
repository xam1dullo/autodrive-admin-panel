export type CompanyStatus = 'active' | 'pending' | 'suspended';

export interface Company {
  id: string;
  name: string;
  slug: string;
  status: CompanyStatus;
  contact_phone: string | null;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CompanyStats {
  branches: number;
  users: number;
  students: number;
  payments: number;
}

export interface CompanyDetail extends Company {
  stats: CompanyStats;
}

export interface CompanyListResponse {
  items: Company[];
  total: number;
  page: number;
  limit: number;
}
