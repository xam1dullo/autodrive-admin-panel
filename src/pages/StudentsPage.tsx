import { useState } from "react";
import { format } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
} from "@/services/studentService";
import { useBranches } from "@/services/branchService";
import { useOperators } from "@/services/operatorService";
import { CourseType, Student } from "@/types/student";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import StudentModal from "@/components/ui/StudentModal";
import { Plus, Search, Pencil, Trash2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";

const formatMoney = (n: number) => new Intl.NumberFormat("uz-UZ").format(n);

export const formatDate = (d: string) => {
  try {
    if (!d) return "—";
    const date = new Date(d);
    return format(date, "dd.MM.yyyy");
  } catch {
    return d;
  }
};

const StudentsPage = () => {
  const { isOwner, user } = useAuthStore();
  const [courseType, setCourseType] = useState<CourseType>("tezkor");
  const [branchId, setBranchId] = useState<string | undefined>(
    isOwner() ? undefined : user?.branch_id || undefined,
  );
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const { data: students, isLoading } = useStudents(
    courseType,
    branchId,
    1,
    200,
  );
  const { data: branches } = useBranches();
  const { data: operators } = useOperators();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  const filtered = (students || []).filter((s) => {
    const matchSearch =
      s?.last_name?.toLowerCase().includes(search?.toLowerCase()) ||
      s?.first_name?.toLowerCase().includes(search?.toLowerCase()) ||
      s?.phone?.includes(search);

    let matchDate = true;
    if (dateFrom || dateTo) {
      const created = new Date(s.created_at);
      if (dateFrom && created < dateFrom) matchDate = false;
      if (dateTo) {
        const toEnd = new Date(dateTo);
        toEnd.setHours(23, 59, 59, 999);
        if (created > toEnd) matchDate = false;
      }
    }
    return matchSearch && matchDate;
  });

  const { currentPage, totalPages, paginatedItems, setCurrentPage } =
    usePagination(filtered);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Talaba o'chirildi");
        setDeleteId(null);
      },
      onError: () => toast.error("Xatolik yuz berdi"),
    });
  };

  const handleModalSubmit = (data: Partial<Student>) => {
    if (editStudent) {
      updateMutation.mutate({ ...data, id: editStudent.id } as Student, {
        onSuccess: () => {
          toast.success("Talaba yangilandi");
          closeModal();
        },
        onError: () => toast.error("Xatolik yuz berdi"),
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Talaba qo'shildi");
          closeModal();
        },
        onError: () => toast.error("Xatolik yuz berdi"),
      });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditStudent(null);
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    setModalOpen(true);
  };
  const openCreate = () => {
    setEditStudent(null);
    setModalOpen(true);
  };

  // Calculate the starting index for current page
  const startIndex = (currentPage - 1) * 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Talabalar</h1>
          <p className="text-sm text-muted-foreground">
            {filtered?.length || 0} ta talaba topildi
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Talaba qo'shish
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          value={courseType}
          onValueChange={(v) => setCourseType(v as CourseType)}
        >
          <TabsList className="bg-secondary">
            <TabsTrigger value="tezkor">Tezkor</TabsTrigger>
            <TabsTrigger value="avto_maktab">Avto maktab</TabsTrigger>
          </TabsList>
        </Tabs>
        {isOwner() && (
          <Select
            value={branchId || "all"}
            onValueChange={(v) => setBranchId(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-40 bg-secondary border-border">
              <SelectValue placeholder="Filial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barchasi</SelectItem>
              {(branches || []).map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Date range filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal bg-secondary border-border",
                !dateFrom && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "dd.MM.yyyy") : "Dan"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={setDateFrom}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal bg-secondary border-border",
                !dateTo && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "dd.MM.yyyy") : "Gacha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={setDateTo}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {(dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDateFrom(undefined);
              setDateTo(undefined);
            }}
          >
            Tozalash
          </Button>
        )}

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ism, familya yoki telefon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  #
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Familya
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Ismi
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Telefon
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Kurs narxi
                </th>
                {courseType === "tezkor" ? (
                  <>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      To'lov
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Qarzdorlik
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      Tulov turi
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Guruh
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      Dakument
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Operator
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      Natijasi
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Izoh
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Bosh. tulov
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      2-tulov
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      3-tulov
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Qarzdorlik
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      Tulov turi
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Guruh
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Tugatish
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      O83
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Shartnoma
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      Dakument
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Operator
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      Natijasi
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Izoh
                    </th>
                  </>
                )}
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Sana
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td colSpan={16} className="p-4">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                : paginatedItems?.map((s, idx) => (
                    <tr
                      key={s.id}
                      className="table-row-striped border-b border-border/50"
                    >
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {startIndex + idx + 1}
                      </td>
                      <td className="px-4 py-3 font-medium">{s.last_name}</td>
                      <td className="px-4 py-3">{s.first_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.phone}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatMoney(s.total_price)}
                      </td>
                      {courseType === "tezkor" ? (
                        <>
                          <td className="px-4 py-3 text-right">
                            {formatMoney(s.amount_paid || 0)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={
                                s.debt > 0 ? "text-destructive" : "text-success"
                              }
                            >
                              {s.debt > 0 ? formatMoney(s.debt) : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-xs">
                            {s.payment_method === "naqd"
                              ? "Naqd"
                              : s.payment_method === "karta"
                                ? "Karta"
                                : "Transfer"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {s.group_name || "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={
                                s.has_document
                                  ? "text-success"
                                  : "text-destructive"
                              }
                            >
                              {s.has_document ? "+" : "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {s.registered_by}
                          </td>
                          <td className="px-4 py-3 text-center">{s.result}</td>
                          <td className="px-4 py-3 text-muted-foreground max-w-[120px] truncate">
                            {s.notes}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-right">
                            {formatMoney(s.initial_payment || 0)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatMoney(s.second_payment || 0)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatMoney(s.third_payment || 0)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={
                                s.debt > 0 ? "text-destructive" : "text-success"
                              }
                            >
                              {s.debt > 0 ? formatMoney(s.debt) : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-xs">
                            {s.payment_method === "naqd"
                              ? "Naqd"
                              : s.payment_method === "karta"
                                ? "Karta"
                                : "Transfer"}
                          </td>
                          <td className="px-4 py-3">{s.group_name}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDate(s.completion_date)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={
                                s.o83 ? "text-success" : "text-destructive"
                              }
                            >
                              {s.o83 ? "+" : "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {s.contract_number}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={
                                s.has_document
                                  ? "text-success"
                                  : "text-destructive"
                              }
                            >
                              {s.has_document ? "+" : "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {s.registered_by}
                          </td>
                          <td className="px-4 py-3 text-center">{s.result}</td>
                          <td className="px-4 py-3 text-muted-foreground max-w-[120px] truncate">
                            {s.notes}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(s.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(s)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {isOwner() && (
                            <button
                              onClick={() => setDeleteId(s.id)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {filtered?.length === 0 && !isLoading && (
            <div className="py-12 text-center text-muted-foreground">
              Talabalar topilmadi
            </div>
          )}
        </div>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <StudentModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        student={editStudent}
        courseType={courseType}
        operators={operators || []}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default StudentsPage;
