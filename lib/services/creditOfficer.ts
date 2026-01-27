/**
 * Credit Officer Service
 * Handles credit officer specific data fetching and management
 */

import { userService } from './users';
import { loanService } from './loans';
import { savingsService } from './savings';
import type { User, Loan, Transaction } from '../api/types';

export interface CreditOfficerData {
  officer: User;
  branchCustomers: User[];
  branchLoans: Loan[];
  branchTransactions: Transaction[];
  statistics: {
    totalCustomers: number;
    activeLoans: number;
    totalLoansProcessed: number;
    totalLoanAmount: number;
    totalCollections: number;
  };
}

export interface CreditOfficerService {
  getCreditOfficerData(creditOfficerId: string): Promise<CreditOfficerData>;
  getBranchCustomers(branch: string): Promise<User[]>;
  getBranchLoans(branch: string): Promise<Loan[]>;
}

class CreditOfficerAPIService implements CreditOfficerService {
  async getCreditOfficerData(creditOfficerId: string): Promise<CreditOfficerData> {
    try {
      console.log(`[CreditOfficerService] Fetching data for credit officer: ${creditOfficerId}`);
      
      // Fetch credit officer details
      const officer = await userService.getUserById(creditOfficerId);
      console.log(`[CreditOfficerService] Officer fetched:`, { id: officer.id, role: officer.role, branch: officer.branch });
      
      // Check if user is a credit officer (handle multiple role variations)
      const userRole = officer.role?.toLowerCase() || '';
      const isCreditOfficer = userRole === 'credit_officer' || 
                             userRole === 'creditofficer' || 
                             userRole === 'credit officer' ||
                             userRole === 'co' ||
                             userRole.includes('credit');
      
      if (!isCreditOfficer) {
        console.warn(`[CreditOfficerService] User role "${officer.role}" may not be a credit officer, but proceeding...`);
      }

      // Try to get credit officer specific data first
      console.log(`[CreditOfficerService] Attempting to fetch credit officer specific data...`);
      
      try {
        // Test potential credit officer specific endpoints
        const creditOfficerSpecificData = await this.getCreditOfficerSpecificData(creditOfficerId);
        if (creditOfficerSpecificData) {
          console.log(`[CreditOfficerService] ✅ Found credit officer specific data!`);
          return creditOfficerSpecificData;
        }
      } catch (error) {
        console.log(`[CreditOfficerService] ⚠️ No credit officer specific endpoints found, falling back to branch data filtering`);
      }

      // Fallback to branch-based filtering (current implementation)
      console.log(`[CreditOfficerService] Using branch-based data filtering as fallback...`);
      
      // Get credit officer's branch
      const branch = officer.branch;
      console.log(`[CreditOfficerService] Officer branch: ${branch}`);
      
      if (!branch) {
        console.warn('Credit officer has no branch assigned');
      }

      // Fetch branch-specific data in parallel
      console.log(`[CreditOfficerService] Fetching branch data...`);
      const [branchCustomers, allLoans, allTransactions] = await Promise.all([
        this.getBranchCustomers(branch || ''),
        loanService.getAllLoans(),
        savingsService.getAllSavingsTransactions({ limit: 100 }) // Limit for performance
      ]);

      console.log(`[CreditOfficerService] Data fetched:`, {
        branchCustomers: branchCustomers.length,
        allLoans: allLoans.length,
        allTransactions: allTransactions.length
      });

      // Filter loans by branch customers
      const branchCustomerIds = branchCustomers.map(c => String(c.id));
      const branchLoans = allLoans.filter(loan => 
        branchCustomerIds.includes(String(loan.customerId))
      );

      console.log(`[CreditOfficerService] Filtered loans: ${branchLoans.length} out of ${allLoans.length}`);

      // Try to filter by credit officer if loan data contains credit officer information
      const officerLoans = this.filterLoansByCreditOfficer(branchLoans, creditOfficerId);
      const officerCustomers = this.filterCustomersByCreditOfficer(branchCustomers, officerLoans);
      
      console.log(`[CreditOfficerService] Credit officer specific filtering:`, {
        officerLoans: officerLoans.length,
        officerCustomers: officerCustomers.length
      });

      // For transactions, we'll use a subset since we don't have direct customer linking
      // In a real implementation, this would be filtered by savings accounts of officer's customers
      const officerCustomerIds = officerCustomers.map(c => String(c.id));
      const officerTransactions = allTransactions.filter(transaction => 
        officerCustomerIds.includes(String(transaction.customerId)) ||
        officerCustomerIds.includes(String(transaction.userId))
      ).slice(0, 50); // Limit for performance

      // Calculate statistics based on credit officer specific data
      const activeLoans = officerLoans.filter(loan => loan.status === 'active').length;
      const totalLoanAmount = officerLoans.reduce((sum, loan) => sum + loan.amount, 0);
      const totalCollections = officerTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

      const statistics = {
        totalCustomers: officerCustomers.length,
        activeLoans,
        totalLoansProcessed: officerLoans.length,
        totalLoanAmount,
        totalCollections
      };

      console.log(`[CreditOfficerService] Credit officer specific statistics calculated:`, statistics);

      return {
        officer,
        branchCustomers: officerCustomers,
        branchLoans: officerLoans,
        branchTransactions: officerTransactions,
        statistics
      };
    } catch (error) {
      console.error('Failed to fetch credit officer data:', error);
      throw error;
    }
  }

