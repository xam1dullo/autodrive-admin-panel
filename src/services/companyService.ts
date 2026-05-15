import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import {
  Company,
  CompanyDetail,
  CompanyListResponse,
  CompanyStatus,
} from '@/types/company';

interface ListParams {
  page?: number;
  limit?: number;
  status?: CompanyStatus;
  search?: string;
}

export const useCompanies = (params: ListParams = {}) => {
  const role = useAuthStore((s) => s.user?.role);
  return useQuery<CompanyListResponse>({
    queryKey: ['platform-companies', params],
    queryFn: async () => {
      const { data: res } = await axiosInstance.get('/platform/companies', { params });
      const payload = res?.data ?? res;
      if (Array.isArray(payload)) {
        return { items: payload, total: payload.length, page: 1, limit: payload.length };
      }
      return payload as CompanyListResponse;
    },
    enabled: role === 'dev',
  });
};

export const useCompany = (id: string | null) => {
  const role = useAuthStore((s) => s.user?.role);
  return useQuery<CompanyDetail>({
    queryKey: ['platform-company', id],
    queryFn: async () => {
      const { data: res } = await axiosInstance.get(`/platform/companies/${id}`);
      return (res?.data ?? res) as CompanyDetail;
    },
    enabled: !!id && role === 'dev',
  });
};

export interface CreateCompanyInput {
  name: string;
  slug?: string;
  status?: CompanyStatus;
  contactPhone?: string;
  contactEmail?: string;
}

export const useCreateCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCompanyInput) => {
      const { data } = await axiosInstance.post('/platform/companies', input);
      return (data?.data ?? data) as Company;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform-companies'] }),
  });
};

export interface UpdateCompanyInput {
  id: string;
  name?: string;
  slug?: string;
  status?: CompanyStatus;
  contactPhone?: string;
  contactEmail?: string;
}

export const useUpdateCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateCompanyInput) => {
      const { data } = await axiosInstance.patch(`/platform/companies/${id}`, input);
      return (data?.data ?? data) as Company;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform-companies'] }),
  });
};

export const useApproveCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.post(`/platform/companies/${id}/approve`);
      return (data?.data ?? data) as Company;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform-companies'] }),
  });
};

export const useSuspendCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.post(`/platform/companies/${id}/suspend`);
      return (data?.data ?? data) as Company;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform-companies'] }),
  });
};

export const useDeleteCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/platform/companies/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform-companies'] }),
  });
};
