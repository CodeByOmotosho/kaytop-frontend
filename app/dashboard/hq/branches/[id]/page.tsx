"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import BranchDetailsStatistics from "@/app/_components/ui/BranchDetailsStatistics";
import BranchInfoCard from "@/app/_components/ui/BranchInfoCard";
import BranchDetailsTabs from "@/app/_components/ui/BranchDetailsTabs";
import CreditOfficersTable from "@/app/_components/ui/CreditOfficersTable";
import Pagination from "@/app/_components/ui/Pagination";
import { ToastContainer } from "@/app/_components/ui/ToastContainer";
import { useToast } from "@/app/hooks/useToast";
import { PageSkeleton } from "@/app/_components/ui/Skeleton";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { hqManagerService } from "@/lib/services/hq-manager.service";

// Types based on the exact API response
interface BranchUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    role: string;
    verificationStatus: string;
    createdAt: string;
    branch: string;
}

interface BranchUsersResponse {
    users: BranchUser[];
    total: number;
}

interface CreditOfficer {
    id: string;
    name: string;
    idNumber: string;
    status: "Active" | "Inactive";
    phone: string;
    email: string;
    dateJoined: string;
}

export default function BranchDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { toasts, removeToast, error: showError } = useToast();

    const [activeTab, setActiveTab] = useState<"credit-officers" | "customers">(
        "credit-officers",
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [coPage, setCoPage] = useState(1);
    const [customerPage, setCustomerPage] = useState(1);
    const itemsPerPage = 10;

    // API data state - only what we need
    const [branchUsers, setBranchUsers] = useState<BranchUser[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [creditOfficers, setCreditOfficers] = useState<CreditOfficer[]>([]);
    const [customers, setCustomers] = useState<BranchUser[]>([]);

    // Transform user to CreditOfficer format
    const transformToCreditOfficer = (user: BranchUser): CreditOfficer => ({
        id: String(user.id),
        name: `${user.firstName} ${user.lastName}`.trim(),
        idNumber: String(user.id).slice(-5),
        status: user.verificationStatus === "verified" ? "Active" : "Inactive",
        phone: user.mobileNumber || "N/A",
        email: user.email || "N/A",
        dateJoined: new Date(user.createdAt).toLocaleDateString(),
    });

    // Fetch branch users
    useEffect(() => {
        const fetchBranchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const branchName = decodeURIComponent(id);
                console.log(`🏢 Fetching users for branch: ${branchName}`);

                const response =
                    await hqManagerService.getUsersByBranch(branchName);

                setBranchUsers(response.users);
                setTotalUsers(response.total);

                // Filter by role
                const officers = response.users.filter(
                    (user) => user.role === "credit_officer",
                );

                const regularCustomers = response.users.filter(
                    (user) => user.role === "user",
                );

                setCreditOfficers(officers.map(transformToCreditOfficer));
                setCustomers(regularCustomers);
            } catch (err) {
                console.error("Error:", err);
                setError("Failed to load branch data");
                showError("Failed to load branch data");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchBranchData();
    }, [id, showError]);

    const handleBack = () => router.push("/dashboard/hq/branches");

    // Statistics from actual data
    const statisticsData = [
        {
            label: "All CO's",
            value: creditOfficers.length,
            change: 0,
            changeLabel: `${creditOfficers.length} total`,
        },
        {
            label: "All Customers",
            value: customers.length,
            change: 0,
            changeLabel: `${customers.length} total`,
        },
        {
            label: "Total Users",
            value: totalUsers,
            change: 0,
            changeLabel: `${totalUsers} total`,
        },
    ];

    // Branch info from URL and data
    const branchInfoFields = [
        { label: "Branch Name", value: decodeURIComponent(id) },
        { label: "Total Users", value: totalUsers },
        { label: "Credit Officers", value: creditOfficers.length },
        { label: "Customers", value: customers.length },
    ];

    // Pagination
    const paginatedOfficers = creditOfficers.slice(
        (coPage - 1) * itemsPerPage,
        coPage * itemsPerPage,
    );

    const paginatedCustomers = customers.slice(
        (customerPage - 1) * itemsPerPage,
        customerPage * itemsPerPage,
    );

    if (isLoading) return <PageSkeleton />;

    if (error) {
        return (
            <div className="drawer-content flex flex-col min-h-screen">
                <main className="flex-1 pl-[58px] pr-6 pt-6">
                    <div className="max-w-[1200px]">
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="text-center max-w-md">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Error Loading Branch
                                </h2>
                                <p className="text-gray-600 mb-6">{error}</p>
                                <button
                                    onClick={handleBack}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#7F56D9] rounded-lg hover:bg-[#6941C6]"
                                >
                                    Back to Branches
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
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={handleBack}
                            className="mb-4 hover:opacity-70 flex items-center gap-2"
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
                        </button>

                        <h1 className="text-2xl font-bold text-[#021C3E]">
                            Branch Details: {decodeURIComponent(id)}
                        </h1>
                    </div>

                    {/* Statistics */}
                    <div className="mb-6">
                        <BranchDetailsStatistics sections={statisticsData} />
                    </div>

                    {/* Branch Info */}
                    <div className="mb-8">
                        <BranchInfoCard fields={branchInfoFields} />
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 border-b border-gray-200">
                        <nav className="flex gap-6">
                            <button
                                onClick={() => setActiveTab("credit-officers")}
                                className={`pb-2 px-1 text-sm font-medium ${
                                    activeTab === "credit-officers"
                                        ? "text-[#7F56D9] border-b-2 border-[#7F56D9]"
                                        : "text-gray-500"
                                }`}
                            >
                                Credit Officers ({creditOfficers.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("customers")}
                                className={`pb-2 px-1 text-sm font-medium ${
                                    activeTab === "customers"
                                        ? "text-[#7F56D9] border-b-2 border-[#7F56D9]"
                                        : "text-gray-500"
                                }`}
                            >
                                Customers ({customers.length})
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div>
                        {activeTab === "credit-officers" && (
                            <>
                                {creditOfficers.length === 0 ? (
                                    <EmptyState
                                        title="No Credit Officers"
                                        message="This branch has no credit officers assigned."
                                        icon={
                                            <svg
                                                className="w-16 h-16 text-[#D0D5DD]"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                        }
                                    />
                                ) : (
                                    <>
                                        <CreditOfficersTable
                                            data={paginatedOfficers}
                                        />
                                        {creditOfficers.length >
                                            itemsPerPage && (
                                            <div className="mt-4">
                                                <Pagination
                                                    totalPages={Math.ceil(
                                                        creditOfficers.length /
                                                            itemsPerPage,
                                                    )}
                                                    page={coPage}
                                                    onPageChange={setCoPage}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        {activeTab === "customers" && (
                            <>
                                {customers.length === 0 ? (
                                    <EmptyState
                                        title="No Customers"
                                        message="This branch has no customers yet."
                                        icon={
                                            <svg
                                                className="w-16 h-16 text-[#D0D5DD]"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                                />
                                            </svg>
                                        }
                                    />
                                ) : (
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                        Name
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                        Email
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                        Phone
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                                        Joined
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedCustomers.map(
                                                    (customer, idx) => (
                                                        <tr
                                                            key={customer.id}
                                                            className={
                                                                idx <
                                                                paginatedCustomers.length -
                                                                    1
                                                                    ? "border-b border-gray-200"
                                                                    : ""
                                                            }
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        customer.firstName
                                                                    }{" "}
                                                                    {
                                                                        customer.lastName
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                {customer.email}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                {
                                                                    customer.mobileNumber
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                        customer.verificationStatus ===
                                                                        "verified"
                                                                            ? "bg-green-50 text-green-700"
                                                                            : "bg-yellow-50 text-yellow-700"
                                                                    }`}
                                                                >
                                                                    {
                                                                        customer.verificationStatus
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                {new Date(
                                                                    customer.createdAt,
                                                                ).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                        {customers.length > itemsPerPage && (
                                            <div className="p-4 border-t border-gray-200">
                                                <Pagination
                                                    totalPages={Math.ceil(
                                                        customers.length /
                                                            itemsPerPage,
                                                    )}
                                                    page={customerPage}
                                                    onPageChange={
                                                        setCustomerPage
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            <ToastContainer toasts={toasts} onClose={removeToast} />
        </div>
    );
}
