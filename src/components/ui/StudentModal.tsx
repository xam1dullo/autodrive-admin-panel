import { useState, useEffect } from 'react';
import { Student, CourseType, PaymentMethod, ResultStatus } from '@/types/student';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/store/authStore';
import { useBranches } from '@/services/branchService';

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Student>) => void;
  loading?: boolean;
  student?: Student | null;
  courseType: CourseType;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  naqd: 'Naqd',
  karta: 'Karta',
  perechisleniya: "Perechileniya",
};

const resultLabels: Record<ResultStatus, string> = {
  kutilmoqda: 'Kutilmoqda',
  topshirdi: 'Topshirdi',
  yiqildi: "Yiqildi",
};

const StudentModal = ({ open, onClose, onSubmit, loading, student, courseType }: StudentModalProps) => {
  const { isOwner, user } = useAuthStore();
  const { data: branches } = useBranches();

  const [form, setForm] = useState<Partial<Student>>({
    course_type: courseType,
    branch_id: isOwner() ? '' : user?.branch_id || '',
    payment_method: 'naqd',
    result: 'kutilmoqda',
    has_document: false,
    total_price: courseType === 'tezkor' ? 2500000 : 6000000,
  });

  useEffect(() => {
    if (student) {
      setForm({ ...student });
    } else {
      setForm({
        course_type: courseType,
        branch_id: isOwner() ? '' : user?.branch_id || '',
        payment_method: 'naqd',
        result: 'kutilmoqda',
        has_document: false,
        total_price: courseType === 'tezkor' ? 2500000 : 6000000,
      });
    }
  }, [student, courseType, open]);

  // Auto-calculate debt
  useEffect(() => {
    const total = form.total_price || 0;
    let paid = 0;
    if (courseType === 'tezkor') {
      paid = form.amount_paid || 0;
    } else {
      paid = (form.initial_payment || 0) + (form.second_payment || 0) + (form.third_payment || 0);
    }
    setForm((prev) => ({ ...prev, debt: Math.max(0, total - paid) }));
  }, [form.total_price, form.amount_paid, form.initial_payment, form.second_payment, form.third_payment, courseType]);

  const set = (key: keyof Student, value: any) => setForm((prev) => ({ ...prev, [key]: value }));
  const setNum = (key: keyof Student, value: string) => set(key, value === '' ? 0 : Number(value));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const formatMoney = (n: number) => new Intl.NumberFormat('uz-UZ').format(n);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {student ? "Talabani tahrirlash" : "Yangi talaba qo'shish"}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({courseType === 'tezkor' ? 'Tezkor' : 'Avto maktab'})
            </span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Familya</Label>
              <Input value={form.last_name || ''} onChange={(e) => set('last_name', e.target.value)} required className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Ismi</Label>
              <Input value={form.first_name || ''} onChange={(e) => set('first_name', e.target.value)} required className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} required placeholder="+998..." className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Filial</Label>
              {isOwner() ? (
                <Select value={form.branch_id || ''} onValueChange={(v) => set('branch_id', v)}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent>
                    {branches?.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={branches?.find((b) => b.id === form.branch_id)?.name || form.branch_id || ''} disabled className="bg-muted border-border" />
              )}
            </div>
          </div>

          {/* Payment info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kurs umumiy narxi</Label>
              <Input type="number" value={form.total_price || ''} onChange={(e) => setNum('total_price', e.target.value)} required className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Tulov turi</Label>
              <Select value={form.payment_method || 'naqd'} onValueChange={(v) => set('payment_method', v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(paymentMethodLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {courseType === 'tezkor' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>To'lov</Label>
                <Input type="number" value={form.amount_paid || ''} onChange={(e) => setNum('amount_paid', e.target.value)} className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label>Qarzdorlik</Label>
                <Input value={formatMoney(form.debt || 0)} disabled className="bg-muted border-border text-destructive" />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Boshlang'ich tulov</Label>
                  <Input type="number" value={form.initial_payment || ''} onChange={(e) => setNum('initial_payment', e.target.value)} className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>2-tulov</Label>
                  <Input type="number" value={form.second_payment || ''} onChange={(e) => setNum('second_payment', e.target.value)} className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>3-tulov</Label>
                  <Input type="number" value={form.third_payment || ''} onChange={(e) => setNum('third_payment', e.target.value)} className="bg-secondary border-border" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Qarzdorlik</Label>
                  <Input value={formatMoney(form.debt || 0)} disabled className="bg-muted border-border text-destructive" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Guruh</Label>
                  <Input value={form.group_name || ''} onChange={(e) => set('group_name', e.target.value)} placeholder="B-1" className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Tugatish sanasi</Label>
                  <Input type="date" value={form.completion_date || ''} onChange={(e) => set('completion_date', e.target.value)} className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Shartnoma raqami</Label>
                  <Input value={form.contract_number || ''} onChange={(e) => set('contract_number', e.target.value)} placeholder="C-201" className="bg-secondary border-border" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.o83 || false} onCheckedChange={(v) => set('o83', !!v)} id="o83" />
                <Label htmlFor="o83">O83</Label>
              </div>
            </>
          )}

          {/* Common fields */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Checkbox checked={form.has_document || false} onCheckedChange={(v) => set('has_document', !!v)} id="doc" />
              <Label htmlFor="doc">Dakument</Label>
            </div>
            <div className="space-y-2">
              <Label>Operator</Label>
              <Input value={form.registered_by || ''} onChange={(e) => set('registered_by', e.target.value)} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Natijasi</Label>
              <Select value={form.result || 'kutilmoqda'} onValueChange={(v) => set('result', v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(resultLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Izoh</Label>
            <Textarea value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} placeholder="Izoh yozing..." className="bg-secondary border-border" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Bekor qilish</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saqlanmoqda...' : student ? 'Saqlash' : "Qo'shish"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentModal;
