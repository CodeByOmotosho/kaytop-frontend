/**
 * Accurate Dashboard Service
 * Fetches real data from multiple endpoints to provide accurate dashboard KPIs
 * with performance optimizations including caching and request deduplication
 */

import apiClient from '@/lib/apiClient';
import { growthCalculationService } from './growthCalculation';
import { unifiedUserService } from './unifiedUser';
import { performanceMonitor } from '../utils/performanceMonitor';
import type { DashboardKPIs, DashboardParams, StatisticValue } from '../api/types';

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Request deduplication map
const pendingRequests = new Map<string, Promise<unknown>>();

export interface AccurateDashboardService {
  getAccurateKPIs(params?: DashboardParams): Promise<DashboardKPIs>;
  clearCache(): void;
}

class AccurateDashboardAPIService implements AccurateDashboardService {
  // In-memory cache with 5-minute TTL
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    pendingRequests.clear();
  }

  /**
   * Get data from cache or fetch if expired
   */
  private async getCachedData<T>(
    key: string,
    fetchFn: () => Promise<T>,
    customTTL?: number
  ): Promise<T> {
    const requestId = `dashboard-${key}-${Date.now()}`;
    performanceMonitor.startRequest(requestId);
    
    const now = Date.now();
    const cached = this.cache.get(key);
    
    // Return cached data if still valid
    if (cached && now < cached.expiresAt) {
      performanceMonitor.endRequest(requestId, true);
      return cached.data;
    }

    // Check if request is already pending to avoid duplicate calls
    if (pendingRequests.has(key)) {
      const result = await pendingRequests.get(key)!;
      performanceMonitor.endRequest(requestId, false);
      return result;
    }

    // Create new request
    const requestPromise = fetchFn();
    pendingRequests.set(key, requestPromise);

    try {
      const data = await requestPromise;
      
      // Cache the result
      const ttl = customTTL || this.CACHE_TTL;
      this.cache.set(key, {
        data,
        timestamp: now,
        expiresAt: now + ttl
      });
      
      performanceMonitor.endRequest(requestId, false);
      return data;
    } finally {
      // Remove from pending requests
      pendingRequests.delete(key);
    }
  }

  /**
   * Generate cache key from parameters
   */
  private getCacheKey(prefix: string, params?: DashboardParams): string {
    if (!params) return prefix;
    
    const paramStr = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return `${prefix}:${paramStr}`;
  }
  
  /**
   * Get accurate KPIs by fetching from multiple endpoints with caching
   */
  async getAccurateKPIs(params?: DashboardParams): Promise<DashboardKPIs> {
    try {
      
      // Use cached data with request deduplication
      const cacheKey = this.getCacheKey('accurate-kpis', params);
      
      return await this.getCachedData(cacheKey, async () => {
        
        // Fetch data from multiple endpoints in parallel with individual caching
        const [
          kpiResponse,
          usersResponse,
          branchesResponse,
          loansResponse
        ] = await Promise.all([
          this.getCachedData('kpi-data', () => this.fetchKPIData(params)),
          this.getCachedData('users-data', () => this.fetchUsersData()),
          this.getCachedData('branches-data', () => this.fetchBranchesData()),
          this.getCachedData('loans-data', () => this.fetchLoansData(params))
        ]);

        // Calculate accurate statistics
        const accurateStats = await this.calculateAccurateStatistics(
          kpiResponse,
          usersResponse,
          branchesResponse,
          loansResponse,
          params
        );

        return accurateStats;
      });

    } catch (error) {
      console.error('❌ Accurate dashboard fetch error:', error);
      throw error;
    }
  }

  /**
   * Fetch KPI data from backend
   */
  private async fetchKPIData(params?: DashboardParams): Promise<Record<string, unknown>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.timeFilter) queryParams.append('timeFilter', params.timeFilter);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.branch) queryParams.append('branch', params.branch);

      const endpoint = `/dashboard/kpi${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log(`🔍 Fetching KPI data from ${endpoint}...`);
      
      const response = await apiClient.get<unknown>(endpoint);
      const kpiData = (response.data as Record<string, unknown>) || {};
      
      // Log what the KPI endpoint provides
      console.log('📊 KPI endpoint response fields:', Object.keys(kpiData));
      console.log('📊 KPI data sample:', {
        totalBranches: kpiData.totalBranches,
        totalCreditOfficers: kpiData.totalCreditOfficers,
        totalCustomers: kpiData.totalCustomers,
        totalUsers: kpiData.totalUsers,
        totalLoans: kpiData.totalLoans,
        activeLoans: kpiData.activeLoans
      });
      
      return kpiData;
    } catch (error) {
      console.error('❌ KPI data fetch error:', error);
      return {};
    }
  }

  /**
   * Fetch users data - uses the same approach as the customers page
   * Fetches from staff endpoint + branch endpoints to get complete user list
   */
  private async fetchUsersData(): Promise<Record<string, unknown>[]> {
    try {
      console.log('🔄 Fetching users using enhanced approach (staff + branches)...');
      
      const allUsers: Record<string, unknown>[] = [];
      const processedIds = new Set<string>();
      
      // 1. Fetch staff members (has proper role field)
      let staffUsers: Record<string, unknown>[] = [];
      try {
        console.log('📋 Fetching staff from /admin/staff/my-staff...');
        const staffResponse = await apiClient.get<unknown>('/admin/staff/my-staff');
        const staffData = staffResponse.data || staffResponse;
        
        if (Array.isArray(staffData)) {
          staffUsers = staffData as Record<string, unknown>[];
          staffData.forEach((user: Record<string, unknown>) => {
            const userId = user.id as string;
            if (userId && !processedIds.has(userId)) {
              allUsers.push(user);
              processedIds.add(userId);
            }
          });
          console.log(`✅ Got ${staffData.length} staff members with roles`);
          
          // Log staff by role for debugging
          const staffByRole: Record<string, number> = {};
          staffData.forEach((user: Record<string, unknown>) => {
            const role = (user.role as string) || 'undefined';
            staffByRole[role] = (staffByRole[role] || 0) + 1;
          });
          console.log('📊 Staff from /admin/staff/my-staff:', staffByRole);
        }
      } catch (error) {
        console.error('⚠️ Failed to fetch staff:', error);
      }
      
      // 2. Fetch users from branches (includes customers)
      let branchUsersCount = 0;
      let branchCreditOfficersCount = 0;
      let branchCustomersCount = 0;
      
      try {
        console.log('🏢 Fetching branch names...');
        const branchesResponse = await apiClient.get<string[]>('/users/branches');
        const branches = Array.isArray(branchesResponse.data) ? branchesResponse.data : [];
        
        console.log(`🏢 Found ${branches.length} branches, fetching users from each...`);
        
        for (const branch of branches) {
          try {
            const branchUsersResponse = await apiClient.get<unknown>(`/admin/users/branch/${branch}`);
            
            let branchUsers: Record<string, unknown>[] = [];
            
            // Handle different response formats
            if (branchUsersResponse.data && typeof branchUsersResponse.data === 'object') {
              const responseData = branchUsersResponse.data as Record<string, unknown>;
              
              if (Array.isArray(responseData.users)) {
                branchUsers = responseData.users as Record<string, unknown>[];
              } else if (Array.isArray(branchUsersResponse.data)) {
                branchUsers = branchUsersResponse.data as Record<string, unknown>[];
              }
            } else if (Array.isArray(branchUsersResponse)) {
              branchUsers = branchUsersResponse as Record<string, unknown>[];
            }
            
            // Add users that haven't been processed yet
            let newUsersCount = 0;
            let newCreditOfficers = 0;
            let newCustomers = 0;
            
            branchUsers.forEach((user: Record<string, unknown>) => {
              const userId = user.id as string;
              const userRole = (user.role as string) || '';
              
              if (userId && !processedIds.has(userId)) {
                allUsers.push(user);
                processedIds.add(userId);
                newUsersCount++;
                
                // Count by role
                if (userRole.toLowerCase().includes('credit')) {
                  newCreditOfficers++;
                } else if (userRole === 'user' || userRole === 'customer' || userRole === 'client') {
                  newCustomers++;
                }
              }
            });
            
            branchUsersCount += newUsersCount;
            branchCreditOfficersCount += newCreditOfficers;
            branchCustomersCount += newCustomers;
            
            if (newUsersCount > 0) {
              console.log(`  ✅ ${branch}: Added ${newUsersCount} new users (${newCreditOfficers} COs, ${newCustomers} customers)`);
            }
            
          } catch (error) {
            console.warn(`  ⚠️ Failed to fetch users from ${branch}:`, error);
          }
        }
        
        console.log(`📊 Branch endpoints summary: ${branchUsersCount} new users (${branchCreditOfficersCount} COs, ${branchCustomersCount} customers)`);
        
      } catch (error) {
        console.error('⚠️ Failed to fetch branches:', error);
      }
      
      console.log(`📊 Total unique users fetched: ${allUsers.length}`);
      
      // Log role distribution for debugging
      const roleDistribution: Record<string, number> = {};
      allUsers.forEach(user => {
        const role = (user.role as string) || 'undefined';
        roleDistribution[role] = (roleDistribution[role] || 0) + 1;
      });
      console.log('🎭 Dashboard users role distribution:', roleDistribution);
      
      // Critical check: Compare staff COs vs total COs
      const staffCOs = staffUsers.filter(u => {
        const role = (u.role as string)?.toLowerCase() || '';
        return role.includes('credit');
      }).length;
      
      const totalCOs = allUsers.filter(u => {
        const role = (u.role as string)?.toLowerCase() || '';
        return role.includes('credit');
      }).length;
      
      if (staffCOs !== totalCOs) {
        console.warn(`⚠️ DISCREPANCY DETECTED:`);
        console.warn(`   - /admin/staff/my-staff has ${staffCOs} credit officers`);
        console.warn(`   - After adding branch users, we have ${totalCOs} credit officers`);
        console.warn(`   - Missing: ${staffCOs - totalCOs} credit officers from branch endpoints`);
        
        // Find which COs are missing
        const staffCOIds = new Set(
          staffUsers
            .filter(u => (u.role as string)?.toLowerCase().includes('credit'))
            .map(u => u.id as string)
        );
        
        const allCOIds = new Set(
          allUsers
            .filter(u => (u.role as string)?.toLowerCase().includes('credit'))
            .map(u => u.id as string)
        );
        
        const missingCOIds = [...staffCOIds].filter(id => !allCOIds.has(id));
        
        if (missingCOIds.length > 0) {
          console.warn(`   - Missing CO IDs: ${missingCOIds.join(', ')}`);
          const missingCOs = staffUsers.filter(u => missingCOIds.includes(u.id as string));
          console.warn(`   - Missing COs details:`, missingCOs.map(u => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            branch: u.branch,
            email: u.email
          })));
        }
      }
      
      // Show sample of each role type
      Object.keys(roleDistribution).forEach(role => {
        const sampleUser = allUsers.find(u => u.role === role);
        if (sampleUser) {
          console.log(`👤 Sample ${role}:`, {
            id: sampleUser.id,
            name: `${sampleUser.firstName} ${sampleUser.lastName}`,
            email: sampleUser.email,
            branch: sampleUser.branch
          });
        }
      });
      
      return allUsers;
    } catch (error) {
      console.error('❌ Users data fetch error:', error);
      return [];
    }
  }

  /**
   * Fetch branches data to get accurate branch count
   */
  private async fetchBranchesData(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/users/branches');
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Branches data fetch error:', error);
      return [];
    }
  }

  /**
   * Fetch loans data with pagination for better performance
   */
  private async fetchLoansData(params?: DashboardParams): Promise<Record<string, unknown>[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.timeFilter) queryParams.append('timeFilter', params.timeFilter);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.branch) queryParams.append('branch', params.branch);
      
      // Use reasonable limit instead of 1000 for better performance
      queryParams.append('limit', '500');
      
      const endpoint = `/loans/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<unknown>(endpoint);
      
      let loansArray: Record<string, unknown>[] = [];
      
      if (response.data && Array.isArray((response.data as any).data)) {
        loansArray = (response.data as any).data as Record<string, unknown>[];
        console.log(`✅ Extracted ${loansArray.length} loans from response.data.data`);
      } else if (Array.isArray(response.data)) {
        loansArray = response.data as Record<string, unknown>[];
        console.log(`✅ Extracted ${loansArray.length} loans from response.data`);
      } else if (Array.isArray(response)) {
        loansArray = response as Record<string, unknown>[];
        console.log(`✅ Extracted ${loansArray.length} loans from response`);
      } else {
        console.warn('⚠️ Unexpected loans response structure:', response);
      }
      
      return loansArray;
    } catch (error) {
      console.error('❌ Loans data fetch error:', error);
      return [];
    }
  }

  /**
   * Calculate accurate statistics from fetched data
   * Prefers KPI endpoint data when available, falls back to calculated values
   */
  private async calculateAccurateStatistics(
    kpiData: Record<string, unknown>,
    usersData: Record<string, unknown>[],
    branchesData: string[],
    loansData: Record<string, unknown>[],
    params?: DashboardParams
  ): Promise<DashboardKPIs> {
    
    console.log('📊 Calculating dashboard statistics...');
    console.log(`📊 KPI endpoint provides: ${Object.keys(kpiData).length} fields`);
    console.log(`📊 Users data: ${usersData.length} users`);
    console.log(`📊 Branches data: ${branchesData.length} branches`);
    console.log(`📊 Loans data: ${loansData.length} loans`);
    
    // Check if KPI endpoint provides the counts we need
    const hasKPIBranches = kpiData.totalBranches !== undefined && kpiData.totalBranches !== null;
    const hasKPICreditOfficers = kpiData.totalCreditOfficers !== undefined && kpiData.totalCreditOfficers !== null;
    const hasKPICustomers = kpiData.totalCustomers !== undefined && kpiData.totalCustomers !== null;
    const hasKPILoans = kpiData.totalLoans !== undefined && kpiData.totalLoans !== null;
    
    console.log('🔍 KPI endpoint data availability:');
    console.log(`  - Branches: ${hasKPIBranches ? '✅ Available' : '❌ Missing'} (${kpiData.totalBranches})`);
    console.log(`  - Credit Officers: ${hasKPICreditOfficers ? '✅ Available' : '❌ Missing'} (${kpiData.totalCreditOfficers})`);
    console.log(`  - Customers: ${hasKPICustomers ? '✅ Available' : '❌ Missing'} (${kpiData.totalCustomers})`);
    console.log(`  - Loans: ${hasKPILoans ? '✅ Available' : '❌ Missing'} (${kpiData.totalLoans})`);
    
    // Calculate from user data as fallback
    const creditOfficers = usersData.filter(user => {
      const userRole = (user.role as string)?.toLowerCase() || '';
      return userRole === 'credit_officer' || 
             userRole === 'creditofficer' || 
             userRole === 'credit officer' ||
             userRole === 'co' ||
             userRole.includes('credit');
    });
    
    const customers = usersData.filter(user => {
      return (user.role as string) === 'user' || 
             (user.role as string) === 'customer' ||
             (user.role as string) === 'client';
    });
    
    console.log(`👥 Calculated from user data: ${customers.length} customers, ${creditOfficers.length} credit officers`);
    
    // Use KPI endpoint data if available, otherwise use calculated values
    const finalBranchCount = hasKPIBranches ? (kpiData.totalBranches as number) : branchesData.length;
    const finalCreditOfficerCount = hasKPICreditOfficers ? (kpiData.totalCreditOfficers as number) : creditOfficers.length;
    const finalCustomerCount = hasKPICustomers ? (kpiData.totalCustomers as number) : customers.length;
    const finalLoanCount = hasKPILoans ? (kpiData.totalLoans as number) : loansData.length;
    
    console.log('✅ Final counts (KPI endpoint preferred):');
    console.log(`  - Branches: ${finalBranchCount} ${hasKPIBranches ? '(from KPI)' : '(calculated)'}`);
    console.log(`  - Credit Officers: ${finalCreditOfficerCount} ${hasKPICreditOfficers ? '(from KPI)' : '(calculated)'}`);
    console.log(`  - Customers: ${finalCustomerCount} ${hasKPICustomers ? '(from KPI)' : '(calculated)'}`);
    console.log(`  - Loans: ${finalLoanCount} ${hasKPILoans ? '(from KPI)' : '(calculated)'}`);
    
    const activeLoans = loansData.filter(loan => 
      (loan.status as string) === 'active' || (loan.status as string) === 'disbursed'
    );
    
    const totalLoanAmount = loansData.reduce((sum, loan) => {
      const amount = typeof loan.amount === 'string' 
        ? parseFloat((loan.amount as string).replace(/[^0-9.-]/g, '')) 
        : ((loan.amount as number) || 0);
      
      if (isNaN(amount)) {
        console.warn('⚠️ Invalid loan amount:', loan.amount, 'for loan:', loan.id);
        return sum;
      }
      
      return sum + amount;
    }, 0);
    
    const missedPayments = loansData.filter(loan => 
      (loan.status as string) === 'defaulted' || (loan.status as string) === 'overdue'
    );

    // Calculate real growth rates by comparing with previous period
    // Use final counts (KPI endpoint preferred, calculated as fallback)
    const currentMetrics = {
      branches: finalBranchCount,
      creditOfficers: finalCreditOfficerCount,
      customers: finalCustomerCount,
      loansProcessed: finalLoanCount,
      loanAmounts: totalLoanAmount,
      activeLoans: activeLoans.length,
      missedPayments: missedPayments.length
    };

    // Get real growth calculations
    const growthData = await growthCalculationService.calculateGrowthForAllMetrics(currentMetrics, params);

    // Helper function to get growth rate with backend fallback
    const getGrowthRate = (field: string, calculatedGrowth: number): number => {
      // Try to get growth from backend first
      if (kpiData[`${field}Growth`] !== undefined && kpiData[`${field}Growth`] !== null) {
        return kpiData[`${field}Growth`] as number;
      }
      
      // Use calculated growth if backend doesn't provide it
      return calculatedGrowth;
    };

    return {
      branches: this.createStatisticValue(
        finalBranchCount,
        getGrowthRate('branches', growthData.branchesGrowth),
        false
      ),
      
      creditOfficers: this.createStatisticValue(
        finalCreditOfficerCount,
        getGrowthRate('creditOfficers', growthData.creditOfficersGrowth),
        false
      ),
      
      customers: this.createStatisticValue(
        finalCustomerCount,
        getGrowthRate('customers', growthData.customersGrowth),
        false
      ),
      
      loansProcessed: this.createStatisticValue(
        finalLoanCount,
        getGrowthRate('loansProcessed', growthData.loansProcessedGrowth),
        false
      ),
      
      loanAmounts: this.createStatisticValue(
        totalLoanAmount,
        getGrowthRate('loanAmounts', growthData.loanAmountsGrowth),
        true // isCurrency
      ),
      
      activeLoans: this.createStatisticValue(
        activeLoans.length,
        getGrowthRate('activeLoans', growthData.activeLoansGrowth),
        false
      ),
      
      missedPayments: this.createStatisticValue(
        missedPayments.length,
        getGrowthRate('missedPayments', growthData.missedPaymentsGrowth),
        false
      ),
      
      // Keep the calculated branch performance from the existing service
      bestPerformingBranches: this.transformBranchPerformance(
        (kpiData.topPerformers as unknown[]) || (kpiData.officerPerformance as unknown[]) || []
      ),
      
      worstPerformingBranches: this.transformBranchPerformance(
        ((kpiData.topPerformers as unknown[]) || (kpiData.officerPerformance as unknown[]) || []).slice().reverse().slice(0, 3)
      ),
      
      // Report statistics KPIs (using mock data since backend doesn't provide these yet)
      totalReports: this.createStatisticValue(
        (kpiData.totalReports as number) || 0,
        getGrowthRate('totalReports', (growthData.totalReportsGrowth as number) || 0),
        false
      ),
      pendingReports: this.createStatisticValue(
        (kpiData.pendingReports as number) || 0,
        getGrowthRate('pendingReports', (growthData.pendingReportsGrowth as number) || 0),
        false
      ),
      approvedReports: this.createStatisticValue(
        (kpiData.approvedReports as number) || 0,
        getGrowthRate('approvedReports', (growthData.approvedReportsGrowth as number) || 0),
        false
      ),
      missedReports: this.createStatisticValue(
        (kpiData.missedReports as number) || 0,
        getGrowthRate('missedReports', (growthData.missedReportsGrowth as number) || 0),
        false
      ),
    };
  }

  /**
   * Create a StatisticValue object
   */
  private createStatisticValue(
    value: number,
    change: number,
    isCurrency: boolean = false
  ): StatisticValue {
    // Generate change label
    let changeLabel = '';
    if (change > 0) {
      changeLabel = `+${change.toFixed(2)}% this month`;
    } else if (change < 0) {
      changeLabel = `${change.toFixed(2)}% this month`;
    } else {
      changeLabel = '+0% this month';
    }

    return {
      value,
      change,
      changeLabel,
      isCurrency,
    };
  }

  /**
   * Transform branch performance data
   */
  private transformBranchPerformance(branches: unknown[]): unknown[] {
    if (!Array.isArray(branches)) {
      return [];
    }

    return branches.map(branch => {
      const branchObj = branch as Record<string, unknown>;
      return {
        name: (branchObj.name as string) || (branchObj.branchName as string) || 'Unknown Branch',
        activeLoans: (branchObj.activeLoans as number) || (branchObj.loans as number) || 0,
        amount: (branchObj.amount as number) || (branchObj.totalAmount as number) || (branchObj.loanAmount as number) || 0,
      };
    });
  }
}

export const accurateDashboardService = new AccurateDashboardAPIService();
