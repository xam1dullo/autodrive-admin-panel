import { useState, useEffect } from "react";
import {
  Student,
  CourseType,
  PaymentMethod,
  ResultStatus,
} from "@/types/student";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/authStore";
import { useBranches } from "@/services/branchService";
import { useGroups } from "@/services/groupService";
import { User } from "@/types/user";

export interface CreateStudentPayload {
  first_name: string;
  last_name: string;
  phone: string;
  course_type: CourseType;
  total_price: number;
  amount_paid?: number;
  initial_payment?: number;
  payment_method?: PaymentMethod;
  group_id?: string;
  branch_id?: string;
  completion_date?: string;
  contract_number?: string;
  o83?: boolean;
  has_document?: boolean;
  result?: ResultStatus;
  notes?: string;
  status?: string;
  registeredBy?: string;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  naqd: "Naqd",
  karta: "Karta",
  perechisleniya: "Perechileniya",
};

const resultLabels: Record<ResultStatus, string> = {
  oqimoqda: "Oqimoqda",
  topshirdi: "Topshirdi",
  yiqildi: "Yiqildi",
};

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStudentPayload) => void;
  loading?: boolean;
  student?: Student | null;
  courseType: CourseType;
  operators?: User[];
}

const StudentModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  student,
  courseType,
  operators = [],
}: StudentModalProps) => {
  const { isOwner, user } = useAuthStore();
  const { data: branches } = useBranches();
  const { data: groups } = useGroups();

  const branchList = branches || [];
  // Show all groups regardless of branch for managers (cross-branch assignment)
  const groupList = (groups || []).filter(
    (g) => g.course_type === courseType || !g.course_type,
  );

  const defaultForm = (): CreateStudentPayload => ({
    first_name: "",
    last_name: "",
    phone: "",
    course_type: courseType,
    branch_id: isOwner() ? "" : user?.branch_id || "",
    payment_method: "naqd",
    result: "oqimoqda",
    has_document: false,
    o83: false,
    total_price: courseType === "tezkor" ? 2500000 : 6000000,
    amount_paid: 0,
    initial_payment: 0,
    group_id: "",
    status: "active",
    registeredBy: "",
  });

  const [form, setForm] = useState<CreateStudentPayload>(defaultForm());
  const [debt, setDebt] = useState(0);

  useEffect(() => {
    if (open) {
      if (student) {
        setForm({
          first_name: student.first_name,
          last_name: student.last_name,
          phone: student.phone,
          course_type: student.course_type,
          branch_id: student.branch_id,
          payment_method: student.payment_method,
          result: student.result,
          has_document: student.has_document,
          o83: student.o83,
          total_price: student.total_price,
          amount_paid: student.amount_paid || 0,
          initial_payment: student.initial_payment || 0,
          group_id: student.group_id || "",
          completion_date: student.completion_date,
          contract_number: student.contract_number,
          notes: student.notes,
          status: student.status || "active",
          registeredBy: student.registered_by || "",
        });
      } else {
        setForm(defaultForm());
      }
    }
  }, [student, courseType, open]);

  useEffect(() => {
    const total = form.total_price || 0;
    const paid =
      courseType === "tezkor"
        ? form.amount_paid || 0
        : form.initial_payment || 0;
    setDebt(Math.max(0, total - paid));
  }, [form.total_price, form.amount_paid, form.initial_payment, courseType]);

  const set = <K extends keyof CreateStudentPayload>(
    key: K,
    value: CreateStudentPayload[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));
  const setNum = (key: keyof CreateStudentPayload, value: string) =>
    set(key, (value === "" ? 0 : Number(value)) as any);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseType === "avto_maktab" && !form.group_id?.trim()) {
      alert("Avto maktab kursi uchun Guruh tanlash shart!");
      return;
    }

    const payload: CreateStudentPayload = {
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      course_type: courseType,
      total_price: form.total_price,
      payment_method: form.payment_method,
      branch_id: form.branch_id || undefined,
      result: form.result,
      has_document: form.has_document,
      notes: form.notes || undefined,
      status: form.status || "active",
      registeredBy: form.registeredBy || undefined,
    };

    if (courseType === "tezkor") {
      payload.amount_paid = form.amount_paid || 0;
      payload.group_id = form.group_id || undefined;
    } else {
      payload.initial_payment = form.initial_payment || 0;
      payload.group_id = form.group_id || undefined;
      payload.completion_date = form.completion_date || undefined;
      payload.contract_number = form.contract_number || undefined;
      payload.o83 = form.o83;
    }
    onSubmit(payload);
  };

  const formatMoney = (n: number) => new Intl.NumberFormat("uz-UZ").format(n);
  const currentBranchName =
    branchList.find((b) => b.id === form.branch_id)?.name ||
    form.branch_id ||
    "";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {student ? "Talabani tahrirlash" : "Yangi talaba qo'shish"}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({courseType === "tezkor" ? "Tezkor" : "Avto maktab"})
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Familya *</Label>
              <Input
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                required
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Ismi *</Label>
              <Input
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                required
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefon *</Label>
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                required
                placeholder="+998901234567"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Filial</Label>
              {isOwner() ? (
                <Select
                  value={form.branch_id || ""}
                  onValueChange={(v) => set("branch_id", v)}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {branchList.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={currentBranchName}
                  disabled
                  className="bg-muted border-border"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kurs narxi *</Label>
              <Input
                type="number"
                value={form.total_price}
                onChange={(e) => setNum("total_price", e.target.value)}
                required
                min={0}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>To'lov turi</Label>
              <Select
                value={form.payment_method || "naqd"}
                onValueChange={(v) => set("payment_method", v as PaymentMethod)}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(paymentMethodLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {courseType === "tezkor" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>To'lov miqdori</Label>
                  <Input
                    type="number"
                    value={form.amount_paid || ""}
                    onChange={(e) => setNum("amount_paid", e.target.value)}
                    min={0}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qarzdorlik</Label>
                  <Input
                    value={formatMoney(debt)}
                    disabled
                    className="bg-muted border-border text-destructive font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Guruh</Label>
                  <Select
                    value={form.group_id || ""}
                    onValueChange={(v) => set("group_id", v)}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {groupList.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name} 
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Boshlang'ich to'lov</Label>
                  <Input
                    type="number"
                    value={form.initial_payment || ""}
                    onChange={(e) => setNum("initial_payment", e.target.value)}
                    min={0}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qarzdorlik</Label>
                  <Input
                    value={formatMoney(debt)}
                    disabled
                    className="bg-muted border-border text-destructive font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>
                    Guruh <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.group_id || ""}
                    onValueChange={(v) => set("group_id", v)}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {groupList.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tugatish sanasi</Label>
                  <Input
                    type="date"
                    value={form.completion_date || ""}
                    onChange={(e) => set("completion_date", e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shartnoma raqami</Label>
                  <Input
                    value={form.contract_number || ""}
                    onChange={(e) => set("contract_number", e.target.value)}
                    placeholder="C-201"
                    className="bg-secondary border-border"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={form.o83 || false}
                  onCheckedChange={(v) => set("o83", !!v)}
                  id="o83"
                />
                <Label htmlFor="o83">O83</Label>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Operator</Label>
              <Select
                value={form.registeredBy || ""}
                onValueChange={(v) => set("registeredBy", v)}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Operator tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((op) => (
                    <SelectItem key={op.id} value={op.name || op.id}>
                      {op.name || op.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Natijasi</Label>
              <Select
                value={form.result || "oqimoqda"}
                onValueChange={(v) => set("result", v as ResultStatus)}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(resultLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.has_document || false}
              onCheckedChange={(v) => set("has_document", !!v)}
              id="doc"
            />
            <Label htmlFor="doc">Hujjat mavjud</Label>
          </div>

          <div className="space-y-2">
            <Label>Izoh</Label>
            <Textarea
              value={form.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Izoh yozing..."
              rows={3}
              className="bg-secondary border-border"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saqlanmoqda..." : student ? "Saqlash" : "Qo'shish"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentModal;
