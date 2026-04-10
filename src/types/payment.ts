import { CourseType, PaymentMethod } from './student';

export interface Payment {
  id: string;
  student_id: string;
  student_name: string;
  branch_id: string;
  branch_name: string;
  course_type: CourseType;
  total_price: number;
  amount_paid: number;
  remaining_debt: number;
  payment_method: PaymentMethod;
  date: string;
  created_at: string;
}

export interface PaymentSummary {
  total_collected: number;
  total_debt: number;
  monthly_income: number;
}
