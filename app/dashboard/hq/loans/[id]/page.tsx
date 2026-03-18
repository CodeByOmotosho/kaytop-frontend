/**
 * Loan Details Page
 * Display comprehensive loan information including customer, officer, and repayment details
 */

"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { hqManagerService } from "@/lib/services/hq-manager.service";
import { useToast } from "@/app/hooks/useToast";
import { ToastContainer } from "@/app/_components/ui/ToastContainer";

interface PageProps {
    params: Promise<{ id: string }>;
}

// Types based on the API response
interface ApiLoanDetails {
    id: number;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        mobileNumber: string;
        address: string;
        role: string;
        dob: string | null;
        isVerified: boolean;
        accountStatus: string;
        profilePicture: string | null;
        state: string;
        branch: string;
        guarantorName: string | null;
        guarantorEmail: string | null;
        guarantorPhone: string | null;
        guarantorAddress: string | null;
        guarantorPicture: string | null;
        verificationStatus: string;
        createdAt: string;
    };
    createdBy: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        mobileNumber: string;
        role: string;
        branch: string;
        verificationStatus: string;
        createdAt: string;
    };
    amount: string;
    interestRate: string;
    term: number;
    totalRepayable: string;
    dailyRepayment: string;
    status: string;
    disbursementProof: string | null;
    disbursementProofPublicId: string | null;
    disbursementDate: string | null;
    dueDate: string | null;
    amountPaid: string;
    remainingBalance: string;
    daysOverdue: number;
    createdAt: string;
    repayments: any[];
}

