import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import {
    OfficerCustomersResponse,
    OfficerDashboardResponse,
    OfficerLoansResponse,
} from "../types/codashboard";

interface DashboardProps {
    timeFilter: string;
    startDate?: string | null;
    endDate?: string | null;
}

interface PaginationProps {
    page: number;
    limit: number;
    status?: string;
    search?: string;
}

export class CoDashboardService {
    // Get officer dashboard KPIs
    static async getOfficerDashboard({
        timeFilter,
        startDate,
        endDate,
    }: DashboardProps): Promise<OfficerDashboardResponse> {
        try {
            const response = await apiClient.get(
                `${apiBaseUrl}/dashboard/officer`,
                {
                    params: {
                        timeFilter,
                        startDate,
                        endDate,
                    },
                },
            );
            return response.data;
        } catch (error: AxiosError | unknown) {
            const err = error as AxiosError;
            console.error(
                "Error fetching officer dashboard",
                err.response?.data,
            );
            throw err;
        }
    }

    // Get loans created by this officer
    static async getOfficerLoans({
        page,
        limit,
        status,
    }: PaginationProps): Promise<OfficerLoansResponse> {
        try {
            const response = await apiClient.get(`${apiBaseUrl}/loans`, {
                params: {
                    page,
                    limit,
                    status,
                },
            });

            // Transform to match expected format
            const { data, total } = response.data;

            return {
                data,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error: AxiosError | unknown) {
            const err = error as AxiosError;
            console.error("Error fetching officer loans", err.response?.data);
            throw err;
        }
    }

    // Get customers created by this officer
    static async getOfficerCustomers({
        page,
        limit,
        search,
    }: PaginationProps): Promise<OfficerCustomersResponse> {
        try {
            const response = await apiClient.get(
                `${apiBaseUrl}/users/my-branch`,
                {
                    params: {
                        page,
                        limit,
                        search,
                    },
                },
            );

            const { users, total } = response.data;

            return {
                data: users,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error: AxiosError | unknown) {
            const err = error as AxiosError;
            console.error(
                "Error fetching officer customers",
                err.response?.data,
            );
            throw err;
        }
    }

    // Get recollections for loans disbursed by this officer
    static async getOfficerRecollections({
        page,
        limit,
    }: PaginationProps): Promise<any> {
        try {
            const response = await apiClient.get(
                `${apiBaseUrl}/loans/recollections`,
                {
                    params: {
                        page,
                        limit,
                    },
                },
            );
            return response.data;
        } catch (error: AxiosError | unknown) {
            const err = error as AxiosError;
            console.error(
                "Error fetching officer recollections",
                err.response?.data,
            );
            throw err;
        }
    }
}
