import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  KeyRound,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";
import { extractErrorMessage } from "@/lib/errors";
import { formatPhone } from "@/lib/phoneFormater";
import { validateNewPassword } from "@/lib/password";
import { User, UserRole } from "@/types/user";
import { DataCard } from "@/components/ui/DataCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCompanies } from "@/services/companyService";
import {
  useCreatePlatformUser,
  useDeletePlatformUser,
  usePlatformUsers,
  useResetPlatformUserPassword,
  useUpdatePlatformUser,
} from "@/services/platformUserService";

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd.MM.yyyy");
  } catch {
    return d;
  }
};

const ROLE_LABEL: Record<UserRole, string> = {
  dev: "Dev",
  owner: "Owner",
  manager: "Manager",
  operator: "Operator",
  teacher: "Teacher",
};

const ROLE_BADGE: Record<UserRole, string> = {
  dev: "bg-primary/10 text-primary",
  owner: "bg-primary/10 text-primary",
  manager: "bg-blue-500/10 text-blue-500",
  operator: "bg-amber-500/10 text-amber-600",
  teacher: "bg-emerald-500/10 text-emerald-600",
};

interface FormState {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  companyId: string;
  branchId: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "manager",
  companyId: "",
  branchId: "",
};

const PlatformUsersPage = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof User>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data, isLoading } = usePlatformUsers({
    search: search || undefined,
    role: roleFilter === "all" ? undefined : roleFilter,
    companyId: companyFilter === "all" ? undefined : companyFilter,
    limit: 100,
  });
  const { data: companiesData } = useCompanies({ limit: 100 });
  const companies = companiesData?.items ?? [];

  const createMut = useCreatePlatformUser();
  const updateMut = useUpdatePlatformUser();
  const deleteMut = useDeletePlatformUser();
  const resetMut = useResetPlatformUserPassword();

  const items = data?.items ?? [];

  const toggleSort = (field: keyof User) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = [...items].sort((a, b) => {
    const va = a[sortField];
    const vb = b[sortField];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === "string" && typeof vb === "string") {
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return sortDir === "asc" ? (va < vb ? -1 : va > vb ? 1 : 0) : va > vb ? -1 : va < vb ? 1 : 0;
  });

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination(sorted);
  const startIndex = (currentPage - 1) * 10;

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditItem(u);
    setForm({
      name: u.name ?? "",
      email: u.email,
      password: "",
      phone: u.phone ?? "",
      role: u.role,
      companyId: u.company_id ?? "",
      branchId: u.branch_id ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    if (editItem) {
      updateMut.mutate(
        {
          id: editItem.id,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          role: form.role,
          companyId: form.companyId || undefined,
          branchId: form.branchId || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Foydalanuvchi yangilandi");
            setModalOpen(false);
          },
          onError: (err) => toast.error(extractErrorMessage(err)),
        },
      );
    } else {
      const policyError = validateNewPassword(form.password);
      if (policyError) {
        toast.error(policyError);
        return;
      }
      createMut.mutate(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
          role: form.role,
          companyId: form.companyId || undefined,
          branchId: form.branchId || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Foydalanuvchi qo'shildi");
            setModalOpen(false);
          },
          onError: (err) => toast.error(extractErrorMessage(err)),
        },
      );
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMut.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Foydalanuvchi o'chirildi");
        setDeleteId(null);
      },
      onError: (err) => toast.error(extractErrorMessage(err)),
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    const policyError = validateNewPassword(newPassword);
    if (policyError) {
      toast.error(policyError);
      return;
    }
    resetMut.mutate(
      { id: resetTarget.id, password: newPassword },
      {
        onSuccess: () => {
          toast.success("Parol yangilandi");
          setResetTarget(null);
          setNewPassword("");
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
      },
    );
  };

  const showCompanyField = form.role !== "dev";
  const showBranchField = form.role === "manager" || form.role === "operator" || form.role === "teacher";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Platforma foydalanuvchilari</h1>
          <p className="text-sm text-muted-foreground">{items.length} ta foydalanuvchi</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Foydalanuvchi qo'shish
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ism, email yoki telefon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "all")}>
          <SelectTrigger className="w-44 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha rollar</SelectItem>
            <SelectItem value="dev">Dev</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="operator">Operator</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
          </SelectContent>
        </Select>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-56 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha kompaniyalar</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  <button
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Ism
                    {sortField === "name" ? (
                      sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telefon</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Rol</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kompaniya</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Filial</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  <button
                    onClick={() => toggleSort("created_at")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Yaratilgan
                    {sortField === "created_at" ? (
                      sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td colSpan={9} className="p-4">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                : paginatedItems.map((u, idx) => (
                    <tr key={u.id} className="table-row-striped border-b border-border/50">
                      <td className="px-4 py-3 text-center text-muted-foreground">{startIndex + idx + 1}</td>
                      <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatPhone(u.phone)}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role]}`}
                        >
                          {ROLE_LABEL[u.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.company_name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.branch_name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setResetTarget(u);
                              setNewPassword("");
                            }}
                            title="Parolni yangilash"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openEdit(u)}
                            title="Tahrirlash"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(u.id)}
                            title="O'chirish"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {items.length === 0 && !isLoading && (
            <EmptyState
              icon={KeyRound}
              title="Foydalanuvchi topilmadi"
              description="Tanlangan filtrlar bo'yicha foydalanuvchilar yo'q."
            />
          )}
        </div>

        {/* Mobile card list */}
        <div className="md:hidden p-3">
          {isLoading ? (
            <div className="grid gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={KeyRound}
              title="Foydalanuvchi topilmadi"
              description="Tanlangan filtrlar bo'yicha foydalanuvchilar yo'q."
            />
          ) : (
            <div className="grid gap-3">
              {paginatedItems.map((u) => (
                <DataCard
                  key={u.id}
                  title={u.name || "—"}
                  subtitle={u.email}
                  fields={[
                    {
                      label: "Rol",
                      value: (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role]}`}
                        >
                          {ROLE_LABEL[u.role]}
                        </span>
                      ),
                    },
                    { label: "Kompaniya", value: u.company_name || "—" },
                    { label: "Filial", value: u.branch_name || "—" },
                    { label: "Yaratilgan", value: formatDate(u.created_at) },
                  ]}
                  actions={
                    <>
                      <button
                        onClick={() => {
                          setResetTarget(u);
                          setNewPassword("");
                        }}
                        title="Parolni yangilash"
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openEdit(u)}
                        title="Tahrirlash"
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(u.id)}
                        title="O'chirish"
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Dialog open={modalOpen} onOpenChange={(o) => !o && setModalOpen(false)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editItem ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi qo'shish"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Ism *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="bg-secondary border-border"
              />
            </div>
            {!editItem && (
              <div className="space-y-2">
                <Label>Parol *</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  minLength={8}
                  placeholder="8+ belgi, raqam va katta harf"
                  className="bg-secondary border-border"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+998..."
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Rol *</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    role: v as UserRole,
                    companyId: v === "dev" ? "" : f.companyId,
                    branchId: v === "dev" || v === "owner" ? "" : f.branchId,
                  }))
                }
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">Dev</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showCompanyField && (
              <div className="space-y-2">
                <Label>Kompaniya {form.role !== "dev" ? "*" : ""}</Label>
                <Select
                  value={form.companyId}
                  onValueChange={(v) => setForm((f) => ({ ...f, companyId: v }))}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {showBranchField && (
              <div className="space-y-2">
                <Label>Filial ID</Label>
                <Input
                  value={form.branchId}
                  onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
                  placeholder="UUID"
                  className="bg-secondary border-border"
                />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {createMut.isPending || updateMut.isPending
                  ? "Saqlanmoqda..."
                  : editItem
                    ? "Saqlash"
                    : "Qo'shish"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!resetTarget}
        onOpenChange={(o) => {
          if (!o) {
            setResetTarget(null);
            setNewPassword("");
          }
        }}
      >
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">Parolni yangilash</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{resetTarget?.name || resetTarget?.email}</span>{" "}
              uchun yangi parol kiriting.
            </p>
            <div className="space-y-2">
              <Label>Yangi parol *</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="8+ belgi, raqam va katta harf"
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setResetTarget(null);
                  setNewPassword("");
                }}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={resetMut.isPending}>
                {resetMut.isPending ? "Yangilanmoqda..." : "Yangilash"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteMut.isPending}
      />
    </div>
  );
};

export default PlatformUsersPage;
