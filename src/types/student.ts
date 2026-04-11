export type CourseType = 'tezkor' | 'avto_maktab';
export type PaymentMethod = 'naqd' | 'karta' | 'perechisleniya';
export type ResultStatus = 'oqimoqda' | 'topshirdi' | 'yiqildi';

export interface Student {
  id: string;
  last_name: string;
  first_name: string;
  phone: string;
  total_price: number;
  course_type: CourseType;
  branch_id: string;
  branch_name?: string;
  payment_method: PaymentMethod;
  debt: number;
  has_document: boolean;
  registered_by?: string;
  result: ResultStatus;
  notes?: string;
  created_at: string;
  status?: string;

  // Tezkor only
  amount_paid?: number;

  // Avto maktab only
  initial_payment?: number;
  second_payment?: number;
  third_payment?: number;
  group_name?: string;
  group_id?: string;
  completion_date?: string;
  o83?: boolean;
  contract_number?: string;
}
