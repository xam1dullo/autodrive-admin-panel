import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Briefcase,
  CheckCircle2,
  Clock,
  CreditCard,
  GraduationCap,
  KeyRound,
  Layers,
  Mail,
  PauseCircle,
  Pencil,
  Phone,
  UserCog,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
  useApproveCompany,
  useCompany,
  useSuspendCompany,
} from "@/services/companyService";
import { usePlatformUsers } from "@/services/platformUserService";
import { useBranches } from "@/services/branchService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataCard } from "@/components/ui/DataCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CompanyStatus } from "@/types/company";
import { UserRole } from "@/types/user";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/errors";

const statusVariant: Record<CompanyStatus, "default" | "secondary" | "destructive"> = {
  active: "default",
  pending: "secondary",
  suspended: "destructive",
};

const roleLabel: Record<UserRole, string> = {
  dev: "Platforma admin",
  owner: "Egasi",
  manager: "Manager",
  operator: "Operator",
  teacher: "O'qituvchi",
};

const StatTile = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: number | string;
}) => (
  <Card className="flex items-center gap-3 p-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="min-w-0">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-xl font-semibold text-foreground">{value}</div>
    </div>
  </Card>
);

const CompanyDetailPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setActiveCompanyId = useAuthStore((s) => s.setActiveCompanyId);
  const { data: company, isLoading } = useCompany(id);
  const { data: users, isLoading: usersLoading } = usePlatformUsers({
    companyId: id,
    limit: 100,
  });
  const { data: branches, isLoading: branchesLoading } = useBranches({
    companyId: id,
  });
  const approve = useApproveCompany();
  const suspend = useSuspendCompany();
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!company) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Kompaniya topilmadi"
        description="Bu ID bilan kompaniya yo'q yoki o'chirib yuborilgan."
        action={{ label: "Kompaniyalarga qaytish", onClick: () => navigate("/kompaniyalar") }}
      />
    );
  }

  const handleApprove = async () => {
    try {
      await approve.mutateAsync(id);
      toast.success("Kompaniya tasdiqlandi");
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setConfirmApprove(false);
    }
  };

  const handleSuspend = async () => {
    try {
      await suspend.mutateAsync(id);
      toast.success("Kompaniya bloklandi");
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setConfirmSuspend(false);
    }
  };

  const handleViewAs = () => {
    setActiveCompanyId(id);
    toast.success(`Endi "${company.name}" sifatida ko'rmoqdasiz`);
    navigate("/dashboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            to="/kompaniyalar"
            className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Orqaga"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-heading text-2xl font-bold text-foreground">
                {company.name}
              </h1>
              <Badge variant={statusVariant[company.status]}>{company.status}</Badge>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">slug: {company.slug}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleViewAs}>
            Bu kompaniya sifatida ko'rish
          </Button>
          {company.status !== "active" && (
            <Button size="sm" onClick={() => setConfirmApprove(true)}>
              <CheckCircle2 className="mr-1 h-4 w-4" /> Tasdiqlash
            </Button>
          )}
          {company.status === "active" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmSuspend(true)}
            >
              <PauseCircle className="mr-1 h-4 w-4" /> Bloklash
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate("/kompaniyalar")}>
            <Pencil className="mr-1 h-4 w-4" /> Tahrirlash
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Umumiy</TabsTrigger>
          <TabsTrigger value="branches">Filiallar</TabsTrigger>
          <TabsTrigger value="users">Foydalanuvchilar</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <StatTile icon={Building2} label="Filiallar" value={company.stats?.branches ?? 0} />
            <StatTile icon={Users} label="Foydalanuvchilar" value={company.stats?.users ?? 0} />
            <StatTile icon={GraduationCap} label="Talabalar" value={company.stats?.students ?? 0} />
            <StatTile icon={CreditCard} label="To'lovlar" value={company.stats?.payments ?? 0} />
          </div>

          <Card className="p-4">
            <h2 className="mb-3 font-heading text-sm font-semibold text-foreground">
              Aloqa va metadata
            </h2>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <dt className="text-muted-foreground">Telefon:</dt>
                <dd className="text-foreground">{company.contact_phone ?? "—"}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <dt className="text-muted-foreground">Email:</dt>
                <dd className="text-foreground">{company.contact_email ?? "—"}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <dt className="text-muted-foreground">Yaratilgan:</dt>
                <dd className="text-foreground">
                  {format(new Date(company.created_at), "dd-MMM-yyyy HH:mm")}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <dt className="text-muted-foreground">Yangilangan:</dt>
                <dd className="text-foreground">
                  {format(new Date(company.updated_at), "dd-MMM-yyyy HH:mm")}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-4">
            <h2 className="mb-2 font-heading text-sm font-semibold text-foreground">
              Tez harakatlar
            </h2>
            <p className="text-sm text-muted-foreground">
              Filial yoki to'lovlar bo'yicha ishlash uchun yuqorida "Bu kompaniya
              sifatida ko'rish" tugmasini bosing — topbar'dagi kompaniya tanlovi
              avtomatik shu kompaniyaga o'tadi va barcha sahifalarda data filtrlanadi.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="space-y-3">
          {branchesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !branches || branches.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Filiallar yo'q"
              description="Bu kompaniyaga hali filial qo'shilmagan."
            />
          ) : (
            <div className="grid gap-3">
              {branches.map((b) => (
                <DataCard
                  key={b.id}
                  title={b.name}
                  subtitle={b.location}
                  fields={[
                    { label: "Menejer", value: b.manager_name ?? "—" },
                    { label: "Faol talabalar", value: b.active_students ?? 0 },
                    {
                      label: "Yaratilgan",
                      value: b.created_at
                        ? format(new Date(b.created_at), "dd-MMM-yyyy")
                        : "—",
                    },
                  ]}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-3">
          {usersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !users || users.items.length === 0 ? (
            <EmptyState
              icon={UserCog}
              title="Foydalanuvchilar yo'q"
              description="Bu kompaniyaga hali hech kim biriktirilmagan."
              action={{
                label: "Platform Users sahifasiga o'tish",
                onClick: () => navigate("/platform-foydalanuvchilar"),
              }}
            />
          ) : (
            <div className="grid gap-3">
              {users.items.map((u) => (
                <DataCard
                  key={u.id}
                  title={u.name || u.email}
                  subtitle={u.email}
                  fields={[
                    { label: "Rol", value: roleLabel[u.role] ?? u.role },
                    { label: "Filial", value: u.branch_name ?? "—" },
                    { label: "Telefon", value: u.phone ?? "—" },
                    {
                      label: "Yaratilgan",
                      value: u.created_at
                        ? format(new Date(u.created_at), "dd-MMM-yyyy")
                        : "—",
                    },
                  ]}
                  actions={
                    <Link
                      to="/platform-foydalanuvchilar"
                      aria-label="Foydalanuvchini tahrirlash"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Link>
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-3">
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-heading text-sm font-semibold text-foreground">
                Audit jurnali
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Audit log to'liq tarixini ko'rish uchun{' '}
              <Button
                variant="link"
                className="h-auto p-0 align-baseline"
                onClick={() => {
                  setActiveCompanyId(id);
                  navigate("/audit");
                }}
              >
                /audit sahifasiga o'ting
              </Button>
              . Topbar'dagi kompaniya tanlovi bu kompaniyaga o'tadi va audit
              avtomatik filtrlanadi.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        title="Kompaniyani tasdiqlash"
        description={`"${company.name}" kompaniyasini "active" holatiga o'tkazasizmi?`}
        onConfirm={handleApprove}
        loading={approve.isPending}
      />
      <ConfirmDialog
        open={confirmSuspend}
        onClose={() => setConfirmSuspend(false)}
        title="Kompaniyani bloklash"
        description={`"${company.name}" kompaniyasini "suspended" holatiga o'tkazasizmi? Foydalanuvchilar login qila olmaydi.`}
        onConfirm={handleSuspend}
        loading={suspend.isPending}
      />
    </div>
  );
};

export default CompanyDetailPage;
