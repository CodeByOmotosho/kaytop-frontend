'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FilterControls from '@/app/_components/ui/FilterControls';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import Pagination from '@/app/_components/ui/Pagination';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import { DateRange } from 'react-day-picker';
import { Checkbox } from '@/app/_components/ui/Checkbox';
import EditCreditOfficerModal from '@/app/_components/ui/EditCreditOfficerModal';
import DeleteConfirmationModal from '@/app/_components/ui/DeleteConfirmationModal';
import { useToast } from '@/app/hooks/useToast';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';

type TimePeriod = '12months' | '30days' | '7days' | '24hours' | null;

interface CreditOfficer {
  id: string;
  name: string;
  idNumber: string;
  status: 'Active' | 'Inactive';
  phone: string;
  email: string;
  dateJoined: string;
}

// Credit Officers statistics data
const creditOfficersStatistics: StatSection[] = [
  {
    label: 'Total Credit Officers',
    value: 42094,
    change: 6,
  },
];

// Sample credit officers data
const creditOfficersData: CreditOfficer[] = [
  {
    id: '1',
    name: 'Ademola Jumoke',
    idNumber: '43756',
    status: 'Active',
    phone: '+234816000600',
    email: 'eltford@mac.com',
    dateJoined: 'June 03, 2024'
  },
  {
    id: '2',
    name: 'Adegboyoga Precious',
    idNumber: '43178',
    status: 'Active',
    phone: '+234812345678',
    email: 'bradi@comcast.net',
    dateJoined: 'Dec 24, 2023'
  },
  {
    id: '3',
    name: 'Nneka Chukwu',
    idNumber: '70668',
    status: 'Inactive',
    phone: '+234904449999',
    email: 'fwitness@yahoo.ca',
    dateJoined: 'Nov 11, 2024'
  },
  {
    id: '4',
    name: 'Damilare Usman',
    idNumber: '97174',
    status: 'Active',
    phone: '+234908008888',
    email: 'plover@aol.com',
    dateJoined: 'Feb 02, 2024'
  },
  {
    id: '5',
    name: 'Jide Kosoko',
    idNumber: '39635',
    status: 'Active',
    phone: '+234906123456',
    email: 'crusader@yahoo.com',
    dateJoined: 'Aug 18, 2023'
  },
  {
    id: '6',
    name: 'Oladejo Israel',
    idNumber: '97174',
    status: 'Active',
    phone: '+234805551234',
    email: 'mccurley@yahoo.ca',
    dateJoined: 'Sept 09, 2024'
  },
  {
    id: '7',
    name: 'Eze Chinedu',
    idNumber: '22739',
    status: 'Active',
    phone: '+234808785432',
    email: 'jginspace@mac.com',
    dateJoined: 'July 27, 2023'
  },
  {
    id: '8',
    name: 'Adebanji Bolaji',
    idNumber: '22739',
    status: 'Active',
    phone: '+234806001122',
    email: 'amichalo@msn.com',
    dateJoined: 'April 05, 2024'
  },
  {
    id: '9',
    name: 'Baba Kaothat',
    idNumber: '43756',
    status: 'Active',
    phone: '+234812345678',
    email: 'dieman@live.com',
    dateJoined: 'Oct 14, 2023'
  },
  {
    id: '10',
    name: 'Adebayo Salami',
    idNumber: '39635',
    status: 'Active',
    phone: '+234803345678',
    email: 'smallpaul@me.com',
    dateJoined: 'March 22, 2024'
  },
];

