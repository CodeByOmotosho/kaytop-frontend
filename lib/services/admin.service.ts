import apiClient from "@/lib/apiClient";

export interface HQManager {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    role: string;
    branch: string | null;
    verificationStatus: string;
    createdAt: string;
    assignedBranches?: string[];
}

export interface HQManagerResponse {
    users: HQManager[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface BranchAssignmentResponse {
    message: string;
    user: HQManager;
    branches: string[];
}

class AdminService {
    private baseUrl = "/admin";

    // Get all HQ Managers
    async getHQManagers(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<HQManagerResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.search) queryParams.append("search", params.search);

        const url = `${this.baseUrl}/hq-managers${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
        const response = await apiClient.get(url);
        return response.data;
    }

    // Get branches assigned to a specific HQ Manager
    async getHQManagerBranches(hqManagerId: number): Promise<string[]> {
        const response = await apiClient.get(
            `${this.baseUrl}/hq-managers/${hqManagerId}/branches`,
        );
        return response.data;
    }

    // Assign branches to an HQ Manager (initial assignment)
    async assignBranchesToHQManager(
        hqManagerId: number,
        branches: string[],
    ): Promise<BranchAssignmentResponse> {
        const response = await apiClient.post(
            `${this.baseUrl}/hq-managers/${hqManagerId}/assign-branches`,
            { branches },
        );
        return response.data;
    }

    // Add additional branches to an HQ Manager
    async addBranchesToHQManager(
        hqManagerId: number,
        branches: string[],
    ): Promise<BranchAssignmentResponse> {
        const response = await apiClient.patch(
            `${this.baseUrl}/hq-managers/${hqManagerId}/branches/add`,
            { branches },
        );
        return response.data;
    }

    // Remove a specific branch from an HQ Manager
    async removeBranchFromHQManager(
        hqManagerId: number,
        branchName: string,
    ): Promise<{ message: string; user: HQManager; branches: string[] }> {
        const response = await apiClient.delete(
            `${this.baseUrl}/hq-managers/${hqManagerId}/branches/${encodeURIComponent(branchName)}`,
        );
        return response.data;
    }
}

export const adminService = new AdminService();
