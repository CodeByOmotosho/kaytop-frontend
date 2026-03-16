"use client";

import { useState } from "react";
import { Download, X, Loader2, Building2 } from "lucide-react";

import { useHQDailyReport } from "../hooks/useHQDailyReport";
import { useHQBranches } from "../hooks/useHQBranches";

export function HQBranchReportButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const { data, isLoading: branchesLoading } = useHQBranches();
    const branches = data?.branches || [];

    const { downloadBranchReport, isLoading: downloadLoading } =
        useHQDailyReport();

    const handleDownload = async () => {
        if (!selectedBranch) {
            alert("Please select a branch");
            return;
        }

        const success = await downloadBranchReport(
            selectedBranch,
            selectedDate,
        );
        if (success) {
            setIsModalOpen(false);
            setSelectedBranch("");
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
                <Download className="h-4 w-4" />
                Download Branch Report
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsModalOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Download Branch Report
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Date Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Date
                            </label>
                            <input
                                type="date"
                                value={selectedDate.toISOString().split("T")[0]}
                                onChange={(e) =>
                                    setSelectedDate(new Date(e.target.value))
                                }
                                max={new Date().toISOString().split("T")[0]}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Branch Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Branch
                            </label>

                            {branchesLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                                </div>
                            ) : branches.length === 0 ? (
                                <p className="text-center py-4 text-sm text-gray-500">
                                    No branches assigned
                                </p>
                            ) : (
                                <select
                                    value={selectedBranch}
                                    onChange={(e) =>
                                        setSelectedBranch(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Choose a branch</option>
                                    {branches.map((branch) => (
                                        <option
                                            key={branch.name}
                                            value={branch.name}
                                        >
                                            {branch.name} (
                                            {branch.customerCount} customers ·{" "}
                                            {branch.officerCount} officers)
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={downloadLoading || !selectedBranch}
                                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 flex items-center justify-center gap-2"
                            >
                                {downloadLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Download
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
