import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { User } from '@/types/user';

const demoUsers: User[] = [
  { id: '1', email: 'owner@autodrive.uz', phone: '+998901234567', role: 'owner', is_active: true, created_at: '2024-01-01' },
  { id: '2', email: 'manager@autodrive.uz', phone: '+998907654321', role: 'manager', branch_id: 'minor', branch_name: 'Minor', is_active: true, created_at: '2024-01-01' },
];

export const useUsers = () =>
  useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const { data: res } = await axiosInstance.get('/users');
        const arr = res?.data;
        if (Array.isArray(arr)) return arr;
        if (Array.isArray(res)) return res;
        return [];
      } catch {
        return demoUsers;
      }
    },
  });
