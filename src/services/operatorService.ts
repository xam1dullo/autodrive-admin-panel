import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { User } from '@/types/user';



export const useOperators = () =>
  useQuery<User[]>({
    queryKey: ['operators'],
    queryFn: async () => {
      try {
        const { data: res } = await axiosInstance.get('/users', { params: { role: 'operator' } });
        const arr = res?.data;
        console.log("Operators response:", res);
        if (Array.isArray(arr)) return arr;
        if (Array.isArray(res)) return res;
        return [];
      } catch {
        return [];
      }
    },
  });

export const useCreateOperator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (op: { fullName: string; phone: string; branchId: string }) => {
      const { data } = await axiosInstance.post('/users', { ...op, role: 'operator' });
      return data?.data || data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['operators'] }),
  });
};

export const useUpdateOperator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...op }: { id: string; fullName: string; phone: string; branchId: string }) => {
      const { data } = await axiosInstance.put(`/users/${id}`, { ...op, role: 'operator' });
      return data?.data || data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['operators'] }),
  });
};

export const useDeleteOperator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/users/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['operators'] }),
  });
};
