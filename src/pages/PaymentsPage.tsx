import { useState } from "react";
import { format } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import {
  usePayments,
  usePaymentSummary,
  useCreatePayment,
} from "@/services/paymentService";
import { useStudents } from "@/services/studentService";
import { useBranches } from "@/services/branchService";
import { SummaryCard } from "@/components/ui/SummaryCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PaymentModal, {
  CreatePaymentPayload,
} from "@/components/ui/PaymentModal";
import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Plus,
  Search,
  Users,
  UserX,
  CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDate } from "./StudentsPage";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";

const formatMoney = (n: number) =>
  new Intl.NumberFormat("uz-UZ").format(n) + " so'm";

const PaymentsPage = () => {
  const { isOwner, user } = useAuthStore();
  const [branchId, setBranchId] = useState<string | undefined>(
    isOwner() ? undefined : user?.branch_id || undefined,
  );
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [courseTypeFilter, setCourseTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const { data: payments, isLoading } = usePayments(branchId);
  const hasDebt =
    paymentStatus === "unpaid"
      ? true
      : paymentStatus === "paid"
        ? false
        : undefined;
  const { data: summary } = usePaymentSummary(
    branchId,
    dateFrom ? new Date(dateFrom) : undefined,
    dateTo ? new Date(dateTo) : undefined,
    hasDebt !== undefined ? hasDebt : undefined,
  );
  const { data: branches } = useBranches();

  const { data: tezkorStudents } = useStudents("tezkor", branchId, 1, 200);
  const { data: avtoStudents } = useStudents("avto_maktab", branchId, 1, 200);

  const allStudents = [...(tezkorStudents ?? []), ...(avtoStudents ?? [])];

  const createPayment = useCreatePayment();

  const filtered = (payments || []).filter((p) => {
    const matchSearch = p.student_name
      .toLowerCase()
      .includes(search.toLowerCase());

    let matchStatus = true;
    if (paymentStatus === "paid") matchStatus = p.remaining_debt <= 0;
    else if (paymentStatus === "unpaid") matchStatus = p.remaining_debt > 0;

    let matchPaymentMethod = true;
    if (paymentMethodFilter !== "all") matchPaymentMethod = p.payment_method === paymentMethodFilter;

    let matchCourseType = true;
    if (courseTypeFilter !== "all") matchCourseType = p.course_type === courseTypeFilter;

    let matchDate = true;
    if (dateFrom || dateTo) {
      const pDate = new Date(p.date);
      if (dateFrom && pDate < dateFrom) matchDate = false;
      if (dateTo) {
        const toEnd = new Date(dateTo);
        toEnd.setHours(23, 59, 59, 999);
        if (pDate > toEnd) matchDate = false;
      }
    }

    return matchSearch && matchStatus && matchPaymentMethod && matchCourseType && matchDate;
  });

  const { currentPage, totalPages, paginatedItems, setCurrentPage } =
    usePagination(filtered);

  const paidCount = (payments || []).filter(
    (p) => p.remaining_debt <= 0,
  ).length;
  const unpaidCount = (payments || []).filter(
    (p) => p.remaining_debt > 0,
  ).length;

  const handlePaymentSubmit = (data: CreatePaymentPayload) => {
    createPayment.mutate(data, {
      onSuccess: () => {
        toast.success("To'lov qo'shildi");
        setModalOpen(false);
      },
      onError: () => toast.error("Xatolik yuz berdi"),
    });
  };

  const startIndex = (currentPage - 1) * 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">To'lovlar</h1>
          <p className="text-sm text-muted-foreground">
            Barcha to'lovlarni boshqarish
          </p>
        </div>
        <Button className="gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> To'lov qo'shish
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Jami yig'ilgan"
          value={formatMoney(summary?.total_collected || 0)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <SummaryCard
          title="Jami qarzdorlik"
          value={formatMoney(summary?.total_debt || 0)}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        {isOwner() && (
          <SummaryCard
            title="Bu oylik daromad"
            value={formatMoney(summary?.monthly_income || 0)}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        )}
        <SummaryCard
          title="To'laganlar soni"
          value={String(paidCount)}
          icon={<Users className="h-5 w-5" />}
        />
        <SummaryCard
          title="To'lamaganlar soni"
          value={String(unpaidCount)}
          icon={<UserX className="h-5 w-5" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
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

        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
          <SelectTrigger className="w-40 bg-secondary border-border">
            <SelectValue placeholder="Holati" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hammasi</SelectItem>
            <SelectItem value="paid">To'lagan</SelectItem>
            <SelectItem value="unpaid">To'lamagan</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
          <SelectTrigger className="w-40 bg-secondary border-border">
            <SelectValue placeholder="To'lov turi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hamma</SelectItem>
            <SelectItem value="naqd">Naqd</SelectItem>
            <SelectItem value="karta">Karta</SelectItem>
          </SelectContent>
        </Select>

        <Select value={courseTypeFilter} onValueChange={setCourseTypeFilter}>
          <SelectTrigger className="w-40 bg-secondary border-border">
            <SelectValue placeholder="Kurs turi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hamma</SelectItem>
            <SelectItem value="avto_maktab">Avto maktab</SelectItem>
            <SelectItem value="tezkor">Tezkor</SelectItem>
          </SelectContent>
        </Select>

        {/* Date range */}
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
            placeholder="Talaba ismi..."
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
                  Talaba
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Filial
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Kurs
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Umumiy narx
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  To'langan
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Qoldiq
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Turi
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Sana
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td colSpan={9} className="p-4">
                        <Skeleton className="h-5" />
                      </td>
                    </tr>
                  ))
                : paginatedItems?.map((p, idx) => (
                    <tr
                      key={p.id}
                      className="table-row-striped border-b border-border/50"
                    >
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {startIndex + idx + 1}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {p.student_name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.branch_name}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {p.course_type === "tezkor" ? "Tezkor" : "Avto maktab"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {new Intl.NumberFormat("uz-UZ").format(p.total_price)}
                      </td>
                      <td className="px-4 py-3 text-right text-success">
                        {new Intl.NumberFormat("uz-UZ").format(p.amount_paid)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={
                            p.remaining_debt > 0
                              ? "text-destructive"
                              : "text-success"
                          }
                        >
                          {p.remaining_debt > 0
                            ? new Intl.NumberFormat("uz-UZ").format(
                                p.remaining_debt,
                              )
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs">
                        {p.payment_method === "naqd" ? "Naqd" : "Karta"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(p.date)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {filtered?.length === 0 && !isLoading && (
            <div className="py-12 text-center text-muted-foreground">
              To'lovlar topilmadi
            </div>
          )}
        </div>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handlePaymentSubmit}
        loading={createPayment.isPending}
        students={allStudents}
      />
    </div>
  );
};

export default PaymentsPage;