  /**
   * Attempt to fetch credit officer specific data from potential backend endpoints
   */
  private async getCreditOfficerSpecificData(creditOfficerId: string): Promise<CreditOfficerData | null> {
    try {
      console.log(`[CreditOfficerService] 🔍 Testing authenticated credit officer specific endpoints...`);
      
      // Import apiClient for authenticated requests
      const { default: apiClient } = await import('@/lib/apiClient');
      
      // Test the most promising endpoints that we know exist (from our test)
      const workingEndpoints = [
        `/loans/all?creditOfficerId=${creditOfficerId}`, // Loans managed by this credit officer
        `/admin/users?role=customer&creditOfficerId=${creditOfficerId}`, // Customers of this credit officer
        `/loans/recollections?creditOfficerId=${creditOfficerId}`, // Loan repayments/collections by this credit officer
        `/loans/disbursed?creditOfficerId=${creditOfficerId}`, // Loans disbursed by this credit officer
        `/reports?creditOfficerId=${creditOfficerId}`,
        `/dashboard/kpi?creditOfficerId=${creditOfficerId}`
      ];
      
      const results: Record<string, unknown> = {};
      let hasAnyData = false;
      
      for (const endpoint of workingEndpoints) {
        try {
          console.log(`[CreditOfficerService] Testing authenticated endpoint: ${endpoint}`);
          
          const response = await apiClient.get(endpoint);
          
          if (response && typeof response === 'object') {
            console.log(`[CreditOfficerService] ✅ SUCCESS: ${endpoint}`);
            console.log(`[CreditOfficerService] Response keys:`, Object.keys(response));
            
            results[endpoint] = response;
            hasAnyData = true;
            
            // Log sample data structure
            if (Array.isArray(response)) {
              console.log(`[CreditOfficerService] Array response with ${response.length} items`);
            } else if (response && typeof response === 'object') {
              const data = response as Record<string, unknown>;
              if (data.data && Array.isArray(data.data)) {
                console.log(`[CreditOfficerService] Wrapped array response with ${data.data.length} items`);
              }
            }
          }
          
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log(`[CreditOfficerService] ❌ Failed: ${endpoint} - ${errorMessage}`);
        }
      }
      
      if (hasAnyData) {
        console.log(`[CreditOfficerService] 🎉 Successfully fetched credit officer specific data!`);
        console.log(`[CreditOfficerService] Working endpoints:`, Object.keys(results));
        
        // Parse the results into our expected format
        const parsedData = await this.parseAuthenticatedEndpointResults(results, creditOfficerId);
        if (parsedData) {
          console.log(`[CreditOfficerService] ✅ Successfully parsed credit officer specific data`);
          return parsedData;
        } else {
          console.log(`[CreditOfficerService] ⚠️ Could not parse data, using fallback approach`);
        }
      } else {
        console.log(`[CreditOfficerService] ❌ No authenticated endpoints returned data`);
      }
      
      return null;
      
    } catch (error) {
      console.error(`[CreditOfficerService] Error testing authenticated credit officer endpoints:`, error);
      return null;
    }
  }

