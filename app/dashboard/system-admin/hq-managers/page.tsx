"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminService, HQManager } from "@/lib/services/admin.service";
import { useToast } from "@/app/hooks/useToast";
import { ToastContainer } from "@/app/_components/ui/ToastContainer";
import { PageSkeleton } from "@/app/_components/ui/Skeleton";
import { EmptyState } from "@/app/_components/ui/EmptyState";

export default function HQManagersPage() {
    const router = useRouter();
    const { toasts, removeToast, success, error: showError } = useToast();

    const [hqManagers, setHQManagers] = useState<HQManager[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchHQManagers = async (search?: string) => {
        try {
            setIsLoading(true);
            setError(null);

            // Based on your response, it returns an array directly, not a paginated response
            const data = await adminService.getHQManagers();

            // Ensure data is an array
            const managers = Array.isArray(data) ? data : [];

            // Filter by search if provided
            if (search && search.trim()) {
                const query = search.toLowerCase();
                const filtered = managers.filter(
                    (manager) =>
                        `${manager.firstName} ${manager.lastName}`
                            .toLowerCase()
                            .includes(query) ||
                        manager.email.toLowerCase().includes(query),
                );
                setHQManagers(filtered);
            } else {
                setHQManagers(managers);
            }
        } catch (err) {
            console.error("Failed to fetch HQ Managers:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load HQ Managers",
            );
            showError("Failed to load HQ Managers");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHQManagers();
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        fetchHQManagers(query);
    };

    const handleRowClick = (id: number) => {
        router.push(`/dashboard/system-admin/hq-managers/${id}`);
    };

    // Safely check if hqManagers is an array and has length
    const hasManagers = Array.isArray(hqManagers) && hqManagers.length > 0;

    if (isLoading) {
        return <PageSkeleton />;
    }

    return (
        <div className="drawer-content flex flex-col min-h-screen">
            <main
                className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6"
                style={{ paddingTop: "40px" }}
            >
                <div className="max-w-[1200px]">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-[#021C3E] mb-2">
                            HQ Managers
                        </h1>
                        <p className="text-base text-[#021C3E] opacity-50">
                            Manage HQ Managers and their branch assignments
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search by name or email..."
                                className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-transparent"
                            />
                            <svg
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        fetchHQManagers();
                                    }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                    >
                                        <path
                                            d="M12 4L4 12M4 4L12 12"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={() => fetchHQManagers()}
                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    {!hasManagers ? (
                        <EmptyState
                            title="No HQ Managers Found"
                            message={
                                searchQuery
                                    ? `No results match "${searchQuery}"`
                                    : "No HQ Managers have been created yet."
                            }
                            action={
                                searchQuery
                                    ? {
                                          label: "Clear Search",
                                          onClick: () => {
                                              setSearchQuery("");
                                              fetchHQManagers();
                                          },
                                      }
                                    : undefined
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
                                            Assigned Branches
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                            Created By
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hqManagers.map((manager) => (
                                        <tr
                                            key={manager.id}
                                            onClick={() =>
                                                handleRowClick(manager.id)
                                            }
                                            className="hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {manager.firstName}{" "}
                                                        {manager.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        ID: {manager.id}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {manager.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                {manager.assignedBranches &&
                                                manager.assignedBranches
                                                    .length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {manager.assignedBranches.map(
                                                            (branch) => (
                                                                <span
                                                                    key={branch}
                                                                    className="inline-flex items-center px-2 py-1 bg-[#F4F3FF] text-[#5925DC] rounded-full text-xs"
                                                                >
                                                                    {branch}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        No branches
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(
                                                    manager.createdAt,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {manager.createdBy?.name ||
                                                    "System"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <ToastContainer toasts={toasts} onClose={removeToast} />
        </div>
    );
}
