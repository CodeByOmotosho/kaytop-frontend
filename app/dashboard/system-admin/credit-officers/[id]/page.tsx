'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import Pagination from '@/app/_components/ui/Pagination';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import { useToast } from '@/app/hooks/useToast';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { generateCreditOfficerDetails, generateCollectionTransactions, generateDisbursedLoans } from '@/lib/creditOfficerDataGenerator';
import CreditOfficerInfoCard from '@/app/_components/ui/CreditOfficerInfoCard';
import CreditOfficerTabs from '@/app/_components/ui/CreditOfficerTabs';
import CollectionsTable from '@/app/_components/ui/CollectionsTable';
import LoansDisbursedTable from '@/app/_components/ui/LoansDisbursedTable';
import DeleteConfirmationModal from '@/app/_components/ui/DeleteConfirmationModal';
import EditCollectionModal from '@/app/_components/ui/EditCollectionModal';
import EditLoanModal from '@/app/_components/ui/EditLoanModal';

export default function CreditOfficerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise (Next.js 15+ requirement)
  const { id } = use(params);
  
  const router = useRouter();
  const { toasts, removeToast, success } = useToast();
  const [isLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'collections' | 'loans-disbursed'>('collections');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedLoans, setSelectedLoans] = useState<string[]>([]);
  const itemsPerPage = 10;

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: string } | null>(null);

  // Edit modal state
  const [editCollectionModalOpen, setEditCollectionModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<typeof collectionsData[0] | null>(null);
  const [editLoanModalOpen, setEditLoanModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<typeof loansData[0] | null>(null);

  // Generate credit officer details, collections, and loans
  const creditOfficer = generateCreditOfficerDetails(id);
  const collectionsData = generateCollectionTransactions(id, 50);
  const loansData = generateDisbursedLoans(id, 50);

  // Sample statistics data
  const creditOfficerStatistics: StatSection[] = [
    {
      label: 'All Customers',
      value: 42094,
      change: 6,
    },
    {
      label: 'Active loans',
      value: 15350,
      change: 6,
    },
    {
      label: 'Loans Processed',
      value: 28350,
      change: -26,
    },
    {
      label: 'Loan Amount',
      value: 50350.00,
      change: 40,
      isCurrency: true
    },
  ];

  const handleTabChange = (tab: 'collections' | 'loans-disbursed') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to page 1 when switching tabs
    setSelectedCollections([]); // Clear selections when switching tabs
    setSelectedLoans([]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCollectionEdit = (collectionId: string) => {
    const collection = collectionsData.find(c => c.id === collectionId);
    if (collection) {
      setSelectedCollection(collection);
      setEditCollectionModalOpen(true);
    }
  };

  const handleCollectionSave = (updatedCollection: typeof collectionsData[0]) => {
    console.log('Saving collection:', updatedCollection);
    // TODO: Implement actual save API call
    // Example: await updateCollection(updatedCollection);
    success(`Collection ${updatedCollection.transactionId} updated successfully!`);
  };

  const handleCollectionDelete = (collectionId: string) => {
    const collection = collectionsData.find(c => c.id === collectionId);
    if (collection) {
      setItemToDelete({ id: collectionId, name: collection.transactionId, type: 'Collection' });
      setDeleteModalOpen(true);
    }
  };

  const handleLoanEdit = (loanId: string) => {
    const loan = loansData.find(l => l.id === loanId);
    if (loan) {
      setSelectedLoan(loan);
      setEditLoanModalOpen(true);
    }
  };

  const handleLoanSave = (updatedLoan: typeof loansData[0]) => {
    console.log('Saving loan:', updatedLoan);
    // TODO: Implement actual save API call
    // Example: await updateLoan(updatedLoan);
    success(`Loan ${updatedLoan.loanId} updated successfully!`);
  };

  const handleLoanDelete = (loanId: string) => {
    const loan = loansData.find(l => l.id === loanId);
    if (loan) {
      setItemToDelete({ id: loanId, name: loan.loanId, type: 'Loan' });
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      console.log(`Deleting ${itemToDelete.type}:`, itemToDelete.id);
      // TODO: Implement actual delete API call
      // Example: await deleteItem(itemToDelete.id, itemToDelete.type);
      
      // Show success notification
      success(`${itemToDelete.type} "${itemToDelete.name}" deleted successfully!`);
      setItemToDelete(null);
    }
  };

  const handleCollectionSelectionChange = (selectedIds: string[]) => {
    setSelectedCollections(selectedIds);
  };

  const handleLoanSelectionChange = (selectedIds: string[]) => {
    setSelectedLoans(selectedIds);
  };

  // Pagination for collections
  const totalCollectionPages = Math.ceil(collectionsData.length / itemsPerPage);
  const collectionStartIndex = (currentPage - 1) * itemsPerPage;
  const collectionEndIndex = collectionStartIndex + itemsPerPage;
  const paginatedCollections = collectionsData.slice(collectionStartIndex, collectionEndIndex);

  // Pagination for loans
  const totalLoanPages = Math.ceil(loansData.length / itemsPerPage);
  const loanStartIndex = (currentPage - 1) * itemsPerPage;
  const loanEndIndex = loanStartIndex + itemsPerPage;
  const paginatedLoans = loansData.slice(loanStartIndex, loanEndIndex);

  const totalPages = activeTab === 'collections' ? totalCollectionPages : totalLoanPages;

  const handleBack = () => {
    router.push('/dashboard/system-admin/credit-officers');
  };

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          <div>
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="mb-4 hover:opacity-70 transition-opacity duration-200 flex items-center gap-2"
              aria-label="Go back to credit officers list"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M15.8334 10H4.16669M4.16669 10L10 15.8333M4.16669 10L10 4.16667"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Credit Officer
              </h1>
              {/* Breadcrumb line */}
              <div className="w-[18px] h-[2px] bg-black mb-6"></div>
            </div>

            {/* Credit Officer Info Card */}
            <div className="w-full max-w-[1091px]" style={{ marginBottom: '48px' }}>
              <CreditOfficerInfoCard
                fields={[
                  { label: 'Name', value: creditOfficer.name },
                  { label: 'CO ID', value: creditOfficer.coId },
                  { label: 'Date Joined', value: creditOfficer.dateJoined },
                  { label: 'Email address', value: creditOfficer.email },
                  { label: 'Phone number', value: creditOfficer.phone },
                  { label: 'Gender', value: creditOfficer.gender }
                ]}
              />
            </div>

            {/* Statistics Card */}
            <div className="w-full max-w-[1091px]" style={{ marginBottom: '48px' }}>
              {isLoading ? (
                <StatisticsCardSkeleton />
              ) : (
                <StatisticsCard sections={creditOfficerStatistics} />
              )}
            </div>

            {/* Tab Navigation */}
            <CreditOfficerTabs activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Tab Content */}
            <div 
              className="max-w-[1041px]"
              role="tabpanel"
              id={`${activeTab}-panel`}
              aria-labelledby={`${activeTab}-tab`}
            >
              {isLoading ? (
                <TableSkeleton rows={itemsPerPage} />
              ) : activeTab === 'collections' ? (
                <>
                  <CollectionsTable
                    transactions={paginatedCollections}
                    selectedTransactions={selectedCollections}
                    onSelectionChange={handleCollectionSelectionChange}
                    onEdit={handleCollectionEdit}
                    onDelete={handleCollectionDelete}
                  />
                  {/* Pagination */}
                  <div className="mt-4">
                    <Pagination
                      totalPages={totalPages}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  <LoansDisbursedTable
                    loans={paginatedLoans}
                    selectedLoans={selectedLoans}
                    onSelectionChange={handleLoanSelectionChange}
                    onEdit={handleLoanEdit}
                    onDelete={handleLoanDelete}
                  />
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
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={`Delete ${itemToDelete?.type || 'Item'}`}
        message={`Are you sure you want to delete ${itemToDelete?.type.toLowerCase() || 'this item'}`}
        itemName={itemToDelete?.name}
      />

      {/* Edit Collection Modal */}
      <EditCollectionModal
        isOpen={editCollectionModalOpen}
        onClose={() => {
          setEditCollectionModalOpen(false);
          setSelectedCollection(null);
        }}
        onSave={handleCollectionSave}
        transaction={selectedCollection}
      />

      {/* Edit Loan Modal */}
      <EditLoanModal
        isOpen={editLoanModalOpen}
        onClose={() => {
          setEditLoanModalOpen(false);
          setSelectedLoan(null);
        }}
        onSave={handleLoanSave}
        loan={selectedLoan}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