  /**
   * Parse results from authenticated endpoints into CreditOfficerData format
   */
  private async parseAuthenticatedEndpointResults(
    results: Record<string, unknown>, 
    creditOfficerId: string
  ): Promise<CreditOfficerData | null> {
    try {
      // Get the credit officer details first
      const officer = await userService.getUserById(creditOfficerId);
      
      // Extract data from different endpoints
      let officerLoans: Loan[] = [];
      let officerCustomers: User[] = [];
      let loanRepayments: Transaction[] = []; // Changed from officerTransactions to loanRepayments
      let disbursedLoans: Loan[] = []; // New: specifically disbursed loans
      let kpiData: Record<string, unknown> | null = null;
      
      // Parse all loans managed by this credit officer
      const loansEndpoint = Object.keys(results).find(key => key.includes('/loans/all?creditOfficerId='));
      if (loansEndpoint && results[loansEndpoint]) {
        const loansResponse = results[loansEndpoint] as Record<string, unknown>;
        
        if (Array.isArray(loansResponse)) {
          officerLoans = loansResponse as Loan[];
        } else if (loansResponse.data && Array.isArray(loansResponse.data)) {
          officerLoans = loansResponse.data as Loan[];
        }
        
        console.log(`[CreditOfficerService] Parsed ${officerLoans.length} loans managed by credit officer`);
      }
      
      // Parse disbursed loans by this credit officer
      const disbursedEndpoint = Object.keys(results).find(key => key.includes('/loans/disbursed?creditOfficerId='));
      if (disbursedEndpoint && results[disbursedEndpoint]) {
        const disbursedResponse = results[disbursedEndpoint] as Record<string, unknown>;
        
        if (Array.isArray(disbursedResponse)) {
          disbursedLoans = disbursedResponse as Loan[];
        } else if (disbursedResponse.data && Array.isArray(disbursedResponse.data)) {
          disbursedLoans = disbursedResponse.data as Loan[];
        }
        
        console.log(`[CreditOfficerService] Parsed ${disbursedLoans.length} loans disbursed by credit officer`);
      }
      
      // Parse customers data
      const customersEndpoint = Object.keys(results).find(key => key.includes('/admin/users?role=customer&creditOfficerId='));
      if (customersEndpoint && results[customersEndpoint]) {
        const customersResponse = results[customersEndpoint] as Record<string, unknown>;
        
        if (Array.isArray(customersResponse)) {
          officerCustomers = customersResponse as User[];
        } else if (customersResponse.data && Array.isArray(customersResponse.data)) {
          officerCustomers = customersResponse.data as User[];
        }
        
        console.log(`[CreditOfficerService] Parsed ${officerCustomers.length} customers for credit officer`);
      }
      
      // Parse loan repayments/collections data
      const repaymentsEndpoint = Object.keys(results).find(key => key.includes('/loans/recollections?creditOfficerId='));
      if (repaymentsEndpoint && results[repaymentsEndpoint]) {
        const repaymentsResponse = results[repaymentsEndpoint] as Record<string, unknown>;
        
        if (Array.isArray(repaymentsResponse)) {
          loanRepayments = repaymentsResponse as Transaction[];
        } else if (repaymentsResponse.data && Array.isArray(repaymentsResponse.data)) {
          loanRepayments = repaymentsResponse.data as Transaction[];
        }
        
        console.log(`[CreditOfficerService] Parsed ${loanRepayments.length} loan repayments for credit officer`);
      }
      
      // Parse KPI data
      const kpiEndpoint = Object.keys(results).find(key => key.includes('/dashboard/kpi?creditOfficerId='));
      if (kpiEndpoint && results[kpiEndpoint]) {
        kpiData = results[kpiEndpoint] as Record<string, unknown>;
        console.log(`[CreditOfficerService] Parsed KPI data:`, Object.keys(kpiData));
      }
      
      // Calculate statistics from the actual credit officer data
      const activeLoans = officerLoans.filter(loan => loan.status === 'active').length;
      const totalLoanAmount = officerLoans.reduce((sum, loan) => sum + loan.amount, 0);
      const totalCollections = loanRepayments.reduce((sum, repayment) => sum + repayment.amount, 0);
      
      const statistics = {
        totalCustomers: officerCustomers.length,
        activeLoans,
        totalLoansProcessed: officerLoans.length,
        totalLoanAmount,
        totalCollections
      };
      
      console.log(`[CreditOfficerService] 📊 Credit officer specific statistics:`, statistics);
      
      return {
        officer,
        branchCustomers: officerCustomers, // These are actually officer customers, not branch customers
        branchLoans: disbursedLoans, // Use disbursed loans for the "Loans Disbursed" tab
        branchTransactions: loanRepayments, // Use loan repayments for the "Collections" tab
        statistics
      };
      
    } catch (error) {
      console.error(`[CreditOfficerService] Error parsing authenticated endpoint results:`, error);
      return null;
    }
  }

