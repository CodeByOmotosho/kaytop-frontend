"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { CoDashboardService } from "../services/coDashboardService";

export function useOfficerDashboard() {
    const searchParams = useSearchParams();
    const timeFilter = searchParams.get("last") ?? "last_30_days";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    return useQuery({
        queryKey: ["officer-dashboard", timeFilter, startDate, endDate],
        queryFn: () =>
            CoDashboardService.getOfficerDashboard({
                timeFilter,
                startDate,
                endDate,
            }),
    });
}
