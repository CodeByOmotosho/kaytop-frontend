import apiClient from "@/lib/apiClient";

export interface CustomerLoan {
    id: number;
    amount: string;
    interestRate: string;
    term: number;
    totalRepayable: string;
    dailyRepayment: string;
    status: "active" | "pending" | "completed" | "rejected";
    disbursementProof?: string;
    disbursementProofPublicId?: string;
    disbursementDate?: string;
    dueDate?: string;
    amountPaid: string;
    remainingBalance: string;
    daysOverdue: number;
    createdAt: string;
}

export interface CustomerSavings {
    id: number;
    balance: string;
    targetAmount: string | null;
    targetDescription: string | null;
    createdAt: string;
}

export interface CustomerDetails {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    address: string;
    role: string;
    dob: string | null;
    isVerified: boolean;
    accountStatus: string;
    profilePicture: string | null;
    state: string;
    branch: string;
    assignedBranches: any | null;
    guarantorName: string | null;
    guarantorEmail: string | null;
    guarantorPhone: string | null;
    guarantorAddress: string | null;
    guarantorPicture: string | null;
    idType: string | null;
    idNumber: string | null;
    idPicture: string | null;
    verificationStatus: "pending" | "verified" | "rejected";
    createdAt: string;
    updatedAt: string | null;
    verifiedAt: string | null;
    loans: CustomerLoan[];
    savings: CustomerSavings[];
    createdBy: any | null;
    createdAtBy: any | null;
}

interface BranchUsersResponse {
    users: Array<{
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        mobileNumber: string;
        role: string;
        isVerified: boolean;
        accountStatus: string;
        state: string;
        branch: string;
        verificationStatus: string;
        createdAt: string;
        createdBy: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
        } | null;
    }>;
    total: number;
}

interface DisbursedLoan {
    id: number;
    amount: string;
    customer: string;
    branch: string;
    status: string;
    disbursementDate: string;
    dueDate: string;
}

interface Collection {
    id: number;
    amount: string;
    customer: string;
    branch: string;
    collectedDate: string;
    status: string;
}

class HqManagerService {
    private baseUrl = "/hq-manager";

    // Get all branches assigned to this HQ Manager
    async getMyBranches() {
        const response = await apiClient.get(`${this.baseUrl}/branches`);
        return response.data; // Returns { totalBranches, branches }
    }

    // Get dashboard summary
    async getDashboardSummary() {
        const response = await apiClient.get(`${this.baseUrl}/dashboard`);
        return response.data; // Returns { summary, recentLoans }
    }

    // Get credit officers with pagination and branch filter
    async getCreditOfficers(params: {
        page?: number;
        limit?: number;
        branch?: string;
    }) {
        const queryParams = new URLSearchParams();
        queryParams.append("page", (params.page || 1).toString());
        queryParams.append("limit", (params.limit || 10).toString());

        if (params.branch) {
            queryParams.append("branch", params.branch);
        }

        const response = await apiClient.get(
            `${this.baseUrl}/credit-officers?${queryParams.toString()}`,
        );
        return response.data; // Adjust based on actual response structure
    }

    // Get customers with pagination and filters
    async getCustomers(params: {
        page?: number;
        limit?: number;
        branch?: string;
        search?: string;
    }) {
        const queryParams = new URLSearchParams();
        queryParams.append("page", (params.page || 1).toString());
        queryParams.append("limit", (params.limit || 10).toString());

        if (params.branch) {
            queryParams.append("branch", params.branch);
        }

        if (params.search) {
            queryParams.append("search", params.search);
        }

        const response = await apiClient.get(
            `${this.baseUrl}/customers?${queryParams.toString()}`,
        );

        // Based on the example response: { data, total, page, limit, totalPages }
        return response.data;
    }

    // Get loans with filters
    async getLoans(params: {
        page?: number;
        limit?: number;
        branch?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }) {
        const queryParams = new URLSearchParams();
        queryParams.append("page", (params.page || 1).toString());
        queryParams.append("limit", (params.limit || 10).toString());

        if (params.branch) {
            queryParams.append("branch", params.branch);
        }

        if (params.status) {
            queryParams.append("status", params.status);
        }

        if (params.startDate) {
            queryParams.append("startDate", params.startDate);
        }

        if (params.endDate) {
            queryParams.append("endDate", params.endDate);
        }

        const response = await apiClient.get(
            `${this.baseUrl}/loans?${queryParams.toString()}`,
        );
        return response.data;
    }

    // Get single loan by ID
    async getLoanById(loanId: number) {
        const response = await apiClient.get(`${this.baseUrl}/loans/${loanId}`);
        return response.data;
    }

    // Get single customer by ID
    async getCustomerById(customerId: number): Promise<CustomerDetails> {
        try {
            const response = await apiClient.get(
                `${this.baseUrl}/customers/${customerId}`,
            );
            return response.data; // Returns full customer details with loans and savings
        } catch (error) {
            console.error(`Error fetching customer ${customerId}:`, error);
            throw error;
        }
    }

    // Get branch performance
    async getBranchPerformance(
        branch: string,
        period?: "daily" | "weekly" | "monthly",
    ) {
        const queryParams = new URLSearchParams();
        if (period) {
            queryParams.append("period", period);
        }
        const response = await apiClient.get(
            `${this.baseUrl}/branches/${branch}/performance?${queryParams.toString()}`,
        );
        return response.data;
    }

    // Get branches performance comparison
    async getBranchesPerformanceComparison(
        period?: "daily" | "weekly" | "monthly",
    ) {
        const queryParams = new URLSearchParams();
        if (period) {
            queryParams.append("period", period);
        }
        const response = await apiClient.get(
            `${this.baseUrl}/branches/performance/comparison?${queryParams.toString()}`,
        );
        return response.data;
    }

    // Add this method inside the HqManagerService class
    async getUsersByBranch(branchName: string): Promise<BranchUsersResponse> {
        try {
            const response = await apiClient.get(
                `/admin/users/branch/${encodeURIComponent(branchName)}`,
            );
            return response.data; // Returns { users, total }
        } catch (error) {
            console.error(
                `Error fetching users for branch ${branchName}:`,
                error,
            );
            throw error;
        }
    }

    async getOfficerDisbursedLoans(
        officerId: number,
        params?: { timeFilter?: string; startDate?: string; endDate?: string },
    ): Promise<DisbursedLoan[]> {
        try {
            const queryParams = new URLSearchParams();
            if (params?.timeFilter)
                queryParams.append("timeFilter", params.timeFilter);
            if (params?.startDate)
                queryParams.append("startDate", params.startDate);
            if (params?.endDate) queryParams.append("endDate", params.endDate);

            const url = `/loans/officer/${officerId}/disbursed-loans${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error(
                `Error fetching disbursed loans for officer ${officerId}:`,
                error,
            );
            throw error;
        }
    }

    async getOfficerCollections(
        officerId: number,
        params?: { timeFilter?: string; startDate?: string; endDate?: string },
    ): Promise<Collection[]> {
        try {
            const queryParams = new URLSearchParams();
            if (params?.timeFilter)
                queryParams.append("timeFilter", params.timeFilter);
            if (params?.startDate)
                queryParams.append("startDate", params.startDate);
            if (params?.endDate) queryParams.append("endDate", params.endDate);

            const url = `/loans/officer/${officerId}/collections${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error(
                `Error fetching collections for officer ${officerId}:`,
                error,
            );
            throw error;
        }
    }
}

export const hqManagerService = new HqManagerService();
