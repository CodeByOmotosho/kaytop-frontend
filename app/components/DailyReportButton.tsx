"use client";

import { useState } from "react";
import { FileText, Download, Calendar, X } from "lucide-react";
import { useDailyBranchReport } from "../hooks/useDailyBranchReport";

export function DailyReportButton() {
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const { downloadReport, isLoading, error } = useDailyBranchReport();

    const handleDownload = async () => {
        const success = await downloadReport(selectedDate);
        if (success) {
            setShowModal(false);
        }
    };

    return (
        <>
            {/* Button to open modal */}
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
                <FileText className="h-4 w-4" />
                Daily Report
            </button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowModal(false)}
                    />

                    {/* Modal content */}
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Download Daily Branch Report
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Date picker */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={
                                        selectedDate.toISOString().split("T")[0]
                                    }
                                    onChange={(e) =>
                                        setSelectedDate(
                                            new Date(e.target.value),
                                        )
                                    }
                                    max={new Date().toISOString().split("T")[0]}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Report will include all activities from this
                                date
                            </p>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={isLoading}
                                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Download
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Info note */}
                        <p className="text-xs text-gray-400 text-center mt-4">
                            The report will include all loans disbursed,
                            collections received, and savings activities for the
                            selected date.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
