/**
 * Credit Officer Service - Optimized for tested endpoints
 * Uses verified API endpoints from permission testing
 */

import { unifiedUserService } from './unifiedUser';
import { userService } from './users';
import { dashboardService } from './dashboard';
import { extractValue } from '@/lib/utils/dataExtraction';
import { formatDate } from '@/lib/utils';
import type { User } from '@/lib/api/types';
import type { StatSection } from '@/app/_components/ui/StatisticsCard';

export interface CreditOfficer {
  id: string;
  name: string;
  idNumber: string;
  status: 'Active' | 'Inactive';
  phone: string;
  email: string;
  dateJoined: string;
}

export interface CreditOfficerData {
  creditOfficers: CreditOfficer[];
  statistics: StatSection[];
}

// Transform User to CreditOfficer format
const transformUserToCreditOfficer = (user: User): CreditOfficer => {
  return {
    id: String(user.id),
    name: `${user.firstName} ${user.lastName}`,
    idNumber: String(user.id).slice(-5),
    status: user.verificationStatus === 'verified' ? 'Active' : 'Inactive',
    phone: user.mobileNumber || 'N/A',
    email: user.email,
    dateJoined: formatDate(user.createdAt) || 'N/A'
  };
};

// Filter users to find credit officers
const filterCreditOfficers = (users: User[]): User[] => {
  return users.filter((user: User) => {
    const role = user.role?.toLowerCase() || '';
    return role === 'credit_officer' ||
           role === 'creditofficer' ||
           role === 'credit officer' ||
           role === 'co' ||
           role.includes('credit');
  });
};

class CreditOfficerService {
  /**
   * Fetch credit officers using tested endpoints
   * Strategy based on successful API testing results
   */
  async getCreditOfficers(searchTerm?: string): Promise<CreditOfficerData> {
    console.log('🔍 [CreditOfficerService] Fetching credit officers with tested endpoints');
    
    let creditOfficers: CreditOfficer[] = [];
    
    try {
      // Strategy 1: Use /admin/users endpoint (tested and working)
      console.log('📋 Strategy 1: Fetching all users via /admin/users');
      const allUsersData = await unifiedUserService.getUsers({ 
        limit: 1000 // Tested limit that works
      });
      
      // Filter for credit officers client-side
      const creditOfficerUsers = filterCreditOfficers(allUsersData.data);
      creditOfficers = creditOfficerUsers.map(transformUserToCreditOfficer);
      
      console.log(`✅ Strategy 1 result: ${creditOfficers.length} credit officers found`);
      
      // Strategy 2: If no results, try /admin/staff/my-staff (fallback)
      if (creditOfficers.length === 0) {
        console.log('📋 Strategy 2: Trying /admin/staff/my-staff as fallback');
        try {
          const staffData = await userService.getMyStaff();
          const staffCreditOfficers = filterCreditOfficers(staffData);
          creditOfficers = [...creditOfficers, ...staffCreditOfficers.map(transformUserToCreditOfficer)];
          console.log(`✅ Strategy 2 result: ${staffCreditOfficers.length} additional credit officers found`);
        } catch (staffError) {
          console.warn('⚠️ Strategy 2 failed:', staffError);
        }
      }
      
      // Remove duplicates based on ID
      creditOfficers = creditOfficers.filter((officer, index, self) => 
        index === self.findIndex(o => o.id === officer.id)
      );
      
      console.log(`🎯 Final result: ${creditOfficers.length} unique credit officers`);
      
    } catch (error) {
      console.error('❌ Error fetching credit officers:', error);
      creditOfficers = [];
    }
    
    // Apply search filter if provided
    if (searchTerm && searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      creditOfficers = creditOfficers.filter(officer =>
        officer.name.toLowerCase().includes(query) ||
        officer.idNumber.includes(query) ||
        officer.email.toLowerCase().includes(query) ||
        officer.phone.includes(query)
      );
    }
    
    // Fetch statistics using tested /dashboard/kpi endpoint
    const statistics = await this.getCreditOfficerStatistics(creditOfficers.length);
    
    return { creditOfficers, statistics };
  }
  
  /**
   * Get credit officer statistics using tested /dashboard/kpi endpoint
   */
  private async getCreditOfficerStatistics(actualCount: number): Promise<StatSection[]> {
    try {
      console.log('📊 Fetching statistics via /dashboard/kpi');
      const dashboardData = await dashboardService.getKPIs();
      
      if (dashboardData && dashboardData.creditOfficers) {
        const creditOfficerData = dashboardData.creditOfficers;
        return [
          {
            label: 'Total Credit Officers',
            value: actualCount, // Use actual count from table data for consistency
            change: extractValue(creditOfficerData.change, 0),
            changeLabel: extractValue(creditOfficerData.changeLabel, 'No change this month'),
            isCurrency: extractValue(creditOfficerData.isCurrency, false),
          },
        ];
      } else {
        // Fallback statistics
        return [
          {
            label: 'Total Credit Officers',
            value: actualCount,
            change: 0,
            changeLabel: 'No change this month',
            isCurrency: false,
          },
        ];
      }
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      return [
        {
          label: 'Total Credit Officers',
          value: actualCount,
          change: 0,
          changeLabel: 'Unable to load statistics',
          isCurrency: false,
        },
      ];
    }
  }
  
  /**
   * Update credit officer using tested PATCH /admin/users/{id} endpoint
   */
  async updateCreditOfficer(id: string, data: Partial<CreditOfficer>): Promise<void> {
    console.log('✏️ [CreditOfficerService] Updating credit officer:', id);
    
    // Transform CreditOfficer data back to User format for API
    const updateData: Record<string, unknown> = {};
    
    if (data.name) {
      const nameParts = data.name.trim().split(' ');
      updateData.firstName = nameParts[0] || '';
      updateData.lastName = nameParts.slice(1).join(' ') || '';
    }
    
    if (data.email) {
      updateData.email = data.email;
    }
    
    if (data.phone && data.phone !== 'N/A') {
      updateData.mobileNumber = data.phone;
    }
    
    console.log('📝 Update data:', updateData);
    
    // Use tested endpoint
    await unifiedUserService.updateUser(id, updateData);
    
    console.log('✅ Credit officer updated successfully');
  }
  
  /**
   * Delete credit officer using tested DELETE /admin/users/{id} endpoint
   */
  async deleteCreditOfficer(id: string): Promise<void> {
    console.log('🗑️ [CreditOfficerService] Deleting credit officer:', id);
    
    // Use tested endpoint
    await unifiedUserService.deleteUser(id);
    
    console.log('✅ Credit officer deleted successfully');
  }
  
  /**
   * Create credit officer using tested POST /admin/staff/create endpoint
   */
  async createCreditOfficer(data: {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    password: string;
    branch: string;
    state: string;
  }): Promise<User> {
    console.log('👤 [CreditOfficerService] Creating credit officer');
    
    const createData = {
      ...data,
      role: 'credit_officer'
    };
    
    console.log('📝 Create data:', createData);
    
    // Use tested endpoint
    const result = await userService.createStaffUser(createData);
    
    console.log('✅ Credit officer created successfully');
    return result;
  }
}

// Export singleton instance
export const creditOfficerService = new CreditOfficerService();