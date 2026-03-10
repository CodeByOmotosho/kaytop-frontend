"use client";

/**
 * Loans Page
 * Displays comprehensive loan management dashboard for HQ Managers
 */

import { useState, useMemo, useEffect } from "react";
import SimpleStatisticsCard from "@/app/_components/ui/SimpleStatisticsCard";
import LoansTabNavigation from "@/app/_components/ui/LoansTabNavigation";
import LoansTable from "@/app/_components/ui/LoansTable";
import Pagination from "@/app/_components/ui/Pagination";
import FilterControls from "@/app/_components/ui/FilterControls";
import {
    DashboardFiltersModal,
    DashboardFilters,
} from "@/app/_components/ui/DashboardFiltersModal";
import { ToastContainer } from "@/app/_components/ui/ToastContainer";
import { useToast } from "@/app/hooks/useToast";
import {
    StatisticsCardSkeleton,
    TableSkeleton,
} from "@/app/_components/ui/Skeleton";
import { DateRange } from "react-day-picker";
import LoansPageLoanDetailsModal, {
    LoanDetailsData,
} from "@/app/_components/ui/LoansPageLoanDetailsModal";
import PaymentScheduleModal from "@/app/_components/ui/PaymentScheduleModal";
import EditLoanModal from "@/app/_components/ui/EditLoanModal";
import DeleteConfirmationModal from "@/app/_components/ui/DeleteConfirmationModal";
import { hqManagerService } from "@/lib/services/hq-manager.service";
import type { TimePeriod } from "@/app/_components/ui/FilterControls";
import { useRouter } from "next/navigation";

// Types based on the actual API response
interface ApiLoan {
    id: number;
    amount: string;
    status: "active" | "pending" | "completed" | "rejected" | "overdue";
    branch: string;
    customer: string;
    officer: string;
    createdAt: string;
    disbursementDate: string | null;
    dueDate: string | null;
    amountPaid: string;
    daysOverdue: number;
}

interface LoanData {
    id: string;
    loanId: string;
    customerId: string;
    customerName: string;
    amount: number;
    interestRate: number;
    status:
        | "pending"
        | "approved"
        | "disbursed"
        | "active"
        | "completed"
        | "defaulted"
        | "overdue";
    nextRepaymentDate: string;
    disbursementDate: Date;
    term: number;
    branchId: string;
    branch: string;
    officer: string;
    amountPaid: number;
    daysOverdue: number;
}

interface LocalLoanStatistics {
    totalLoans: { count: number; growth: number };
    activeLoans: { count: number; growth: number };
    completedLoans: { count: number; growth: number };
    totalOutstanding?: number;
    totalOverdue?: number;
}

const ITEMS_PER_PAGE = 10;
type TabId = "all" | "active" | "completed" | "missed";

// Transform API Loan to LoanData format
const transformApiLoanToLoanData = (loan: ApiLoan): LoanData => {
    // Map API status to expected UI status
    let status:
        | "pending"
        | "approved"
        | "disbursed"
        | "active"
        | "completed"
        | "defaulted"
        | "overdue";

    switch (loan.status.toLowerCase()) {
        case "pending":
            status = "pending";
            break;
        case "active":
            status = "active";
            break;
        case "completed":
            status = "completed";
            break;
        case "rejected":
            status = "defaulted";
            break;
        default:
            status = "pending";
    }

    // Check if loan is overdue (daysOverdue > 0 and status is active)
    if (loan.daysOverdue > 0 && status === "active") {
        status = "overdue";
    }

    // Calculate next repayment date (use dueDate or estimate)
    const nextRepaymentDate =
        loan.dueDate || loan.disbursementDate || loan.createdAt;

    return {
        id: String(loan.id),
        loanId: String(loan.id).slice(-5).toUpperCase(),
        customerId: String(loan.id), // API doesn't provide customerId separately
        customerName: loan.customer,
        amount: parseFloat(loan.amount),
        interestRate: 20, // Default interest rate (not in API response)
        status,
        nextRepaymentDate: nextRepaymentDate || new Date().toISOString(),
        disbursementDate: loan.disbursementDate
            ? new Date(loan.disbursementDate)
            : new Date(loan.createdAt),
        term: 30, // Default term in days (not in API response)
        branchId: loan.branch,
        branch: loan.branch,
        officer: loan.officer,
        amountPaid: parseFloat(loan.amountPaid),
        daysOverdue: loan.daysOverdue,
    };
};

