import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";

/**
 * Response shape comes from autodrive-backend `GET /health`
 * (see src/modules/health/health.controller.ts). The endpoint returns
 * 200 when healthy and 503 when DB ping fails — both bodies share the
 * same fields, so we accept either status as a valid response.
 */
export interface SystemHealth {
  status: "ok" | "degraded";
  timestamp: string;
  uptime_seconds: number;
  checks: {
    db: {
      ok: boolean;
      latency_ms: number;
      error?: string;
    };
  };
}

export const useSystemHealth = () =>
  useQuery<SystemHealth>({
    queryKey: ["system-health"],
    queryFn: async () => {
      const { data: res } = await axiosInstance.get("/health", {
        // 503 from a degraded /health is expected — read the body, not throw.
        validateStatus: () => true,
      });
      return res?.data || res;
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
    retry: false,
  });