export default function CreditOfficersPage() {
  const router = useRouter();
  const { toasts, removeToast, success } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('12months');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof CreditOfficer | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<CreditOfficer | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [officerToDelete, setOfficerToDelete] = useState<{ id: string; name: string } | null>(null);

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    console.log('Time period changed:', period);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    console.log('Date range changed:', range);
  };

  const handleFilterClick = () => {
    console.log('Filter clicked');
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedOfficers(selectedIds);
    console.log('Selected officers:', selectedIds);
  };

  const handleRowClick = (officerId: string) => {
    router.push(`/dashboard/system-admin/credit-officers/${officerId}`);
  };

  const handleSort = (column: string) => {
    const col = column as keyof CreditOfficer;
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (officer: CreditOfficer) => {
    setSelectedOfficer(officer);
    setEditModalOpen(true);
  };

  const handleSave = (updatedOfficer: CreditOfficer) => {
    console.log('Saving credit officer:', updatedOfficer);
    // TODO: Implement actual save API call
    // Example: await updateCreditOfficer(updatedOfficer);
    success(`Credit Officer "${updatedOfficer.name}" updated successfully!`);
  };

  const handleDelete = (officer: CreditOfficer) => {
    setOfficerToDelete({ id: officer.id, name: officer.name });
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (officerToDelete) {
      console.log('Deleting credit officer:', officerToDelete.id);
      // TODO: Implement actual delete API call
      // Example: await deleteCreditOfficer(officerToDelete.id);
      success(`Credit Officer "${officerToDelete.name}" deleted successfully!`);
      setOfficerToDelete(null);
    }
  };

  // Filter and sort data
  const filteredOfficers = creditOfficersData.filter((officer) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        officer.name.toLowerCase().includes(query) ||
        officer.idNumber.includes(query) ||
        officer.email.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const sortedOfficers = [...filteredOfficers].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (sortColumn === 'dateJoined') {
      const aDate = new Date(aValue as string).getTime();
      const bDate = new Date(bValue as string).getTime();
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    }

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
    if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedOfficers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOfficers = sortedOfficers.slice(startIndex, endIndex);

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          <div>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Credit Officers
              </h1>
              {/* Breadcrumb line */}
              <div className="w-[18px] h-[2px] bg-black mb-6"></div>
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
            <div className="w-full max-w-[1091px]" style={{ marginBottom: '48px' }}>
              {isLoading ? (
                <StatisticsCardSkeleton />
              ) : (
                <StatisticsCard sections={creditOfficersStatistics} />
              )}
            </div>

            {/* Credit Officers Table */}
            <div className="max-w-[1041px]">
              {isLoading ? (
                <TableSkeleton rows={itemsPerPage} />
              ) : (
                <>
                  <div
                    className="bg-white rounded-lg overflow-hidden"
                    style={{
                      border: '1px solid var(--color-border-gray-200)',
                      boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
                    }}
                  >
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-gray-50)', borderBottom: '1px solid var(--color-border-gray-200)' }}>
                          <th className="px-6 py-3 text-left">
                            <Checkbox
                              checked={selectedOfficers.length === paginatedOfficers.length && paginatedOfficers.length > 0}
                              onCheckedChange={(checked) => {
                                if (checked === true) {
                                  setSelectedOfficers(paginatedOfficers.map(o => o.id));
                                } else {
                                  setSelectedOfficers([]);
                                }
                              }}
                              aria-label="Select all credit officers"
                            />
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium cursor-pointer"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onClick={() => handleSort('name')}
                          >
                            Name
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            <button
                              onClick={() => handleSort('status')}
                              className="flex items-center gap-1 hover:text-[#101828] transition-colors"
                            >
                              Status
                              {sortColumn === 'status' && (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                                >
                                  <path
                                    d="M8 3.33334V12.6667M8 12.6667L12.6667 8.00001M8 12.6667L3.33333 8.00001"
                                    stroke="currentColor"
                                    strokeWidth="1.33333"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </button>
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            Phone Number
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            Email
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            Date Joined
                          </th>
                          <th className="px-6 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOfficers.map((officer, index) => (
                          <tr
                            key={officer.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            style={{
                              borderBottom: index < paginatedOfficers.length - 1 ? '1px solid var(--color-border-gray-200)' : 'none'
                            }}
                            onClick={() => handleRowClick(officer.id)}
                          >
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedOfficers.includes(officer.id)}
                                onCheckedChange={(checked) => {
                                  if (checked === true) {
                                    setSelectedOfficers([...selectedOfficers, officer.id]);
                                  } else {
                                    setSelectedOfficers(selectedOfficers.filter(id => id !== officer.id));
                                  }
                                }}
                                aria-label={`Select ${officer.name}`}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                  {officer.name}
                                </div>
                                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                  ID: {officer.idNumber}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: officer.status === 'Active' ? '#ECFDF3' : '#FEF3F2',
                                  color: officer.status === 'Active' ? '#027A48' : '#B42318',
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full mr-1.5"
                                  style={{
                                    backgroundColor: officer.status === 'Active' ? '#12B76A' : '#F04438',
                                  }}
                                />
                                {officer.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              {officer.phone}
                            </td>
                            <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              {officer.email}
                            </td>
                            <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              {officer.dateJoined}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                <button
                                  className="p-2 hover:bg-gray-100 rounded transition-colors duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(officer);
                                  }}
                                  aria-label={`Edit ${officer.name}`}
                                  title="Edit"
                                >
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                    <path
                                      d="M2.5 17.5H17.5M11.6667 4.16667L14.1667 1.66667C14.3877 1.44565 14.6848 1.32031 14.9948 1.32031C15.3047 1.32031 15.6019 1.44565 15.8229 1.66667L18.3333 4.17708C18.5543 4.39811 18.6797 4.69524 18.6797 5.00521C18.6797 5.31518 18.5543 5.61231 18.3333 5.83333L6.66667 17.5H2.5V13.3333L11.6667 4.16667Z"
                                      stroke="#475467"
                                      strokeWidth="1.66667"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                                <button
                                  className="p-2 hover:bg-gray-100 rounded transition-colors duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(officer);
                                  }}
                                  aria-label={`Delete ${officer.name}`}
                                  title="Delete"
                                >
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                    <path
                                      d="M7.5 2.5H12.5M2.5 5H17.5M15.8333 5L15.2489 13.7661C15.1612 15.0813 15.1174 15.7389 14.8333 16.2375C14.5833 16.6765 14.206 17.0294 13.7514 17.2497C13.235 17.5 12.5759 17.5 11.2578 17.5H8.74221C7.42409 17.5 6.76503 17.5 6.24861 17.2497C5.79396 17.0294 5.41674 16.6765 5.16665 16.2375C4.88259 15.7389 4.83875 15.0813 4.75107 13.7661L4.16667 5"
                                      stroke="#475467"
                                      strokeWidth="1.66667"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4">
                    <Pagination
                      totalPages={totalPages}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Credit Officer Modal */}
      <EditCreditOfficerModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedOfficer(null);
        }}
        onSave={handleSave}
        officer={selectedOfficer}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setOfficerToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Credit Officer"
        message="Are you sure you want to delete credit officer"
        itemName={officerToDelete?.name}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
