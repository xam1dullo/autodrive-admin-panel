import { Activity, AlertTriangle, CheckCircle2, Clock, Database, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSystemHealth } from "@/services/healthService";

const formatUptime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d} kun`);
  if (h > 0 || d > 0) parts.push(`${h} soat`);
  parts.push(`${m} daq`);
  return parts.join(" ");
};

const SystemHealthPage = () => {
  const { data, isLoading, isFetching, refetch, dataUpdatedAt, error } = useSystemHealth();

  const isOk = data?.status === "ok";
  const dbOk = data?.checks?.db?.ok ?? false;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Tizim holati</h1>
          <p className="text-sm text-muted-foreground">
            Backend va ma'lumotlar bazasining real-time holati. 30 soniyada bir avto-yangilanadi.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          Yangilash
        </Button>
      </div>

      {/* Top-level status */}
      <Card
        className={cn(
          "border-2",
          isLoading
            ? "border-border"
            : error || !data
              ? "border-destructive/40 bg-destructive/5"
              : isOk
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-amber-500/40 bg-amber-500/5",
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Umumiy holat</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-24" />
          ) : error || !data ? (
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xl font-semibold">Bog'lanib bo'lmadi</span>
            </div>
          ) : isOk ? (
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xl font-semibold">Faol</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xl font-semibold">Buzilgan</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-component grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* DB */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PostgreSQL
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <>
                <div
                  className={cn(
                    "flex items-center gap-2 text-xl font-semibold",
                    dbOk ? "text-emerald-500" : "text-destructive",
                  )}
                >
                  {dbOk ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" /> Ulangan
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5" /> Ulanmagan
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ping kechikishi: {data.checks.db.latency_ms} ms
                </p>
                {data.checks.db.error && (
                  <p className="mt-1 break-all text-xs text-destructive">
                    {data.checks.db.error}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Uptime */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <>
                <div className="text-xl font-semibold">
                  {formatUptime(data.uptime_seconds)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Server boshlangan paytdan beri
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer: last-check timestamp */}
      <p className="text-xs text-muted-foreground">
        {dataUpdatedAt
          ? `Oxirgi tekshirish: ${format(new Date(dataUpdatedAt), "dd.MM.yyyy HH:mm:ss")}`
          : "Hali tekshirilmagan"}
      </p>
    </div>
  );
};

export default SystemHealthPage;
