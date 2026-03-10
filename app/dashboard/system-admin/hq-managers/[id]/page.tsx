"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminService, HQManager } from "@/lib/services/admin.service";
import { useToast } from "@/app/hooks/useToast";
import { ToastContainer } from "@/app/_components/ui/ToastContainer";
import { PageSkeleton } from "@/app/_components/ui/Skeleton";
import DeleteConfirmationModal from "@/app/_components/ui/DeleteConfirmationModal";
import apiClient from "@/lib/apiClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

// Update the Branch interface since we're getting simple strings
type Branch = string;

export default function HQManagerDetailsPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { toasts, removeToast, success, error: showError } = useToast();

    const [manager, setManager] = useState<HQManager | null>(null);
    const [assignedBranches, setAssignedBranches] = useState<string[]>([]);
    const [availableBranches, setAvailableBranches] = useState<string[]>([]); // Now just string[]
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
    const [branchToRemove, setBranchToRemove] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);

                // Get all HQ Managers
                const managers = await adminService.getHQManagers();

                // Find the current manager by ID
                const currentManager = managers.find(
                    (m) => m.id === parseInt(id),
                );

                if (!currentManager) {
                    throw new Error("HQ Manager not found");
                }

                setManager(currentManager);

                // Get assigned branches from the manager object
                const branches = currentManager.assignedBranches || [];
                setAssignedBranches(branches);
                setSelectedBranches(branches);

                // Get all available branches from /users/branches
                // Now expecting a simple array of strings
                const branchesResponse =
                    await apiClient.get<string[]>("/users/branches");
                console.log("Available branches:", branchesResponse.data);
                setAvailableBranches(branchesResponse.data || []);
            } catch (err) {
                console.error("Failed to load HQ Manager details:", err);
                showError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load HQ Manager details",
                );
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            loadData();
        }
    }, [id, showError]);

    const handleAssignBranches = async () => {
        try {
            setIsUpdating(true);

            // Determine which branches to add (selected but not already assigned)
            const branchesToAdd = selectedBranches.filter(
                (b) => !assignedBranches.includes(b),
            );

            const branchesToRemove = assignedBranches.filter(
                (b) => !selectedBranches.includes(b),
            );

            if (branchesToAdd.length > 0) {
                if (assignedBranches.length === 0) {
                    // First time assignment
                    await adminService.assignBranchesToHQManager(
                        parseInt(id),
                        branchesToAdd,
                    );
                } else {
                    // Adding additional branches
                    await adminService.addBranchesToHQManager(
                        parseInt(id),
                        branchesToAdd,
                    );
                }
            }

            // Handle removals if any
            for (const branch of branchesToRemove) {
                await adminService.removeBranchFromHQManager(
                    parseInt(id),
                    branch,
                );
            }

            setAssignedBranches(selectedBranches);
            success("Branches updated successfully!");
        } catch (err) {
            console.error("Failed to assign branches:", err);
            showError("Failed to assign branches");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemoveBranch = async (branchName: string) => {
        try {
            setIsUpdating(true);
            await adminService.removeBranchFromHQManager(
                parseInt(id),
                branchName,
            );

            const updatedBranches = assignedBranches.filter(
                (b) => b !== branchName,
            );
            setAssignedBranches(updatedBranches);
            setSelectedBranches(updatedBranches);
            setBranchToRemove(null);
            setIsDeleteModalOpen(false);

            success(`Branch "${branchName}" removed successfully!`);
        } catch (err) {
            console.error("Failed to remove branch:", err);
            showError("Failed to remove branch");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleBack = () => {
        router.push("/dashboard/system-admin/hq-managers");
    };

    if (isLoading) {
        return <PageSkeleton />;
    }

    if (!manager) {
        return (
            <div className="drawer-content flex flex-col min-h-screen">
                <main
                    className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6"
                    style={{ paddingTop: "40px" }}
                >
                    <div className="max-w-[1200px]">
                        <div className="text-center py-12">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                HQ Manager Not Found
                            </h2>
                            <p className="text-gray-600 mb-4">
                                The HQ Manager with ID {id} could not be found.
                            </p>
                            <button
                                onClick={handleBack}
                                className="text-[#7F56D9] hover:text-[#6941C6] font-medium"
                            >
                                ← Back to HQ Managers
                            </button>
                        </div>
                    </div>
                </main>
                <ToastContainer toasts={toasts} onClose={removeToast} />
            </div>
        );
    }

    return (
        <div className="drawer-content flex flex-col min-h-screen">
            <main
                className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6"
                style={{ paddingTop: "40px" }}
            >
                <div className="max-w-[1200px]">
                    {/* Back Button */}
                    <button
                        onClick={handleBack}
                        className="mb-6 hover:opacity-70 transition-opacity flex items-center gap-2"
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
                            Back to HQ Managers
                        </span>
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-[#021C3E] mb-2">
                            {manager.firstName} {manager.lastName}
                        </h1>
                        <div className="flex items-center gap-3">
                            <p className="text-base text-[#021C3E] opacity-50">
                                HQ Manager • ID: {manager.id}
                            </p>
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    manager.role === "hq_manager"
                                        ? "bg-purple-50 text-purple-700"
                                        : "bg-gray-50 text-gray-700"
                                }`}
                            >
                                {manager.role}
                            </span>
                        </div>
                    </div>

                    {/* Manager Info Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                        <h2 className="text-lg font-semibold mb-4">
                            Manager Information
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{manager.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">
                                    {manager.firstName + " " + manager.lastName}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Created</p>
                                <p className="font-medium">
                                    {new Date(
                                        manager.createdAt,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Branch Assignment Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">
                                Assigned Branches
                            </h2>
                            <button
                                onClick={handleAssignBranches}
                                disabled={
                                    isUpdating ||
                                    JSON.stringify(selectedBranches) ===
                                        JSON.stringify(assignedBranches)
                                }
                                className="px-4 py-2 bg-[#7F56D9] text-white rounded-lg text-sm font-medium hover:bg-[#6941C6] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </button>
                        </div>

                        {/* Current Assigned Branches */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Currently Assigned
                            </h3>
                            {assignedBranches.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">
                                    No branches assigned yet
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {assignedBranches.map((branch) => (
                                        <div
                                            key={branch} // Using branch name as key (it's unique)
                                            className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4F3FF] text-[#5925DC] rounded-full text-sm"
                                        >
                                            <span>{branch}</span>
                                            <button
                                                onClick={() => {
                                                    setBranchToRemove(branch);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="hover:text-[#42307D]"
                                                aria-label={`Remove ${branch}`}
                                            >
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 14 14"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Available Branches to Assign */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Available Branches
                            </h3>
                            {availableBranches.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">
                                    No branches available
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {availableBranches.map((branchName) => {
                                        const isAssigned =
                                            selectedBranches.includes(
                                                branchName,
                                            );
                                        return (
                                            <label
                                                key={branchName} // Using branch name as key
                                                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                                    isAssigned
                                                        ? "border-[#7F56D9] bg-[#F4F3FF]"
                                                        : "border-gray-200 hover:bg-gray-50"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isAssigned}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedBranches(
                                                                [
                                                                    ...selectedBranches,
                                                                    branchName,
                                                                ],
                                                            );
                                                        } else {
                                                            setSelectedBranches(
                                                                selectedBranches.filter(
                                                                    (b) =>
                                                                        b !==
                                                                        branchName,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                    className="mt-1 w-4 h-4 text-[#7F56D9] border-gray-300 rounded focus:ring-[#7F56D9]"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">
                                                        {branchName}
                                                    </p>
                                                    {/* Removed the additional stats since we don't have them */}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setBranchToRemove(null);
                }}
                onConfirm={() =>
                    branchToRemove && handleRemoveBranch(branchToRemove)
                }
                title="Remove Branch"
                message="Are you sure you want to remove"
                itemName={branchToRemove || ""}
            />

            <ToastContainer toasts={toasts} onClose={removeToast} />
        </div>
    );
}
