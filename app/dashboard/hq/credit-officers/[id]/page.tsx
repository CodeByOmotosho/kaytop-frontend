"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { hqManagerService } from "@/lib/services/hq-manager.service";
import { useToast } from "@/app/hooks/useToast";
import { ToastContainer } from "@/app/_components/ui/ToastContainer";
import { PageSkeleton } from "@/app/_components/ui/Skeleton";
import FilterControls from "@/app/_components/ui/FilterControls";
import type { TimePeriod } from "@/app/_components/ui/FilterControls";
import { DateRange } from "react-day-picker";

interface PageProps {
    params: Promise<{ id: string }>;
}

// Types based on the actual API responses
interface DisbursedLoansResponse {
    success: boolean;
    data: {
        loans: any[]; // Empty array in the response
        summary: {
            officerId: number;
            totalLoansDisbursed: number;
            totalAmountDisbursed: number;
            averageLoanSize: number;
            totalAmountRepaid: number;
            totalOutstandingBalance: number;
            activeLoans: number;
            completedLoans: number;
            repaymentRate: number;
        };
        dateRange: {
            start: string;
            end: string;
        };
    };
}

interface CollectionsResponse {
    success: boolean;
    data: {
        collections: any[]; // Empty array in the response
        summary: {
            officerId: number;
            totalCollections: number;
            totalAmountCollected: number;
            directRepayments: {
                count: number;
                amount: number;
                percentage: number;
            };
            loanCoverageFromSavings: {
                count: number;
                amount: number;
                percentage: number;
            };
            lateCollections: number;
            onTimeCollections: number;
            collectionEfficiencyRate: number;
            averageCollectionAmount: number;
        };
        dateRange: {
            start: string;
            end: string;
        };
    };
}

