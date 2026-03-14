export interface OfficerInfo {
    id: number;
    name: string;
    branch: string;
    email: string;
}

export interface OfficerMetrics {
    totalLoans: number;
    totalValue: number;
    approvedLoans: number;
    disbursedLoans: number;
    disbursedValue: number;
    collectedValue: number;
    overdueLoans: number;
    approvalRate: number;
    collectionRate: number;
    pendingLoans: number;
    totalTransactions: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalLoanCoverage: number;
    netSavingsFlow: number;
}

export interface OfficerPerformance {
    approvalRate: number;
    collectionRate: number;
    totalLoansProcessed: number;
    totalValueProcessed: number;
    totalSavingsProcessed: number;
    savingsValue: number;
}

export interface RecentReport {
    id: number;
    title: string;
    status: string;
    submittedAt: string;
}

export interface OfficerDashboardResponse {
    officerInfo: OfficerInfo;
    metrics: OfficerMetrics;
    recentReports: RecentReport[];
    performance: OfficerPerformance;
    totalCustomers: number;
    dateRange: {
        start: string;
        end: string;
    };
}

export interface OfficerLoan {
    id: number;
    loanId: number;
    amount: number;
    interestRate: number;
    term: number;
    status: string;
    totalRepayable: number;
    dailyRepayment: number;
    amountPaid: number;
    remainingBalance: number;
    disbursementDate: string;
    dueDate: string;
    daysOverdue: number;
    customerName: string;
    customerId: number;
    customerBranch: string;
    createdAt: string;
}

export interface OfficerLoansResponse {
    data: OfficerLoan[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface OfficerCustomer {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    branch: string;
    profilePicture?: string;
    createdAt: string;
}

export interface OfficerCustomersResponse {
    data: OfficerCustomer[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface OfficerRecollection {
    name: string;
    status: string;
    amountToBePaid: number;
    dateToBePaid: string | null;
}

export interface OfficerSavingsTransaction {
    id: number;
    amount: number;
    type: "deposit" | "withdrawal" | "loan_coverage";
    description?: string;
    createdAt: string;
    customerName: string;
}
