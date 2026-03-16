import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";

export function useDailyBranchReport() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const downloadReport = async (date?: Date) => {
        setIsLoading(true);
        setError(null);

        const dateStr = date
            ? date.toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];

        try {
            const response = await apiClient.get(
                `${apiBaseUrl}/reports/daily-branch/pdf`,
                {
                    params: { date: dateStr },
                    responseType: "blob",
                },
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `branch-report-${dateStr}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Cleanup
            window.URL.revokeObjectURL(url);

            return true;
        } catch (err) {
            console.error("Failed to download report:", err);
            setError("Failed to generate report. Please try again.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { downloadReport, isLoading, error };
}
