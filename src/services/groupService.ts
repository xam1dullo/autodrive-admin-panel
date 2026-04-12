import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { Group, GroupOverview } from '@/types/group';


export const useGroups = () =>
  useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: async () => {
      try {
        const { data: res } = await axiosInstance.get('/groups');
        const arr = res?.data;
        if (Array.isArray(arr)) return arr;
        if (Array.isArray(res)) return res;
        return [];
      } catch {
        return [];
      }
    },
  });

export const useGroupsOverview = () =>
  useQuery<GroupOverview[]>({
    queryKey: ['groups-overview'],
    queryFn: async () => {
      try {
        const { data: res } = await axiosInstance.get('/groups/overview');
        const arr = res?.data;
        if (Array.isArray(arr)) return arr;
        if (Array.isArray(res)) return res;
        return [];
      } catch {
        return [];
      }
    },
  });

export const useCreateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (group: { name: string; branchId: string; courseType: string }) => {
      const { data } = await axiosInstance.post('/groups', group);
      return data?.data || data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['groups-overview'] });
    },
  });
};

export const useUpdateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...group }: { id: string; name: string; branchId: string; courseType: string }) => {
      const { data } = await axiosInstance.put(`/groups/${id}`, group);
      return data?.data || data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['groups-overview'] });
    },
  });
};

export const useDeleteGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/groups/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['groups-overview'] });
    },
  });
};
