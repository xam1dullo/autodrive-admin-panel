import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { CourseType } from '@/types/student';

export interface DashboardAnalytics {
  total_students: number;
  total_revenue: number;
  pending_payments: number;
  active_tezkor: number;
  active_avto: number;
  branch_stats: { branch: string; students: number; revenue: number }[];
  monthly_enrollment: { month: string; tezkor: number; avto_maktab: number }[];
  payment_status: { paid: number; partial: number; debt: number };
}

const demoAnalytics: DashboardAnalytics = {
  total_students: 143,
  total_revenue: 485000000,
  pending_payments: 67500000,
  active_tezkor: 85,
  active_avto: 58,
  branch_stats: [
    { branch: 'Minor', students: 45, revenue: 156000000 },
    { branch: 'Chorsu', students: 38, revenue: 128000000 },
    { branch: 'Novza', students: 32, revenue: 108000000 },
    { branch: 'Samarqand', students: 28, revenue: 93000000 },
  ],
  monthly_enrollment: [
    { month: 'Yan', tezkor: 12, avto_maktab: 8 },
    { month: 'Fev', tezkor: 18, avto_maktab: 11 },
    { month: 'Mar', tezkor: 22, avto_maktab: 14 },
    { month: 'Apr', tezkor: 15, avto_maktab: 10 },
    { month: 'May', tezkor: 20, avto_maktab: 13 },
    { month: 'Iyn', tezkor: 25, avto_maktab: 16 },
  ],
  payment_status: { paid: 68, partial: 19, debt: 13 },
};

export const useDashboardAnalytics = (branchId?: string, courseType?: CourseType) =>
  useQuery<DashboardAnalytics>({
    queryKey: ['dashboard', branchId, courseType],
    queryFn: async () => {
      try {
        const { data: res } = await axiosInstance.get('/dashboard/analytics', { params: { branch_id: branchId, course_type: courseType } });
        return res?.data || res;
      } catch {
        return demoAnalytics;
      }
    },
  });
