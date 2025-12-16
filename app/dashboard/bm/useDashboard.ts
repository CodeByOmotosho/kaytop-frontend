import { DashboardService } from "@/app/services/dashboardService";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";

interface DashboardKpiResponse {
  message?: string;
}

export function useDashboard() {
  const searchParams = useSearchParams();
  const timeFilter = searchParams.get("last") ?? "";

  const { isLoading, error, data } = useQuery<
    unknown[],
    AxiosError<DashboardKpiResponse>
  >({
    queryKey: ["dashboard", timeFilter],
    queryFn:   ({ queryKey }) => {
      const [, timeFilter] = queryKey as [string, string];
      return DashboardService.getDashboardKpi(timeFilter);
    },
  });

  return { isLoading, error, data };
}
