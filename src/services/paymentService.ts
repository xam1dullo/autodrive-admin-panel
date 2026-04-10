import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { Payment, PaymentSummary } from '@/types/payment';

const demoPayments: Payment[] = [
  { id: '1', student_id: '1', student_name: 'Karimov Jasur', branch_id: 'minor', branch_name: 'Minor', course_type: 'tezkor', total_price: 2500000, amount_paid: 2500000, remaining_debt: 0, payment_method: 'naqd', date: '2024-03-01', created_at: '2024-03-01' },
  { id: '2', student_id: '2', student_name: 'Aliyeva Madina', branch_id: 'minor', branch_name: 'Minor', course_type: 'tezkor', total_price: 2500000, amount_paid: 1500000, remaining_debt: 1000000, payment_method: 'karta', date: '2024-03-05', created_at: '2024-03-05' },
  { id: '3', student_id: '6', student_name: 'Yusupov Akmal', branch_id: 'minor', branch_name: 'Minor', course_type: 'avto_maktab', total_price: 6000000, amount_paid: 5500000, remaining_debt: 500000, payment_method: 'naqd', date: '2024-03-01', created_at: '2024-03-01' },
  { id: '4', student_id: '7', student_name: 'Mirzo Shahlo', branch_id: 'chorsu', branch_name: 'Chorsu', course_type: 'avto_maktab', total_price: 6000000, amount_paid: 1600000, remaining_debt: 4400000, payment_method: 'karta', date: '2024-03-03', created_at: '2024-03-03' },
];

const demoSummary: PaymentSummary = { total_collected: 11100000, total_debt: 5900000, monthly_income: 11100000 };

export const usePayments = (branchId?: string, courseType?: string) => {
  return useQuery<Payment[]>({
    queryKey: ['payments', branchId, courseType],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get('/payments', { params: { branch_id: branchId, course_type: courseType } });
        return data;
      } catch {
        let filtered = demoPayments;
        if (branchId) filtered = filtered.filter((p) => p.branch_id === branchId);
        if (courseType) filtered = filtered.filter((p) => p.course_type === courseType);
        return filtered;
      }
    },
  });
};

export const usePaymentSummary = (branchId?: string) => {
  return useQuery<PaymentSummary>({
    queryKey: ['payment-summary', branchId],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get('/payments/summary', { params: { branch_id: branchId } });
        return data;
      } catch {
        return demoSummary;
      }
    },
  });
};

export const useCreatePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payment: Partial<Payment>) => {
      const { data } = await axiosInstance.post('/payments', payment);
      return data;
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
