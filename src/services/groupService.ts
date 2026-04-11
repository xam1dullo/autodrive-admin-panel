import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { Group, GroupOverview } from '@/types/group';

const demoGroups: Group[] = [
  { id: 'group-1', name: 'B-1', branch_id: 'minor', branch_name: 'Minor', course_type: 'avto_maktab', active_students: 12, is_active: true, created_at: '2024-01-15' },
  { id: 'group-2', name: 'B-2', branch_id: 'chorsu', branch_name: 'Chorsu', course_type: 'avto_maktab', active_students: 8, is_active: true, created_at: '2024-02-01' },
  { id: 'group-3', name: 'T-1', branch_id: 'novza', branch_name: 'Novza', course_type: 'tezkor', active_students: 15, is_active: false, created_at: '2024-01-10' },
];

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
        return demoGroups;
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
        // build from demo
        const byBranch: Record<string, GroupOverview> = {};
        demoGroups.forEach((g) => {
          if (!byBranch[g.branch_id]) {
            byBranch[g.branch_id] = { branch_name: g.branch_name || g.branch_id, branch_id: g.branch_id, groups: [] };
          }
          byBranch[g.branch_id].groups.push(g);
        });
        return Object.values(byBranch);
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
