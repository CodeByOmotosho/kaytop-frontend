import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";

export interface Branch {
    name: string;
    customerCount: number;
    officerCount: number;
    loanCount: number;
    savingsBalance: number;
}

export interface HQBranchesResponse {
    totalBranches: number;
    branches: Branch[];
}

export function useHQBranches() {
    return useQuery({
        queryKey: ["hq-branches"],
        queryFn: async () => {
            const response = await apiClient.get<HQBranchesResponse>(
                `${apiBaseUrl}/hq-manager/branches`,
            );
            return response.data;
        },
    });
}