export default function LoanDetailsPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { toasts, removeToast, error } = useToast();

    const [loanDetails, setLoanDetails] = useState<ApiLoanDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<
        "details" | "repayments" | "documents"
    >("details");

    // Fetch loan details
    const fetchLoanDetails = async () => {
        try {
            setIsLoading(true);
            setApiError(null);

            console.log(
                `💰 Fetching loan details for ID: ${id} using HQ Manager Service...`,
            );

            const response = await hqManagerService.getLoanById(parseInt(id));
            console.log("✅ Loan details received:", response);

            setLoanDetails(response);
        } catch (err) {
            console.error("❌ Failed to fetch loan details:", err);
            setApiError(
                err instanceof Error
                    ? err.message
                    : "Failed to load loan details",
            );
            error("Failed to load loan details. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLoanDetails();
    }, [id]);

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-green-50 text-green-700 border-green-200";
            case "pending":
                return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "completed":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "rejected":
            case "defaulted":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    // Format date safely
    const formatDateSafe = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return formatDate(dateString);
    };

    if (isLoading || !loanDetails) {
        return (
            <div className="drawer-content flex flex-col min-h-screen">
                <main
                    className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6"
                    style={{ paddingTop: "40px" }}
                >
                    <div className="w-full" style={{ maxWidth: "1200px" }}>
                        <div className="animate-pulse">
                            {/* Back button skeleton */}
                            <div className="h-6 w-24 bg-gray-200 rounded mb-6"></div>

                            {/* Header skeleton */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                </div>
                                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                            </div>

                            {/* Customer and Officer Info Cards */}
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="h-48 bg-gray-200 rounded"></div>
                                <div className="h-48 bg-gray-200 rounded"></div>
                            </div>

                            {/* Loan Details Grid */}
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-24 bg-gray-200 rounded"
                                    ></div>
                                ))}
                            </div>

                            {/* Tabs skeleton */}
                            <div className="h-12 bg-gray-200 rounded mb-6"></div>

                            {/* Content skeleton */}
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </main>
                <ToastContainer toasts={toasts} onClose={removeToast} />
            </div>
        );
    }

    const loan = loanDetails;
    const customer = loan.user;
    const officer = loan.createdBy;

    // Calculate loan progress
    const amountPaid = parseFloat(loan.amountPaid);
    const totalRepayable = parseFloat(loan.totalRepayable);
    const remainingBalance = parseFloat(loan.remainingBalance);
    const progressPercentage = (amountPaid / totalRepayable) * 100;

    return (
        <div className="drawer-content flex flex-col min-h-screen">
            <main
                className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6"
                style={{ paddingTop: "40px" }}
            >
                <div className="w-full" style={{ maxWidth: "1200px" }}>
                    {/* Back Button */}
                    <button
                        onClick={() => router.push("/dashboard/hq/loans")}
                        className="mb-6 hover:opacity-70 transition-opacity flex items-center gap-2"
                        aria-label="Go back to loans list"
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
                            Back to Loans
                        </span>
                    </button>

                    {/* Header with Status */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-[#021C3E] mb-2">
                                Loan Details
                            </h1>
                            <p className="text-base text-[#021C3E] opacity-50">
                                Loan ID: {loan.id} • Created{" "}
                                {formatDateSafe(loan.createdAt)}
                            </p>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(loan.status)}`}
                        >
                            {loan.status.charAt(0).toUpperCase() +
                                loan.status.slice(1)}
                        </span>
                    </div>

                    {/* Customer and Officer Info Cards */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        {/* Customer Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start gap-4">
                                {customer.profilePicture ? (
                                    <div className="w-16 h-16 rounded-full overflow-hidden">
                                        <Image
                                            src={customer.profilePicture}
                                            alt={customer.firstName}
                                            width={64}
                                            height={64}
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-2xl text-gray-500">
                                            {customer.firstName[0]}
                                            {customer.lastName[0]}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-1">
                                        {customer.firstName} {customer.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Customer • {customer.branch}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-500">
                                                Email
                                            </p>
                                            <p className="font-medium truncate">
                                                {customer.email}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">
                                                Phone
                                            </p>
                                            <p className="font-medium">
                                                {customer.mobileNumber}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Guarantor Info (if available) */}
                            {customer.guarantorName && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm font-medium mb-2">
                                        Guarantor Information
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-500">
                                                Name
                                            </p>
                                            <p className="font-medium">
                                                {customer.guarantorName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">
                                                Phone
                                            </p>
                                            <p className="font-medium">
                                                {customer.guarantorPhone ||
                                                    "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Credit Officer Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-2xl text-blue-600">
                                        {officer.firstName[0]}
                                        {officer.lastName[0]}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-1">
                                        {officer.firstName} {officer.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Credit Officer • {officer.branch}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-500">
                                                Email
                                            </p>
                                            <p className="font-medium truncate">
                                                {officer.email}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">
                                                Phone
                                            </p>
                                            <p className="font-medium">
                                                {officer.mobileNumber}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loan Summary Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm text-gray-500 mb-1">
                                Loan Amount
                            </p>
                            <p className="text-xl font-bold text-[#021C3E]">
                                {formatCurrency(parseFloat(loan.amount))}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm text-gray-500 mb-1">
                                Interest Rate
                            </p>
                            <p className="text-xl font-bold text-[#021C3E]">
                                {loan.interestRate}%
                            </p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm text-gray-500 mb-1">Term</p>
                            <p className="text-xl font-bold text-[#021C3E]">
                                {loan.term} days
                            </p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm text-gray-500 mb-1">
                                Daily Repayment
                            </p>
                            <p className="text-xl font-bold text-[#021C3E]">
                                {formatCurrency(
                                    parseFloat(loan.dailyRepayment),
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Loan Progress */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">
                                Loan Repayment Progress
                            </h3>
                            <span className="text-sm text-gray-500">
                                {formatCurrency(amountPaid)} paid of{" "}
                                {formatCurrency(totalRepayable)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Total Repayable</p>
                                <p className="font-semibold">
                                    {formatCurrency(totalRepayable)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Amount Paid</p>
                                <p className="font-semibold text-green-600">
                                    {formatCurrency(amountPaid)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">
                                    Remaining Balance
                                </p>
                                <p className="font-semibold text-orange-600">
                                    {formatCurrency(remainingBalance)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Loan Details Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm text-gray-500 mb-1">
                                Disbursement Date
                            </p>
                            <p className="font-medium">
                                {formatDateSafe(loan.disbursementDate)}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm text-gray-500 mb-1">
                                Due Date
                            </p>
                            <p className="font-medium">
                                {formatDateSafe(loan.dueDate)}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm text-gray-500 mb-1">
                                Days Overdue
                            </p>
                            <p
                                className={`font-medium ${loan.daysOverdue > 0 ? "text-red-600" : "text-green-600"}`}
                            >
                                {loan.daysOverdue > 0
                                    ? `${loan.daysOverdue} days`
                                    : "None"}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="flex gap-6">
                            <button
                                onClick={() => setActiveTab("details")}
                                className={`pb-2 px-1 text-sm font-medium transition-colors ${
                                    activeTab === "details"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Loan Details
                            </button>
                            <button
                                onClick={() => setActiveTab("repayments")}
                                className={`pb-2 px-1 text-sm font-medium transition-colors ${
                                    activeTab === "repayments"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Repayment History (
                                {loan.repayments?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab("documents")}
                                className={`pb-2 px-1 text-sm font-medium transition-colors ${
                                    activeTab === "documents"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Documents
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        {activeTab === "details" && (
                            <div className="space-y-4">
                                <h3 className="font-semibold mb-4">
                                    Additional Loan Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Loan ID
                                        </p>
                                        <p className="font-medium">{loan.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Created At
                                        </p>
                                        <p className="font-medium">
                                            {formatDateSafe(loan.createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Interest Rate
                                        </p>
                                        <p className="font-medium">
                                            {loan.interestRate}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Term
                                        </p>
                                        <p className="font-medium">
                                            {loan.term} months
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Daily Repayment
                                        </p>
                                        <p className="font-medium">
                                            {formatCurrency(
                                                parseFloat(loan.dailyRepayment),
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Total Repayable
                                        </p>
                                        <p className="font-medium">
                                            {formatCurrency(
                                                parseFloat(loan.totalRepayable),
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "repayments" && (
                            <div>
                                <h3 className="font-semibold mb-4">
                                    Repayment History
                                </h3>
                                {loan.repayments &&
                                loan.repayments.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-2 text-sm font-medium text-gray-500">
                                                        Date
                                                    </th>
                                                    <th className="text-left py-2 text-sm font-medium text-gray-500">
                                                        Amount
                                                    </th>
                                                    <th className="text-left py-2 text-sm font-medium text-gray-500">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loan.repayments.map(
                                                    (repayment, index) => (
                                                        <tr
                                                            key={index}
                                                            className="border-b border-gray-100"
                                                        >
                                                            <td className="py-2 text-sm">
                                                                {formatDateSafe(
                                                                    repayment.paymentDate,
                                                                )}
                                                            </td>
                                                            <td className="py-2 text-sm">
                                                                {formatCurrency(
                                                                    repayment.amount,
                                                                )}
                                                            </td>
                                                            <td className="py-2 text-sm">
                                                                <span className="px-2 py-1 rounded-full text-xs bg-green-50 text-green-700">
                                                                    {repayment.status ||
                                                                        "Completed"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        No repayments recorded yet.
                                    </p>
                                )}
                            </div>
                        )}

                        {activeTab === "documents" && (
                            <div>
                                <h3 className="font-semibold mb-4">
                                    Loan Documents
                                </h3>
                                {loan.disbursementProof ? (
                                    <div className="space-y-4">
                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <svg
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                    >
                                                        <path
                                                            d="M4 4L20 4M4 8L20 8M4 12L12 12M4 16L12 16M4 20L12 20M17 12L21 16L17 20M17 8V20"
                                                            stroke="#475467"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <div>
                                                        <p className="font-medium">
                                                            Disbursement Proof
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Uploaded on{" "}
                                                            {formatDateSafe(
                                                                loan.disbursementDate,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={
                                                        loan.disbursementProof
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                >
                                                    View
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        No documents available.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </div>
    );
}
