"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { StatisticsCard } from "@/app/_components/ui/StatisticsCard";
import FilterControls from "@/app/_components/ui/FilterControls";
import type { TimePeriod } from "@/app/_components/ui/FilterControls";
import { ToastContainer } from "@/app/_components/ui/ToastContainer";
import { useToast } from "@/app/hooks/useToast";
import { StatisticsCardSkeleton } from "@/app/_components/ui/Skeleton";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { hqManagerService } from "@/lib/services/hq-manager.service";

// Types based on the actual API response
interface DashboardSummary {
    summary: {
        totalBranches: number;
        totalCustomers: number;
        totalCreditOfficers: number;
        totalLoans: number;
        totalSavings: number;
    };
    recentLoans: Array<{
        id: number;
        amount: string;
        status: string;
        customer: string;
        branch: string;
        createdAt: string;
    }>;
}

export default function HQManagerDashboard() {
    const { toasts, removeToast, error: showError } = useToast();
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
        null,
    );
    const [dashboardError, setDashboardError] = useState<string | null>(null);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            setDashboardError(null);

            console.log("📊 Fetching HQ dashboard summary...");
            const data = await hqManagerService.getDashboardSummary();
            console.log("✅ Dashboard data:", data);

            setDashboardData(data);
        } catch (error) {
            console.error("Failed to fetch HQ dashboard data:", error);
            setDashboardError(
                error instanceof Error
                    ? error.message
                    : "Failed to load dashboard data",
            );
            showError("Failed to load dashboard data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Load initial data
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Handle date range changes
    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        if (range?.from && range?.to) {
            // Note: API doesn't support date filtering, but we keep UI
            console.log("Date range selected:", range);
        }
    };

    // Handle time period changes
    const handleTimePeriodChange = (period: TimePeriod) => {
        setTimePeriod(period);
        if (period !== "custom") {
            setDateRange(undefined);
        }
    };

    // Transform summary data for StatisticsCard
    const getStatisticsSections = () => {
        if (!dashboardData) return [];

        const { summary } = dashboardData;

        return [
            {
                label: "All Branches",
                value: summary.totalBranches,
                change: 0,
                changeLabel: "Total branches",
                isCurrency: false,
            },
            {
                label: "All CO's",
                value: summary.totalCreditOfficers,
                change: 0,
                changeLabel: "Total credit officers",
                isCurrency: false,
            },
            {
                label: "All Customers",
                value: summary.totalCustomers,
                change: 0,
                changeLabel: "Total customers",
                isCurrency: false,
            },
            {
                label: "Total Loans",
                value: summary.totalLoans,
                change: 0,
                changeLabel: "Active loans",
                isCurrency: false,
            },
            {
                label: "Total Savings",
                value: summary.totalSavings,
                change: 0,
                changeLabel: "Savings balance",
                isCurrency: true,
            },
        ];
    };

    // Format currency
    const formatCurrency = (value: number) => {
        return `₦${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="drawer-content flex flex-col min-h-screen">
            <main
                className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6"
                style={{ paddingTop: "40px" }}
            >
                <div className="max-w-[1150px]">
                    {/* Page Header */}
                    <header>
                        <h1 className="text-2xl font-bold text-[#021C3E] mb-2">
                            Overview
                        </h1>
                        <p className="text-base font-medium text-[#021C3E] opacity-50 mb-12">
                            HQ & Portfolio Management
                        </p>
                    </header>

                    {/* Filter Controls - Keep UI but note filtering not implemented */}
                    <div className="mb-12">
                        <FilterControls
                            selectedPeriod={timePeriod}
                            onDateRangeChange={handleDateRangeChange}
                            onPeriodChange={handleTimePeriodChange}
                            onFilter={() => console.log("Filter clicked")}
                        />
                    </div>

                    {/* Statistics Section */}
                    <section
                        className="space-y-6"
                        aria-label="Dashboard statistics"
                    >
                        <div className="w-full max-w-[1091px]">
                            {isLoading ? (
                                <StatisticsCardSkeleton />
                            ) : dashboardError ? (
                                <div className="bg-white rounded-lg border border-[#EAECF0] p-6">
                                    <div className="text-center">
                                        <p className="text-[#E43535] mb-2">
                                            {dashboardError}
                                        </p>
                                        <button
                                            onClick={fetchDashboardData}
                                            className="text-[#7F56D9] hover:text-[#6941C6] font-medium"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <StatisticsCard
                                    sections={getStatisticsSections()}
                                />
                            )}
                        </div>
                    </section>

                    {/* Recent Loans Section */}
                    <section className="mt-8">
                        <h2 className="text-lg font-semibold text-[#101828] mb-4">
                            Recent Loans
                        </h2>

                        {isLoading ? (
                            <div className="bg-white rounded-lg border border-[#EAECF0] p-4 animate-pulse">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-16 bg-gray-200 rounded mb-2"
                                    ></div>
                                ))}
                            </div>
                        ) : dashboardData?.recentLoans.length === 0 ? (
                            <EmptyState
                                title="No recent loans"
                                message="There are no loans to display at this time."
                            />
                        ) : (
                            <div className="bg-white rounded-lg border border-[#EAECF0] overflow-hidden">
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
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                Branch
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData?.recentLoans.map(
                                            (loan, index) => (
                                                <tr
                                                    key={loan.id}
                                                    className={
                                                        index <
                                                        dashboardData
                                                            .recentLoans
                                                            .length -
                                                            1
                                                            ? "border-b border-gray-200"
                                                            : ""
                                                    }
                                                >
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {loan.customer}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600">
                                                            {formatCurrency(
                                                                parseFloat(
                                                                    loan.amount,
                                                                ),
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                loan.status ===
                                                                "active"
                                                                    ? "bg-green-50 text-green-700"
                                                                    : loan.status ===
                                                                        "pending"
                                                                      ? "bg-yellow-50 text-yellow-700"
                                                                      : "bg-gray-50 text-gray-700"
                                                            }`}
                                                        >
                                                            {loan.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600">
                                                            {loan.branch}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600">
                                                            {new Date(
                                                                loan.createdAt,
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* Summary Cards */}
                    <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {isLoading ? (
                            <>
                                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                            </>
                        ) : (
                            dashboardData && (
                                <>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Total Branches
                                        </p>
                                        <p className="text-2xl font-bold text-[#021C3E]">
                                            {
                                                dashboardData.summary
                                                    .totalBranches
                                            }
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Total Customers
                                        </p>
                                        <p className="text-2xl font-bold text-[#021C3E]">
                                            {
                                                dashboardData.summary
                                                    .totalCustomers
                                            }
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Credit Officers
                                        </p>
                                        <p className="text-2xl font-bold text-[#021C3E]">
                                            {
                                                dashboardData.summary
                                                    .totalCreditOfficers
                                            }
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Total Savings
                                        </p>
                                        <p className="text-2xl font-bold text-[#021C3E]">
                                            {formatCurrency(
                                                dashboardData.summary
                                                    .totalSavings,
                                            )}
                                        </p>
                                    </div>
                                </>
                            )
                        )}
                    </section>
                </div>
            </main>

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </div>
    );
}
