"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { CoDashboardService } from "../services/coDashboardService";

export function useOfficerLoans(status?: string) {
    const searchParams = useSearchParams();
    const page = searchParams.get("page") ?? "1";
    const limit = searchParams.get("limit") ?? "20";

    const { isLoading, error, data } = useQuery({
        queryKey: ["officer-loans", page, limit, status],
        queryFn: () =>
            CoDashboardService.getOfficerLoans({
                page: Number(page),
                limit: Number(limit),
                status,
            }),
    });

    return { isLoading, error, data };
}
