import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { Student, CourseType } from '@/types/student';

const demoStudentsTezkor: Student[] = [
  { id: '1', last_name: 'Karimov', first_name: 'Jasur', phone: '+998901112233', total_price: 2500000, course_type: 'tezkor', branch_id: 'minor', branch_name: 'Minor', payment_method: 'naqd', amount_paid: 2500000, debt: 0, has_document: true, registered_by: 'Nilufar', result: 'topshirdi', notes: '', created_at: '2024-03-01' },
  { id: '2', last_name: 'Aliyeva', first_name: 'Madina', phone: '+998937778899', total_price: 2500000, course_type: 'tezkor', branch_id: 'minor', branch_name: 'Minor', payment_method: 'karta', amount_paid: 1500000, debt: 1000000, has_document: false, registered_by: 'Aziz', result: 'yiqildi', notes: 'Imtihonga kelmadi', created_at: '2024-03-05' },
  { id: '3', last_name: 'Raximov', first_name: 'Bobur', phone: '+998944445566', total_price: 2500000, course_type: 'tezkor', branch_id: 'chorsu', branch_name: 'Chorsu', payment_method: 'naqd', amount_paid: 2000000, debt: 500000, has_document: true, registered_by: 'Nilufar', result: 'topshirdi', notes: '', created_at: '2024-03-08' },
  { id: '4', last_name: 'Toshmatov', first_name: 'Doniyor', phone: '+998955556677', total_price: 2500000, course_type: 'tezkor', branch_id: 'novza', branch_name: 'Novza', payment_method: 'perechisleniya', amount_paid: 2500000, debt: 0, has_document: true, registered_by: 'Sherzod', result: 'topshirdi', notes: "A'lo natija", created_at: '2024-03-10' },
  { id: '5', last_name: 'Ergasheva', first_name: 'Zulfia', phone: '+998916667788', total_price: 2500000, course_type: 'tezkor', branch_id: 'samarqand', branch_name: 'Samarqand', payment_method: 'naqd', amount_paid: 500000, debt: 2000000, has_document: false, registered_by: 'Aziz', result: 'yiqildi', notes: 'Hujjat topshirmagan', created_at: '2024-03-12' },
];

const demoStudentsAvto: Student[] = [
  { id: '6', last_name: 'Yusupov', first_name: 'Akmal', phone: '+998901234567', total_price: 6000000, course_type: 'avto_maktab', branch_id: 'minor', branch_name: 'Minor', payment_method: 'naqd', initial_payment: 2000000, second_payment: 2000000, third_payment: 1500000, debt: 500000, group_name: 'B-1', completion_date: '2024-05-15', o83: true, contract_number: 'C-201', has_document: true, registered_by: 'Nilufar', result: 'topshirdi', notes: '', created_at: '2024-03-01' },
  { id: '7', last_name: 'Mirzo', first_name: 'Shahlo', phone: '+998937654321', total_price: 6000000, course_type: 'avto_maktab', branch_id: 'chorsu', branch_name: 'Chorsu', payment_method: 'karta', initial_payment: 1000000, second_payment: 200000, third_payment: 400000, debt: 4400000, group_name: 'B-2', completion_date: '2024-06-01', o83: false, contract_number: 'C-202', has_document: false, registered_by: 'Aziz', result: 'yiqildi', notes: "To'lov muddati o'tgan", created_at: '2024-03-03' },
  { id: '8', last_name: 'Qodirov', first_name: 'Firdavs', phone: '+998945551122', total_price: 6000000, course_type: 'avto_maktab', branch_id: 'minor', branch_name: 'Minor', payment_method: 'naqd', initial_payment: 3000000, second_payment: 2000000, third_payment: 1000000, debt: 0, group_name: 'B-1', completion_date: '2024-05-15', o83: true, contract_number: 'C-203', has_document: true, registered_by: 'Sherzod', result: 'topshirdi', notes: '', created_at: '2024-03-05' },
];

const allDemoStudents = [...demoStudentsTezkor, ...demoStudentsAvto];

export const useStudents = (courseType?: CourseType, branchId?: string) => {
  return useQuery<Student[]>({
    queryKey: ['students', courseType, branchId],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get('/students', { params: { course_type: courseType, branch_id: branchId } });
        return data;
      } catch {
        let filtered = allDemoStudents;
        if (courseType) filtered = filtered.filter((s) => s.course_type === courseType);
        if (branchId) filtered = filtered.filter((s) => s.branch_id === branchId);
        return filtered;
      }
    },
  });
};

export const useCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (student: Partial<Student>) => {
      try {
        const { data } = await axiosInstance.post('/students', student);
        return data;
      } catch {
        // Demo mode: return mock created student
        return { ...student, id: crypto.randomUUID(), created_at: new Date().toISOString() } as Student;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...student }: Partial<Student> & { id: string }) => {
      try {
        const { data } = await axiosInstance.put(`/students/${id}`, student);
        return data;
      } catch {
        return { id, ...student } as Student;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await axiosInstance.delete(`/students/${id}`);
      } catch {
        // Demo mode: silently succeed
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
};