export default function CreditOfficerDetailsPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { toasts, removeToast, error: showError } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"disbursed" | "collections">(
        "disbursed",
    );

    // Filter state
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    // Data state
    const [disbursedData, setDisbursedData] = useState<
        DisbursedLoansResponse["data"] | null
    >(null);
    const [collectionsData, setCollectionsData] = useState<
        CollectionsResponse["data"] | null
    >(null);

    // Fetch disbursed loans
    const fetchDisbursedLoans = async () => {
        try {
            const params: any = {};

            if (selectedPeriod && selectedPeriod !== "custom") {
                params.timeFilter = selectedPeriod;
            } else if (dateRange?.from && dateRange?.to) {
                params.startDate = dateRange.from.toISOString().split("T")[0];
                params.endDate = dateRange.to.toISOString().split("T")[0];
            }

            const response = await hqManagerService.getOfficerDisbursedLoans(
                parseInt(id),
                params,
            );
            setDisbursedData(response.data);
        } catch (err) {
            console.error("Failed to fetch disbursed loans:", err);
        }
    };

    // Fetch collections
    const fetchCollections = async () => {
        try {
            const params: any = {};

            if (selectedPeriod && selectedPeriod !== "custom") {
                params.timeFilter = selectedPeriod;
            } else if (dateRange?.from && dateRange?.to) {
                params.startDate = dateRange.from.toISOString().split("T")[0];
                params.endDate = dateRange.to.toISOString().split("T")[0];
            }

            const response = await hqManagerService.getOfficerCollections(
                parseInt(id),
                params,
            );
            setCollectionsData(response.data);
        } catch (err) {
            console.error("Failed to fetch collections:", err);
        }
    };

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([fetchDisbursedLoans(), fetchCollections()]);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load data",
                );
                showError("Failed to load credit officer details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            loadData();
        }
    }, [id]);

    // Refetch when filters change
    useEffect(() => {
        if (!isLoading) {
            if (activeTab === "disbursed") {
                fetchDisbursedLoans();
            } else {
                fetchCollections();
            }
        }
    }, [selectedPeriod, dateRange]);

    const handleBack = () => {
        router.push("/dashboard/hq/credit-officers");
    };

    const handlePeriodChange = (period: TimePeriod) => {
        setSelectedPeriod(period);
        if (period !== "custom") {
            setDateRange(undefined);
        }
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        if (range) {
            setSelectedPeriod("custom");
        }
    };

    // Get active data based on tab
    const activeData =
        activeTab === "disbursed" ? disbursedData : collectionsData;

    if (isLoading) {
        return <PageSkeleton />;
    }

    if (error) {
        return (
            <div className="drawer-content flex flex-col min-h-screen">
                <main className="flex-1 pl-[58px] pr-6 pt-6">
                    <div className="max-w-[1200px]">
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="text-center max-w-md">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Error Loading Officer
                                </h2>
                                <p className="text-gray-600 mb-6">{error}</p>
                                <button
                                    onClick={handleBack}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#7F56D9] rounded-lg hover:bg-[#6941C6]"
                                >
                                    Back to Credit Officers
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="drawer-content flex flex-col min-h-screen">
            <main
                className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6"
                style={{ paddingTop: "40px" }}
            >
                <div className="w-full" style={{ maxWidth: "1200px" }}>
                    {/* Back Button */}
                    <button
                        onClick={handleBack}
                        className="mb-6 hover:opacity-70 transition-opacity flex items-center gap-2"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                        >
                            <path
                                d="M15.8334 10H4.16669M4.16669 10L10 15.8333M4.16669 10L10 4.16667"
                                stroke="#000000"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span className="text-sm text-gray-600">
                            Back to Credit Officers
                        </span>
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-[#021C3E] mb-2">
                            Credit Officer Details
                        </h1>
                        <p className="text-base text-[#021C3E] opacity-50">
                            Officer ID: {id}
                        </p>
                    </div>

                    {/* Summary Cards - Disbursed Loans */}
                    {disbursedData && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">
                                    Total Disbursed
                                </p>
                                <p className="text-2xl font-bold text-[#021C3E]">
                                    {formatCurrency(
                                        disbursedData.summary
                                            .totalAmountDisbursed,
                                    )}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {disbursedData.summary.totalLoansDisbursed}{" "}
                                    loans
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">
                                    Outstanding Balance
                                </p>
                                <p className="text-2xl font-bold text-[#021C3E]">
                                    {formatCurrency(
                                        disbursedData.summary
                                            .totalOutstandingBalance,
                                    )}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Active: {disbursedData.summary.activeLoans}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">
                                    Amount Repaid
                                </p>
                                <p className="text-2xl font-bold text-[#021C3E]">
                                    {formatCurrency(
                                        disbursedData.summary.totalAmountRepaid,
                                    )}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Completed:{" "}
                                    {disbursedData.summary.completedLoans}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">
                                    Repayment Rate
                                </p>
                                <p className="text-2xl font-bold text-[#021C3E]">
                                    {disbursedData.summary.repaymentRate}%
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Avg loan:{" "}
                                    {formatCurrency(
                                        disbursedData.summary.averageLoanSize,
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Summary Cards - Collections */}
                    {collectionsData && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">
                                    Total Collections
                                </p>
                                <p className="text-2xl font-bold text-[#021C3E]">
                                    {formatCurrency(
                                        collectionsData.summary
                                            .totalAmountCollected,
                                    )}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {collectionsData.summary.totalCollections}{" "}
                                    collections
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">
                                    Collection Efficiency
                                </p>
                                <p className="text-2xl font-bold text-[#021C3E]">
                                    {
                                        collectionsData.summary
                                            .collectionEfficiencyRate
                                    }
                                    %
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    On time:{" "}
                                    {collectionsData.summary.onTimeCollections}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">
                                    Direct Repayments
                                </p>
                                <p className="text-2xl font-bold text-[#021C3E]">
                                    {formatCurrency(
                                        collectionsData.summary.directRepayments
                                            .amount,
                                    )}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {
                                        collectionsData.summary.directRepayments
                                            .count
                                    }{" "}
                                    payments
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">
                                    Savings Coverage
                                </p>
                                <p className="text-2xl font-bold text-[#021C3E]">
                                    {formatCurrency(
                                        collectionsData.summary
                                            .loanCoverageFromSavings.amount,
                                    )}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {
                                        collectionsData.summary
                                            .loanCoverageFromSavings.count
                                    }{" "}
                                    loans
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Filter Controls */}
                    <div className="mb-6">
                        <FilterControls
                            selectedPeriod={selectedPeriod}
                            onPeriodChange={handlePeriodChange}
                            onDateRangeChange={handleDateRangeChange}
                            onFilter={() => {}}
                        />
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 border-b border-gray-200">
                        <nav className="flex gap-6">
                            <button
                                onClick={() => setActiveTab("disbursed")}
                                className={`pb-2 px-1 text-sm font-medium ${
                                    activeTab === "disbursed"
                                        ? "text-[#7F56D9] border-b-2 border-[#7F56D9]"
                                        : "text-gray-500"
                                }`}
                            >
                                Disbursed Loans (
                                {disbursedData?.summary.totalLoansDisbursed ||
                                    0}
                                )
                            </button>
                            <button
                                onClick={() => setActiveTab("collections")}
                                className={`pb-2 px-1 text-sm font-medium ${
                                    activeTab === "collections"
                                        ? "text-[#7F56D9] border-b-2 border-[#7F56D9]"
                                        : "text-gray-500"
                                }`}
                            >
                                Collections (
                                {collectionsData?.summary.totalCollections || 0}
                                )
                            </button>
                        </nav>
                    </div>

                    {/* Date Range Info */}
                    {activeData?.dateRange && (
                        <div className="mb-4 text-sm text-gray-500">
                            Showing data from{" "}
                            {formatDate(activeData.dateRange.start)} to{" "}
                            {formatDate(activeData.dateRange.end)}
                        </div>
                    )}

                    {/* Tab Content */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {activeTab === "disbursed" && (
                            <>
                                {!disbursedData?.loans ||
                                disbursedData.loans.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <p className="text-gray-500">
                                            No disbursed loans found for this
                                            period
                                        </p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Customer
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Principal
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Interest
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Total Repayable
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Amount Paid
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Remaining
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Disbursed
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Interest Amt
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {disbursedData.loans.map(
                                                (loan: any, index: number) => (
                                                    <tr
                                                        key={loan.id}
                                                        className={
                                                            index <
                                                            disbursedData.loans
                                                                .length -
                                                                1
                                                                ? "border-b border-gray-200"
                                                                : ""
                                                        }
                                                    >
                                                        <td className="px-6 py-4 text-sm text-gray-900">
                                                            {loan.customerName}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {formatCurrency(
                                                                parseFloat(
                                                                    loan.principal,
                                                                ),
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {loan.interestRate}%
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {formatCurrency(
                                                                parseFloat(
                                                                    loan.totalRepayable,
                                                                ),
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {formatCurrency(
                                                                parseFloat(
                                                                    loan.amountPaid,
                                                                ),
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {formatCurrency(
                                                                parseFloat(
                                                                    loan.remainingBalance,
                                                                ),
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                    loan.status ===
                                                                    "active"
                                                                        ? "bg-green-50 text-green-700"
                                                                        : loan.status ===
                                                                            "completed"
                                                                          ? "bg-blue-50 text-blue-700"
                                                                          : "bg-yellow-50 text-yellow-700"
                                                                }`}
                                                            >
                                                                {loan.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {formatDate(
                                                                loan.disbursementDate,
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {formatCurrency(
                                                                loan.interestAmount,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}

                        {activeTab === "collections" && (
                            <>
                                {!collectionsData?.collections ||
                                collectionsData.collections.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <p className="text-gray-500">
                                            No collections found for this period
                                        </p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Customer
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Branch
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                    Collected Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {collectionsData.collections.map(
                                                (
                                                    collection: any,
                                                    index: number,
                                                ) => (
                                                    <tr
                                                        key={collection.id}
                                                        className={
                                                            index <
                                                            collectionsData
                                                                .collections
                                                                .length -
                                                                1
                                                                ? "border-b border-gray-200"
                                                                : ""
                                                        }
                                                    >
                                                        <td className="px-6 py-4 text-sm text-gray-900">
                                                            {
                                                                collection.customer
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {formatCurrency(
                                                                parseFloat(
                                                                    collection.amount,
                                                                ),
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {collection.branch}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {collection.type ===
                                                            "direct"
                                                                ? "Direct Repayment"
                                                                : "Savings Coverage"}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                    collection.status ===
                                                                    "on_time"
                                                                        ? "bg-green-50 text-green-700"
                                                                        : "bg-yellow-50 text-yellow-700"
                                                                }`}
                                                            >
                                                                {collection.status ===
                                                                "on_time"
                                                                    ? "On Time"
                                                                    : "Late"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {formatDate(
                                                                collection.collectedDate,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </div>
    );
}
