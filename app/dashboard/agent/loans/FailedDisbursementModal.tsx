// components/loans/FailedDisbursementModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, X, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { LoanService } from "@/app/services/loanService";
import { Modal } from "@/app/_components/ui/Modal";

interface PendingLoan {
    id: number;
    customerName: string;
    amount: number;
    term: number;
    interestRate: number;
    dailyRepayment: number;
    totalRepayable: number;
    status: string;
}

interface FailedDisbursementModalProps {
    open: boolean;
    onClose: () => void;
}

export default function FailedDisbursementModal({
    open,
    onClose,
}: FailedDisbursementModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [pendingLoans, setPendingLoans] = useState<PendingLoan[]>([]);
    const [selectedLoan, setSelectedLoan] = useState<PendingLoan | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isDisbursing, setIsDisbursing] = useState(false);

    // Load pending loans when modal opens
    useEffect(() => {
        if (open) {
            loadPendingLoans();
        } else {
            // Reset state when modal closes
            setPendingLoans([]);
            setSelectedLoan(null);
            setFile(null);
        }
    }, [open]);

    const loadPendingLoans = async () => {
        setIsLoading(true);
        try {
            const response = await LoanService.getPendingLoans();
            // Assuming the response structure is { loans: [], total: number, totalPages: number }
            setPendingLoans(response.loans || []);

            if (response.loans?.length === 0) {
                toast.success("No pending loans found");
            }
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                    "Failed to load pending loans",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisburse = async () => {
        if (!selectedLoan || !file) {
            toast.error("Please select a loan and upload proof");
            return;
        }

        setIsDisbursing(true);
        try {
            const formData = new FormData();
            formData.append("disbursementProof", file);

            await LoanService.disburseLoan(selectedLoan.id, formData);

            toast.success("Loan disbursed successfully");

            // Remove the disbursed loan from the list
            setPendingLoans((prev) =>
                prev.filter((loan) => loan.id !== selectedLoan.id),
            );
            setSelectedLoan(null);
            setFile(null);

            if (pendingLoans.length === 1) {
                // If this was the last loan, close the modal
                onClose();
            }
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || "Failed to disburse loan",
            );
        } finally {
            setIsDisbursing(false);
        }
    };

    const resetSelection = () => {
        setSelectedLoan(null);
        setFile(null);
    };

    const formatCurrency = (amount: number) => {
        return `₦${amount.toLocaleString()}`;
    };

    return (
        <Modal open={open} onClose={onClose} title="Failed Loan Disbursements">
            <div className="space-y-6">
                {!selectedLoan ? (
                    // List view of pending loans
                    <>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
                                <p className="text-gray-500">
                                    Loading pending loans...
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Header with count */}
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        {pendingLoans.length} pending loan(s)
                                        found
                                    </p>
                                    <button
                                        onClick={loadPendingLoans}
                                        className="text-sm text-purple-600 hover:text-purple-700"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                {/* Pending loans list */}
                                {pendingLoans.length > 0 ? (
                                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                                        {pendingLoans.map((loan) => (
                                            <div
                                                key={loan.id}
                                                className="border rounded-lg p-4 hover:border-purple-300 hover:shadow-sm cursor-pointer transition-all"
                                                onClick={() =>
                                                    setSelectedLoan(loan)
                                                }
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold text-gray-900">
                                                            {loan.customerName}
                                                        </h4>
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-gray-600">
                                                                Amount:{" "}
                                                                <span className="font-medium">
                                                                    {formatCurrency(
                                                                        loan.amount,
                                                                    )}
                                                                </span>
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                Term:{" "}
                                                                <span className="font-medium">
                                                                    {loan.term}{" "}
                                                                    days
                                                                </span>
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                Interest:{" "}
                                                                <span className="font-medium">
                                                                    {
                                                                        loan.interestRate
                                                                    }
                                                                    %
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                                        {loan.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">
                                            No pending loans found
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            All loans have been processed
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    // Disbursement view for selected loan
                    <div className="space-y-6">
                        {/* Selected loan info */}
                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900 text-lg">
                                        {selectedLoan.customerName}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Loan Amount
                                            </p>
                                            <p className="font-medium">
                                                {formatCurrency(
                                                    selectedLoan.amount,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Term
                                            </p>
                                            <p className="font-medium">
                                                {selectedLoan.term} days
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Interest Rate
                                            </p>
                                            <p className="font-medium">
                                                {selectedLoan.interestRate}%
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Status
                                            </p>
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full inline-block">
                                                {selectedLoan.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={resetSelection}
                                    className="p-2 hover:bg-purple-200 rounded-full transition-colors"
                                    title="Go back"
                                >
                                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Daily Payment */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Daily Payment
                            </label>
                            <div className="w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm font-semibold">
                                {formatCurrency(selectedLoan.dailyRepayment)}
                            </div>
                        </div>

                        {/* Total Repayment */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Total Repayment
                            </label>
                            <div className="w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm font-semibold">
                                {formatCurrency(selectedLoan.totalRepayable)}
                            </div>
                        </div>

                        {/* Disbursement Proof */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Disbursement Proof{" "}
                                <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="file"
                                id="disbursementFile"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) =>
                                    setFile(e.target.files?.[0] || null)
                                }
                            />

                            <label
                                htmlFor="disbursementFile"
                                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all group"
                            >
                                <div className="p-3 bg-purple-100 rounded-full text-purple-600 group-hover:bg-purple-200 transition-colors">
                                    <UploadCloud className="w-6 h-6" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-purple-600 font-medium">
                                        Click to upload
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        or drag and drop (PNG, JPG, PDF - max
                                        5MB)
                                    </p>
                                    {file && (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 bg-white px-3 py-2 rounded-lg border">
                                            <span className="truncate max-w-[200px]">
                                                {file.name}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setFile(null);
                                                }}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                onClick={resetSelection}
                                className="flex-1 border rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
                            >
                                Back to List
                            </button>
                            <button
                                onClick={handleDisburse}
                                disabled={!file || isDisbursing}
                                className="flex-1 bg-purple-600 text-white rounded-lg py-2.5 text-sm disabled:opacity-50 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {isDisbursing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Disburse Loan"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
