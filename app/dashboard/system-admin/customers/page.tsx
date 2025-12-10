'use client';

import React, { useState, useMemo } from 'react';
import FilterControls from '@/app/_components/ui/FilterControls';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import CustomersTable from '@/app/_components/ui/CustomersTable';
import EditCustomerModal from '@/app/_components/ui/EditCustomerModal';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import Pagination from '@/app/_components/ui/Pagination';
import { generateCustomers, Customer } from '@/lib/customerDataGenerator';
import { DateRange } from 'react-day-picker';

type TimePeriod = '12months' | '30days' | '7days' | '24hours' | null;

// Customer statistics data
const customerStatistics: StatSection[] = [
  {
    label: 'Total Customers',
    value: 42094,
    change: 6,
  },
  {
    label: 'Active Loans',
    value: 15350,
    change: 6,
  },
];

export default function CustomersPage() {
  const { toasts, removeToast, success } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('12months');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>(() => generateCustomers(100));

  const itemsPerPage = 10;

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    console.log('Time period changed:', period);
    // TODO: Filter data based on period
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    console.log('Date range changed:', range);
    // TODO: Filter data based on date range
  };

  const handleFilterClick = () => {
    console.log('Filters clicked');
    // TODO: Open advanced filters modal
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedCustomers(selectedIds);
    console.log('Selected customers:', selectedIds);
  };

  const handleEdit = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setEditModalOpen(true);
    }
  };

  const handleSaveCustomer = (updatedCustomer: Customer) => {
    setCustomers(prevCustomers =>
      prevCustomers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
    );
    success(`Customer "${updatedCustomer.name}" updated successfully!`);
  };

  // Pagination
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = useMemo(() => 
    customers.slice(startIndex, endIndex),
    [customers, startIndex, endIndex]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          <div>
            {/* Page Header */}
            <div style={{ marginBottom: '48px' }}>
              <h1
                className="font-bold"
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#021C3E',
                  marginBottom: '8px'
                }}
              >
                Overview
              </h1>
              <p
                className="font-medium"
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#021C3E',
                  opacity: 0.5
                }}
              >
                Igando Branch
              </p>
              {/* Breadcrumb line */}
              <div
                style={{
                  width: '18px',
                  height: '2px',
                  background: '#000000',
                  marginTop: '8px'
                }}
              />
            </div>

            {/* Filter Controls */}
            <div style={{ marginBottom: '56px' }}>
              <FilterControls
                selectedPeriod={selectedPeriod}
                onPeriodChange={handlePeriodChange}
                onDateRangeChange={handleDateRangeChange}
                onFilter={handleFilterClick}
              />
            </div>

            {/* Statistics Card */}
            <div
              className="w-full"
              style={{
                maxWidth: '564px',
                marginBottom: '48px'
              }}
            >
              <StatisticsCard sections={customerStatistics} />
            </div>

            {/* Customers Section Title */}
            <div
              className="pl-4"
              style={{ marginBottom: '24px' }}
            >
              <h2
                className="font-semibold"
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#101828'
                }}
              >
                Customers
              </h2>
            </div>

            {/* Customers Table */}
            <div className="max-w-[1075px]">
              <CustomersTable
                customers={paginatedCustomers}
                selectedCustomers={selectedCustomers}
                onSelectionChange={handleSelectionChange}
                onEdit={handleEdit}
              />

              {/* Pagination Controls */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#475467]">
                    Showing {startIndex + 1}-{Math.min(endIndex, customers.length)} of {customers.length} results
                  </span>
                </div>

                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
