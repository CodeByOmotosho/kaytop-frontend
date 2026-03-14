import { OfficerDashboardResponse } from "@/app/types/codashboard";
import { MetricProps } from "@/app/types/dashboard";

export function getOfficerMetricItems(
    data?: OfficerDashboardResponse,
): MetricProps[] {
    if (!data?.metrics) return [];

    const metrics = data.metrics;

    // Calculate meaningful changes based on targets
    const loanTarget = 10; // Example: target 10 loans per period
    const disbursedTarget = 500000; // Example: target ₦500,000 disbursed
    const collectedTarget = 400000; // Example: target ₦400,000 collected
    const approvalTarget = 80; // Target 80% approval rate

    // Calculate percentage of target achieved
    const loanChange =
        ((metrics.totalLoans / loanTarget) * 100).toFixed(0) + "%";
    const disbursedChange =
        ((metrics.disbursedValue / disbursedTarget) * 100).toFixed(0) + "%";
    const collectedChange =
        ((metrics.collectedValue / collectedTarget) * 100).toFixed(0) + "%";

    // Compare current approval rate to target
    const approvalChange =
        metrics.approvalRate - approvalTarget > 0
            ? `+${(metrics.approvalRate - approvalTarget).toFixed(0)}%`
            : `${(metrics.approvalRate - approvalTarget).toFixed(0)}%`;

    return [
        {
            title: "My Loans",
            value: metrics.totalLoans.toString(),
            change: loanChange,
            changeColor: metrics.totalLoans >= loanTarget ? "green" : "red",
            border: true,
        },
        {
            title: "Disbursed",
            value: `₦${metrics.disbursedValue.toLocaleString()}`,
            change: disbursedChange,
            changeColor:
                metrics.disbursedValue >= disbursedTarget ? "green" : "red",
            border: true,
        },
        {
            title: "Collected",
            value: `₦${metrics.collectedValue.toLocaleString()}`,
            change: collectedChange,
            changeColor:
                metrics.collectedValue >= collectedTarget ? "green" : "red",
            border: true,
        },
        {
            title: "Recollection Rate",
            value: `${metrics.collectionRate}%`,
            change: approvalChange,
            changeColor:
                metrics.collectionRate >= approvalTarget ? "green" : "red",
            border: true,
        },
    ];
}
