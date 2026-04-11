import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useDashboardAnalytics } from "@/services/dashboardService";
import { useBranches } from "@/services/branchService";
import { SummaryCard } from "@/components/ui/SummaryCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap,
  DollarSign,
  AlertTriangle,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { CourseType } from "@/types/student";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["hsl(217, 85%, 63%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)"];

const formatSum = (n: number) =>
  new Intl.NumberFormat("uz-UZ").format(n) + " so'm";

const DashboardPage = () => {
  const { isOwner, user } = useAuthStore();
  const [courseType, setCourseType] = useState<CourseType | undefined>();
  const [branchId, setBranchId] = useState<string | undefined>(
    isOwner() ? undefined : user?.branch_id || undefined,
  );
  const { data: analytics, isLoading } = useDashboardAnalytics(branchId, courseType);
  const { data: branches } = useBranches();

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "To'langan", value: analytics?.payment_status?.paid || 0 },
    { name: "Qisman", value: analytics?.payment_status?.partial || 0 },
    { name: "Qarzdor", value: analytics?.payment_status?.debt || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Umumiy ko'rsatkichlar</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs
            value={courseType || "all"}
            onValueChange={(v) =>
              setCourseType(v === "all" ? undefined : (v as CourseType))
            }
          >
            <TabsList className="bg-secondary">
              <TabsTrigger value="all">Barchasi</TabsTrigger>
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
                <SelectValue placeholder="Barcha filiallar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha filiallar</SelectItem>
                {(branches || []).map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Jami talabalar"
          value={analytics?.total_students ?? 0}
          icon={<GraduationCap className="h-5 w-5" />}
          trend="+12% o'tgan oyga"
        />
        {isOwner() && (
          <SummaryCard
            title="Jami daromad"
            value={formatSum(analytics?.total_revenue ?? 0)}
            icon={<DollarSign className="h-5 w-5" />}
          />
        )}
        <SummaryCard
          title="Kutilayotgan to'lovlar"
          value={formatSum(analytics?.pending_payments ?? 0)}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <SummaryCard
          title="Faol kurslar"
          value={`${analytics?.active_tezkor ?? 0} Tezkor / ${analytics?.active_avto ?? 0} Avto`}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Chart */}
        <div className="glass-card p-5">
          <h3 className="font-heading text-sm font-semibold mb-4">Oylik ro'yxatga olish</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.monthly_enrollment || []}>
              <XAxis dataKey="month" stroke="hsl(220, 10%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(228, 18%, 11%)", border: "1px solid hsl(228, 12%, 22%)", borderRadius: 8, color: "#fff" }} />
              <Bar dataKey="tezkor" fill="hsl(217, 85%, 63%)" radius={[4, 4, 0, 0]} name="Tezkor" />
              <Bar dataKey="avto_maktab" fill="hsl(142, 70%, 45%)" radius={[4, 4, 0, 0]} name="Avto maktab" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Pie */}
        <div className="glass-card p-5">
          <h3 className="font-heading text-sm font-semibold mb-4">To'lov holati</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" stroke="none">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(228, 18%, 11%)", border: "1px solid hsl(228, 12%, 22%)", borderRadius: 8, color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                {d.name} ({d.value}%)
              </div>
            ))}
          </div>
        </div>

        {/* Branch comparison - owner only */}
        {isOwner() && (
          <div className="glass-card p-5 lg:col-span-2">
            <h3 className="font-heading text-sm font-semibold mb-4">Filiallar bo'yicha taqqoslash</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={analytics.branch_stats || []}>
                <XAxis dataKey="branch" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(228, 18%, 11%)", border: "1px solid hsl(228, 12%, 22%)", borderRadius: 8, color: "#fff" }} />
                <Line type="monotone" dataKey="students" stroke="hsl(217, 85%, 63%)" strokeWidth={2} dot={{ fill: "hsl(217, 85%, 63%)" }} name="Talabalar" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
