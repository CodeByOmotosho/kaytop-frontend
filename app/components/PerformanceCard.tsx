import { TrendingUp, TrendingDown } from "lucide-react";
import { OfficerPerformance } from "../types/codashboard";

interface PerformanceCardProps {
    performance: OfficerPerformance;
}

export function PerformanceCard({ performance }: PerformanceCardProps) {
    const metrics = [
        {
            label: "Approval Rate",
            value: `${performance.approvalRate}%`,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            label: "Collection Rate",
            value: `${performance.collectionRate}%`,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Loans Processed",
            value: performance.totalLoansProcessed,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
        {
            label: "Value Processed",
            value: `₦${performance.totalValueProcessed.toLocaleString()}`,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
                <div key={index} className={`${metric.bg} rounded-lg p-4`}>
                    <p className="text-sm text-gray-600">{metric.label}</p>
                    <p className={`text-xl font-bold ${metric.color}`}>
                        {metric.value}
                    </p>
                </div>
            ))}
        </div>
    );
}
