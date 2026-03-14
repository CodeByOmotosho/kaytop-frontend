"use client";

import { usePageChange } from "@/app/hooks/usePageChange";

import { useBranchCustomer } from "../../bm/queries/customers/useBranchCustomer";
import { CustomerMetric } from "@/app/_components/ui/CustomerMetric";
import { CustomerHeader } from "@/app/_components/ui/CustomerHeader";
import { CustomerTable } from "@/app/_components/ui/CustomerTable";
import { PaginationKey, MetricProps } from "@/app/types/dashboard";
import { AxiosError } from "axios";
import { DashboardKpiResponse } from "@/app/types/dashboard";
import { useOfficerDashboard } from "@/app/hooks/useOfficerDashboard";

function getCustomerMetricsFromOfficerData(
    data?: any,
    customerCount: number = 0,
): MetricProps[] {
    if (!data?.metrics) return [];

    const metrics = data.metrics;

    return [
        {
            title: "My Customers",
            value: customerCount.toString(),
            change: `+${customerCount}`,
            changeColor: customerCount > 0 ? "green" : "red",
            border: true,
        },
        {
            title: "Active Loans",
            value: metrics.disbursedLoans?.toString() || "0",
            change: `${metrics.collectionRate || 0}% collecting`,
            changeColor: (metrics.collectionRate || 0) > 70 ? "green" : "red",
            border: true,
        },
        {
            title: "Savings Balance",
            value: `₦${((metrics.totalDeposits || 0) - (metrics.totalWithdrawals || 0)).toLocaleString()}`,
            change: `₦${metrics.netSavingsFlow?.toLocaleString() || "0"} this period`,
            changeColor: (metrics.netSavingsFlow || 0) > 0 ? "green" : "red",
            border: true,
        },
    ];
}

export default function CustomerAgentClient() {
    const { isLoading, error, data } = useOfficerDashboard();
    const {
        data: customer,
        isLoading: isLoadingCustomer,
        error: customerError,
    } = useBranchCustomer();

    // Get total customers from the customer data meta
    const totalCustomers = customer?.meta?.total || 0;

    const metricData = getCustomerMetricsFromOfficerData(data, totalCustomers);
    const { handlePageChange } = usePageChange();

    return (
        <div className="space-y-6 px-6">
            <CustomerHeader
                data={
                    data
                        ? { branch: data.officerInfo?.branch || "" }
                        : undefined
                }
                isLoading={isLoading}
            />

            <CustomerMetric
                item={metricData}
                cols={3}
                isLoading={isLoading}
                error={error as AxiosError<DashboardKpiResponse> | null}
            />

            <div className="bg-white rounded-xl border overflow-hidden">
                <CustomerTable
                    isLoading={isLoadingCustomer}
                    error={customerError}
                    item={customer?.data}
                    meta={customer?.meta}
                    onPageChange={(page) =>
                        handlePageChange(
                            page,
                            PaginationKey.branch_customer_page,
                        )
                    }
                />
            </div>
        </div>
    );
}
