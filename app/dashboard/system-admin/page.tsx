import React from "react";

export default function SystemAdminDashboard() {
  return (
    <div className="drawer-content flex flex-col min-h-screen">
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#021C3E]">Overview</h1>
            <p className="text-base font-medium text-[#021C3E] opacity-50 mt-2">
              Osun state
            </p>
          </div>

          {/* Dashboard content will be added in subsequent tasks */}
          <div className="space-y-6">
            <p className="text-gray-600">
              Dashboard components will be implemented in the following tasks.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