export default function LoansPage() {
    // State management
    const { toasts, removeToast, success, error: showError } = useToast();
    const router = useRouter();

    // API data state
    const [allLoans, setAllLoans] = useState<LoanData[]>([]);
    const [totalLoans, setTotalLoans] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>("all");

    // Filter state
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [selectedLoans, setSelectedLoans] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>({
        branches: [],
        creditOfficers: [],
        loanStatus: [],
        amountRange: { min: 0, max: 1000000 },
    });

    // Modal state
    const [selectedLoanForDetails, setSelectedLoanForDetails] =
        useState<LoanDetailsData | null>(null);
    const [selectedLoanForEdit, setSelectedLoanForEdit] = useState<any | null>(
        null,
    );
    const [selectedLoanForDelete, setSelectedLoanForDelete] = useState<
        string | null
    >(null);
    const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState<
        string | null
    >(null);

    // Fetch loans data from HQ Manager API
    const fetchLoansData = async (page: number = currentPage) => {
        try {
            setIsLoading(true);
            setApiError(null);

            console.log("💰 Fetching loans using HQ Manager Service...");

            // Build API params
            const params: {
                page: number;
                limit: number;
                branch?: string;
                status?: string;
                startDate?: string;
                endDate?: string;
            } = {
                page,
                limit: ITEMS_PER_PAGE,
            };

            // Apply tab filter
            if (activeTab !== "all") {
                params.status = activeTab === "missed" ? "overdue" : activeTab;
            }

            // Apply branch filter if any
            if (appliedFilters.branches.length > 0) {
                // Note: API only supports single branch filter, use first selected branch
                params.branch = appliedFilters.branches[0];
            }

            // Apply date filters
            if (dateRange?.from) {
                params.startDate = dateRange.from.toISOString().split("T")[0];
                if (dateRange?.to) {
                    params.endDate = dateRange.to.toISOString().split("T")[0];
                }
            } else if (selectedPeriod && selectedPeriod !== "custom") {
                // Calculate date range based on selected period
                const now = new Date();
                let startDate: Date;

                switch (selectedPeriod) {
                    case "last_24_hours":
                        startDate = new Date(
                            now.getTime() - 24 * 60 * 60 * 1000,
                        );
                        break;
                    case "last_7_days":
                        startDate = new Date(
                            now.getTime() - 7 * 24 * 60 * 60 * 1000,
                        );
                        break;
                    case "last_30_days":
                        startDate = new Date(
                            now.getTime() - 30 * 24 * 60 * 60 * 1000,
                        );
                        break;
                    default:
                        startDate = new Date(now);
                        startDate.setMonth(now.getMonth() - 12);
                        break;
                }

                params.startDate = startDate.toISOString().split("T")[0];
                params.endDate = now.toISOString().split("T")[0];
            }

            console.log("📊 Fetching with params:", params);

            // Fetch loans from HQ Manager API
            const response = await hqManagerService.getLoans(params);
            console.log("✅ Loans response:", response);

            // The response structure: { data, total, page, limit, totalPages }
            const apiLoans = response.data as ApiLoan[];
            const total = response.total as number;

            setTotalLoans(total);

            // Transform API loans to UI format
            const transformedLoans = apiLoans.map(transformApiLoanToLoanData);
            setAllLoans(transformedLoans);
        } catch (err) {
            console.error("❌ Failed to fetch loans data:", err);
            setApiError(
                err instanceof Error
                    ? err.message
                    : "Failed to load loans data",
            );
            showError("Failed to load loans data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate statistics from loans data
    const statistics = useMemo((): LocalLoanStatistics => {
        const total = allLoans.length;
        const active = allLoans.filter(
            (loan) => loan.status === "active" || loan.status === "overdue",
        ).length;
        const completed = allLoans.filter(
            (loan) => loan.status === "completed",
        ).length;
        const overdue = allLoans.filter((loan) => loan.daysOverdue > 0).length;
        const totalOutstanding = allLoans.reduce((sum, loan) => {
            if (loan.status === "active" || loan.status === "overdue") {
                return sum + (loan.amount - loan.amountPaid);
            }
            return sum;
        }, 0);

        return {
            totalLoans: { count: total, growth: 0 }, // Growth not available from API
            activeLoans: { count: active, growth: 0 },
            completedLoans: { count: completed, growth: 0 },
            totalOutstanding,
            totalOverdue: overdue,
        };
    }, [allLoans]);

    // Load initial data
    useEffect(() => {
        fetchLoansData(1);
    }, []);

    // Reload data when page changes
    useEffect(() => {
        if (!isLoading) {
            fetchLoansData(currentPage);
        }
    }, [currentPage]);

    // Reload data when filters change
    useEffect(() => {
        if (currentPage === 1) {
            fetchLoansData(1);
        } else {
            setCurrentPage(1);
        }
    }, [activeTab, selectedPeriod, dateRange, appliedFilters]);

    // Tab configuration
    const tabs = [
        { id: "all", label: "Loan Overview" },
        { id: "active", label: "Active" },
        { id: "completed", label: "Completed" },
        { id: "missed", label: "Missed Payments" },
    ];

    // Pagination
    const totalPages = Math.ceil(totalLoans / ITEMS_PER_PAGE);

    // Filter loans client-side for additional filtering
    const filteredLoans = useMemo(() => {
        return allLoans.filter((loan) => {
            // Apply amount range filter
            if (
                appliedFilters.amountRange.min > 0 &&
                loan.amount < appliedFilters.amountRange.min
            ) {
                return false;
            }
            if (
                appliedFilters.amountRange.max < 1000000 &&
                loan.amount > appliedFilters.amountRange.max
            ) {
                return false;
            }

            // Apply status filter (if any)
            if (appliedFilters.loanStatus.length > 0) {
                const statusMatch = appliedFilters.loanStatus.some((status) =>
                    loan.status.toLowerCase().includes(status.toLowerCase()),
                );
                if (!statusMatch) return false;
            }

            return true;
        });
    }, [allLoans, appliedFilters]);

    // Selection handlers
    const handleSelectLoan = (loanId: string) => {
        setSelectedLoans((prev) =>
            prev.includes(loanId)
                ? prev.filter((id) => id !== loanId)
                : [...prev, loanId],
        );
    };

    const handleSelectAll = () => {
        if (selectedLoans.length === filteredLoans.length) {
            setSelectedLoans([]);
        } else {
            setSelectedLoans(filteredLoans.map((loan) => loan.id));
        }
    };

    const allSelected =
        filteredLoans.length > 0 &&
        selectedLoans.length === filteredLoans.length;

    // Tab change handler
    const handleTabChange = (tabId: string) => {
        try {
            const validTabs: TabId[] = ["all", "active", "completed", "missed"];
            if (!validTabs.includes(tabId as TabId)) {
                console.warn('Invalid tab ID, defaulting to "all":', tabId);
                setActiveTab("all");
                return;
            }
            setActiveTab(tabId as TabId);
            setCurrentPage(1);
            setSelectedLoans([]);
            setError(null);
        } catch (error) {
            console.error("Error changing tab:", error);
            setError("Failed to change tab. Please try again.");
        }
    };

    const handlePeriodChange = (period: TimePeriod) => {
        setSelectedPeriod(period);
        if (period !== "custom") {
            setDateRange(undefined);
        }
        setCurrentPage(1);
        setSelectedLoans([]);
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        if (range) {
            setSelectedPeriod("custom");
        }
        setCurrentPage(1);
        setSelectedLoans([]);
    };

    const handleFilterClick = () => {
        setIsFiltersOpen(true);
    };

    const handleApplyFilters = (filters: DashboardFilters) => {
        setAppliedFilters(filters);
        setCurrentPage(1);

        const activeCount =
            filters.loanStatus.length +
            (filters.amountRange.min > 0 || filters.amountRange.max < 1000000
                ? 1
                : 0);

        if (activeCount > 0) {
            success(
                `${activeCount} filter${activeCount > 1 ? "s" : ""} applied successfully!`,
            );
        }
    };

    const handlePageChange = (page: number) => {
        try {
            if (page < 1 || page > totalPages) {
                console.warn("Page out of bounds, resetting to page 1");
                setCurrentPage(1);
                return;
            }
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
            setError(null);
        } catch (error) {
            console.error("Error changing page:", error);
            setError("Failed to change page. Please try again.");
        }
    };

    const handleLoanClick = (loan: any) => {
        router.push(`/dashboard/hq/loans/${loan.id}`);
    };

    const handleCloseDetailsModal = () => {
        setSelectedLoanForDetails(null);
    };

    const handleEditLoan = (loanData: LoanDetailsData) => {
        setSelectedLoanForDetails(null);
        setSelectedLoanForEdit(loanData);
    };

    const handleDeleteLoan = (loanId: string) => {
        setSelectedLoanForDetails(null);
        setSelectedLoanForDelete(loanId);
    };

    const handleViewSchedule = (loanId: string) => {
        setSelectedLoanForDetails(null);
        setSelectedLoanForSchedule(loanId);
    };

    const handleConfirmDelete = async () => {
        if (selectedLoanForDelete) {
            try {
                // Optimistic update
                setAllLoans((prev) =>
                    prev.filter((loan) => loan.id !== selectedLoanForDelete),
                );
                success("Loan deleted successfully!");
                setSelectedLoanForDelete(null);

                // TODO: Implement actual API call when delete endpoint is available
                console.log("Delete loan:", selectedLoanForDelete);
            } catch (err) {
                console.error("Failed to delete loan:", err);
                showError("Failed to delete loan. Please try again.");
            }
        }
    };

    const handleSaveEdit = async (updatedLoan: any) => {
        try {
            // Optimistic update
            setAllLoans((prev) =>
                prev.map((loan) =>
                    loan.id === updatedLoan.id
                        ? { ...loan, ...updatedLoan }
                        : loan,
                ),
            );
            success("Loan updated successfully!");
            setSelectedLoanForEdit(null);

            // TODO: Implement actual API call when update endpoint is available
            console.log("Update loan:", updatedLoan);
        } catch (err) {
            console.error("Failed to update loan:", err);
            showError("Failed to update loan. Please try again.");
        }
    };

    return (
        <div className="drawer-content flex flex-col">
            <main
                className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6"
                style={{ paddingTop: "40px" }}
            >
                <div className="max-w-[1150px]">
                    <div>
                        {/* Error Message */}
                        {error && (
                            <div
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                                role="alert"
                                aria-live="polite"
                            >
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Page Header */}
                        <div style={{ marginBottom: "48px" }}>
                            <h1
                                className="font-bold"
                                style={{
                                    fontSize: "24px",
                                    fontWeight: 700,
                                    color: "#021C3E",
                                    marginBottom: "8px",
                                }}
                            >
                                Overview
                            </h1>
                            <p
                                className="font-medium"
                                style={{
                                    fontSize: "16px",
                                    fontWeight: 500,
                                    color: "#021C3E",
                                    opacity: 0.5,
                                }}
                            >
                                Loan Overview
                            </p>
                            {/* Breadcrumb line */}
                            <div
                                style={{
                                    width: "18px",
                                    height: "2px",
                                    background: "#000000",
                                    marginTop: "8px",
                                }}
                            />
                        </div>

                        {/* Filter Controls */}
                        {/* <div style={{ marginBottom: "56px" }}>
                            <FilterControls
                                selectedPeriod={selectedPeriod}
                                onPeriodChange={handlePeriodChange}
                                onDateRangeChange={handleDateRangeChange}
                                // onFilter={handleFilterClick}
                            />
                        </div> */}

                        {/* Statistics Cards */}
                        <div
                            className="grid grid-cols-3 gap-6 w-full max-w-[1091px]"
                            style={{ marginBottom: "48px" }}
                        >
                            {isLoading ? (
                                <>
                                    <StatisticsCardSkeleton />
                                    <StatisticsCardSkeleton />
                                    <StatisticsCardSkeleton />
                                </>
                            ) : (
                                <>
                                    <SimpleStatisticsCard
                                        label="Total Loans"
                                        value={statistics.totalLoans.count.toLocaleString()}
                                        growth={statistics.totalLoans.growth}
                                        showGrowth={true}
                                        subtext={`₦${statistics.totalOutstanding?.toLocaleString()} outstanding`}
                                    />
                                    <SimpleStatisticsCard
                                        label="Active Loans"
                                        value={statistics.activeLoans.count.toLocaleString()}
                                        growth={statistics.activeLoans.growth}
                                        showGrowth={true}
                                        subtext={`${statistics.totalOverdue} overdue`}
                                    />
                                    <SimpleStatisticsCard
                                        label="Completed Loans"
                                        value={statistics.completedLoans.count.toLocaleString()}
                                        growth={
                                            statistics.completedLoans.growth
                                        }
                                        showGrowth={true}
                                    />
                                </>
                            )}
                        </div>

                        {/* Tab Navigation */}
                        <div style={{ marginBottom: "24px" }}>
                            <LoansTabNavigation
                                tabs={tabs}
                                activeTab={activeTab}
                                onTabChange={handleTabChange}
                            />
                        </div>

                        {/* Loans Table */}
                        <div className="max-w-[1075px]">
                            {isLoading ? (
                                <TableSkeleton rows={ITEMS_PER_PAGE} />
                            ) : filteredLoans.length === 0 ? (
                                <div
                                    className="bg-white rounded-[12px] border border-[#EAECF0] p-12 text-center"
                                    role="status"
                                    aria-live="polite"
                                >
                                    <p className="text-base text-[#475467] mb-4">
                                        {apiError
                                            ? "Failed to load loan data. Please try again."
                                            : "No loans found matching the selected filters."}
                                    </p>
                                    {apiError && (
                                        <button
                                            onClick={() => fetchLoansData(1)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Try Again
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <LoansTable
                                        loans={filteredLoans}
                                        selectedLoans={selectedLoans}
                                        onSelectLoan={handleSelectLoan}
                                        onSelectAll={handleSelectAll}
                                        allSelected={allSelected}
                                        onLoanClick={handleLoanClick}
                                    />

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-[#475467]">
                                                    Showing{" "}
                                                    <span className="font-semibold">
                                                        {(currentPage - 1) *
                                                            ITEMS_PER_PAGE +
                                                            1}
                                                    </span>{" "}
                                                    to{" "}
                                                    <span className="font-semibold">
                                                        {Math.min(
                                                            currentPage *
                                                                ITEMS_PER_PAGE,
                                                            totalLoans,
                                                        )}
                                                    </span>{" "}
                                                    of{" "}
                                                    <span className="font-semibold">
                                                        {totalLoans}
                                                    </span>{" "}
                                                    results
                                                </span>
                                            </div>

                                            <Pagination
                                                page={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onClose={removeToast} />

            {/* Dashboard Filters Modal */}
            <DashboardFiltersModal
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
                onApply={handleApplyFilters}
            />

            {/* Loan Details Modal */}
            {selectedLoanForDetails && (
                <LoansPageLoanDetailsModal
                    isOpen={true}
                    onClose={handleCloseDetailsModal}
                    loanData={selectedLoanForDetails}
                    onEdit={handleEditLoan}
                    onDelete={handleDeleteLoan}
                    onViewSchedule={handleViewSchedule}
                />
            )}

            {/* Payment Schedule Modal */}
            {selectedLoanForSchedule && (
                <PaymentScheduleModal
                    isOpen={true}
                    onClose={() => setSelectedLoanForSchedule(null)}
                    loanId={selectedLoanForSchedule}
                    payments={[]}
                />
            )}

            {/* Edit Loan Modal */}
            {selectedLoanForEdit && (
                <EditLoanModal
                    isOpen={true}
                    onClose={() => setSelectedLoanForEdit(null)}
                    onSave={handleSaveEdit}
                    loan={selectedLoanForEdit}
                />
            )}

            {/* Delete Confirmation Modal */}
            {selectedLoanForDelete && (
                <DeleteConfirmationModal
                    isOpen={true}
                    onClose={() => setSelectedLoanForDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Loan"
                    message="Are you sure you want to delete this loan? This action cannot be undone."
                />
            )}
        </div>
    );
}
