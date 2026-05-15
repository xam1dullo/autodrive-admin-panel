import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { User, UserRole } from '@/types/user';

interface ListParams {
  page?: number;
  limit?: number;
  companyId?: string;
  branchId?: string;
  role?: UserRole;
  search?: string;
  includeDeleted?: boolean;
}

export interface PlatformUserListResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
}

export const usePlatformUsers = (params: ListParams = {}) => {
  const role = useAuthStore((s) => s.user?.role);
  return useQuery<PlatformUserListResponse>({
    queryKey: ['platform-users', params],
    queryFn: async () => {
      const { data: res } = await axiosInstance.get('/platform/users', { params });
      const payload = res?.data ?? res;
      if (Array.isArray(payload)) {
        return { items: payload, total: payload.length, page: 1, limit: payload.length };
      }
      return payload as PlatformUserListResponse;
    },
    enabled: role === 'dev',
  });
};

export interface CreatePlatformUserInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  branchId?: string;
  companyId?: string;
}

export const useCreatePlatformUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePlatformUserInput) => {
      const { data } = await axiosInstance.post('/platform/users', input);
      return (data?.data ?? data) as User;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform-users'] }),
  });
};

export interface UpdatePlatformUserInput {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  branchId?: string;
  companyId?: string;
}

export const useUpdatePlatformUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdatePlatformUserInput) => {
      const { data } = await axiosInstance.patch(`/platform/users/${id}`, input);
      return (data?.data ?? data) as User;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform-users'] }),
  });
};

export const useResetPlatformUserPassword = () => {
  return useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      await axiosInstance.post(`/platform/users/${id}/reset-password`, { password });
    },
  });
};

export const useDeletePlatformUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/platform/users/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform-users'] }),
  });
};