  /**
   * Filter loans by credit officer ID if the loan data contains credit officer information
   */
  private filterLoansByCreditOfficer(loans: Loan[], creditOfficerId: string): Loan[] {
    return loans.filter(loan => {
      // Check various possible fields that might contain credit officer ID
      const loanData = loan as Record<string, unknown>;
      
      return (
        String(loanData.creditOfficerId) === creditOfficerId ||
        String(loanData.credit_officer_id) === creditOfficerId ||
        String(loanData.assignedTo) === creditOfficerId ||
        String(loanData.managedBy) === creditOfficerId ||
        String(loanData.officerId) === creditOfficerId ||
        String(loanData.createdBy) === creditOfficerId ||
        (loanData.createdBy && typeof loanData.createdBy === 'object' && 
         String((loanData.createdBy as Record<string, unknown>).id) === creditOfficerId)
      );
    });
  }

  /**
   * Filter customers based on loans managed by the credit officer
   */
  private filterCustomersByCreditOfficer(customers: User[], officerLoans: Loan[]): User[] {
    const officerCustomerIds = new Set(officerLoans.map(loan => String(loan.customerId)));
    
    return customers.filter(customer => 
      officerCustomerIds.has(String(customer.id))
    );
  }

  async getBranchCustomers(branch: string): Promise<User[]> {
    if (!branch) {
      console.warn('[CreditOfficerService] No branch provided, returning empty array');
      return [];
    }

    try {
      console.log(`[CreditOfficerService] Fetching customers for branch: ${branch}`);
      const branchUsersResponse = await userService.getUsersByBranch(branch);
      const customers = branchUsersResponse.data.filter(user => 
        user.role === 'user' || 
        user.role === 'customer' ||
        user.role === 'client'
      );
      console.log(`[CreditOfficerService] Found ${customers.length} customers in branch ${branch}`);
      return customers;
    } catch (error) {
      console.error(`Failed to fetch customers for branch ${branch}:`, error);
      return [];
    }
  }

  async getBranchLoans(branch: string): Promise<Loan[]> {
    if (!branch) {
      return [];
    }

    try {
      // Get branch customers first
      const branchCustomers = await this.getBranchCustomers(branch);
      const branchCustomerIds = branchCustomers.map(c => String(c.id));

      // Get all loans and filter by branch customers
      const allLoans = await loanService.getAllLoans();
      return allLoans.filter(loan => 
        branchCustomerIds.includes(String(loan.customerId))
      );
    } catch (error) {
      console.error(`Failed to fetch loans for branch ${branch}:`, error);
      return [];
    }
  }
}

// Export singleton instance
export const creditOfficerService = new CreditOfficerAPIService();