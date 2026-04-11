import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { Payment, PaymentSummary } from '@/types/payment';

const demoPayments: Payment[] = [
  { id: '1', student_id: '1', student_name: 'Karimov Jasur', branch_id: 'minor', branch_name: 'Minor', course_type: 'tezkor', total_price: 2500000, amount_paid: 2500000, remaining_debt: 0, payment_method: 'naqd', date: '2024-03-01', created_at: '2024-03-01' },
  { id: '2', student_id: '2', student_name: 'Aliyeva Madina', branch_id: 'minor', branch_name: 'Minor', course_type: 'tezkor', total_price: 2500000, amount_paid: 1500000, remaining_debt: 1000000, payment_method: 'karta', date: '2024-03-05', created_at: '2024-03-05' },
];

const demoSummary: PaymentSummary = { total_collected: 4000000, total_debt: 1000000, monthly_income: 4000000 };

export const usePayments = (branchId?: string, courseType?: string) =>
  useQuery<Payment[]>({
    queryKey: ['payments', branchId, courseType],
    queryFn: async () => {
      try {
        const { data: res } = await axiosInstance.get('/payments', { params: { branch_id: branchId, course_type: courseType } });
        const arr = res?.data;
        if (Array.isArray(arr)) return arr;
        if (Array.isArray(res)) return res;
        return [];
      } catch {
        let filtered = demoPayments;
        if (branchId) filtered = filtered.filter((p) => p.branch_id === branchId);
        if (courseType) filtered = filtered.filter((p) => p.course_type === courseType);
        return filtered;
      }
    },
  });

export const usePaymentSummary = (branchId?: string) =>
  useQuery<PaymentSummary>({
    queryKey: ['payment-summary', branchId],
    queryFn: async () => {
      try {
        const { data: res } = await axiosInstance.get('/payments/summary', { params: { branch_id: branchId } });
        return res?.data || res;
      } catch {
        return demoSummary;
      }
    },
  });

export const useCreatePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payment: { student_id: string; amount: number; payment_method: string }) => {
      const { data } = await axiosInstance.post('/payments', payment);
      return data?.data || data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['payment-summary'] });
    },
  });
};

export const useDeletePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await axiosInstance.delete(`/payments/${id}`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['payment-summary'] });
    },
  });
};
